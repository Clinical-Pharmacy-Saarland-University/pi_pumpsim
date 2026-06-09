#!/usr/bin/env python3
"""Standalone pump test bench for an IBT-2 (BTS7960) H-bridge driver.

Check pump direction + speed independently of the game, from a touch/web UI.

The IBT-2 uses TWO pwm inputs (one per direction) + two enables:
    RPWM = GPIO12 (pin 32, hardware PWM / RP1 channel 0)   one direction's speed
    LPWM = GPIO13 (pin 33, hardware PWM / RP1 channel 1)   other direction's speed
    R_EN = GPIO23 (pin 16)                                 enable
    L_EN = GPIO24 (pin 18)                                 enable
    VCC  = 5V (pin 2) ; GND = GND (pin 14)  common ground with the Pi
B+/B- = external motor supply ; M+/M- = pump motor. (R_IS/L_IS: leave unconnected.)

Direction: drive ONE pwm at the wanted duty, the other at 0. Never both > 0.
'in' uses RPWM by default; set PUMP_IN_IS_RPWM=0 to swap (or swap the motor leads).

PWM MODE  <-- the important part:
  GPIO12/13 are the Pi's *hardware* PWM pins. Software PWM (lgpio) on the Pi 5 does NOT
  reproduce the duty cycle faithfully -> jittery, asymmetric, non-monotonic speed (one
  direction "fast at 1% and 95%", the other inverted, etc). Use HARDWARE PWM:
    1) add to /boot/firmware/config.txt:
         dtoverlay=pwm-2chan,pin=12,func=4,pin2=13,func2=4
    2) sudo reboot
    3) sudo pip3 install rpi-hardware-pwm --break-system-packages
  Then this bench auto-detects hardware PWM (and the right sysfs pwmchip, which moved
  between kernels: 6.6 -> pwmchip2, 6.12/trixie -> pwmchip0). PUMP_PWM_MODE=sw forces
  the old (poor) software path; PUMP_PWM_MODE=hw forces hardware and errors if missing.

Run on the Pi:
    python3 ~/pi_pumpsim/tools/pump_test.py     # add sudo if /sys/class/pwm is root-only
Open  http://<pi-ip>:8001  from your PC. Ctrl+C stops the pump and releases GPIO.

Env overrides:
  PUMP_RPWM_PIN PUMP_LPWM_PIN PUMP_REN_PIN PUMP_LEN_PIN   (BCM pin numbers)
  PUMP_RPWM_CHAN PUMP_LPWM_CHAN   (hw-PWM channels; Pi5: GPIO12=0 13=1 18=2 19=3)
  PUMP_PWM_CHIP   ('auto' detects; trixie/6.12 = 0, older 6.6 = 2)
  PUMP_PWM_MODE   (auto|hw|sw)   PUMP_PWM_HZ   (hw default 20000, sw default 100)
  PUMP_IN_IS_RPWM PUMP_TEST_PORT   PUMP_PWM_ACTIVE_HIGH   (software-mode polarity only)
"""
from __future__ import annotations

import glob
import json
import os
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

os.environ.setdefault("GPIOZERO_PIN_FACTORY", "lgpio")

RPWM_PIN = int(os.environ.get("PUMP_RPWM_PIN", "12"))
LPWM_PIN = int(os.environ.get("PUMP_LPWM_PIN", "13"))
REN_PIN = int(os.environ.get("PUMP_REN_PIN", "23"))
LEN_PIN = int(os.environ.get("PUMP_LEN_PIN", "24"))
IN_IS_RPWM = os.environ.get("PUMP_IN_IS_RPWM", "1") == "1"  # which pwm pin means "in"
PORT = int(os.environ.get("PUMP_TEST_PORT", "8001"))
MAX_SECONDS = 120  # safety cap on timed runs

