# Build spec — „Drei Körper, eine Pille" (id: `gene`) · Drug–gene (pharmacogenetics)

> **⚠️ SUPERSEDED — v2.1 overhaul (2026-06-12).** The shipped `gene` story no longer uses the
> **predict-then-pour** wager described below. After playtest feedback it was rebuilt as
> **OBSERVE → PUZZLE → REVEAL**: give the identical pill to three **distinct** kids
> side-by-side (👧🏻 Mara / 👦🏽 Jonas / 🧒🏿 Emil), **freeze a marker per kid**, answer
> „Huch? Was ist denn hier los?", then **assign the genotype machines** (🐢/🚶/🚀) — the
> *inversion* puzzle (high Spiegel = fast machine, because Codein is a prodrug the machine
> *makes* the painkiller) — rewarded with the **animated** PK curves, then the unchanged
> treat-Mara / treat-Emil / medicine-cabinet arc. Other changes: **no auto-pump on mount**
> (first move is the player's „Los geht's"); **moderate demo levels** (Emil tops out at **76**,
> not the old 90); kid copy now **explains „Codein"**. Sources of truth: `stories/gene.ts`,
> `stories/gene.locale.ts`, `screens/GenePlay.svelte`, `sim/gene.sim.ts`. The level arc (§3),
> data-model shape (§8), copy conventions (§9) and the dead-still trap below still hold; the
> beat flow (§4) and the wager mechanic (§1/§5/§6) are historical.

Implementation-ready spec for the torso-first rebuild of the `gene` story. Authoritative
inputs: [`blueprint.md`](../blueprint.md) (wins on any conflict), the Frühstück exemplar
(`screens/FruehstueckPlay.svelte`, `stories/fruehstueck.ts`, `sim/fruehstueck.sim.ts`),
`PlayShell.svelte` / `WatchBody.svelte` / `EndScreen.svelte` / `flow.ts` / `game.svelte.ts`,
and the brief [`gene.md`](gene.md). The old copy mined from `locale.svelte.ts` (`gene.*`) is
reused for pharmacology and ranks but rewritten to the new mechanic + conventions.

Builder targets (per blueprint §8):
- `frontend/src/lib/stories/gene.ts` — pure data + scoring (no runes).
- `frontend/src/lib/stories/gene.locale.ts` — `export const geneLocale: Record<string,string>` (see §9; wire it into `locale.svelte.ts` `de`).
- `frontend/src/lib/screens/GenePlay.svelte` — the v2 component (replaces the current GenePlay; routing already wired in `App.svelte` for `id==='gene'`).
- `frontend/sim/gene.sim.ts` — headless play-via-code test; `npx tsx sim/gene.sim.ts` must pass.

> NOTE on the story-card title. `stories.ts`/`locale` currently call this story
> „Drei Zwillinge, eine Pille". The brief/copy-tone bans „Zwillinge" (twins confuse the
> gene-difference point). **Rename the card to „Drei Körper, eine Pille"** — update
> `story.gene.title` (young) + `.adult` and `story.gene.desc` in `locale.svelte.ts` (keys
> live in the shared dict, not the per-story file). `stories.ts` color is `#b794ff` (lilac)
> — keep it; it becomes `--story`.

---

## 1. One-liner + the unique mechanic verb

