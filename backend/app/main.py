"""FastAPI app: REST commands + WebSocket telemetry, and (in production) serves
the built Svelte frontend.

Run (dev):  python -m uvicorn app.main:app --reload --port 8000
"""
from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .config import Calibration, settings
from .hardware.factory import create_pump
from .runner import Runner

runner: Runner | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global runner
    cal = Calibration.from_settings(settings)
    pump = create_pump(settings.pump_backend, cal.pump_rate_ml_s, settings.pump_gpio_pin)
    runner = Runner(pump, cal, settings.tick_hz)
    await runner.start()
    print(f"[pumpsim] backend up  |  PUMP_BACKEND={settings.pump_backend}")
    try:
        yield
    finally:
        await runner.shutdown()


app = FastAPI(title="pi_pumpsim", lifespan=lifespan)

# CORS is permissive for local dev; in production the frontend is same-origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class DoseRequest(BaseModel):
    volume_ml: float = Field(gt=0)


def _runner() -> Runner:
    assert runner is not None, "runner not initialised"
    return runner


@app.get("/api/state")
def get_state() -> dict:
    return _runner().snapshot()


@app.get("/api/config")
def get_config() -> dict:
    return _runner().cal.model_dump()


@app.post("/api/config")
def set_config(cal: Calibration) -> dict:
    _runner().update_calibration(cal)
    return _runner().cal.model_dump()


@app.post("/api/command/prime")
def cmd_prime() -> dict:
    _runner().prime()
    return {"ok": True}


@app.post("/api/command/dose")
def cmd_dose(req: DoseRequest) -> dict:
    _runner().dose(req.volume_ml)
    return {"ok": True}


@app.post("/api/command/stop")
def cmd_stop() -> dict:
    _runner().stop_pump()
    return {"ok": True}


@app.post("/api/command/reset")
def cmd_reset() -> dict:
    _runner().reset()
    return {"ok": True}


@app.post("/api/command/empty")
def cmd_empty() -> dict:
    _runner().empty_avatar()
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


# Serve the built frontend if present (production / Pi). In dev, Vite serves it
# and proxies /api + /ws here, so this mount is simply absent.
_dist = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if _dist.is_dir():
    app.mount("/", StaticFiles(directory=str(_dist), html=True), name="static")
