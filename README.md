# pi_pumpsim

A touchscreen "game" for demonstrating **pharmacokinetics (PK)** concepts to kids.
A peristaltic pump (driven by a Raspberry Pi 4) fills a water "avatar" of a person;
the goal is to reach an **optimal dose** (a target window of water level).

## Hardware (target)
- Raspberry Pi 4
- 7" touchscreen
- Peristaltic pump driven via GPIO pins
- Tubing: water reservoir → pump → "person" avatar vessel

## Goals & constraints
- **a)** Develop UI + logic *without* the Pi for the first iteration (run on a dev PC).
- **b)** Modern, "cool" touch-first UI.
- **c)** Pump is **mocked** for the first prototype.
- **d)** Later: debug/test on real hardware.
- **e)** Keyboard interface for debug/admin tasks.
- **f)** Calibration: pump rate, dead volume, target window, accuracy.

## Stack (decided)
| Layer | Choice |
|---|---|
| Frontend | **Svelte + TypeScript + Vite**, SVG/Canvas for avatar & water animation |
| Backend | **Python FastAPI + Uvicorn** — WebSocket telemetry + REST commands |
| Config | **Pydantic Settings** — calibration: pump rate, dead volume, target window, tolerance |
| Pump HAL | `Pump` interface → `MockPump` (dev) / `RealPump` via **`gpiozero`** (Pi), switched by `PUMP_BACKEND=mock\|real` |
| Sim | Pure-logic PK engine, headless-testable |
| Pi runtime | Chromium **kiosk** → FastAPI serves the built bundle |

### Architecture (3 layers)
1. **UI** (Svelte, touch-first) — the game screen
2. **PK simulation engine** — pure logic (dose → level over time, target window). No UI, no hardware.
3. **Pump HAL** — one interface, two backends (mock / real GPIO), selected by env var.

This separation is what lets us build & run the whole thing on Windows now (`MockPump`)
and swap in real GPIO on the Pi later, with the same UI code.

## Status
✅ **Milestone 1 scaffold** — runs on Windows with the mock pump. The mock pump
fills the avatar, the PK engine applies first-order elimination, the live water
level animates over a WebSocket, touch controls + a keyboard admin/calibration
panel work. No Pi required yet.

## Quick start (Windows dev)
```powershell
# one-time setup: venv + backend deps + frontend packages
scripts\setup.ps1

# run backend (:8000) + frontend (:5173) together
scripts\run-dev.ps1
# then open http://localhost:5173
```
Manual / two terminals:
```powershell
# terminal 1 — backend
cd backend; .\.venv\Scripts\Activate.ps1; python -m uvicorn app.main:app --reload --port 8000
# terminal 2 — frontend
cd frontend; npm run dev
```
Tests: `cd backend; .\.venv\Scripts\python.exe -m pytest`

## Controls
- **Touch**: dose chips (5/10/25/50 ml), Deliver, Prime, Stop, Empty, Reset.
- **Keyboard (admin/debug)**: `A` admin panel · `P` prime · `D` dose · `Space` stop ·
  `E` empty · `R` reset · `Esc` close admin.
- **Admin panel** (`A`): live-edit calibration (pump rate, dead volume, capacity,
  target window, clearance) + raw telemetry feed.

## Layout
```
backend/
  app/
    main.py              # FastAPI: REST commands + WebSocket telemetry, serves built UI
    config.py            # Settings (env/.env) + validated Calibration model
    runner.py            # async sim loop: pump → engine → broadcast; command handling
    sim/engine.py        # PK simulation (pure logic, unit-tested)
    hardware/pump.py     # Pump interface (HAL)
    hardware/mock_pump.py
    hardware/real_pump.py   # gpiozero, imported lazily (Pi only)
    hardware/factory.py  # PUMP_BACKEND -> Mock | Real
  tests/                 # pytest (engine + pump)
  requirements.txt / requirements-dev.txt / .env.example
frontend/                # Vite + Svelte + TS
  src/App.svelte         # main screen + keyboard handling
  src/lib/Avatar.svelte  # animated water vessel + target band
  src/lib/AdminPanel.svelte
  src/lib/api.ts         # WebSocket + REST client
scripts/setup.ps1, run-dev.ps1
```

## PK model (current, deliberately simple)
Pump flow first primes the **dead volume** (tubing); overflow reaches the avatar.
The avatar level then decays with **first-order elimination** `dL/dt = -k·L`
(the body clearing the dose). The **target window** `[low, high]` is the
therapeutic range. All tunable live from the admin panel.

## Later: real hardware (on the Pi)
1. `pip install gpiozero rpi-lgpio`
2. Set `PUMP_BACKEND=real` and `PUMP_GPIO_PIN=<bcm>` in `backend/.env`.
3. Build the UI (`cd frontend; npm run build`) — FastAPI then serves it at `:8000`.
4. Calibrate `PUMP_RATE_ML_S` / `DEAD_VOLUME_ML` against the real pump & tubing.
5. Launch Chromium in kiosk mode pointing at `http://localhost:8000`.

The UI/sim code is identical to dev — only the pump backend changes.
