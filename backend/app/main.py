"""FastAPI app: the "torso twin" — level commands (REST) + live level state
(WebSocket). The game logic lives in the frontend; the backend just owns the
authoritative level + pump. Serves the built Svelte UI in production.

Run (dev):  python -m uvicorn app.main:app --reload --port 8000
"""
from __future__ import annotations

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

runner: LevelRunner | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global runner
    pump = create_pump(settings)
    runner = LevelRunner(pump, settings.tick_hz, backend=settings.pump_backend)
    await runner.start()
    calib = load_calibration()
    if calib.get("rate_in"):
        runner.set_rate(calib["rate_in"])  # apply stored calibration
    print(f"[pumpsim] torso-twin up  |  PUMP_BACKEND={settings.pump_backend}")
    try:
        yield
    finally:
        await runner.shutdown()


app = FastAPI(title="pi_pumpsim — SafePolyMed", lifespan=lifespan)
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


class RateRequest(BaseModel):
    rate_ml_s: float = Field(gt=0)


class CalibSample(BaseModel):
    dir: str = Field(pattern="^(in|out)$")
    duty: float = Field(ge=0, le=1)
    ml_per_s: float = Field(ge=0)


class CalibrationModel(BaseModel):
    deadband_in: float | None = Field(default=None, ge=0, le=1)
    deadband_out: float | None = Field(default=None, ge=0, le=1)
    rate_in: float | None = Field(default=None, ge=0)
    rate_out: float | None = Field(default=None, ge=0)
    samples: list[CalibSample] = Field(default_factory=list)


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


@app.post("/api/admin/rate")
def admin_rate(req: RateRequest) -> dict:
    _runner().set_rate(req.rate_ml_s)
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
    data = c.model_dump()
    save_calibration(data)
    if c.rate_in:
        _runner().set_rate(c.rate_in)  # apply the fill rate live
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