**One-liner.** Drei Geschwister mit Zahnweh nach einem kleinen Eingriff bekommen die
**identische Codein-Tablette** — aber jeder hat ein anderes CYP2D6-Gen. Der Spieler **wettet
zuerst** („zu wenig / genau richtig / zu viel"), **gießt dann dieselbe Pille** in *denselben*
gläsernen Körper und liest die Antwort live am Spiegel ab: einmal bleibt er fast stehen,
einmal kriecht er genau ins grüne Fenster, einmal rast er live weit darüber hinaus. Gleiche
Pille — drei Körper, drei Antworten, weil das **Gen, nicht die Dosis** entscheidet.

**Mechanic verb: PREDICT-THEN-POUR — bet first, then pour the IDENTICAL pill into one tank, ×3, with a body-swap reset between.**

Why it is distinct from the other five (cross-checked against `overhaul/README.md` matrix):
- The **input is deliberately constant** (same pill, same dose, every time). The hidden
  **variable is the body (the gene)**. Every other story varies the *input* (different
  dose/pill/timing/order) and reads the consequence.
- It is the only **repeat-the-same-gesture-for-different-answers** verb, and the **wager IS
  the mechanic** — the player commits a prediction *before* each pour, so the tank's
  stillness/creep/surge either **confirms or breaks the bet**.
- vs `ddi` (also uses a non-moving tank as „not it"): in ddi the stillness is a *discovered
  verdict* with no prediction; here every stillness is **preceded by a placed bet card**
  (different emotional beat — payoff-of-a-wager, not suspense-of-discovery). Keep gene's
  stillness always behind a bet; never let ddi grow a prediction.
- The **body-swap reset ritual** („Körper tauschen", a card swap synced to a fast drain to
  baseline) is unique to gene: one physical tank plays three different people in turn.

> *Note on the README matrix vs this spec (intentional supersession).* The one-line matrix
> summary (`README.md` line 36) puts gene's signature **stillness in the pour phase** and reads
> it as „this body has no machine for it". This spec **deliberately defers the dead-still
> beat to Treat A (Beat 4)** and lets pour A do only a *small* creep (40→46), so the climactic
> stillstand is **not spoiled** during the bets — exactly as the brief (`gene.md`,
> „Stillness moment") requires. Where the matrix one-liner and this spec disagree, **this
> spec is the intended design**; do not „correct" the dead-still back into the pour phase.

---

## 2. Patient & learning

**The case.** Drei Geschwister (kein Zwillings-Setup — „drei Kinder" young / „drei
Patient:innen" adult) nach einem kleinen Eingriff (Mandel-OP), alle mit Zahnweh, alle bekommen
**genau dieselbe Codein-Tablette** (gleiche Wirkstoffmenge). Was sich unterscheidet, ist
**verborgen**: jedes Kind hat einen anderen **CYP2D6-Genotyp**.
- **Körper A** — langsam (Poor Metabolizer, PM): die Umbau-Maschine fehlt fast.
- **Körper B** — normal (Normal Metabolizer, NM): die Maschine arbeitet richtig.
- **Körper C** — ultraschnell (Ultra-rapid Metabolizer, UM): die Maschine läuft im Turbo.

**The real drug + interaction.** Codein ist ein **Prodrug**: es ist selbst kaum
schmerzwirksam. **CYP2D6** (das Enzym **in Darm und Leber**) baut Codein per
O-Demethylierung in das wirksame **Morphin** um. Der **Spiegel** (was wir am Tank ablesen) =
**aktives Morphin im Blut**, NICHT die Codein-Menge. Darum ist die Eingabe konstant und das
Ergebnis trotzdem dreifach verschieden.

**The exact PK lesson the player leaves with.**

| Register | Lesson |
|---|---|
| Kid | „Codein ist noch kein starker Schmerz-Helfer — der Körper muss es erst mit einer **Umbau-Maschine** (CYP2D6) in **Morphin** umbauen. Bei einem Kind arbeitet die Maschine kaum → die Pille wirkt fast nicht, der Spiegel bleibt fast stehen. **Mehr Codein hilft dann NICHT** — die Maschine fehlt. Bei einem anderen läuft die Maschine im Turbo → es entsteht **zu viel** Morphin, der Spiegel rast über den grünen Bereich. ‚Schnell' heißt hier nicht ‚schnell weg', sondern ‚**schnell zu viel**'! Passt die Maschine nicht, dreht man nicht an der Codein-Menge — man nimmt ein **anderes Schmerzmittel, das die Umbau-Maschine gar nicht braucht**." |
| Adult | „Codein ist ein **Prodrug**; **CYP2D6** aktiviert es per **O-Demethylierung** zu **Morphin**. **Poor Metabolizer** bilden kaum Morphin → **subtherapeutische Analgesie**; **Dosiserhöhung bringt mangels Enzym nichts** (der Spiegel bewegt sich nicht). **Ultra-rapid Metabolizer** bilden exzessiv Morphin → Toxizität / **Atemdepressionsrisiko** (**FDA-Boxed-Warning**; Codein bei Kindern post-Tonsillektomie kontraindiziert). Bei PM/UM ist nicht die Codein-Dosistitration die Lösung, sondern ein **nicht-CYP2D6-aktiviertes Analgetikum** (z. B. Ibuprofen / Paracetamol). **Tramadol ist KEINE saubere Ausweichlösung — ebenfalls CYP2D6-abhängig aktiviert** (der Profi-Trap)." |

The *gene*, not the dose, decides the effect — that single sentence is the spine. The fun
(the wager) serves it; never let a creative beat blur it.

---

## 3. The level arc

Single source of truth = `flow.ts` `LEVELS` (start 20 · bandLow 55 · bandHigh 70 · dose 62 ·
critLow 35 · critHigh 80; all internal-only except the **green window 55–70**, which is the
*only* tape on the torso). `gene.ts` imports `LEVELS`; never hardcode the band. Reset/swap
moves run at **rate 8** (fast — must not bore the queue); meaning-bearing rises/falls run at
**rate 4** (slow = suspense). Demo „over" values sit **clearly above 70 with pump margin**.

Auto-trip does NOT fire on the `play2` path (engine `onLevel` is gated to legacy
`PLAY_PHASES`), so over-the-window moves are honest: the water may sit **above 80** and the
loss is declared by the option's `result` field + a manual `$effect` watcher (see §5/§8). No
„79 vs 80 dodge" logic.

> **Player-facing copy rule for this table.** The terms „red tape" / „red line" below are an
> **internal builder description of the physical danger zone**, never a UI string. In copy,
> danger is always „(weit) über den grünen Bereich / über das grüne Fenster hinaus"; the level
> is always „der Spiegel", never „das Wasser". See §9 + the §12 NON-NEGOTIABLE.

| # | Beat | From → To | Rate | Cause | What the player reads |
|---|---|---|---|---|---|
| 0 | onMount | (cur) → **40** | 8 | Guaranteed baseline before bets | Tank rests low, below the green window, **still** — gives nothing away |
| 1 | Pour A (PM) | 40 → **46** | 4 | Same pill, body A barely converts | Tiny creep, halts **just under the green window** = „zu wenig" |
| 1b | Swap to B | 46 → **40** | 8 | „Körper tauschen" (card swap) | Fast drain = new body, NOT „A worsens" |
| 1b | Pour B (NM) | 40 → **62** | 4 | Same pill, normal conversion | Slow climb, rests **in the middle of the green window** = „genau richtig" |
| 1c | Swap to C | 62 → **40** | 8 | „Körper tauschen" | Fast drain = new body |
| 1c | Pour C (UM) | 40 → **90** | 4 | **TWIST**: turbo conversion, same pill | Water **races up, far over the green window** = „zu viel, live" |
| 1c→2 | Settle for scan | 90 → **40** | 8 | Prepare for the scanner reveal | Fast drain back to rest |
| 2 | Scanner | hold **40** | — | Reveal the three hidden genotypes | The one pure still beat — eyes read faces/badges |
| 3 | Mechanism (C only) | hold **40** | — | Codein→Morphin shown as on-screen overlay | No redundant re-run; causality is an overlay |
| 4 | Treat A start | (cur) → **46** | 8 | Active body A, still „zu tief" | Water sits **just under the window** (matches prompt) |
| 4 | Treat A — switch (WIN move) | 46 → **62** | 4 | Non-CYP2D6 analgesic | **Redemptive rise into green** = win move (watchable, not a flash) |
| 4 | Treat A — „mehr Codein" (TRAP) | 46 → **46** | 4 | No enzyme → no extra morphine | **Delta 0 → driveTo early-branch → pump dead still**; declared `under` (rests ≈46, clearly below the window) |
| 4 | Treat A — warten / dieselbe Tablette | hold **46** | — | Pain persists | Stays under the window → `under` loss |
| 4 | Treat A — Tramadol (adult, RETRY) | hold **46** | — | Also CYP2D6-dependent | No movement; explain + retry (no loss) |
| 5 | Treat C start | (cur) → **40** | 8 | Fresh untreated body C on baseline | Rests at 40 |
| 5 | Treat C — same pill drives live | 40 → **78** | 4 | Same pill, UM | Water **rises live up and over the window** mid-decision |
| 5 | Treat C — switch (WIN move) | 78 → **62** | 4 | Off CYP2D6 → calm settle | **Soothing fall into green** = win |
| 5 | Treat C — „mehr Codein" (TRAP) | 78 → **92** | 4 | Excess morphine | Water **shoots far over the window** → `over` loss |
| 5 | Treat C — bei Codein bleiben | 78 → **82** | 4 | Stays toxic | Above the window → `over` loss |
| 5 | Treat C — Tramadol (adult, RETRY) | hold **78** | — | CYP2D6-dependent | No improvement; explain + retry (no loss) |
| 6 | Finale — wrong card on C (warning) | 62 → **74** | 6 | Codein/Tramadol card tapped on C | Visible nudge **out the top of the window**, then correction |
| 6 | Finale — correction | 74 → **62** | 4 | „ungeeignet" → swap to clean card | Back into green |
| 6 | Finale — clean card | rest **62** | — | Non-CYP2D6 analgesic | **Settles in green + glows** = win proof at the water |
| 7 | Outcome | holds end state | — | EndScreen | Win = 62 in green; under ≈ 46 below; over above the window |

Numbers exported as constants in `gene.ts` (§8). Every level except the green window is
invisible on the torso — copy is qualitative („knapp unter dem grünen Bereich", „weit über den
grünen Bereich hinaus") and never names a number, and never „rote Linie/Marke" (blueprint rule).

---

## 4. Beat-by-beat flow (9 beats)

State machine (extends the DdiPlay structure), `Beat`:
`'briefing' | 'pour' | 'scanner' | 'mechanism' | 'treatA' | 'treatC' | 'finale' | 'won' | 'outcome'`.
The three predict-then-pour reps live inside one `'pour'` beat driven by an index `pourIdx`
(0=A, 1=B, 2=C) with a sub-phase (`bet` → `pouring` → `read`). Pump wrapper: a local
`drive(target, rate, then)` sets `pumping=true`, calls `driveTo`, clears `pumping` on settle;
**all action buttons `disabled={pumping}`**. `WatchBody` mounts on every pump/stillness beat.
`PlayShell` props: `color={game.story?.color ?? 'var(--gene,#b794ff)'}`,
`kicker={t('story.gene.title')}`, `caseLine={t('gene.case')}`, `step={stepNum}`, `total={7}`,
`onCancel={backToStories}`.

**Beat 0 — `briefing` (step 1).** *Screen:* `.pl-emoji` 🦷 + three child avatars (😀😀😀,
genotype hidden), `.pl-h1` = `gene.brief.patient`, `.pl-lead` = `gene.brief.goal`, a
`WatchBody tone="watch"` „Schau auf den Körper" cue, a `.pl-action` reading `gene.brief.go`
(„Los geht's"). *Player:* taps it. *Pump:* `onMount` → `drive(GENE_BASELINE /*40*/, 8)` so the
tank is **guaranteed at 40** before the first bet (fixes the old `onMount→62`). *Star:* none.

**Beat 1 — `pour` ×3 (steps 2–4): the signature predict-then-pour.** For each of A, B, C:
1. **Bet sub-phase.** Active patient card on screen (A first). Prompt
   `gene.pour.bet` („Was glaubst du — zu wenig, genau richtig oder zu viel?"). Three big
   `.pl-opt`/tile buttons from `GENE_BINS` (`low`/`mid`/`high`). The genotype is **hidden**
   (badge shows „?"). Tapping a bet records it (`bets[id]`) and advances to pour.
2. **Pour sub-phase.** A „💊 Pille fallen lassen"/tap-pill action (`gene.pour.drop`). On tap →
   `WatchBody` (`gene.pour.watch` = „Schau genau, was der Spiegel macht!", tone `watch`) and
   `drive(patient.pour, 4)` (A 40→46, B 40→62, C 40→90 — see §3). Buttons disabled while
   `pumping`. **During C's long pour (40→90) rotate one „Wusstest du?" fact card** (`gene.pour.dykC`)
   so the longest slow-fill carries a fact (blueprint §2/§6); hold it a readable minimum.
3. **Read sub-phase.** On settle, show the verdict against the water:
   - A: `gene.pour.readA` („Kaum etwas passiert — der Spiegel steht knapp **unter** dem grünen
     Bereich."), tone `still`/`falling`.
   - B: `gene.pour.readB` („Der Spiegel ruht **mitten im grünen Bereich** — genau richtig."),
     tone `good`.
   - C: `gene.pour.readC` („Schau! Der Spiegel **rast hoch — weit über den grünen Bereich
     hinaus**! Bei DERSELBEN Pille!"), tone `rising`. (This is the §5 twist, live.)
   Compare `bets[id]` to `patient.truth` → mark hit/miss for scoring; a small inline
   right/wrong chip is allowed but the **message is the water**, not a green/red box.
   A „Weiter" → if more patients: **swap ritual** = show `gene.pour.swap` („Körper tauschen")
   one-word cue synced to `drive(prevPour → 40, 8)` (fast drain reads as new body), then next
   bet. After C: `drive(90 → 40, 8)` then `beat='scanner'`.
   *Pump:* per table §3. *Star:* **clever** — all three first-try bets correct = 1.0; exactly
   one wrong = 0.5; two+ = 0 (see §10).

**Beat 2 — `scanner` (step 5): name the puzzle.** *Screen:* the three patient cards now
revealed; player taps the lab loupe 🔬 onto each (tap-loupe-then-tap-patient for kiosk, or one
„alle scannen" button) → the hidden badges appear: young 🐢 „sehr langsam" / ✅ „normal" /
🚀 „sehr schnell"; adult „PM (CYP2D6)" / „NM" / „UM". Each badge is tied to the water path the
player just saw (`gene.scan.A/B/C`). The light PK-curve SVG (§7) renders here. *Pump:* **hold at
40** — the single pure reveal stop of the story. *Player:* scan all three, „Weiter". *Star:* none.

**Beat 3 — `mechanism` (step 6): Codein→Morphin, only the turbo explained.** *Screen:* a light
workshop overlay **only for C**: a Codein pill drops into the „Turbo-Umbau-Maschine", Morphin
floods → `gene.mech.C` („Darum rast sein Spiegel: die Turbo-Maschine macht aus der gleichen
Pille viel zu viel Morphin."). A + B are **still-image overlay cards** (kaputte Maschine /
normale Maschine, `gene.mech.A` / `gene.mech.B`) WITHOUT re-driving the tank. Adult adds the
real terms (`*.adult`). *Pump:* **hold at 40** — no redundant re-run. *Player:* „Weiter".
*Star:* none. *(This is the mechanism beat — the why shown on the body's memory, not a wall of
text.)*

**Beat 4 — `treatA` (step 6, read-the-body + stillness trap).** *Screen:* active patient A.
Prompt patient-framed: `gene.treatA.prompt` („Schau auf den Körper — er steht **zu tief, knapp
unter dem grünen Bereich**. Was sollte **Mara** jetzt bekommen?"). Options from
`GENE_TREAT_A` (filtered by `adultOnly`):
- „anderes Schmerzmittel ohne Umbau-Maschine" → **WIN** (`result:'win'`, target 62).
- „mehr Codein geben" → **stillness TRAP** (`result:'under'`, target 46 = current level → dead still).
- „einfach warten" → `result:'under'`, no move (hold 46).
- „nochmal dieselbe Tablette" → `result:'under'`, no move (hold 46).
- „Tramadol geben" (adult) → `result:'retry'`, no move; explain + retry, no loss.
*Pump:* start/hold at **46** (`GENE_A_LOW`, visibly „zu wenig"). WIN → `drive(46→62, 4)`
redemptive rise = win proof. „mehr Codein" → `drive(46→46, 4)` takes the **early-branch
(delta 0 < 1) → pump dead still**; on-screen author the „keine Reaktion"-Ruck (pill bounces
off), then resolve `outcome='under'` (the level rests ≈46, clearly under the window).
warten/dieselbe → hold 46 → `under`. Tramadol → no move + `gene.treatA.fb.tramadol`, stay in
beat. *Player:* picks; the stillness on „mehr Codein" IS the proof „die Maschine fehlt — mehr
Substrat ändert nichts." *Star:* **pro** (part 1) — first-try clean (no stillstand/warte/
dieselbe) contributes (§10).

**Beat 5 — `treatC` (step 7, read-the-body + twist payday, live).** *Screen:* active patient C,
tank reset to **40** (fresh untreated body). Prompt: „Er hat **dieselbe Tablette** bekommen —
schau, was passiert." A „Pille geben" action drives the water **live**: `drive(40→78, 4)`
(`GENE_C_HIGH`, the player SEES the twist form — not a preloaded 85 tank). Mid/after-rise:
`gene.treatC.prompt` („Der Spiegel rast über den grünen Bereich — was ist jetzt **sicher**?").
Options `GENE_TREAT_C`:
- „weg von Codein, anderes Mittel" → **WIN** (`result:'win'`, target 62) → `drive(78→62, 4)`
  soothing fall into green.
- „mehr Codein" → `result:'over'`, target 92 → water shoots far over the window → `over` loss.
- „bei Codein bleiben" → `result:'over'`, target 82 → stays toxic → `over` loss.
- „Tramadol" (adult) → `result:'retry'`, no improvement (hold 78); explain + retry, no loss.
*Pump:* per above. *Player:* must read the **rising/over-the-window** water as „zu viel" and
switch (opposite of A's „zu tief"). *Star:* **pro** (part 2) — first-try clean (no „mehr
Codein"/bleiben) contributes (§10). Win → `beat='finale'`.

> *Decision-timing (resolves brief open question):* present the „Was ist sicher?" options
> **after** the water is visibly over the green window (clearer to read, robust to real-pump
> latency), not mid-rise. The live rise is the drama; the read happens once it's clearly out.

**Beat 6 — `finale` (step 7): the medicine cabinet — wrong cards move the water.** *Screen:* a
cabinet of analgesic cards (`GENE_CABINET`): Ibuprofen / Paracetamol (`safe:true`,
non-CYP2D6), Codein cards (`safe:false`), and **Tramadol (`safe:false`, `adultOnly`
profi-trap)**. The player applies a card to the active bodies that still need treatment (A and
C; B is „Codein war hier okay"). Tap-card-then-tap-patient (kiosk touch). *Pump (read-the-body
to the end):* tapping a **Codein/Tramadol** card on C drives the active tank **visibly out the
top of the window** `drive(62→74, 6)` as a warning, then the „ungeeignet"-correction pulls it
back `drive(74→62, 4)` (a flagged stumble for scoring, no loss). A **clean non-CYP2D6 card**
settles the tank calmly in green at **62** and glows green = **win proof at the water**. When
both A and C carry a clean card → „Weiter" to `won`/`outcome`. *Star:* **pro** (part 3) —
finale without a Codein/Tramadol misfire contributes (§10).

> *Finale warning hub (resolves brief open question):* on the slow real pump use a **short**
> nudge `62→74` at rate 6; if bench-testing shows it drags, shrink to `62→70`. Keep it a
> visible move, not a flash.

**Beat 7 — `won` (optional micro-beat).** A proper landing (not a flash): `gene.won.title`
(„Alle drei sicher!") + `gene.won.peek` naming the takeaway, „Weiter" → `outcome`. (May be
folded into the finale's „Weiter"; keep at least one non-flash beat before EndScreen.)

**Beat 8 — `outcome`: EndScreen debrief.** Rendered as a **direct child of the
`position:relative; height:100%` root**, NOT inside `.beat` (blueprint §4):
```
<div class="root">
  {#if beat === 'outcome'}<EndScreen … />{:else}<PlayShell …>{#key beat}<div class="beat">…</div>{/key}</PlayShell>{/if}
</div>
```
EndScreen props: `outcome`, `titleKey={`gene.out.${outcome}.title`}`,
`subKey={`gene.out.${outcome}.sub`}`, `storyTitleKey="story.gene.title"`, `score={starCount}`,
`factKeys` = win → `['gene.out.dyk1','gene.out.dyk2']`; over → `['gene.out.dyk.over','gene.out.dyk1']`;
under → `['gene.out.dyk.under','gene.out.dyk1']`. Holds the end state on the tank (win 62
glowing; under ≈ 46 below the window; over far above the window).

`stepNum` mapping (`total=7`): briefing→1; pour A→2, pour B→3, pour C→4; scanner→5;
mechanism→6, treatA→6; treatC→7, finale→7, won→7.

---

## 5. The one tank-surprise twist (forced demo beat)

**„Schnell heißt NICHT schnell weg."** At the **ultra-rapid** child C — the one a naive visitor
most expects to under-respond („verbraucht es halt schnell, also zu wenig") — the **identical
pill** drives the spiegel **the highest and live, far over the green window**. Fast =
**fast UMGEBAUT to strong morphine**, i.e. **too much**. It is doubly counterintuitive because
the very same „mehr Codein" reflex moves A's spiegel **not one millimeter** (no machine) but
drives C's spiegel **far over the window** (machine in turbo).

It is **unavoidable and player-triggered**: in Beat 1c the player pours the same pill and the
tank surges `40→90` live; it is reinforced in Beat 5 where the same pill drives `40→78` live
before the decision. **Not** a preloaded high tank, **not** a cap trick (auto-trip does not
fire in play2, so the water is allowed to sit honestly over 80). Only the real spiegel rising in
front of the player — same input, three different curves — can deliver this; a text box cannot.

---

## 6. Challenge design

The puzzle is real; a thoughtless walk-up can lose. Non-obvious decisions + **plausible** wrong
answers (real patient/clinician mistakes):

- **The wager (Beat 1).** Most people bet „zu wenig" or „genau richtig" for the ultra-rapid
  child — nobody expects „zu viel" from the „fast" body. The twist makes the obvious bet wrong.
  B (the obvious middle) is a fair gimme — and `gene.pour.readB` says **„klar/mitten im
  grünen Bereich"** so even a lucky blind „genau richtig" still gets taught the read. A and C
  are genuine reads against the water.
- **Treat A — read „zu tief".** Plausible wrong answers, each a real reflex:
  - **„mehr Codein"** — the intuitive „too little → give more" move. WRONG: no enzyme, so the
    water doesn't move (stillstand) → still under. This is the trap.
  - **„nochmal dieselbe Tablette" / „einfach warten"** — passive, plausible („give it time").
    WRONG: pain persists, stays under.
  - **„Tramadol"** (adult) — looks like a clean opioid swap. TRAP: Tramadol is **also**
    CYP2D6-activated → same genetic problem. Marked retry, explained, no loss.
  - Right: a non-CYP2D6 analgesic (Ibuprofen/Paracetamol).
- **Treat C — read „zu viel".** Same on-screen gesture („behandle jetzt") but the **opposite
  tank state** (racing over the window vs A's deep-under) demands the **opposite** answer:
  - **„mehr Codein"** — the trap that did *nothing* at A here drives the water **far over the
    window** → overdose loss (doubly counterintuitive). The most dangerous plausible mistake.
  - **„bei Codein bleiben"** — „it's an opioid, leave it" → stays toxic → over.
  - **„Tramadol"** (adult) — same CYP2D6 trap as A → retry.
  - Right: switch off Codein to a non-CYP2D6 analgesic.
- **Finale cabinet.** Codein cards are wrong; **Tramadol is the adult profi-trap** (looks like
  the safe non-codeine choice). A wrong card on C **moves the water out of the green window**
  before the correction — the body itself flags the mistake.

No pre-labelled genotypes during the bets (revealed only after, at the scanner) — the player
must read the body, not recall a shown number. No silly throwaway options.

---

## 7. Custom visual — the three PK concentration–time curves (light SVG)

The user explicitly wants drawn PK curves where they fit. Render them **on the scanner beat
(Beat 2)** as a single light inline SVG, captioned „Gleiche Pille — drei Kurven": three
morphine concentration–time curves from the **same dose**, one per body, drawn next to the
revealed badges. This is the vivid „same input, different curve" teaching image, and it sits at
the one moment the tank is deliberately still, so it doesn't compete with the water.

**How it renders (Pi-light — no blur, no filters, static paths):**
- One `<svg viewBox="0 0 360 180">` (fixed px, the `.pi` frame is transform-scaled). A faint
  horizontal **green band** rectangle marks the therapeutic window (map `LEVELS.bandLow..High`
  to y); a thin dashed line marks „zu hoch" at the top of the window (qualitative — labelled
  „grüner Bereich", never a number, never a red line).
- Three pre-computed cubic `<path d="…">` strings (hardcoded constants in `gene.ts`,
  `GENE_PK_CURVES`), each a smooth rise-then-fall:
  - **A (PM)** — a low flat hump that never reaches the band (stroke `--grape`/under tone).
  - **B (NM)** — a hump that peaks **inside** the green band (stroke `--green`).
  - **C (UM)** — a tall spike that **overshoots above** the band (stroke `--toxic`).
- Each curve is one `<path>` with `stroke-width:3; fill:none`; optional `stroke-dasharray`
  draw-on animation via `@keyframes` on `stroke-dashoffset` (CSS only, reduced-motion-safe) —
  staggered so A→B→C draw in sequence. No SVG filters/blur (Pi budget).
- A tiny legend (🐢/✅/🚀 + label) ties each curve colour to the badge and to „den Spiegel, den
  du eben gesehen hast".

The data is pure (path strings in `gene.ts`); the SVG markup lives in the component. Keep it
under ~10 nodes. This is the only on-screen *graphic* and it is a **time-axis chart, explicitly
not a mirrored vessel/level bar** (blueprint NO-ON-SCREEN-VESSEL rule) — it shows
concentration-over-**time**, the band is a reference, and there is no fill-height tank. (The
old GenePlay `.minibar`/`.bar`/`.fill` columns are deleted outright.)

---

## 8. Data model — `frontend/src/lib/stories/gene.ts`

Headless-pure (no Svelte runes). Imports `LEVELS`, `type Outcome` from `../flow`.

```ts
// Story „Drei Körper, eine Pille" (DGI · Codein/CYP2D6) — pure data + scoring.
// Torso-first v2 (docs/stories/overhaul/build-gene.md). Signature mechanic:
// PREDICT-THEN-POUR — bet first ('zu wenig/genau richtig/zu viel'), then pour the
// IDENTICAL Codein pill into ONE tank, ×3, with a body-swap reset between. The input
// is constant; the hidden variable is the body (the CYP2D6 gene). No on-screen vessel.
import { LEVELS, type Outcome } from '../flow'

// --- torso levels (all from LEVELS; only the green window 55–70 is taped) --------
export const GENE_BASELINE = 40 // body-swap rest level (between bodies)
// (40 is a deliberate mid-low rest BELOW the window — not LEVELS.start 20 — so the
//  three pours start from a common, visible baseline and the swap drains read clearly.)
export const GENE_A_LOW = 46    // PM pour / treatA start: just UNDER the green window ('zu wenig')
export const GENE_B_DOSE = LEVELS.dose // NM pour: rests in the middle of the green window (62)
export const GENE_C_HIGH = 78   // UM live rise in treatC: clearly OVER the window, pump margin (<80 here so the live rise is readable before the choice)
export const GENE_C_SURGE = 90  // UM pour in the predict-then-pour twist: honestly OVER critical_high
// 'mehr Codein' at PM == current resting level → driveTo's |target-cur|<1 early-branch
// fires (delta 0) → the pump is COMMANDED but DEAD STILL. Must equal GENE_A_LOW (46),
// NOT 47: |47-46|=1 is NOT < 1, which would (wrongly) take the moving path.
export const GENE_A_STILL = GENE_A_LOW // 46 — dead-still trap (delta 0 from the 46 rest)
export const GENE_FINALE_OK = LEVELS.dose // clean card settles in green (62)
export const GENE_FINALE_WARN = 74 // wrong card on C nudges out the top of the window (warning), then corrected

// --- the three bodies (genotype hidden until the scanner) ------------------------
export type GeneBin = 'low' | 'mid' | 'high' // the wager: zu wenig / genau richtig / zu viel
export interface GeneBody {
  id: 'A' | 'B' | 'C'
  nameKey: string        // child name (Mara / Jonas / Emil)
  badgeKey: string       // young 🐢/✅/🚀 + label · adult PM/NM/UM
  pour: number           // where the IDENTICAL pill drives the water in the predict-then-pour
  pourReadKey: string    // verdict copy against the water
  truth: GeneBin         // the correct wager
  pkPath: string         // PK curve path (see GENE_PK_CURVES)
}
export const GENE_BINS: GeneBin[] = ['low', 'mid', 'high']
export const GENE_BODIES: GeneBody[] = [
  { id: 'A', nameKey: 'gene.body.A', badgeKey: 'gene.badge.slow',   pour: GENE_A_LOW,   pourReadKey: 'gene.pour.readA', truth: 'low',  pkPath: 'M8,150 C70,150 110,120 170,118 C230,116 300,150 352,156' },
  { id: 'B', nameKey: 'gene.body.B', badgeKey: 'gene.badge.normal', pour: GENE_B_DOSE,  pourReadKey: 'gene.pour.readB', truth: 'mid',  pkPath: 'M8,150 C70,150 100,70 170,66 C240,62 300,140 352,150' },
  { id: 'C', nameKey: 'gene.body.C', badgeKey: 'gene.badge.ultra',  pour: GENE_C_SURGE, pourReadKey: 'gene.pour.readC', truth: 'high', pkPath: 'M8,150 C60,150 95,18 150,14 C210,12 270,120 352,140' },
]

// --- PK curves for the scanner visual (same dose → three curves). y: 0=top high,
//     180=bottom; the green band maps to ~y66..86. Pure path strings, drawn light. ---
export const GENE_PK_CURVES = GENE_BODIES.map((b) => ({ id: b.id, d: b.pkPath, badgeKey: b.badgeKey }))

// --- Treat A (Poor Metabolizer): read 'zu tief' → switch (not more codeine) ------
export interface GeneOption {
  id: string
  labelKey: string
  feedbackKey: string
  result: Outcome | 'retry'
  target?: number   // undefined = deliberate STILL (no pump move)
  adultOnly?: boolean
}
export const GENE_TREAT_A: GeneOption[] = [
  { id: 'switch',  labelKey: 'gene.treatA.opt.switch',  feedbackKey: 'gene.treatA.fb.switch',  result: 'win',   target: 62 },
  { id: 'more',    labelKey: 'gene.treatA.opt.more',    feedbackKey: 'gene.treatA.fb.more',    result: 'under', target: GENE_A_STILL /*46 = rest → dead still → under*/ },
  { id: 'wait',    labelKey: 'gene.treatA.opt.wait',    feedbackKey: 'gene.treatA.fb.wait',    result: 'under' /* no move, hold 46 */ },
  { id: 'samepill',labelKey: 'gene.treatA.opt.samepill',feedbackKey: 'gene.treatA.fb.samepill',result: 'under' /* no move, hold 46 */ },
  { id: 'tramadol',labelKey: 'gene.treatA.opt.tramadol',feedbackKey: 'gene.treatA.fb.tramadol',result: 'retry', adultOnly: true },
]

// --- Treat C (Ultra-rapid): read 'zu viel' (live) → switch off codeine ----------
export const GENE_TREAT_C: GeneOption[] = [
  { id: 'switch',  labelKey: 'gene.treatC.opt.switch',  feedbackKey: 'gene.treatC.fb.switch',  result: 'win',  target: 62 },
  { id: 'more',    labelKey: 'gene.treatC.opt.more',    feedbackKey: 'gene.treatC.fb.more',    result: 'over', target: 92 },
  { id: 'keep',    labelKey: 'gene.treatC.opt.keep',    feedbackKey: 'gene.treatC.fb.keep',    result: 'over', target: 82 },
  { id: 'tramadol',labelKey: 'gene.treatC.opt.tramadol',feedbackKey: 'gene.treatC.fb.tramadol',result: 'retry', adultOnly: true },
]

// --- Finale cabinet: pick the analgesic that does NOT need the CYP2D6 machine -----
export interface GeneCard {
  id: string
  labelKey: string
  safe: boolean       // non-CYP2D6 → belongs on A and C
  adultOnly?: boolean // Tramadol = the adult profi-trap (looks safe, isn't)
}
export const GENE_CABINET: GeneCard[] = [
  { id: 'ibuprofen',   labelKey: 'gene.card.ibuprofen',   safe: true },
  { id: 'paracetamol', labelKey: 'gene.card.paracetamol', safe: true },
  { id: 'codein',      labelKey: 'gene.card.codein',      safe: false },
  { id: 'codein2',     labelKey: 'gene.card.codein2',     safe: false },
  { id: 'tramadol',    labelKey: 'gene.card.tramadol',    safe: false, adultOnly: true },
]

// --- scoring helpers (pure) ------------------------------------------------------
/** clever half-star: all three first-try bets correct = 1, exactly one miss = 0.5, two+ = 0. */
export function genePredictGrade(betMisses: number): number {
  return betMisses === 0 ? 1 : betMisses === 1 ? 0.5 : 0
}
/** did a bet match the body's truth? */
export function geneBetCorrect(body: GeneBody, bet: GeneBin): boolean {
  return body.truth === bet
}
/** pro half-star: clean treatA + clean treatC + clean finale = 1; exactly one stumble = 0.5; two+ = 0.
 *  stumble = a retry-tap (tramadol) corrected, a warte/dieselbe/„mehr Codein"/„bleiben" pick that lost is
 *  not a stumble (it's a LOSS → 0 stars anyway), or a Codein/Tramadol warning-misfire in the finale. */
export function geneProGrade(stumbles: number): number {
  return stumbles === 0 ? 1 : stumbles === 1 ? 0.5 : 0
}
```

Notes for the builder:
- `GENE_BASELINE` is intentionally **40** (a visible mid-low rest below the window), *not*
  `LEVELS.start` (20). 40 gives the three pours a common readable baseline and makes the
  body-swap drains legible. (20 is the *between-runs* prepare level handled by `preHome`, not a
  story value.) The sim asserts 40 is `< bandLow` and `> critLow`.
- `more` at treatA uses target **46 = the resting level** (`GENE_A_STILL === GENE_A_LOW`), so
  `|46 − 46| = 0 < 1` and `driveTo`'s early-branch fires → the pump is **commanded but does not
  move at all** (the dead-still trap). **Do not use 47** — `|47 − 46| = 1` is NOT `< 1` and
  would take the moving (`extWait`) path, breaking the trap. The component authors the „keine
  Reaktion" beat on-screen; outcome is `under` (the level rests ≈46, below the window —
  `outcomeForLevel(46) === 'under'` since 46 < 55). The manual `$effect` is not needed here (it
  never crosses a red threshold); the outcome is set from the option's `result` on settle.
- Names: Mara (A), Jonas (B), Emil (C) — keep neutral, non-twin.

---

## 9. Full copy — `frontend/src/lib/stories/gene.locale.ts`

`export const geneLocale: Record<string,string> = { … }`, merged into `de` in
`locale.svelte.ts`. `t()` resolves `key.{age}` first, else the plain key — so the **plain key
is the young value** and `.adult` carries the adult register. Every key below lists both. Also
update the shared card keys `story.gene.title` / `.adult` / `story.gene.desc` in the main dict
(shown first). Proof-read German (umlauts, plurals).

> **Copy convention (NON-NEGOTIABLE, blueprint §6 + §12).** The level is **„der Spiegel"**,
> NEVER „das Wasser / Wasserstand". Danger is **„über den grünen Bereich / über das grüne
> Fenster hinaus"**, NEVER „rote Linie / rote Marke / rotes Klebeband / Grenze". The strings
> below already comply — keep it that way when editing.

```ts
export const geneLocale: Record<string, string> = {
  // ── case header ──
  'gene.case': 'Mara, Jonas & Emil, 8 · Codein nach Zahn-OP',
  'gene.case.adult': 'Mara, Jonas & Emil (8 J.) · post-OP-Analgesie mit Codein',

  // ── briefing ──
  'gene.brief.patient': 'Drei Geschwister haben nach einem kleinen Eingriff Zahnweh. Alle bekommen GENAU dieselbe Codein-Tablette.',
  'gene.brief.patient.adult': 'Drei Geschwister mit Zahnschmerzen nach kleinem Eingriff – alle erhalten die identische Codein-Dosis, aber jeder hat einen anderen CYP2D6-Genotyp.',
  'gene.brief.goal': 'Gleiche Pille, drei Körper. Wette zuerst, was der Spiegel macht – dann gib die Pille und schau auf den Körper!',
  'gene.brief.goal.adult': 'Codein ist ein Prodrug – der Körper muss es erst zu Morphin umbauen. Sag vor jeder Gabe voraus, wohin der Spiegel läuft, und lies die Antwort am Torso ab.',
  'gene.brief.go': "Los geht's",

  // ── predict-then-pour ──
  'gene.body.A': 'Mara',
  'gene.body.B': 'Jonas',
  'gene.body.C': 'Emil',
  'gene.pour.titleA': 'Pille 1 – Mara',
  'gene.pour.titleB': 'Pille 2 – Jonas',
  'gene.pour.titleC': 'Pille 3 – Emil',
  'gene.pour.bet': 'Was glaubst du – zu wenig, genau richtig oder zu viel? Wette zuerst!',
  'gene.pour.bet.adult': 'Vorhersage vor der Gabe: subtherapeutisch, im Fenster oder toxisch?',
  'gene.bin.low': 'zu wenig',
  'gene.bin.mid': 'genau richtig',
  'gene.bin.high': 'zu viel',
  'gene.pour.drop': 'Dieselbe Pille geben',
  'gene.pour.watch': 'Schau genau, was der Spiegel macht!',
  'gene.pour.watch.adult': 'Schau auf den Torso – wohin läuft der Spiegel?',
  'gene.pour.dykC': 'Wusstest du? „Schnell" heißt hier nicht „schnell weg" – ein Turbo-Körper baut die Pille schnell in VIEL Wirkstoff um.',
  'gene.pour.dykC.adult': 'Wusstest du? Bei Ultra-rapid Metabolizern aktiviert CYP2D6 Codein exzessiv zu Morphin – „schnell" bedeutet „schnell zu viel".',
  'gene.pour.readA': 'Kaum etwas passiert – der Spiegel steht knapp UNTER dem grünen Bereich. Mara baut die Pille fast nicht um.',
  'gene.pour.readA.adult': 'Minimaler Anstieg – der Spiegel bleibt unter dem therapeutischen Bereich. Mara ist Poor Metabolizer: kaum Morphin.',
  'gene.pour.readB': 'Der Spiegel kriecht hoch und ruht KLAR mitten im grünen Bereich – genau richtig.',
  'gene.pour.readB.adult': 'Der Spiegel steigt mitten in den therapeutischen Bereich – Jonas metabolisiert normal.',
  'gene.pour.readC': 'Schau! Der Spiegel rast hoch – weit über den grünen Bereich hinaus! Bei DERSELBEN Pille!',
  'gene.pour.readC.adult': 'Der Spiegel schießt weit über das therapeutische Fenster – Emil bildet exzessiv Morphin.',
  'gene.pour.hit': 'Wette getroffen!',
  'gene.pour.miss': 'Daneben – schau, was der Spiegel wirklich macht.',
  'gene.pour.swap': 'Körper tauschen',
  'gene.pour.swap.adult': 'Nächste:r Patient:in',
  'gene.pour.next': 'Weiter',

  // ── scanner reveal + PK curves ──
  'gene.scan.prompt': 'Jetzt der Gen-Scanner: tippe die Lupe auf jedes Kind und sieh nach, warum.',
  'gene.scan.prompt.adult': 'Genotypisierung: CYP2D6-Status jedes Patienten aufdecken.',
  'gene.scan.all': 'Alle scannen',
  'gene.badge.slow': '🐢 baut sehr langsam um',
  'gene.badge.slow.adult': 'PM · langsam (CYP2D6)',
  'gene.badge.normal': '✅ baut normal um',
  'gene.badge.normal.adult': 'NM · normal (CYP2D6)',
  'gene.badge.ultra': '🚀 baut sehr schnell um',
  'gene.badge.ultra.adult': 'UM · ultraschnell (CYP2D6)',
  'gene.scan.A': 'Mara: die Umbau-Maschine fehlt fast – darum stand ihr Spiegel fast still.',
  'gene.scan.A.adult': 'Mara (PM): kaum CYP2D6-Aktivität – subtherapeutischer Morphinspiegel.',
  'gene.scan.B': 'Jonas: die Maschine arbeitet richtig – darum landete sein Spiegel im grünen Bereich.',
  'gene.scan.B.adult': 'Jonas (NM): reguläre CYP2D6-Aktivierung – Spiegel im Fenster.',
  'gene.scan.C': 'Emil: die Maschine läuft im Turbo – darum raste sein Spiegel nach oben.',
  'gene.scan.C.adult': 'Emil (UM): exzessive CYP2D6-Aktivierung – toxischer Morphinspiegel.',
  'gene.scan.curveTitle': 'Gleiche Pille – drei Kurven',
  'gene.scan.curveSub': 'So viel Morphin entsteht über die Zeit – aus DERSELBEN Dosis.',
  'gene.scan.curveSub.adult': 'Morphin-Konzentration über die Zeit aus identischer Codein-Dosis – drei CYP2D6-Phänotypen.',

  // ── mechanism (C only on the body; A/B as overlay cards) ──
  'gene.mech.prompt': 'Warum drei Antworten? Codein muss erst umgebaut werden.',
  'gene.mech.prompt.adult': 'Codein → Morphin: die CYP2D6-Aktivierung entscheidet.',
  'gene.mech.C': 'Emils Turbo-Maschine macht aus der gleichen Pille viel zu viel Morphin – darum rast sein Spiegel.',
  'gene.mech.C.adult': 'Bei Emil (UM) wird Codein per O-Demethylierung exzessiv zu Morphin aktiviert – Atemdepressionsrisiko.',
  'gene.mech.A': 'Bei Mara fehlt die Maschine fast – kaum Morphin, der Spiegel bleibt unten.',
  'gene.mech.A.adult': 'Bei Mara (PM) kaum Aktivierung – subtherapeutisch; mehr Substrat ändert das nicht.',
  'gene.mech.B': 'Bei Jonas passt die Maschine – genau im grünen Bereich.',
  'gene.mech.B.adult': 'Bei Jonas (NM) regelrechte Aktivierung – im therapeutischen Fenster.',

  // ── Treat A (Poor Metabolizer) ──
  'gene.treatA.prompt': 'Schau auf den Körper – Mara steht zu tief, knapp unter dem grünen Bereich. Was sollte Mara jetzt bekommen?',
  'gene.treatA.prompt.adult': 'Maras Spiegel ist subtherapeutisch (knapp unter dem Fenster). Was sollte Mara erhalten?',
  'gene.treatA.opt.switch': 'Ein anderes Schmerzmittel, das die Umbau-Maschine nicht braucht',
  'gene.treatA.opt.switch.adult': 'Auf ein nicht-CYP2D6-aktiviertes Analgetikum wechseln (z. B. Ibuprofen)',
  'gene.treatA.opt.more': 'Mehr Codein geben',
  'gene.treatA.opt.wait': 'Einfach abwarten',
  'gene.treatA.opt.samepill': 'Nochmal dieselbe Tablette geben',
  'gene.treatA.opt.tramadol': 'Stattdessen Tramadol geben',
  'gene.treatA.fb.switch': 'Genau – ein Mittel ohne Umbau-Maschine wirkt bei Mara sicher. Schau, wie ihr Spiegel ins Grüne steigt!',
  'gene.treatA.fb.switch.adult': 'Richtig – ein nicht-CYP2D6-abhängiges Analgetikum wirkt unabhängig vom Genotyp. Der Spiegel steigt ins Fenster.',
  'gene.treatA.fb.more': 'Schau auf den Körper – nichts bewegt sich! Ohne Umbau-Maschine wird auch aus mehr Codein kaum Morphin. Mara bleibt zu tief.',
  'gene.treatA.fb.more.adult': 'Der Spiegel rührt sich nicht – ohne CYP2D6 erzeugt mehr Substrat kein zusätzliches Morphin. Subtherapeutisch.',
  'gene.treatA.fb.wait': 'Der Spiegel bleibt unten – der Schmerz hält an. Warten hilft nicht.',
  'gene.treatA.fb.wait.adult': 'Keine Änderung – der Spiegel bleibt subtherapeutisch, die Analgesie fehlt.',
  'gene.treatA.fb.samepill': 'Gleiches Ergebnis – dieselbe Pille, dieselbe fehlende Maschine. Der Spiegel bleibt zu tief.',
  'gene.treatA.fb.samepill.adult': 'Identische Gabe, identisches Problem – ohne CYP2D6 keine wirksame Aktivierung.',
  'gene.treatA.fb.tramadol': 'Vorsicht – Tramadol braucht dieselbe Umbau-Maschine. Bei Mara hilft es genauso wenig. Versuch es nochmal.',
  'gene.treatA.fb.tramadol.adult': 'Falle – Tramadol wird ebenfalls über CYP2D6 aktiviert; dasselbe genetische Problem. Nochmal.',

  // ── Treat C (Ultra-rapid) ──
  'gene.treatC.intro': 'Emil hat dieselbe Tablette bekommen – schau, was passiert.',
  'gene.treatC.intro.adult': 'Emil erhält die identische Codein-Dosis – beobachte den Spiegel.',
  'gene.treatC.give': 'Pille geben',
  'gene.treatC.rising': 'Schau! Der Spiegel rast hoch über den grünen Bereich!',
  'gene.treatC.rising.adult': 'Der Spiegel steigt rapide über das therapeutische Fenster.',
  'gene.treatC.prompt': 'Der Spiegel ist über dem grünen Bereich – das ist zu viel. Was ist jetzt sicher für Emil?',
  'gene.treatC.prompt.adult': 'Toxischer Morphinspiegel über dem Fenster. Was ist die sichere Maßnahme für Emil?',
  'gene.treatC.opt.switch': 'Weg vom Codein – ein anderes Schmerzmittel geben',
  'gene.treatC.opt.switch.adult': 'Codein absetzen, auf ein nicht-CYP2D6-Analgetikum wechseln',
  'gene.treatC.opt.more': 'Mehr Codein geben',
  'gene.treatC.opt.keep': 'Einfach beim Codein bleiben',
  'gene.treatC.opt.tramadol': 'Stattdessen Tramadol geben',
  'gene.treatC.fb.switch': 'Genau – ohne Umbau-Maschine entsteht kein Extra-Morphin. Schau, wie der Spiegel zurück ins Grüne sinkt!',
  'gene.treatC.fb.switch.adult': 'Richtig – ein nicht-CYP2D6-Analgetikum vermeidet die Überaktivierung. Der Spiegel sinkt ins Fenster.',
  'gene.treatC.fb.more': 'Gefährlich! Die Turbo-Maschine macht aus noch mehr Codein noch mehr Morphin – der Spiegel schießt weit über den grünen Bereich.',
  'gene.treatC.fb.more.adult': 'Gefährlich – mehr Substrat bei UM = exzessives Morphin. Der Spiegel steigt weit über das therapeutische Fenster (Atemdepression).',
  'gene.treatC.fb.keep': 'Gefährlich – Emils Turbo-Maschine bildet weiter zu viel Morphin. Der Spiegel bleibt weit über dem grünen Bereich.',
  'gene.treatC.fb.keep.adult': 'Gefährlich – fortgesetztes Codein bei UM hält den toxischen Morphinspiegel weit über dem therapeutischen Fenster.',
  'gene.treatC.fb.tramadol': 'Vorsicht – Tramadol braucht dieselbe Turbo-Maschine. Auch das wird zu viel. Versuch es nochmal.',
  'gene.treatC.fb.tramadol.adult': 'Falle – Tramadol ist ebenfalls CYP2D6-abhängig; bei UM ebenfalls überaktiviert. Nochmal.',

  // ── finale: medicine cabinet ──
  'gene.finale.prompt': 'Wähle das Schmerzmittel, das die Umbau-Maschine NICHT braucht – und gib es Mara und Emil.',
  'gene.finale.prompt.adult': 'Wähle das nicht-CYP2D6-aktivierte Analgetikum für Mara und Emil.',
  'gene.finale.pickFor': 'Karte auf das Kind tippen',
  'gene.card.ibuprofen': 'Ibuprofen',
  'gene.card.ibuprofen.adult': 'Ibuprofen (nicht-CYP2D6)',
  'gene.card.paracetamol': 'Paracetamol',
  'gene.card.paracetamol.adult': 'Paracetamol (nicht-CYP2D6)',
  'gene.card.codein': 'Codein',
  'gene.card.codein2': 'Codein (höhere Dosis)',
  'gene.card.tramadol': 'Tramadol',
  'gene.card.tramadol.adult': 'Tramadol (CYP2D6-abhängig!)',
  'gene.finale.warn': 'Schau auf den Körper – der Spiegel zieht nach oben aus dem grünen Bereich heraus! Diese Karte braucht die Umbau-Maschine.',
  'gene.finale.warn.adult': 'Der Spiegel steigt über das therapeutische Fenster hinaus – dieses Mittel ist CYP2D6-abhängig, ungeeignet.',
  'gene.finale.bad': 'Ungeeignet – das braucht die Umbau-Maschine. Wähl ein anderes.',
  'gene.finale.bad.adult': 'Ungeeignet – CYP2D6-abhängig. Bitte ein nicht-CYP2D6-Analgetikum wählen.',
  'gene.finale.good': 'Der Spiegel ruht im grünen Bereich und glüht grün – sicher für alle drei.',
  'gene.finale.good.adult': 'Der Spiegel ruht im therapeutischen Fenster – sicher und genotyp-unabhängig.',

  // ── won micro-beat ──
  'gene.won.title': 'Alle drei sicher!',
  'gene.won.peek': 'Jonas war von Anfang im grünen Bereich, Mara und Emil über den Wirkstoff-Wechsel gerettet.',
  'gene.won.peek.adult': 'NM von Beginn im Fenster; PM und UM über den Wechsel auf ein nicht-CYP2D6-Analgetikum versorgt.',

  // ── outcome / debrief ──
  'gene.out.win.title': 'Sicher behandelt!',
  'gene.out.win.sub': 'Gleiche Pille, drei Körper – du hast jeden sicher in den grünen Bereich gebracht.',
  'gene.out.win.sub.adult': 'Du hast den Genotyp gelesen und für PM/UM auf ein nicht-CYP2D6-Analgetikum gewechselt – wirksam und sicher.',
  'gene.out.over.title': 'Zu viel Morphin!',
  'gene.out.over.sub': 'Emils Turbo-Maschine hat aus dem Codein viel zu viel gemacht – der Spiegel schoss weit über den grünen Bereich.',
  'gene.out.over.sub.adult': 'Ultra-rapid Metabolizer + Codein → Morphin-Überschuss → Atemdepressionsrisiko (reale FDA-Boxed-Warning).',
  'gene.out.under.title': 'Wirkung fehlt',
  'gene.out.under.sub': 'Maras Umbau-Maschine fehlt fast – mehr oder dieselbe Codein-Pille macht trotzdem kaum Morphin. Der Schmerz blieb.',
  'gene.out.under.sub.adult': 'Poor Metabolizer: kaum Morphinbildung – Dosiserhöhung bringt mangels Enzym keine Analgesie.',
  'gene.out.dyk1': 'Gleiches Medikament, gleiche Dosis, andere Gene – ganz anderes Ergebnis. Das Gen entscheidet, nicht die Menge.',
  'gene.out.dyk1.adult': 'Codein ist ein Prodrug; der CYP2D6-Metabolisierertyp bestimmt Wirkung und Risiko – gleiche Dosis, anderer Effekt.',
  'gene.out.dyk2': 'Passt die Umbau-Maschine nicht, dreht man nicht an der Codein-Menge – man nimmt ein Mittel, das sie gar nicht braucht.',
  'gene.out.dyk2.adult': 'Bei PM/UM ein nicht-CYP2D6-aktiviertes Analgetikum wählen – nicht Tramadol (ebenfalls CYP2D6-abhängig).',
  'gene.out.dyk.over': '„Schnell" heißt hier nicht „schnell weg", sondern „schnell zu viel" – die Turbo-Maschine bildet gefährlich viel Morphin.',
  'gene.out.dyk.over.adult': 'Ultra-rapid Metabolizer bilden exzessiv Morphin; Codein ist bei Kindern post-Tonsillektomie kontraindiziert.',
  'gene.out.dyk.under': 'Fehlt die Umbau-Maschine, hilft mehr Codein nicht – der Körper kann es einfach nicht in Morphin umbauen.',
  'gene.out.dyk.under.adult': 'Beim Poor Metabolizer fehlt die Aktivierung; Dosissteigerung erhöht das Risiko ohne Analgesie-Gewinn.',
}
```

Also change in the shared `de` dict (`locale.svelte.ts`):
```
'story.gene.title': 'Drei Körper, eine Pille',
'story.gene.title.adult': 'Drei Körper, eine Pille',
'story.gene.desc': 'Gleiche Pille, drei Körper – das Gen entscheidet. (Gen-Wechselwirkung)',
```
Reuse the existing `common.next`, `common.retry`, `out.dyk`, `out.rankLabel`, `rank.*`,
`out.idle.*` keys (already shared). The mined old keys (`gene.brief.*`, `gene.mech*`,
`gene.fb.switch/keep/tramadol/increase`, `gene.out.*`, `gene.twin.*`, `gene.bin.*`) are
superseded by the above; keep only what is re-listed here.

---

## 10. Scoring — `stars(win, clever, pro)`

`stars()` from `flow.ts` = `1 + clever + pro`, any loss = 0. Both bonuses earnable AND missable.

- **clever — the wager read (the story's core skill).** From the three **predict-then-pour**
  bets (Beats 1/1b/1c), NOT a screen quiz. `genePredictGrade(betMisses)`: all three first-try
  correct = **1.0**; exactly one wrong bet = **0.5**; two+ = **0**. (Per the brief open
  question, all three count equally at 1/3 each — B is the gimme, but C carries the twist and a
  miss there still costs.)
- **pro — clinically clean handling at the water.** Three checks, combined into `stumbles`:
  (1) **Treat A** first-try without the stillstand/warte/dieselbe trap;
  (2) **Treat C** first-try without „mehr Codein"/„bei Codein bleiben";
  (3) **Finale** without a Codein/Tramadol warning-misfire.
  A **retry-tap** (Tramadol at A or C, corrected) or a **finale warning-misfire** counts as one
  *stumble*. `geneProGrade(stumbles)`: 0 stumbles = **1.0**; exactly 1 = **0.5**; 2+ = **0**.
  (A losing pick is not a „stumble" — it's a LOSS, so the run scores 0 anyway.)

Resulting band: **3.0** = flawless (all bets right, no stumble), **2.5** = one small stumble,
down to **1.0** = win scraped (≥2 wrong bets and ≥2 stumbles but still won). Loss → 0 → loss
rank only (`rank.0`, shown by EndScreen). Rank titles read from `rank.*` (flow.ts `rankKey`) —
never hardcode a rank string.

Component derivations:
```ts
let betMisses = $derived(/* count of bets[id] !== body.truth across the 3 bodies */)
let clever = $derived(genePredictGrade(betMisses))
let pro = $derived(geneProGrade(stumbles))           // stumbles tallied as retries/warning-misfires occur
let starCount = $derived(stars(outcome === 'win', clever, pro))
```

---

## 11. Sim assertions — `frontend/sim/gene.sim.ts`

Pattern mirrors `fruehstueck.sim.ts` (`ok(name, cond)`, exit non-zero on fail). Import from
`../src/lib/stories/gene` and `outcomeForLevel, stars, DEFAULT_CFG` from `../src/lib/flow`.

**Data model legal vs LEVELS / window:**
- `GENE_BASELINE` is below the window and above crit-low: `> critical_low && < band_low` (40).
- `GENE_A_LOW` (46) is `< band_low` and `> critical_low` (visibly „zu wenig", not a loss-floor).
- `GENE_B_DOSE` is in the band: `>= band_low && <= band_high` (62).
- `GENE_C_HIGH` (78) is `> band_high && < critical_high` (live-readable before the choice).
- `GENE_C_SURGE` (90) is `> critical_high` (honest over-the-window twist; auto-trip doesn't fire).
- `GENE_FINALE_OK` in band; `GENE_FINALE_WARN` (74) `> band_high && < critical_high`.
- **`GENE_A_STILL === GENE_A_LOW`** (both 46) so `Math.abs(GENE_A_STILL − GENE_A_LOW) < 1`
  holds with delta **0** — asserts the dead-still early-branch fires (47 would give delta 1,
  which is NOT `< 1`). Also assert `outcomeForLevel(GENE_A_STILL) === 'under'`.
- Exactly three bodies; truths are `low/mid/high` for A/B/C respectively.
- Each body's `pour` matches its truth's zone:
  `outcomeForLevel(A.pour)==='under'`, `===('win')` for B, `==='over'` for C.
- `GENE_PK_CURVES` has 3 entries, each with a non-empty `d` path string.

**Each decision → torso target → outcome consistency:**
- Treat A: `switch.result==='win'` and `outcomeForLevel(62)==='win'`; `more`/`wait`/`samepill`
  all `result==='under'`; `tramadol.result==='retry'` and `adultOnly`. `more.target===GENE_A_STILL`
  (===GENE_A_LOW===46) and `outcomeForLevel(more.target)==='under'`.
- Treat C: `switch.result==='win'`/target 62 in band; `more.result==='over'` and
  `more.target>=critical_high`; `keep.result==='over'` and `keep.target>band_high`;
  `tramadol.result==='retry'` and `adultOnly`.
- Exactly one winning option per treatment beat; at least one over and one under across the set.
- Cabinet: exactly two `safe` cards (ibuprofen/paracetamol); codein cards `safe===false`;
  `tramadol.safe===false && adultOnly`.

**Wager correctness helper:**
- `geneBetCorrect(A,'low')===true`, `geneBetCorrect(A,'high')===false`, etc.
- `genePredictGrade(0)===1`, `(1)===0.5`, `(2)===0`, `(3)===0`.
- `geneProGrade(0)===1`, `(1)===0.5`, `(2)===0`.

**Scoring traces (win/over/under):**
- `stars(true, genePredictGrade(0), geneProGrade(0))===3` (flawless).
- `stars(true, genePredictGrade(1), geneProGrade(0))===2.5` (one wrong bet).
- `stars(true, genePredictGrade(0), geneProGrade(1))===2.5` (one stumble).
- `stars(true, genePredictGrade(2), geneProGrade(2))===1` (scraped win).
- `stars(false, 1, 1)===0` (any loss = 0).
- Full playthrough trace helper `play(treatAId, treatCId, finaleClean)` returning
  `{outcome, stars}`:
  - WIN: switch A + switch C + clean finale → outcome `win`, with the chosen clever/pro grades.
  - OVER: `more` at C → `outcomeForLevel(92)==='over'`, stars 0.
  - UNDER: `more` at A → settles at `GENE_A_STILL` (46) → `outcomeForLevel(46)==='under'`, stars 0.

End with the `✅ ALL PASS` / `❌ N FAILED` summary and `process.exit(fails===0?0:1)`.

---

## 12. Convention compliance (the non-negotiables, restated for the builder)

These override any looser phrasing elsewhere (including the README matrix). Verify them in code review:

1. **NEVER „rote Linie / rote Marke / rotes Klebeband / kritische Linie / Grenze" in
   player-facing copy.** The torso has ONLY the green window taped. Danger is always phrased
   „(weit) über den grünen Bereich / über das grüne Fenster hinaus" (over) or „unter dem grünen
   Bereich" (under). The English „red tape" / „red line" in this doc's §3 table and prose is an
   **internal description of the physical danger zone for the builder**, never a UI string. The
   §9 copy block is already clean — keep it clean.
2. **The level is always „der Spiegel", never „das Wasser / Wasserstand" in copy** (narration
   of „what the water does" included — say „was der Spiegel macht", not „was das Wasser macht").
   The §9 strings comply.
3. **Enzyme location** = „in Darm und Leber" (gut wall + liver), **never „Bauch"**.
4. **Over-demo values have pump margin** (78, 90, 92, 82 — all clearly over the window / over
   critical_high), per blueprint §3.
5. **The decision torso level matches its prompt** (Treat A at 46 = „knapp unter dem grünen
   Bereich"; Treat C at 78 = „über dem grünen Bereich") and **the winning move is a real,
   watchable movement** (46→62, 78→62), not a flash.
6. **Both registers** authored for every key; hide the Tramadol option from young via the
   `adultOnly` filter.

---

## Builder checklist (blueprint §8)

1. Write `stories/gene.ts` (§8) — levels from `LEVELS`, the typed bodies/options/cards,
   `genePredictGrade`/`geneBetCorrect`/`geneProGrade`. Headless-pure. **`GENE_A_STILL ===
   GENE_A_LOW` (46) — do not set it to 47** (the off-by-one that breaks the dead-still trap).
2. Write `screens/GenePlay.svelte` on `PlayShell` + `.pl-*` kit + `WatchBody` + the
   `drive()`/`pumping` guard. Render EndScreen **outside** `.beat`. **Delete** the old
   `.minibar`/`.bar`/`.fill` mirrored vessel and the `…` dots. The scanner PK-curve SVG is the
   only on-screen graphic.
3. Write `stories/gene.locale.ts` (§9) and merge `geneLocale` into `de`; update the card title.
4. Write `sim/gene.sim.ts` (§11); `npx tsx sim/gene.sim.ts` passes.
5. `just check` (svelte-check) clean. Browser-smoke win + both losses if possible.

**Open risks a builder should watch:**
- **Dead-still trap legibility (Beat 4 „mehr Codein").** `driveTo(46→46)` takes the `<1`
  early-branch (delta 0 → `setTimeout(then,450)`, never `moving=true`), so the hardware truly
  doesn't move. **The trap is off-by-one-sensitive: 46 (delta 0) works, 47 (delta 1) does NOT
  fire the early-branch** because the guard is `Math.abs(target-cur) < 1` (strict). The „keine
  Reaktion" must be authored **on-screen** (bouncing pill + `still` WatchBody); do not expect a
  pump signal. On a real torso the resting 46 must read clearly „unter dem grünen Bereich".
- **Live over-the-window moves (1c `→90`, 5 trap `→92`).** Auto-trip does NOT fire in `play2`;
  the level is allowed to sit above 80. Resolve the loss from the option's `result` on settle
  (and/or a manual `$effect` like DdiPlay if you want it to land the instant it crosses) — do
  not rely on the engine.
- **Pump pacing.** Three reset drains + three meaning-bearing pours is a lot of travel on a slow
  pump. Run all resets/swaps at rate 8; keep the meaning-bearing rises at rate 4. The
  scanner/mechanism beats are deliberately still to give the pump a rest — do not add pump moves
  there. The finale warning hub `62→74` may need shrinking to `62→70` after bench-testing.
- **`GENE_BASELINE = 40`, not `LEVELS.start (20)`.** 20 is the between-runs prepare level
  (`preHome`); the story's common rest is 40. Keep these distinct or the swap drains read wrong.
- **Register parity + copy convention.** Every key needs both a vivid young line and a precise
  adult line; hide the Tramadol option from young via the `adultOnly` filter. **Per §12 (blueprint
  NON-NEGOTIABLE, which overrides the README's „rote Marke" pair): NEVER say „rote Linie / rote
  Marke / …" and NEVER „das Wasser" in player-facing copy.** Danger is „(weit) über den grünen
  Bereich / über das grüne Fenster hinaus"; the level is „der Spiegel".
