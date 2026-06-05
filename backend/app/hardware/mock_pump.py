"""Software pump used for development (no hardware required)."""
from __future__ import annotations

from .pump import Pump


class MockPump(Pump):
    def __init__(self, rate_ml_s: float) -> None:
        super().__init__()
        self._rate = rate_ml_s
        self._running = False

    def start(self) -> None:
        self._running = True

    def stop(self) -> None:
        self._running = False

    @property
    def is_running(self) -> bool:
        return self._running

    @property
    def flow_ml_s(self) -> float:
        return self._rate * self._speed if self._running else 0.0

    def set_rate(self, rate_ml_s: float) -> None:
        self._rate = rate_ml_s
