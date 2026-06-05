"""Runtime settings (env / .env). Game/PK tuning lives in app/game/."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    pump_backend: str = "mock"  # "mock" | "real"
    tick_hz: int = 20

    # real-pump GPIO (BCM), only used when pump_backend == "real"
    pump_gpio_pin: int = 18
    pump_rate_ml_s: float = 2.0  # physical pump rate (hardware calibration)


settings = Settings()
