"""Orchestrates the pump + PK engine in a background async loop and broadcasts
telemetry to subscribers (WebSocket clients).

Commands (prime / dose / stop / reset / empty) are non-blocking: they set the
pump state and a mode, and the loop drives them to completion.
"""
from __future__ import annotations

import asyncio

from .config import Calibration
from .hardware.pump import Pump
from .sim.engine import PKEngine

Mode = str  # "idle" | "priming" | "dosing"


class Runner:
    def __init__(self, pump: Pump, cal: Calibration, tick_hz: int) -> None:
        self.pump = pump
        self.cal = cal
        self.engine = PKEngine(cal)
        self.dt = 1.0 / max(1, tick_hz)
        self.mode: Mode = "idle"
        self._dose_target_delivered = 0.0
        self._listeners: set[asyncio.Queue] = set()
        self._task: asyncio.Task | None = None

    # ---- lifecycle --------------------------------------------------------
    async def start(self) -> None:
        self._task = asyncio.create_task(self._loop())

    async def shutdown(self) -> None:
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        self.pump.stop()
        self.pump.close()

    # ---- commands ---------------------------------------------------------
    def prime(self) -> None:
        self.mode = "priming"
        self.pump.start()

    def dose(self, volume_ml: float) -> None:
        self._dose_target_delivered = self.engine.state.delivered_ml + max(0.0, volume_ml)
        self.mode = "dosing"
        self.pump.start()

    def stop_pump(self) -> None:
        self.mode = "idle"
        self.pump.stop()

    def reset(self) -> None:
        self.stop_pump()
        self.engine.reset()

    def empty_avatar(self) -> None:
        self.stop_pump()
        self.engine.reset_avatar()

    def update_calibration(self, cal: Calibration) -> None:
        self.cal = cal
        self.engine.cal = cal
        self.pump.set_rate(cal.pump_rate_ml_s)

    # ---- loop -------------------------------------------------------------
    async def _loop(self) -> None:
        while True:
            self.engine.tick(self.dt, self.pump.flow_ml_s)

            if self.mode == "priming" and self.engine.primed:
                self.stop_pump()
            elif (
                self.mode == "dosing"
                and self.engine.state.delivered_ml >= self._dose_target_delivered
            ):
                self.stop_pump()

            self._broadcast()
            await asyncio.sleep(self.dt)

    # ---- telemetry --------------------------------------------------------
    def snapshot(self) -> dict:
        s = self.engine.state
        return {
            "t": round(s.t, 2),
            "mode": self.mode,
            "pump_running": self.pump.is_running,
            "pump_flow_ml_s": round(self.pump.flow_ml_s, 3),
            "primed": self.engine.primed,
            "primed_ml": round(s.primed_ml, 2),
            "delivered_ml": round(s.delivered_ml, 2),
            "level_ml": round(s.level_ml, 2),
            "in_target": self.engine.in_target,
            "calibration": self.cal.model_dump(),
        }

    def _broadcast(self) -> None:
        snap = self.snapshot()
        for q in list(self._listeners):
            if q.full():
                # drop the stale frame so clients always get the freshest state
                try:
                    q.get_nowait()
                except asyncio.QueueEmpty:
                    pass
            try:
                q.put_nowait(snap)
            except asyncio.QueueFull:
                pass

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue(maxsize=2)
        self._listeners.add(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        self._listeners.discard(q)
