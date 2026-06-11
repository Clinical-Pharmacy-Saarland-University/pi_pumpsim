# Build synthesis — the six stories as one set

Cross-cutting verdict over the five final build specs (`build-ddi.md`, `build-gene.md`,
`build-organ.md`, `build-adherence.md`, `build-johanniskraut.md`) plus the already-built
blueprint story (`fruehstueck`, the Frühstücks-Falle). Read after the per-story specs and
[`blueprint.md`](../blueprint.md). Where this file and a per-story spec disagree, **the
per-story spec wins for its own story**; this file only resolves the cross-story contract
(copy locks, shared helpers, build order). Where the README matrix and a spec disagree, the
**spec wins** (the specs deliberately supersede the one-line matrix — see §1 notes).

---

## 1. DISTINCTNESS VERDICT

The six signature verbs laid on the five matrix axes. „Pump" = who triggers the move; „Tank
direction" = where the meaningful move goes; „Stillness" = what a non-moving tank means.

| Story | Input gesture | Who moves the pump | Tank direction | Time model | What stillness means |
|---|---|---|---|---|---|
| **fruehstueck** | LIFT one item off the tray (subtract) | player-triggered per lift | DOWN-or-rest (removing the culprit lets it fall/rest) | instant cause→effect | „this item is innocent" |
| **ddi** | LOCK one fixed probe, SCAN it against each pill | player-triggered per scan | HELD-STILL ×4 then UP on its own | instant | „vertragen sich" (the answer IS the non-move, four in a row) |
| **gene** | BET first, then POUR the identical pill | player-triggered, 3 reps on ONE tank + body-swap reset | all three (stuck / into green / over) | instant | „this body has no machine" — and always *after a placed wager* |
| **organ** | TURN one inflow tap, then CATCH a live rise | player-triggered then continuously rising | UP toward the edge, caught back into green | continuous / live (rate vs rate) | N/A — a still *rising* tank is the danger, not the answer |
| **adherence** | COMPOSE a 7-slot week, then HAND-CRANK each day | player-triggered, one driveTo per day | saw-tooth (down on gaps, up the WRONG way on doubles) | authored timeline (you design the curve, then play it) | „stop the pill entirely" makes the pump not move = „that's not the danger" |
| **johanniskraut** | INVESTIGATE a fixed week, FILE into an Akte, then defend live | time-cranked then live | DOWN only, DELAYED + accelerating | LAGGED cause→effect (cause Di, fall Do–So) | inverted: the still day (Di) is the **culprit** |

**Each is unique on ≥2 axes — confirmed:**

- **fruehstueck** — only SUBTRACTIVE gesture; only verb whose saving move is DOWN-or-rest.
  (≥2: gesture + direction.)
- **ddi** — only FIXED-PROBE-VS-MANY gesture; only verb that weaponises a *run* of
  stillnesses to make one self-surge land. (≥2: gesture + stillness-semantics.)
- **gene** — only REPEAT-SAME-GESTURE-FOR-DIFFERENT-ANSWERS; only verb where a wager precedes
  every move (stillness = payoff-of-a-bet). (≥2: gesture + stillness-semantics + time-on-one-tank.)
- **organ** — only RATE-vs-RATE / continuous time model; only timing-window catch. (≥2: time
  model + stillness-is-danger-not-answer.)
- **adherence** — only AUTHOR-THE-TIMELINE; only saw-tooth tank picture. (≥2: time model +
  direction.)
- **johanniskraut** — only LAG / back-dating time model; only DOWN-only accelerating drain;
  only inverted stillness (still day = guilty). (≥3.)

No two rows share an identical (gesture × direction × time) triple. The set is collectively
distinct.

### Residual collisions + the exact fix

Four near-collisions remain at the *feel* level. Each is already separated by the specs; the
fixes below are the locks that must survive implementation (they are copy locks unless noted).

