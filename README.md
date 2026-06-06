# pi_pumpsim

A touchscreen "game" for demonstrating **pharmacokinetics (PK)** concepts to kids.
A peristaltic pump (driven by a Raspberry Pi 4) fills a water "avatar" of a person;
the goal is to reach an **optimal dose** (a target window of water level).

## Hardware (target)
- Raspberry Pi 4
- **Raspberry Pi Touch Display 2** (7", 720×1280 native portrait), mounted **landscape ⇒ 1280×720** (rotated 90° via the `vc4-kms-dsi-ili9881-7inch` overlay)
- Peristaltic pump driven via GPIO pins
- Tubing: water reservoir → pump → "person" avatar vessel

> The UI is designed/verified for **1280×720 landscape**. It's responsive (and
> stacks to a portrait layout if ever run portrait), but landscape is primary.

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
✅ **Milestone 2 — „Dr. Dosis" first playable** (mock pump, browser, no Pi). The full
game loop runs: Attract → Intro → Play → Result → „Geschafft!" across a 3-round
**„Hilf der Familie!"** arc (Max/Paracetamol · Eva/Simvastatin+Grapefruit · Opa/Metoprolol).
Hold-to-infuse dosing, a live „Spiegel" gauge with the therapeutic window, event
system (DDI/DGI/FDI modulating clearance), well-being + stars, German UI (i18n-ready),
hidden admin (`A`). See [docs/game-design.md](docs/game-design.md).

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
- **Play**: tap to start → **hold the syringe** (HALTEN) to dose; keep the level in the
  green band as it drains and events (grapefruit etc.) disturb it.
- **Hidden admin** (`A` / `Esc`): jump to any round + live telemetry feed. Never shown
  during normal play.

## Layout
```
backend/
  app/
    main.py                # FastAPI: game REST + WebSocket GameState, serves built UI
    config.py              # Settings (env/.env)
    game/scenarios.py      # the 3-round arc + PK params (bands, clearance, events)
    game/engine.py         # GameEngine — pure round simulation (unit-tested)
    game/runner.py         # async loop: engine ↔ pump, broadcast GameState
    hardware/pump.py       # Pump interface (HAL): mock_pump / real_pump (gpiozero) / factory
  tests/                   # pytest (game engine + pump)
frontend/                  # Vite + Svelte 5 + TS
  src/App.svelte           # screen routing + keyboard (admin)
  src/lib/game.svelte.ts   # client flow store (which screen, round progression)
  src/lib/locale.ts        # German strings + t()  (i18n-ready)
  src/lib/{Gauge,HoldButton,Mascot,PatientFace}.svelte
  src/lib/screens/{Attract,Intro,Play,Result,Summary,Admin}.svelte
scripts/setup.ps1, run-dev.ps1   ·   deploy/  (Pi kiosk)
```

## PK model (current, deliberately simple)
Pump flow first primes the **dead volume** (tubing); overflow reaches the avatar.
The avatar level then decays with **first-order elimination** `dL/dt = -k·L`
(the body clearing the dose). The **target window** `[low, high]` is the
therapeutic range. All tunable live from the admin panel.

## Deploy on the Pi (kiosk)
Pi OS Bookworm Lite + `cage` (single-app Wayland kiosk) + systemd. Code via GitHub.
```bash
git clone https://github.com/Clinical-Pharmacy-Saarland-University/pi_pumpsim.git
cd pi_pumpsim
deploy/install.sh        # apt deps, venv, build UI, install + enable services
# rotate the Touch Display 2 to landscape (display + touch):
echo 'dtoverlay=vc4-kms-dsi-ili9881-7inch,rotation=90,swapxy,invx' | sudo tee -a /boot/firmware/config.txt
sudo reboot              # boots straight into the app, full-screen
deploy/update.sh         # later: git pull → rebuild → restart
```
The UI/sim code is identical to dev — only `PUMP_BACKEND` flips to `real`.
**Full guide (services, pump wiring, display+touch rotation, calibration):**
[deploy/README.md](deploy/README.md).
