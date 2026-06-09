# pi_pumpsim — SafePolyMed

A touchscreen **"game"** for a university *Tag der offenen Tür* (open day), theme
**SafePolyMed** — *safe polymedication*: drug–drug (DDI), food–drug (FDI) and drug–gene
(DGI) interactions. A **peristaltic pump** (Raspberry Pi + IBT-2 H-bridge) fills a
translucent **3D-printed torso** (~2–3 L) with dyed water; the **water level = the drug
concentration**, and a **fixed taped band** on the torso is the therapeutic window. The
player makes dosing decisions on the touchscreen and the torso fills/drains to show the
result — *the slow pump is the suspense.*

UI is **German-first** (i18n-ready: DE / EN / FR / NL / AR — DE is written, the rest fall
back to German).

> **More docs:** [`CLAUDE.md`](CLAUDE.md) (contributor orientation) ·
> [`docs/game-design.md`](docs/game-design.md) (design) ·
> [`deploy/README.md`](deploy/README.md) (Pi kiosk + pump wiring) ·
> [`docs/calibration.md`](docs/calibration.md) (pump calibration).

## Status
- **All 6 stories built & playable**, each a distinct mechanic (grapefruit photo-grid ·
  Johanniskraut leak-defense · gene triptych · DDI pairing · organ gauge→dial · adherence
  build-a-week). Verified via headless sims + Playwright. DE-only so far.
- **Deployed on the real Pi** (kiosk, landscape, touch); runs **mock** by default.
- **Pump works on real hardware** (IBT-2, hardware PWM, VCC **3.3 V**). `RealPump`, an
  on-screen **admin**, and a **guided calibration wizard** are done. Remaining: calibrate
  the real torso, then a level→pump *model-follower*.

## Architecture (3 layers — build on a PC, swap to the Pi with one env var)
```
Frontend (Svelte) = THE GAME        ──WS/REST──▶   Backend (FastAPI) = "TORSO TWIN"
language/age, story select, play                    owns the level 0–100, moves it toward
flow, scoring, reset. Sends a target.               the target at the pump rate; drives →
                                                    Pump HAL:  MockPump (dev) | RealPump (Pi)
                                                               via PUMP_BACKEND=mock|real
```
The **backend is dumb on purpose** — it just holds the level and moves it toward a
`target`. **All game logic lives in the frontend.** On hardware, `RealPump` maps "move
toward target" → pump IN/OUT over the IBT-2.

## Stack
| Layer | Choice |
|---|---|
| Frontend | **Svelte 5 (runes) + TypeScript + Vite** |
| Backend | **Python 3.13 · FastAPI + Uvicorn** — WebSocket level telemetry + REST commands |
| Config | **Pydantic Settings** (`backend/.env`) |
| Pump HAL | `Pump` → `MockPump` (dev) / `RealPump` (Pi: `gpiozero` enables + **`rpi-hardware-pwm`** speed), switched by `PUMP_BACKEND` |
| Pi runtime | `sway` (rotate→landscape) → Chromium **kiosk**; FastAPI serves the built bundle |

## Quick start (Windows dev — no Pi needed)
[`just`](https://github.com/casey/just) recipes (PowerShell):
```
just setup     # one-time: venv + backend deps + npm install
just dev       # backend :8000 + frontend :5173  → http://localhost:5173
just test      # backend pytest
just check     # svelte-check (frontend type-check)
just build     # production UI bundle
```
`PUMP_BACKEND=mock` (the default) means the torso is simulated on-screen by a corner
**MiniBar** — the whole game runs without hardware.

## How it plays
`Start (language + age) → StorySelect (6 cards) → Briefing → Dose → [Event → Wissensfrage
→ slow drift → Decision]* → Outcome (win / lose + stars) → reset`. The level sits in a
fixed band; an interaction (e.g. grapefruit) makes it **drift** toward a danger line and
the player must pick the right **decision** to stop it. You can lose: over the band =
toxic, under = ineffective.

## Hidden admin + calibration
On the **Start** screen, **triple-tap the SafePolyMed logo** (or press `A`) → a full-screen
admin: hold-to-pump **IN/OUT**, speed, timed runs, live telemetry, **Entleeren/überpumpen +
Kalibrierter Reset**, and a **guided calibration wizard** (deadband + flow curve, saved to
`backend/calibration.json`). Protocol: [`docs/calibration.md`](docs/calibration.md).

## Hardware
- Raspberry Pi **4 or 5**; official **Touch Display 2** (720×1280, used **landscape**
  1280×720 — rotated by `sway`).
- Reversible peristaltic pump via an **IBT-2 (BTS7960)** H-bridge: RPWM/LPWM + enables,
  **hardware PWM** on GPIO12/13, external motor supply.
  ⚠️ **Driver VCC must be 3.3 V, not 5 V.** Full wiring + cable colours:
  [deploy/README.md](deploy/README.md#-pump-wiring--ibt-2-bts7960-h-bridge-dont-skip).

## Deploy on the Pi (kiosk)
```bash
git clone https://github.com/Clinical-Pharmacy-Saarland-University/pi_pumpsim.git
cd pi_pumpsim
deploy/install.sh        # apt deps, venv, build UI, pwm overlay + udev, enable services
sudo reboot              # boots into the app: landscape, full-screen
deploy/update.sh         # later: git pull → rebuild → restart
```
The UI/sim code is identical to dev — only `PUMP_BACKEND` flips to `real`. Full guide
(services, pump wiring, rotation, calibration): [deploy/README.md](deploy/README.md).