# --- hardware-PWM config -----------------------------------------------------
_PIN_TO_CHAN = {12: 0, 13: 1, 18: 2, 19: 3}  # Raspberry Pi 5 (RP1) GPIO -> PWM channel
RPWM_CHAN = int(os.environ.get("PUMP_RPWM_CHAN", str(_PIN_TO_CHAN.get(RPWM_PIN, 0))))
LPWM_CHAN = int(os.environ.get("PUMP_LPWM_CHAN", str(_PIN_TO_CHAN.get(LPWM_PIN, 1))))
PWM_CHIP = os.environ.get("PUMP_PWM_CHIP", "auto")
PWM_MODE = os.environ.get("PUMP_PWM_MODE", "auto").lower()  # auto | hw | sw
ACTIVE_HIGH = os.environ.get("PUMP_PWM_ACTIVE_HIGH", "1") == "1"  # software mode only
_HZ_ENV = os.environ.get("PUMP_PWM_HZ")  # None -> per-mode default

try:
    from gpiozero import DigitalOutputDevice, PWMOutputDevice
except Exception as e:  # pragma: no cover - Pi-only
    raise SystemExit(f"gpiozero not available ({e}). Run this on the Pi.")


def _detect_chip() -> int:
    """Find the RP1 PWM sysfs chip (the one exposing the GPIO PWM channels).

    The pwmchip *number* moved between kernels (6.6 -> pwmchip2, 6.12 -> pwmchip0),
    so pick by capability: the chip exposing the most channels (RP1 GPIO PWM = 4).
    """
    best = None  # (chip_number, npwm)
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


class _SwPwm:
    """Software PWM via gpiozero/lgpio (jittery on the Pi 5 -- fallback only)."""

    def __init__(self, pin: int, hz: int, active_high: bool):
        self.dev = PWMOutputDevice(pin, frequency=hz, active_high=active_high, initial_value=0)

    def duty(self, pct: float) -> None:
        self.dev.value = max(0.0, min(1.0, pct / 100.0))

    def close(self) -> None:
        self.dev.close()


class _HwPwm:
    """True hardware PWM via rpi-hardware-pwm (clean, fast, symmetric)."""

    def __init__(self, channel: int, hz: int, chip: int):
        from rpi_hardware_pwm import HardwarePWM

        self.pwm = HardwarePWM(pwm_channel=channel, hz=hz, chip=chip)
        self.pwm.start(0)  # 0% duty -> off

    def duty(self, pct: float) -> None:
        self.pwm.change_duty_cycle(max(0.0, min(100.0, pct)))

    def close(self) -> None:
        try:
            self.pwm.stop()
        except Exception:
            pass


def _build_pwm():
    """Return (mode, rpwm, lpwm, hz, chip). Try hardware PWM, fall back to software."""
    if PWM_MODE in ("auto", "hw"):
        try:
            chip = _detect_chip() if PWM_CHIP == "auto" else int(PWM_CHIP)
            hz = int(_HZ_ENV) if _HZ_ENV else 20000  # inaudible, clean on hardware
            r = _HwPwm(RPWM_CHAN, hz, chip)
            l = _HwPwm(LPWM_CHAN, hz, chip)
            return "hw", r, l, hz, chip
        except Exception as e:
            if PWM_MODE == "hw":
                raise SystemExit(
                    f"hardware PWM requested but unavailable: {e}\n"
                    "Add 'dtoverlay=pwm-2chan,pin=12,func=4,pin2=13,func2=4' to "
                    "/boot/firmware/config.txt, reboot, and 'sudo pip3 install "
                    "rpi-hardware-pwm --break-system-packages'. (sysfs PWM may also need "
                    "sudo or a udev rule.)"
                )
            print(f"[warn] hardware PWM unavailable ({e}); falling back to SOFTWARE PWM -- "
                  "speed control will be poor. See the file header for the hardware-PWM setup.")
    hz = int(_HZ_ENV) if _HZ_ENV else 100  # low freq is the best software PWM can do
    r = _SwPwm(RPWM_PIN, hz, ACTIVE_HIGH)
    l = _SwPwm(LPWM_PIN, hz, ACTIVE_HIGH)
    return "sw", r, l, hz, None


