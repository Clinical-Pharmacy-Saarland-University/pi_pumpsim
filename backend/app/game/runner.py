"""GameRunner — ties the GameEngine to the pump and broadcasts state over WS.

In mock mode the engine's computed level is the source of truth. On real hardware
the pump is driven IN while holding; elimination (pump-out) is a later hardware
concern — the open-loop level model stays authoritative.
"""
from __future__ import annotations

import asyncio

from ..hardware.pump import Pump
from .engine import GameEngine
from .scenarios import SCENARIOS, SCENARIO_BY_ID


class GameRunner:
    def __init__(self, pump: Pump, tick_hz: int) -> None:
        self.pump = pump
        self.engine = GameEngine()
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
    def start_round(self, scenario_id: str) -> None:
        self.engine.start(SCENARIO_BY_ID[scenario_id])
        self.pump.stop()

    def set_hold(self, on: bool) -> None:
        self.engine.set_hold(on)
        # drive the physical pump IN while the player holds
        if on and self.engine.phase == "running":
            self.pump.start()
        else:
            self.pump.stop()

    def stop_round(self) -> None:
        self.engine.stop()
        self.pump.stop()

    @staticmethod
    def scenarios() -> list[dict]:
        return [
            {
                "id": s.id,
                "patient_id": s.patient_id,
                "drug_id": s.drug_id,
                "band_low": s.band_low,
                "band_high": s.band_high,
                "duration": s.duration,
                "tutorial": s.tutorial,
                "events": [{"t": e.t, "type": e.type} for e in s.events],
            }
            for s in SCENARIOS
        ]

    # --- loop ---
    async def _loop(self) -> None:
        while True:
            was_running = self.engine.phase == "running"
            self.engine.tick(self.dt)
            if was_running and self.engine.phase == "ended":
                self.pump.stop()  # round over → stop dosing
            self._broadcast()
            await asyncio.sleep(self.dt)

    # --- telemetry ---
    def snapshot(self) -> dict:
        snap = self.engine.snapshot()
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
