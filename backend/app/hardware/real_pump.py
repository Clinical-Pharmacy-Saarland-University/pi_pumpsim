"""Real peristaltic pump: IBT-2 (BTS7960) H-bridge, hardware PWM.

Mirrors the proven `tools/pump_test.py` bench:
  * speed  -> hardware PWM via `rpi-hardware-pwm` on GPIO12/13 (RP1, Pi 5).
              Software PWM (lgpio) is too jittery; these are the hardware-PWM pins.
  * direction -> drive ONE PWM channel at the duty, the other at 0 (active-high).
  * stop   -> enables LOW (R_EN/L_EN) — a guaranteed, polarity-independent cut.
  * enables start OFF, on only while pumping -> the motor can't run before a command.

WIRING: the driver's VCC must be **3.3 V, not 5 V** (the BTS7960 input threshold is
above the Pi's 3.3 V GPIO HIGH at 5 V VCC -> garbage). See CLAUDE.md / memory.

Imports are lazy (inside __init__) so this module stays import-safe on a dev PC.
"""
from __future__ import annotations

import glob
import os

from .pump import Pump

# Raspberry Pi 5 (RP1): GPIO -> hardware-PWM channel
_PIN_TO_CHAN = {12: 0, 13: 1, 18: 2, 19: 3}


def _detect_chip() -> int:
    """Find the RP1 PWM sysfs chip (the one exposing the GPIO PWM channels).

    The pwmchip number moved between kernels (6.6 -> pwmchip2, 6.12 -> pwmchip0),
    so pick by capability: the chip with the most channels (RP1 GPIO PWM = 4).
    """
    best: tuple[int, int] | None = None  # (chip_number, npwm)
    for path in sorted(glob.glob("/sys/class/pwm/pwmchip*")):
        try:
            with open(os.path.join(path, "npwm")) as f:
                n = int(f.read().strip())
        except OSError:
            continue
        num = int(path.rsplit("pwmchip", 1)[1])
        if n >= 2 and (best is None or n > best[1]):
            best = (num, n)
    return best[0] if best else 0


class RealPump(Pump):
    def __init__(
        self,
        *,
        rate_ml_s: float,
        rpwm_pin: int = 12,
        lpwm_pin: int = 13,
        ren_pin: int = 23,
        len_pin: int = 24,
        in_is_rpwm: bool = True,
        pwm_hz: int = 20000,
        chip: str | int = "auto",
    ) -> None:
        super().__init__()
        from gpiozero import DigitalOutputDevice  # lazy: only on the Pi
        from rpi_hardware_pwm import HardwarePWM   # lazy: only on the Pi

        self._rate = rate_ml_s
        chip_n = _detect_chip() if str(chip) == "auto" else int(chip)

        in_pin = rpwm_pin if in_is_rpwm else lpwm_pin
        out_pin = lpwm_pin if in_is_rpwm else rpwm_pin
        self._in = HardwarePWM(pwm_channel=_PIN_TO_CHAN[in_pin], hz=pwm_hz, chip=chip_n)
        self._out = HardwarePWM(pwm_channel=_PIN_TO_CHAN[out_pin], hz=pwm_hz, chip=chip_n)
        self._in.start(0)
        self._out.start(0)

        # enables start OFF -> motor cannot run before a command
        self._ren = DigitalOutputDevice(ren_pin, initial_value=False)
        self._len = DigitalOutputDevice(len_pin, initial_value=False)

    def _apply(self) -> None:
        duty = self._speed * 100.0
        if self._direction == "in":
            self._out.change_duty_cycle(0.0)   # zero the opposite first
            self._in.change_duty_cycle(duty)
            self._ren.on()
            self._len.on()
        elif self._direction == "out":
            self._in.change_duty_cycle(0.0)
            self._out.change_duty_cycle(duty)
            self._ren.on()
            self._len.on()
        else:  # stop
            self._in.change_duty_cycle(0.0)
            self._out.change_duty_cycle(0.0)
            self._ren.off()  # cut the bridge — guaranteed stop
            self._len.off()

    @property
    def is_running(self) -> bool:
        return self._direction != "stop" and self._speed > 0

    @property
    def flow_ml_s(self) -> float:
        return self._rate * self._speed if self.is_running else 0.0

    def close(self) -> None:
        try:
            self.drive("stop")
        except Exception:
            pass
        for dev in (self._in, self._out):
            try:
                dev.stop()
            except Exception:
                pass
        for dev in (self._ren, self._len):
            try:
                dev.close()
            except Exception:
                pass
