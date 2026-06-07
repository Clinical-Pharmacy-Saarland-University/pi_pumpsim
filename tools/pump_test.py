#!/usr/bin/env python3
"""Standalone pump test bench for an IBT-2 (BTS7960) H-bridge driver.

Check pump direction + speed independently of the game, from a touch/web UI.

The IBT-2 uses TWO pwm inputs (one per direction) + two enables:
    RPWM = GPIO12 (pin 32, PWM0)   one direction's speed
    LPWM = GPIO13 (pin 33, PWM1)   other direction's speed
    R_EN = GPIO23 (pin 16)         enable (held high)
    L_EN = GPIO24 (pin 18)         enable (held high)
    VCC  = 5V  (pin 2)             driver logic supply
    GND  = GND (pin 6)             common ground with the Pi
B+/B- = external motor supply ; M+/M- = pump motor. (R_IS/L_IS: leave unconnected.)

Direction: drive ONE pwm at the wanted duty, the other at 0. Never both > 0.
'in' uses RPWM by default; if in/out come out swapped, set PUMP_IN_IS_RPWM=0
(or swap the two motor leads M+/M-).

Run on the Pi (no sudo; user is in the 'gpio' group):
    python3 ~/pi_pumpsim/tools/pump_test.py
Then open  http://pumpsim.local:8001  from your PC. Ctrl+C stops + releases GPIO.
Override via env: PUMP_RPWM_PIN PUMP_LPWM_PIN PUMP_REN_PIN PUMP_LEN_PIN
                  PUMP_IN_IS_RPWM PUMP_PWM_HZ PUMP_TEST_PORT
"""
from __future__ import annotations

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
PWM_HZ = int(os.environ.get("PUMP_PWM_HZ", "1000"))
PORT = int(os.environ.get("PUMP_TEST_PORT", "8001"))
MAX_SECONDS = 120  # safety cap on timed runs

try:
    from gpiozero import DigitalOutputDevice, PWMOutputDevice
except Exception as e:  # pragma: no cover - Pi-only
    raise SystemExit(f"gpiozero not available ({e}). Run this on the Pi.")

_rpwm = PWMOutputDevice(RPWM_PIN, frequency=PWM_HZ)
_lpwm = PWMOutputDevice(LPWM_PIN, frequency=PWM_HZ)
_ren = DigitalOutputDevice(REN_PIN)
_len = DigitalOutputDevice(LEN_PIN)
_ren.on()  # enable both half-bridges; we steer via the PWM pins
_len.on()

# map logical direction -> (forward_pwm, reverse_pwm) devices
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
            _rpwm.value = 0.0
            _lpwm.value = 0.0
            _state.update(direction="stop", speed=0)
            return
        if direction == "in":
            _out_pwm.value = 0.0  # zero the opposite first — never both high
            _in_pwm.value = speed / 100.0
        elif direction == "out":
            _in_pwm.value = 0.0
            _out_pwm.value = speed / 100.0
        else:
            return
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
  <button class=in onclick="setDir('in')">▲ IN<br><small>fill</small></button>
  <button class=out onclick="setDir('out')">▼ OUT<br><small>drain</small></button>
</div>
<div class=row><button class=stop onclick="setDir('stop')">■ STOP</button></div>
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
                    f"PWM {PWM_HZ}Hz &middot; 'in'={'RPWM' if IN_IS_RPWM else 'LPWM'}")
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
    print(f"  RPWM=GPIO{RPWM_PIN}(pin32) LPWM=GPIO{LPWM_PIN}(pin33) "
          f"R_EN=GPIO{REN_PIN}(pin16) L_EN=GPIO{LEN_PIN}(pin18)")
    print(f"  PWM={PWM_HZ}Hz  'in'={'RPWM' if IN_IS_RPWM else 'LPWM'}")
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
