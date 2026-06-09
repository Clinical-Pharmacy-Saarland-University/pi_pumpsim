# Pump calibration protocol — SafePolyMed torso

How to characterise the real peristaltic pump + torso so the game's on-screen level
(0–100) maps to physical water, and so fills/drains/resets take a sensible time.

You drive everything from the **on-screen admin panel** (no SSH): on the Start screen,
**triple-tap the SafePolyMed logo**. The panel has a speed slider, hold-to-pump IN/OUT,
timed auto-stop runs (15/30/60 s), a **flow-measurement helper**, and live telemetry.

> Reference levels (from `backend/app/game/controller.py`): capacity `100`, baseline `42`,
> therapeutic band `55–70` (the taped band), critical lines `35` (low) / `80` (high).

---

## What we measure (the outputs)
| symbol | meaning | where it goes |
|---|---|---|
| `deadband_in` / `deadband_out` | lowest duty % at which the pump actually moves liquid | future model-follower min-duty; record here for now |
| `rate_in` / `rate_out` | flow in ml/s at 100 % duty, fill vs drain (drain is often slower) | `PUMP_RATE_ML_S` in `backend/.env` (use `rate_in`); record both |
| `capacity_ml` | ml from "empty" (level 0) to "full" (level 100) | torso mapping + game-feel tuning |
| `ml_per_unit` | ml per one level-unit = `capacity_ml / 100` | converts ml ↔ level |
| `t_reset` | seconds for a full drain (reset between runs) | tune the "Patient wird vorbereitet…" screen |

---

## 0. Setup & safety (do every time)
1. Motor supply on (B+/B−), tubing connected, torso seated, **drain path clear**, towel down.
2. `backend/.env`: `PUMP_BACKEND=real` → `sudo systemctl restart pumpsim-backend`.
3. Open the admin (triple-tap the logo). The badge must read **REAL** (not MOCK).
4. Have ready: a **measuring cup / graduated container**, the torso's volume scale (or a ruler),
   and a marker. The admin's **timed runs auto-stop**, so you don't need a separate stopwatch.

## 1. Direction & prime check
- Tap-hold **IN** briefly → water should go **into** the torso (level rises). Tap-hold **OUT** → drains.
- If reversed: set `PUMP_IN_IS_RPWM=true` in `backend/.env` (restart) **or** swap the motor leads M+/M−.
- **Prime**: run IN until the tubing is full and air is purged before measuring anything.

## 2. Deadband — minimum duty (IN and OUT)
1. Set the speed slider low (~10 %), hold **IN**. No movement? Raise +5 % and retry.
2. The lowest % that produces **steady** flow = `deadband_in`. Record it.
3. Repeat with **OUT** → `deadband_out`.
- Pick an **operating duty** comfortably above both (e.g. deadband + 20 %), but measure rates at **100 %** (below).

## 3. Flow rate IN @ 100 % (`rate_in`)
Most accurate = pump into a measuring cup:
1. Direct the pump **output into the measuring cup** (or note the torso's volume scale).
2. Speed = **100 %**. Press a timed run (e.g. **IN 30 s**) — it auto-stops.
3. Read the volume delivered (ml). In the admin **Durchfluss** helper, enter **Volumen** + **Dauer (30)** → it shows **ml/s**.
4. Repeat **3×** and average (the helper shows each; average by eye or re-enter the mean).
5. Record `rate_in`. Tap **„Messung als Rate speichern"** to set it live, then write it into
   `backend/.env` as `PUMP_RATE_ML_S=<rate_in>` so it persists across restarts.

## 4. Flow rate OUT @ 100 % (`rate_out`)
1. Fill the torso to a known level, then run **OUT 30 s** at 100 % into the measuring cup.
2. Read ml → enter in the helper → ml/s. Repeat 3×, average → `rate_out`.
3. Record it (drain is usually slower; we'll use direction-specific rates in the model-follower later).

## 5. Torso volume mapping (level 0 ↔ 100)
Goal: the **taped band** must sit where the game thinks `55–70` is.
1. Decide physical **empty = level 0** and **full = level 100** (e.g. a safe max fill line).
2. From empty, pump IN and note the **ml to reach the lower tape** (= level 55) and **ml across the band**
   (lower→upper tape = 55→70). From "across the band = 15 units":  `ml_per_unit ≈ (band ml) / 15`.
3. `capacity_ml ≈ ml_per_unit × 100`. Sanity-check against the torso's nominal volume (~2–3 L).
4. If the band ends up in the wrong place, re-tape so the lower tape sits at `ml_per_unit × 55` from empty.

## 6. Derived timings (game feel)
- `t_reset` (full drain) ≈ `capacity_ml / rate_out` — set the reset screen to comfortably exceed this.
- `t_dose` (baseline→band) ≈ `ml_per_unit × (55 − 42) / rate_in`.
- Drift/suspense across the band is **on-screen** (the taped band is fixed); tune the controller rate
  (`LevelConfig.rate`, units/s) + the event drift in `frontend/src/lib/events.ts` so the *visual* time
  feels right — it doesn't have to equal the physical pump time.

## 7. Where the numbers land
| value | file / field |
|---|---|
| `rate_in` (→ `PUMP_RATE_ML_S`) | `backend/.env` (live: admin „Rate speichern") |
| `deadband_in/out`, `rate_out`, `capacity_ml`, `ml_per_unit` | **record in the results table below** (used by the upcoming model-follower) |
| on-screen drift / dose pace | `backend/app/game/controller.py` (`LevelConfig.rate`), `frontend/src/lib/events.ts` |
| reset drain time | the „Patient wird vorbereitet…" (Resetting) screen |

---

## Results (fill in during the run)
| quantity | value | notes |
|---|---|---|
| operating duty (%) | | comfortably above deadband |
| `deadband_in` (%) | | |
| `deadband_out` (%) | | |
| `rate_in` (ml/s @100 %) | | mean of 3 |
| `rate_out` (ml/s @100 %) | | mean of 3 |
| `capacity_ml` (0→100) | | |
| `ml_per_unit` | | capacity/100 |
| band width (ml, 55→70) | | |
| `t_reset` (s, full drain) | | capacity/rate_out |
| IN/OUT correct? | | else flip PUMP_IN_IS_RPWM |

---

## Admin quick-reference
- **Open:** triple-tap the logo (Start screen). **Close:** ✕ or `Esc`.
- **Jog:** hold **IN**/**OUT**; the **speed slider** adjusts live while held; **STOP** halts.
- **Timed:** IN/OUT 15/30/60 s buttons auto-stop — use these for flow measurement.
- **Durchfluss helper:** enter measured **Volumen (ml)** + **Dauer (s)** → **ml/s**; „Als Rate speichern" pushes it live.
- **Telemetry:** live level, zone, pump direction/speed, flow, MOCK/REAL badge.

> Note: the backend currently stores a single `PUMP_RATE_ML_S`. Direction-specific
> rates (`rate_in` vs `rate_out`) and per-duty flow curves are a planned addition for the
> level→pump model-follower; record both now so that work has real numbers.
