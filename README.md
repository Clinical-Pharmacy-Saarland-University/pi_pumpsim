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
🚧 Stack chosen. Next: scaffold the skeleton (backend layers + Svelte shell + dev scripts).

## Layout (planned)
```
backend/
  app/
    main.py            # FastAPI: REST + WebSocket
    config.py          # Pydantic settings / calibration
    sim/engine.py      # PK simulation (pure)
    hardware/pump.py   # Pump interface
    hardware/mock_pump.py
    hardware/real_pump.py   # gpiozero, imported lazily
  tests/
frontend/              # Vite + Svelte + TS
  src/
scripts/run-dev.ps1    # start backend + frontend for Windows dev
data/.gitkeep
```
