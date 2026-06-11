# Pump calibration protocol — SafePolyMed torso

How to characterise the real peristaltic pump + torso so the game's on-screen level
(0–100) maps to physical water, and so fills/drains/resets take a sensible time.

You drive everything from the **on-screen admin panel** (no SSH): on the Start screen,
**triple-tap the SafePolyMed logo**. The panel has a speed slider, hold-to-pump IN/OUT,
timed auto-stop runs (15/30/60 s), the **guided calibration wizard**, and live telemetry.

> Reference levels (from `backend/app/game/controller.py`): capacity `100`, baseline `42`,
> therapeutic band `55–70` (the taped band), critical lines `35` (low) / `80` (high).

---

## Quick path — the guided wizard (recommended)
Admin → **„Geführte Kalibrierung starten"**. It drives the pump and only asks you to read the
scale; results save to `backend/calibration.json` (loaded on boot; `rate_in` applied live):
0. **Prime:** on the intro, **hold IN / OUT** to fill the tubes before measuring.
1. **Totband (IN, then OUT):** adjust the duty (−5/−1/+1/+5), **hold „Testen"** until the rotor
   *just* starts turning, then **Übernehmen** → captures `deadband_in` / `deadband_out`.
2. **Durchfluss — all INs (100 % / 70 % / 40 %), then all OUTs:** pick **5 s or 10 s**, container on
   the scale, **Messlauf starten** (auto-stops), type the **weighed grams** (1 g ≈ 1 ml) → ml/s.
   Keep runs short — at full speed the torso empties fast.
3. **Überprüfen & Speichern:** check deadbands + rates + samples, then **Speichern**.

### Where it's stored (and how to copy it)
The wizard writes `backend/calibration.json` on the Pi: deadbands, `rate_in`/`rate_out`, the
duty→flow `samples`, and `dead_space_ml`. It's **per-machine + gitignored**, loaded on boot
(`rate_in` is applied to the pump). To inspect or back it up:
- `cat ~/pi_pumpsim/backend/calibration.json`
- `scp -i ~/.ssh/pumpsim dose@<pi-ip>:~/pi_pumpsim/backend/calibration.json .`
- **Default in git:** the committed baseline lives in `backend/app/game/calibration.py` (the
  `DEFAULT` dict), used when no local `calibration.json` exists. To make your measured numbers the
  default for every machine, paste the values from your `calibration.json` into `DEFAULT` and commit.

The manual steps below are the underlying procedure — use them by hand or to cross-check a number.

---

