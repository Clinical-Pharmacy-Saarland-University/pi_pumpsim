# pi_pumpsim / "SafePolyMed"

Orientation for anyone (human or Codex) working on this repo. For the deep game
design see [`docs/game-design.md`](docs/game-design.md) (current framework = **§19**, v0.6); for
the Pi/deploy details see [`deploy/README.md`](deploy/README.md).

---

## What this is

A touchscreen **"game"** for a university _Tag der offenen Tür_ (open day), theme
**SafePolyMed** — _safe polymedication_: drug–drug (DDI), food–drug (FDI) and drug–gene
(DGI) interactions. A **peristaltic pump** (Raspberry Pi + IBT-2 H-bridge) fills a
translucent **3D-printed torso** (~2–3 L) with dyed water; the water level = the drug
concentration. A **fixed taped band** on the torso = the therapeutic window. The player
makes dosing decisions on the touchscreen; the torso fills/drains to show the result.

UI language **German-first** (i18n-ready: DE/EN/NL/AR; only DE written so far, the rest
fall back to German).

## Where we stand (2026-06)

- **All 6 stories built & playable** (each a distinct mechanic) in the browser (mock) and
  on the Pi (kiosk). Verified via headless sims + Playwright. DE-only (others fall back).
- **Deployed on the real Pi** (kiosk, landscape, touch); runs **mock** by default
  (`PUMP_BACKEND=real` for hardware).
- **Pump works on real hardware** (IBT-2, hardware PWM, VCC **3.3 V**): `RealPump`, an
  on-screen **admin** (triple-tap the logo: jog IN/OUT, timed runs, live telemetry,
  Entleeren/überpumpen + Kalibrierter Reset) and a **guided calibration wizard** are done.
  Remaining: run calibration on the real torso + a level→pump model-follower; see _Open work_.
  (Hardware saga: original driver dead, 1st of the replacement 2-pack bad, and VCC had to be
  **3.3 V not 5 V** — the 2nd unit on 3.3 V works.)
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
  player must pick the right **decision** to stop it. _The slow pump is the suspense._
- **You can lose**: end over the band = toxic, under = ineffective.
- **Hybrid event pool**: a story draws & shuffles its events (+ a harmless "distractor"
  like an apple, to teach discernment) → replayable.
- **Level model** (normalized 0–100): `target = base_dose × Π(interaction factors)`. Band
  `[55,70]`, baseline `42`, critical lines `35`/`80`. Tunables in
  `backend/app/game/controller.py` and `frontend/src/lib/events.ts`.
- **All 6 stories built**, each a distinct mechanic (grapefruit photo-grid · Johanniskraut
  leak-defense · gene triptych · DDI pairing · organ gauge→dial · adherence build-a-week).
  Story 1 uses the v1 engine; 2–6 are self-contained "v2" components (`game.phase==='play2'`,
  one `screens/<Id>Play.svelte` each). See `docs/stories/STATUS.md`.
- **Secret admin** (full-screen): **triple-tap the SafePolyMed logo** (or press `A`) → jog
  IN/OUT (hold), speed, timed runs, live telemetry, **Entleeren/überpumpen + Kalibrierter
  Reset**, and the **guided calibration wizard**. `Esc` closes. (Double-tap the footer credit
  also opens it.)
- **Device frame**: in the browser the game renders in an exact **1280×720 box** (the Pi
  screen), scaled to fit; on the real Pi it fills the screen with no bezel.
- **Virtual torso (dev)**: beside the dev frame a **VirtualTorso** panel shows the physical
  twin in **ml** (ml ruler, band, target marker, live flow), using the calibrated
  `torso_volume_ml` (default **1.8 L**) + pump rates (default **40 ml/s @100 %**) — watch
  the pump fill/drain on a PC without hardware. Not rendered on the Pi (exact 1280×720).

## Repo layout

