"""Configuration & calibration models.

`Settings` holds startup defaults loaded from environment / .env.
`Calibration` is the live, validated set of tunable values the simulation uses;
it can be updated at runtime from the admin panel.
"""
from __future__ import annotations

from pydantic import BaseModel, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    pump_backend: str = "mock"  # "mock" | "real"

    # calibration defaults
    pump_rate_ml_s: float = 2.0
    dead_volume_ml: float = 5.0
    capacity_ml: float = 100.0
    target_low_ml: float = 40.0
    target_high_ml: float = 60.0
    clearance_k: float = 0.01

    tick_hz: int = 20

    # real-pump GPIO (BCM), only used when pump_backend == "real"
    pump_gpio_pin: int = 18


class Calibration(BaseModel):
    """Live, validated calibration. Editable from the admin panel."""

    pump_rate_ml_s: float = Field(gt=0, description="delivered flow at full speed (ml/s)")
    dead_volume_ml: float = Field(ge=0, description="tubing volume to prime (ml)")
    capacity_ml: float = Field(gt=0, description="avatar vessel capacity (ml)")
    target_low_ml: float = Field(ge=0, description="therapeutic window lower bound (ml)")
    target_high_ml: float = Field(gt=0, description="therapeutic window upper bound (ml)")
    clearance_k: float = Field(ge=0, description="first-order elimination rate (1/s)")

    @model_validator(mode="after")
    def _coherent(self) -> "Calibration":
        if self.target_low_ml >= self.target_high_ml:
            raise ValueError("target_low_ml must be < target_high_ml")
        if self.target_high_ml > self.capacity_ml:
            raise ValueError("target_high_ml must be <= capacity_ml")
        return self

    @classmethod
    def from_settings(cls, s: Settings) -> "Calibration":
        return cls(
            pump_rate_ml_s=s.pump_rate_ml_s,
            dead_volume_ml=s.dead_volume_ml,
            capacity_ml=s.capacity_ml,
            target_low_ml=s.target_low_ml,
            target_high_ml=s.target_high_ml,
            clearance_k=s.clearance_k,
        )


settings = Settings()