MODE, _rpwm, _lpwm, PWM_HZ, PWM_CHIP_USED = _build_pwm()

# Enables start OFF and come on ONLY while actively pumping -> the motor can't run
# before you press anything, and STOP truly cuts the bridge (not just the PWM duty).
_ren = DigitalOutputDevice(REN_PIN, initial_value=False)
_len = DigitalOutputDevice(LEN_PIN, initial_value=False)

# map logical direction -> drive device
_in_pwm = _rpwm if IN_IS_RPWM else _lpwm
_out_pwm = _lpwm if IN_IS_RPWM else _rpwm

_lock = threading.Lock()
_state = {"direction": "stop", "speed": 0}  # speed 0..100
_timer: threading.Timer | None = None


def apply(direction: str, speed: int) -> None:
    """direction: 'in' | 'out' | 'stop';  speed: 0..100 (% duty)."""
    global _timer
    speed = max(0, min(100, int(speed)))
    with _lock:
        if _timer:
            _timer.cancel()
            _timer = None
        if direction == "stop" or speed == 0:
            _rpwm.duty(0)
            _lpwm.duty(0)
            _ren.off()  # disable the bridge -- a guaranteed, polarity-independent stop
            _len.off()
            _state.update(direction="stop", speed=0)
            return
        if direction == "in":
            _out_pwm.duty(0)  # zero the opposite first -- never both driven
            _in_pwm.duty(speed)
        elif direction == "out":
            _in_pwm.duty(0)
            _out_pwm.duty(speed)
        else:
            return
        _ren.on()  # enable the bridge only while actively driving
        _len.on()
        _state.update(direction=direction, speed=speed)


def run_for(direction: str, speed: int, seconds: float) -> None:
    global _timer
    seconds = max(0.1, min(MAX_SECONDS, float(seconds)))
    apply(direction, speed)
    with _lock:
        _timer = threading.Timer(seconds, lambda: apply("stop", 0))
        _timer.daemon = True
        _timer.start()


PAGE = """<!doctype html><html lang=en><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1,maximum-scale=1">
<title>Pump Test</title><style>
*{box-sizing:border-box;margin:0;font-family:system-ui,sans-serif}
body{background:#0b1020;color:#e8edff;min-height:100vh;padding:18px;-webkit-user-select:none;user-select:none}
h1{font-size:20px;margin-bottom:4px}.sub{color:#9aa6c9;font-size:13px;margin-bottom:16px}
.row{display:flex;gap:12px;margin:12px 0}
button{flex:1;border:none;border-radius:16px;padding:26px 0;font-size:22px;font-weight:800;color:#fff}
.in{background:#1f9d6b}.out{background:#3b7bd6}.stop{background:#d6453b}
.timed button{background:#1b2440;border:1px solid #2a3556;font-size:16px;padding:16px 0;font-weight:600}
.speed{margin:18px 0}.speed label{font-size:14px;color:#9aa6c9}
input[type=range]{width:100%;height:42px}
.big{font-size:40px;font-weight:800;text-align:center}
.state{background:#141b33;border:1px solid #2a3556;border-radius:14px;padding:14px;margin-top:8px;text-align:center}
.pins{margin-top:18px;color:#6b7794;font-size:12px;line-height:1.6}
</style></head><body>
<h1>Pump test bench</h1><div class=sub>IBT-2 H-bridge &middot; direction + speed check</div>
<div class=speed>
  <label>Speed: <b id=spv>30</b>%</label>
  <input id=sp type=range min=0 max=100 value=30 oninput="onSpeed()">
</div>
<div class=row>
  <button class=in onclick="setDir('in')">&#9650; IN<br><small>fill</small></button>
  <button class=out onclick="setDir('out')">&#9660; OUT<br><small>drain</small></button>
</div>
<div class=row><button class=stop onclick="setDir('stop')">&#9632; STOP</button></div>
<div class="row timed">
  <button onclick="run('in',10)">IN 10s</button>
  <button onclick="run('in',30)">IN 30s</button>
  <button onclick="run('in',60)">IN 60s</button>
  <button onclick="run('out',60)">OUT 60s</button>
</div>
<div class=state>now: <span class=big id=now>STOP</span></div>
<div class=pins>__PINS__</div>
<script>
let dir='stop';
function spd(){return +document.getElementById('sp').value}
function onSpeed(){document.getElementById('spv').textContent=spd(); if(dir!=='stop') setDir(dir)}
async function post(p,b){const r=await fetch(p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});return r.json()}
function show(s){dir=s.direction;document.getElementById('now').textContent=s.direction==='stop'?'STOP':(s.direction.toUpperCase()+' · '+s.speed+'%')}
async function setDir(d){dir=d;show(await post('/api/set',{dir:d,speed:spd()}))}
async function run(d,sec){show(await post('/api/run',{dir:d,speed:spd(),seconds:sec}))}
</script></body></html>"""


