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
from .calibration import DEFAULT as CAL_DEFAULT
from .controller import LevelController


class LevelRunner:
    def __init__(
        self,
        pump: Pump,
        tick_hz: int,
        backend: str = "mock",
        version: str = "0.0.0",
        calibration: dict | None = None,
    ) -> None:
        self.pump = pump
        self.backend = backend
        self.version = version
        self.ctrl = LevelController()
        self.dt = 1.0 / max(1, tick_hz)
        self.manual = False
        # physical mapping (from calibration): level 0..100 <-> 0..volume_ml of water
        self.volume_ml: float = float(CAL_DEFAULT["torso_volume_ml"])
        self.rate_in_ml_s: float | None = None   # ml/s at 100% duty, fill
        self.rate_out_ml_s: float | None = None  # ml/s at 100% duty, drain
        self._manual_remaining: float | None = None  # seconds left on the current step
        self._seq: list[dict] = []  # queued timed steps (empty / calibrated reset)
        self._listeners: set[asyncio.Queue] = set()
        self._task: asyncio.Task | None = None
        if calibration:
            self.apply_calibration(calibration)

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

    # --- calibration ---------------------------------------------------------
    def apply_calibration(self, cal: dict) -> None:
        """Adopt the persisted calibration: per-direction flow + torso volume.

        Explicit null/0 falls back to the committed defaults, so a cleared value
        behaves the same live as after a restart. rate_in is also pushed to the
        pump so its flow telemetry is calibrated.
        """
        rate_in = cal.get("rate_in") or CAL_DEFAULT["rate_in"]
        rate_out = cal.get("rate_out") or CAL_DEFAULT["rate_out"]
        self.rate_in_ml_s = float(rate_in) if rate_in else None
        self.rate_out_ml_s = float(rate_out) if rate_out else None
        self.volume_ml = float(cal.get("torso_volume_ml") or CAL_DEFAULT["torso_volume_ml"])
        if self.rate_in_ml_s:
            self.pump.set_rate(self.rate_in_ml_s)

    def _dir_rate_ml_s(self, direction: str) -> float | None:
        """Calibrated full-duty flow for a direction (drain is often slower)."""
        return self.rate_out_ml_s if direction == "out" else self.rate_in_ml_s

    # --- loop -------------------------------------------------------------
    def _tick(self) -> None:
        """One simulation step (sync, so tests can drive it without the loop)."""
        # keep the pump's telemetry rate in sync with the calibrated per-direction flow
        rate_ml = self._dir_rate_ml_s(self.pump.direction)
        if rate_ml and rate_ml != self.pump.rate_ml_s:
            self.pump.set_rate(rate_ml)
        if self.manual:
            if self._manual_remaining is not None:
                self._manual_remaining -= self.dt
                if self._manual_remaining <= 0:
                    if self._seq:
                        self._advance_seq()  # next step in the sequence
                    else:
                        self._manual_remaining = None
                        self.pump.drive("stop")
            # physically-accurate twin feedback: calibrated ml/s over the torso volume
            rate_units = (
                rate_ml / self.volume_ml * 100.0 if rate_ml and self.volume_ml > 0 else None
            )
            self.ctrl.manual_step(self.pump.direction, self.pump.speed, self.dt, rate_units)
        else:
            self.ctrl.tick(self.dt)
            direction = self.ctrl.direction
            self.pump.drive(direction, 1.0 if direction != "stop" else 0.0)

    async def _loop(self) -> None:
        while True:
            self._tick()
            self._broadcast()
            await asyncio.sleep(self.dt)

    # --- telemetry --------------------------------------------------------
    def snapshot(self) -> dict:
        snap = self.ctrl.snapshot()
        # physical mapping for the virtual torso (level% -> ml of water)
        cap = self.ctrl.cfg.capacity or 100.0
        snap["torso_volume_ml"] = round(self.volume_ml, 1)
        snap["level_ml"] = round(self.ctrl.level / cap * self.volume_ml, 1)
        snap["target_ml"] = round(self.ctrl.target / cap * self.volume_ml, 1)
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
