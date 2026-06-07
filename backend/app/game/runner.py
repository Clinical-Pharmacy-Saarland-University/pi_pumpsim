"""Async runner: ticks the LevelController, drives the pump toward the target,
and broadcasts level state to WebSocket clients.
"""
from __future__ import annotations

import asyncio

from ..hardware.pump import Pump
from .controller import LevelController


class LevelRunner:
    def __init__(self, pump: Pump, tick_hz: int) -> None:
        self.pump = pump
        self.ctrl = LevelController()
        self.dt = 1.0 / max(1, tick_hz)
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

    # --- commands ---
    def set_target(self, level: float, rate: float | None = None) -> None:
        self.ctrl.set_target(level, rate)

    def reset(self) -> None:
        self.ctrl.reset(immediate=True)
        self.pump.stop()

    # --- loop ---
    async def _loop(self) -> None:
        while True:
            self.ctrl.tick(self.dt)
            # drive the pump toward the target (mock: just reflects motion;
            # the IBT-2 RealPump will map direction -> in/out)
            if self.ctrl.direction == "stop":
                self.pump.stop()
            else:
                self.pump.start()
            self._broadcast()
            await asyncio.sleep(self.dt)

    # --- telemetry ---
    def snapshot(self) -> dict:
        snap = self.ctrl.snapshot()
        snap["pump_running"] = self.pump.is_running
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
