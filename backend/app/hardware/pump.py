"""Pump hardware-abstraction layer.

One interface, two implementations:
  * MockPump  — pure software, runs anywhere (dev PC).
  * RealPump  — drives a GPIO pin via gpiozero (on the Raspberry Pi).

The simulation/runner only ever talks to this interface, so swapping mock for
real hardware is a one-line config change (PUMP_BACKEND).
"""
from __future__ import annotations

from abc import ABC, abstractmethod


class Pump(ABC):
    def __init__(self) -> None:
        self._speed: float = 1.0  # 0..1, duty for PWM-capable pumps

    @abstractmethod
    def start(self) -> None:
        """Run the pump at the current speed."""

    @abstractmethod
    def stop(self) -> None:
        """Stop the pump."""

    def set_speed(self, fraction: float) -> None:
        """Set pump speed as a 0..1 fraction of full rate."""
        self._speed = max(0.0, min(1.0, fraction))

    @property
    def speed(self) -> float:
        return self._speed

    @property
    @abstractmethod
    def is_running(self) -> bool: ...

    @property
    @abstractmethod
    def flow_ml_s(self) -> float:
        """Current delivered flow in ml/s (0 when stopped)."""

    def set_rate(self, rate_ml_s: float) -> None:
        """Update the calibrated full-speed flow rate (ml/s)."""

    def close(self) -> None:
        """Release any hardware resources. No-op for software pumps."""
