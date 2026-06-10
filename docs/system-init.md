# Starting the system — the init blueprint

The torso has **no level sensor**. The backend "twin" tracks the drug level open-loop
(it integrates pump runtime × the *calibrated* flow rate). So on power-up the system
does **not** know how much water is in the torso — there may be leftover water from last
time. You must establish a known state once, by hand, before the first game.

After that first init, **every game re-homes itself** between runs, so you never touch it
again during an event.

## First game — do this once on power-up

1. **Open the admin** — triple-tap the SafePolyMed logo (or press `A`). It opens on the
   **Setup** tab.
2. The banner reads **⚠ NOT READY**. Press **① Initialize the system**.
   - It pumps the torso **empty** (overpumps to be sure), then **fills it to the baseline
     start level**, then anchors the twin. The banner turns **✓ READY**.
   - Duration ≈ empty time + fill time (shown on the button), at the **calibrated** rate.
3. Close the admin (`Esc`) and **start the first game**.

That's it. From here, the "Patient wird vorbereitet" screen between runs runs the **same**
routine automatically — the first init is just you doing it by hand once.

## Taping the band marks (one-time torso setup)

To mark the green band / red lines on a fresh torso:

1. Setup tab → **② Home (empty → 0)** to drain to a known empty.
2. Use the **level buttons** (Baseline 20 · Crit-low 35 · **Band low 55** · **Band high 70** ·
   Crit-high 80). Each drives the *exact* calibrated volume to that level — wait for it to
   settle, then tape the waterline. Go low → high.

The level buttons are disabled until the torso is **homed** (Initialize or Home), so you
can never tape a mark from an unknown state.

## Why the rates are always calibrated

In a game, the level drifts toward its target at the **pump's calibrated rate** (from the
guided calibration: ml/s per direction). The game's drift "pace" only ever *slows* the pump
below its max (gentle suspense, via duty) — it can never claim the water moved faster than
the pump can actually move it. So the on-screen level always matches the real water.

## Rehearsing init on the dev PC (no hardware)

On a mock (dev) backend the Setup tab has a **DEV** panel:

- **Start @ 20% / 50% / 90%** injects that much *hidden* water into the virtual torso and
  re-boots the belief (banner → NOT READY; the **VirtualTorso** shows the real water with a
  dashed "system: ?" marker).
- Press **Initialize** and watch the virtual torso **drain to 0, then refill to baseline**,
  with the believed marker snapping into place (→ READY). This is the full blueprint, sped
  up ~6×.
- **Clear sim** returns to normal mock behaviour.
