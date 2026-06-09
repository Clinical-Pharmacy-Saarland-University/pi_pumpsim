"""Runtime settings (env / .env). Game/PK tuning lives in app/game/."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    pump_backend: str = "mock"  # "mock" | "real"
    tick_hz: int = 20

    # --- real pump: IBT-2 (BTS7960) H-bridge, hardware PWM ------------------
    # Only used when pump_backend == "real". GPIO12/13 are the Pi's hardware-PWM
    # pins; speed is driven via rpi-hardware-pwm (software PWM is too jittery on
    # the Pi 5). VCC of the driver MUST be 3.3 V, not 5 V. See CLAUDE.md / memory.
    pump_rpwm_pin: int = 12          # BCM, hardware PWM channel 0
    pump_lpwm_pin: int = 13          # BCM, hardware PWM channel 1
    pump_ren_pin: int = 23           # BCM, R_EN
    pump_len_pin: int = 24           # BCM, L_EN
    pump_in_is_rpwm: bool = True     # which PWM input means "fill / in"
    pump_pwm_hz: int = 20000         # inaudible; RP1 hardware PWM handles it cleanly
    pump_pwm_chip: str = "auto"      # "auto" detects RP1 (trixie/6.12 = pwmchip0)

    # calibration: full-speed (100% duty) flow rate, ml/s
    pump_rate_ml_s: float = 2.0


settings = Settings()
