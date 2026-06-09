"""Pump hardware-abstraction layer.

One interface, two implementations:
  * MockPump  — pure software, runs anywhere (dev PC).
  * RealPump  — drives an IBT-2 (BTS7960) H-bridge via hardware PWM (on the Pi).

The pump is DIRECTION-AWARE: `drive("in"|"out"|"stop", speed)`. The runner/admin
only ever talk to this interface, so swapping mock for real hardware is a one-line
config change (PUMP_BACKEND). Subclasses implement just `_apply()` (actuate from the
current direction+speed) plus the `is_running` / `flow_ml_s` read-outs.
"""
from __future__ import annotations

from abc import ABC, abstractmethod

Direction = str  # "in" | "out" | "stop"


def _clamp01(v: float) -> float:
    return max(0.0, min(1.0, v))


class Pump(ABC):
    def __init__(self) -> None:
        self._speed: float = 1.0      # 0..1 duty fraction
        self._direction: Direction = "stop"
        self._rate: float = 0.0       # calibrated full-speed flow, ml/s

    # --- actuation (subclass implements _apply) ----------------------------
    @abstractmethod
    def _apply(self) -> None:
        """Push the current direction + speed to the hardware (or no-op)."""

    def drive(self, direction: Direction, speed: float | None = None) -> None:
        """Run the pump in a direction at a speed (0..1). 'stop' halts it."""
        if speed is not None:
            self._speed = _clamp01(speed)
        self._direction = direction if direction in ("in", "out") else "stop"
        self._apply()

    def set_speed(self, fraction: float) -> None:
        """Set pump speed as a 0..1 fraction of full rate (re-actuates if running)."""
        self._speed = _clamp01(fraction)
        if self._direction != "stop":
            self._apply()

    # convenience shims (used by the runner / tests)
    def start(self) -> None:
        """Run at the current speed; resumes the last direction, defaulting to 'in'."""
        self.drive(self._direction if self._direction != "stop" else "in")

    def stop(self) -> None:
        self.drive("stop")

    # --- read-outs ---------------------------------------------------------
    @property
    def speed(self) -> float:
        return self._speed

    @property
    def direction(self) -> Direction:
        return self._direction

    @property
    def rate_ml_s(self) -> float:
        return self._rate

    @property
    @abstractmethod
    def is_running(self) -> bool: ...

    @property
    @abstractmethod
    def flow_ml_s(self) -> float:
        """Current delivered flow magnitude in ml/s (0 when stopped)."""

    # --- calibration / lifecycle ------------------------------------------
    def set_rate(self, rate_ml_s: float) -> None:
        """Update the calibrated full-speed flow rate (ml/s)."""
        self._rate = max(0.0, rate_ml_s)

    def close(self) -> None:
        """Release any hardware resources. No-op for software pumps."""
