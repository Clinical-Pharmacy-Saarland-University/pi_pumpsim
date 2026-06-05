"""Real peristaltic pump driven by a GPIO pin via gpiozero.

`gpiozero` is imported lazily inside __init__ so this module stays import-safe
on a dev PC where the library (and the hardware) are absent.

Wiring assumption: the pump motor is switched by a transistor/MOSFET or motor
driver on a single PWM-capable GPIO pin (BCM numbering). PWM duty maps to speed.
Adjust here once the real driver board is known.
"""
from __future__ import annotations

from .pump import Pump


class RealPump(Pump):
    def __init__(self, rate_ml_s: float, gpio_pin: int) -> None:
        super().__init__()
        from gpiozero import PWMOutputDevice  # lazy: only imported on the Pi

        self._rate = rate_ml_s
        self._device = PWMOutputDevice(gpio_pin)
        self._running = False

    def start(self) -> None:
        self._running = True
        self._device.value = self._speed

    def stop(self) -> None:
        self._running = False
        self._device.value = 0.0

    def set_speed(self, fraction: float) -> None:
        super().set_speed(fraction)
        if self._running:
            self._device.value = self._speed

    @property
    def is_running(self) -> bool:
        return self._running

    @property
    def flow_ml_s(self) -> float:
        return self._rate * self._speed if self._running else 0.0

    def set_rate(self, rate_ml_s: float) -> None:
        self._rate = rate_ml_s

    def close(self) -> None:
        self._device.off()
        self._device.close()