1. **fruehstueck ↔ ddi** — the sharpest. Both are „tap an item → stillness-or-move → the
   dangerous one is gated last" with an innocent·innocent·CULPRIT rhythm.
   - **Separation (already in specs):** POLARITY + GESTURE. fruehstueck is SUBTRACTIVE
     (remove → water falls/rests); ddi is a FIXED-PROBE SCAN (keep one probe locked → water
     rises on its own). Directions read opposite (DOWN-or-still vs SURGE-or-still).
   - **COPY LOCK (must hold):** fruehstueck's verb is strictly **wegnehmen/entfernen** and it
     must **never** say „scannen/prüfen/tippe-die-Probe"; ddi's verb is strictly
     **scannen/prüfen** and it must **never** say „nimm weg/entfernen". This is the load-bearing
     lock for the whole set — see §2.A.

2. **ddi ↔ gene** — both use a non-moving tank as a „not it / no machine" verdict.
   - **Separation:** AGENCY. ddi's stillness is a *discovered* verdict with **no** prediction
     before it; gene's stillness is *always preceded by a placed bet card*.
   - **MECHANIC LOCK (not just copy):** in gene every stillness/creep/surge is gated behind a
     `bets[id]` selection (Beat 1 bet sub-phase); in ddi the scanner has **no** prediction UI.
     Builder must not let ddi grow a „guess first" affordance, and must not let gene's pour fire
     before a bet is recorded.

3. **organ ↔ johanniskraut** — both end on a live real-time defence against water heading for a
   window edge.
   - **Separation:** DIRECTION + CAUSE-VISIBILITY + finale-type. organ RISES (invisible drain
     weakened → you turn the tap down, a **timing** catch); jk FALLS (a past tea still leaks →
     you identify the **back-dated cause**, not a moment).
   - **MECHANIC LOCK:** organ's finale resolves on *when* you tap reduzieren (a moment);
     jk's finale resolves on *which day/action* you pick (an identity). They must **never** both
     reduce to „tap the brake in time." Keep organ's `live` beat a timing window and jk's
     `mechanism` beat a candidate-day ID (`JK_MECH_CANDIDATES`).

4. **adherence ↔ johanniskraut** — both are multi-day „week" stories that drive the pump day by
   day. **This is the one to police hardest.**
   - **Separation:** COMPOSE vs INVESTIGATE. adherence lets you *author* a future 7-slot week
     with zero pressure (saw-tooth); jk gives you a *fixed history you cannot edit* and you
     back-date the cause (monotone down, lagged).
   - **MECHANIC LOCK (UI, not copy):** adherence shows an **editable 7-slot plan BEFORE
     playback**; jk shows a **read-only day strip** (labels only, `.now/.past/.inert` classes,
     no cycling). **johanniskraut must never grow a „build your week" panel**, and adherence must
     never hide its plan behind „investigate." Both specs already enforce this; flag it in review.

**Two README-matrix supersessions to honour (not collisions, but don't „correct" them back):**
- **gene** defers its dead-still beat to Treat A (Beat 4); pour A only creeps 40→46 so the
  climactic stillstand isn't spoiled during the bets. The README one-liner (stillness in the
  pour phase) is **out of date** — follow the spec.
- **johanniskraut** *does* have a stillness beat (Frühstück's grammar, inverted: the still day
  is guilty). The README's „no stillness beat" is **out of date** — follow the spec, and update
  the README matrix row when jk ships.

**Verdict on distinctness: PASS.** Six genuinely different relationships to the water; all
residual rhymes are separated on ≥2 axes with a copy or mechanic lock that survives the build.

---

## 2. CROSS-STORY COPY LOCKS

