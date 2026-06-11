"""Selects the pump implementation from config (PUMP_BACKEND)."""
from __future__ import annotations

from typing import TYPE_CHECKING

from ..game.calibration import DEFAULT as CAL_DEFAULT
from .mock_pump import MockPump
from .pump import Pump

if TYPE_CHECKING:
    from ..config import Settings

# The pump boots with the calibration default flow rate; the runner then overwrites it
# with the persisted calibration (calibration.json) on startup. Seeding from the SAME
# place as the runtime default keeps a single source of truth for flow (no env var to
# drift out of sync with the calibration).
_SEED_RATE_ML_S = float(CAL_DEFAULT["rate_in"])


def create_pump(settings: "Settings") -> Pump:
    if settings.pump_backend == "real":
        from .real_pump import RealPump  # lazy: keeps Pi-only libs off the dev PC

        return RealPump(
            rate_ml_s=_SEED_RATE_ML_S,
            rpwm_pin=settings.pump_rpwm_pin,
            lpwm_pin=settings.pump_lpwm_pin,
            ren_pin=settings.pump_ren_pin,
            len_pin=settings.pump_len_pin,
            in_is_rpwm=settings.pump_in_is_rpwm,
            pwm_hz=settings.pump_pwm_hz,
            chip=settings.pump_pwm_chip,
        )
    return MockPump(rate_ml_s=_SEED_RATE_ML_S)
