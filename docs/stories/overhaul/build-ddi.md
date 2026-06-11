# Build spec — „Die Blut-Balance" (`ddi`) · SCAN-A-PAIRING

Implementation-ready spec for the DDI story, written to the blueprint bar (Frühstück =
the worked exemplar). This is the **reference build**: it is the first story to be
rebuilt on `PlayShell` + the `.pl-*` kit + `WatchBody` + a per-story `ddi.locale.ts`, and
it must prove the shared grammar (eyes-to-body, `testHypothesis` stillness, the
manual-trip `$effect`, EndScreen handoff) that the other five copy.

> **Status note for the builder:** a v2 `screens/DdiPlay.svelte` + `stories/ddi.ts`
> already exist and implement the mechanic, BUT against the OLD style (`Backdrop`, inline
> `.btn`/`.opt`, hand-rolled `<h1>`/`<h2>`/`.beat`, no `pumping` guard) and with RETIRED
> copy (`„rote Linie"`, `„das Wasser steigt"`). **The existing `DdiPlay.svelte` shares
> ~zero markup with the target — treat this as a template-level REWRITE, not an edit:**
> copy the markup + `.beat`/`.scene`/`.task`/EndScreen structure wholesale from
> `FruehstueckPlay.svelte`, and carry over ONLY the script-level state machine (the `beat`
> enum, the scanner/demo/strategy/sort handlers) and the manual-trip `$effect`. Do not
> inherit `Backdrop` or any `.btn`/`.opt` styles. All copy moves into
> `stories/ddi.locale.ts` with canonical „grüner Bereich" language. Mine the existing
> `ddi.*` keys in `locale.svelte.ts` for the pharmacology; rewrite per §9.

---

## 1. One-liner + the unique mechanic verb

**One-liner.** Herr Schmidt (72, Vorhofflimmern) is years-stable on a blood-thinner; a new
antibiotic is prescribed for his bronchitis. The player **locks the new antibiotic as ONE
fixed probe** and scans it against each pill already in his plan. Four pairings hold the
torso **dead still** (vertragen sich); the blood-thinner pairing makes der Spiegel **climb
on its own** toward bleeding. Then the player must read how high the real water sits and
talk it back into the green window without tipping it over (Blutung) or under (Klumpen).

**Verb: SCAN-A-PAIRING — still·still·still·still·SURGE.** Aim one fixed probe across many
pills; the answer is the tank's non-movement four times in a row, then one self-climb.

**Why distinct from the other five:**
- **Frühstück (subtract):** you *remove* items and water *falls/rests*. DDI *keeps one
  probe locked* and *scans*; the right pairing makes water *rise on its own*. Opposite
  polarity + opposite gesture (the set's sharpest near-collision — copy locks below; never
  write „nimm weg/entfernen", only „prüfen/scannen").
