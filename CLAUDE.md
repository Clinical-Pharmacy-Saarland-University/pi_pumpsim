# CLAUDE.md — pi_pumpsim / "SafePolyMed"

Orientation for anyone (human or Claude) working on this repo. For the deep game
design see [`docs/game-design.md`](docs/game-design.md) (current = **§18, v0.6**); for
the Pi/deploy details see [`deploy/README.md`](deploy/README.md).

---

## What this is

A touchscreen **"game"** for a university *Tag der offenen Tür* (open day), theme
**SafePolyMed** — *safe polymedication*: drug–drug (DDI), food–drug (FDI) and drug–gene
(DGI) interactions. A **peristaltic pump** (Raspberry Pi + IBT-2 H-bridge) fills a
translucent **3D-printed torso** (~2–3 L) with dyed water; the water level = the drug
concentration. A **fixed taped band** on the torso = the therapeutic window. The player
makes dosing decisions on the touchscreen; the torso fills/drains to show the result.

UI language **German-first** (i18n-ready: DE/EN/NL/AR; only DE written so far, the rest
fall back to German).

## Where we stand (2026-06)

- **Game (v0.6) is built and playable** in the browser (mock, no Pi needed). Verified
  end-to-end via Playwright.
- **Deployed and running on the real Pi** (kiosk, landscape, touch) in **mock** mode.
- **Pump now runs on the bench** (`tools/pump_test.py`, hardware PWM): clean proportional
  IN/OUT speed. It was a hardware saga — the original driver was dead, the 1st of the replacement
  2-pack was also bad, and VCC had to be **3.3 V not 5 V**; the 2nd unit on 3.3 V works.
  `RealPump` is still a placeholder — next is calibration; see *Open work*.
- Repo: **public** at `github.com/Clinical-Pharmacy-Saarland-University/pi_pumpsim`.

## The big architecture idea

Three layers, deliberately decoupled so we can build/test on a PC and swap to hardware
with **no code change** (just an env var):

```
┌─ Frontend (Svelte) = THE GAME ──────────┐     ┌─ Backend (FastAPI) = "TORSO TWIN" ─┐
│ language/age, story select, the play    │ WS  │ owns the authoritative level (0–100)│
│ flow, questions, decisions, scoring,    │◀────│ moves level → target at the (slow)  │
│ reset-between-runs. Sends a *target*.   │ REST│ pump rate; fixed band + zones.      │
└─────────────────────────────────────────┘────▶│ drives the Pump HAL.                │
                                                 └────────────────────────────────────┘
                                                        │ PUMP_BACKEND = mock | real
                                                        ▼
                                       MockPump (dev)  /  RealPump → IBT-2 → physical torso
```

- **The backend is dumb on purpose.** It just holds the level and moves it toward a
  `target` at a rate (the "digital twin" of the slow torso). **All game logic lives in
  the frontend.** On hardware, `RealPump` maps "move toward target" → pump in/out.
- **dev ↔ production switch = `PUMP_BACKEND=mock|real`** in `backend/.env`. No code change.

## How the game plays (v0.6)

`Start (language + age) → StorySelect (6 cards) → Briefing → Dose → [Event → Wissensfrage
→ slow drift → Decision]* → Outcome (win/lose + stars) → reset → StorySelect`

- **Fixed therapeutic band** (same every story). The drug level sits in the band; an
  **interaction** (e.g. grapefruit) makes it **slowly drift** toward a danger line; the
  player must pick the right **decision** to stop it. *The slow pump is the suspense.*
- **You can lose**: end over the band = toxic, under = ineffective.
- **Hybrid event pool**: a story draws & shuffles its events (+ a harmless "distractor"
  like an apple, to teach discernment) → replayable.
- **Level model** (normalized 0–100): `target = base_dose × Π(interaction factors)`. Band
  `[55,70]`, baseline `42`, critical lines `35`/`80`. Tunables in
  `backend/app/game/controller.py` and `frontend/src/lib/events.ts`.
- **Only 1 of 6 stories is built**: „Die Grapefruit-Falle" (Herr Schmidt / Simvastatin,
  CYP3A4 FDI). The other five are placeholder cards (Johanniskraut, Gene/CYP2D6, DDI,
  Niere/Leber, Adhärenz).
- **Secret admin**: long-press the top-left corner (~1.2 s) or press `A` → manual
  hold-to-pump IN/OUT, stop, reset-to-baseline, live state (for calibration/testing).
- **Device frame**: in the browser the game renders in an exact **1280×720 box** (the Pi
  screen), scaled to fit; on the real Pi it fills the screen with no bezel.
- The physical torso is mocked on-screen by a small **MiniBar** in the corner.

## Repo layout

```
backend/                    Python 3.13, FastAPI + uvicorn
  app/main.py               REST (set_target / reset) + WS (level state); serves built UI
  app/config.py             Settings from .env (PUMP_BACKEND, tick_hz, GPIO pin…)
  app/game/controller.py    LevelController — the torso twin (level→target, band, zones) ★pure, tested
  app/game/runner.py        async loop: tick controller, drive pump, broadcast
  app/hardware/             Pump HAL: pump.py (iface) · mock_pump.py · real_pump.py · factory.py
  tests/                    pytest (controller + mock pump)
frontend/                   Vite + Svelte 5 (runes) + TS
  src/App.svelte            device frame + screen router + MiniBar + admin
  src/lib/game.svelte.ts    THE game store (flow, scoring, target=base×factors)  ★
  src/lib/controller… N/A   (level lives in backend)
  src/lib/locale.svelte.ts  i18n: t() with German fallback; all UI strings  ★ (edit copy here)
  src/lib/events.ts         event pool (grapefruit, apfel) + dose levels
  src/lib/stories.ts        the 6 story cards
  src/lib/api.ts            WS connect + setTarget/reset
  src/lib/MiniBar.svelte    small on-screen mock of the physical torso (corner bar)
  src/lib/screens/          Start, StorySelect, Briefing, Play, Outcome, Resetting, Admin
deploy/                     Pi kiosk: install.sh, update.sh, systemd units, sway-kiosk.config
tools/pump_test.py          standalone IBT-2 pump bench (no project deps)
docs/game-design.md         living design doc (v0.6 = §18); docs/mockups/ visual refs
docs/calibration.md         pump + torso calibration protocol (run from the on-screen admin)
justfile                    dev task runner
```

