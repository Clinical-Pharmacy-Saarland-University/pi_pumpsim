#!/usr/bin/env python3
"""Standalone pump test bench — drive a reversible (DIR + PWM) pump and check
direction + speed, independent of the game. Touch/web UI, no project deps.

PINS (BCM / physical header):
    SPEED (PWM) = GPIO12  (pin 32, hardware PWM0)
    DIR         = GPIO16  (pin 36)
    GND         = pin 34   <-- must be common with the driver's GND

Only logic signals go to the driver; the motor power stays on its external supply.
Override pins/behaviour via env: PUMP_PWM_PIN, PUMP_DIR_PIN, PUMP_DIR_IN_HIGH,
PUMP_PWM_HZ, PUMP_TEST_PORT.

Run on the Pi (no sudo needed — user is in the 'gpio' group):
    python3 ~/pi_pumpsim/tools/pump_test.py
Then open  http://pumpsim.local:8001  (from your PC) or http://localhost:8001 (Pi).
Ctrl+C stops the pump and exits.
"""
from __future__ import annotations

import json
import os
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

os.environ.setdefault("GPIOZERO_PIN_FACTORY", "lgpio")

PWM_PIN = int(os.environ.get("PUMP_PWM_PIN", "12"))
DIR_PIN = int(os.environ.get("PUMP_DIR_PIN", "16"))
DIR_IN_HIGH = os.environ.get("PUMP_DIR_IN_HIGH", "1") == "1"  # DIR level that means "in"
PWM_HZ = int(os.environ.get("PUMP_PWM_HZ", "1000"))
PORT = int(os.environ.get("PUMP_TEST_PORT", "8001"))
MAX_SECONDS = 120  # safety cap on timed runs

try:
    from gpiozero import DigitalOutputDevice, PWMOutputDevice
except Exception as e:  # pragma: no cover - Pi-only
    raise SystemExit(f"gpiozero not available ({e}). Run this on the Pi.")

_dir = DigitalOutputDevice(DIR_PIN)
_pwm = PWMOutputDevice(PWM_PIN, frequency=PWM_HZ)

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
            _pwm.value = 0.0
            _state.update(direction="stop", speed=0)
            return
        if direction == "in":
            _dir.value = 1 if DIR_IN_HIGH else 0
        elif direction == "out":
            _dir.value = 0 if DIR_IN_HIGH else 1
        else:
            return
        _pwm.value = speed / 100.0
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
kbd{background:#1b2440;border:1px solid #2a3556;border-radius:6px;padding:1px 6px}
</style></head><body>
<h1>Pump test bench</h1><div class=sub>direction + speed check (reversible DIR+PWM pump)</div>
<div class=speed>
  <label>Speed: <b id=spv>50</b>%</label>
  <input id=sp type=range min=0 max=100 value=50 oninput="onSpeed()">
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
async function run(d,sec){document.getElementById('sp').value=spd();show(await post('/api/run',{dir:d,speed:spd(),seconds:sec}))}
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
            pins = (f"SPEED(PWM)=GPIO{PWM_PIN} (pin 32) &middot; DIR=GPIO{DIR_PIN} (pin 36) "
                    f"&middot; GND=pin 34 &middot; PWM {PWM_HZ}Hz &middot; 'in'=DIR "
                    f"{'HIGH' if DIR_IN_HIGH else 'LOW'}")
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
    print(f"Pump test bench on http://0.0.0.0:{PORT}")
    print(f"  SPEED(PWM)=GPIO{PWM_PIN} (pin 32)  DIR=GPIO{DIR_PIN} (pin 36)  GND=pin 34")
    print(f"  PWM={PWM_HZ}Hz  'in'=DIR {'HIGH' if DIR_IN_HIGH else 'LOW'}")
    print("Open it in a browser. Ctrl+C stops the pump and exits.")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        apply("stop", 0)
        _pwm.close()
        _dir.close()
        print("\nstopped, GPIO released.")


if __name__ == "__main__":
    main()