```
backend/                    Python 3.13, FastAPI + uvicorn
  app/main.py               REST: set_target/reset + /api/admin/* (jog · timed · empty ·
                            calibrated_reset · calibration GET/POST) + WS (level state); serves UI
  app/config.py             Settings from .env (PUMP_BACKEND, tick_hz, IBT-2 pins, pump rate…)
  app/game/controller.py    LevelController — the torso twin (level→target, band, zones) ★pure, tested
  app/game/runner.py        async loop: tick controller, drive pump; manual mode + pump sequences
  app/game/calibration.py   load/persist calibration.json (deadband, rates, torso volume, reset params)
  app/hardware/             Pump HAL: pump.py (iface) · mock_pump.py · real_pump.py (IBT-2 hw-PWM) · factory.py
  calibration.default.json  committed baseline (per-machine override = calibration.json, gitignored)
  tests/                    pytest (controller · mock pump · runner/sequence · calibration)
frontend/                   Vite + Svelte 5 (runes) + TS
  src/App.svelte            device frame + screen router + dev VirtualTorso panel; routes to Admin
  src/lib/game.svelte.ts    THE game store (flow, scoring, target=base×factors)  ★
  src/lib/locale.svelte.ts  i18n: t() with German fallback; all UI strings  ★ (edit copy here)
  src/lib/events.ts         event pool (grapefruit, apfel) + dose levels
  src/lib/stories.ts        the 6 story cards     ·  src/lib/flow.ts  shared v2 flow logic
  src/lib/api.ts            WS connect + setTarget/reset + admin/* (pump, calibration)
  src/lib/calib.ts          pure calibration math + types (tested via sim/calib.sim.ts)
  src/lib/NumPad.svelte     on-screen numeric keypad (the kiosk has no OS keyboard)
  src/lib/VirtualTorso.svelte  dev-only ml twin of the physical torso (outside the Pi frame)
  src/lib/screens/          Start, StorySelect, Briefing, Play, {Ddi,Organ,Gene,Woche,Jk}Play,
                            Outcome, Resetting, Admin, CalibWizard
deploy/                     Pi kiosk: install.sh (+ pwm overlay/udev), update.sh, systemd units, sway config
tools/pump_test.py          standalone IBT-2 pump bench (no project deps)
docs/game-design.md         living design doc (§19); docs/stories/ specs + STATUS; docs/mockups/
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
just tag 0.0.1-alpha  # write VERSION, commit, annotated tag v0.0.1-alpha + push
```

- Backend reads `backend/.env` (copy from `.env.example`). `PUMP_BACKEND=mock` for dev.
- Frontend (Vite) proxies `/api` + `/ws` to the backend, so same-origin URLs work.

## Hardware & deployment

- **Pi** (4 or 5 — same 40-pin header) running **Raspberry Pi OS Lite, Debian _trixie_,
  Python 3.13**. Host `pumpsim.local`, user `dose`. SSH key alias `pumpsim`. **`sudo`
  needs a password** (can't run privileged steps over SSH non-interactively).
- **Display**: official **Touch Display 2** (720×1280 portrait), used **landscape**.
  Rotation is done in the compositor (**sway** `output * transform 90`), _not_ the
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

1. **Pump calibration + control** — ✅ bench (`tools/pump_test.py`), `RealPump` (hardware PWM,
   3.3 V VCC, active-high, enable-gated), on-screen **admin**, **guided calibration wizard**, and
   the **home-then-dose reset** (empty/overpump → prime a known volume) are done. Remaining:
   (a) run the wizard on the **real torso** and commit the numbers to `calibration.default.json`;
   (b) the **model-follower** in the runner (drive the pump so the real torso tracks the computed
   target, using deadband + per-direction rate); (c) wire **Kalibrierter Reset** into the
   „Patient wird vorbereitet …" between-runs screen. Protocol: [`docs/calibration.md`](docs/calibration.md).
2. **i18n**: real EN / FR / NL / AR dictionaries (AR also needs RTL); verify drug/Fachinfo wording.
3. **Feel-tuning** (drift speed, band width, dose levels) once the real torso is calibrated.
4. Optional: an LED strip inside the torso (green/red glow), sound, age-adaptive wording.
