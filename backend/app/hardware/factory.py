"""Selects the pump implementation from config (PUMP_BACKEND)."""
from __future__ import annotations

from typing import TYPE_CHECKING

from .mock_pump import MockPump
from .pump import Pump

if TYPE_CHECKING:
    from ..config import Settings


def create_pump(settings: "Settings") -> Pump:
    if settings.pump_backend == "real":
        from .real_pump import RealPump  # lazy: keeps Pi-only libs off the dev PC

        return RealPump(
            rate_ml_s=settings.pump_rate_ml_s,
            rpwm_pin=settings.pump_rpwm_pin,
            lpwm_pin=settings.pump_lpwm_pin,
            ren_pin=settings.pump_ren_pin,
            len_pin=settings.pump_len_pin,
            in_is_rpwm=settings.pump_in_is_rpwm,
            pwm_hz=settings.pump_pwm_hz,
            chip=settings.pump_pwm_chip,
        )
    return MockPump(rate_ml_s=settings.pump_rate_ml_s)