- **Gene (bet-then-pour):** stillness is preceded by a *wager* ("this body has no
  machine"). DDI's stillness is a *discovered verdict* — no prediction precedes it.
- **Organ (catch-a-rate):** organ titrates a dose against a live drain. DDI's dose is
  fixed and correct from the start; there is no "find the right dose."
- **Adherence (author-time):** composes a 7-day curve. DDI is instant cause→effect.
- **Johanniskraut (back-date-a-lag):** a delayed multi-day *drain* you trace to a past
  day. DDI is a pairing scan with no time axis and no stillness-as-history.
- DDI is the **only FIXED-PROBE-VS-MANY** verb and the **only one that weaponises a RUN of
  stillnesses** so the single surge lands. It is also the **only story with BOTH an over
  and an under loss that come from DIFFERENT decisions** (over = "just take both / only
  stomach-protection / self-reduce"; under = "stop the thinner out of fear").

---

## 2. Patient & learning

**Case.** Herr Schmidt, 72. **Vorhofflimmern** (heart out of rhythm). Years stable on the
blood-thinner **Phenprocoumon (Marcumar)** — his Blut-Balance is „genau richtig dünn." He
catches a **Bronchitis** and is newly prescribed the antibiotic **Clarithromycin**.

**The real interaction (demonstrator-accurate, directionally true, simplified).**
Clarithromycin **potentiates** Phenprocoumon — it makes the existing blood-thinner
*stronger* over the next days (a multi-day INR rise, not instantaneous). The result is
**too-thin blood → bleeding risk** (the level rises ABOVE the window). The mechanism is
soft for adults — „über mehrere Abbau-/Transportwege" (it slows the drug's breakdown in
Darm und Leber; do **not** write „v.a. CYP3A4-metabolisiert" — Phenprocoumon's clinically
dominant Clarithromycin interaction is *not* cleanly one-enzyme, so the vague phrasing is
the *more* accurate choice). For young, „das neue Antibiotikum macht den Blutverdünner
STÄRKER."

**The exact PK lesson the player leaves with:**

| | Kid phrasing | Adult phrasing |
|---|---|---|
| Cross-check | Eine neue Tablette muss zum GANZEN Plan passen — vorher Apotheke/Arztpraxis fragen. | Jede Neuverordnung gegen den Gesamtbestand cross-checken. |
| Direction | Das neue Antibiotikum macht den Blutverdünner STÄRKER → die Blut-Balance steigt zu hoch. | Die Interaktion erhöht die Antikoagulation → INR steigt über Tage → Blutungsrisiko (Richtung „zu stark", nicht „zu schwach"). |
| Two-sided danger | Zu viel Verdünner = Blutung. Zu wenig = gefährliche Klumpen. Beides riskant. | Zu hoch = Blutung; eigenmächtiges Absetzen = Verlust des Schlaganfallschutzes → Thrombose/Embolie. |
| Symptom ≠ fix | Magenschutz schützt den Magen, senkt die Blut-Balance aber NICHT. | Ein PPI senkt den INR nicht; Symptomschutz ersetzt kein Interaktionsmanagement (PPI neutral, nicht schädlich). |
| Never self-stop | Den Blutverdünner nie allein weglassen. | VKA nie eigenmächtig absetzen — Management = Antibiose anpassen / engmaschige INR-Kontrolle. |

---

## 3. The level arc (every pump move, exact numbers from `LEVELS`)

Source of truth: `flow.ts LEVELS` → start 20, bandLow 55, bandHigh 70, dose 62, critLow 35,
critHigh 80. Constants below live in `stories/ddi.ts`. **All teaching/demo highs sit
CLEARLY over band_high 70 with full pump margin (≥~8 units: `78`/`79`), so an imperfect
real pump still reads „out of the window" — a value 1–2 over 70 (e.g. the old `72`) is
FORBIDDEN by the blueprint because it reads as „still at the top of the band" and kills the
scanner's payoff. They still stay under the invisible critHigh 80 (no trip during teaching).
The Stage-5 decision torso MATCHES its prompt (left HIGH at 79, then a real watchable
move).**

| Beat | From → To | Rate (u/s) | Cause | What the player reads |
|---|---|---|---|---|
| onMount briefing | 20 → 62 (`DDI_START`) | 7 | Prepare-fill into the window | Living green baseline — „so soll es sein" |
| 1 lines (teach) up | 62 → 78 (`DDI_LINE_HIGH`) | 6 | Demo of „too high" | Water climbs CLEARLY over the top green edge → „zu dünnes Blut" (78 > 70, < 80) |
| 1 lines (teach) down | 78 → 50 (`DDI_LINE_LOW`) | 6 | Demo of „too low" | Water drops below the green band → „gefährliche Klumpen" (50 < 55, > 35) |
| 1 lines (teach) back | 50 → 62 | 6 | Reset to calm | „genau richtig — im grünen Bereich" |
| 2 drop new card | hold 62 | — (no `driveTo`) | The new pill ALONE | DEAD STILL — „allein im Plan noch nichts kombiniert" (seed stillness) |
| 3 scan harmless ×4 | hold 62 | — (~1.4 s each) | Antibiotic × Herz/Blutdruck/Zucker/Magenschutz | DEAD STILL each → „vertragen sich" (stillness = answer) |
| 3 scan blood-thinner | 62 → 78 (`DDI_SURGE`) | 2.5 (slow) | Antibiotic × Blutverdünner | SURGE — water climbs on its own, clearly over the window = the alarm (78 > 70, < 80) |
| 4 twist demo | 78 → 79 (`DDI_WARN`) | 2 (slow) | Only a Magenschutz added „aus Vorsicht" | Water keeps crawling UP anyway → „der Magenschutz ändert nichts" (79 < 80, still over) |
| 5 strategy · safe | 79 → 62 | 5 | „Ganzen Plan prüfen" | Real fall back into green = WIN (watchable 79→62) |
| 5 strategy · both | 79 → 90 | 5 | „Einfach beides nehmen" | Climbs across the top → trips at 80 → OVER |
| 5 strategy · ppi | 79 → 86 | 5 | „Nur Magenschutz dazu" | Climbs across the top → trips at 80 → OVER (echoes twist) |
| 5 strategy · reduce (adult) | 79 → 88 | 5 | „Antibiotikum-Dosis selbst reduzieren" | Climbs across the top → trips at 80 → OVER |
| 5 strategy · stop | 79 → 30 | 6 | „Blutverdünner aus Angst weglassen" | Plunges across the bottom → trips at 35 → UNDER |
| 6 finale (win) | hold ~62 | tiny keep-alive `driveTo(62)` | Safe-plan sort | Calm still-green water = the reward/proof |

> **Why `DDI_SURGE=78` / `DDI_WARN=79` (not the old 72/76).** Blueprint §3 mandates ≥~8
> units over band_high 70 with pump margin and explicitly forbids 1–2 over (which „reads as
> still in/at the window"). The surge is the one move the visitor MUST read as „over" — so
> it cannot be the lowest high in the run. 78 clears the window with margin; 79 still sits
> under the invisible critHigh 80 so the demo never trips; and `DDI_WARN (79) > DDI_SURGE
> (78) > bandHigh (70)` holds (the 1-unit demo crawl is the visible „it keeps rising"
> beat). `DDI_LINE_HIGH` is raised to 78 for parity (same „clearly over" read).

All four OVER picks trip the **invisible** 80 mid-travel; STOP trips the invisible 35.
The trip is rebuilt manually (see §8 — engine auto-trip does NOT fire on the play2 path).

---

## 4. Beat-by-beat flow (9 beats)

Built on `PlayShell` (color `#4cc9f0`, kicker `story.ddi.title`, caseLine `ddi.case`,
`step`/`total=6`, `onCancel=backToStories`). Every move/stillness beat renders `WatchBody`.
A local `drive(target,rate,then)` sets `pumping=true` → **all buttons `disabled={pumping}`**
(copy the `drive()` wrapper verbatim from `FruehstueckPlay` L70–73; the existing `DdiPlay`
has no `pumping` guard, so this must be added). EndScreen renders OUTSIDE the animated
`.beat` (direct child of `.root`).

The 6 progress-dot steps map: (1) briefing+filling+reveal+lines, (2) newcard, (3) scan,
(4) demo, (5) strategy+moving, (6) finale.

**Beat 0 — `briefing` → `filling` → `briefReveal` (step 1).** PlayShell scene: `pl-emoji`
🫀, `pl-h1` = `ddi.brief.patient`, `pl-lead` = `ddi.brief.goal`, then a `pl-action` Weiter
that triggers the baseline fill. **Pump:** on Weiter, `drive(DDI_START=62, 7)` rises 20→62
as the living baseline; during this fill the screen rotates the `DDI_FACTS` „Wusstest du?"
cards (exactly like Frühstück's `dosing` beat), then `briefReveal` shows the patient card +
Weiter. *No star.*

> **Rotating-facts placement.** The blueprint requires a slow-fill teaching moment with
> rotating „Wusstest du?" cards (disease/drug/window/timing). Here the longest single fill
> is the **baseline rise 20→62 (rate 7, ~6 s)**. So Beat 0 splits into `briefing` →
> `filling` (rotates `DDI_FACTS` while the pump rises, exactly like Frühstück's `dosing`,
> reusing its `FACT_MS`/`FACT_MIN_MS`/`fillDone` pattern) → `briefReveal` (one-line patient
> card + Weiter). Hold the last fact a minimum readable time (`FACT_MIN_MS`) before the
> reveal so it isn't cut. `DDI_FACTS = ['ddi.fact.disease', 'ddi.fact.drug',
> 'ddi.fact.window', 'ddi.fact.timing']`. The onMount itself does NOT pump (Frühstück's
> onMount sits at the start level and the dose fill is button-triggered) — keep that shape.

**Beat 1 — `lines` (step 1, the meaning-teach).** No quiz. `pl-h2` = `ddi.lines.prompt`,
one `pl-action` „Zeig mir die Grenzen" (`ddi.lines.btn`). On tap the pump runs the guided
3-move demo: 62→78 (`WatchBody rising`, cue `ddi.lines.high`), hold ~0.8 s, 78→50
(`WatchBody falling`, cue `ddi.lines.low`), hold ~0.8 s, 50→62 (`WatchBody good`, cue
`ddi.lines.mid`). When settled, show a `pl-action` Weiter. This anchors „too high / too low
look like THIS on the body" before any pairing surge. *No star.*

**Beat 2 — `newcard` (step 2, seed the stillness).** `pl-h2` = `ddi.newcard.prompt`. A row
of the 5 existing pill chips (`DDI_SCAN_PILLS`, each `nameKey`+`roleKey`) plus the glowing
`new` chip (`DDI_PROBE`). Player taps „Antibiotikum dazulegen" (`ddi.newcard.btn`). **Pump:
DEAD STILL** — `hold` only, no `driveTo`; `WatchBody tone="still"` = `ddi.newcard.still`
(„allein im Plan ist noch nichts kombiniert"). Weiter appears. This primes the scanner
contrast. *No star.*

**Beat 3 — `scan` (step 3, SIGNATURE beat).** ★ feeds clever. `pl-h2` = `ddi.scan.prompt`.
A pinned probe chip (`ddi.scan.probe` + `DDI_PROBE.name`) sits above a grid of the 5 pills.
Player taps each to scan it against the locked probe. The **4 harmless pills are scannable
first; the blood-thinner tile is LOCKED (`🔒`, disabled) until all four harmless are
scanned** (`dangerUnlocked = harmlessScanned >= 4`) — forcing still·still·still·still→SURGE.
**Pump:**
- harmless pair → `testHypothesis({real:false, holdMs:1400})`; cue flips to
  `ddi.scan.still` „Nichts bewegt sich. Vertragen sich.", tile marked `done` (green tag
  `ddi.scan.tag.still`). No water moves — stillness is the answer.
- a tap on the still-locked blood-thinner tile costs nothing (no loss) and shows
  `ddi.scan.locked`, **but sets `scanNudged = true`** (the clever-penalty flag — see §10).
  This is the existing `DdiPlay` behaviour (`scanNudged` on a locked-tile tap); keep it.
- blood-thinner pair (unlocked) → `drive(DDI_SURGE=78, 2.5)`; `WatchBody rising`, cue
  `ddi.scan.watch`→`ddi.scan.surge`, tile marked `alarm`. Weiter appears after the surge.
  *Feeds clever via `scanClean = !scanNudged` (§10).*

**Beat 4 — `demo` + `demoCheck` (step 4, the MECHANISM + the mandatory TWIST).** ★ feeds
clever. `pl-h2` = `ddi.demo.prompt` (framed: „Herr Schmidt ist wegen seines Magens nervös
und gibt aus Vorsicht nur den Magenschutz dazu — schau, ob das hilft."). One `pl-action`
„Ausprobieren" (`ddi.demo.btn`). **Pump:** `drive(DDI_WARN=79, 2)` — water keeps crawling UP
even though a „safe" pill was added; `WatchBody rising`, cue `ddi.demo.rising` („der
Magenschutz ändert nichts — der Spiegel steigt trotzdem"). On settle → `demoCheck`: a single
quick **„I saw it climb"** confirm — `ddi.demo.q` headline, two buttons `ddi.demo.up` („↑ Er
ist gestiegen") / `ddi.demo.down` („↓ Er ist gefallen"). Tapping UP first-try sets star flag
**`twistRead`** and advances to `strategy` (feedback `ddi.demo.right`); DOWN shows
`ddi.demo.wrong` and stays (no loss, flag missed). This is the **mechanism-on-the-body
beat** (the *why*: more protection, no change) AND the mandatory twist demo. *Feeds clever.*

**Beat 5 — `strategy` + `moving` (step 5, the READ-THE-BODY decision + the real losses).**
★ feeds pro. The tank is left sitting visibly HIGH (~79, clearly over the window). `pl-h2` =
`ddi.strat.prompt` = **„Schau auf den Körper. Was sollte Herr Schmidt jetzt tun, damit es
sicher ist?"** — the screen NEVER states the level. The player must look at the real tank
above the window and reason: it's high → too-thin blood → bring it DOWN into green, but not
so far it crosses the bottom. Options (`pl-opt`, `DDI_OPTIONS`, filtered by `adultOnly`):
- **safe** „Ganzen Plan prüfen — Apotheke/Arztpraxis fragen" → `result:'win'`, target 62.
- **both** „Einfach beides nehmen" → `over`, 90.
- **ppi** „Nur Magenschutz dazu" → `over`, 86 (the twist echoed).
- **reduce** (adultOnly) „Antibiotikum-Dosis selbst reduzieren" → `over`, 88.
- **stop** „Blutverdünner aus Angst weglassen" → `under`, 30.

On pick → `moving`: `WatchBody` with the matching tone (safe→falling/good, over→rising,
under→falling) + the option's `feedbackKey` and a `ddi.move.<outcome>` cue. `drive(target,
under?6:5)`. WIN settles 79→62 → `finale`. A dangerous pick **trips mid-travel** (manual
`$effect`, §8) the instant it crosses 80 (over) / 35 (under) → `outcome`. *Feeds pro via
`sortClean` (§10) — the strategy step gates the win but is not separately scored.*

**Beat 6 — `finale` (step 6, the win-path supporting sort).** ★ feeds pro. The ONE
card-sort in the story (kept as a single supporting check so the unique verb is not diluted).
`pl-h2` = `ddi.plan.prompt`. Nine action cards (`DDI_PLAN_CARDS`) sorted into „gehört in den
sicheren Plan" vs „nicht sicher": SAFE = alle Mittel zeigen · Apotheke fragen · Blutwert
kontrollieren · besser passendes Antibiotikum **besprechen** · auf Blutungszeichen achten;
UNSAFE = Blutverdünner heimlich weglassen · allein doppelt dosieren · nur Magenschutz · nichts
sagen. Wrong placements snap back with a hint (`ddi.plan.retry`), **no loss**, and set
`sortDirty`. On a clean confirm → star flag **`sortClean`** (zero wrong placements). `pl-good`
correct beat (`ddi.plan.correct`) + Weiter → `outcome`. **Pump:** HOLD steady in green — a
tiny `drive(62, …)` keep-alive; the calm still-green water is the reward. *Feeds pro.*

**Beat 7 — `outcome` (EndScreen debrief).** `EndScreen` with `outcome`, `titleKey/subKey =
ddi.out.<outcome>.title/.sub`, `storyTitleKey = story.ddi.title`, `score = starCount`,
`factKeys`: win → `['ddi.out.dyk1','ddi.out.dyk2']`; over → `['ddi.out.dyk.over','ddi.out.dyk1']`;
under → `['ddi.out.dyk.under','ddi.out.dyk1']`. Win: held calm green ~62. Loss: the run
already auto-tripped at ~90/86/88/30 in Beat 5; the frozen out-of-band state is the verdict,
EndScreen renders over it. *No star.*

---

## 5. The ONE tank-surprise twist (forced demo)

**The Magenschutz (PPI) trap, made unavoidable by moving it into the demo (Beat 4).** Every
player has *just* watched the stomach-protection pill sit dead-still and „safe" in the
scanner (Beat 3). The demo then frames it for the crowd: „Herr Schmidt ist nervös um seinen
Magen und gibt aus Vorsicht nur den Magenschutz dazu" — and **the water keeps climbing
upward on its own anyway** (78→79), because protecting the stomach does nothing to lower the
blood-thinner effect. The counterintuitive body move: a pill you *literally just proved was
safe* fails to save him; „more protection" does nothing to the real problem.

Only the real slow water can deliver this — there is no on-screen vessel; the player's eyes
go to the physical tank crawling up, already clearly over the green window. Because it's the
mandatory demo (not one hidden option), **every** player witnesses „the safe pill changed
nothing on the body." Loss copy for the PPI strategy pick frames it as the **untreated
interaction** rising, never as the stomach-pill harming him — so it never teaches PPI=dangerous.

---

## 6. Challenge design (non-obvious decision + plausible wrong answers)

**Why it's a real puzzle.** The Stage-5 prompt withholds the number („Schau auf den
Körper. Was ist jetzt sicher?"). The correct answer is only reachable by reading the
*physical* tank: it sits HIGH (clearly above the green window), so the danger right now is
too-thin blood, so the fix must move it DOWN — but not through the bottom. A walk-up who
doesn't read the body can plausibly pick any of four wrong answers.

**Plausible wrong answers (real patient/clinician mistakes, no throwaways):**
- **„Einfach beides nehmen"** (over→90): the naïve „doctor prescribed it, so just take it"
  reflex. Drives further up across the top — bleeding.
- **„Nur Magenschutz dazu"** (over→86): the *exact* precaution the patient already tried in
  the demo. Tempting because it *feels* protective; the player just saw it fail, so picking
  it tests whether they learned the twist. Symptomschutz ≠ interaction management.
- **„Antibiotikum-Dosis selbst reduzieren"** (adultOnly, over→88): a clinically literate but
  wrong move — lowering the antibiotic does NOT bring an already-elevated effect down fast
  enough, and self-adjusting is unsafe. The sophisticated trap for adult players.
- **„Blutverdünner aus Angst weglassen"** (under→30): the *opposite* fear-driven mistake —
  stopping the thinner because „too thin" sounds scary. Removes the stroke protection →
  clot. This is what makes DDI the one story with BOTH an over and an under from different
  decisions.

The Stage-6 sort reinforces with paired temptations (heimlich weglassen, allein doppelt
dosieren, nur Magenschutz, nichts sagen) — all plausible, none silly.

---

## 7. Custom visual

**None.** Per blueprint rule 2 the Pi has no on-screen vessel and DDI must not draw a
mirrored tank/gauge or a „ghost red marker" (the brief explicitly DROPS the red ghost-marker
— it would be a banned mirrored vessel or un-drawable runtime tape). The signature is read
off the **real water** versus the **real green tape**. The only bespoke UI is light,
filter-free DOM/CSS already in the `.pl-*` kit:
- the **5-pill plan row + glowing `new` probe chip** (Beat 2) — flat cards with a soft
  cyan glow keyframe (no heavy blur);
- the **pinned-probe scanner grid** (Beat 3) — tap tiles with `done` (green) / `alarm`
  (toxic) / `locked` (🔒, dimmed) states;
- the **two-bin sort rows** (Beat 6).

All are plain bordered cards/buttons — Pi-safe (no `filter: blur`, no large box-shadows that
repaint). `WatchBody`'s chevrons are the only motion during pump moves and live in the
shared component.

---

## 8. Data model — `frontend/src/lib/stories/ddi.ts`

Headless-pure (no Svelte runes), imports `LEVELS`/`Outcome` from `../flow`. The existing
file is correct in shape; the build must **(a) raise the demo levels per §3, (b) add
`DDI_FACTS` / `DDI_LINE_HIGH` / `DDI_LINE_LOW`, and (c) add the scoring helper**. The full
target file:

```ts
import { LEVELS, type Outcome } from '../flow'

// ── torso levels (all from LEVELS; demos clear the window but stay inside 35..80) ─
export const DDI_START = LEVELS.dose      // 62 — already „gut eingestellt" in the green window
export const DDI_LINE_HIGH = 78           // meaning-teach: clearly over the window (> 70, < critHigh 80)
export const DDI_LINE_LOW  = 50           // meaning-teach: clearly under the window (< 55, > critLow 35)
export const DDI_SURGE = 78               // scanner alarm — clearly over the window, no trip (> 70, < 80)
export const DDI_WARN  = 79               // held warning after the Magenschutz demo (> DDI_SURGE, < 80)

// rotating „Wusstest du?" cards shown during the slow baseline fill (20→62)
export const DDI_FACTS = ['ddi.fact.disease', 'ddi.fact.drug', 'ddi.fact.window', 'ddi.fact.timing']

// ── the fixed probe + the existing plan (4 harmless + the gated blood-thinner) ─
export const DDI_PROBE = { id: 'clarithromycin', nameKey: 'ddi.card.clarithromycin', roleKey: 'ddi.role.clarithromycin' }

export interface DdiScanPill { id: string; nameKey: string; roleKey: string; danger?: boolean }
export const DDI_SCAN_PILLS: DdiScanPill[] = [
  { id: 'metoprolol',    nameKey: 'ddi.card.metoprolol',    roleKey: 'ddi.role.metoprolol' },
  { id: 'ramipril',      nameKey: 'ddi.card.ramipril',      roleKey: 'ddi.role.ramipril' },
  { id: 'metformin',     nameKey: 'ddi.card.metformin',     roleKey: 'ddi.role.metformin' },
  { id: 'pantoprazol',   nameKey: 'ddi.card.pantoprazol',   roleKey: 'ddi.role.pantoprazol' },
  { id: 'phenprocoumon', nameKey: 'ddi.card.phenprocoumon', roleKey: 'ddi.role.phenprocoumon', danger: true },
]

// ── Stage 5 strategy: the choice itself moves the water (read off the HIGH tank) ─
export interface DdiOption {
  id: string; labelKey: string; feedbackKey: string
  result: Outcome            // 'win' settles to green; 'over'/'under' cross a red tape
  target: number; adultOnly?: boolean
}
export const DDI_OPTIONS: DdiOption[] = [
  { id: 'safe',   labelKey: 'ddi.opt.safe',   feedbackKey: 'ddi.fb.safe',   result: 'win',   target: 62 },
  { id: 'both',   labelKey: 'ddi.opt.both',   feedbackKey: 'ddi.fb.both',   result: 'over',  target: 90 },
  { id: 'ppi',    labelKey: 'ddi.opt.ppi',    feedbackKey: 'ddi.fb.ppi',    result: 'over',  target: 86 },
  { id: 'reduce', labelKey: 'ddi.opt.reduce', feedbackKey: 'ddi.fb.reduce', result: 'over',  target: 88, adultOnly: true },
  { id: 'stop',   labelKey: 'ddi.opt.stop',   feedbackKey: 'ddi.fb.stop',   result: 'under', target: 30 },
]

// ── Stage 6 finale: build the safe plan (sort; win-path only) ─────────────────
export interface DdiPlanCard { id: string; labelKey: string; safe: boolean }
export const DDI_PLAN_CARDS: DdiPlanCard[] = [
  { id: 'showall',     labelKey: 'ddi.plan.showall',     safe: true },
  { id: 'pharmacy',    labelKey: 'ddi.plan.pharmacy',    safe: true },
  { id: 'bloodvalue',  labelKey: 'ddi.plan.bloodvalue',  safe: true },
  { id: 'otherab',     labelKey: 'ddi.plan.otherab',     safe: true },
  { id: 'signs',       labelKey: 'ddi.plan.signs',       safe: true },
  { id: 'hide',        labelKey: 'ddi.plan.hide',        safe: false },
  { id: 'selfdouble',  labelKey: 'ddi.plan.selfdouble',  safe: false },
  { id: 'onlystomach', labelKey: 'ddi.plan.onlystomach', safe: false },
  { id: 'saynothing',  labelKey: 'ddi.plan.saynothing',  safe: false },
]
export function ddiPlanCorrect(a: Record<string, boolean>): boolean {
  return DDI_PLAN_CARDS.every((c) => a[c.id] === c.safe)
}

/** Star score (1.0–3.0 in 0.5 steps) via the shared two-bonus `stars()` contract.
 *  clever = the scanner read + the twist read; pro = the safe-plan sort.
 *  Any loss = 0. (No dead `strategyFirstTry` flag — see §10.) */
export function ddiStars(
  win: boolean,
  f: { scanClean: boolean; twistRead: boolean; sortClean: boolean },
): number {
  const clever = (f.scanClean ? 0.5 : 0) + (f.twistRead ? 0.5 : 0)
  const pro = 0.5 + (f.sortClean ? 0.5 : 0)
  return stars(win, clever, pro)
}
```

…and add the import of `stars` to the existing `import { LEVELS, type Outcome } from '../flow'`
line → `import { LEVELS, stars, type Outcome } from '../flow'`.

> **Scoring shape (resolved).** Earlier drafts modelled four independent 0.5 flags
> (`scanClean`, `twistRead`, `strategyFirstTry`, `sortClean`). `strategyFirstTry` is **dead
> in a scored run** — any dangerous Stage-5 pick auto-trips to a loss (0★), so a *winning*
> run never has a missed first-try. It is therefore deleted. `ddiStars` now folds into the
> set-wide `stars(win, clever, pro)` contract exactly as the existing `sim/ddi.sim.ts`
> already encodes it: `clever = (scanClean?0.5:0)+(twistRead?0.5:0)`, `pro = 0.5 +
> (sortClean?0.5:0)`. Three genuinely earnable-AND-missable halves remain (see §10).

---

## 9. Full copy — `frontend/src/lib/stories/ddi.locale.ts`

Export `export const ddiLocale: Record<string, string> = { … }`, imported + spread into the
`de` object in `locale.svelte.ts`. **The inline `ddi.*` block in `locale.svelte.ts` (the run
of keys from `'ddi.new'` through `'ddi.out.dyk.under.adult'`) MUST BE DELETED** — `de` is a
last-spread-wins merge, so leaving the old block in would let the retired copy („rote Linie",
„das Wasser" for the level concept, the win-title 🎉 emoji) override this file. Prefix stays
`ddi.` so shared keys resolve. Conventions enforced: „der Spiegel"/„Blut-Balance" never
„das Wasser" for the level concept (a cue may say „das Wasser steigt/sinkt" only for the
*visible movement* of the body — but danger is always „über/unter den grünen Bereich", NEVER
„rote Linie"); enzyme location „in Darm und Leber"; two registers everywhere; patient-framed
decisions; don't presume the pick; multi-day framing for the rise; **no outcome emoji in
titles** (EndScreen owns its own fx).

```ts
export const ddiLocale: Record<string, string> = {
  // ── case header ──────────────────────────────────────────────────────────
  'ddi.case': 'Herr Schmidt, 72 · Blutverdünner',
  'ddi.case.adult': 'Herr Schmidt, 72 · Phenprocoumon (VKA)',
  'ddi.new': 'NEU',

  // ── briefing + rotating facts (slow baseline fill 20→62) ─────────────────
  'ddi.brief.patient': 'Herr Schmidt, 72, hat ein Herz, das aus dem Takt schlägt (Vorhofflimmern). Er nimmt jeden Tag einen Blutverdünner – damit ist sein Blut genau richtig „dünn“, seit Jahren stabil.',
  'ddi.brief.patient.adult': 'Herr Schmidt, 72, mit Vorhofflimmern – seit Jahren stabil auf Phenprocoumon (Marcumar). Der Gerinnungsschutz liegt im Zielbereich.',
  'ddi.brief.goal': 'Halte seine Blut-Balance im grünen Bereich: nicht zu dünn (Blutung) und nicht zu dick (Klumpen).',
  'ddi.brief.goal.adult': 'Halte die Antikoagulation im therapeutischen Bereich: zu hoch = Blutung, zu niedrig = Thrombose/Schlaganfall.',
  'ddi.cue.fill': 'Schau auf den Körper – der Spiegel steigt in den grünen Bereich.',
  'ddi.cue.filled': 'Der Spiegel sitzt im grünen Bereich – genau richtig eingestellt.',
  'ddi.fact.kicker': 'Wusstest du?',
  'ddi.fact.disease': 'Bei Vorhofflimmern schlägt das Herz unregelmäßig – dabei können sich Blutklumpen bilden. Ein Blutverdünner schützt davor.',
  'ddi.fact.disease.adult': 'Vorhofflimmern erhöht das Schlaganfallrisiko durch Thrombenbildung – eine orale Antikoagulation senkt es.',
  'ddi.fact.drug': 'Ein Blutverdünner macht das Blut „dünner“, damit es nicht klumpt. Die richtige Menge ist ein schmaler Bereich.',
  'ddi.fact.drug.adult': 'Phenprocoumon (Vitamin-K-Antagonist) hat ein enges therapeutisches Fenster – kleine Änderungen verschieben den INR deutlich.',
  'ddi.fact.window': 'Der grüne Bereich am Körper ist das Ziel: zu hoch heißt Blutungsgefahr, zu tief heißt Klumpengefahr.',
  'ddi.fact.window.adult': 'Der therapeutische Bereich ist schmal: über dem grünen Bereich droht Blutung, darunter droht Thrombose.',
  'ddi.fact.timing': 'Wechselwirkungen wirken oft nicht sofort – der Spiegel steigt über die nächsten Tage langsam an.',
  'ddi.fact.timing.adult': 'Klinisch relevant ist der INR-Anstieg über Tage – am Körper sehen wir die Richtung im Zeitraffer.',

  // ── 1 · meaning teach (what too high / too low looks like on the body) ───
  'ddi.lines.prompt': 'Bevor es losgeht: Schau, was am Körper „zu hoch“ und „zu tief“ bedeutet.',
  'ddi.lines.prompt.adult': 'Zur Orientierung: was ober- und unterhalb des grünen Bereichs passiert.',
  'ddi.lines.btn': 'Zeig mir die Grenzen',
  'ddi.lines.high': 'Zu viel Verdünner = zu dünnes Blut = Blutungsgefahr. Schau, der Spiegel steigt über den grünen Bereich.',
  'ddi.lines.high.adult': 'Über dem grünen Bereich: zu hohe Antikoagulation = Blutungsrisiko.',
  'ddi.lines.low': 'Zu wenig Verdünner = das Blut klumpt – Gefahr durch Blutklumpen. Schau, der Spiegel fällt unter den grünen Bereich.',
  'ddi.lines.low.adult': 'Unter dem grünen Bereich: zu niedrig = kein Schlaganfallschutz, Thrombosegefahr.',
  'ddi.lines.mid': 'Genau richtig – der Spiegel sitzt wieder im grünen Bereich.',
  'ddi.lines.mid.adult': 'Im therapeutischen Bereich – balanciert.',
  'ddi.lines.next': 'Weiter',

  // ── pill labels (young = role name · adult = real substance) ─────────────
  'ddi.card.phenprocoumon': 'Blutverdünner', 'ddi.role.phenprocoumon': 'schützt vor Klumpen',
  'ddi.card.phenprocoumon.adult': 'Phenprocoumon', 'ddi.role.phenprocoumon.adult': 'Blutverdünner (VKA)',
  'ddi.card.metoprolol': 'Herz-Mittel', 'ddi.role.metoprolol': 'beruhigt das Herz',
  'ddi.card.metoprolol.adult': 'Metoprolol', 'ddi.role.metoprolol.adult': 'Herzfrequenz',
  'ddi.card.ramipril': 'Blutdruck-Mittel', 'ddi.role.ramipril': 'senkt den Druck',
  'ddi.card.ramipril.adult': 'Ramipril', 'ddi.role.ramipril.adult': 'Blutdruck',
  'ddi.card.metformin': 'Zucker-Mittel', 'ddi.role.metformin': 'gegen Zucker',
  'ddi.card.metformin.adult': 'Metformin', 'ddi.role.metformin.adult': 'Diabetes',
  'ddi.card.pantoprazol': 'Magenschutz', 'ddi.role.pantoprazol': 'schützt den Magen',
  'ddi.card.pantoprazol.adult': 'Pantoprazol', 'ddi.role.pantoprazol.adult': 'Magenschutz (PPI)',
  'ddi.card.clarithromycin': 'Neues Antibiotikum', 'ddi.role.clarithromycin': 'gegen die Bronchitis',
  'ddi.card.clarithromycin.adult': 'Clarithromycin', 'ddi.role.clarithromycin.adult': 'Makrolid-Antibiotikum',

  // ── 2 · new card in the plan (seed the stillness) ────────────────────────
  'ddi.newcard.prompt': 'Das ist Herrn Schmidts Plan. Leg das neue Antibiotikum dazu.',
  'ddi.newcard.prompt.adult': 'Neue Verordnung: Clarithromycin kommt in den Plan.',
  'ddi.newcard.btn': 'Antibiotikum dazulegen',
  'ddi.newcard.still': 'Schau – nichts bewegt sich. Allein im Plan ist noch nichts kombiniert.',
  'ddi.newcard.still.adult': 'Noch keine Reaktion – die neue Substanz allein verändert nichts.',

  // ── 3 · interaction scanner (signature) ──────────────────────────────────
  'ddi.scan.prompt': 'Prüfe das neue Antibiotikum mit jeder alten Tablette. Tippe eine an – und schau auf den Körper.',
  'ddi.scan.prompt.adult': 'Cross-Check: prüfe Clarithromycin gegen jede bestehende Medikation. Schau auf den Körper.',
  'ddi.scan.probe': 'Neues Antibiotikum',
  'ddi.scan.watch': 'Schau auf den Körper – bewegt sich der Spiegel?',
  'ddi.scan.still': 'Nichts bewegt sich. Die zwei vertragen sich.',
  'ddi.scan.still.adult': 'Keine relevante Reaktion – verträglich.',
  'ddi.scan.surge': 'Alarm! Der Spiegel steigt von allein – das Antibiotikum macht den Blutverdünner stärker.',
  'ddi.scan.surge.adult': 'Kritische Kombination: Clarithromycin kann die Phenprocoumon-Wirkung erhöhen – der Spiegel steigt über Tage.',
  'ddi.scan.locked': 'Schau nochmal – prüf erst die anderen vier Tabletten.',
  'ddi.scan.locked.adult': 'Erst die übrigen vier prüfen, dann den Blutverdünner.',
  'ddi.scan.tag.still': 'vertragen sich',
  'ddi.scan.tag.alarm': '⚠ Alarm',
  'ddi.scan.next': 'Weiter',

  // ── 4 · body demo + the Magenschutz twist (unavoidable) ──────────────────
  'ddi.demo.prompt': 'Herr Schmidt hat Angst um seinen Magen und gibt aus Vorsicht nur den Magenschutz dazu. Schau, ob das gegen das zu dünne Blut hilft.',
  'ddi.demo.prompt.adult': 'Vorsichts-Reflex des Patienten: nur einen PPI/Magenschutz ergänzen. Schau, ob das die zu hohe Antikoagulation senkt.',
  'ddi.demo.btn': 'Ausprobieren',
  'ddi.demo.rising': 'Der Magenschutz ändert nichts – der Spiegel steigt trotzdem weiter über den grünen Bereich.',
  'ddi.demo.rising.adult': 'Der PPI senkt den Spiegel nicht – er steigt weiter über den grünen Bereich.',
  'ddi.demo.q': 'Schau auf den Körper: Was hat der Spiegel gemacht?',
  'ddi.demo.up': '↑ Er ist gestiegen',
  'ddi.demo.down': '↓ Er ist gefallen',
  'ddi.demo.right': 'Genau – der Magenschutz löst das eigentliche Problem nicht.',
  'ddi.demo.right.adult': 'Korrekt – Symptomschutz ersetzt kein Interaktionsmanagement.',
  'ddi.demo.wrong': 'Schau nochmal auf den Körper – der Spiegel ist gestiegen, nicht gefallen.',
  'ddi.demo.wrong.adult': 'Noch einmal hinsehen – der Spiegel ist gestiegen, nicht gefallen.',

  // ── 5 · strategy (read off the HIGH body; the screen never states the level) ─
  'ddi.strat.prompt': 'Schau auf den Körper. Was sollte Herr Schmidt jetzt tun, damit es sicher ist?',
  'ddi.strat.prompt.adult': 'Schau auf den Körper. Was ist jetzt das sichere Vorgehen bei dieser Wechselwirkung?',
  'ddi.opt.safe': 'Ganzen Plan prüfen – Apotheke/Arztpraxis fragen',
  'ddi.opt.safe.adult': 'Gesamtplan prüfen – interaktionsärmere Antibiose oder engmaschige Kontrolle',
  'ddi.opt.both': 'Einfach beides nehmen',
  'ddi.opt.both.adult': 'Clarithromycin ohne Kontrolle dazugeben',
  'ddi.opt.ppi': 'Nur den Magenschutz dazugeben',
  'ddi.opt.ppi.adult': 'Nur einen PPI/Magenschutz ergänzen',
  'ddi.opt.reduce': 'Die Antibiotikum-Dosis selbst kleiner machen',
  'ddi.opt.reduce.adult': 'Antibiotikum-Dosis eigenmächtig reduzieren',
  'ddi.opt.stop': 'Den Blutverdünner aus Angst weglassen',
  'ddi.opt.stop.adult': 'Phenprocoumon eigenmächtig absetzen',
  'ddi.fb.safe': 'Genau – den ganzen Plan prüfen und Fachleute fragen. So kommt die Blut-Balance sicher zurück in den grünen Bereich.',
  'ddi.fb.safe.adult': 'Richtig – interaktionsärmere Antibiose prüfen oder engmaschige Kontrolle mit ärztlicher Dosisanpassung.',
  'ddi.fb.both': 'Gefährlich – der Blutverdünner wird zu stark, das Blut zu dünn.',
  'ddi.fb.both.adult': 'Gefährlich – unkontrollierte Erhöhung der Antikoagulation, Blutungsrisiko.',
  'ddi.fb.ppi': 'Der Magenschutz löst es nicht – der Spiegel steigt trotzdem über den grünen Bereich.',
  'ddi.fb.ppi.adult': 'Ein PPI senkt den Spiegel nicht – die unbehandelte Wechselwirkung treibt weiter nach oben.',
  'ddi.fb.reduce': 'Reicht nicht – die Wirkung ist schon zu hoch und sinkt nicht schnell genug.',
  'ddi.fb.reduce.adult': 'Unzureichend – die bereits erhöhte Wirkung fällt nicht rasch genug; eigenmächtig riskant.',
  'ddi.fb.stop': 'Vorsicht – ohne Blutverdünner ist sein Herz nicht mehr geschützt.',
  'ddi.fb.stop.adult': 'Gefährlich – Absetzen nimmt den Schlaganfallschutz, Thrombose-/Embolierisiko.',
  'ddi.move.win': 'Schau – der Spiegel sinkt zurück in den grünen Bereich.',
  'ddi.move.over': 'Schau auf den Körper – der Spiegel steigt weit über den grünen Bereich!',
  'ddi.move.under': 'Schau auf den Körper – der Spiegel fällt weit unter den grünen Bereich!',

  // ── 6 · build the safe plan (one supporting sort, win-path) ──────────────
  'ddi.plan.prompt': 'Bau den sicheren Plan für Herrn Schmidt. Welche Karten gehören dazu?',
  'ddi.plan.prompt.adult': 'Stelle den sicheren Managementplan zusammen.',
  'ddi.plan.safebin': 'gehört in den sicheren Plan',
  'ddi.plan.unsafebin': 'nicht sicher',
  'ddi.plan.showall': 'Alle Medikamente zeigen',
  'ddi.plan.showall.adult': 'Vollständigen Medikationsplan abgleichen',
  'ddi.plan.pharmacy': 'Apotheke/Arztpraxis fragen',
  'ddi.plan.pharmacy.adult': 'Interaktionscheck mit Apotheke/Arzt',
  'ddi.plan.bloodvalue': 'Blutwert kontrollieren lassen',
  'ddi.plan.bloodvalue.adult': 'INR engmaschig kontrollieren',
  'ddi.plan.otherab': 'Besser passendes Antibiotikum besprechen',
  'ddi.plan.otherab.adult': 'Interaktionsärmere Antibiose besprechen',
  'ddi.plan.signs': 'Auf Blutungszeichen achten (Nasenbluten, blaue Flecken)',
  'ddi.plan.signs.adult': 'Auf Blutungszeichen achten (Hämatome, Epistaxis)',
  'ddi.plan.hide': 'Blutverdünner heimlich weglassen',
  'ddi.plan.hide.adult': 'Phenprocoumon heimlich absetzen',
  'ddi.plan.selfdouble': 'Allein die Dosis verdoppeln',
  'ddi.plan.selfdouble.adult': 'Eigenmächtig die Dosis verdoppeln',
  'ddi.plan.onlystomach': 'Nur Magenschutz und weiter so',
  'ddi.plan.onlystomach.adult': 'Nur einen PPI ergänzen und weitermachen',
  'ddi.plan.saynothing': 'Niemandem etwas sagen',
  'ddi.plan.saynothing.adult': 'Die neue Verordnung nicht melden',
  'ddi.plan.confirm': 'Plan prüfen',
  'ddi.plan.correct': 'Perfekt – so bleibt Herr Schmidt geschützt und die Blut-Balance im grünen Bereich.',
  'ddi.plan.correct.adult': 'Korrekt – vollständiger Cross-Check, Monitoring und kontrolliertes Management.',
  'ddi.plan.retry': 'Ein paar Karten gehören woanders hin – schau nochmal.',
  'ddi.plan.next': 'Weiter',

  // ── 7 · outcome + debrief (no title emoji — EndScreen owns the fx) ────────
  'ddi.out.win.title': 'Sicher kombiniert!',
  'ddi.out.win.sub': 'Du hast die Wechselwirkung am Körper erkannt – Herr Schmidt bleibt geschützt.',
  'ddi.out.win.sub.adult': 'Gerinnungsschutz erhalten, Blutungsrisiko kontrolliert, Plan geprüft.',
  'ddi.out.over.title': 'Zu dünn!',
  'ddi.out.over.sub': 'Die Blut-Balance ist zu hoch gestiegen – das Blut ist zu dünn, Blutungen werden gefährlich.',
  'ddi.out.over.sub.adult': 'Antikoagulation/INR zu hoch → Blutungsrisiko. Die Wechselwirkung wurde nicht behandelt.',
  'ddi.out.under.title': 'Ungeschützt …',
  'ddi.out.under.sub': 'Zu wenig Schutz – jetzt können gefährliche Blutklumpen entstehen.',
  'ddi.out.under.sub.adult': 'VKA eigenmächtig abgesetzt → Verlust des Schlaganfallschutzes → Thrombose-/Embolierisiko.',
  'ddi.out.dyk1': 'Eine Wechselwirkung entsteht, wenn zwei Mittel zusammenkommen – hier neues Antibiotikum + Blutverdünner. Das Antibiotikum macht den Verdünner STÄRKER.',
  'ddi.out.dyk1.adult': 'Clarithromycin kann über mehrere Abbau-/Transportwege in Darm und Leber die Phenprocoumon-Wirkung erhöhen → INR steigt über Tage → Blutungsrisiko.',
  'ddi.out.dyk2': 'Darum: immer den GANZEN Plan zeigen und Apotheke/Arztpraxis fragen – und den Blutverdünner nie allein absetzen.',
  'ddi.out.dyk2.adult': 'Apotheken-Cross-Check jeder neuen Verordnung gegen den Bestand. Zwei-seitige Gefahr: zu hoch = Blutung, Absetzen = Thrombose.',
  'ddi.out.dyk.over': 'Magenschutz schützt den Magen, senkt aber die Blut-Balance nicht. Das Problem ist die unbehandelte Wechselwirkung – nicht der Magenschutz.',
  'ddi.out.dyk.over.adult': 'Ein PPI senkt den INR nicht; mehr Hemmstoff oder Ignorieren verschärft die Antikoagulation. Symptomschutz ≠ Interaktionsmanagement.',
  'ddi.out.dyk.under': 'Den Blutverdünner einfach wegzulassen ist auch gefährlich – dann fehlt der Schutz vor Blutklumpen.',
  'ddi.out.dyk.under.adult': 'Eigenmächtiges Absetzen des VKA entzieht den Schlaganfallschutz. Lösung ist das Antibiotikum-Management, nicht das Absetzen.',
}
```

> **Retired vs old copy (delete the inline block).** The current inline `ddi.*` block in
> `locale.svelte.ts` still contains the convention violations: „rote/roten Grenze(n)"
> (`ddi.lines.prompt.adult`, `ddi.demo.rising`, `ddi.fb.ppi`, `ddi.move.over/under`),
> „das Wasser" for the *level concept* (`ddi.cue.fill`, `ddi.scan.watch`, `ddi.scan.surge`,
> `ddi.demo.rising`, `ddi.demo.q`, `ddi.move.win/over/under`), and the win-title 🎉 emoji
> (`ddi.out.win.title`). All are rewritten above to „über/unter den grünen Bereich", „der
> Spiegel", and emoji-free titles. The good pharmacology + rank/debrief copy is preserved
> verbatim where it was already correct. **The builder MUST physically remove the old inline
> block** (last-spread-wins means a stale leftover would silently win).

---

## 10. Scoring

`win` = Stage-5 safe strategy chosen AND Stage-6 sort completed. Base 1.0 ★. Three
independent, genuinely earnable-AND-missable 0.5 flags, folded into the set-wide
`stars(win, clever, pro)` contract (so DDI scores like every other story):

**Clever (detective work) — `clever = (scanClean?0.5:0) + (twistRead?0.5:0)`:**
- **`scanClean = !scanNudged`** — the player did NOT tap the locked blood-thinner tile
  before unlocking it. *Missable:* an early jab at the 🔒 tile sets `scanNudged=true` (the
  existing `DdiPlay` behaviour) and clears the half. (This is the ONLY definition of
  `scanClean`'s missability — do NOT also gate it on „all four scanned", which the unlock
  rule already forces and would make the flag always-true.)
- **`twistRead`** — after the demo, the „↑ Er ist gestiegen" confirm is correct first-try.
  *Missable:* tapping „↓ Er ist gefallen" first clears the flag.

**Pro (clean management) — `pro = 0.5 + (sortClean?0.5:0)`:**
- **`sortClean = !sortDirty`** — the Stage-6 sort has zero wrong placements.
  *Missable:* one wrong-card snap-back sets `sortDirty` and clears the upper half.
- (There is NO `strategyFirstTry` flag: any dangerous Stage-5 pick auto-trips to a loss, so
  it could never be false in a scored win — it was a dead flag and is deleted. The base 0.5
  of `pro` reflects reaching the finale at all on the win path.)

`ddiStars(win, { scanClean, twistRead, sortClean })` → 1.0–3.0 in 0.5 steps; any Stage-5
dangerous pick = loss = 0 ★ (rank.0). Rank titles read from `rankKey()` inside
`EndScreen`/`StarRating` — do NOT hardcode a rank string.

---

## 11. Sim assertions — `frontend/sim/ddi.sim.ts`

Run with `npx tsx sim/ddi.sim.ts`; must print ✅ ALL PASS. Import `DDI_*`, `ddiPlanCorrect`,
`ddiStars` from `../src/lib/stories/ddi` and `outcomeForLevel`/`DEFAULT_CFG`/`stars` from
`../src/lib/flow`. The existing sim already encodes the two-bonus `stars()` fold and omits
`strategyFirstTry` — keep that shape; the additions below are the level-margin and
`ddiStars` checks.

**Data model legal vs LEVELS:**
- exactly one `danger` pill on the scan list, and it is `phenprocoumon`.
- four harmless scan pills.
- `DDI_START` is inside the green band (`>= bandLow && <= bandHigh`); equals `dose`.
- `DDI_LINE_HIGH < critHigh` and `DDI_LINE_HIGH > bandHigh + 5` (clearly over with margin).
- `DDI_LINE_LOW > critLow` and `< bandLow` (clearly under, no trip).
- `DDI_SURGE < critHigh` and `DDI_SURGE > bandHigh + 5` (the surge clears the window with
  pump margin — guards the blueprint forbidden-zone rule: assert `DDI_SURGE >= 78`).
- `DDI_WARN < critHigh` and `DDI_WARN > DDI_SURGE` (held warning sits over the surge, no trip).
- `DDI_FACTS.length >= 3`.

**Each decision → torso target → outcome consistency:**
- for every `DDI_OPTIONS` entry, `outcomeForLevel(target) === result`.
- exactly one `win`, exactly three `over`, exactly one `under`.
- the `safe` win target is inside the band; the win move is a real fall (target 62 < WARN 79).
- `both/ppi/reduce` targets all `>= critHigh` (cross the top tape).
- `stop` target `<= critLow` (crosses the bottom tape).
- `reduce.adultOnly === true`; the other four are not adult-only.

**Finale sort:**
- five safe cards, four unsafe; `ddiPlanCorrect(perfect) === true`.
- one wrong placement → `ddiPlanCorrect(...) === false`.

**Scoring traces (win/over/under) — via `ddiStars` AND the raw `stars()` fold:**
- WIN flawless (`scanClean && twistRead && sortClean`) → `ddiStars(true, …) === 3`.
- WIN one slip (e.g. `sortClean=false`) → `2.5`.
- WIN two slips (e.g. `twistRead=false, sortClean=false`) → `2.0`.
- WIN all flags missed (`scanClean=false, twistRead=false, sortClean=false`) → `1.5`
  (scraped clean win — note the `pro` base 0.5 means a winning run never dips below 1.5).
- parity: `ddiStars(true, {scanClean:true,twistRead:true,sortClean:true})` ===
  `stars(true, 1, 1)` === 3; `ddiStars(true, {…,sortClean:false})` === `stars(true,1,0.5)`
  === 2.5.
- OVER trace: pick `both` → `outcomeForLevel(90)==='over'` → `ddiStars(false, …) === 0`.
- OVER trace: pick `ppi` → `over`, 0 ★ (twist echoed).
- UNDER trace: pick `stop` → `outcomeForLevel(30)==='under'` → `0 ★`.

---

## Builder checklist (engineering patterns to copy verbatim)

- **Template-level rewrite, not an edit.** The existing `DdiPlay.svelte` is on the OLD shell
  (`Backdrop`, `.btn`, `.opt`, hand-rolled `<h1>`/`<h2>`, no `pumping` guard). Copy the
  markup + `.root`/`.beat`/`.scene`/`.task` structure + EndScreen handoff from
  `FruehstueckPlay.svelte`; carry over ONLY the script state machine + the manual-trip
  `$effect`. Do not inherit any old `Backdrop`/`.btn` styling.
- Component on `PlayShell` + `.pl-*` kit + `WatchBody` (NOT the old Backdrop/`.btn` shell).
- `EndScreen` rendered as a direct child of a `position:relative;height:100%` `.root`,
  OUTSIDE the animated `.beat` (else the transform clips it to height 0).
- Local `drive(target,rate,then)` (copy `FruehstueckPlay` L70–73) sets `pumping` → all
  action buttons `disabled={pumping}`.
- Rotating facts: reuse Frühstück's `factIdx`/`FACT_MS`/`FACT_MIN_MS`/`fillDone` pattern on
  the `filling` beat (the 20→62 baseline rise).
- Stillness via `testHypothesis({real:false, holdMs:1400})` / a pure `hold` — no `driveTo`.
- Manual loss `$effect` watching `game.level.level` during `moving`: `>=80 → over`,
  `<=35 → under`, set `outcome` + `beat='outcome'` instantly (the engine does NOT auto-trip
  on play2). Guard with a `resolved` flag (copy `FruehstueckPlay`/`JkPlay`).
- Scoring: `starCount = $derived(ddiStars(outcome === 'win', { scanClean: !scanNudged,
  twistRead, sortClean: !sortDirty }))`.
- Move `ddi.*` copy out of `locale.svelte.ts` into `stories/ddi.locale.ts`
  (`export const ddiLocale`), import + spread into `de`, and **DELETE the old inline `ddi.*`
  block** (last-spread-wins; a leftover would override the new copy).
- `svelte-check` clean; `npx tsx sim/ddi.sim.ts` passes; browser-smoke win + both losses.
