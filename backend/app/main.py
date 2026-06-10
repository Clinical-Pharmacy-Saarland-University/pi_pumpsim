"""FastAPI app: the "torso twin" — level commands (REST) + live level state
(WebSocket). The game logic lives in the frontend; the backend just owns the
authoritative level + pump. Serves the built Svelte UI in production.

Run (dev):  python -m uvicorn app.main:app --reload --port 8000
"""
from __future__ import annotations

import subprocess
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
    return {"overlay": _overlay_state()}


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
