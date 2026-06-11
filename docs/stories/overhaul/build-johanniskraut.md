# Build spec — „Das pflanzliche Leck" (id: `johanniskraut`)

Implementation-ready spec for the torso-first rebuild of story 6. Authoritative inputs (in order
of precedence): [`docs/stories/blueprint.md`](../blueprint.md) → the Frühstück exemplar files
(`screens/FruehstueckPlay.svelte`, `stories/fruehstueck.ts`, `sim/fruehstueck.sim.ts`) → the brief
[`overhaul/johanniskraut.md`](johanniskraut.md) → the cross-story matrix
[`overhaul/README.md`](README.md). Where the brief or old code conflicts with the blueprint, the
**blueprint wins** (this is why the on-screen meters/charts, the MCQ, the 🛡️-float beat, and the
4×0.5 scoring are all RETIRED below).

Files the builder will create / replace:
- `frontend/src/lib/stories/johanniskraut.ts` — pure data + scoring (replace the old file).
- `frontend/src/lib/stories/johanniskraut.locale.ts` — new per-story locale (move all `jk.*` copy
  out of `locale.svelte.ts`, then spread `johanniskrautLocale` into the `de` dict — see §9).
- `frontend/src/lib/screens/JkPlay.svelte` — full rebuild on PlayShell + `.pl-*` + WatchBody.
- `frontend/sim/johanniskraut.sim.ts` — new headless test (`npx tsx sim/johanniskraut.sim.ts`).

The `stories.ts` card is already correct: `id:'johanniskraut'`, `color:'#38e0a0'` (mint-green),
`icon:'🌿'`, `engine:'v2'`, routed by `game.story.id` in `App.svelte`.

---

## 1. One-liner + the unique mechanic VERB

> **Frau Bergers neue Niere ist geschützt — bis ein „harmloser" Stimmungstee den Schutz-Spiegel
> über eine Woche heimlich leerlaufen lässt. Du untersuchst die vergangene Woche Tag für Tag,
> liest den verzögerten Fall am Glas und musst die Ursache ZURÜCKDATIEREN — auf den stillen Tag, an
> dem sich der Spiegel noch gar nicht bewegte —, dann das Leck live stopfen, bevor der Schutz unter
> den grünen Bereich fällt.**

**Mechanic verb: READ-A-DELAYED-LEAK & BACK-DATE.** The player investigates a *fixed week of
history* (he cannot author it), reads a **delayed, accelerating downward drain** off the physical
torso, and must **blame a past day where the water did NOT move at all** (the tea started Dienstag
and that day the tank holds *dead still*; the visible fall only lands Donnerstag–Sonntag). Then a
real-time leak finale: cause-ID under falling water.

**Why it is distinct from the other five** (matrix axes: gesture · who moves the pump · direction ·
time model · what stillness means):
- The **only LAG / back-dating verb.** Cause (Di) and effect (Do–So) are physically *separated* in
  time — you blame **the day the tank held still**, not the day it crashed.
- **Down only**, and the drain **GROWS over days** (induction accelerates). No overflow path exists.
- vs **Adherence** (the dangerous neighbour): adherence is COMPOSE — you *author* a 7-slot future
  week with zero pressure and saw the tank up/down. Johanniskraut is **INVESTIGATE FIXED HISTORY** —
  you read a past week you cannot edit and back-date the cause. **No build-your-week panel here.**
- vs **Organ**: organ rises (catch an up-rate at the right *second*); johanniskraut falls (identify
  a back-dated *cause*, not a moment). They must never both reduce to „tap the brake in time."
- vs **DDI**: DDI is a single *instant* surge (still·still·SURGE in one moment); johanniskraut's
  signature is precisely the **time-delay** plus down-only plus the reactive live leak defence.

