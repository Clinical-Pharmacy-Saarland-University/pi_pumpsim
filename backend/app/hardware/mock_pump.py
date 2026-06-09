"""Software pump used for development (no hardware required)."""
from __future__ import annotations

from .pump import Pump


class MockPump(Pump):
    def __init__(self, rate_ml_s: float) -> None:
        super().__init__()
        self._rate = rate_ml_s

    def _apply(self) -> None:
        pass  # nothing physical to drive

    @property
    def is_running(self) -> bool:
        return self._direction != "stop" and self._speed > 0

    @property
    def flow_ml_s(self) -> float:
        return self._rate * self._speed if self.is_running else 0.0