def _mode_str() -> str:
    if MODE == "hw":
        return f"HW PWM chip{PWM_CHIP_USED} ch{RPWM_CHAN}/{LPWM_CHAN}"
    return f"sw PWM active-{'high' if ACTIVE_HIGH else 'low'}"


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a):  # quiet
        pass

    def _json(self, obj, code=200):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            pins = (f"RPWM=GPIO{RPWM_PIN} (pin 32) &middot; LPWM=GPIO{LPWM_PIN} (pin 33) "
                    f"&middot; R_EN=GPIO{REN_PIN} &middot; L_EN=GPIO{LEN_PIN} &middot; "
                    f"{_mode_str()} &middot; {PWM_HZ}Hz &middot; "
                    f"'in'={'RPWM' if IN_IS_RPWM else 'LPWM'}")
            body = PAGE.replace("__PINS__", pins).encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        elif self.path == "/api/state":
            self._json(_state)
        else:
            self._json({"error": "not found"}, 404)

    def do_POST(self):
        n = int(self.headers.get("Content-Length", 0))
        try:
            data = json.loads(self.rfile.read(n) or b"{}")
        except Exception:
            data = {}
        if self.path == "/api/set":
            apply(str(data.get("dir", "stop")), data.get("speed", 0))
            self._json(_state)
        elif self.path == "/api/run":
            run_for(str(data.get("dir", "in")), data.get("speed", 0), data.get("seconds", 10))
            self._json(_state)
        else:
            self._json({"error": "not found"}, 404)


def main() -> None:
    srv = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Pump test bench (IBT-2) on http://0.0.0.0:{PORT}")
    if MODE == "hw":
        print(f"  HARDWARE PWM  chip={PWM_CHIP_USED}  RPWM=ch{RPWM_CHAN}(GPIO{RPWM_PIN}) "
              f"LPWM=ch{LPWM_CHAN}(GPIO{LPWM_PIN})  {PWM_HZ}Hz")
    else:
        print(f"  software PWM  RPWM=GPIO{RPWM_PIN} LPWM=GPIO{LPWM_PIN}  {PWM_HZ}Hz  "
              f"active_{'high' if ACTIVE_HIGH else 'low'}  (poor on Pi 5 -- see header)")
    print(f"  R_EN=GPIO{REN_PIN}(p16) L_EN=GPIO{LEN_PIN}(p18)  "
          f"'in'={'RPWM' if IN_IS_RPWM else 'LPWM'}")
    print("Open it in a browser. Ctrl+C stops the pump and releases GPIO.")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        apply("stop", 0)
        for d in (_rpwm, _lpwm, _ren, _len):
            d.close()
        print("\nstopped, GPIO released.")


if __name__ == "__main__":
    main()