**README reconciliation (the „stillness" claim).** The cross-story matrix (README row 2) says
johanniskraut „has no stillness beat." That is **out of date** and this spec deliberately overrides
it: johanniskraut **reuses Frühstück's stillness grammar but inverts it.** In Frühstück a still day is
*always* innocent (still = harmless). Here the still day can be the **guilty** one: the culprit
Dienstag is a true no-move, and the back-dating puzzle is precisely „the day that did *nothing* is the
cause." That is a strengthening of distinctness, not a collision — Frühstück never makes a still
object guilty, and the lag twist (cause and effect days apart) is unique to this story. The gestures
also differ: Frühstück removes items from a tray; here you file into an Akte and walk fixed days.
(Builder note: when this spec ships, update the README matrix row to „stillness reused from Frühstück
but inverted — the still day is the culprit.")

---

## 2. Patient & learning

**Case (persistent `caseLine`):** Frau Berger, 54 · nach Nierentransplantation · Ciclosporin.

- **Young brief:** Frau Berger, 54, hat eine neue Niere bekommen. Damit ihr Körper die neue Niere
  nicht wegschiebt, nimmt sie jeden Tag ein Schutz-Medikament.
- **Adult brief:** Frau Berger, 54, nach Nierentransplantation. Zum Schutz des Transplantats vor
  Abstoßung nimmt sie täglich **Ciclosporin** (enge therapeutische Breite).

**Real drug + interaction:** Ciclosporin (immunosuppressant, narrow therapeutic index) ×
**Johanniskraut / Hypericum perforatum**. **Hyperforin** activates the nuclear receptor **PXR**,
which **induces CYP3A4 and P-glycoprotein** in gut wall + liver („in Darm und Leber" — never „im
Bauch"). Result: Ciclosporin is metabolised and effluxed faster → exposure falls → **subtherapeutic
trough → transplant rejection risk**.

**The exact PK lesson the player leaves with** (both registers; carried verbatim into the debrief):
1. **Enzyme INDUCTION ≠ inhibition, and it LAGS.** The body's clean-up team needs *days* to ramp up;
   the tea on Dienstag does **nothing visible that day** and only shows on the water on
   Donnerstag–Sonntag. The peak effect comes *after* the exposure, not at the same time. (This is
   also pharmacologically honest: induction on day 1 really is ≈ zero — see MUST-FIX #1.)
   - *young:* „Der Tee von Dienstag tut am ersten Tag fast nichts — er zeigt sich erst Tage später am
     sinkenden Spiegel."
   - *adult:* „Die Ciclosporin-Exposition sinkt verzögert über Tage; der Effektgipfel liegt nach der
     Exposition (CYP3A4/P-gp-Induktion baut sich auf)."
2. **„Pflanzlich" ist ein Wirkstoff.** Tea, capsules, supplements belong in the medication check.
   - *young:* „Natürlich heißt nicht harmlos — Tee und Kapseln gehören auf die Medikamenten-Liste."
   - *adult:* „Pflanzliche Präparate gehören in die Arzneimittelanamnese; ‚pflanzlich' ist kein
     Synonym für ‚wirkungslos'."
3. **A falling protection level = rejection risk; fix it as a UNIT.** Stop the inducer AND involve
   the transplant clinic; check the trough. **Never** secretly change the Ciclosporin dose (narrow
   therapeutic index → toxicity/under-protection if you guess).

---

## 3. The level arc (every pump move, exact numbers)

All levels are normalized 0–100. **Imports `LEVELS` from `flow.ts`** (`start 20 · bandLow 55 ·
bandHigh 70 · dose 62 · critLow 35 · critHigh 80`). This story is **DOWN ONLY** — no `driveTo` ever
targets above the window. The only marked zone on the torso is the **green window**; „danger" =
**unter dem grünen Bereich**. The loss floor `JK_FLOOR = 38` and drive-past target
`JK_DRAIN_TARGET = 33` are **internal, invisible** on the torso (they live below `critLow 35`'s
neighbourhood; the component trips the loss at `JK_FLOOR`, the runner just needs a target below it to
guarantee the fall).

| # | Beat | From → To | Rate (u/s) | Cause / trigger | What the player reads |
|---|------|-----------|-----------:|-----------------|-----------------------|
| 0 | onMount prime | (prepare) → **40** = `JK_BASELINE` | 8 | enter ungeschützt | Spiegel sitzt **unter** dem Grün — noch kein Schutz. |
| 1 | Standarddosis (tutorial) | **40 → 62** = `JK_DOSE` | 7 | „Standarddosis geben" | langsame sichtbare Steigung **ins Grün** = „geschützt". |
| 2a | Woche: harmless day taken | **no move** (driveTo NOT called) | — | Kamille/Wasser/Spaziergang/Essen/Schlaf in die Akte | **Stillstand = unschuldig.** |
| 2b | Woche: inducer on the EARLY day (Di) | **no move** (driveTo NOT called) | — | Tee am Dienstag in die Akte | **Stillstand — aber NICHT unschuldig.** Tea is in, today nothing moves; the lesson „wirkt verzögert" is carried by copy + the later contrast (the twist). |
| 2c | Woche: inducer on a LATE day (Mi/Fr) | **−5** from current (e.g. 60 → 55, 53 → 48) | 2.5 | Kapseln/Tee an Mi/Fr in die Akte | klar sichtbarer Abwärts-Tick = **„Täter, und das Leck wächst."** |
| 2d | Woche: baseline carry between days | drifts only if an inducer is in the Akte; ends late-week at **≈ 49** | 0.85 | the accumulated induction | Spiegel kriecht über die Woche tiefer, ab Do steiler. Bleibt **> `JK_FLOOR`**. |
| 3 | Etikett-Lupe (reveal) | **hold** (no move) | — | reveal „Johanniskraut" | bewusste Ruhe — Erkenntnis, kein Pumpenereignis. |
| 4 | Körper-Lesen (read-the-body) | **hold** at **≈ 49** (`JK_READ_LEVEL`); on premature „beobachten" a **−4** penalty tick to **≈ 45** | 2.5 | wait costs protection | Spiegel **unter** dem Grün, nahe der unteren Grün-Kante → „jetzt handeln" ist richtig; warten kostet Schutz. |
| 5 | Mechanismus: Tag zurückdatieren | **hold**; wrong (late-decoy) tap = a small **−4** tick then back to hold | 2.5 | tap Dienstag (right) vs Sonntag (wrong) | falscher Tipp bewegt den Spiegel → „zu spät, früher suchen"; richtig hält still. |
| 6a | Leck-Finale (the fall) | **47 → 33** = `JK_DRAIN_TARGET` | **0.7** | the un-stopped leak | Spiegel **fällt in Echtzeit** Richtung Boden (~20 s). Component trips loss at `JK_FLOOR = 38`. |
| 6b | Köder pulled | burst **−7** from current, clamped `≥ JK_DRAIN_TARGET`, then resume the 0.7 fall | 4 | „mehr Tee / verdoppeln / Naturmittel" | sichtbarer Abwärts-Burst + begründete Feedback-Zeile. |
| 6c | first Pflicht-Aktion applied | **fall CONTINUES at 0.7** (no halt) | 0.7 | only one of absetzen/Fachstelle in | Spiegel fällt weiter — der Druck bleibt, bis BEIDE drin sind. |
| 6d | BOTH Pflicht-Aktionen applied → rescue | **current → 62** | 5 | Johanniskraut absetzen **+** Fachstelle | Spiegel **kehrt um und steigt** sichtbar ins Grün; **Win feuert im settle-Callback** (no timer). |

Notes that lock the brief to engine reality (verified in `game.svelte.ts`):
- `driveTo` short-circuits when `|target − cur| < 1` (a 450 ms timer), and the settle escape fires at
  `< 0.6` distance (`game.svelte.ts:36` and `:74`). So **all „Täter"/penalty ticks are ≥ 4–5 units**
  and **harmless = no driveTo at all** (a true no-op → guaranteed stillness). A 1–2-unit tick would
  be effectively invisible on the slow pump — which is exactly why the Dienstag delay is a **true
  no-move**, not a tiny tick (see MUST-FIX #1).
- `play2` is **not** in `PLAY_PHASES`, so the engine auto-trip at critical_low **never fires** here.
  The loss is a **component `$effect`** watching `game.level.level <= JK_FLOOR`.
- Step 1 (tutorial fill) reuses the dose-fill rotating-fact pattern from Frühstück so the slow 40→62
  fill is teaching time, not dead time.

---

## 4. Beat-by-beat flow (9 beats)

`Beat` union: `'briefing' | 'dosing' | 'doseReveal' | 'week' | 'label' | 'read' | 'mechanism' |
'finale' | 'outcome'`. Progress dots: **6 steps** mapped — `briefing/dosing/doseReveal`→1,
`week`→2, `label`→3, `read`→4, `mechanism`→5, `finale`→6. EndScreen renders **outside** the animated
`.beat` (root pattern from §4 of the blueprint).

Shared scaffolding (copy Frühstück): a `drive(target, rate, then)` wrapper that sets a `pumping`
flag → **all action buttons `disabled={pumping}`**; the `$effect` dose-fact rotator; the EndScreen
root guard.

---

### Beat 0 — `briefing` (one tap to the first water)
- **Screen:** `.pl-emoji` 🧑‍⚕️ · `.pl-h1` = `jk.brief.patient` · `.pl-lead` = `jk.brief.goal` · one
  `.pl-action` `jk.brief.btn` („Standarddosis geben" — the ONE tap; no separate dose card, no
  floating-🛡️ beat). The cause is NOT revealed.
- **Player:** taps „Standarddosis geben".
- **Pump:** at this instant set `beat='dosing'` and `drive(JK_DOSE, 7, …)` (40 → 62).
- **Star:** none.

### Beat 1 — `dosing` (dose-fill teaching beat, rotating facts) ★ teaching
- **Screen:** `<WatchBody text={t('jk.cue.fill')} tone="good" />` („Schau auf den Torso — der Spiegel
  steigt in den grünen Bereich.") + a rotating `.pl-card` fact (`JK_FACTS`, 4 cards: disease / drug /
  window / timing). Hold the last fact a minimum readable time once the fill settles (Frühstück
  `FACT_MIN_MS` pattern), then → `doseReveal`.
- **Pump:** `drive(JK_DOSE, 7, …)` already running (40 → 62), `tone="good"`.
- **Star:** none (pure teaching). **This is the rotating-facts beat.**

### Beat 2 — `doseReveal`
- **Screen:** `.pl-good` reveal `jk.dose.reveal` („Genau richtig — im grünen Bereich! Die neue Niere
  ist geschützt.") + `.pl-action` `jk.dose.next` „Eine Woche später" → `week`.
- **Pump:** still.

### Beat 3 — `week` (Wochen-Detektiv: führe die Akte) ★ clever (a)
The core investigation. **AGENCY, not a slideshow:** the player walks Mo→So; on each day he decides
which routine object to **AUFNEHMEN** (place into the Medikationsakte) and watches the body. **No
on-screen meters, no day-height bars** (both RETIRED) — only flat day labels Mo/Di/…/So and copy that
sends the eyes to the torso.
- **Screen:** PlayShell content =
  - a flat **day strip** Mo…So (`.dayrow` of `JK_WEEK_DAYS`), current day highlighted, past days dim
    — **labels only, no height/fill encoding**;
  - the **today panel**: day title (`titleKey`) + note (`noteKey`) + the day's 1–2 routine cards
    (`card.icon`, `t(labelKey)`, a `jk.week.take` („antippen = in die Akte") / `jk.week.taken` („in
    der Akte") sub-label);
  - a single `<WatchBody/>` that flips tone per the last interaction:
    - default while a day is open: `tone="watch"`, `jk.week.watch` („Leg es in die Akte und schau auf
      den Körper — bewegt sich der Spiegel, war es der Täter; bleibt er still, war es harmlos … meist.");
    - harmless card taken: `tone="still"`, `jk.week.innocent` („Nichts bewegt sich — harmlos, nicht
      das Leck.");
    - inducer on a LATE day (Mi/Fr): `tone="falling"`, `jk.week.culprit` („Schau auf den Torso — der
      Schutz-Spiegel sinkt; dieses Mittel zieht am Schutz.");
    - inducer on **Dienstag**: `tone="still"`, `jk.week.delay` (the **twist** — see §5 + MUST-FIX #1:
      the tea is in, today **nothing moves**, but it is *not* innocent — the effect comes in a few
      days).
  - a `.pl-action` `jk.week.next` „Nächster Tag"; on the last day (So) the label is `jk.week.last`
    „Verdächtiges prüfen" (advances → drives the baseline carry, then opens the next day; on So →
    `label`).
- **Player:** per day, taps a card to AUFNEHMEN it (toggle), reads the body, then taps „Nächster Tag".
- **Pump:**
  - harmless AUFNEHMEN → **driveTo NOT called** (true stillness).
  - inducer on a **late** day (Mi/Fr) → `drive(cur − JK_TICK_INDUCER, 2.5)`.
  - inducer on **Dienstag** → **driveTo NOT called** (true no-move; the delay is real stillness, the
    copy carries „verzögert").
  - baseline carry on „Nächster Tag" → `drive(JK_WEEK_DAYS[next].level, 0.85)` **only if** an inducer
    is already in the Akte (otherwise no move). All clamp `> JK_FLOOR`.
- **Star:** **clever (a) = 0.5** if the player took at least one inducer into the Akte AND made **≤ 1
  false flag** (placed a harmless card). Tracked as `herbTaken > 0 && falseFlags <= 1`.

### Beat 4 — `label` (Etikett-Lupe: pflanzlich ist ein Wirkstoff)
- **Screen:** a **real magnifier interaction** (not a static strip) on the **same „Stimmungstee"
  bottle** the player filed Dienstag (the magnifier card and the Di week card are visibly one object —
  same icon 🍵, same front text — so the back-date thread stays one thing). The bottle shows
  „Pflanzlich. Für gute Stimmung." (`jk.label.front`); on press/hold (or the `jk.label.btn` „Lupe
  drüberziehen" button) it reveals „Johanniskraut / Hypericum perforatum" (`jk.label.back`).
  `<WatchBody tone="still" text={t('jk.label.wait')}/>` („Der Körper wartet — gleich musst du das Leck
  stopfen.") + `.pl-action` `jk.label.next` „Weiter" → `read`.
- **Pump:** **hold** (deliberate calm; insight, not a pump event).
- **Star:** none.

### Beat 5 — `read` (Körper-Lesen: noch sicher?) ★ clever (b₁)
The blueprint-mandated **read-the-body** decision — no number, no bar.
- **Screen:** `.pl-h2` `jk.read.prompt` („Keine Zahl. Schau auf das Wasser im Torso gegen das grüne
  Band — noch sicher oder schon zu tief?") + two `.pl-opt` whose labels are `t('jk.read.observe')`
  and `t('jk.read.act')` (cite the keys, do not inline the prose). `<WatchBody tone="watch"
  text={t('jk.read.watch')}/>`.
- **State at this beat:** the torso is held at `JK_READ_LEVEL ≈ 49`, visibly **under** the green band,
  near the lower edge → **„handeln" is the correct read.**
- **Player:** reads the water, picks.
  - `jk.read.observe` (premature „beobachten") → `drive(cur − JK_TICK_PENALTY, 2.5)` penalty tick
    (clamped `Math.max(JK_FLOOR + 1, …)`), set a `readStumbled` flag, show `jk.read.cost` („Warten
    kostet Schutz — schau auf den Torso, der Schutz-Spiegel ist jetzt noch tiefer."), then re-pose the
    same question at the now-lower level → „handeln" is unmissable.
  - `jk.read.act` („handeln") → `beat='mechanism'`.
- **Star:** feeds **clever (b)** — see §10. First-try „handeln" (no penalty tick, `readClean`) = clean.

### Beat 6 — `mechanism` (Mechanismus am Wasser: Tag zurückdatieren) ★ clever (b₂) · mechanism beat
The mechanism is taught **on the water**, NOT as MCQ (the old `jk.ind.*` trend quiz is DELETED).
- **Screen:** `.pl-h2` `jk.mech.prompt` („Wann lag die Ursache? Schau zurück auf die Woche — nicht auf
  den Einbruch.") + a **restricted, flat day leiste** (**no bar heights, no level codes**). A short
  gloss naming induction: `jk.mech.gloss` (young) / `jk.mech.gloss.adult`.
  - **Candidate set (MUST-FIX #3):** the tappable days are **only `JK_MECH_CANDIDATES`** — the days
    the player actually *placed a card* in the week (Di, Mi, Fr) **plus the visible-crash decoy So**.
    All other days render dim and inert. This turns the choice into a real inference („the quiet
    tea-day Dienstag vs the loud crash-day Sonntag"), not a 7-way sweep. Derived purely:
    `JK_MECH_CANDIDATES = [JK_CAUSE_DAY, …late-inducer-day-ids…, JK_DECOY_DAY]` (= `['di','mi','fr','so']`).
- **Player:** taps a weekday from the candidate set. **Dienstag is correct** (where the tea started).
  Sonntag (the visible crash) is the signature wrong answer.
  - wrong tap → `drive(cur − JK_TICK_PENALTY, 2.5)` small tick then back to hold + `jk.mech.late`
    („Zu spät — die Ursache muss früher liegen. Am Sonntag fiel der Spiegel nur, weil das Leck schon
    lief."), set `mechStumbled`.
  - Dienstag → hold still + `jk.mech.right` („Genau — die Tat war schon am Dienstag, als sich der
    Spiegel noch gar nicht bewegte.") + `.pl-action` `jk.mech.next` „Leck stopfen" → `finale`.
- **Pump:** hold (right) / small tick (wrong).
- **Star:** feeds **clever (b)** — first-try Dienstag (no `mechStumbled`, `mechClean`) = clean.

### Beat 7 — `finale` (Leck-Finale: Stopp das Leck!) ★ pro · finale · the losses
- **Screen:** alarm `.pl-h2` `jk.finale.prompt` („Der Körper fällt! Schau auf das Wasser und stopp das
  Leck.") + `jk.finale.sub` / `.adult` + `<WatchBody tone="falling"/>`. Three **action cards** the
  player taps to apply to the leak (tap-to-apply; a tap selects, the leak responds — keep it tap-only,
  the old drag is optional polish, not required). The actions = `JK_FINALE_ACTIONS` (3 real + 3
  baits). No min-level meter on screen (the old numeric „min {level}" is DELETED).
- **Player:** taps the real actions; avoids baits.
  - **Mandatory to win (one unit):** „Johanniskraut absetzen" (`cause`) **AND** „Transplant-Ambulanz
    / Fachstelle kontaktieren" (`contact`).
  - **The leak does NOT stop on the first action (MUST-FIX #2).** Each mandatory action lights its
    own slot but the body **keeps falling at 0.7** the whole time; the rescue `drive(62, 5,
    onSettle→win)` **arms only when BOTH `cause` + `contact` are lit.** So a player who taps
    „absetzen" then dawdles on „Fachstelle" is **still sinking** and can still hit `JK_FLOOR` and lose
    — the stakes are preserved. Applying only one mandatory action shows `jk.fb.needBoth` („Stopp
    allein reicht nicht — ruf auch die Fachstelle an.").
  - **Bonus:** „Talspiegel kontrollieren" (the pro leak, slot `monitor`).
  - **Baits** („mehr Tee" · „Ciclosporin heimlich verdoppeln" · „noch ein Naturmittel") each →
    `drive(cur − JK_BAIT_BURST, 4, …)` burst, clamped `≥ JK_DRAIN_TARGET`, then resume the 0.7 fall,
    with a **reasoned** feedback line (e.g. verdoppeln = „enge therapeutische Breite —
    Vergiftungsgefahr", not just „falsch").
- **Pump:** on mount of this beat `drive(JK_FINALE_START, 0.7, …)` toward `JK_DRAIN_TARGET = 33`. A
  component `$effect` watches `game.level.level`: tracks `minLevel`; if `<= JK_FLOOR (38)` and not
  resolved → `outcome='under'; beat='outcome'`. When **both** mandatory actions are applied →
  `drive(62, 5, onSettle→win)`; **win fires in the settle callback** (water actually in the band), no
  `setTimeout`.
- **Star:** **pro** — see §10.

### Beat 8 — `outcome` (EndScreen debrief)
- **Screen:** `<EndScreen>` with `outcome`, `titleKey/subKey = jk.out.<outcome>.title/.sub`,
  `storyTitleKey='story.johanniskraut.title'`, `score={starCount}`, and **2** debrief facts (kid +
  adult registers carried by `t()`):
  - win: `['jk.out.dyk.lag', 'jk.out.dyk.herb']`
  - under: `['jk.out.dyk.under', 'jk.out.dyk.lag']`
- This is the **debrief**, restating the learning + the safe action in both registers.

---

## 5. The one tank-surprise twist (forced, unavoidable)

**Blaming the day the water visibly FELL is wrong — the fall is back-dated, and the guilty day is the
day the tank held DEAD STILL.** The twist is delivered twice, both forced, both only legible because
of the real slow water:

1. **In the week (forced demo):** the run is choreographed so the player *must* place the tea on
   **Dienstag** as part of walking the week — and the tank **does not move at all** (the day 1
   induction effect really is ≈ zero). The *same* tea taken again on a later day (Mi/Fr) rips the
   water down (−5). The player physically feels „neu dazugekommen wirkt NICHT sofort" by comparing the
   dead-still Dienstag against the loud late ticks. The lesson is carried by the contrast + the copy
   (`jk.week.delay`), **not** by trying to render „delay" as a tiny visible tick (a 2-unit move is
   invisible on the slow pump and would read as „harmlos" — the exact opposite of the intent; see
   MUST-FIX #1).
2. **At the mechanism beat (forced):** „Wann lag die Ursache?" — tapping Sonntag (the visible crash)
   is wrong and the body answers with a small tick + „zu spät, früher suchen"; only Dienstag (the
   still day) is right. The player cannot reach the finale without back-dating.

Only the real water can deliver this: the lesson IS that **the day with no movement is the culprit**
and the day with the big movement is not. A screen bar/number would flatten „delay" into „instant."

---

## 6. Challenge design (non-obvious decision + plausible wrong answers)

The puzzle is the **back-dating**, which must stay genuinely non-obvious:
- The naïve walk-up blames **the day the water crashed** (Sonntag) — wrong. The right answer is the
  *quiet* day (Dienstag). This inverts the intuition the other five stories build (move = cause), and
  the mechanism leiste is restricted to a **2-way-feeling read** (the cards-placed days + the decoy,
  `JK_MECH_CANDIDATES = ['di','mi','fr','so']`) so it is an inference, not a 7-day sweep (MUST-FIX #3).
- **Read-the-body (`read`):** „Noch im Grün — weiter beobachten" is plausible (a real
  clinician/patient reflex: „wait and watch"), but here the water is already under the band → waiting
  costs protection.
- **Finale baits — real patient/clinician mistakes**, each with a reasoned feedback line:
  - „Mehr Tee trinken" — doubling down on the thing that feels harmless (it speeds the leak).
  - „Ciclosporin heimlich verdoppeln" — the classic dangerous self-fix; **narrow therapeutic index →
    toxicity** if the inducer is later removed.
  - „Noch ein Naturmittel dazu" — „natural must help" reflex; adds new interaction risk.
- The win requires **both** „absetzen" AND „Fachstelle kontaktieren". The leak **does not stop on the
  first action** — the body keeps falling at 0.7 until both are in (MUST-FIX #2), so a player who
  stops the tea but doesn't escalate is still under pressure and can still lose. „Managed as a unit"
  is enforced by the falling water, not just by copy.

A thoughtless walk-up can lose: blame Sonntag (stumble, costs clever), over-„beobachten" (stumble),
pull baits and dawdle in the finale → the water reaches `JK_FLOOR` → **Abstoßung** loss.

---

## 7. Custom visual

**No heavy custom SVG is required** — the torso carries the drama (blueprint rule 1/2). Two **light**
on-screen affordances, both pure HTML/CSS (no blur/filters, Pi-safe):

1. **Flat day strip / Tages-Leiste** (used in `week` and `mechanism`). A 7-cell flexbox of weekday
   labels (Mo…So). **Crucially: labels only — NO bar heights, NO fill, NO level encoding** (the old
   `height:12+induction*8` chart is DELETED; that would mirror the tank). States via CSS classes:
   `.now` (current/tappable, mint outline), `.past` (dim); in `mechanism`, days **not** in
   `JK_MECH_CANDIDATES` get a `.inert` class (dim, non-tappable) and tapped candidates get a
   `.picked`/`.wrong` tint. This is the differentiator from adherence's *editable* plan — here the
   strip is **read-only history** the player investigates.
2. **Etikett-Lupe** (`label` beat). A bottle card — **visibly the same „Stimmungstee" object** the
   player filed Dienstag (same icon, same front text) — with a CSS „magnifier" affordance: the front
   text „Pflanzlich. Für gute Stimmung." is shown; a press-and-hold (or a „Lupe drüberziehen" button)
   swaps in the back-label „Johanniskraut / Hypericum perforatum" with a small scale/opacity
   transition. Pure CSS `:active` + a persistent `revealed` state class (no canvas, no SVG mask).
   Touch-only: use `:active` + a persistent `revealed` class, **never `:hover`.**

Optional (only if time allows, must stay light): a one-line **„Aufräum-Team wächst" ramp** in the
mechanism gloss — three little dots that fill Di→So purely as decoration of the *induction-grows*
idea, never as a level readout. If in doubt, omit it; the water is the visual.

---

## 8. Data model — `frontend/src/lib/stories/johanniskraut.ts`

Headless-pure (no Svelte runes). Replaces the old file. Exact exports:

```ts
// Story „Das pflanzliche Leck" (Induktion · Johanniskraut × Ciclosporin) — pure data.
// Torso-first v2 (docs/stories/overhaul/build-johanniskraut.md). Signature mechanic:
// READ-A-DELAYED-LEAK & BACK-DATE — investigate a fixed week, read the delayed fall on
// the body, blame the QUIET day the tea started (Di = a true no-move), then stop the
// leak live. DOWN only: induction lowers the Spiegel; there is no overdose path. No
// on-screen vessel/meter.
import { LEVELS, type Outcome } from '../flow'

// ── levels (from the single source of truth; down-only story) ──────────────────
export const JK_BASELINE = 40            // prime: below the band, ungeschützt (a watchable fill to dose)
export const JK_DOSE = LEVELS.dose       // 62 — standard dose lands in the green window
export const JK_READ_LEVEL = 49          // read-the-body hold: clearly UNDER the band, near its lower edge
export const JK_FINALE_START = 47        // where the live leak begins to fall from
export const JK_FLOOR = 38               // component loss trip (invisible on torso; engine auto-trip is OFF for play2)
export const JK_DRAIN_TARGET = 33        // drive target UNDER the floor — guarantees the fall reaches JK_FLOOR
export const JK_PRO_MIN = 45             // pro half-star: the Spiegel never dipped below this in the finale
export const JK_TICK_INDUCER = 5         // a LATE-day inducer tick (>=4 so it is visible on the slow pump)
export const JK_TICK_DELAY = 0           // the Dienstag delay is a TRUE NO-MOVE (driveTo NOT called); see MUST-FIX #1
export const JK_TICK_PENALTY = 4         // read-the-body / mechanism stumble tick (visible, clamps > JK_FLOOR)
export const JK_BAIT_BURST = 7           // finale bait downward burst (clamped >= JK_DRAIN_TARGET)

// ── dose-fill „Wusstest du?" rotation (young/adult via t()) ────────────────────
export const JK_FACTS = ['jk.fact.disease', 'jk.fact.drug', 'jk.fact.window', 'jk.fact.timing']

// ── the fixed week the player investigates (history, NOT authored) ─────────────
export type JkCardKind = 'known' | 'herb' | 'routine' | 'symptom'
export interface JkWeekCard {
  id: string
  labelKey: string
  detailKey: string
  icon: string
  kind: JkCardKind            // 'herb' = an inducer (the culprit class); everything else is innocent
}
export interface JkWeekDay {
  id: string
  shortKey: string            // 'jk.day.mo' … flat label, NO height
  titleKey: string
  noteKey: string
  level: number               // the baseline-carry target after this day (drifts down only if an inducer is logged)
  inducerTick: number         // per-day inducer tick magnitude when the herb card here is taken:
                              //   Di = JK_TICK_DELAY (0 → true no-move, the delay), Mi/Fr = JK_TICK_INDUCER (5)
  cards: JkWeekCard[]
}
// 7 days; the tea first appears Dienstag (inducerTick 0 = the delay no-move),
// repeats / capsules later (Mi/Fr = big ticks). NOTE: the old on-screen
// `induction`/meter field is REMOVED — no field mirrors the tank.
export const JK_WEEK_DAYS: JkWeekDay[] = [ /* mo..so, see §3 + §9 keys; mirror old data's kinds */ ]

// ── finale actions: 3 real (cause + monitor + contact) + 3 baits ───────────────
export type JkSlot = 'cause' | 'contact' | 'monitor'
export interface JkFinaleAction {
  id: string
  labelKey: string
  feedbackKey: string
  kind: 'mandatory' | 'bonus' | 'bait'
  slot?: JkSlot               // 'cause'+'contact' = MANDATORY to win; 'monitor' = bonus
}
export const JK_FINALE_ACTIONS: JkFinaleAction[] = [
  { id: 'absetzen',    labelKey: 'jk.act.absetzen',    feedbackKey: 'jk.fb.absetzen',    kind: 'mandatory', slot: 'cause' },
  { id: 'fachstelle',  labelKey: 'jk.act.fachstelle',  feedbackKey: 'jk.fb.fachstelle',  kind: 'mandatory', slot: 'contact' },
  { id: 'spiegel',     labelKey: 'jk.act.spiegel',     feedbackKey: 'jk.fb.spiegel',     kind: 'bonus',     slot: 'monitor' },
  { id: 'tee',         labelKey: 'jk.act.tee',         feedbackKey: 'jk.fb.tee',         kind: 'bait' },
  { id: 'verdoppeln',  labelKey: 'jk.act.verdoppeln',  feedbackKey: 'jk.fb.verdoppeln',  kind: 'bait' },
  { id: 'naturmittel', labelKey: 'jk.act.naturmittel', feedbackKey: 'jk.fb.naturmittel', kind: 'bait' },
]
export const JK_MANDATORY = JK_FINALE_ACTIONS.filter((a) => a.kind === 'mandatory').map((a) => a.id) // ['absetzen','fachstelle']

// ── back-dating: the correct day is Dienstag, the visible-crash decoy is Sonntag ─
export const JK_CAUSE_DAY = 'di'
export const JK_DECOY_DAY = 'so'
// the mechanism leiste only exposes the days the player placed a card on + the decoy,
// so back-dating is an inference (quiet tea-day vs loud crash-day), not a 7-day sweep.
export const JK_MECH_CANDIDATES = ['di', 'mi', 'fr', 'so'] // cause + late inducers + decoy

// ── scoring helpers (headless-pure; the component derives win/clever/pro inputs) ─
/** clever (0/0.5/1): (a) found a herb with <=1 false flag in the week; (b) read-the-body AND
 *  back-date both first-try clean. Each worth 0.5. */
export function jkClever(herbTaken: number, falseFlags: number, readClean: boolean, mechClean: boolean): number {
  const detective = herbTaken > 0 && falseFlags <= 1 ? 0.5 : 0
  const backdate = readClean && mechClean ? 0.5 : 0
  return detective + backdate
}
/** pro (0/0.5/1): (a) the bonus leak (Talspiegel) also stopped; (b) zero baits AND minLevel never < JK_PRO_MIN. */
export function jkPro(monitorStopped: boolean, baitCount: number, minLevel: number): number {
  return (monitorStopped ? 0.5 : 0) + (baitCount === 0 && minLevel >= JK_PRO_MIN ? 0.5 : 0)
}
```

The week data (`JK_WEEK_DAYS`) reuses the old day cards (Mo: Ciclosporin+Frühstück · **Di: Tee**+Wasser
· **Mi: Kapseln**+Kamille · Do: Spaziergang+Apfel · **Fr: Tee weiter**+Schlaf · Sa: Essen+Maske · So:
Schutz fällt+Ciclosporin unverändert), with `inducerTick`: **Di = `JK_TICK_DELAY (0)`** (the
no-move), **Mi/Fr = `JK_TICK_INDUCER (5)`**; all `level` carry values mirror §3 (Di holds at 62 — no
move — then Mi/Do/Fr/Sa/So drift 60→…→49, all `> JK_FLOOR`). The on-screen `induction`/meter fields
from the old data are **removed**.

---

## 9. Full copy — `frontend/src/lib/stories/johanniskraut.locale.ts`

Export `export const johanniskrautLocale: Record<string, string> = { … }`, then in
`locale.svelte.ts` spread it into the `de` dict (`...johanniskrautLocale`) and **delete the inline
`jk.*` block** so the keys resolve once. Keep the **`jk.` prefix** so shared keys still match. Every
key has a young value; nuanced/clinical/player-facing keys also carry an `.adult` value. (Mined and
rewritten from the old copy; danger = „unter dem grünen Bereich", level = „der Spiegel/Schutz-Spiegel",
**never „rote Linie", never „Wasser" for the level** — „Wasser" only where the eyes are pointed at the
literal water in the tank.)

```ts
export const johanniskrautLocale: Record<string, string> = {
  // ── briefing ────────────────────────────────────────────────────────────────
  'jk.case': 'Frau Berger, 54 · neue Niere · Schutz-Medikament',
  'jk.case.adult': 'Frau Berger, 54 · nach Nierentransplantation · Ciclosporin',
  'jk.brief.patient': 'Frau Berger, 54, hat eine neue Niere bekommen. Damit ihr Körper die neue Niere nicht wegschiebt, nimmt sie jeden Tag ein Schutz-Medikament.',
  'jk.brief.patient.adult': 'Frau Berger, 54, nach Nierentransplantation. Zum Schutz des Transplantats vor Abstoßung nimmt sie täglich Ciclosporin — ein Mittel mit enger therapeutischer Breite.',
  'jk.brief.goal': 'Bring den Schutz-Spiegel in den grünen Bereich und halte ihn dort. Fällt er zu tief, ist die neue Niere in Gefahr.',
  'jk.brief.goal.adult': 'Bring den Ciclosporin-Talspiegel ins therapeutische Fenster und halte ihn dort. Fällt er subtherapeutisch, droht Transplantatabstoßung.',
  'jk.brief.btn': 'Standarddosis geben',

  // ── dose fill + facts ─────────────────────────────────────────────────────────
  'jk.cue.fill': 'Schau auf den Torso — der Spiegel steigt in den grünen Bereich.',
  'jk.cue.filled': 'Im grünen Bereich angekommen — der Schutz steht.',
  'jk.fact.kicker': 'Wusstest du?',
  'jk.fact.disease': 'Bei einer neuen Niere muss ein Schutz-Medikament den Körper bremsen, damit er die Niere nicht abstößt.',
  'jk.fact.disease.adult': 'Nach Transplantation verhindert die Immunsuppression (Ciclosporin), dass das Immunsystem das Transplantat abstößt.',
  'jk.fact.drug': 'Das Schutz-Medikament heißt Ciclosporin. Es muss genau richtig dosiert sein — zu wenig schützt nicht.',
  'jk.fact.drug.adult': 'Ciclosporin (Calcineurin-Inhibitor) hat eine enge therapeutische Breite — schon kleine Spiegel-Abfälle gefährden das Transplantat.',
  'jk.fact.window': 'Der grüne Bereich ist das Schutzfenster: über dem Grün wäre es zu viel, darunter zu wenig Schutz.',
  'jk.fact.window.adult': 'Das grüne Band ist das therapeutische Fenster; unter dem Band ist der Talspiegel subtherapeutisch.',
  'jk.fact.timing': 'Manche Wechselwirkungen wirken nicht sofort — sie bauen sich erst über Tage auf.',
  'jk.fact.timing.adult': 'Enzyminduktion wirkt verzögert: der Effekt baut sich über Tage auf, der Gipfel liegt nach der Exposition.',
  'jk.dose.reveal': 'Genau richtig — im grünen Bereich! Die neue Niere ist geschützt.',
  'jk.dose.reveal.adult': 'Im therapeutischen Fenster — das Transplantat ist sicher immunsupprimiert.',
  'jk.dose.next': 'Eine Woche später',

  // ── week: detective ───────────────────────────────────────────────────────────
  'jk.week.kicker': 'Eine Woche später',
  'jk.week.title': 'Finde das versteckte Leck',
  'jk.week.prompt': 'Geh Tag für Tag durch Frau Bergers Woche. Leg neue Dinge in die Medikationsakte und schau, was der Spiegel macht.',
  'jk.week.prompt.adult': 'Rekonstruiere die Arzneimittelanamnese Tag für Tag. Nimm neue Arznei-, Supplement- oder Pflanzenprodukt-Expositionen in den Medikationscheck auf.',
  'jk.week.watch': 'Leg es in die Akte und schau auf den Körper — bewegt sich der Spiegel, war es der Täter; bleibt er still, war es meist harmlos.',
  'jk.week.watch.adult': 'Nimm es in den Medikationscheck auf und beobachte den Torso — eine Bewegung verrät den Täter; Stillstand spricht meist für harmlos.',
  'jk.week.innocent': 'Nichts bewegt sich — harmlos, nicht das Leck.',
  'jk.week.innocent.adult': 'Kein Spiegel-Abfall — diese Exposition ist nicht der Auslöser.',
  'jk.week.culprit': 'Schau auf den Torso — der Schutz-Spiegel sinkt; dieses Mittel zieht am Schutz.',
  'jk.week.culprit.adult': 'Der Spiegel fällt sichtbar — diese Exposition senkt die Ciclosporin-Wirkung.',
  'jk.week.delay': 'Der Tee ist drin — heute bewegt sich nichts. Aber merk dir das: das kommt erst in ein paar Tagen.',
  'jk.week.delay.adult': 'Die Exposition beginnt — heute bewegt sich der Spiegel noch nicht. Die Induktion braucht Tage; der Effekt folgt verzögert.',
  'jk.week.take': 'antippen = in die Akte',
  'jk.week.taken': 'in der Akte',
  'jk.week.next': 'Nächster Tag',
  'jk.week.last': 'Verdächtiges prüfen',
  // day labels (flat, no height)
  'jk.day.mo': 'Mo', 'jk.day.di': 'Di', 'jk.day.mi': 'Mi', 'jk.day.do': 'Do',
  'jk.day.fr': 'Fr', 'jk.day.sa': 'Sa', 'jk.day.so': 'So',
  // day titles + notes
  'jk.week.mo.title': 'Alles wie immer',
  'jk.week.mo.note': 'Ciclosporin ist bekannt, der Schutz liegt im grünen Bereich.',
  'jk.week.di.title': 'Neuer Tee',
  'jk.week.di.note': 'Im Schrank steht plötzlich ein Stimmungstee.',
  'jk.week.mi.title': 'Neue Kapseln',
  'jk.week.mi.note': 'Neben dem Tee tauchen pflanzliche Stimmungskapseln auf.',
  'jk.week.do.title': 'Nichts Auffälliges',
  'jk.week.do.note': 'Spaziergang und Apfel sehen gesund aus — der Schutz sinkt trotzdem.',
  'jk.week.fr.title': 'Der Effekt wächst',
  'jk.week.fr.note': 'Nicht ein Schluck: das Aufräum-Team wird jeden Tag aktiver.',
  'jk.week.fr.note.adult': 'Nicht die Einzeldosis: CYP3A4/P-gp werden über Tage hochreguliert.',
  'jk.week.sa.title': 'Unter dem grünen Bereich',
  'jk.week.sa.note': 'Gesundes Essen ist nicht das Problem — der Schutz rutscht weiter.',
  'jk.week.so.title': 'Alarm',
  'jk.week.so.note': 'Ciclosporin wurde genommen wie immer — aber der Schutz ist zu tief.',
  // cards (mined from the old jk.card.*)
  'jk.card.ciclosporin': 'Ciclosporin wie immer',
  'jk.card.ciclosporin.detail': 'Bekanntes Schutz-Medikament. Es gehört zum Plan, ist aber nicht neu.',
  'jk.card.breakfast': 'Frühstück',
  'jk.card.breakfast.detail': 'Keine neue Arznei und kein Pflanzenpräparat.',
  'jk.card.tea': 'Stimmungstee',
  'jk.card.tea.detail': 'Vorderseite: „Pflanzlich. Für gute Stimmung." — das gehört in den Medikationscheck.',
  'jk.card.water': 'Wasserflasche',
  'jk.card.water.detail': 'Trinken ist wichtig, ändert den Schutz-Spiegel aber nicht.',
  'jk.card.caps': 'Stimmungskapseln',
  'jk.card.caps.detail': 'Auch frei verkäufliche Kapseln können ein echter Wirkstoff sein.',
  'jk.card.camomile': 'Kamillentee',
  'jk.card.camomile.detail': 'Ein harmloser Tee in dieser Geschichte, nicht der sinkende Schutz.',
  'jk.card.walk': 'Spaziergang',
  'jk.card.walk.detail': 'Bewegung ist gut, aber nicht die Wechselwirkung.',
  'jk.card.apple': 'Apfel',
  'jk.card.apple.detail': 'Der Apfel ist ein Ablenker.',
  'jk.card.teaRepeat': 'Tee weiter getrunken',
  'jk.card.teaRepeat.detail': 'Der neue Tee läuft weiter — so wird die Induktion stärker.',
  'jk.card.sleep': 'Schlecht geschlafen',
  'jk.card.sleep.detail': 'Müde sein erklärt den fallenden Schutz nicht.',
  'jk.card.food': 'Gesund gegessen',
  'jk.card.food.detail': 'Gesundes Essen ist gut, aber nicht die Ursache.',
  'jk.card.mask': 'Schlafmaske',
  'jk.card.mask.detail': 'Hilft beim Schlafen, ist aber kein Arzneimittel.',
  'jk.card.low': 'Schutz fällt sichtbar',
  'jk.card.low.detail': 'Jetzt sieht man die Folge: zu wenig Schutz.',
  'jk.card.ciclosporinSame': 'Ciclosporin unverändert',
  'jk.card.ciclosporinSame.detail': 'Die Dosis blieb gleich. Etwas anderes hat den Abbau beschleunigt.',

  // ── label magnifier ──────────────────────────────────────────────────────────
  'jk.label.prompt': 'Halt die Lupe über das Etikett des Stimmungstees.',
  'jk.label.front': 'Pflanzlich. Für gute Stimmung.',
  'jk.label.back': 'Johanniskraut · Hypericum perforatum',
  'jk.label.btn': 'Lupe drüberziehen',
  'jk.label.wait': 'Der Körper wartet — gleich musst du das Leck stopfen.',
  'jk.label.next': 'Weiter',

  // ── read-the-body ────────────────────────────────────────────────────────────
  'jk.read.prompt': 'Keine Zahl. Schau auf das Wasser im Torso gegen das grüne Band — noch sicher oder schon zu tief?',
  'jk.read.prompt.adult': 'Ohne Messwert: Beurteile den Spiegel im Torso gegen das grüne Fenster — noch therapeutisch oder schon subtherapeutisch?',
  'jk.read.watch': 'Lies nur das Wasser am Torso — wo steht es zum grünen Bereich?',
  'jk.read.observe': 'Noch im Grün — weiter beobachten',
  'jk.read.observe.adult': 'Noch im Fenster — vorerst beobachten',
  'jk.read.act': 'Schon zu tief gefallen — jetzt handeln',
  'jk.read.act.adult': 'Bereits subtherapeutisch — jetzt handeln',
  'jk.read.cost': 'Warten kostet Schutz — schau auf den Torso, der Schutz-Spiegel ist jetzt noch tiefer. Was sollte Frau Berger tun?',
  'jk.read.cost.adult': 'Das Zuwarten lässt den Talspiegel weiter abfallen — jetzt ist Handeln eindeutig nötig.',
  'jk.read.next': 'Weiter',

  // ── mechanism / back-date ────────────────────────────────────────────────────
  'jk.mech.prompt': 'Wann lag die Ursache? Schau zurück auf die Woche — nicht auf den Einbruch.',
  'jk.mech.prompt.adult': 'Wann begann die Induktion? Datiere die Ursache zurück — nicht auf den sichtbaren Spiegel-Einbruch.',
  'jk.mech.gloss': 'Der Körper merkt sich die Pflanze — das Aufräum-Team wird jeden Tag größer, das Leck wächst.',
  'jk.mech.gloss.adult': 'Hyperforin induziert CYP3A4 und P-gp in Darm und Leber über Tage; der Effekt wächst, der Gipfel liegt nach der Exposition.',
  'jk.mech.late': 'Zu spät — die Ursache muss früher liegen. Am Sonntag fiel der Spiegel nur, weil das Leck schon lief.',
  'jk.mech.late.adult': 'Zu spät — das ist der sichtbare Effekt, nicht der Beginn. Datiere die Ursache auf den ruhigen Tag zurück.',
  'jk.mech.right': 'Genau — die Tat war schon am Dienstag, als sich der Spiegel noch gar nicht bewegte.',
  'jk.mech.right.adult': 'Richtig — der Beginn am Dienstag; die Induktion und damit der Spiegel-Abfall folgten verzögert.',
  'jk.mech.next': 'Leck stopfen',

  // ── finale ───────────────────────────────────────────────────────────────────
  'jk.finale.prompt': 'Der Körper fällt! Schau auf das Wasser und stopp das Leck.',
  'jk.finale.prompt.adult': 'Der Spiegel fällt subtherapeutisch! Stopp das Leck, bevor er unter den grünen Bereich rutscht.',
  'jk.finale.sub': 'Sichere Maßnahme als Einheit: Johanniskraut absetzen UND die Fachstelle anrufen.',
  'jk.finale.sub.adult': 'Ursache stoppen und Transplantationszentrum einbeziehen; Talspiegel kontrollieren. Keine eigenmächtige Dosisänderung.',
  'jk.act.absetzen': '🌿 Johanniskraut absetzen',
  'jk.act.absetzen.adult': '🌿 Johanniskraut (Inducer) absetzen',
  'jk.act.fachstelle': '📞 Transplant-Ambulanz / Fachstelle anrufen',
  'jk.act.fachstelle.adult': '📞 Transplantationszentrum kontaktieren',
  'jk.act.spiegel': '🩸 Talspiegel kontrollieren lassen',
  'jk.act.spiegel.adult': '🩸 Ciclosporin-Talspiegel bestimmen',
  'jk.act.tee': '🍵 Mehr Tee trinken',
  'jk.act.verdoppeln': '💊 Ciclosporin heimlich verdoppeln',
  'jk.act.naturmittel': '🌼 Noch ein Naturmittel dazu',
  'jk.fb.absetzen': 'Ursache gestoppt — der Schutz kann sich erholen.',
  'jk.fb.absetzen.adult': 'Johanniskraut abgesetzt — die Quelle der Induktion ist entfernt.',
  'jk.fb.fachstelle': 'Richtig — die Transplant-Ambulanz muss mitsteuern.',
  'jk.fb.fachstelle.adult': 'Richtig — Transplantationszentrum/ärztliche Stelle einbeziehen.',
  'jk.fb.spiegel': 'Gut — der Schutz-Spiegel wird kontrolliert.',
  'jk.fb.spiegel.adult': 'Gut — Talspiegelkontrolle zur Steuerung der Immunsuppression.',
  'jk.fb.needBoth': 'Stopp allein reicht nicht — ruf auch die Fachstelle an, sonst fällt der Schutz weiter.',
  'jk.fb.needBoth.adult': 'Absetzen allein genügt nicht — das Transplantationszentrum muss einbezogen werden, der Spiegel fällt sonst weiter.',
  'jk.fb.tee': 'Nein — mehr Johanniskraut lässt das Leck schneller laufen.',
  'jk.fb.tee.adult': 'Falsch — mehr Johanniskraut verstärkt die Induktion; der Spiegel fällt schneller.',
  'jk.fb.verdoppeln': 'Gefährlich — nicht heimlich an der Dosis drehen. Das kann giftig werden.',
  'jk.fb.verdoppeln.adult': 'Gefährlich — eigenmächtiges Hochdosieren bei enger therapeutischer Breite ist toxisch, sobald der Induktor wegfällt.',
  'jk.fb.naturmittel': 'Nein — noch ein Naturmittel bringt neue Wechselwirkungen.',
  'jk.fb.naturmittel.adult': 'Falsch — weitere Phytotherapeutika/Supplemente erhöhen das Interaktionsrisiko.',
  'jk.finale.rescue': 'Das Leck ist gestopft — schau auf den Torso, der Spiegel steigt zurück in den grünen Bereich.',
  'jk.finale.rescue.adult': 'Leck gestopft — der Spiegel kehrt um und steigt zurück ins therapeutische Fenster.',

  // ── outcomes + debrief ───────────────────────────────────────────────────────
  'jk.out.win.title': 'Schutz gerettet!',
  'jk.out.win.sub': 'Du hast das Leck rechtzeitig gestoppt — die neue Niere bleibt geschützt.',
  'jk.out.win.sub.adult': 'Johanniskraut abgesetzt, Fachstelle einbezogen, Talspiegel gesichert — Transplantat geschützt.',
  'jk.out.under.title': 'Abstoßung!',
  'jk.out.under.sub': 'Der Schutz ist unter den grünen Bereich gefallen — die neue Niere ist in Gefahr. Probier es nochmal!',
  'jk.out.under.sub.adult': 'Subtherapeutischer Ciclosporin-Spiegel → Abstoßungsgefahr. Deshalb: Johanniskraut absetzen, Fachstelle einbeziehen, Talspiegel kontrollieren.',
  'jk.out.dyk.lag': 'Der Tee von Dienstag tut am ersten Tag fast nichts — er zeigt sich erst Tage später am sinkenden Schutz. Die Wirkung kommt verzögert.',
  'jk.out.dyk.lag.adult': 'Enzyminduktion (Hyperforin → PXR → CYP3A4/P-gp) wirkt verzögert über Tage; der Effektgipfel liegt nach der Exposition, nicht am Tag der Einnahme.',
  'jk.out.dyk.herb': 'Natürlich heißt nicht harmlos: Tee und Kapseln gehören auf die Medikamenten-Liste.',
  'jk.out.dyk.herb.adult': 'Pflanzliche Präparate gehören in die Arzneimittelanamnese; „pflanzlich" ist kein Synonym für „wirkungslos".',
  'jk.out.dyk.under': 'Ein fallender Schutz-Spiegel heißt: zu wenig Schutz. Ursache stoppen UND Fachleute fragen — nie selbst die Dosis ändern.',
  'jk.out.dyk.under.adult': 'Management als Einheit: Johanniskraut absetzen, Transplantationszentrum einbeziehen, Talspiegel kontrollieren — keine eigenmächtige Ciclosporin-Anpassung (enge therapeutische Breite).',
}
```

`rank.*` titles are read from `flow.ts` via EndScreen — **no rank string is hardcoded** here.

---

## 10. Scoring — `stars(win, clever, pro)`

Exactly the two-bonus shape from `flow.ts` (the old 4×0.5 sum is RETIRED). Any loss = 0.

```ts
let clever = $derived(jkClever(herbTaken, falseFlags, readClean, mechClean)) // 0 / 0.5 / 1
let pro    = $derived(jkPro(monitorStopped, baitCount, minLevel))            // 0 / 0.5 / 1
let starCount = $derived(stars(outcome === 'win', clever, pro))
```

- **clever (the investigation read)** = two earnable 0.5s:
  - (a) **Detective:** in the week, took ≥1 inducer into the Akte AND made ≤1 false flag
    (`herbTaken > 0 && falseFlags <= 1`).
  - (b) **Back-dating, clean:** read-the-body answered „handeln" first try (`readClean`, no penalty
    tick) **AND** mechanism answered Dienstag first try (`mechClean`, no `mechStumbled`).
- **pro (the management finale)** = two earnable 0.5s:
  - (a) **Bonus leak:** „Talspiegel kontrollieren" also applied (`monitorStopped`).
  - (b) **Clean finale:** zero baits pulled AND the Spiegel never dipped below `JK_PRO_MIN (45)`
    during the finale (`baitCount === 0 && minLevel >= JK_PRO_MIN`).

**Both genuinely earnable AND missable** so the 1.0–3.0 range is used:
- 3.0 = flawless week + first-try read & back-date + bonus leak + no baits + stayed ≥ 45.
- 2.5 = one stumble (a false flag, or a read/back-date retry, or skipping the bonus leak, or one
  bait, or dipping below 45 once).
- 1.0 = scraped the win (both bonuses missed) — still saved the niere.
- 0 = water hit `JK_FLOOR` → Abstoßung (loss rank).

---

## 11. Sim assertions — `frontend/sim/johanniskraut.sim.ts`

Run with `npx tsx sim/johanniskraut.sim.ts`; mirror Frühstück's `ok(name, cond)` harness and
`process.exit`. Import the data + `outcomeForLevel, stars, DEFAULT_CFG` from `flow`.

**Data model legal vs LEVELS / down-only:**
- `JK_BASELINE < DEFAULT_CFG.band_low` (40 < 55) — primes below the band.
- `JK_DOSE >= band_low && JK_DOSE <= band_high` (62 in [55,70]) — dose lands in the green window.
- `JK_READ_LEVEL < band_low` (49 < 55) — read-the-body torso is visibly under the band.
- `JK_FINALE_START < band_low` and `JK_FINALE_START > JK_FLOOR` (47 in (38,55)).
- `JK_DRAIN_TARGET < JK_FLOOR` (33 < 38) — drive target sits under the floor so the fall reaches it.
- `JK_FLOOR < band_low` and `JK_PRO_MIN < band_low && JK_PRO_MIN > JK_FLOOR` (45 in (38,55)).
- `JK_TICK_DELAY === 0` — the Dienstag delay is a **true no-move** (driveTo NOT called), so the twist
  reads as „verzögert" via the contrast + copy, never as a sub-pump-threshold tick (MUST-FIX #1).
- `JK_TICK_INDUCER >= 4 && JK_TICK_PENALTY >= 4` — every „real" tick is visible on the slow pump.
- **NO target is ever above the band** (down-only): assert no exported level/target `> band_high`.

**Week data integrity:**
- `JK_WEEK_DAYS.length === 7`.
- the cause day `id === JK_CAUSE_DAY` ('di') contains a `kind:'herb'` card and its `inducerTick ===
  JK_TICK_DELAY` (=== 0 — the no-move delay).
- at least one LATE inducer day exists with `inducerTick === JK_TICK_INDUCER` (a visible tick).
- the visible-crash decoy `JK_DECOY_DAY` ('so') contains **no** `kind:'herb'` card (you back-date
  away from it).
- every day's carry `level` is `> JK_FLOOR` and (from Di onward) `< band_low` — the drift stays under
  the band but never trips the floor during the week.

**Mechanism candidate set (the back-date inference, not a sweep — MUST-FIX #3):**
- `JK_MECH_CANDIDATES` includes `JK_CAUSE_DAY` ('di') and `JK_DECOY_DAY` ('so').
- `JK_MECH_CANDIDATES` deep-equals `['di','mi','fr','so']` and has length 4 (a small candidate set, not
  all 7 days).
- every candidate id exists in `JK_WEEK_DAYS`.

**Finale actions:**
- exactly two `kind:'mandatory'` actions, slots `cause` + `contact`; exactly one `kind:'bonus'`
  (slot `monitor`); exactly three `kind:'bait'`.
- `JK_MANDATORY` deep-equals `['absetzen','fachstelle']`.

**Decision → torso target → outcome consistency:**
- finale floor: `outcomeForLevel(JK_DRAIN_TARGET) === 'under'` and `outcomeForLevel(JK_FLOOR) ===
  'under'` (the fall path is an under-loss).
- rescue: `outcomeForLevel(JK_DOSE) === 'win'` (the rescue settle lands in band).
- read-the-body torso: `outcomeForLevel(JK_READ_LEVEL) === 'under'` (under-band → „handeln" right).
- **finale stop-the-fall rule (MUST-FIX #2):** a single mandatory action does NOT arm the rescue —
  assert via a tiny model helper, e.g. `armsRescue(applied: string[]) =
  JK_MANDATORY.every(id => applied.includes(id))`: `armsRescue(['absetzen']) === false`,
  `armsRescue(['fachstelle']) === false`, `armsRescue(['absetzen','fachstelle']) === true`.
- a bait burst from `JK_FINALE_START` (`JK_FINALE_START - JK_BAIT_BURST`) clamped via
  `Math.max(JK_DRAIN_TARGET, …)` stays `>= JK_DRAIN_TARGET` and never goes `> band_high`.

**Scoring traces (win / under; no over path):**
- `stars(true, jkClever(1,0,true,true), jkPro(true,0,50)) === 3` — flawless.
- `stars(true, jkClever(1,1,true,true), jkPro(true,0,50)) === 2.5` — one false flag.
- `stars(true, jkClever(1,0,false,true), jkPro(true,0,50)) === 2.5` — one read/back-date stumble.
- `stars(true, jkClever(1,0,true,true), jkPro(false,0,50)) === 2.5` — skipped the bonus leak.
- `stars(true, jkClever(1,0,true,true), jkPro(true,1,50)) === 2.5` — one bait.
- `stars(true, jkClever(0,2,false,false), jkPro(false,2,40)) === 1` — scraped win, both bonuses lost.
- `stars(false, 1, 1) === 0` — any loss = 0 (Abstoßung).
- `jkClever(0, 0, true, true) === 0.5` (no herb found → detective 0, back-date clean 0.5).
- `jkPro(false, 0, 50) === 0.5` and `jkPro(true, 1, 50) === 0.5` and `jkPro(true, 0, 40) === 0.5`.
- **over is unreachable:** assert there is no exported option/target whose `outcomeForLevel === 'over'`.

---

## Builder checklist (blueprint §8 recipe)

1. Replace `stories/johanniskraut.ts` with the §8 data model (levels from `LEVELS`, week, actions,
   `JK_MECH_CANDIDATES`, `jkClever`/`jkPro`; remove old `induction`/meter fields, `JK_START`,
   `JK_REAL_SLOTS` drag types). Confirm the new `JkWeekDay` interface drops `induction`.
2. Rebuild `screens/JkPlay.svelte` on `PlayShell` + `.pl-*` + `WatchBody` + `drive()`/`pumping` guard
   + the finale-floor `$effect` + EndScreen-outside-`.beat`. **Delete** the `<meter>` gauges, the
   day-height chart, the MCQ trend, the 🛡️-float beat, the numeric „min {level}", the drag machinery
   (tap-to-apply only), and the 4×0.5 score. Dienstag = a true no-move (driveTo NOT called). The
   mechanism leiste exposes only `JK_MECH_CANDIDATES`. In the finale the leak **keeps falling until
   BOTH** mandatory actions are in; the rescue `drive(62,5,onSettle→win)` arms only then; win fires in
   the **settle callback**, not a timer.
3. Create `stories/johanniskraut.locale.ts` (§9); spread into `de` in `locale.svelte.ts` and delete
   the inline `jk.*` block. Reference copy by KEY in the component (e.g. `t('jk.read.observe')`), never
   inline the prose.
4. Write `sim/johanniskraut.sim.ts` (§11); `npx tsx sim/johanniskraut.sim.ts` passes (incl. the
   `JK_TICK_DELAY === 0`, `JK_MECH_CANDIDATES`, and `armsRescue` assertions).
5. `just check` (svelte-check) clean. Browser-smoke the **win** and the **under** loss (over does not
   exist here): verify Dienstag is dead still, the mechanism leiste only lets you tap Di/Mi/Fr/So, and
   stopping only „absetzen" does NOT stop the fall.

## Open risks a builder should watch (calibrate on the bench with the user)
- **Delay reads as „verzögert", not „harmlos".** Dienstag is a true no-move (`JK_TICK_DELAY = 0`), so
  the lesson rests entirely on the **copy** (`jk.week.delay` says „heute nichts — das kommt erst in
  ein paar Tagen") **and the contrast** with the loud Mi/Fr ticks and the later live fall. Verify on
  the bench that a visitor reads the still Dienstag as „wirkt noch nicht", not „unschuldig" — if it
  blurs, strengthen the Dienstag note copy further, never reintroduce a sub-pump-threshold tick.
- **Late inducer tick visibility.** `JK_TICK_INDUCER = 5` must read clearly as a downward move on the
  slow pump. Bump to 6 if 5 is too subtle (brief open question).
- **Read-the-body penalty tick** (`JK_TICK_PENALTY = 4`) must be visible but must **not** itself trip
  `JK_FLOOR` — clamp `Math.max(JK_FLOOR + 1, cur − tick)`.
- **Finale duration.** `47 → 33 @0.7` ≈ 20 s of fall. With **two** mandatory leaks AND the leak NOT
  stopping until both are in, verify a brisk player comfortably stops both while a dawdler can truly
  lose (stop only one → still sinking → can hit `JK_FLOOR`) — tune the start/rate on the bench.
- **Win settle coupling.** Ensure the rescue `drive(62, 5, onSettle→win)` arms **only after BOTH**
  mandatory actions are applied; a single mandatory action neither stops the fall nor arms the win.