## Dev workflow (Windows)

`just` recipes (PowerShell, `-NoProfile`):

```
just setup     # one-time: venv + backend deps + npm install
just dev       # backend :8000 + frontend :5173 (open http://localhost:5173)
just down      # kill stray dev servers (8000/5173)
just test      # backend pytest
just check     # svelte-check (frontend type-check)
just build     # build the UI bundle (backend serves frontend/dist in prod)
just tag v0.3.0  # annotated git tag + push
```

- Backend reads `backend/.env` (copy from `.env.example`). `PUMP_BACKEND=mock` for dev.
- Frontend (Vite) proxies `/api` + `/ws` to the backend, so same-origin URLs work.

## Hardware & deployment

- **Pi** (4 or 5 — same 40-pin header) running **Raspberry Pi OS Lite, Debian _trixie_,
  Python 3.13**. Host `pumpsim.local`, user `dose`. SSH key alias `pumpsim`. **`sudo`
  needs a password** (can't run privileged steps over SSH non-interactively).
- **Display**: official **Touch Display 2** (720×1280 portrait), used **landscape**.
  Rotation is done in the compositor (**sway** `output * transform 90`), *not* the
  kernel — `cage` couldn't rotate, so the kiosk uses **sway**.
- **Pump driver = IBT-2 (BTS7960) H-bridge.** Pins (BCM/physical, with cable colours):
  RPWM=GPIO12/p32 🟢 · LPWM=GPIO13/p33 ⚪ · R_EN=GPIO23/p16 🔵 · L_EN=GPIO24/p18 🟡 ·
  VCC=**3.3V**/p1 🔴 · GND=p14 ⚫. Motor on its own external supply (B+/B−, M+/M−).
  ⚠️ **VCC must be 3.3 V, not 5 V** — at 5 V the BTS7960 input threshold sits above the Pi's
  3.3 V GPIO HIGH, so speed control goes haywire (cost us a long debug — see the memory note).
- **Pump speed = hardware PWM** (GPIO12/13 are PWM-capable; software/lgpio PWM is too jittery on
  the Pi 5). Enable with `dtoverlay=pwm-2chan,pin=12,func=4,pin2=13,func2=4` in
  `/boot/firmware/config.txt` + `sudo pip3 install rpi-hardware-pwm --break-system-packages`
  (chip auto-detects → `pwmchip0` on trixie/6.12). Drive = standard **active-high**: one PWM at
  the duty, the other at 0; enables HIGH to run, **enable LOW = stop**. (`pigpio` won't work on Pi 5.)
- **Deploy** (GitHub → Pi): `git clone … && deploy/install.sh && sudo reboot`; update with
  `deploy/update.sh` (pull → rebuild → restart). Two systemd services: `pumpsim-backend`
  (uvicorn) and `pumpsim-kiosk` (sway → Chromium `--kiosk`).
- **trixie gotchas (already handled)**: browser pkg is `chromium` (not `chromium-browser`);
  `lgpio`/`gpiozero` come from **apt** (`python3-lgpio`/`python3-gpiozero`) with the venv
  made `--system-site-packages` (no pip compile of lgpio).

## Conventions / notes for working here

- **German copy lives in `frontend/src/lib/locale.svelte.ts`** behind `t('key')`. Never
  hard-code user-facing text in components. Other locales fall back to German.
- Svelte 5 **runes**; reactive stores are `*.svelte.ts` (e.g. `game.svelte.ts`).
- Keep the **backend dumb** (level/pump only); put game logic in the frontend.
- Commit style: conventional-ish (`feat(ui): …`, `fix(deploy): …`). Commit/push only when
  asked or when it's a natural checkpoint. Don't commit `node_modules/`, `.venv/`, `dist/`.
- Git identity: **Dominik Selzer <dominik.selzer@uni-saarland.de>** (the user's global git
  config — use it; no local override).

## Open work (rough priority)

1. **Pump bring-up** — ✅ bench (`tools/pump_test.py`) + `RealPump` (hardware PWM, 3.3 V VCC,
   active-high, enable-gated) + on-screen **admin** (triple-tap the logo: jog IN/OUT, timed runs,
   ml/s calibration) all done. Remaining: (a) **calibrate** per
   [`docs/calibration.md`](docs/calibration.md) (deadband + ml/s, via the admin); (b) build the
   **model-follower** in the runner (drive the pump so the real torso tracks the computed target).
2. **Reset-between-runs on real hardware**: the drain takes real time (big torso, slow
   pump) — the „Patient wird vorbereitet …" screen already handles this; tune the rate.
3. **More stories** (2–6): Johanniskraut (induction ↓), Gene/CYP2D6 (DGI), a DDI, organ
   impairment, adherence. Each is data in `events.ts` + `stories.ts` (+ copy in locale).
4. **i18n**: real EN / NL / AR dictionaries (AR also needs RTL handling).
5. **Feel-tuning** (drift speed, band width, dose levels) once the real torso is in.
6. Optional: an LED strip inside the torso (green/red glow), sound, age-adaptive wording.
