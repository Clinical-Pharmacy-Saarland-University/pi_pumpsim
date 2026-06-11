# Build spec — „Der müde Filter" (`organ`)

Implementation-ready specification for the SafePolyMed story **„Der müde Filter"**
(Organ/disease–drug interaction · renal function · Metformin × eGFR↓).

Authoritative inputs (read in this order if you touch the build): `docs/stories/blueprint.md`
(WINS on any conflict) → the Frühstück exemplar set (`screens/FruehstueckPlay.svelte`,
`stories/fruehstueck.ts`, `sim/fruehstueck.sim.ts`, `lib/PlayShell.svelte`, `lib/WatchBody.svelte`,
`lib/EndScreen.svelte`, `lib/flow.ts`, `lib/game.svelte.ts`) → the brief `overhaul/organ.md` →
this file. The old `OrganPlay.svelte` + `stories/organ.ts` + the `organ.*` keys in
`locale.svelte.ts` are the copy mine and are **retired/replaced** by what is below.

Files this spec produces:
- `frontend/src/lib/stories/organ.ts` — pure data + scoring (§8). Replaces the old file.
- `frontend/src/lib/stories/organ.locale.ts` — all copy (§9). New per-story locale file.
- `frontend/src/lib/screens/OrganPlay.svelte` — the v2 component (§4). Rewritten.
- `frontend/sim/organ.sim.ts` — headless play-via-code (§11). New.

