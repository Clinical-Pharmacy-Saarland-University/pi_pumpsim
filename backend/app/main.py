"""FastAPI app: the "torso twin" — level commands (REST) + live level state
(WebSocket). The game logic lives in the frontend; the backend just owns the
authoritative level + pump. Serves the built Svelte UI in production.

Run (dev):  python -m uvicorn app.main:app --reload --port 8000
"""
from __future__ import annotations

import math
import subprocess
import time
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .config import settings
from .game.calibration import load_calibration, save_calibration
from .game.runner import LevelRunner
from .hardware.factory import create_pump
from .version import APP_VERSION

runner: LevelRunner | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global runner
    pump = create_pump(settings)
    runner = LevelRunner(
        pump,
        settings.tick_hz,
        backend=settings.pump_backend,
        version=APP_VERSION,
        calibration=load_calibration(),
    )
    await runner.start()
    print(f"[pumpsim] torso-twin up  |  v{APP_VERSION}  |  PUMP_BACKEND={settings.pump_backend}")
    try:
        yield
    finally:
        await runner.shutdown()


app = FastAPI(title="pi_pumpsim — SafePolyMed", version=APP_VERSION, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


def _runner() -> LevelRunner:
    assert runner is not None, "runner not initialised"
    return runner


class TargetRequest(BaseModel):
    level: float = Field(ge=0, le=100)
    rate: float | None = Field(default=None, gt=0)


class PumpRequest(BaseModel):
    dir: str = Field(pattern="^(in|out|stop)$")
    speed: float = Field(default=1.0, ge=0, le=1)


class SpeedRequest(BaseModel):
    speed: float = Field(ge=0, le=1)


class RunRequest(PumpRequest):
    seconds: float = Field(gt=0, le=120)


class ManualRequest(BaseModel):
    on: bool


class CalibSample(BaseModel):
    dir: str = Field(pattern="^(in|out)$")
    duty: float = Field(ge=0, le=1)
    ml_per_s: float = Field(ge=0)


class CalibrationModel(BaseModel):
    deadband_in: float | None = Field(default=None, ge=0, le=1)
    deadband_out: float | None = Field(default=None, ge=0, le=1)
    rate_in: float | None = Field(default=None, ge=0)
    rate_out: float | None = Field(default=None, ge=0)
    torso_volume_ml: float | None = Field(default=None, gt=0)
    dead_space_ml: float | None = Field(default=None, ge=0)
    empty_overpump_s: float | None = Field(default=None, gt=0, le=600)
    prime_in_ml: float | None = Field(default=None, ge=0)
    samples: list[CalibSample] = Field(default_factory=list)


class EmptyRequest(BaseModel):
    seconds: float | None = Field(default=None, gt=0, le=600)


@app.get("/api/state")
def get_state() -> dict:
    return _runner().snapshot()


@app.post("/api/level/target")
def set_target(req: TargetRequest) -> dict:
    _runner().set_target(req.level, req.rate)
    return {"ok": True}


@app.post("/api/level/reset")
def reset_level() -> dict:
    _runner().reset()
    return {"ok": True}


def _prepare_plan() -> dict:
    """Compute the re-home plan: how long to overpump empty and to prime back to
    baseline. Durations are DERIVED from torso volume ÷ flow rates (empty gets a
    1.3× safety margin so it overpumps past empty); a stored empty_overpump_s /
    prime_in_ml in the calibration acts as a manual override."""
    cal = load_calibration()
    r = _runner()
    vol = float(r.volume_ml or 0.0)
    rate_out = float(r.rate_out_ml_s or 0.0)
    rate_in = float(r.rate_in_ml_s or 0.0)
    dead = float(cal.get("dead_space_ml") or 0.0)
    cap = float(r.ctrl.cfg.capacity or 100.0)
    baseline = float(r.ctrl.cfg.baseline or 0.0)

    if cal.get("empty_overpump_s"):
        empty_s, empty_src = float(cal["empty_overpump_s"]), "override"
    elif rate_out > 0 and vol > 0:
        empty_s, empty_src = vol / rate_out * 1.3, "derived"
    else:
        empty_s, empty_src = 90.0, "fallback"

    if cal.get("prime_in_ml"):
        prime_ml, prime_src = float(cal["prime_in_ml"]), "override"
    else:
        prime_ml, prime_src = (baseline / cap * vol if cap else 0.0), "derived"
    prime_s = (prime_ml + dead) / rate_in if rate_in > 0 else 0.0
    # seconds to re-prime just the tube dead-space (Home runs this after the overpump
    # so the line is full to the torso entry — keeps goto/prepare fills accurate)
    tube_prime_s = dead / rate_in if rate_in > 0 else 0.0

    return {
        "empty_s": round(empty_s, 1),
        "empty_src": empty_src,
        "prime_ml": round(prime_ml, 1),
        "prime_s": round(prime_s, 1),
        "prime_src": prime_src,
        "tube_prime_s": round(tube_prime_s, 1),
        "dead_space_ml": round(dead, 1),
        "baseline": baseline,
        "volume_ml": round(vol, 1),
        "rate_in": round(rate_in, 1),
        "rate_out": round(rate_out, 1),
        "backend": settings.pump_backend,
    }


@app.get("/api/level/prepare_plan")
def get_prepare_plan() -> dict:
    return _prepare_plan()


@app.post("/api/level/prepare")
def prepare_torso() -> dict:
    """Re-home the torso to a known start (overpump empty → prime to baseline →
    snap the twin). First-boot prep, between-runs prep, and admin recovery all use
    this single routine. Mock just settles the twin at baseline."""
    plan = _prepare_plan()
    _runner().prepare(plan["empty_s"], plan["prime_s"])
    return {"ok": True, **plan}


@app.post("/api/level/prime")
def prime_torso() -> dict:
    """Prime-only init: assume the torso was emptied BY HAND, skip the overpump-empty
    step, and just prime to baseline + anchor the twin. The no-drain variant of
    /prepare for when the operator drains the torso manually. Mock settles the twin
    at baseline."""
    plan = _prepare_plan()
    _runner().prime_to_baseline(plan["prime_s"])
    return {"ok": True, **plan}


class GotoRequest(BaseModel):
    level: float = Field(ge=0, le=100)


@app.post("/api/level/home")
def home_torso() -> dict:
    """Overpump empty, re-prime the tube, and anchor the twin at level 0 — the
    physical 'home' for the marking workflow. Priming the line means the marks (and
    a manual game-prep) aren't short by the empty-tube volume."""
    plan = _prepare_plan()
    _runner().home_empty(plan["empty_s"], plan["tube_prime_s"])
    return {"ok": True, "empty_s": plan["empty_s"], "tube_prime_s": plan["tube_prime_s"]}


@app.post("/api/level/goto")
def level_goto(req: GotoRequest) -> dict:
    """Drive the torso to an exact level (to tape the band/critical marks). Requires
    a homed twin to be accurate — the admin gates this behind Home."""
    _runner().goto_level(req.level)
    return {"ok": True, "level": req.level}


# --- DEV: physics sim (mock only) — practise the init/home flow against water ---
class SimStartRequest(BaseModel):
    fill: float = Field(ge=0, le=100)


@app.post("/api/dev/simulate_start")
def dev_simulate_start(req: SimStartRequest) -> dict:
    """Pretend the system powered on with `fill`% of UNKNOWN water already in the
    torso, and re-boot the belief. Then Home/Initialize physically pump it out/in so
    you can watch the whole init on the virtual torso. No-op on real hardware."""
    _runner().simulate_start(req.fill)
    return {"ok": True, "fill": req.fill}


@app.post("/api/dev/clear_sim")
def dev_clear_sim() -> dict:
    _runner().clear_sim()
    return {"ok": True}


# --- admin: direct pump control (manual jog + calibration) -----------------
@app.post("/api/admin/manual")
def admin_manual(req: ManualRequest) -> dict:
    _runner().set_manual(req.on)
    return {"ok": True}


@app.post("/api/admin/pump")
def admin_pump(req: PumpRequest) -> dict:
    _runner().manual_drive(req.dir, req.speed)
    return {"ok": True}


@app.post("/api/admin/run")
def admin_run(req: RunRequest) -> dict:
    _runner().manual_run(req.dir, req.speed, req.seconds)
    return {"ok": True}


@app.post("/api/admin/speed")
def admin_speed(req: SpeedRequest) -> dict:
    """Live-adjust the pump speed of a running manual/timed job (no timer reset)."""
    _runner().manual_set_speed(req.speed)
    return {"ok": True}


@app.post("/api/admin/stop")
def admin_stop() -> dict:
    _runner().manual_stop()
    return {"ok": True}


@app.post("/api/admin/reset")
def admin_reset() -> dict:
    _runner().reset()
    return {"ok": True}


@app.get("/api/admin/calibration")
def get_calibration() -> dict:
    return load_calibration()


@app.post("/api/admin/calibration")
def post_calibration(c: CalibrationModel) -> dict:
    # merge: only overwrite the fields the client actually sent, so the wizard
    # (deadbands/rates/samples) and the admin (reset params) don't clobber each other
    data = load_calibration()
    data.update(c.model_dump(exclude_unset=True))
    save_calibration(data)
    _runner().apply_calibration(data)  # rates + torso volume take effect live
    return {"ok": True}


@app.post("/api/admin/empty")
def admin_empty(req: EmptyRequest) -> dict:
    """Overpump OUT to guarantee an empty torso (pulls air at the end — fine for a
    peristaltic pump). Duration: request override, else calibration, else 90 s."""
    cal = load_calibration()
    seconds = float(req.seconds or cal.get("empty_overpump_s") or 90.0)
    _runner().run_sequence([{"dir": "out", "speed": 1.0, "seconds": seconds}])
    return {"ok": True}


@app.post("/api/admin/calibrated_reset")
def admin_calibrated_reset() -> dict:
    """Home-then-dose: overpump empty, then pump IN a known volume (+ tube dead-space)
    so the torso starts each game at a calibrated level."""
    cal = load_calibration()
    empty_s = float(cal.get("empty_overpump_s") or 90.0)
    rate_in = float(cal.get("rate_in") or 0.0)
    prime_ml = float(cal.get("prime_in_ml") or 0.0)
    dead = float(cal.get("dead_space_ml") or 0.0)
    steps: list[dict] = [{"dir": "out", "speed": 1.0, "seconds": empty_s}]
    if rate_in > 0 and prime_ml > 0:
        steps.append({"dir": "in", "speed": 1.0, "seconds": (prime_ml + dead) / rate_in})
    _runner().run_sequence(steps)
    return {"ok": True}


# --- system: read-only-overlay status + clean power control (kiosk) ---------
def _overlay_state() -> str:
    """'on' if the read-only overlay (power-cut protection) is active, 'off' if the
    root fs is writable, 'unknown' off-Pi. Reads the running kernel cmdline — no
    privilege needed."""
    try:
        cmdline = Path("/proc/cmdline").read_text()
    except OSError:
        return "unknown"
    return "on" if "boot=overlay" in cmdline else "off"


def _read_temp_c() -> float | None:
    """SoC temperature in °C from the thermal sysfs (no privilege). None off-Pi."""
    try:
        milli = Path("/sys/class/thermal/thermal_zone0/temp").read_text().strip()
        return round(int(milli) / 1000.0, 1)
    except (OSError, ValueError):
        return None


def _read_throttled() -> int | None:
    """`vcgencmd get_throttled` -> raw bitmask (int). None if vcgencmd is absent
    (off-Pi) or the user can't reach /dev/vcio (not in the `video` group)."""
    try:
        out = subprocess.run(
            ["vcgencmd", "get_throttled"], capture_output=True, text=True, timeout=2
        )
        # stdout looks like "throttled=0x50005"
        return int(out.stdout.strip().split("=", 1)[1], 16)
    except (OSError, ValueError, IndexError, subprocess.SubprocessError):
        return None


def _throttle_flags(v: int | None) -> dict:
    """Decode the vcgencmd throttle bitmask into named booleans (None if unknown).
    Bits 0-3 = happening now; bits 16-19 = has happened since boot."""
    keys = (
        "under_voltage_now", "freq_capped_now", "throttled_now", "soft_temp_now",
        "under_voltage_ever", "freq_capped_ever", "throttled_ever", "soft_temp_ever",
    )
    if v is None:
        return {k: None for k in keys}
    bits = (0x1, 0x2, 0x4, 0x8, 0x10000, 0x20000, 0x40000, 0x80000)
    return {k: bool(v & b) for k, b in zip(keys, bits)}


def _power(action: str) -> None:
    """Stop the pump, then ask systemd to poweroff/reboot. Fire-and-forget so the
    HTTP response still returns before the system goes down. Relies on the sudoers
    drop-in (deploy/pumpsim-power.sudoers) granting NOPASSWD systemctl poweroff/reboot."""
    try:
        _runner().manual_stop()
    except Exception:
        pass
    try:
        subprocess.Popen(["sudo", "-n", "/usr/bin/systemctl", action])
    except OSError:
        pass  # off-Pi / no sudo — nothing to power down


@app.get("/api/admin/system")
def admin_system() -> dict:
    """Kiosk health for the admin badges: read-only-overlay lock, SoC temperature
    and the throttle/under-voltage flags. Off a Pi (e.g. the dev PC) we synthesise
    plausible values so the admin panel is fully testable without hardware."""
    overlay = _overlay_state()
    temp = _read_temp_c()
    on_pi = temp is not None or overlay == "on"
    throttled = _read_throttled() if on_pi or settings.pump_backend == "real" else None
    simulated = False
    if temp is None and throttled is None and settings.pump_backend != "real":
        # dev PC: gently oscillate the temp so the badge looks live; no throttling
        temp = round(46.0 + 4.0 * math.sin(time.monotonic() / 25.0), 1)
        throttled = 0
        simulated = True
    return {
        "overlay": overlay,
        "pi": on_pi,
        "simulated": simulated,
        "temp_c": temp,
        "throttled": None if throttled is None else f"0x{throttled:x}",
        **_throttle_flags(throttled),
    }


@app.post("/api/admin/shutdown")
def admin_shutdown() -> dict:
    _power("poweroff")
    return {"ok": True}


@app.post("/api/admin/reboot")
def admin_reboot() -> dict:
    _power("reboot")
    return {"ok": True}


@app.websocket("/ws")
async def ws(websocket: WebSocket) -> None:
    await websocket.accept()
    r = _runner()
    q = r.subscribe()
    try:
        await websocket.send_json(r.snapshot())
        while True:
            await websocket.send_json(await q.get())
    except WebSocketDisconnect:
        pass
    finally:
        r.unsubscribe(q)


# Serve the built frontend if present (production / Pi). Absent in dev (Vite serves it).
_dist = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if _dist.is_dir():
    app.mount("/", StaticFiles(directory=str(_dist), html=True), name="static")
