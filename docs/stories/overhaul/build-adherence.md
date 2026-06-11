# BUILD SPEC — „Der Wochen-Pillenplan: Halt den Rhythmus" (`adherence`)

Implementation-ready spec for the torso-first v2 rebuild of story 5. Builder should be able to
write `stories/adherence.ts`, `screens/AdherencePlay.svelte` (replacing `WochePlay.svelte`),
the locale block, and `sim/adherence.sim.ts` with no further design decisions.

Authorities, in order: `docs/stories/blueprint.md` (WINS on any conflict) → this file →
`overhaul/adherence.md` (brief) → `overhaul/README.md` (matrix). Exemplars to copy patterns
from: `screens/FruehstueckPlay.svelte`, `stories/fruehstueck.ts`, `sim/fruehstueck.sim.ts`,
`lib/PlayShell.svelte`, `lib/WatchBody.svelte`, `lib/EndScreen.svelte`, `lib/flow.ts`,
`lib/game.svelte.ts`.

---

## 1. ONE-LINER + MECHANIC VERB

**One-liner.** Lena (22, Epilepsie, Lamotrigin — eine Tablette täglich) must hold a steady
protective Spiegel through Prüfungswoche; the player **authors her whole 7-day Mo–So plan**
(0/1/2 pills per slot, zero time pressure), then **hand-cranks it day by day** ("Nächster
Tag") so each day is one visitor-triggered `driveTo` that carves the player's plan into the
real torso as a living **saw-tooth** — every left gap treads der Spiegel **down**, every
"catch-up" double climbs it **up the wrong way** toward over.

**Verb: COMPOSE-A-WEEK then HAND-CRANK the days (AUTHOR-THE-TIMELINE).**

**Why distinct from the other five** (matrix axes INPUT GESTURE · WHO MOVES PUMP · DIRECTION ·
TIME MODEL · STILLNESS):
- The **only AUTHOR-THE-TIMELINE** verb: the player designs the whole curve *before it plays*,
  with zero pressure, then pulls it through the body one deliberate tap per day. No other story
  lets you pre-compose a sequence.
- The **only saw-tooth** tank picture (down on gaps, up on doses, a double SPIKES toward over).
  Johanniskraut owns the pure monotone-downward drain — its closest neighbour — and is kept
  maximally contrasted: adherence has **no timer and no prompting anywhere in authoring**;
  johanniskraut never lets you pre-author (its week is fixed history you investigate).
- Stillness here = **"die Tablette ganz weglassen / abwarten" makes the pump not move** ("das
  ist nicht die Gefahr hier"). The danger is the *swings*, not zero.

---

## 2. PATIENT & LEARNING

**Case.** Lena, 22, Studentin mit Epilepsie. She takes **Lamotrigin** (an Antiepileptikum /
Antiepileptic) daily for Anfallsschutz (seizure protection). It is **Prüfungswoche**, lots of
stress — one day she forgets the tablet and considers taking **two** the next day to "catch up".

**Real drug + the real PK fact (demonstrator-accurate, simplified, never false):**
- Lamotrigin protects **only at a roughly constant Wirkspiegel (steady state)** — the
  **regularity itself is the therapy**, not any single dose.
- **Skip days → der Spiegel sinks** below the window → loss of protection → breakthrough
  seizure (Durchbruchsanfall). Non-adherence is a leading cause of breakthrough seizures.
- **"Catching up" by doubling → der Spiegel overshoots upward** → dose-dependent toxicity
  (Ataxie, Doppelbilder, Sedierung). It moves the wrong way — toward over, not back to safe.
- After a **single** missed dose: just continue normally with the one tablet; **never double**.
- After a **longer** pause: re-titrate slowly rather than resuming full dose (risk of serious
  skin reactions, SJS/TEN). **Never stop an antiepileptic on your own.** *(adult debrief fact;
  FI-checked before the open day.)*

**The exact lesson the player should leave with — both registers:**
- *young:* „Jeden Tag genau EINE Tablette hält den Schutz gleichmäßig — schau, wie ruhig das
  Wasser im Grünen bleibt. Eine vergessene Tablette holt man NICHT mit zwei nach: zwei auf
  einmal lassen den Spiegel nach oben steigen, nicht zurück ins Grüne — einfach normal mit der
  einen weitermachen."
- *adult:* „Lamotrigin schützt nur bei konstantem Wirkspiegel — die Regelmäßigkeit ist die
  Therapie. Mehr Wirkstoff schiebt den Spiegel immer nach OBEN; eine verpasste Dosis nicht
  verdoppeln (dosisabhängige Toxizität), mit der Einzeldosis fortfahren. Wiederholte
  Auslassungen senken den Spiegel unter das Fenster → Durchbruchsanfall. Antiepileptikum nie
  eigenmächtig absetzen; nach längerer Pause neu eintitrieren (SJS/TEN-Risiko)."

---

## 3. THE LEVEL ARC (every pump move, exact targets)

All from `flow.ts LEVELS`: `start 20 · bandLow 55 · bandHigh 70 · dose 62 · critLow 35 ·
critHigh 80`. **Steady state for this story = `LEVELS.dose` = 62** (held in the green band by
one pill/day). The torso shows ONLY the green window; 35/80 are INVISIBLE internal auto-trip
lines. Per-day deltas (data model §8): `{0: −8 (gap), 1: 0 (held), 2: +16 (double)}`, plus
`ADH_RECOVERY +8` so a single take right after a gap rebounds fully (54 → 62).

| # | Beat / cause | Pump move (from → to) | Rate | What the player reads |
|---|---|---|---|---|
| A | Mount / setup — prime to steady state | 20 → **62** | ~8 | Der Spiegel rises into the green band and **rests still** — „eingestellt = das Wasser ruht im Grünen". |
| B | Authoring (the whole build beat) | **hold 62** (no move) | — | Dead-still water = a held rhythm *looks* calm before a single day plays. Authoring NEVER touches the pump. |
| C | A **held** day (slot 1) | 62 → 62 (`|Δ|<1` → fires `then` after 450 ms, **no move**) | — | Near-stillness — a small breath that settles back = „gehalten / harmlos". (See §7 / Buildability CHANGE 3 — lean on intentional stillness; no fake wobble.) |
| D | A **gap** day (slot 0) | 62 → **54** (Δ −8) | clamp* | Der Spiegel treads **down** one step, clears the green band's low edge — and **waits** for the next tap. |
| E | Read-the-body decision after a gap leaves it low (live, at 54) — **Single, normal weiter** | 54 → **62** | ~3 (slow) | A slow recovery **breath up into the green** — the body heals. |
| E′ | …same decision — **Doppel nachholen** | 54 → **70** (then HOLD ~1 s at top edge) | ~3 | Crawls the **wrong way UP** to the band's top edge, pauses alarmingly near over — overshoots, survives (additive truth, not lethal from a dip). |
| E″ | …same decision — **ganz weglassen / abwarten** | **no move** (no pump call) | — | The pump does **not** move → instant „Nichts passiert — das ist nicht die Lösung". |
| F | **TWIST** — a "catch-up" double on an **already-full** body (62) | 62 → **78** (HOLD ~1 s near over) | clamp* | Climbs alarmingly to **78** — sits just under over, survives but reads clearly „weit zu hoch". |
| F′ | …stacked second double (the over-loss trap) | 78 → **94** → AUTO-TRIP at 80 mid-crawl | clamp* | Der Spiegel crosses the top tape **out of the green** → **LOSE Überdosis**; curve frozen on the doubling day. |
| G | **Staircase** — multiple consecutive gaps (under-loss trap) | 62 → 54 → 46 → 38 → **30** → AUTO-TRIP at 35 on the 4th gap | clamp* | Steps **down** tread by tread; the 4th gap drops below the band toward the floor → **LOSE Unterdosiert**; frozen on the gap day that broke it. |
| H | **Finale** — a surviving plan turned to So | held green ~**62** | — | A calm, flat-topped saw-tooth resting in the green = the proof of the rule, no quiz. → EndScreen `win`. |

\* **clamp**: in-game moves run at the *calibrated pump rate ceiling* — the `rate` arg only
slows *below* it. Do **not** request rate ~9 expecting it honored (the brief assumes the real
pump clamps near ~4 u/s). Differentiate days by **DISTANCE travelled** (−8 gap vs +16 double)
and a **held beat at the extreme**, not by requested rate. Bench-test reachable u/s on the Pi.

**Conventions enforced in the arc:** every demo level that must NOT lose sits with margin — the
single double from full reaches **78** (< 80, „weit zu hoch" with pump margin, never 72); the
recovered gap returns to **62** (a real watchable fall/rise, not a 62→62 no-op). The decision
torso level (54) MATCHES its prompt („Schau, wo das Wasser steht" — it is below the band). The
over/under losses are the only **real** trips (94 / 30).

---

## 4. BEAT-BY-BEAT FLOW (9 beats)

Built on `<PlayShell/>` (`color = game.story?.color ?? '#9aa6c9'`, `kicker =
t('story.adherence.title')`, `caseLine = t('adh.case')`, `step`/`total = 7`,
`onCancel = backToStories`) + the global `.pl-*` kit + `<WatchBody/>` on every pump beat.
`EndScreen` is a DIRECT child of the `position:relative;height:100%` `.root` (NOT inside the
animated `.beat`) — same pattern as `FruehstueckPlay`. Local `drive()` wrapper sets a `pumping`
flag → all buttons `disabled={pumping}`. Manual losses resolved by a component `$effect`
watching `game.level.level` crossing 80/35 (play2 is outside `PLAY_PHASES`).

The flow has TWO scenario phases sharing one authoring beat: the player composes ONE week and
the **same sim** decides which path (held / decision-gap / over-trap / under-trap) plays. There
is no separate scripted twist screen — the twist is whatever the player's own doubles produce
(forced into view by beat 5 — see §5).

| # | beat id | On screen (kit) | Player does | Pump | Star feed |
|---|---|---|---|---|---|
| 0 | `setup` | `.scene`: 🧑‍⚕️/⏰ emoji, `pl-h1` = `adh.brief.patient`, `pl-lead` = `adh.brief.goal`; one `pl-action` „Kalender öffnen". Collapses old Briefing+Steady+Event into ONE beat. | Read; tap to open the calendar. | On mount `drive(62, 8)` → der Spiegel primes 20→62 and **rests still** (establishes „eingestellt"). | — |
| 1 | `build` | `.task`: `pl-h2 center` = `adh.build.prompt`; the **7-slot calendar strip** (Mo–So, each a `.slot` button showing pills `—`/`💊`/`💊💊`); per-slot contextual hint chip flags `leer = vergessen` / `doppelt = nachholen`; `pl-body` hint `adh.build.hint`; `pl-action` „Woche starten" (enabled always — empty/double are legal). **No timer, no prompting** (distinctness lock). | Tap each slot to cycle 0/1/2 (`cycle(d)`); optionally long-press / a small ✕ to clear to 0 (`clearSlot(d)`); tap „Woche starten". | **STILL at 62** the entire beat — authoring never touches the pump (a held rhythm looks like calm water). | feeds **clever** (clean 7×1, first run, no retry) |
| 2 | `play` | `.scene`: NO decorative 🎬/💊/📚. A **day-ticker** (`adh.day.mo`…`adh.day.so`, big), the **PK saw-tooth SVG** (§7) filling in day by day, a `pl-action` „**Nächster Tag**", and `<WatchBody text tone>` pointing at the body. A tiny torso speech-bubble narrates („Spiegel gehalten" / „der Spiegel sackt ab" / „der Spiegel klettert nach oben"). | Tap „Nächster Tag" ONCE per day. **Every move is hand-triggered** — no idle cutscene, no `setTimeout` self-chain. | Per turned day a visitor-triggered `drive(week.levels[d], rate)`: held = near-stillness; gap = 62→54 tread down; double = +16 crawl up. Freezes at `week.tripIndex` on a loss. | — |
| 3 | `decide` | **dose-fill teaching beat lives here? No** — see beat 0/A. This is the **read-the-body decision**, reached when an authored gap left the water low. `.task`: `pl-h2 center` = `adh.decide.prompt` („Was sollte Lena jetzt tun? **Schau, wo das Wasser steht.**"), NO number shown; `.optcol` of options (filtered `adultOnly`); `<WatchBody tone="watch">`. | Tap one option. | Single → `drive(54→62)` heal; Doppel → `drive(54→70)` + hold ~1 s (wrong-way overshoot, survives); Weglassen → **no pump call** (stillness) + a `still`-tone WatchBody „Nichts passiert — das ist nicht die Lösung". After the correct single → `pl-action` „Weiter" back to `play`. | feeds **pro** (correct single on FIRST tap) |
| 4 | `twistDouble` | **The mechanism / twist beat (forced demo, §5).** `.scene`: `pl-h2` = `adh.twist.prompt`, a `pl-action` „Tag drehen" to play the authored double from a full body; then `<WatchBody tone="rising">` „Schau, wie es nach oben klettert — nicht zurück ins Grüne." then a `pl-good`/`pl-warn` landing card `adh.twist.land` + „Weiter". | Tap „Tag drehen" to crank the full-body double. | `drive(62→78)` + HOLD ~1 s near over (alarming, survives). On the trap plan the *second* stacked double then crosses 80 → auto-trip (handled by the play loop, beat 2's freeze). | — |
| 5 | `won` | `.scene` (the **finale** beat, only on a surviving week turned to So): `pl-h2 pl-good` = `adh.won.title`, `pl-lead` = `adh.won.body` („Schau auf den Körper — das ruhige Wasser im Grünen IST der Beweis."), `pl-body` peek `adh.won.peek`, `pl-action` „Weiter". | Read; tap Weiter. | Held steady ~62; the flat-topped saw-tooth rests in the green. | — |
| 6 | `outcome` | **EndScreen** (outside `.beat`): `titleKey/subKey` = `adh.out.<outcome>.title/.sub`, `storyTitleKey = story.adherence.title`, `score = starCount`, `factKeys` = win → `['adh.out.dyk1','adh.out.dyk2']`, over → `['adh.out.dyk.over','adh.out.dyk2']`, under → `['adh.out.dyk.under','adh.out.dyk1']`. On a loss, retry re-authors against the frozen tank where possible. | Read outcome + stars; Nochmal / Geschichten. | Win: rests green ~62. Loss: frozen at the tripping day's critical level (≥80 or ≤35). | shows stars |

**dose-fill teaching beat with rotating facts.** The slow prime (beat 0 / move A, 20→62) is
this story's slow-fill moment: while it pumps, rotate 3–4 „Wusstest du?" cards
(`ADH_FACTS = ['adh.fact.disease','adh.fact.drug','adh.fact.window','adh.fact.timing']`) exactly
like `FruehstueckPlay`'s `dosing` beat (interval `FACT_MS 4500`, min readable `FACT_MIN_MS 3800`,
hold the last fact until `fillDone`, then advance to `build`). This turns the only long fill
into the teaching moment the blueprint requires (disease / drug / window / timing, kid+adult).

**stepNum mapping** (7 dots): `setup`→1, `build`→2, `play`→3, `decide`→4, `twistDouble`→5,
`won`→6, plus a 7th „Beweis/Ergebnis" implied by the EndScreen. (Adjust to taste; keep
`total=7`.)

**Beat ordering note.** `play` is the spine: it advances day-by-day and, depending on the
authored plan, *routes* into `decide` (when a gap leaves the water low and the next slot is a
take/clear that needs a live choice) or `twistDouble` (the first authored double from a full
body) before returning to `play`, then to `won` or `outcome`. Keep `play` OUT of `PLAY_PHASES`
and drive it ourselves, freezing at `simulateWeek`'s `tripIndex` (a transient overshoot during
the slow chase must not auto-trip a plan the sim scored as a win).

---

## 5. THE ONE TANK-SURPRISE TWIST (forced, unavoidable)

**„Nachholen macht es SCHLIMMER, nicht besser — das Wasser klettert die falsche Richtung."**

The visitor's intuition is that a double dose repairs a missed day. On the tank the double does
the **opposite of healing**: from an already-full level (62) the surface travels **UP toward
over** (to 78, holding ~1 s near the danger tape), while a plain single pill is what actually
restores the green. The honest, arithmetic version (the old „same gesture safe once / fatal
next by luck" framing is **CUT** — it taught false state-dependence and had no sim path): a
catch-up double is **never neutral**; from a low post-gap level it overshoots out of the band
(visibly wrong, survives at 70), and from a **full** level it climbs to 78, and **stacked** it
crosses 80 and auto-loses. The lesson is **additive and true**: more drug always pushes UP, so
doubling onto a body that is already topped up is what tips it over.

**Unavoidable as a forced demo beat (`twistDouble`).** This is not a hidden option — the flow
forces the player to crank one full-body double and watch it climb the wrong way before the
finale (model: ddi's mandatory Magenschutz demo). Only the real water delivers it: a number on
a chart wouldn't read as „wrong direction"; the slow climb toward the danger tape, paused at the
extreme, is the whole point.

---

## 6. CHALLENGE DESIGN (non-obvious decision + plausible wrong answers)

**The core challenge is discovery, not being told.** The player must DISCOVER through
composing + watching that doubling overshoots and skipping drops out. Two places carry it:

**(a) The live read-the-body decision (`decide`).** With der Spiegel sitting visibly below the
band and **NO number shown**, the player reads the tank — it dipped but is well clear of the
floor — and picks. Same on-screen buttons; the right answer is dictated purely by where the
water is relative to the band. Options + why each is a *plausible real mistake*:
- ✅ **„Heute EINE Tablette, ganz normal weiter"** → heals 54→62 into the green. The correct,
  unglamorous move.
- ❌ **„Morgen ZWEI nehmen, um es nachzuholen"** → the single most common real patient
  instinct („make up the missed dose"); on the tank it climbs the WRONG way to 70, pausing near
  over. Survives (it's a dip), but visibly wrong. *(This is the wrong answer a thoughtless
  walk-up will pick.)*
- ❌ **„Die Pille heute ganz weglassen / erstmal abwarten"** → a real anxious response; the pump
  does NOT move → stillness = „das ist nicht die Lösung". (The danger is the swings, not zero —
  one skipped day is not yet the loss; but „weglassen" is not the *fix* either.)
- ⚠️ **„Nach Pause die Dosis neu aufbauen"** (`adultOnly`) → correct only for a *longer* pause;
  for one missed day it's over-engineering → still / „nicht es hier".

**(b) The authored plan itself.** A naive „just double to catch up" plan (a gap + a double) is
tempting and *survives but overshoots* (read-the-body honest); a *stacked-double* plan loses
over; a *multi-gap* plan loses under. The clean 7×1 plan is the only flawless one — and that is
discovered, not labelled. No slot is pre-marked right/wrong.

---

## 7. CUSTOM VISUAL — the drawn PK concentration–time curve (light SVG)

The user explicitly wants drawn PK-curves and **this is their natural home.** During `play`
(beat 2) and on the decision/twist beats, render a **light SVG** beside the day-ticker and the
„Schau auf den Körper" arrow — the **authored composition made visible**, ALONGSIDE the physical
pump (the pump stays the instrument; the curve is the score). It is explicitly **qualitative**:
it shows the **shape the player composed**, never a numeric Spiegel readout (no axis labels with
% values, no mirrored gauge), so it does not violate the „no on-screen vessel" rule — the green
**band** drawn on it is the same qualitative reference the copy uses („das grüne Band").

**Renders (Pi-safe, NO heavy blur/filters):**
- A `viewBox="0 0 700 240"` SVG. A flat **green band rect** across the full width at the
  y-range mapping `[bandLow 55 .. bandHigh 70]` (the only marked reference, matching the torso).
  No red line drawn (consistent with the torso). Optionally faint dashed guide lines at the
  edges of the plotting area only.
- **7 day gridlines** (Mo–So) as 1px columns; day labels along the bottom.
- The **curve**: a `<polyline>` (or a `<path>` of straight segments — saw-tooth, no smoothing)
  whose points are `(dayX(d), levelY(week.levels[d]))`. It **fills in day by day** as the player
  cranks: keep `drawnDays` = number of days turned; render only points `0..drawnDays`. A small
  filled **dot** marks the current day's crest/trough. Use `stroke` = `var(--story)` for the
  drawn part; the not-yet-played remainder is not drawn (or a faint dotted preview of the
  *authored* plan if you want a „here's your plan" ghost — optional, keep it dim).
- **Update mechanism:** purely reactive — `drawnDays` is a `$state` bumped in the `play` loop's
  `onSettle`; the polyline `points` is `$derived`. No animation library; the SVG just re-renders
  with one more point. A tripping day draws the crest **above/below the band** and the loss
  freezes the polyline there (the curve „literally stopped at the mistake").
- **Mapping helper** (pure, in `adherence.ts`): `levelToY(level)` mapping `[0..100] → [220..20]`
  (inverted, clamped) and `dayToX(d)` mapping `[0..6] → [40..660]`. Export both so the sim can
  assert the band rect lines up with `LEVELS`.

Keep it light: solid fills, 2–3px strokes, no `filter:`/`backdrop-blur`, no per-frame JS. It
is a **complement to** the torso, never a substitute — the WatchBody arrow and the real water
remain the primary readout; the SVG is the authored saw-tooth made legible.

---

## 8. DATA MODEL — `frontend/src/lib/stories/adherence.ts`

Headless-pure (no Svelte runes). Reuse the existing file's good bones; apply the brief's
retunes (`ADH_DELTA` double `+16`, hand-crank, the PK-curve helpers). `ADH_QUIZ` may stay in the
file but is **no longer a star decider** (the pro star is earned on the tank); its data still
backs the adult debrief fact and an optional in-flow info card.

```ts
// Story „Der Wochen-Pillenplan" (Adhärenz · Lamotrigin) — pure data + sim.
// Torso-first v2 (docs/stories/overhaul/adherence.md). Signature mechanic:
// COMPOSE-A-WEEK then HAND-CRANK — author a 7-slot Mo–So plan (0/1/2 pills), then
// turn each day by hand; the plan becomes a saw-tooth carved into the real torso.
// Lamotrigin protects only at a CONSTANT Spiegel: gaps sink it (under), doubling to
// "catch up" climbs it the WRONG way toward over (additive — more drug pushes UP).
// No invented effect. No on-screen vessel — the pump is the readout; the PK curve is
// the authored shape, qualitative (band only, no numbers).
import { LEVELS, type Outcome } from '../flow'

export const ADH_START: number = LEVELS.dose // steady state = 62, in the green band
export const ADH_DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] // labels (also via adh.day.*)
export const ADH_DELTA: Record<number, number> = { 0: -8, 1: 0, 2: 16 } // gap / held / DOUBLE
export const ADH_RECOVERY = 8 // a single take right after a gap rebounds fully (54 -> 62)
export const ADH_CRIT_HIGH = LEVELS.critHigh // 80 (invisible auto-trip)
export const ADH_CRIT_LOW = LEVELS.critLow // 35 (invisible auto-trip)

// dose-fill "Wusstest du?" cards rotated while the prime pumps in (20 -> 62)
export const ADH_FACTS = ['adh.fact.disease', 'adh.fact.drug', 'adh.fact.window', 'adh.fact.timing']

// live read-the-body decision after a gap leaves the Spiegel low (sitting at ~54).
// target undefined = deliberate STILL (no pump move). Right answer dictated by the body.
export interface AdhDecisionOpt {
  id: string
  labelKey: string
  feedbackKey: string
  result: Outcome | 'still' // 'still' = the no-move "weglassen" answer
  target?: number           // 62 heal / 70 wrong-way overshoot / undefined = still
  holdMs?: number           // dwell at the extreme (the double pauses near over)
  adultOnly?: boolean
}
export const ADH_DECISION: AdhDecisionOpt[] = [
  { id: 'single',    labelKey: 'adh.dec.single',    feedbackKey: 'adh.decfb.single',    result: 'win',   target: 62 },
  { id: 'double',    labelKey: 'adh.dec.double',    feedbackKey: 'adh.decfb.double',    result: 'over',  target: 70, holdMs: 1000 },
  { id: 'omit',      labelKey: 'adh.dec.omit',      feedbackKey: 'adh.decfb.omit',      result: 'still' },
  { id: 'retitrate', labelKey: 'adh.dec.retitrate', feedbackKey: 'adh.decfb.retitrate', result: 'still', adultOnly: true },
]
// NB: the 'double' option's 70 OVERSHOOTS the band's top edge (wrong-way) but SURVIVES
// (70 < critHigh 80). It is scored as a wrong tap, not an instant loss — the loss path is
// the authored stacked-double trap, not this dip. (outcomeForLevel(70) === 'win' is fine:
// 'over' here labels "wrong direction"; the component treats it as a non-correct tap.)

export interface WeekSim {
  levels: number[]   // torso target after each played day
  tripIndex: number  // day index where a critical line broke (-1 = none)
  outcome: Outcome
}
/** Replay an authored week (0=gap, 1=take, 2=double) into a torso trajectory. */
export function simulateWeek(plan: number[]): WeekSim {
  let level = ADH_START
  let prevGap = false
  const levels: number[] = []
  let outcome: Outcome = 'win'
  let trip = -1
  for (let d = 0; d < plan.length; d++) {
    const slot = plan[d]
    let delta = ADH_DELTA[slot] ?? 0
    if (slot === 1 && prevGap) delta += ADH_RECOVERY // single gap recovers fully
    level = Math.max(0, Math.min(100, level + delta))
    levels.push(level)
    prevGap = slot === 0
    if (level >= ADH_CRIT_HIGH) { outcome = 'over'; trip = d; break }
    if (level <= ADH_CRIT_LOW)  { outcome = 'under'; trip = d; break }
  }
  return { levels, tripIndex: trip, outcome }
}
export function isCleanPlan(plan: number[]): boolean {
  return plan.length === ADH_DAYS.length && plan.every((s) => s === 1)
}

// --- PK concentration–time curve (qualitative SVG; band only, no numeric axis) ---
export const ADH_CURVE_W = 700
export const ADH_CURVE_H = 240
export const ADH_PLOT_TOP = 20
export const ADH_PLOT_BOT = 220
export const ADH_PLOT_LEFT = 40
export const ADH_PLOT_RIGHT = 660
/** level 0..100 -> y (inverted, clamped to the plot area). */
export function levelToY(level: number): number {
  const c = Math.max(0, Math.min(100, level))
  return ADH_PLOT_BOT - (c / 100) * (ADH_PLOT_BOT - ADH_PLOT_TOP)
}
/** day index 0..6 -> x across the plot. */
export function dayToX(d: number): number {
  const n = ADH_DAYS.length - 1
  return ADH_PLOT_LEFT + (d / n) * (ADH_PLOT_RIGHT - ADH_PLOT_LEFT)
}

/** clever bonus: clean 7x1 first run (no retry) = 1; recovered-gap/retry win = 0.5; else 0. */
export function adhCleverGrade(planClean: boolean, retried: boolean): number {
  return planClean && !retried ? 1 : 0.5
}
/** pro bonus: correct live decision on FIRST tap = 1; corrected after a wrong tap = 0.5;
 *  a flawless clean run with NO gap to decide auto-earns 1 (proved by held water). */
export function adhProGrade(decisionFacedAndFirstTry: boolean, hadToCorrect: boolean, cleanNoDecision: boolean): number {
  if (cleanNoDecision) return 1
  if (decisionFacedAndFirstTry) return 1
  return hadToCorrect ? 0.5 : 0
}

// legacy closing quiz — KEPT as data only (NOT a star decider); backs the debrief fact.
export interface AdhQuizOpt { id: string; labelKey: string; feedbackKey: string; correct: boolean; adultOnly?: boolean }
export const ADH_QUIZ: AdhQuizOpt[] = [
  { id: 'normal',    labelKey: 'adh.q.normal',    feedbackKey: 'adh.qfb.normal',    correct: true },
  { id: 'double',    labelKey: 'adh.q.double',    feedbackKey: 'adh.qfb.double',    correct: false },
  { id: 'stop',      labelKey: 'adh.q.stop',      feedbackKey: 'adh.qfb.stop',      correct: false },
  { id: 'retitrate', labelKey: 'adh.q.retitrate', feedbackKey: 'adh.qfb.retitrate', correct: false, adultOnly: true },
]
```

**Builder TODO outside this file:** rename `screens/WochePlay.svelte` →
`screens/AdherencePlay.svelte` and update the import in `App.svelte` (line 11 + line 91). Keep
`game.story?.id === 'adherence'` routing.

---

## 9. FULL COPY

Per the blueprint §6, story copy should live in `frontend/src/lib/stories/adherence.locale.ts`
exporting `export const adherenceLocale: Record<string,string> = { … }`, merged into the `de`
dict in `locale.svelte.ts`. **Note for the builder:** today the codebase keeps story copy inline
in `locale.svelte.ts` (the `*.locale.ts` split is not yet wired — Frühstück is still inline). So
either (a) create `adherence.locale.ts` AND add the merge (`const de = { ...base,
...adherenceLocale }` or `Object.assign`), removing the old `adh.*` block from
`locale.svelte.ts`; or (b) drop these keys inline replacing the old `adh.*` block. Prefer (a)
to match the blueprint. The PREFIX stays `adh.` so any shared resolution is unaffected; shared
keys (`common.*`, `reveal.in`, `out.*`, `rank.*`, `story.adherence.title`) already exist — do
not redefine them.

Mined & rewritten from the old `adh.*` copy (good pharmacology + rank/debrief reused; rewritten
to the new mechanic and conventions: „der Spiegel" never „Wasser" for the level metaphor in
copy that names the model; „der grüne Bereich"/„das grüne Band" never „rote Linie"; patient-
framed decisions; the eyes always sent to the body).

```ts
export const adherenceLocale: Record<string, string> = {
  // ── case header (PlayShell caseLine) ──
  'adh.case': 'Lena, 22 · Epilepsie · Lamotrigin',

  // ── beat 0: setup (collapsed briefing + steady + event) ──
  'adh.brief.patient': 'Das ist Lena, 22. Sie studiert und hat Epilepsie. Eine kleine Tablette jeden Tag sorgt dafür, dass keine Anfälle kommen.',
  'adh.brief.patient.adult': 'Lena, 22, Studentin mit Epilepsie. Sie nimmt Lamotrigin (Antiepileptikum) zum Anfallsschutz – eine Tablette täglich.',
  'adh.brief.goal': 'Es ist Prüfungswoche und viel los. Hilf Lena, ihren Rhythmus zu halten: jeden Tag genau eine Tablette. Bau zuerst ihre ganze Woche – ganz in Ruhe, ohne Zeitdruck.',
  'adh.brief.goal.adult': 'Prüfungswoche, viel Stress. Halte Lenas Wirkspiegel über die Woche konstant im grünen Bereich. Plane zuerst die ganze Woche (Mo–So) – ohne Zeitdruck, danach spielst du sie Tag für Tag ab.',
  'adh.setup.btn': 'Kalender öffnen',

  // dose-fill "Wusstest du?" cards (while the prime 20 -> 62 pumps in)
  'adh.fact.kicker': 'Wusstest du?',
  'adh.fact.disease': 'Bei Epilepsie schützt ein gleichmäßiger Wirkstoff-Spiegel vor Anfällen – jeden Tag gleich viel.',
  'adh.fact.disease.adult': 'Epilepsie: Anfallsschutz hängt am konstanten Wirkspiegel. Schwankungen – nach oben oder unten – sind das Risiko.',
  'adh.fact.drug': 'Lamotrigin ist Lenas Anfallsschutz. Es wirkt nur, wenn immer gleich viel im Blut ist.',
  'adh.fact.drug.adult': 'Lamotrigin (Antiepileptikum): Wirkung über den Steady State – nicht über die einzelne Tablette.',
  'adh.fact.window': 'Der grüne Bereich ist genau richtig: zu wenig schützt nicht, zu viel macht müde und schwindelig.',
  'adh.fact.window.adult': 'Therapeutischer Bereich: darunter kein Schutz (Durchbruchsanfall), darüber dosisabhängige Toxizität (Ataxie, Doppelbilder).',
  'adh.fact.timing': 'Am besten jeden Tag zur gleichen Zeit – so bleibt der Spiegel ruhig im Grünen.',
  'adh.fact.timing.adult': 'Feste Einnahmezeit hält den Spiegel stabil; eine vergessene Dosis wird NICHT durch Verdoppeln ausgeglichen.',
  'adh.setup.cue': 'Schau auf den Körper – der Spiegel steigt ruhig in den grünen Bereich.',
  'adh.setup.cue.adult': 'Schau auf den Körper – der Wirkspiegel läuft in den therapeutischen Bereich ein.',
  'adh.setup.filled': 'Eingestellt. Das Wasser ruht jetzt ruhig im Grünen – das ist Lenas guter Rhythmus.',
  'adh.setup.filled.adult': 'Steady State erreicht – der Spiegel ruht im grünen Bereich. Genau diesen Zustand soll der Plan halten.',

  // ── beat 1: build the week (the signature authoring beat) ──
  'adh.build.prompt': 'Bau Lenas Woche – ganz in Ruhe. Tippe jeden Tag: einmal = eine 💊, nochmal = zwei (nachholen), nochmal = leer (vergessen).',
  'adh.build.prompt.adult': 'Erstelle Lenas 7-Tage-Plan (Mo–So), ohne Zeitdruck. Tippen wechselt pro Tag: eine Tablette → doppelt („Nachholen") → leer (vergessene Dosis).',
  'adh.build.hint': 'Tipp: probier ruhig aus, was passiert – z. B. einen Tag leer lassen oder einen Tag doppeln. Beim Abspielen zeigt dir der Körper, wohin der Spiegel geht.',
  'adh.build.hint.adult': 'Du darfst Lücken und Doppeldosen einbauen – die Wiedergabe zeigt dir am Körper, in welche Richtung der Spiegel läuft.',
  'adh.slot.empty': 'leer · vergessen',
  'adh.slot.one': 'eine Tablette',
  'adh.slot.double': 'doppelt · nachholen',
  'adh.slot.tap': 'tippen',
  'adh.build.play': 'Woche starten',

  // ── day ticker (beat 2) ──
  'adh.day.mo': 'Montag', 'adh.day.di': 'Dienstag', 'adh.day.mi': 'Mittwoch',
  'adh.day.do': 'Donnerstag', 'adh.day.fr': 'Freitag', 'adh.day.sa': 'Samstag', 'adh.day.so': 'Sonntag',

  // ── beat 2: hand-crank playback ──
  'adh.play.prompt': 'Dreh die Woche Tag für Tag. Schau bei jedem Tag auf den Körper – dein Plan wird zur Kurve.',
  'adh.play.prompt.adult': 'Spiele die Woche tagweise ab. Bei jedem Tag folgt der Spiegel am Körper deinem Plan.',
  'adh.play.next': 'Nächster Tag',
  'adh.play.watch.held': 'Schau auf den Körper – der Spiegel bleibt ruhig im Grünen. Gehalten.',
  'adh.play.watch.held.adult': 'Schau auf den Körper – der Spiegel hält sich im therapeutischen Bereich (gehalten).',
  'adh.play.watch.gap': 'Schau auf den Körper – der Spiegel sackt eine Stufe ab, unter den grünen Bereich.',
  'adh.play.watch.gap.adult': 'Schau auf den Körper – die ausgelassene Dosis senkt den Spiegel unter das Fenster.',
  'adh.play.watch.up': 'Schau auf den Körper – der Spiegel klettert nach oben, in Richtung „zu hoch".',
  'adh.play.watch.up.adult': 'Schau auf den Körper – die Doppeldosis treibt den Spiegel nach oben, über den grünen Bereich.',
  'adh.bubble.held': 'Spiegel gehalten',
  'adh.bubble.gap': 'der Spiegel sackt ab',
  'adh.bubble.up': 'der Spiegel klettert nach oben',

  // ── beat 3: live read-the-body decision ──
  'adh.decide.prompt': 'Lena hat eine Tablette vergessen. Was sollte sie jetzt tun? Schau, wo das Wasser steht – tief, aber noch nicht am Boden.',
  'adh.decide.prompt.adult': 'Lena hat eine Dosis ausgelassen; der Spiegel sitzt unter dem grünen Bereich (klar über der unteren Grenze). Wie sollte sie fortfahren? Lies den Körper.',
  'adh.dec.single': 'Heute EINE Tablette, ganz normal weiter',
  'adh.dec.double': 'Morgen ZWEI nehmen, um es nachzuholen',
  'adh.dec.omit': 'Die Pille heute ganz weglassen und abwarten',
  'adh.dec.retitrate': 'Die Dosis langsam neu aufbauen',
  'adh.decfb.single': 'Genau – schau, wie der Spiegel ruhig zurück ins Grüne steigt. Eine vergessene Tablette holt man NICHT mit zwei nach.',
  'adh.decfb.single.adult': 'Korrekt – mit der Einzeldosis fortfahren; der Spiegel kehrt in den therapeutischen Bereich zurück. Verpasste Dosis nicht verdoppeln.',
  'adh.decfb.double': 'Schau auf den Körper – zwei auf einmal lassen den Spiegel nach OBEN klettern, nicht zurück ins Grüne. Das ist die falsche Richtung.',
  'adh.decfb.double.adult': 'Falsch – „Nachholen" treibt den Spiegel nach oben (dosisabhängige Toxizität); mehr Wirkstoff schiebt ihn immer hinauf, nicht zurück.',
  'adh.decfb.omit': 'Nichts passiert – das Wasser bewegt sich nicht. Weglassen ist nicht die Lösung; einfach normal mit der einen Tablette weiter.',
  'adh.decfb.omit.adult': 'Nichts passiert – Aussetzen löst das Problem nicht (und Antiepileptika nie eigenmächtig absetzen). Mit der üblichen Einzeldosis fortfahren.',
  'adh.decfb.retitrate': 'Das gilt erst nach einer LÄNGEREN Pause – hier war nur ein Tag. Da reicht: normal mit der einen Tablette weiter.',
  'adh.decfb.retitrate.adult': 'Nur nach längerer Pause korrekt (dann neu eintitrieren – sonst Risiko schwerer Hautreaktionen, SJS/TEN). Für eine einzelne vergessene Dosis genügt die normale Einzeldosis.',
  'adh.decide.next': 'Weiter',

  // ── beat 4: the twist (forced full-body double) ──
  'adh.twist.prompt': 'Und wenn Lena an einem schon „vollen" Tag verdoppelt? Dreh den Tag und schau genau hin.',
  'adh.twist.prompt.adult': 'Was macht eine Doppeldosis auf einen bereits vollen Spiegel? Spiele den Tag ab und beobachte die Richtung.',
  'adh.twist.btn': 'Tag drehen',
  'adh.twist.cue': 'Schau, wie der Spiegel nach oben klettert – nahe an „zu hoch", nicht zurück ins Grüne.',
  'adh.twist.cue.adult': 'Schau, wie der Spiegel steigt – bis dicht unter „über den Bereich". Mehr Wirkstoff schiebt immer nach oben.',
  'adh.twist.land': 'Nachholen macht es schlimmer, nicht besser: das Wasser steigt die falsche Richtung. Ein zweites Mal verdoppeln – und es kippt über den grünen Bereich.',
  'adh.twist.land.adult': 'Additive Wahrheit: „Nachholen" ist nie neutral. Aus dem vollen Körper treibt die Doppeldosis nach oben; gestapelt kippt der Spiegel über die kritische Grenze.',

  // ── beat 5: finale ──
  'adh.won.title': 'Rhythmus gehalten!',
  'adh.won.body': 'Schau auf den Körper – das ruhige Wasser im Grünen IST der Beweis. Jeden Tag genau eine, die ganze Woche.',
  'adh.won.body.adult': 'Schau auf den Körper – der flache, im grünen Bereich ruhende Verlauf belegt die Regel: konstant einnehmen, nie verdoppeln.',
  'adh.won.peek': 'Sehen wir uns das Ergebnis an.',

  // ── outcomes (EndScreen) ──
  'adh.out.win.title': 'Rhythmus gehalten! 🎉',
  'adh.out.win.sub': 'Jeden Tag genau eine – Lena ist die ganze Woche sicher geschützt. Der Spiegel ruht im Grünen.',
  'adh.out.win.sub.adult': 'Konstanter Spiegel über die Woche – durchgehender Anfallsschutz im therapeutischen Bereich.',
  'adh.out.over.title': 'Überschossen! ⚠️',
  'adh.out.over.sub': 'Zwei auf einmal haben den Spiegel über den grünen Bereich getrieben – das macht müde, schwindelig und unsicher auf den Beinen.',
  'adh.out.over.sub.adult': 'Überdosis durch „Nachholen" → dosisabhängige Toxizität (Ataxie, Doppelbilder, Sedierung). Verpasste Dosis niemals verdoppeln.',
  'adh.out.under.title': 'Schutz weg …',
  'adh.out.under.sub': 'Zu oft vergessen – ohne genug Wirkstoff bricht der Schutz weg, ein Anfall kann kommen.',
  'adh.out.under.sub.adult': 'Unterdosiert durch wiederholte Auslassungen → Spiegel unter dem Fenster → Durchbruchsanfall.',
  'adh.out.dyk1': 'Jeden Tag genau eine Tablette hält den Schutz gleichmäßig – Regelmäßigkeit ist hier die Medizin.',
  'adh.out.dyk1.adult': 'Lamotrigin schützt nur bei konstantem Wirkspiegel – die Regelmäßigkeit selbst ist die Therapie.',
  'adh.out.dyk2': 'Eine vergessene Tablette nicht mit zwei nachholen – einfach normal mit der einen weitermachen.',
  'adh.out.dyk2.adult': 'Verpasste Dosis nicht verdoppeln (Toxizität). Nach längerer Pause neu eintitrieren (sonst Risiko SJS/TEN); Antiepileptikum nie eigenmächtig absetzen.',
  'adh.out.dyk.over': 'Mehr Wirkstoff schiebt den Spiegel immer nach oben – auf einen vollen Körper draufgesetzt kippt er über den grünen Bereich.',
  'adh.out.dyk.over.adult': '„Nachholen" ist additiv und nie neutral: aus einem vollen Spiegel überschießt die Doppeldosis – das ist die häufige, gefährliche Fehlannahme.',
  'adh.out.dyk.under': 'Mehrere Tage hintereinander vergessen, und der Schutz sackt Stufe für Stufe weg.',
  'adh.out.dyk.under.adult': 'Non-Adhärenz ist eine Hauptursache von Durchbruchsanfällen – wiederholte Auslassungen senken den Spiegel unter das Fenster.',

  // ── legacy quiz strings (data-only; back the debrief; not a star decider) ──
  'adh.q.normal': 'Einfach normal mit einer Tablette weitermachen',
  'adh.q.double': 'Am nächsten Tag zwei nehmen, um es nachzuholen',
  'adh.q.stop': 'Lieber ganz aufhören, ist eh stressig',
  'adh.q.retitrate': 'Nach einer längeren Pause die Dosis langsam neu aufbauen',
  'adh.qfb.normal': 'Genau! Eine vergessene Tablette holt man nicht durch zwei nach – einfach normal weiter.',
  'adh.qfb.normal.adult': 'Korrekt – vergessene Dosis nicht verdoppeln; mit der üblichen Einzeldosis fortfahren.',
  'adh.qfb.double': 'Nein – zwei auf einmal ist zu viel. Der Spiegel schießt über, das wird gefährlich.',
  'adh.qfb.double.adult': 'Falsch – Verdopplung führt zu dosisabhängiger Toxizität (Ataxie, Doppelbilder, Sedierung).',
  'adh.qfb.stop': 'Nein – ohne Tabletten fehlt der Schutz, dann können Anfälle kommen.',
  'adh.qfb.stop.adult': 'Falsch – Absetzen entzieht den Anfallsschutz → Durchbruchsanfälle; AED nie eigenmächtig abbrechen.',
  'adh.qfb.retitrate': 'Das gilt für eine längere Pause – hier war nur ein Tag. Da reicht: einfach normal weitermachen.',
  'adh.qfb.retitrate.adult': 'Richtig nur für eine längere Pause (dann neu eintitrieren – sonst Risiko SJS/TEN). Für eine einzelne vergessene Dosis genügt: normal weitermachen.',
}
```

**Also update** `story.adherence.title` / `.desc` for the new framing (currently „Eine Tablette
zu viel … oder zu wenig?"). Keep the title „Der Wochen-Pillenplan"; refresh the desc to e.g.
`'Bau Lenas Woche – halt den Rhythmus. (Regelmäßigkeit als Therapie)'`. Note the `ar` dict's
`story.adherence.*` is stale („جرعة مضاعفة عن طريق الخطأ") — out of scope, but flag it.

---

## 10. SCORING

`stars(win, clever, pro)` from `flow.ts` → 1.0 base + clever[0/0.5/1] + pro[0/0.5/1]; any loss
(over/under) = 0.

- **WIN base (1.0) — „Geschützt":** the week ended settled in the green band (turned to So,
  no trip).
- **CLEVER (`adhCleverGrade`) — „Sauberer Plan":** **1.0** for exactly one pill in all seven
  slots on the **FIRST** run (no empty, no double, no retry — the flat calm saw-tooth); **0.5**
  for a win that needed a recovered gap or a retry. *(Earnable: clean 7×1; missable: any gap/
  double/retry knocks it to 0.5.)*
- **PRO (`adhProGrade`) — earned ON THE TANK, not a quiz:** **1.0** for answering the live
  read-the-body decision correctly on the **FIRST** tap (the single calm pill that heals the
  water into green — the visitor proved „nicht verdoppeln" by water travel); **0.5** if they
  tapped a wrong option first (the no-move „weglassen", the wrong-way double, or the adult
  „retitrate") before correcting. A flawless clean 7×1 run has **no gap to decide** → pro auto
  = 1.0 (`cleanNoDecision`), because the held water already proved the rule. *(Earnable: first-
  try single; missable: a wrong tap first → 0.5.)*

Resulting spread (uses the full 1.0–3.0 range): flawless clean 7×1 → **3.0** („SafePolyMed-
Meister" / „Klinische:r Pharmazeut:in"); a win with one recovered gap answered right first-try
→ **2.5**; a sloppy-but-survived week (recovered gap, wrong tap first, or a retry) → **1.5–2.0**;
any over/under → **0** (loss rank). **The old closing rule-quiz is DELETED as a star decider.**

---

## 11. SIM ASSERTIONS — `frontend/sim/adherence.sim.ts`

Run: `npx tsx sim/adherence.sim.ts` (must pass). Mirror `fruehstueck.sim.ts`'s `ok()` harness.
Import from `stories/adherence` + `outcomeForLevel, stars, DEFAULT_CFG, LEVELS` from `flow`.

**Data model legal vs LEVELS:**
- `ADH_START === LEVELS.dose` and lands in the band (`>= bandLow && <= bandHigh`).
- `ADH_DELTA` = `{0:-8, 1:0, 2:16}`; `ADH_RECOVERY === 8`.
- `ADH_CRIT_HIGH === LEVELS.critHigh (80)`, `ADH_CRIT_LOW === LEVELS.critLow (35)`.
- The 7-day clean plan `isCleanPlan([1,1,1,1,1,1,1]) === true`; a plan with any 0 or 2 → false.

**Decision options → torso target → outcome consistency:**
- `ADH_DECISION` has exactly one `result==='win'` (`single`, target 62, lands in band:
  `outcomeForLevel(62)==='win'`).
- `double` target 70 OVERSHOOTS the top edge but survives: `70 < ADH_CRIT_HIGH` AND
  `70 === LEVELS.bandHigh` (the wrong-way edge), with `holdMs > 0`.
- `omit` and `retitrate` have `target === undefined` (the no-move stillness path); `retitrate`
  is `adultOnly === true`.
- Every option's `result` is one of `win|over|under|still`.

**`simulateWeek` traces (each: plan → levels → tripIndex → outcome):**
- Clean week `[1×7]` → all levels `=== 62`, `tripIndex === -1`, `outcome === 'win'`.
- Gap→single recover `[1,0,1,1,1,1,1]` → levels include `62,54,62,…`; never trips; `outcome
  'win'` (the 54 dip is below the band but above crit-low: `54 < bandLow && 54 > critLow`).
- Single double from full `[1,1,2,1,1,1,1]` → the double day hits `78` (`62→…→78`), `78 < 80`,
  no trip, `outcome 'win'` (alarming but survives — the twist demo level).
- Stacked doubles `[2,2,…]` → `62→78→94`, trips `over` at day index 1 (`tripIndex === 1`,
  `levels[1] >= 80`).
- Staircase `[0,0,0,0,…]` → `62→54→46→38→30`, trips `under` on the **4th** gap (`tripIndex ===
  3`, `levels[3] <= 35`).
- Assert every produced level in a winning trace stays `> critLow && < critHigh`.

**Curve helpers:**
- `levelToY(LEVELS.bandLow) > levelToY(LEVELS.bandHigh)` (inverted axis: higher level = smaller
  y) and both within `[ADH_PLOT_TOP, ADH_PLOT_BOT]`.
- `dayToX(0) === ADH_PLOT_LEFT`, `dayToX(6) === ADH_PLOT_RIGHT`, monotonic increasing.

**Scoring traces (win/over/under) via `stars()` + the grades:**
- Flawless clean 7×1, no decision: `stars(true, adhCleverGrade(true,false), adhProGrade(false,
  false,true)) === 3`.
- Win with one recovered gap answered first-try: `stars(true, adhCleverGrade(false,false),
  adhProGrade(true,false,false)) === 2.5`.
- Win, recovered gap, wrong tap first then corrected: `stars(true, 0.5, 0.5) === 2.0`.
- Over loss: `outcomeForLevel(94) === 'over'` and `stars(false, 1, 1) === 0`.
- Under loss: `outcomeForLevel(30) === 'under'` and `stars(false, 1, 1) === 0`.
- `adhProGrade(false,false,false) === 0` (faced a decision, never got it right) and a loss → 0.

End with the `fails === 0 ? '✅ ALL PASS' : …` summary + `process.exit`.

---

## Builder checklist (per blueprint §8)

1. Write `stories/adherence.ts` (§8) — replace the existing file's body with the retuned model.
2. Write `screens/AdherencePlay.svelte` on `PlayShell` + `.pl-*` + `WatchBody` + `drive()`/
   `pumping` guard + the manual-loss `$effect` + EndScreen-outside-`.beat` + the PK-curve SVG
   (§7). Hand-cranked playback (NO `setTimeout` self-chain). Rename from `WochePlay.svelte`;
   update `App.svelte` imports (lines 11, 91).
3. Write the copy as `stories/adherence.locale.ts` (§9) and merge into `de`; delete the old
   `adh.*` block from `locale.svelte.ts`.
4. Write `sim/adherence.sim.ts` (§11); `npx tsx sim/adherence.sim.ts` passes.
5. `just check` (svelte-check) clean. Browser-smoke the clean win + over-trap + under-trap.

## Open risks a builder should watch
- **Hardware pacing.** Do NOT trust `rate`; bench the real Pi pump's reachable u/s. Lock day
  differentiation to MOVE SIZE (−8 gap vs +16 double) + a ~1 s hold at the extreme. Confirm a
  hand-cranked +16 day still crawls visibly (~2–4 s) so the climb-toward-over reads.
- **Transient overshoot during the slow chase.** Keep `play` OUT of `PLAY_PHASES`; freeze the
  curve at `simulateWeek`'s `tripIndex`, so a transient overshoot mid-crawl can't auto-trip a
  plan the sim scored a win.
- **The „breath" on a held day.** Δ0 hits `driveTo`'s `|target-cur|<1` shortcut → no move. Lean
  copy on intentional near-stillness („das Wasser bleibt ruhig") rather than a fake ±2 wobble
  the tank can't show. Only add a dailyPulse if the bench proves ±2 is perceptible.
- **Tuning the over/under split.** Verify on the real torso that the full-body single double
  (62→78) sits just under 80 without a transient trip, while stacked doubles (62→78→94) and the
  full-body decision-double reliably cross 80. Confirm +16 (vs +14/+18) gives the cleanest
  deterministic split.
- **FI accuracy.** FI-Gegencheck the two public claims („vergessene Dosis nicht verdoppeln" and
  „nach längerer Pause neu eintitrieren → SJS/TEN-Risiko") against the current German
  Fachinformation of the specific Lamotrigin product before the open day; adopt its wording for
  the adult debrief fact.
- **Retry/reset throughput.** Confirm retry can re-author against the frozen tank (loss freezes
  at 80/30) without a full crawl back to 62; if a reset is unavoidable, make it the shortest
  path into the green.
- **Stale `ar` story.adherence.*** strings describe the *old* story — out of scope here but
  worth a follow-up.