> Wiring note (one-time, builder): per-story `*.locale.ts` files do not yet exist in the repo —
> the `fr.*`/`organ.*` keys currently live inline in `locale.svelte.ts`. Per blueprint §6 the
> target pattern is a per-story file. When you add `organ.locale.ts`, import it in
> `locale.svelte.ts` and spread `...organLocale` into the `de` dict, then DELETE the legacy
> `organ.*` block (lines ~544–608). The `t()` register split is automatic: `t('k')` resolves
> `k.adult` for adults else `k` (young). So author `k` (young) always, and `k.adult` only where
> the adult wording differs. `stories.ts` already registers the story (`id:'organ'`,
> `color:'#ff6b7a'`, `icon:'🫘'`, `engine:'v2'`, `titleKey:'story.organ.title'`,
> `descKey:'story.organ.desc'`).
>
> **⚠️ MUST rewrite the `story.organ.title` / `.desc` keys — do NOT keep them.** The current
> values in `locale.svelte.ts` (lines 60–61, the `de` dict) are the **retired eGFR-gauge framing**
> that this spec kills:
> ```ts
> // CURRENT (retired — replace):
> 'story.organ.title': 'Die Nieren-Skala',
> 'story.organ.desc':  'Niere und Leber arbeiten langsamer.',
> ```
> These keys are read by `stories.ts:21` (the StorySelect card) AND used as the `PlayShell` kicker
> chip on every beat AND as the `EndScreen` `storyTitleKey`. If left as-is, the kicker on every
> beat and the StorySelect card would read „Die Nieren-Skala" with the „Skala"/gauge concept §7
> spends its length retiring. **Rewrite the `de` keys in place** (same key names, new copy):
> ```ts
> // REPLACE WITH (de dict, lines 60–61):
> 'story.organ.title': 'Der müde Filter',
> 'story.organ.desc':  'Die Niere wäscht die Medizin langsamer aus – dieselbe Dosis staut sich höher.',
> 'story.organ.desc.adult': 'Sinkt die eGFR, sinkt die renale Clearance – dieselbe Dosis kumuliert.',
> ```
> (The `.title.adult` register can be omitted — „Der müde Filter" reads for both. Add only the
> `.desc.adult` shown above.) **Also update the EN / FR / NL / AR `story.organ.*` keys**
> (`locale.svelte.ts` lines ~933 / ~959 / ~985 / ~1010, currently „Weak organs" / „Organes
> affaiblis" / „Zwakke organen" / „أعضاء ضعيفة" with the gauge-era desc) so they don't drift from
> „Der müde Filter" when i18n lands. Those locales fall back to `de` on the kiosk today, so this is
> **lower urgency than the `de` rewrite** — but do it in the same pass. Suggested:
> ```ts
> en:  'story.organ.title': 'The tired filter',   'story.organ.desc': 'The kidney washes the drug out more slowly — the same dose stacks higher.'
> fr:  'story.organ.title': 'Le filtre fatigué',  'story.organ.desc': 'Le rein élimine le médicament plus lentement — la même dose s’accumule.'
> nl:  'story.organ.title': 'De vermoeide filter','story.organ.desc': 'De nier wast het medicijn trager uit — dezelfde dosis stapelt hoger op.'
> ar:  'story.organ.title': 'المُرشِّح المُتعَب',  'story.organ.desc': 'الكلى تغسل الدواء ببطء أكبر — فتتراكم الجرعة نفسها أعلى.'
> ```

---

## 1. One-liner + the unique mechanic verb

**One-liner:** Frau Yilmaz' Niere — der Abfluss, der die Zucker-Medizin auswäscht — ist müde
geworden; dieselbe, völlig unveränderte Dosis staut sich jetzt höher, der Spiegel STEIGT live
weiter aus dem grünen Bereich heraus, und der Spieler muss den Medizin-Hahn im Flug kleiner
stellen, bevor das Wasser über den grünen Bereich läuft.

**Mechanic verb: CALIBRATE-A-LIVE-INFLOW vs an invisible weakened drain — „catch-a-rate".**
The player turns **one inflow tap** (the dose) against an **invisible, weakened drain** (the
kidney) on **live, travelling water**, not a frozen gauge. The signature beat is a **live cut**:
the tap is open, the Spiegel rises in real time out of the green window, and the player taps
**„reduzieren"** at the right moment so the pump swings back and settles in green. Too late /
full tap = the pump carries the water visibly over the window (loss).

**Why distinct from the other five** (the distinctness matrix, blueprint §1.7):
- It is the **only RATE-vs-RATE** verb: a steady inflow against a weakened outflow rate. Every
  other story is instant cause→effect (`fruehstueck` subtract, `ddi` scan, `gene` bet-then-pour)
  or lagged/authored (`johanniskraut` back-date, `adherence` author-time).
- It is the **only timing-window catch** — the danger is that the water **won't stop on its own**;
  you tap the brake at the right second. „Stillness" therefore does NOT mean „safe" here the way
  it does in ddi/fruehstueck — non-movement of a *rising* tank is the danger, not the answer.
- vs `johanniskraut` (the closest sibling — both end on a live defence against water heading for
  a window edge): **direction + cause-visibility differ.** Organ rises because an INVISIBLE drain
  weakened (you turn the tap DOWN, a timing catch). JK falls because a PAST tea still leaks (you
  identify the back-dated cause under falling water). They must never both reduce to „tap the
  brake in time": organ's finale is a TIMING catch, jk's is a CAUSE id.
- vs `ddi`/`fruehstueck`'s tap-and-read loop (the residual rhyme at beat 3): the beat-3 detective
  here is **disambiguated in copy by the *direction* of the confirming move.** When the true cause
  is tapped, the water moves **UP because it STAUT sich** (backs up behind a tired drain) — that is
  explicitly *not* a generic „danger surge". The `organ.dfb.kidney` young copy names the *stau*
  („es STAUT sich") so a walk-up reads the up-move as a backup, not as „I just triggered the
  danger". This keeps the detective beat legible as the organ verb, and the finale verb (the
  live timing catch) is what carries distinctness regardless.

---

## 2. Patient & learning

**Case.** **Frau Yilmaz, 74**, Typ-2-Diabetes (young: „Zucker-Krankheit"), seit Jahren stabil
auf **Metformin** in gewohnter Dosis. Bei der Routinekontrolle ist die **Nierenfunktion gefallen**
(eGFR von normal auf **~35 ml/min/1,73 m²**, also Stufe 30–44). The kidney is **deliberately not
mentioned in the briefing** — the player must discover it.

**Real drug + interaction (demonstrator-accurate, blueprint §6 firewall).** Metformin is
**eliminated unchanged by the kidney** — the kidney IS the drain. A weaker kidney (lower eGFR)
clears LESS → the **same dose now accumulates** → the Spiegel climbs over the window
(Laktatazidose-Risiko). Fix = **reduce the dose to match the kidney** AND keep monitoring renal
function. Drinking more water does **not** rejuvenate a chronically weak kidney. Stopping entirely
is an **over-correction at eGFR 35** (blood sugar derails); complete cessation is only right at
**eGFR < 30** — a *different threshold for a different patient*, flagged explicitly so nobody
leaves thinking „absetzen ist immer falsch" OR „absetzen ist hier richtig".

**The PK lesson the player leaves with.**
- *Young:* „Manche Medizin wird über die Nieren aus dem Körper rausgewaschen — die Nieren sind
  der Abfluss. Ist der Abfluss müde, kommt die Medizin langsamer raus und dieselbe Menge staut
  sich höher. Dann hilft nicht mehr trinken, sondern: den Medizin-Hahn ein Stück kleiner stellen
  — aber nicht ganz abdrehen, sonst ist zu wenig Zucker-Medizin da."
- *Adult:* „Metformin wird unverändert renal eliminiert. Sinkt die eGFR, sinkt die renale
  Clearance; bei gleicher Dosis kumuliert der Wirkstoff (Laktatazidose-Risiko). Bei eGFR ~35
  (Stufe 30–44): Dosis reduzieren/deckeln UND die Nierenfunktion engmaschiger überwachen — nicht
  absetzen. Komplettes Absetzen ist erst bei eGFR < 30 richtig. Die Organfunktion steuert die
  Dosierung."

The Spiegel is **„der Spiegel"** (wie viel Wirkstoff im Blut ist) — never „das Wasser" in copy.
Danger = „über den grünen Bereich / das grüne Fenster" / „weit zu hoch" — **never „rote Linie".**
(The internal auto-trip line at 80 is invisible on the torso; copy only ever names the green
window and „über/unter" it.)

---

## 3. The level arc (every pump move, exact numbers from `LEVELS`)

Source of truth: `flow.ts LEVELS` — `start 20 · bandLow 55 · bandHigh 70 · dose 62 · critLow 35 ·
critHigh 80`. The physical baseline the pump actually snaps to between runs is **≈42**
(`prepareThen` uses `game.level.baseline ?? 42`; `DEFAULT_CFG.baseline` is 20 but the live engine
sits at ~42), so **Stage 0 holds at ≈42** — there is no long 0→40 empty hub. All „over" demo
values sit CLEARLY above bandHigh 70 with pump margin (78, not 72); the one true over-loss runs
visibly to **86** (over critHigh 80 — the loss is read off the water).

| Beat | From → To | rate | Cause / trigger | What the player should READ | Constant |
|---|---|---|---|---|---|
| 0 Briefing (mount) | hold ≈42 | — | Engine baseline; no dose yet | „leerer" Ausgangskörper, noch keine Medizin | `ORGAN_BASE` (=42) |
| 1a Cold-start fill | 42 → **62** | ~5 | „Gewohnte Dosis geben" (one tap) | Spiegel steigt satt mittig ins grüne Band — „so sieht normal aus" | `ORGAN_DOSE` (=`LEVELS.dose`=62) |
| 1b Cold-start creep | 62 → **78** | ~3 | SAME tap, no reset — chained driveTo | „er hört nicht auf zu steigen" — zittert ein Fingerbreit unter dem Rand, weit über Grün | `ORGAN_DRIFT` (=78) |
| 2 Frage steht im Wasser | hold **78** | — | „Am Körper nachsehen" (transition only) | das zitternde Wasser an der Kante IST die Frage | (holds `ORGAN_DRIFT`) |
| 3 Verdachts-Check (right hyp.) | 78 → **79.3** | ~2 | Hypothese „müder Abfluss" getestet AM Körper | Bestätigung steigt nach OBEN: „es STAUT sich — schwächerer Abfluss staut höher" | `ORGAN_CONFIRM` (=79.3) |
| 3 Verdachts-Check (wrong hyp.) | hold (no move) | — | Köder-Hypothese | DEAD STILL = „erklärt den hohen Stand nicht, harmlos" | — |
| 4 Mechanismus | hold **~79.3** | — | „Hahn einstellen" (one sentence, no fill) | still an der Kante — der Mechanismus wurde schon am Wasser gefühlt | (holds `ORGAN_CONFIRM`) |
| 5 Live-Cut start (enter) | **76** → rising | ~3 | Auto-start on entering beat 5 | das Wasser FÄHRT live nach oben Richtung Kante — kein eingefrorener Pegel | `ORGAN_LIVE_START` (=76) |
| 5 win — „reduzieren" | →76ish → **62** | ~4 | Tap „reduzieren" mid-rise (caught in time) | erleichterndes Absacken zurück in Grün, STILL = Sieg | `ORGAN_DOSE` (=62) |
| 5 over — „voller Hahn"/late | →rising → **86** | ~4 | „voller Hahn" or caught too late | Wasser kriecht real über den grünen Bereich (über 80) = sichtbarer Überlauf | `ORGAN_OVER` (=86) |
| 5 under — „ganz zu / Pause" | →76 → **46** | ~4 | „Hahn ganz zu" (komplett absetzen) | fällt klar unter Grün, aber auf/über Baseline — „leer, Zucker entgleist" | `ORGAN_UNDER` (=46) |
| 5 bait — „mehr trinken" | hold (no move) | — | Wasser-Köder | STILL beim aktuellen Steig-Stand = „hilft dem müden Filter nicht" + Retry | — |
| 6 Filter-Plan safe card | hold **62** | — | „prüfen" / „fragen" Karte | ruhiges grünes Atmen, Wasser bleibt bei 62 | (holds `ORGAN_DOSE`) |
| 6 Filter-Plan trap card | 62 → **72** → 62 | ~3 | „wieder volle Dosis" Karte | kurze Warnbewegung über Grün → muss zurückgenommen werden | `ORGAN_TRAP_WARN` (=72) |
| 7 Outcome (settled) | win 62 / over 86 / under 46 | — | EndScreen | Endzustand am Tank ablesbar | — |

**Legality checks (all enforced by the sim, §11):** `ORGAN_DOSE` 62 ∈ [55,70] (win);
`ORGAN_DRIFT` 78, `ORGAN_CONFIRM` 79.3, `ORGAN_TRAP_WARN` 72 all `< 80` (demo caps, no trip);
`ORGAN_OVER` 86 `> 80` → `outcomeForLevel`='over'; `ORGAN_UNDER` 46 `< 55` and `> 35` (and `> 42`
baseline) → `outcomeForLevel`='under'; `ORGAN_LIVE_START` 76 `> 70` and `< 80` (already out of
green so the read-the-body call „it's rising past green" is honest, but not yet a trip).

> **Under-loss pump margin (revised).** `ORGAN_UNDER` is **46**, not 48. The under side has the
> least room of any demo level — squeezed between `bandLow` 55 and the baseline ≈42 (only 13 units
> total). At **46** it sits **9 units below bandLow 55** (≥ the blueprint §3 ≥~8-unit pump-margin
> rule) and still **4 above baseline 42** and **11 above critLow 35** — so on a miscalibrated real
> pump it still reads clearly *below* green without crashing to/under baseline. 48 (7 below) was
> too thin on the under side and must not be used. The sim (§11) asserts the margin explicitly
> (`band_low − ORGAN_UNDER >= 5`), not merely `< band_low`. **Bench-verify** on the calibrated
> torso that 46 reads visibly below the green tape (see §12 open risk).

**Continuous-drive note (1a→1b):** two chained `driveTo` over the `then` callback. `extWait`
fires at `|level−62|<0.6`, then the second call starts — a tiny seam at 62 is acceptable and
dramaturgically wanted („ein kurzer Atemzug ‚normal' bevor es weitersteigt"). No reset mid-hub.

---

## 4. Beat-by-beat flow (the component)

Self-contained v2 component on `PlayShell` + the `.pl-*` kit + `WatchBody` + the `drive()`/`pumping`
guard + EndScreen-outside-`.beat`. Beat union (local `$state`):

```ts
type Beat =
  | 'briefing' | 'dose' | 'dosing'        // 0, 1
  | 'question'                            // 2
  | 'detective' | 'detmoving' | 'detfound'// 3
  | 'mechanism'                           // 4
  | 'live' | 'livemoving' | 'won'         // 5 (live-cut)
  | 'plan'                                // 6 (finale)
  | 'outcome'                             // 7
```

Root pattern (EndScreen MUST be a direct child of the `position:relative;height:100%` root, NOT
inside the animated `.beat` — its leftover transform would clip the absolute EndScreen):

```svelte
<div class="root">
  {#if beat === 'outcome'}
    <EndScreen … />
  {:else}
    <PlayShell color={game.story?.color ?? 'var(--toxic)'} kicker={t('story.organ.title')}
               caseLine={t('organ.case')} step={stepNum} total={6} onCancel={backToStories}>
      {#key beat}<div class="beat"> … </div>{/key}
    </PlayShell>
  {/if}
</div>
```

`drive()` wrapper sets `pumping=true`, drives, frees on settle; **every action button is
`disabled={pumping}`**. During any moving beat the screen shows ONLY a `WatchBody` banner + a
still caption — no floating emoji.

`stepNum` mapping (total 6): briefing/dose/dosing → 1 · question → 2 · detective* → 3 ·
mechanism → 4 · live*/won → 5 · plan → 6.

`onMount(() => drive(ORGAN_BASE, 8))` — hold at ≈42 (cheap; the pump is already near baseline).

---

### Beat 0 — `briefing` (Frau Yilmaz)
- **Screen:** `.scene` — 🧑‍⚕️ emoji, `pl-h1` = `organ.brief.patient`, `pl-lead` =
  `organ.brief.goal`. **No mention of kidney/drain.** `pl-action` „Los geht's" → `dose`.
- **Player:** taps „Los".
- **Pump:** holds ≈42 (mount drive). STILL = empty starting body, no medicine yet.
- **Scored:** —

### Beat 1 — `dose` → `dosing` (one continuous rise: normal → too high · the cold-start twist) ★ THE TWIST
- **Screen (`dose`):** `.scene` — 💊, `pl-h2` = `organ.dose.prompt`, `pl-action` = `organ.dose.btn`
  („Gewohnte Dosis geben") → `giveDose()`.
- **Screen (`dosing`):** `.scene wide` — `WatchBody` cue. While 42→62: `organ.cue.fill` (tone
  `good`). The moment 62→78 starts: swap to `organ.cue.creep` (tone `rising`) — „warte… er hört
  nicht auf zu steigen". **This is the dose-fill teaching beat: rotate 3–4 „Wusstest du?" fact
  cards** during the slow hub (`ORGAN_FACTS`, §8/§9), holding the last fact a minimum readable
  time, exactly like Frühstück's `factIdx` rotation. Facts cover disease/drug/window/timing.
- **Player:** taps „Gewohnte Dosis geben" ONCE. No second tap, no reset between 62 and 78.
- **Pump:** `giveDose()` chains two `driveTo` over the `then` callback:
  `drive(ORGAN_DOSE=62, 5, () => { creep=true; drive(ORGAN_DRIFT=78, 3, () => beat='question') })`.
  Set a local `creep` flag at the seam so the WatchBody cue + tone flip to `rising`. Stops
  trembling at 78 (`< 80`, no auto-loss).
- **Scored:** — (this is the forced demo; the twist is mandatory, see §5).

### Beat 2 — `question` (the question stands in the water)
- **Screen:** `.scene` — `pl-h2` = `organ.q.prompt` („Gleiche Tablette wie immer — gestern grün,
  heute klebt der Spiegel über dem grünen Bereich. Was hat sich verändert?"), a `WatchBody`
  (tone `watch`) = `organ.q.watch`, `pl-action` „Am Körper nachsehen" → `detective`.
- **Player:** reads, taps „Am Körper nachsehen".
- **Pump:** STILL at 78 — holds the Stage-1 level (saves pump time; the trembling water is the
  question).
- **Scored:** —

### Beat 3 — `detective` → `detmoving` → `detfound` (Verdachts-Check · stillness-is-answer, outflow-specific) ★ clever
- **Screen (`detective`):** `.task` — `pl-h2 center` = `organ.det.prompt` („Warum steht der
  Spiegel so hoch?"). A column of **four** `pl-opt` hypotheses (3 baits + the cause), built from
  `ORGAN_DETECT` (§8): „stärkere Tablette", „mehr gegessen", „zu wenig getrunken", „Abfluss /
  Nieren-Filter müde". A `WatchBody` shows `organ.det.watch` (tone `watch`) by default, or the
  last feedback (tone `still` for a wrong tap). Disable all opts while `pumping`.
- **Player:** taps hypotheses until the right one. Each is tested AM Körper.
- **Pump:**
  - **Wrong** (`correct:false`): NO move (`testHypothesis({real:false}, …)` / a deliberate
    no-op). DEAD STILL = „das erklärt den hohen Stand nicht, harmlos." Set `detectFb` to the
    item's feedback key, increment a stumble counter (`wrongGuesses`).
  - **Right** (`correct:true`, the müder-Abfluss item): `beat='detmoving'`;
    `drive(ORGAN_CONFIRM=79.3, 2, () => beat='detfound')`. The water creeps a last tiny step
    UP and clings to the edge — **the confirmation moves UP because it STAUT sich**, matching the
    lesson („ein langsamerer Abfluss staut genau so höher" — backup, not a danger-surge). `< 80`,
    no loss.
- **Screen (`detmoving`):** `.scene` — `WatchBody` `organ.det.confirm` (tone `rising`).
- **Screen (`detfound`):** `.scene` — a tinted „cause card" (🫘 „müder Nieren-Filter" / adult
  „Niere · eGFR ~35"), `reveal pl-good small` = `organ.det.found`, `pl-lead` =
  `organ.det.foundPeek`, `pl-action` → `mechanism`.
- **Scored — feeds `clever`:** found-first-try (no wrong tap before the cause) → clever full;
  one wrong tap → half; ≥2 → 0. Reading the upward stau-confirmation correctly is the lesson and
  is part of the same clever bonus (§10).

### Beat 4 — `mechanism` (the why, in one sentence — no second A/B run)
- **Screen:** `.scene wide` — 💡, `pl-lead` = `organ.mech` („Die Medizin verlässt den Körper über
  die Nieren — den Abfluss. Müder Abfluss → mehr bleibt drin → also muss weniger rein."), adult
  sublabel inline via `organ.mech.adult` (renale Elimination, eGFR ~35). A `WatchBody`
  `organ.mech.watch` (tone `still`) points back at the clinging water. `pl-action` „Hahn
  einstellen" → `live`.
- **Player:** reads, taps „Hahn einstellen".
- **Pump:** STILL at ~79.3. **No new fill** — the old A/B double-demo (two resets + two long hubs)
  is deleted; the mechanism was already felt on the water in beats 1 + 3. This is the single
  biggest pacing win.
- **Scored:** — (understanding is scored at beat 3 via the upward stau-confirmation read).

### Beat 5 — `live` → `livemoving` → `won` (Hahn-Kalibrierung · the live cut · SIGNATURE BEAT) ★ read-the-body + ★ pro(timely)
- **Screen (`live`):** `.task` — `pl-h2 center` = `organ.live.prompt` („Der Hahn ist offen —
  schau, der Spiegel STEIGT. Stell ihn ein, bevor das Wasser über den grünen Bereich läuft.").
  A `WatchBody` `organ.live.watch` (tone `rising`) — „er STEIGT — schau auf den Körper". Below,
  the taps (from `ORGAN_TAPS`, §8) rendered as big touch buttons in a row:
  - „Hahn kleiner (reduzieren)" — the win
  - „Hahn ganz zu (Pause)" — the under-loss (`adultOnly` — hidden for young; see §6 decision)
  - „voller Hahn (gewohnte Dosis lassen)" — the over-loss
  - „nur mehr trinken" — harmless bait (separate, `bait:true`)

  **Read-the-body decision:** NO number / no eGFR / no percent is shown here. The player decides
  from DIRECTION + SPEED of the live water relative to the green band: „es steigt und ist schon
  über Grün — ich muss JETZT den Hahn kleiner stellen." (Brief §read-the-body: the same screen
  gesture would have a different right answer if the water were resting low in green.)
- **Player:** on entering, water is already rising live from 76. Taps a tap. Buttons that would
  drive a real hub are `disabled={pumping}`; the bait never disables (it just holds + retries).
- **Pump (on enter `live`):** auto-start a visible live rise: `drive(ORGAN_LIVE_START=76, 3, …)`
  toward the edge — but DON'T let it auto-loss on its own; cap the auto-rise just under the edge
  if untouched (drive toward `ORGAN_DRIFT`=78 and hold there if no tap arrives, so a frozen
  walk-up doesn't auto-lose; the loss only comes from choosing „voller Hahn" / „zu spät"). See
  the tuning open-risk in §12.
- **Pump (on tap):**
  - **reduzieren** → `beat='livemoving'`; `drive(ORGAN_DOSE=62, 4, () => beat='won')`. Relieving
    drop back into green, then STILL = win. WatchBody `organ.live.reduce` (tone `falling`).
  - **voller Hahn / too late** → `drive(ORGAN_OVER=86, 4, onSettle→outcome='over')`. Water creeps
    real over the green window (over 80) = visible overflow. Resolved as JS-outcome `over`
    **on settle at 86** — see the explicit trip-timing note below. WatchBody `organ.live.over`
    (tone `rising`).
  - **Hahn ganz zu / Pause** → `drive(ORGAN_UNDER=46, 4, onSettle→outcome='under')`. Falls clearly
    under green but stays on/over baseline 42 (no sub-baseline crash, no auto-trip). WatchBody
    `organ.live.under` (tone `falling`).
  - **mehr trinken (bait)** → NO move; hold at the current rising level; show
    `organ.live.bait` (tone `still`) = „das hilft dem müden Filter nicht" + let the player choose
    again (Retry). **A bait tap BEFORE the catch costs the `pro` timely half** — set
    `baited=true` (see §10 — this is what makes `pro` missable on a winning run).
- **Screen (`livemoving`):** `.scene` — `WatchBody` only (the move cue), no controls.
- **Screen (`won`):** `.scene` — `pl-h2 pl-good` = `organ.won.title`, `pl-lead` =
  `organ.won.body` („kleiner gestellt UND den Filter weiter beobachten"), `pl-body` =
  `organ.won.peek`, `pl-action` „Weiter" → `plan`. **Don't flash success — land on a proper beat
  with Weiter + a peek** (blueprint §6).

  > **Over-loss trip timing (be explicit — do NOT half-port Frühstück).** This spec resolves the
  > over path **on settle at 86**, via the `drive(ORGAN_OVER=86, 4, onSettle→outcome='over')`
  > callback — there is **no mid-travel `$effect` watching `game.level.level >= 80`** in the
  > recommended build. The water visibly climbs over the green window and the screen catches up
  > when it settles. (Frühstück additionally has a mid-travel `$effect` at line ~98 that trips the
  > instant `lv >= 80`; that is an *optional* dramatization, not required here. If a builder wants
  > the „crosses live, then the screen catches up" beat, add the SAME `$effect` — `if (beat ===
  > 'livemoving' && chosen?.result === 'over' && !resolved && game.level?.level >= 80) { resolved =
  > true; outcome = 'over'; beat = 'outcome' }` — but do not leave it half-wired: either settle-only
  > OR the full mid-travel effect, never a dangling check.) §12 risk 2 documents why `play2` has no
  > engine auto-trip.
- **Scored:**
  - **clever check (read-the-body):** recognised the live water is rising past green and an
    intervention is needed — this read is implicit in committing `reduzieren` as the first serious
    move (a loss → 0 stars anyway). The detective beat-3 first-try drives `clever` (§10).
  - **pro check (timely):** chose `reduzieren` on the first serious move **without first tapping
    the bait**, and the water lands in green. Feeds `pro`. **Tapping the bait before the catch
    forfeits this half** (see §10) — that is what keeps `pro` genuinely missable on a win.

  > **Strategy-cleanliness / preview (the brief's optional Stage 5b „pro" refinement):** the brief
  > proposes a non-committing preview UI so the „pro" bonus = „never previewed an extreme."
  > **RECOMMENDED SIMPLIFICATION for the build:** drop the separate preview screen — it adds a new
  > non-committing UI primitive that the rest of the kit doesn't have, and risks the locked-grammar
  > rule (no on-screen vessel/meter). Instead make the **`pro` timely half = a clean, unbaited
  > live-cut**: full only if the first committed tap is `reduzieren` AND the player never tapped the
  > „mehr trinken" bait first (a bait tap before the catch = „hesitated / guessed at the water" →
  > lose that half). This keeps `pro` honestly missable on a winning run (the bait is a real
  > misread of the water) without inventing a preview component, and keeps the two-bonus `stars()`
  > shape clean. (If a future builder still wants the preview, gate it as text-only micro-preview,
  > never a pump move and never a mirrored gauge — see §12 open risk.)

### Beat 6 — `plan` (Filter-Plan am Wasser · finale, win-path only — ends on movement) ★ pro(clean)
- **Screen:** `.task` — `pl-h2 center` = `organ.plan.prompt`. Three plan cards, one tap each
  (`ORGAN_PLAN`, §8): „Filter regelmäßig prüfen lassen" (safe) · „bei Krankheit Fachleute fragen"
  (safe) · „einfach wieder volle Dosis, wenn's besser geht" (trap). Each is answered AM Körper.
  A small progress hint shows which safe cards are done; the trap card, if tapped, must be taken
  back before the beat can finish.
- **Player:** taps the cards.
- **Pump:**
  - **safe card** → small reassuring green „breath" (qualitative only — no pump move needed, or a
    micro-hold at 62), WatchBody `organ.plan.safe` (tone `good`), card marks done.
  - **trap card** („wieder volle Dosis") → `drive(ORGAN_TRAP_WARN=72, 3, …)` — the Spiegel creeps
    visibly over green as a WARNING; WatchBody `organ.plan.trapWarn` (tone `rising`) = „zu hoch —
    der Filter ist noch müde." The player MUST take it back („zurücknehmen") → `drive(62, 3, …)`.
    Tapping the trap sets `planTrapTapped=true` (costs the clean-finale half of `pro`).
- **Finish:** when both safe cards are confirmed and the trap (if tapped) is taken back,
  `pl-action` „Weiter" → `outcome`. The story's last image is **moving water settling in green**,
  not a glowing table.
- **Scored — feeds `pro` (clean half):** finale completed with no hanging trap → full; trap
  tapped (then corrected) → the clean half is lost.

### Beat 7 — `outcome` (EndScreen · debrief)
- Render `EndScreen` (direct child of root). Props:
  ```svelte
  <EndScreen {outcome}
    titleKey={`organ.out.${outcome}.title`} subKey={`organ.out.${outcome}.sub`}
    storyTitleKey="story.organ.title" score={starCount}
    factKeys={outcome === 'win'
      ? ['organ.out.dyk1', 'organ.out.dyk2']
      : outcome === 'over'
        ? ['organ.out.dyk.over', 'organ.out.dyk1']
        : ['organ.out.dyk.under', 'organ.out.dyk1']} />
  ```
  (`storyTitleKey="story.organ.title"` now resolves to the REWRITTEN „Der müde Filter" — see the
  §init wiring note; do not leave the key on the retired „Nieren-Skala" value.)
- **Debrief (2 facts, kid+adult):** restate the learning + safe action. **Loss debriefs name WHAT
  happened** (over = Kumulation/Säure-/Laktatazidose-Risiko; under = leer / Zucker entgleist) —
  **never „du warst zu vorsichtig."** The `< 30 = absetzen` knowledge is explicitly marked as a
  DIFFERENT threshold for a different patient (§9 copy).
- Win: tank rests at 62 in green. Over-loss: tank stands over green at ~86. Under-loss: tank low
  at ~46 (on/over baseline). The end state is readable on the tank.

---

## 5. The one tank-surprise twist

**SAME-DOSE-NOW-RISES** — the mandatory, unavoidable forced demo (beat 1). The single tap
„Gewohnte Dosis geben" runs ONE uninterrupted rise: 42→62 (water sits satt mittig in green —
„so sieht normal aus") and then, **with the tap completely unchanged and no reset**, the SAME
water keeps creeping 62→78 over the green window and trembles at the edge. Nothing about the pill
or the dose changed — only the invisible drain (the kidney) weakened, so exactly the same amount
stacks higher. Counterintuitive: the player „did nothing different" and the body still fills
dangerously, and the fix is „put LESS in" although the dose was never raised.

**Why only the real water can deliver it:** the payoff is a single continuous physical rise with
no cut between „gut" and „zu hoch" — the room stares because the same tap lands far too high in
one unbroken movement. A screen widget cannot sell „nothing changed yet it rose." It is reinforced
at beat 3, where uncovering the true cause does NOT calm the water but pushes it a last step
toward the edge (78→79.3): understanding makes the danger more visible, not smaller. This is a
forced demo beat (no option to skip), exactly per blueprint §1.6 and the cross-story „mandatory
twist" audit.

---

## 6. Challenge design (non-obvious decision + plausible wrong answers)

**The core read-the-body decision (beat 5).** With live rising water and NO number shown, the
player must infer from direction+speed that intervention is needed AND pick the right magnitude.
The same screen gesture (choose a tap) has a different right answer depending on the water: if the
Spiegel were resting low in green, „weiterlaufen lassen / voller Hahn" would be fine — but because
it is visibly RISING past green toward the edge, „reduzieren" is right and „voller Hahn" is fatal.

**Plausible wrong answers (real patient/clinician mistakes — a thoughtless walk-up can lose):**
- **„Volle/gewohnte Dosis lassen"** (over-loss). The textbook mistake: „nichts hat sich an der
  Tablette geändert, also lasse ich die Dosis." But with the weakened drain the same dose
  accumulates → water runs over the green window (Laktatazidose-Risiko). This is the headline loss.
- **„Nur mehr trinken / abwarten"** (harmless bait → retry, but costs the `pro` timely half — a
  real misread). A very common lay belief: „Nieren spült man mit viel trinken frei." Does nothing
  for a chronically weak filter → the pump stays still at the rising level, gentle correction,
  choose again — but the hesitation is scored (it is the missable side of `pro`, §10).
- **„Metformin ganz absetzen / Pause"** (under-loss). A *plausible over-correction* — „die Niere
  ist schwach, also lieber ganz weglassen." At eGFR 35 this is too much: the Spiegel drops under
  green, blood sugar derails. (Framed as over-correction for THIS patient, NOT „stopping is
  wrong"; complete cessation is right only at eGFR < 30 — a different threshold.) **Young filter:**
  the „ganz zu / Pause" tap is `adultOnly` and hidden for kids, so children choose between
  „reduzieren" and „voll lassen" — they still meet the „auch nicht zu wenig" lesson via the
  debrief, but aren't asked to weigh the absetzen nuance. (Brief open question resolved: hide it.)

The beat-3 detective adds a second non-obvious layer: three plausible non-causes (stronger pill,
ate more, drank too little) all leave the water DEAD STILL; only „müder Abfluss" moves it — and it
moves UP because it STAUT sich (backs up behind a tired drain), not the generic „danger surge," so
the mechanic itself teaches.

**The finale trap (beat 6):** „einfach wieder volle Dosis, wenn's besser geht" — the relapse
mistake; the pump warns by creeping over green, and the player must take it back.

---

## 7. Custom visual

**None beyond the kit — and that is deliberate.** The old eGFR needle gauge is **retired.** The
brief's signature is *live rising water on the physical torso*, not an on-screen gauge; per
blueprint §1.2 / the „no on-screen vessel" lint rule, the real pump is the only level readout, and
the read-the-body decision (beat 5) explicitly shows **no number / no eGFR / no percent**. An eGFR
gauge would (a) duplicate the level visually and (b) hand the player the answer the brief wants
them to READ off the water. So:

- **No SVG gauge, no mirrored bar, no numeric meter.** The only on-screen level reference is
  qualitative copy („über dem grünen Bereich", „steigt", „in Grün").
- The atmosphere comes from `PlayShell`'s per-story aura (story color `#ff6b7a`) — light CSS
  gradients + drifting pills/bubbles, already Pi-safe (no heavy blur).
- The taps/cards/hypotheses use the existing `.pl-opt`/`.pl-card`/button styles. The „cause card"
  and „won" beats reuse the Frühstück `.culpritcard`/`reveal` patterns (story-tinted, light box
  shadow only).

If a future builder insists on visualising kidney strength, the ONLY permitted form (per the
matrix note) is a horizontal needle clearly LABELLED „eGFR" and visually distinct from any level
bar — but this spec recommends omitting it to keep the eyes on the water and the decision honest.

---

## 8. Data model — `frontend/src/lib/stories/organ.ts`

Headless-pure (no Svelte runes). All levels derive from `LEVELS`.

```ts
// Story „Der müde Filter" (Organ/DOI · eGFR↓ × Metformin) — pure data + scoring.
// Torso-first v2 (docs/stories/overhaul/build-organ.md). Signature mechanic:
// CALIBRATE-A-LIVE-INFLOW vs an invisible weakened drain — the kidney clears
// Metformin (the drain); a weak kidney clears less → the SAME dose accumulates →
// the Spiegel rises live over the green window; the player taps „reduzieren"
// mid-rise to settle it back into green. No on-screen vessel — the pump is the readout.
import { LEVELS, type Outcome } from '../flow'

// --- torso levels (all engine-legal; see build-organ.md §3) ---
export const ORGAN_BASE = 42          // physical baseline the pump snaps to (game.level.baseline ?? 42)
export const ORGAN_DOSE = LEVELS.dose // 62 — standard dose lands mid green band (also the win target)
export const ORGAN_DRIFT = 78         // cold-start creep + untouched live cap: clearly over the window, < 80 (no trip)
export const ORGAN_CONFIRM = 79.3     // beat-3 upward stau-confirmation: staut höher, clings at the edge, < 80
export const ORGAN_LIVE_START = 76    // beat-5 live rise start: already out of green (> 70), still < 80
export const ORGAN_OVER = 86          // over-loss: visible overflow over the window (> 80 → outcome 'over')
export const ORGAN_UNDER = 46         // under-loss: under green (< 55, ≥5 below) but on/over baseline (> 42, > critLow 35)
export const ORGAN_TRAP_WARN = 72     // beat-6 finale trap warning: just over green, < 80, then taken back

// --- dose-fill facts (rotated while 42→62→78 pumps; kid/adult via t()) ---
export const ORGAN_FACTS = [
  'organ.fact.disease', 'organ.fact.drug', 'organ.fact.kidney', 'organ.fact.window',
]

// --- beat 3: hypotheses tested ON the body (3 baits + the cause) ---
export interface OrganDetectItem {
  id: string
  labelKey: string
  correct: boolean      // true only for the müder-Abfluss cause
  feedbackKey: string
}
export const ORGAN_DETECT: OrganDetectItem[] = [
  { id: 'strong', labelKey: 'organ.det.strong', correct: false, feedbackKey: 'organ.dfb.strong' },
  { id: 'food',   labelKey: 'organ.det.food',   correct: false, feedbackKey: 'organ.dfb.food' },
  { id: 'drink',  labelKey: 'organ.det.drink',  correct: false, feedbackKey: 'organ.dfb.drink' },
  { id: 'kidney', labelKey: 'organ.det.kidney', correct: true,  feedbackKey: 'organ.dfb.kidney' },
]

// --- beat 5: the live-cut taps (the dose calibration) ---
export interface OrganTap {
  id: 'reduce' | 'pause' | 'full'
  labelKey: string
  feedbackKey: string
  result: Outcome       // 'win' | 'under' | 'over'
  target: number        // the real driveTo target
  adultOnly?: boolean   // 'pause' (komplett absetzen) hidden for young
}
export const ORGAN_TAPS: OrganTap[] = [
  { id: 'reduce', labelKey: 'organ.tap.reduce', feedbackKey: 'organ.tfb.reduce', result: 'win',   target: ORGAN_DOSE },  // 62
  { id: 'pause',  labelKey: 'organ.tap.pause',  feedbackKey: 'organ.tfb.pause',  result: 'under', target: ORGAN_UNDER, adultOnly: true }, // 46
  { id: 'full',   labelKey: 'organ.tap.full',   feedbackKey: 'organ.tfb.full',   result: 'over',  target: ORGAN_OVER },  // 86
]
// harmless bait — never moves the pump, never an extreme, always retry.
// BUT: a bait tap before the catch forfeits the `pro` timely half (sets `baited`); see §10.
export const ORGAN_BAIT_FEEDBACK = 'organ.tfb.bait'

// --- beat 6: filter plan cards (2 safe + 1 trap) ---
export interface OrganPlanCard {
  id: string
  labelKey: string
  trap?: boolean        // 'wieder volle Dosis' — warns then must be taken back
}
export const ORGAN_PLAN: OrganPlanCard[] = [
  { id: 'check', labelKey: 'organ.plan.check' },
  { id: 'ask',   labelKey: 'organ.plan.ask' },
  { id: 'relapse', labelKey: 'organ.plan.relapse', trap: true },
]

/**
 * Stars for „Der müde Filter" → stars(win, clever, pro) from flow.ts.
 *  clever = the detective read (beat 3): 1 if the müder-Abfluss cause was found with
 *           no wrong tap, 0.5 with one wrong tap, 0 with ≥2.
 *  pro    = safe dosing: 0.5 for a CLEAN timely live-cut (first committed tap = reduzieren,
 *           water lands in green, AND no bait tapped first) + 0.5 for a clean finale
 *           (beat 6, no trap tapped).
 *  Any loss (over/under) → 0 (handled by stars()).
 *
 * NOTE on `timelyReduce`: it is `reduceWon && !baited`. The `!baited` clause is what makes
 * `pro` genuinely missable ON A WIN — committing `full`/`pause` is itself a loss (→0 stars),
 * so without `!baited` the timely half would be guaranteed on every win (auto-3★, forbidden by
 * blueprint §5/§7). The bait (mehr trinken) is a real misread of the water, so charging the half
 * for it is honest.
 */
export function organClever(wrongGuesses: number): number {
  return wrongGuesses === 0 ? 1 : wrongGuesses === 1 ? 0.5 : 0
}
export function organPro(timelyReduce: boolean, finaleClean: boolean): number {
  return (timelyReduce ? 0.5 : 0) + (finaleClean ? 0.5 : 0)
}
```

The component derives `outcome` from the chosen tap's `result`, computes `timelyReduce = (outcome
=== 'win') && !baited` (won via `reduzieren` without a prior bait tap), and
`starCount = stars(outcome==='win', organClever(wrongGuesses), organPro(timelyReduce,
!planTrapTapped))`. It filters `ORGAN_TAPS` by `game.ageGroup === 'adult' || !t.adultOnly`
(hides „pause" for young).

---

## 9. Full copy — `frontend/src/lib/stories/organ.locale.ts`

`export const organLocale: Record<string,string> = { … }`. Author `key` (young) always; add
`key.adult` only where the adult register differs. All danger phrased as „über/unter den grünen
Bereich"; the Spiegel is „der Spiegel"; enzymes/locations N/A here (the drain is the kidney).
Mined and rewritten from the retired `organ.*` block + the brief's learnings.

> The `story.organ.title` / `story.organ.desc` keys are NOT in this per-story file — they live in
> the shared `locale.svelte.ts` story-card block and **must be rewritten there** to „Der müde
> Filter" (see the §init wiring note). Do not duplicate them here.

```ts
export const organLocale: Record<string, string> = {
  // case header (persistent)
  'organ.case': 'Frau Yilmaz, 74 · Metformin',

  // beat 0 — briefing (kidney deliberately NOT mentioned)
  'organ.brief.patient': 'Frau Yilmaz, 74, hat die Zucker-Krankheit (Diabetes) und nimmt seit Jahren jeden Tag dieselbe Zucker-Medizin.',
  'organ.brief.patient.adult': 'Frau Yilmaz, 74 – Typ-2-Diabetes, seit Jahren stabil auf Metformin in gewohnter Dosis.',
  'organ.brief.goal': 'Hilf Frau Yilmaz! Halte den Spiegel im grünen Bereich – nicht zu wenig, nicht zu viel.',
  'organ.brief.goal.adult': 'Halte den Metformin-Spiegel im grünen Fenster – auch wenn sich am Körper etwas ändert.',
  'organ.brief.go': "Los geht's",

  // beat 1 — dose + the cold-start twist
  'organ.dose.prompt': 'Der Körper zeigt den Spiegel – wie viel Zucker-Medizin in Frau Yilmaz’ Blut ist. Gib ihr ihre gewohnte Dosis.',
  'organ.dose.prompt.adult': 'Der Torso zeigt den Metformin-Spiegel im Blut. Gib Frau Yilmaz ihre gewohnte Dosis.',
  'organ.dose.btn': 'Gewohnte Dosis geben',
  'organ.cue.fill': 'Schau auf den Körper – die Dosis läuft ein, der Spiegel steigt satt in den grünen Bereich. So sieht normal aus.',
  'organ.cue.fill.adult': 'Schau auf den Körper – der Spiegel läuft in den grünen Bereich. So war es immer.',
  'organ.cue.creep': 'Warte … er hört nicht auf zu steigen. Derselbe Hahn – und der Spiegel klettert von allein über den grünen Bereich.',
  'organ.cue.creep.adult': 'Achtung – der Spiegel steigt weiter, über den grünen Bereich hinaus, obwohl die Dosis unverändert ist.',

  // dose-fill „Wusstest du?" facts
  'organ.fact.kicker': 'Wusstest du?',
  'organ.fact.disease': 'Bei der Zucker-Krankheit ist zu viel Zucker im Blut. Die Medizin hilft, ihn im Griff zu halten.',
  'organ.fact.disease.adult': 'Beim Typ-2-Diabetes ist der Blutzucker chronisch erhöht; Metformin senkt ihn und hält ihn stabil.',
  'organ.fact.drug': 'Metformin ist die häufigste Zucker-Medizin. Man nimmt sie meist jeden Tag in gleicher Menge.',
  'organ.fact.drug.adult': 'Metformin ist First-Line bei Typ-2-Diabetes – Dauertherapie in fester Tagesdosis.',
  'organ.fact.kidney': 'Die Nieren sind der Abfluss: Sie waschen viele Medikamente wieder aus dem Körper heraus.',
  'organ.fact.kidney.adult': 'Metformin wird unverändert renal eliminiert – die Niere ist der Hauptausgang aus dem Körper.',
  'organ.fact.window': 'Wichtig ist die richtige Menge im Blut: zu wenig wirkt nicht, zu viel kann schaden.',
  'organ.fact.window.adult': 'Der Spiegel muss im therapeutischen Fenster bleiben – zu hoch wird gefährlich, zu tief unwirksam.',

  // beat 2 — the question
  'organ.q.prompt': 'Gleiche Tablette wie immer – gestern stand der Spiegel satt im Grünen, heute klebt er über dem grünen Bereich. Was hat sich verändert?',
  'organ.q.prompt.adult': 'Gleiche Dosis wie immer – der Spiegel steht plötzlich über dem grünen Fenster. Was hat sich geändert?',
  'organ.q.watch': 'Schau auf den Körper – der Spiegel zittert hoch über dem grünen Bereich.',
  'organ.q.btn': 'Am Körper nachsehen',

  // beat 3 — detective (stillness = harmlos; the cause moves UP because it STAUT sich)
  'organ.det.prompt': 'Warum steht der Spiegel so hoch? Tippe deine Vermutung an – und schau, ob sich am Körper etwas tut.',
  'organ.det.prompt.adult': 'Warum steigt der Spiegel, obwohl die Dosis gleich blieb? Prüfe jede Vermutung am Körper.',
  'organ.det.watch': 'Schau auf den Körper – bewegt sich der Spiegel, wenn deine Vermutung stimmt?',
  'organ.det.strong': '💊 Die Tabletten sind stärker geworden',
  'organ.det.food': '🍞 Sie isst zu viel Süßes',
  'organ.det.drink': '💧 Sie trinkt zu wenig',
  'organ.det.kidney': '🫘 Der Abfluss – der Nieren-Filter – ist müde geworden',
  'organ.det.kidney.adult': '🫘 Die Nierenfunktion ist gefallen (eGFR ↓)',
  'organ.dfb.strong': 'Der Spiegel rührt sich nicht – es sind dieselben Tabletten wie immer. Das war’s nicht.',
  'organ.dfb.food': 'Der Spiegel rührt sich nicht – Essen ändert nicht, wie viel Medizin im Körper bleibt.',
  'organ.dfb.drink': 'Der Spiegel rührt sich nicht – und mehr trinken macht müde Nieren nicht wieder jung. Das war’s nicht.',
  'organ.dfb.kidney': 'Schau – der Spiegel klebt noch ein Stück höher an der Kante, es STAUT sich! Ein müder Abfluss lässt die Medizin langsamer raus, und dieselbe Menge staut sich höher.',
  'organ.dfb.kidney.adult': 'Genau – sinkt die eGFR, sinkt die renale Clearance: Metformin geht langsamer raus und staut sich bei gleicher Dosis höher.',
  'organ.det.confirm': 'Schau auf den Körper – der Spiegel staut sich noch ein Stück höher.',
  'organ.det.found': 'Gefunden: der müde Nieren-Filter.',
  'organ.det.foundPeek': 'Der Abfluss ist müde – aber was heißt das für die Dosis? Schauen wir es uns an.',
  'organ.det.foundPeek.adult': 'Reduzierte renale Clearance bei eGFR ~35 – klären wir die Konsequenz für die Dosis.',
  'organ.det.causeYoung': 'Müder Nieren-Filter',
  'organ.det.causeAdult': 'Niere · eGFR ~35',

  // beat 4 — mechanism (one sentence)
  'organ.mech': 'Die Medizin verlässt den Körper über die Nieren – den Abfluss. Müder Abfluss → mehr bleibt drin → also muss weniger rein.',
  'organ.mech.adult': 'Renale Elimination: Metformin verlässt den Körper über die Niere. Sinkt die eGFR (~35), kumuliert der Wirkstoff – also Dosis reduzieren.',
  'organ.mech.watch': 'Schau auf den Körper – der Spiegel klebt noch oben an der Kante.',
  'organ.mech.btn': 'Hahn einstellen',

  // beat 5 — the live cut
  'organ.live.prompt': 'Der Hahn ist offen – schau, der Spiegel STEIGT. Stell ihn ein, bevor das Wasser über den grünen Bereich läuft!',
  'organ.live.prompt.adult': 'Der Hahn läuft – der Spiegel steigt live über den grünen Bereich. Stell die Dosis ein, bevor es zu hoch wird.',
  'organ.live.watch': 'Er STEIGT – schau auf den Körper! Der Spiegel zieht über den grünen Bereich.',
  'organ.tap.reduce': '🔽 Hahn kleiner stellen (reduzieren)',
  'organ.tap.pause': '⏹ Hahn ganz zu (Pause / absetzen)',
  'organ.tap.full': '🔼 Voller Hahn (gewohnte Dosis lassen)',
  'organ.tap.bait': '💧 Nur mehr trinken',
  'organ.tfb.reduce': 'Schau – der Spiegel sackt zurück und ruht im grünen Bereich. Kleiner gestellt – und den Filter weiter im Auge behalten.',
  'organ.tfb.reduce.adult': 'Dosis an die Niere angepasst (reduziert/gedeckelt) UND weiter überwacht – der Spiegel pendelt zurück ins Fenster.',
  'organ.tfb.full': 'Zu hoch! Der müde Abfluss schafft die volle Menge nicht – schau, das Wasser läuft über den grünen Bereich.',
  'organ.tfb.full.adult': 'Gefährlich – volle Dosis bei reduzierter Clearance → Kumulation → Laktatazidose-Risiko. Der Spiegel läuft über.',
  'organ.tfb.pause': 'Zu weit zu! Jetzt ist zu wenig Zucker-Medizin da – der Spiegel fällt unter den grünen Bereich und der Zucker entgleist.',
  'organ.tfb.pause.adult': 'Überkorrektur bei eGFR 35: ganz absetzen → Spiegel zu tief → Blutzucker entgleist. Absetzen wäre erst bei eGFR < 30 richtig.',
  'organ.tfb.bait': 'Der Spiegel rührt sich nicht – mehr trinken hilft dem müden Filter nicht. Stell den Hahn ein. Versuch’s nochmal.',
  'organ.tfb.bait.adult': 'Wirkungslos – mehr Flüssigkeit ersetzt keine Dosisanpassung bei chronisch reduzierter eGFR. Nochmal.',
  'organ.live.reduce': 'Schau auf den Körper – der Spiegel sackt zurück in den grünen Bereich.',
  'organ.live.over': 'Schau auf den Körper – der Spiegel läuft über den grünen Bereich hinaus!',
  'organ.live.under': 'Schau auf den Körper – der Spiegel fällt unter den grünen Bereich …',

  // beat 5 win landing
  'organ.won.title': 'Genau richtig eingestellt! 🎉',
  'organ.won.body': 'Du hast den Hahn rechtzeitig kleiner gestellt – und behältst den Filter weiter im Auge. Nicht „einmal reduziert und für immer sicher".',
  'organ.won.body.adult': 'Dosis rechtzeitig an die eingeschränkte Niere angepasst – und engmaschiger überwacht. Reduzieren UND beobachten.',
  'organ.won.peek': 'Bleibt es jetzt sicher? Machen wir einen Plan für die nächsten Monate.',

  // beat 6 — filter plan
  'organ.plan.prompt': 'Plan für die kommenden Monate: Was sollte Frau Yilmaz tun? Tippe jede Karte an.',
  'organ.plan.prompt.adult': 'Welche Maßnahmen sichern Frau Yilmaz für die kommenden Monate? Tippe jede Karte an.',
  'organ.plan.check': '🩺 Den Nieren-Filter regelmäßig prüfen lassen',
  'organ.plan.check.adult': '🩺 Nierenfunktion (eGFR) engmaschig kontrollieren',
  'organ.plan.ask': '👩‍⚕️ Bei Krankheit Fachleute fragen',
  'organ.plan.ask.adult': '👩‍⚕️ Bei akuter Erkrankung/Dehydratation Rücksprache halten',
  'organ.plan.relapse': '🔼 Einfach wieder volle Dosis nehmen, wenn’s besser geht',
  'organ.plan.relapse.adult': '🔼 Wieder auf die volle Dosis gehen, sobald es besser scheint',
  'organ.plan.safe': 'Gut – das hält Frau Yilmaz sicher. Der Spiegel bleibt ruhig im grünen Bereich.',
  'organ.plan.safe.adult': 'Richtig – Monitoring + Rücksprache halten den Spiegel stabil im Fenster.',
  'organ.plan.trapWarn': 'Schau auf den Körper – zu hoch! Der Filter ist noch müde, die volle Dosis staut sich wieder. Nimm das zurück.',
  'organ.plan.trapWarn.adult': 'Achtung – die eGFR ist weiter reduziert; die volle Dosis kumuliert erneut. Zurücknehmen.',
  'organ.plan.takeback': 'Zurücknehmen',
  'organ.plan.done': 'Weiter',

  // beat 7 — outcome / debrief
  'organ.out.win.title': 'Sicher dosiert! 🎉',
  'organ.out.win.sub': 'Du hast den Hahn rechtzeitig kleiner gestellt – der Spiegel ruht im grünen Bereich.',
  'organ.out.win.sub.adult': 'Dosis an die eingeschränkte Niere angepasst (reduziert + überwacht) – Frau Yilmaz liegt im Fenster.',
  'organ.out.over.title': 'Übergelaufen! ⚠️',
  'organ.out.over.sub': 'Die volle Dosis war zu viel für den müden Abfluss – der Spiegel ist über den grünen Bereich gelaufen.',
  'organ.out.over.sub.adult': 'Überdosis: volle Dosis bei reduzierter renaler Clearance → Kumulation → Laktatazidose-Risiko.',
  'organ.out.under.title': 'Zu wenig …',
  'organ.out.under.sub': 'Ganz abgedreht war zu viel – jetzt ist zu wenig Zucker-Medizin da und der Blutzucker entgleist.',
  'organ.out.under.sub.adult': 'Unterdosiert: komplett abgesetzt bei eGFR 35 → Spiegel zu tief → Blutzucker entgleist. Absetzen erst bei eGFR < 30.',
  'organ.out.dyk1': 'Die Nieren sind der Abfluss: Sie waschen die Medizin aus dem Körper. Müder Abfluss = dieselbe Menge staut sich höher.',
  'organ.out.dyk1.adult': 'Metformin wird unverändert renal eliminiert; sinkt die eGFR, sinkt die Clearance und der Wirkstoff kumuliert.',
  'organ.out.dyk2': 'Dann hilft nicht mehr trinken, sondern: den Hahn kleiner stellen – und den Filter weiter prüfen lassen.',
  'organ.out.dyk2.adult': 'Bei eGFR 30–44: Dosis reduzieren/deckeln + Niere überwachen. Komplett absetzen erst bei eGFR < 30 (andere Patientin, anderer Wert).',
  'organ.out.dyk.over': 'Bei einer schwächeren Niere wird die gewohnte Dosis schnell zu viel – sie staut sich über den grünen Bereich.',
  'organ.out.dyk.over.adult': 'Volle Dosis bei reduzierter Clearance → Kumulation. Die Organfunktion steuert die Dosierung.',
  'organ.out.dyk.under': 'Ganz absetzen ist hier zu viel: dann ist zu wenig Medizin da und der Zucker entgleist – nicht „du warst zu vorsichtig".',
  'organ.out.dyk.under.adult': 'Absetzen ist bei eGFR 35 eine Überkorrektur (Glukosekontrolle verloren) – komplettes Absetzen erst bei eGFR < 30.',
}
```

> Rank titles are NOT in this file — `EndScreen`/`StarRating` read `rank.*` from `flow.ts
> rankKey()` and the existing locale block (`rank.10` Apotheken-Azubi/Pharmazie-Azubi …
> `rank.30` SafePolyMed-Meister/Klinische:r Pharmazeut:in; loss `rank.0` Noch in
> Ausbildung/In Einarbeitung). Do not hardcode any rank string.

---

## 10. Scoring

`stars(win, clever, pro)` from `flow.ts` → `1 + clever[0/0.5/1] + pro[0/0.5/1]`; any loss = 0.
Map (per brief §Scoring, collapsed to the canonical two-bonus shape):

- **`clever` — the detective read (beat 3).** `organClever(wrongGuesses)`:
  - `1.0` — found „müder Abfluss" as the cause with **no wrong hypothesis tap** (and thereby read
    the upward stau-confirmation that teaches the mechanism).
  - `0.5` — one wrong tap before the cause.
  - `0` — two+ wrong taps.
  - **Earnable & missable:** a thoughtful player taps the kidney first (1.0); a guesser burns baits
    (0.5 / 0).
- **`pro` — safe dosing.** `organPro(timelyReduce, finaleClean)` = `0.5·timelyReduce +
  0.5·finaleClean`:
  - `timelyReduce` (0.5) — **`(outcome === 'win') && !baited`**: the first committed tap in the
    live cut is `reduzieren`, the water lands in green, **AND the player never tapped the „mehr
    trinken" bait first.** A bait tap before the catch is a real misread of the water (you reached
    for „spül die Nieren frei" instead of reading the rising Spiegel) and **forfeits this half.**
    Committing an extreme (`full`/`pause`) is itself a loss → 0 stars regardless.
  - `finaleClean` (0.5) — beat 6 finished with **no trap tapped** („wieder volle Dosis").
  - **Genuinely missable on a win:** clean unbaited catch + clean plan = 1.0; tap the bait first
    (then catch) OR tap the relapse trap (then correct it) = 0.5 each lost. This is the fix to the
    auto-3★ flaw: without `!baited`, the timely half was guaranteed on every win (because the only
    way to *not* reduce is to lose), so a flawless detective who dodged the relapse card would
    bank a free 0.5. The `!baited` clause restores a real on-win fork.

**Star outcomes:** flawless win (kidney-first, no bait, clean plan) = `1 + 1 + 1 = 3.0★`; one
detective stumble = 2.5★; clean detective + (one bait OR relapse trap) = 2.5★; clean detective +
both pro halves missed (bait first AND relapse trap) = `1 + 1 + 0 = 2.0★`; scraped win (2 wrong
detective taps + bait + relapse trap) = `1 + 0 + 0 = 1.0★`. Any over/under in the live cut → 0★
(loss rank `rank.0`).

Component wiring:
```ts
let wrongGuesses = $state(0)          // ++ on each wrong detective tap
let baited = $state(false)            // set true if the „mehr trinken" bait was tapped at beat 5
let planTrapTapped = $state(false)    // set true if the relapse card was tapped at beat 6
let outcome = $state<Outcome>('win')
let clever = $derived(organClever(wrongGuesses))
let timelyReduce = $derived(outcome === 'win' && !baited)   // missable on a win via the bait
let pro = $derived(organPro(timelyReduce, !planTrapTapped))
let starCount = $derived(stars(outcome === 'win', clever, pro))
```
(Set `outcome` from the chosen tap's `result` before reading `timelyReduce`; on the win path that
is `'win'` set in the `reduzieren` handler. The `reduzieren` win does NOT clear `baited` — a bait
tapped earlier still costs the half.)

---

## 11. Sim assertions — `frontend/sim/organ.sim.ts`

`npx tsx sim/organ.sim.ts` must pass. Import from `stories/organ` + `flow`
(`outcomeForLevel`, `stars`, `DEFAULT_CFG`, `LEVELS`). Mirror the Frühstück sim shape (`ok(name,
cond)`, exit 1 on any fail). Assert:

**Data model legal vs LEVELS:**
- `ORGAN_DOSE` lands in the green band: `>= band_low && <= band_high` (62 ∈ [55,70]).
- Demo caps stay below the red high tape (no trip): `ORGAN_DRIFT < critical_high`,
  `ORGAN_CONFIRM < critical_high`, `ORGAN_TRAP_WARN < critical_high`,
  `ORGAN_LIVE_START < critical_high`.
- The cold-start drift + live start are clearly OVER the window (read-the-body honesty):
  `ORGAN_DRIFT > band_high`, `ORGAN_LIVE_START > band_high`.
- The confirmation rises ABOVE the drift (stau staut höher): `ORGAN_CONFIRM > ORGAN_DRIFT`.
- Over-loss crosses the red high tape: `ORGAN_OVER >= critical_high` (86 ≥ 80).
- Under-loss is under the band **with pump margin**, on/over baseline, and above crit-low (no
  sub-baseline crash, no trip): `ORGAN_UNDER < band_low && ORGAN_UNDER > ORGAN_BASE &&
  ORGAN_UNDER > critical_low`, **AND `band_low - ORGAN_UNDER >= 5`** (the revised under-margin —
  46 sits 9 below band_low; 48 would fail this guard).
- Baseline is the live engine baseline, not `start`: `ORGAN_BASE === 42`.

**Detective list:**
- Exactly one correct cause: `ORGAN_DETECT.filter(d => d.correct).length === 1`.
- The cause is the kidney: `ORGAN_DETECT.find(d => d.correct)!.id === 'kidney'`.
- Three baits: `ORGAN_DETECT.filter(d => !d.correct).length === 3`.

**Taps: decision → torso target → outcome consistency:**
- For each `OrganTap`: `outcomeForLevel(tap.target) === tap.result`
  (reduce→62→win, pause→46→under, full→86→over).
- Exactly one of each: one win, one under, one over among `ORGAN_TAPS`.
- The win tap target equals `ORGAN_DOSE` and is in band; the over tap target equals `ORGAN_OVER`
  (≥ crit-high); the under tap target equals `ORGAN_UNDER`.
- `pause` is `adultOnly === true`; `reduce`/`full` are not adult-only (so young still has a
  win + an over).
- The young option set (filter `!adultOnly`) still contains a win and an over (so kids can both
  win and lose): `ORGAN_TAPS.filter(t => !t.adultOnly)` has a `win` and an `over`.

**Plan cards:**
- Exactly one trap: `ORGAN_PLAN.filter(c => c.trap).length === 1`, two safe cards.

**Scoring traces (win/over/under) — the `pro` timely half MUST be missable on a win:**
- `organClever`: `organClever(0) === 1`, `organClever(1) === 0.5`, `organClever(2) === 0`.
- `organPro`: `organPro(true, true) === 1`, `organPro(true, false) === 0.5`,
  `organPro(false, true) === 0.5`, `organPro(false, false) === 0`.
- A `play(tapId, wrongGuesses, finaleClean, baited = false)` helper that mirrors the component:
  ```ts
  function play(tapId, wrongGuesses, finaleClean, baited = false) {
    const tap = ORGAN_TAPS.find(t => t.id === tapId)!
    const out = outcomeForLevel(tap.target)
    const timely = out === 'win' && !baited       // the !baited clause is the auto-3★ fix
    return { out, target: tap.target,
             stars: stars(out === 'win', organClever(wrongGuesses), organPro(timely, finaleClean)) }
  }
  ```
  - WIN flawless (kidney-first, no bait, clean plan): `play('reduce', 0, true, false)` → torso 62,
    outcome 'win', **3.0★**.
  - WIN one detective stumble: `play('reduce', 1, true, false)` → **2.5★**.
  - WIN clean detective + relapse trap: `play('reduce', 0, false, false)` → **2.5★**.
  - **WIN baited (tapped „mehr trinken" first, then caught):** `play('reduce', 0, true, true)` →
    **2.5★** (the timely half is forfeit — proves `pro` is missable ON A WIN).
  - **WIN baited + relapse trap, clean detective:** `play('reduce', 0, false, true)` → **2.0★**
    (both `pro` halves gone; the auto-3★ path no longer exists).
  - WIN scraped (2 wrong detective taps, baited, relapse trap): `play('reduce', 2, false, true)` →
    **1.0★**.
  - OVER: `play('full', 0, true, false)` → torso 86, outcome 'over', **0★**.
  - UNDER: `play('pause', 0, true, false)` → torso 46, outcome 'under', **0★**.
- Any loss zeroes: `stars(false, 1, 1) === 0`.

---

## 12. Open risks a builder should watch

1. **Live-cut timing on the real pump (the headline tuning knob).** Beat 5 starts the rise at
   `ORGAN_LIVE_START=76` toward the edge at rate ~3. On the calibrated real pump the travel
   76→80 must be **long enough that a relaxed walk-up can tap „reduzieren," but short enough that
   „zu spät = Überlauf" can really happen.** If 4 units at the calibrated ceiling is too quick,
   either lower the start (e.g. 74) or slow the rate; the rate arg only slows BELOW the pump
   ceiling. Decide whether an *untouched* rise should auto-loss or hold at `ORGAN_DRIFT` (this
   spec recommends HOLD just under the edge so a frozen visitor isn't punished, and the loss only
   comes from choosing „voller Hahn"). Browser-smoke + bench-test this before committing.
2. **Over-loss = JS-outcome, not engine auto-trip; settle-only by default.** `play2` has NO
   auto-trip (`onLevel` only checks zones in legacy `PLAY_PHASES`, and `extWait` has no zone
   check). So the over path drives visibly to 86 and resolves `outcome='over'` **on settle**
   (`drive(ORGAN_OVER, 4, onSettle)`). The recommended build adds **no** mid-travel `$effect`
   (§4 beat 5 spells this out) — be explicit so a builder doesn't half-port Frühstück's `lv >= 80`
   effect. If you DO want the live „crosses then catches up" beat, add the FULL mid-travel `$effect`
   (gated on `beat==='livemoving' && chosen?.result==='over' && !resolved`), never a dangling
   half-check. (A one-line zone check in `extWait` to make the trip fire at 80 is a real engine
   change, out of scope here; the story works without it.)
3. **The chained cold-start hub (1a→1b).** Two `driveTo` over the `then` callback; `extWait`
   settles the first at `|level−62|<0.6` before the second starts. Keep the WatchBody/tone flip
   tied to a `creep` flag set at the seam, and DO NOT reset between them. A tiny pause at 62 is
   wanted, not a bug.
4. **`pro` timely half must stay missable on a win (the auto-3★ fix).** `timelyReduce =
   (outcome === 'win') && !baited` — the `!baited` clause is load-bearing. Do NOT simplify it to
   „won via reduce" (which is true on every win, since not-reducing is a loss): that re-introduces
   the guaranteed free half the blueprint §5/§7 forbids. The bait tap (mehr trinken) is the
   honest on-win mistake that costs it. The sim (§11) asserts `play('reduce', 0, true, true) ===
   2.5★` precisely to guard this.
5. **Under-loss margin (revised to 46, bench-verify).** `ORGAN_UNDER` is **46** (9 below band_low
   55, 4 above baseline 42, 11 above critLow 35) — NOT 48 (which was only 7 below band_low and too
   thin on the squeezed under side). Keep the sim's `band_low − ORGAN_UNDER >= 5` guard. On the
   real torso, confirm 46 reads visibly *below* the green tape and does not bottom out at baseline;
   if the calibrated pump can't separate 46 from baseline cleanly, tune the rate/start but keep the
   ≥5 margin from band_low.
6. **Stage 5b preview dropped (deviation from the brief).** This spec collapses the brief's
   non-committing preview UI into „`pro` = clean *unbaited* live-cut + clean finale" (§4 beat 5
   note, §10) to avoid inventing a preview primitive and to keep the two-bonus `stars()` shape.
   If a reviewer insists on the preview, it must be **text-only**, must NOT move the real pump, and
   must NOT be a mirrored gauge/meter — and the bait (mehr trinken) must not count as a previewed
   extreme (it is already charged as the missable timely half).
7. **No on-screen gauge (retire the old eGFR needle).** Do not re-add a level bar/gauge/number;
   the read-the-body decision depends on the player reading the live water, and the blueprint
   lint rule forbids mirrored vessels. eGFR appears only as adult *copy* („eGFR ~35"), never a
   widget.
8. **Medical firewall (copy).** The under-loss must read as „Überkorrektur für DIESE Patientin
   (eGFR 35) → Zucker entgleist," never „Stoppen ist falsch / du warst zu vorsichtig." The
   „< 30 = absetzen" fact is explicitly a different threshold for a different patient. Proof-read
   the German (umlauts/plurals) and keep all danger as „über/unter den grünen Bereich" — never
   „rote Linie."
9. **Locale wiring (two edits in `locale.svelte.ts`).** (a) Add `organ.locale.ts`, spread it into
   the `de` dict, and remove the stale inline `organ.*` block so keys don't collide / drift.
   (b) **Rewrite the `story.organ.title` / `.desc` keys** (de lines 60–61) from the retired „Die
   Nieren-Skala" to „Der müde Filter" + the new desc (§init), and update the EN/FR/NL/AR
   `story.organ.*` variants in the same pass — otherwise the kicker chip and StorySelect card
   re-introduce the gauge framing this spec retires.
