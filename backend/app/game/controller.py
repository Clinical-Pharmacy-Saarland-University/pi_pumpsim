"""LevelController — the "torso twin": the authoritative drug level (0–100).

The frontend game sets a *target*; the level moves toward it at the (slow) pump
rate, mirroring the real torso. The therapeutic window is a FIXED band. Zones:
under / in / over, plus critical_low / critical_high (instant-loss lines).

Pure logic, unit-tested. On hardware the IBT-2 RealPump will be driven to move the
real water toward `target`; in mock this integration is the source of truth.
"""
from __future__ import annotations

from dataclasses import dataclass


def _clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


@dataclass
class LevelConfig:
    capacity: float = 100.0
    baseline: float = 42.0       # reset/start level (just below the band)
    band_low: float = 55.0       # lower tape (therapeutic window)
    band_high: float = 70.0      # upper tape
    critical_high: float = 80.0  # instant toxic loss
    critical_low: float = 35.0   # instant ineffective loss
    rate: float = 4.0            # units/sec — the slow pump speed (digital twin)


class LevelController:
    def __init__(self, cfg: LevelConfig | None = None) -> None:
        self.cfg = cfg or LevelConfig()
        self.level = self.cfg.baseline
        self.target = self.cfg.baseline
        self.rate = self.cfg.rate

    def set_target(self, target: float, rate: float | None = None) -> None:
        self.target = _clamp(target, 0.0, self.cfg.capacity)
        if rate is not None:
            self.rate = max(0.1, rate)

    def reset(self, immediate: bool = True) -> None:
        self.target = self.cfg.baseline
        self.rate = self.cfg.rate
        if immediate:
            self.level = self.cfg.baseline

    def tick(self, dt: float) -> None:
        d = self.target - self.level
        step = self.rate * dt
        if abs(d) <= step:
            self.level = self.target
        else:
            self.level += step if d > 0 else -step
        self.level = _clamp(self.level, 0.0, self.cfg.capacity)

    def manual_step(
        self, direction: str, speed: float, dt: float, rate: float | None = None
    ) -> None:
        """Move the level with a manually-jogged pump (admin calibration).

        There is no real level sensor, so this just gives visual feedback on the
        virtual torso. `rate` (units/s at 100% duty) overrides the controller rate —
        the runner derives it from the calibrated flow / torso volume so the on-screen
        twin moves like the real water. `target` is kept pinned to `level` so auto
        mode won't snap on exit.
        """
        step = (rate if rate is not None else self.rate) * max(0.0, min(1.0, speed)) * dt
        if direction == "in":
            self.level = _clamp(self.level + step, 0.0, self.cfg.capacity)
        elif direction == "out":
            self.level = _clamp(self.level - step, 0.0, self.cfg.capacity)
        self.target = self.level

    @property
    def moving(self) -> bool:
        return abs(self.target - self.level) > 1e-6

    @property
    def direction(self) -> str:
        if not self.moving:
            return "stop"
        return "in" if self.target > self.level else "out"

    @property
    def in_band(self) -> bool:
        return self.cfg.band_low <= self.level <= self.cfg.band_high

    @property
    def zone(self) -> str:
        c = self.cfg
        if self.level >= c.critical_high:
            return "critical_high"
        if self.level <= c.critical_low:
            return "critical_low"
        if self.level > c.band_high:
            return "over"
        if self.level < c.band_low:
            return "under"
        return "in"

    def snapshot(self) -> dict:
        c = self.cfg
        return {
            "level": round(self.level, 2),
            "target": round(self.target, 2),
            "moving": self.moving,
            "direction": self.direction,
            "zone": self.zone,
            "in_band": self.in_band,
            "capacity": c.capacity,
            "baseline": c.baseline,
            "band_low": c.band_low,
            "band_high": c.band_high,
            "critical_high": c.critical_high,
            "critical_low": c.critical_low,
        }