These are the wordings each story **must** or **must not** use so the set stays legible. They
override any looser phrasing (including the README §Copy-tone „rote Marke" pair — see lock C).

### A. Verb ownership (the anti-collision locks)
| Lock | Owner | Forbidden in | Rationale |
|---|---|---|---|
| **„scannen / prüfen"** (scan a pairing) | **ddi** only | fruehstueck must not say it | separates the two tap-and-read stories |
| **„wegnehmen / entfernen / nimm weg"** (subtract) | **fruehstueck** only | ddi must not say it | same |
| **„wetten / Wette / zu wenig·genau·zu viel"** (predict-then-pour) | **gene** only | nobody else has a wager | keeps gene's bet unique |
| **„reduzieren / Hahn kleiner stellen"** (catch-a-rate) | **organ** only | — | the live-cut verb |
| **„zurückdatieren / die Ursache lag schon am …"** (back-date) | **johanniskraut** only | — | the lag verb |
| **„Woche bauen / Plan / Nächster Tag" (author then crank)** | **adherence** only | jk must not say „bau die Woche" | jk investigates fixed history |

### B. The level = „der Spiegel" (NEVER „das Wasser" for the *concept*)
Every story: the drug level is **„der Spiegel"** (gloss once at the dose beat: „wie viel
Wirkstoff im Blut ist"). „das Wasser" / „der Torso" is permitted **only** when pointing the
eyes at the literal physical water moving („schau, wie das Wasser steigt/fällt"), never to name
the level concept. jk/organ/adherence specs each restate this; ddi's §9 retires the old „das
Wasser" level-concept keys. **Audit:** grep each `*.locale.ts` for „Wasser" and confirm every
hit is a physical-movement cue, not a level-concept noun.

### C. Danger-zone naming — CANONICAL, and it overrides the README
The torso has **only the green window taped**; 35/80 are *internal invisible* auto-trip lines
(the `flow.ts` code comment „lower/upper red line" is engineering shorthand, **not** a UI
string). Therefore:
- **Use everywhere:** young **„der grüne Bereich" / „das grüne Band"**, adult **„der
  therapeutische Bereich" / „das therapeutische Fenster"**. Danger = **„über / unter den grünen
  Bereich"** (over / under). „weit zu hoch" / „weit zu tief" are fine.
- **NEVER in player-facing copy (all six):** „rote Linie", „rote Marke", „rotes Klebeband",
  „rote Kante", „kritische Linie", „Gefahrenlinie", „Grenze".
- **This supersedes the README §Copy-tone proposal** of a „die rote Marke / die kritische Linie"
  pair. The blueprint §3 (no red line on the torso) and gene §12 (NON-NEGOTIABLE) win. The
  README's red-line pair must be treated as retired; do not implement it. *(Recommend: fix the
  README §Copy-tone + §Cross-story-fixes red-line lines to the green-only naming so a future
  builder isn't misled.)*

### D. Enzyme / mechanism naming (consistency across the three enzyme stories)
- **Enzyme term:** young **„Abbau-Enzym" / „Aufräum-Team" / „Umbau-Maschine"** (image + a gloss);
  adult the **real name**. Real-name map, locked so stories don't drift:
  - **gene** → **CYP2D6** (Codein→Morphin activation; „O-Demethylierung"). Codein is a **Prodrug**.
  - **johanniskraut** → **CYP3A4 + P-gp**, induced via **Hyperforin → PXR**. „Induktion ≠
    Hemmung" and it **lags**.
  - **ddi** → deliberately **vague** („über mehrere Abbau-/Transportwege") — do **not** write
    „v.a. CYP3A4"; Phenprocoumon's dominant clarithromycin interaction is not cleanly one enzyme.
  - **organ** → no enzyme; the „drain" is the **kidney** (renal elimination, eGFR). Keep „eGFR"
    adult-copy-only, never a gauge.
  - **adherence** → no enzyme; the lesson is **steady state / regularity**, not metabolism.
- **Location lock:** intestinal/hepatic enzymes are **„in Darm und Leber"** — **never „im Bauch"**
  (gene + jk both restate this).
- **Direction word lock:** gene's UM child is **„schnell zu viel", not „schnell weg"** (the
  twist); adherence's double is **„die falsche Richtung — nach oben", not „zurück ins Grüne"**;
  organ's confirm move is **„es STAUT sich" (a backup), not a danger-surge**.

### E. Outcome surface
- **No outcome emoji in EndScreen titles** (ddi §9 makes this explicit; EndScreen owns its own
  fx). **Note:** the **organ** and **adherence** locale blocks as written still carry 🎉/⚠️ in
  `*.out.*.title` and `won.title` (e.g. `organ.out.win.title` „Sicher dosiert! 🎉";
  `adh.out.over.title` „Überschossen! ⚠️"). **Strip these emoji to match the ddi rule** — a small
  must-fix, see the final checklist.
- Loss debriefs **name what happened** („Kumulation/Laktatazidose", „Durchbruchsanfall",
  „Abstoßung", „Blutung/Thrombose") and **never** „du warst zu vorsichtig" (organ §12, jk).

### F. Rank titles
All six read rank titles from `flow.ts rankKey()` via `EndScreen`/`StarRating`. **No story
hardcodes a rank string.** (All five specs restate this.)

---

## 3. PHARMACOLOGY SANITY (one line per story)

- **fruehstueck (FDI · grapefruit × CYP3A4 substrate):** ✅ grapefruit inhibits intestinal
  CYP3A4 → higher exposure of the affected drug; „remove the grapefruit" is the real fix.
  Demonstrator-accurate, directionally true.
- **ddi (DDI · clarithromycin × phenprocoumon/VKA):** ✅ macrolide potentiates the VKA over days
  → INR rises → bleeding (over); self-stopping the anticoagulant → loss of stroke protection
  (under). The vague multi-pathway mechanism is the *more* accurate choice; PPI is correctly
  „neutral, not harmful." Two-sided danger is real.
- **gene (DGI · codeine × CYP2D6):** ✅ codeine is a prodrug activated to morphine by CYP2D6; PM
  → subtherapeutic (dose-up futile), UM → excess morphine / respiratory-depression risk (real
  FDA boxed warning; contraindicated in children post-tonsillectomy). Tramadol-also-CYP2D6 trap
  is correct. Spine („the gene, not the dose, decides") is accurate.
- **organ (DOI · metformin × eGFR↓):** ✅ metformin is renally eliminated unchanged; falling eGFR
  → reduced clearance → accumulation → lactic-acidosis risk; fix = reduce/cap dose AND monitor.
  The „complete cessation only at eGFR < 30" nuance is correctly flagged as a *different
  threshold for a different patient* — the firewall against „stopping is always wrong/right."
- **adherence (Adhärenz · lamotrigin):** ✅ AED protection depends on a constant steady-state
  level; skips → breakthrough seizure (under); doubling to „catch up" → additive overshoot /
  dose-dependent toxicity (under-no-overshoot honest), never double a single missed dose;
  re-titrate after a *longer* pause (SJS/TEN), never self-stop. *(Spec flags an FI-Gegencheck of
  the two public adult claims before the open day — honour it.)*
- **johanniskraut (Induktion · St John's wort × ciclosporin):** ✅ hyperforin → PXR → induces
  CYP3A4 + P-gp in gut wall + liver → ciclosporin exposure falls over days (lag) → subtherapeutic
  trough → rejection risk. „Pflanzlich ist ein Wirkstoff"; manage as a unit (stop inducer +
  contact clinic + check trough), never secretly change the narrow-therapeutic-index dose. Down-
  only is pharmacologically honest (induction has no overdose path here).

**All six are demonstrator-accurate** (simplified, directionally correct, never false). The only
open empirical check is adherence's FI-Gegencheck (spec-acknowledged).

---

## 4. SHARED PRIMITIVES (build once, reuse — don't reinvent per story)

**Already in the repo (verified) — every spec assumes these; do not re-implement:**
- `flow.ts` → **`LEVELS`** (start 20 · bandLow 55 · bandHigh 70 · dose 62 · critLow 35 ·
  critHigh 80), **`outcomeForLevel`**, **`stars(win, clever, pro)`**, **`rankKey()`**. Every
  story imports `LEVELS`; nobody hardcodes 20/62/55/70 or a rank string.
- `game.svelte.ts` → **`driveTo(target, rate, then)`**, **`hold(ms, then)`**,
  **`testHypothesis({real, target?, rate?, holdMs?}, then)`** — the stillness helper already
  exists. The `<1`-unit early-branch (450 ms timer, no move) and the `<0.6` settle escape are
  the engine facts every spec's level table is tuned against (gene's 46-not-47 dead-still trap,
  jk's „every real tick ≥ 4", organ's chained cold-start seam).
- `WatchBody.svelte` (the eyes-to-body banner; tones watch/still/rising/falling/good),
  `PlayShell.svelte` (aura + kicker + caseLine + step/total), `EndScreen.svelte`, the global
  `.pl-*` kit in `app.css`.

**Reuse points where two+ stories want the same thing (build/lift once):**
1. **The stillness loop — `testHypothesis(real, …)`.** „Wrong hypothesis = pump doesn't move =
   instant harmlos" is **one code path** for **fruehstueck (remove), ddi (scan harmless), gene
   (treatA „mehr Codein" dead-still), organ (wrong detective hypothesis + the „mehr trinken"
   bait), adherence („weglassen" no-move), johanniskraut (harmless week card + Dienstag no-move)**
   — i.e. **all six**. Builders must route every stillness beat through `testHypothesis`/a pure
   `hold`, **never** a bespoke per-story no-op. (Edge: gene's „mehr Codein" relies on
   `target === current` so the `<1` early-branch fires — that's the same engine path, not a new
   helper.)
2. **Dose-fill „Wusstest du?" fact rotation.** **ddi, organ, adherence, johanniskraut** (and the
   exemplar fruehstueck) each rotate 3–4 fact cards during their one long fill, all citing the
   **identical pattern** from `FruehstueckPlay`'s `dosing` beat: `factIdx` + `FACT_MS` +
   `FACT_MIN_MS` + `fillDone` (hold the last fact a readable minimum). Each exports `*_FACTS =
   ['*.fact.disease','*.fact.drug','*.fact.window','*.fact.timing']`. **Lift the rotator into a
   tiny shared helper/snippet** (or copy verbatim) so the four don't drift. gene rotates a single
   `gene.pour.dykC` during C's long pour — same pattern, one card.
3. **The drawn PK concentration–time curve (light SVG).** **gene** (three curves on the scanner,
   `GENE_PK_CURVES` path strings) and **adherence** (the saw-tooth the player composed, `levelToY`
   / `dayToX` helpers) both want a drawn curve. They differ (3 static morphine curves vs 1
   day-by-day saw-tooth), but share: a faint **green-band rect** mapping `LEVELS.bandLow..High`
   to y, **no red line**, **no numeric axis** (qualitative — it's a *time-axis chart*, explicitly
   not a mirrored vessel), Pi-safe (solid strokes, no `filter:`/blur, no per-frame JS).
   **Recommendation:** extract a shared `<PkBand/>` snippet that draws the green-band rect + plot
   frame from `LEVELS`, and let each story draw its own curve(s) inside it — so the band geometry
   and the „no red line / no numbers" rule are enforced in one place. Low priority (only 2
   consumers) but cheap and it hard-locks the no-mirrored-vessel rule for the only two on-screen
   graphics in the set.
4. **The manual-loss `$effect`.** play2 is outside `PLAY_PHASES`, so **no story** gets the engine
   auto-trip. ddi / adherence / johanniskraut resolve losses with a component `$effect` watching
   `game.level.level` cross 80/35 (or jk's `JK_FLOOR 38`); gene / organ resolve on the settle
   callback. Both shapes are legitimate; **copy the `resolved`-flag guard pattern from
   `FruehstueckPlay`/`JkPlay`** and don't half-wire it (organ §4 spells out „settle-only OR full
   mid-travel effect, never a dangling check"). Same primitive, two wiring choices — pick one per
   story, never both half-done.
5. **`drive()` + `pumping` guard.** Every story's local `drive(target, rate, then)` sets
   `pumping=true` → **all action buttons `disabled={pumping}`**. Copy verbatim from
   `FruehstueckPlay` L70–73 (ddi spec cites the exact lines). One pattern, six copies.
6. **EndScreen-outside-`.beat` root guard.** The `<div class="root">{#if beat==='outcome'}
   <EndScreen/>{:else}<PlayShell>…</PlayShell>{/if}</div>` pattern (else the beat's transform
   clips EndScreen to height 0). Identical in all six.
7. **The `adultOnly` register filter.** Every choice list filters `game.ageGroup === 'adult' ||
   !o.adultOnly` and young gets exactly one gentle hint per decision. One filter, six stories.

**The per-story `*.locale.ts` split is NOT yet wired** (today all copy is inline in
`locale.svelte.ts`; fruehstueck included). Each spec's §9 carries the wiring chore: create
`stories/<id>.locale.ts`, `import` + spread `...<id>Locale` into the `de` dict, and **delete the
old inline `<id>.*` block** (last-spread-wins → a stale leftover silently overrides the new
copy). **ddi must build this wiring first** (it's the reference); the other four follow the same
recipe.

---

## 5. BUILD ORDER + RISK

Recommended order (matches README „why this order", with the riskiest component called out per
story for the builder):

1. **ddi** — build FIRST as the reference. It proves the shared spine end-to-end: `<WatchBody/>`
   on every move, `testHypothesis` stillness (still·still·still·still→SURGE), the dose-fill fact
   rotator, the `drive()`/`pumping` guard, the manual-trip `$effect`, the EndScreen handoff, the
   `*.locale.ts` split + old-block deletion, and the canonical green-only copy. It is also the
   worst current anti-grammar file (PairLink quiz + bin-sort + floating 🩸), so rebuilding it
   validates the template-level rewrite.
   **Riskiest component:** the **scanner gating + scoring legibility** — the blood-thinner tile
   must stay locked until all four harmless are scanned (`dangerUnlocked = harmlessScanned >= 4`),
   and `scanClean = !scanNudged` must be missable *only* via the locked-tile jab (not also gated
   on „all four scanned", which the unlock already forces → would make the flag always-true).
   Plus: physically deleting the inline `ddi.*` block (last-spread-wins).

2. **fruehstueck** — already built (the blueprint exemplar). It only needs the **copy-lock audit**
   against ddi once ddi ships: confirm fruehstueck never says „scannen/prüfen" and its saving move
   reads DOWN-or-rest. **Riskiest:** none new — it's the reference; just re-verify the lock.

3. **gene** — build THIRD. Reuses the stillness loop, adds the predict-then-pour wager + body-swap
   reset on ONE tank, retires the worst mirrored-vessel offender (the `.minibar`/`.bar`/`.fill`
   columns), and introduces the first drawn PK curve.
   **Riskiest component:** the **dead-still trap at Treat A „mehr Codein"** — `GENE_A_STILL ===
   GENE_A_LOW === 46` so `|46−46| = 0 < 1` fires the engine early-branch (no move). **47 breaks
   it** (`|47−46| = 1` is NOT `< 1` → takes the moving path). The „keine Reaktion" must be authored
   on-screen (bouncing pill + `still` WatchBody); do not expect a pump signal. Off-by-one-sensitive.

4. **organ** — build FOURTH. First story needing **live rising water + a timing-window catch** and
   the chained cold-start (42→62→78 over one tap). Do it before the two week-stories because it
   proves the continuous-drive choreography they lean on.
   **Riskiest component:** the **live-cut timing on the real pump** (Beat 5). 76→edge at rate ~3
   must be long enough for a relaxed walk-up to tap reduzieren but short enough that „zu spät =
   Überlauf" can really happen. Decide untouched-rise behaviour (spec recommends HOLD just under
   the edge, not auto-loss). Bench-test before committing. Second risk: keeping `pro`'s timely half
   **missable on a win** via `!baited` (don't simplify to „won via reduce", which is always true).

5. **adherence** — build FIFTH. Author-the-week + hand-crank (one driveTo per tap), the saw-tooth,
   the additive over/under losses, the second PK curve. Establishes the multi-day pattern jk
   differentiates against.
   **Riskiest component:** **hardware pacing + the over/under trip split.** Don't trust `rate` (the
   pump clamps near the calibrated ceiling); differentiate days by **distance** (−8 gap vs +16
   double) + a ~1 s hold at the extreme. Verify the full-body single double (62→78) sits *just*
   under 80 without a transient trip while stacked doubles (62→78→94) reliably cross 80. Keep
   `play` OUT of `PLAY_PHASES` and freeze at `simulateWeek`'s `tripIndex` so a transient overshoot
   mid-crawl can't auto-trip a scored win.

6. **johanniskraut** — build LAST. Hardest: a delayed back-dated fall **plus** a real-time leak
   defence, deliberately differentiated from adherence (investigate-fixed-history vs compose) AND
   organ (back-date-a-cause vs catch-a-rate). Also the one story whose old scoring violated the
   `stars()` shape (4×0.5) — collapse to the two-bonus `jkClever`/`jkPro`.
   **Riskiest component:** the **Dienstag delay reading as „verzögert", not „harmlos"** — it's a
   true no-move (`JK_TICK_DELAY = 0`), so the whole lesson rests on copy (`jk.week.delay`) + the
   contrast with the loud Mi/Fr ticks + the later live fall. If a visitor reads still-Dienstag as
   „unschuldig", the twist fails. **Never** reintroduce a sub-pump-threshold tick to „show" the
   delay (it'd read as harmlos — the opposite). Second risk: the finale „leak keeps falling until
   BOTH mandatory actions are in" (MUST-FIX #2) — the rescue arms only when `cause` + `contact`
   are both lit, so a dawdler can still lose; wire `armsRescue` + win-in-settle-callback, not a timer.

---

## VERDICT

**Are the five specs collectively distinct, non-obvious, learnings-central, and build-ready?**

- **Distinct — YES.** Six signature verbs (subtract / scan-a-pairing / bet-then-pour /
  catch-a-rate / author-time / back-date-a-lag), each unique on ≥2 axes, no shared
  (gesture×direction×time) triple. The four residual rhymes are each separated on ≥2 axes with a
  copy or mechanic lock (§1, §2).
- **Non-obvious — YES.** Every story has a real read-the-body decision with **plausible** wrong
  answers (real patient/clinician mistakes), a forced one-tank twist only the slow water can
  deliver, and no pre-labelled answers. A thoughtless walk-up can lose each one.
- **Learnings-central — YES.** Each mechanic exists to teach the real PK lesson; all six are
  demonstrator-accurate (§3), debriefs restate the takeaway in both registers, and the firewalls
  (organ's „absetzen nuance", jk's „manage as a unit / never self-dose", ddi's two-sided danger)
  are explicit.
- **Build-ready — YES, with a short must-fix list.** Each spec ships a complete data model + full
  copy + sim assertions + builder checklist + open-risk list, all tuned to the verified engine
  facts (`LEVELS`, `testHypothesis`, the `<1`/`<0.6` driveTo thresholds, play2-not-in-PLAY_PHASES).

### Remaining MUST-FIX before / during implementation (cross-story)

1. **Strip outcome emoji from titles in `organ` and `adherence` locale** (`organ.out.*.title`,
   `organ.won.title` „🎉"; `adh.out.over.title` „⚠️", `adh.out.win.title` „🎉"). ddi's rule
   (no emoji in titles; EndScreen owns the fx) is the set standard — bring all six into line.
2. **Honour the green-only danger naming over the README** (lock §2.C). The README §Copy-tone
   still proposes a „rote Marke / kritische Linie" pair; that is retired. Recommend editing the
   README §Copy-tone + §Cross-story-fixes red-line lines to green-only so no future builder
   re-introduces „rote Linie". (Documentation fix; the specs are already clean.)
3. **Update the README distinctness matrix** when gene + jk ship: gene's stillness is in Treat A
   (not the pour phase); johanniskraut DOES have a stillness beat (inverted — the still day is the
   culprit). The specs deliberately supersede the one-liners; sync the matrix so it stops
   contradicting the build.
4. **Wire the `*.locale.ts` split correctly, story by story** — for each of ddi/gene/organ/
   adherence/johanniskraut, create the per-story locale, spread into `de`, and **delete the inline
   `<id>.*` block** (last-spread-wins; a leftover silently overrides the new copy). ddi first as the
   reference. Also rewrite the shared story-card keys flagged per story (gene → „Drei Körper, eine
   Pille"; organ → „Der müde Filter" incl. EN/FR/NL/AR; adherence desc refresh; gene/organ retire
   the old card titles).
5. **Lift the four shared helpers** (§4: `testHypothesis` stillness routing, the dose-fill fact
   rotator, the `<PkBand/>` green-band snippet for gene+adherence, the `drive()`/`pumping` guard)
   rather than reimplementing per story — this is what keeps the stillness beat and the „no
   mirrored vessel / no red line" rules consistent across the set.
6. **Bench-calibrate the three hardware-sensitive moves before the open day:** organ's live-cut
   timing (76→edge), adherence's +16/over-trip split, johanniskraut's 47→33 @0.7 finale duration
   with the „both actions" gate. All three specs flag these as open risks; they are pacing/tuning,
   not design, but must be verified on the calibrated real torso.

None of the six are blocked; items 1–4 are small, mechanical, and can be done in the same pass as
each story's build. The set is **build-ready**.