## What we measure (the outputs)
| symbol | meaning | where it goes |
|---|---|---|
| `deadband_in` / `deadband_out` | lowest duty % at which the pump actually moves liquid | future model-follower min-duty; record here for now |
| `rate_in` / `rate_out` | flow in ml/s at 100 % duty, fill vs drain (drain is often slower) | `calibration.json` (wizard saves both; `rate_in` applied to the pump live) |
| `torso_volume_ml` | ml from "empty" (level 0) to "full" (level 100) | `calibration.json` (admin → Entleeren/Reset → „Torso-Volumen"); drives the ml mapping + the dev **virtual torso** |
| `ml_per_unit` | ml per one level-unit = `torso_volume_ml / 100` | converts ml ↔ level |
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

## 2. Deadband — minimum duty where the rotor turns (IN and OUT)
A peristaltic pump is positive-displacement, so liquid moves the instant the **rotor turns** — the
"deadband" is simply the lowest duty at which the motor reliably **starts spinning** (below it, it
stalls/hums). Find it by sight/feel, not by waiting for water:
1. Set a low duty (~10 %), hold to test. Not turning? +5 % and retry until the rotor *just* turns.
2. That duty = `deadband_in`. Repeat for **OUT** → `deadband_out`.
- Pick an **operating duty** comfortably above both; measure flow rates at **100 %** (below).

## 3. Flow rate IN @ 100 % (`rate_in`)
Use a scale (1 g ≈ 1 ml), pumping into a container:
1. Container on the scale, tare it. Speed = **100 %**.
2. Press a timed run — **keep it short (5–10 s)**; at full speed the torso empties fast.
3. Weigh the delivered water (g ≈ ml). In the wizard's **Durchfluss** step, enter the weighed amount → **ml/s**.
4. Repeat **3×** and average.
5. Record `rate_in` (the guided wizard stores it automatically; `rate_in` is applied to the pump live).

## 4. Flow rate OUT @ 100 % (`rate_out`)
1. With water in the torso, run **OUT for 5–10 s** at 100 % into the container on the scale.
2. Weigh → g ≈ ml → ml/s. Repeat 3×, average → `rate_out`.
3. Record it (drain is usually slower; direction-specific rates land in the model-follower later).

## 5. Torso volume mapping (level 0 ↔ 100) — `torso_volume_ml`
Goal: the **taped band** must sit where the game thinks `55–70` is.
1. Decide physical **empty = level 0** and **full = level 100** (e.g. a safe max fill line).
2. From empty, pump IN and note the **ml to reach the lower tape** (= level 55) and **ml across the band**
   (lower→upper tape = 55→70). From "across the band = 15 units":  `ml_per_unit ≈ (band ml) / 15`.
3. `torso_volume_ml ≈ ml_per_unit × 100`. Sanity-check against the torso's nominal volume (~2–3 L).
4. If the band ends up in the wrong place, re-tape so the lower tape sits at `ml_per_unit × 55` from empty.
5. Enter the result in **admin → Entleeren / Reset → „Torso-Volumen (ml)" → Werte speichern**.
   It persists to `calibration.json`, feeds the ml read-outs (admin + dev virtual torso) and,
   later, the model-follower's ml↔level conversion.

> The committed defaults (`DEFAULT` in `backend/app/game/calibration.py`) are the measured
> real-torso numbers — **~41.9 / 41.3 ml/s @ 100 %** (in / out) and a **1 800 ml** torso — so the
> mock/virtual torso is physically plausible out of the box.

## 5b. Tube dead-space (optional — for later)
With a peristaltic pump the **tubing** holds liquid that never reaches the torso. Two numbers matter
once we build the model-follower:
- **Prime volume** — from fully-empty tubes, run IN until water *just* reaches the torso; weigh that
  amount = the dead-space you must pump before the level even starts to move.
- **Residual on drain** — after a full OUT, the tubes/low point still hold some; note it so "empty"
  is defined consistently.
Record as `dead_space_ml`. The calibration file already has the field; the wizard doesn't capture it
yet, so enter it by hand in `backend/calibration.json` for now.

## 5c. Between-games reset (home-then-dose) — the calibrated start
Without a level sensor, each game starts from a *known* level by homing to empty, then dosing a
fixed volume (like a 3D printer homing to an endstop, then moving by steps):
- **`empty_overpump_s`** — run OUT long enough to drain the fullest torso **plus** margin, so it
  pulls air and is guaranteed empty. Set it generously (peristaltic pumps run dry safely).
- **`prime_in_ml`** — the volume to pump back IN for the game's start level. The backend adds
  `dead_space_ml` automatically (it must re-prime the empty tubing before water reaches the torso).

Set both in **admin → Entleeren / Reset** (saved into the calibration file), then:
- **„⏏ Entleeren (überpumpen)"** — drain to empty (this is also the manual "set state to empty").
- **„Kalibrierter Reset"** — empty, then prime in `prime_in_ml` → a repeatable start level.

The game's between-runs reset will call „Kalibrierter Reset" on real hardware (model-follower work).

## 6. Derived timings (game feel)
- `t_reset` (full drain) ≈ `capacity_ml / rate_out` — set the reset screen to comfortably exceed this.
- `t_dose` (baseline→band) ≈ `ml_per_unit × (55 − 42) / rate_in`.
- Drift/suspense across the band is **on-screen** (the taped band is fixed); tune the controller rate
  (`LevelConfig.rate`, units/s) + the event drift in `frontend/src/lib/events.ts` so the *visual* time
  feels right — it doesn't have to equal the physical pump time.

## 7. Where the numbers land
| value | file / field |
|---|---|
| `rate_in` / `rate_out` | `backend/calibration.json` (wizard; applied live on save + on boot) |
| `torso_volume_ml` | `backend/calibration.json` (admin → Entleeren/Reset → „Torso-Volumen") |
| `deadband_in/out`, `ml_per_unit` | **record in the results table below** (used by the upcoming model-follower) |
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
- **Wizard:** „Geführte Kalibrierung starten" measures deadbands + duty→flow samples and saves them.
- **Telemetry:** live level (incl. **ml**), zone, pump direction/speed, flow, MOCK/REAL badge.

> Note: the calibration stores direction-specific rates (`rate_in` / `rate_out`); the level
> twin and telemetry already use them per direction. Per-duty flow curves (the `samples`)
> feed the upcoming level→pump model-follower.
