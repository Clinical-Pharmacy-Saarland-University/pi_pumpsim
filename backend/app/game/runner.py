"""Async runner: ticks the LevelController, drives the pump toward the target,
and broadcasts level state to WebSocket clients.

Two modes:
  * auto   — the level moves toward the game's target; the pump follows.
  * manual — the admin jogs the pump directly (in/out/stop + speed + timed runs)
             for calibration; the level just mirrors the motion for feedback.
"""
from __future__ import annotations

import asyncio

from ..hardware.pump import Pump
from .controller import LevelController


class LevelRunner:
    def __init__(
        self, pump: Pump, tick_hz: int, backend: str = "mock", version: str = "0.0.0"
    ) -> None:
        self.pump = pump
        self.backend = backend
        self.version = version
        self.ctrl = LevelController()
        self.dt = 1.0 / max(1, tick_hz)
        self.manual = False
        self._manual_remaining: float | None = None  # seconds left on the current step
        self._seq: list[dict] = []  # queued timed steps (empty / calibrated reset)
        self._listeners: set[asyncio.Queue] = set()
        self._task: asyncio.Task | None = None

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

    # --- game (auto) commands ---------------------------------------------
    def set_target(self, level: float, rate: float | None = None) -> None:
        self.manual = False
        self.ctrl.set_target(level, rate)

    def reset(self) -> None:
        self.manual = False
        self._manual_remaining = None
        self._seq = []
        self.ctrl.reset(immediate=True)
        self.pump.drive("stop")

    # --- admin (manual) commands ------------------------------------------
    def set_manual(self, on: bool) -> None:
        self.manual = on
        self._manual_remaining = None
        self._seq = []
        self.pump.drive("stop")
        if not on:
            self.ctrl.target = self.ctrl.level  # don't snap when auto resumes

    def manual_drive(self, direction: str, speed: float) -> None:
        self.manual = True
        self._manual_remaining = None
        self._seq = []
        self.pump.drive(direction, speed)

    def manual_run(self, direction: str, speed: float, seconds: float) -> None:
        self.manual = True
        self._seq = []
        self.pump.drive(direction, speed)
        self._manual_remaining = max(0.1, min(120.0, seconds))

    def manual_stop(self) -> None:
        self._manual_remaining = None
        self._seq = []
        self.pump.drive("stop")

    def run_sequence(self, steps: list[dict]) -> None:
        """Run a list of timed pump steps: [{dir, speed, seconds}, ...].

        Used for empty/overpump and the calibrated reset (drain to empty, then
        prime in a known volume). Drives in manual mode and auto-advances.
        """
        self.manual = True
        self._seq = [dict(s) for s in steps]
        self._advance_seq()

    def _advance_seq(self) -> None:
        if self._seq:
            step = self._seq.pop(0)
            self.pump.drive(str(step.get("dir", "stop")), float(step.get("speed", 1.0)))
            self._manual_remaining = max(0.1, min(600.0, float(step.get("seconds", 0))))
        else:
            self._manual_remaining = None
            self.pump.drive("stop")

    def set_rate(self, rate_ml_s: float) -> None:
        self.pump.set_rate(rate_ml_s)

    # --- loop -------------------------------------------------------------
    async def _loop(self) -> None:
        while True:
            if self.manual:
                if self._manual_remaining is not None:
                    self._manual_remaining -= self.dt
                    if self._manual_remaining <= 0:
                        if self._seq:
                            self._advance_seq()  # next step in the sequence
                        else:
                            self._manual_remaining = None
                            self.pump.drive("stop")
                self.ctrl.manual_step(self.pump.direction, self.pump.speed, self.dt)
            else:
                self.ctrl.tick(self.dt)
                direction = self.ctrl.direction
                self.pump.drive(direction, 1.0 if direction != "stop" else 0.0)
            self._broadcast()
            await asyncio.sleep(self.dt)

    # --- telemetry --------------------------------------------------------
    def snapshot(self) -> dict:
        snap = self.ctrl.snapshot()
        snap["pump_running"] = self.pump.is_running
        snap["pump_direction"] = self.pump.direction
        snap["pump_speed"] = round(self.pump.speed, 3)
        snap["pump_flow_ml_s"] = round(self.pump.flow_ml_s, 3)
        snap["pump_rate_ml_s"] = round(self.pump.rate_ml_s, 3)
        snap["manual"] = self.manual
        snap["backend"] = self.backend
        snap["version"] = self.version
        return snap

    def _broadcast(self) -> None:
        snap = self.snapshot()
        for q in list(self._listeners):
            if q.full():
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
