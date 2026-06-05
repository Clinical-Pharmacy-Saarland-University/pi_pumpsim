"""Selects the pump implementation from config (PUMP_BACKEND)."""
from __future__ import annotations

from .mock_pump import MockPump
from .pump import Pump


def create_pump(backend: str, rate_ml_s: float, gpio_pin: int) -> Pump:
    if backend == "real":
        from .real_pump import RealPump  # lazy: keeps gpiozero off the dev PC

        return RealPump(rate_ml_s=rate_ml_s, gpio_pin=gpio_pin)
    return MockPump(rate_ml_s=rate_ml_s)
