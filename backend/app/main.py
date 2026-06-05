"""FastAPI app: game commands (REST) + live GameState (WebSocket); serves the
built Svelte UI in production.

Run (dev):  python -m uvicorn app.main:app --reload --port 8000
"""
from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .config import settings
from .game.runner import GameRunner
from .hardware.factory import create_pump

runner: GameRunner | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global runner
    pump = create_pump(settings.pump_backend, settings.pump_rate_ml_s, settings.pump_gpio_pin)
    runner = GameRunner(pump, settings.tick_hz)
    await runner.start()
    print(f"[pumpsim] backend up  |  PUMP_BACKEND={settings.pump_backend}")
    try:
        yield
    finally:
        await runner.shutdown()


app = FastAPI(title="pi_pumpsim — Dr. Dosis", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)


def _runner() -> GameRunner:
    assert runner is not None, "runner not initialised"
    return runner


class StartRequest(BaseModel):
    scenario_id: str


class HoldRequest(BaseModel):
    on: bool


@app.get("/api/scenarios")
def get_scenarios() -> list[dict]:
    return GameRunner.scenarios()


@app.get("/api/state")
def get_state() -> dict:
    return _runner().snapshot()


@app.post("/api/game/start")
def start_round(req: StartRequest) -> dict:
    try:
        _runner().start_round(req.scenario_id)
    except KeyError:
        raise HTTPException(404, f"unknown scenario '{req.scenario_id}'")
    return {"ok": True}


@app.post("/api/game/hold")
def set_hold(req: HoldRequest) -> dict:
    _runner().set_hold(req.on)
    return {"ok": True}


@app.post("/api/game/stop")
def stop_round() -> dict:
    _runner().stop_round()
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
