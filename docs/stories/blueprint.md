# SafePolyMed — Story Blueprint & Design Principles

The canonical reference for building every story. Story 1 („Die Frühstücks-Falle") is
the worked example; this doc distills the principles so the other five reach the same bar.
Read this together with the per-story redesign briefs in [`overhaul/`](overhaul/) and the
PK model in [`../game-design.md`](../game-design.md). The exemplars in code:
`screens/FruehstueckPlay.svelte`, `stories/fruehstueck.ts`, `lib/PlayShell.svelte`,
`lib/WatchBody.svelte`, `lib/flow.ts`.

---

## 0. What this is

A touchscreen exhibit on a Raspberry Pi kiosk. A **real peristaltic pump** fills a **real
translucent torso** with dyed water; the water **level = how much drug is in the patient's
blood** — we call it **„der Spiegel"**. A **fixed taped band on the torso = the therapeutic
window** (the only thing marked — see §3). The player makes dosing/clinical decisions on the
screen; **the physical torso fills/drains to show the consequence.** Teaches **safe
polymedication** (drug–drug, food–drug, drug–gene, organ/disease–drug, adherence) to **both
children and adults with little pharma background**. German-first, two registers.

**The screen is the diagnostic console; the physical pump is the patient.** The single most
important rule below (§1) follows from this.

---

## 1. The mechanic grammar — „the torso is the instrument"

1. **The pump IS the message, not a scoreboard.** Decisions are read off the *body*, never off
   a green/red text box. When the water moves, that movement is the payoff. When the screen has
   something important to say, it points the eyes at the hardware (`<WatchBody/>`: „Schau auf den
   Körper …").
2. **Physical pump only.** There is **no on-screen vessel/gauge** on the Pi (the dev
   `VirtualTorso` is a dev-only twin). Do not draw a mirrored tank. The real torso is the readout.
3. **Stillness is information.** Because the pump is slow, use *non-movement* as an answer: a
   wrong hypothesis makes the pump **not move** (instant „harmlos / not it"); only the real cause
   makes the water travel. Wrong guesses are instant; the right one is a slow, suspenseful move.
   (Implemented via `testHypothesis` / a deliberate no-op.)
4. **Tap a hypothesis → the body answers.** Replace „richtig/falsch" quizzes with pump moves —
   the player tests ideas ON the body and reads the result off the water.
5. **At least one read-the-body decision.** One choice per story is made by reading the Spiegel
   vs the window with **no number shown** — the same on-screen action with the body in a different
   state has a different right answer.
6. **Exactly one tank-surprise twist.** The body does something counterintuitive (a delayed
   creep, a rise when you „fixed" it, the same pill giving different levels, „more drug" doing
   nothing). Only the real water can deliver it.
7. **Each story owns a UNIQUE mechanic verb.** No two stories may feel alike. The set:
   - **Frühstück** — *subtract*: lift breakfast items off the tray, read still-vs-fall.
   - **Johanniskraut** — *back-date a lag*: a delayed weekly drain you must trace to a past cause.
   - **Gene** — *bet-then-pour*: predict, then pour the same pill into three different bodies.
   - **DDI** — *scan-a-pairing*: aim one fixed probe across many pills, still·still·SURGE.
   - **Organ** — *catch-a-rate*: tune the inflow against a weakened drain, live.
   - **Adherence** — *author-time*: compose a week, then watch it play out as a curve.
   Sharpen/replace freely **as long as the verb stays distinct** and fits the slow physical pump.
8. **CHALLENGE — never make the answer obvious.** There must be a real puzzle. The correct choice
   should require reading the body, weighing evidence, or a non-trivial inference. **Wrong answers
   must be *plausible* — real patient/clinician mistakes** (double a missed dose, add stomach
   protection, raise the dose, space them out) — never silly throwaways. A walk-up should be able
   to get it *wrong* if they don't think. (We removed pre-labelled genotypes, blind pair quizzes,
   etc. for exactly this reason.)
9. **The LEARNINGS are the point — never let them drift.** Every mechanic exists to teach the real
   PK lesson. The fun serves the lesson, not vice-versa. Each story ends on a debrief that states
   the takeaway in both registers. If a creative idea would blur the learning, change the idea.

---

## 2. Content depth (match the blueprint)

Each story must be **as rich as Frühstück**: a full arc, not a quiz. Aim for:

- **8–9 meaningful stages** (briefing → dose/intro → event → investigation×N → mechanism →
  decision → consequence → finale → debrief), most with the body moving.
- **Multiple scored checks** feeding the two star bonuses (§7).
- A **slow-fill teaching moment** with rotating „Wusstest du?" facts (disease/drug/window/timing).
- A **mechanism** beat that shows the *why* on the body (not a paragraph).
- A **decision** with real losses (over / under) the body dramatizes.
- A **finale** unique to the story.
- A **debrief** with 2 did-you-know facts (kid + adult).

---

## 3. The level model — ONE source of truth, ONLY the window is marked

`frontend/src/lib/flow.ts` → `LEVELS` (mirrored by backend `controller.py LevelConfig`; change
together — these are TAPED on the torso):

```
start 20 · window 55–70 · dose 62 · crit-low 35 · crit-high 80   (all %)
```

- **The torso shows ONLY the green window.** There is **NO red line.** So copy says **„der grüne
  Bereich" / „das grüne Fenster"** — **never „rote Linie".** „Over" = above the window; „under" =
  below it. (The crit 35/80 are *internal* auto-trip thresholds, invisible on the torso.)
- **Every story imports `LEVELS`** for start/dose/window — never hardcode 20/62/55/70.
- **„Over"/danger demo+warning levels sit CLEARLY above the window with pump margin** — ≥~8 units
  over band_high 70 (e.g. **78**, not 72) so an imperfect pump still reads „out of the window". A
  value 1–2 above 70 reads as „still in/at the window" and is forbidden.
- **The decision screen's torso level MUST MATCH its prompt.** If the prompt says „der Spiegel ist
  zu hoch", the torso must be high (e.g. 78) at that moment — do **not** quietly drive it back to
  safe *before* the decision. And **the winning move must be a real, watchable movement**, not a
  no-op that flashes (e.g. drop-the-cause = a visible fall 78→62, not 62→62).
- Prepare/reset (between runs) homes to `start` = 20 (a dramatic near-empty → fill).

---

## 4. The base-style kit (every story inherits it)

- **`PlayShell.svelte`** — wraps the screen. Props: `color` (the story's `stories.ts` colour →
  the per-story **aura background + drifting pills/bubbles**, the animated-yet-calm backdrop),
  `kicker` (story title chip), `caseLine` (persistent patient context, e.g. „Herr Schmidt, 68 ·
  Simvastatin"), `step`/`total` (progress dots), `onCancel`. Children = the beat content. No
  on-screen torso. Uses the full space.
- **Global `.pl-*` kit + tokens in `app.css`** (fixed px — the .pi frame is transform-scaled):
  `--fs-display/h1/h2/lead/body/small/micro`, `--sp-1..6`, `--r-card/pill`, `--story`. Classes:
  `.pl-kicker .pl-h1 .pl-h2 .pl-lead .pl-body .pl-emoji .pl-action(.ghost) .pl-opt .pl-card
  .pl-good .pl-warn .pl-bad`. **Compose these — don't reinvent per-component button/heading styles.**
- **`WatchBody.svelte`** — the „eyes to the body" banner. `text` + `tone` ('watch'|'still'|
  'rising'|'falling'|'good'). Use on every pump beat.
- **`EndScreen.svelte`** — outcome + stars + debrief facts + retry. **Render it as a DIRECT child
  of a `position:relative; height:100%` root, NOT inside the animated `.beat`** (the beat's
  animation leaves a transform that would clip the absolute EndScreen to height 0). Pattern:
  `<div class="root">{#if beat==='outcome'}<EndScreen…/>{:else}<PlayShell…>…</PlayShell>{/if}</div>`.
- **Layout**: centered single actions (`.actions`); full-width grids for the interactive bits; a
  „spread"/visual where a beat would otherwise float one banner in a void (use the space, §1).

---

## 5. Engineering patterns

- **v2 self-contained component** per story: `screens/<Id>Play.svelte` with a local `beat` state
  machine. Routed by `game.story?.id` in `App.svelte` (already wired for all six).
- **Move the pump** via `driveTo(target, rate, onSettle)` (from `game.svelte.ts`). Wrap it in a
  local `drive()` that sets a **`pumping` flag** → **all action buttons `disabled={pumping}`** (no
  double-press). `hold(ms, then)` and `testHypothesis({real,target?,rate?,holdMs?}, then)` for
  stillness beats.
- **Losses are manual.** The engine auto-trip is gated to the legacy `PLAY_PHASES`, which `play2`
  is **not** — so a dangerous move that crosses a red threshold is resolved by a component
  **`$effect`** watching `game.level.level` (set `outcome` + `beat='outcome'` the instant it
  crosses 80/35), exactly like `FruehstueckPlay`/`JkPlay`.
- **Scoring** via `stars(win, clever, pro)` from `flow.ts` → 0–3 in 0.5 steps; any loss = 0.
  `clever` = the investigation skill (read-the-body / detective, first-try); `pro` = the
  management/finale skill. Both must be **earnable AND missable** (don't make a win auto-3★).
  Rank titles already in locale (`rank.*`, kid/adult).
- **Calibrated pump rate**: in-game moves run at the calibrated pump rate (ceiling). The `rate`
  arg to `driveTo` only *slows below* it — you can't move faster than the pump. Pace by move
  DISTANCE + the slow-fill fact cards, not by demanding impossible speeds.
- **Per-story files** (the exemplar set): `stories/<id>.ts` (pure data + scoring, no runes →
  headless-testable), `screens/<Id>Play.svelte` (the component), `stories/<id>.locale.ts` (the
  copy — see §6), `sim/<id>.sim.ts` (the „play via code" headless test asserting the data model +
  decision→torso→outcome→stars). `npx tsx sim/<id>.sim.ts` must pass.

---

## 6. Copy conventions

- **Two registers** via `game.ageGroup`: `t('foo')` prefers `'foo.adult'` for adults, else `'foo'`
  (young). **young** = warm, concrete, short, images-not-jargon, a gloss on any term; **adult** =
  precise with real names. Hide the most nuanced option for young (filter `adultOnly`).
- **The level = „der Spiegel"** (wie viel Wirkstoff im Blut ist) — introduce it once at the dose
  beat; **NEVER „Wasser".**
- **Enzymes**: standardized — young „Abbau-Enzym" / „Enzym (kleine Helfer, die das Medikament
  zerlegen)"; adult the real name (CYP3A4, CYP2D6, …). **Correct location** (gut wall + liver =
  „in Darm und Leber" — **never „Bauch"** for an intestinal enzyme).
- **Danger** = „über den grünen Bereich / das grüne Fenster" / „weit zu hoch" — **never „rote Linie".**
- **Decisions are patient-framed**: „Was sollte [Patient] jetzt tun?" — not „Was tust du?".
- **Don't presume the player's pick**: „**Drei davon** treiben den Spiegel …", not „diese drei …".
- **Don't flash success**: a correct strategy lands on a proper beat with the message + a **„Weiter"
  + a peek** at the next task — not a 0.4 s flash.
- **Dose-fill facts**: rotate 3–4 „Wusstest du?" cards (disease / drug / window / timing), kid+adult;
  **hold the last one a minimum readable time** before the reveal so it isn't cut.
- **Spelling**: proof-read the German (plurals, umlauts, „Tabletten" not „Tabeltte").
- **Pharma accuracy (demonstrator level)**: directionally correct, simplified, **never false**.
  Real drug + real documented interaction + the real management lesson. Coffee ≠ harmless-in-general
  — say precisely „verändert diesen Spiegel nicht (CYP1A2)". The learnings carry the exhibit.

### Per-story locale files
Each story's copy lives in `stories/<id>.locale.ts` exporting `export const <id>Locale:
Record<string,string> = { … }`, merged in `locale.svelte.ts`. This keeps stories self-contained
and lets them be built in parallel without colliding on one giant file. (Frühstück = the pattern.)

---

## 7. Scoring & outcomes

- **Three end states** dramatized on the body: **win** (settles in the window), **over** (drives
  above the window → loss), **under** (drives below → loss). Some stories have no over path (e.g.
  induction only leaks) — that's fine; keep it honest to the pharmacology.
- **`stars(win, clever, pro)`** → 1.0 base + clever(0/0.5/1) + pro(0/0.5/1). Loss = 0 (loss rank
  only). Map the story's first-try investigation check(s) → `clever`; the finale/management check
  → `pro`. Keep both genuinely missable so the 1.0–3.0 range is used.
- **Debrief**: 2 did-you-know facts (kid + adult) restating the learning + the safe action.

---

## 8. The build recipe (per story)

1. Read this doc + the story's `overhaul/<id>.md` brief + the Frühstück exemplar files.
2. Write `stories/<id>.ts` (levels from `LEVELS`; the mechanic's data + scoring; headless-pure).
3. Write `screens/<Id>Play.svelte` on `PlayShell` + the `.pl-*` kit + `WatchBody` + the
   `drive()`/`pumping` guard + the manual-loss `$effect` + EndScreen-outside-`.beat`.
4. Write `stories/<id>.locale.ts` (every key, kid+adult, per §6).
5. Write `sim/<id>.sim.ts`; `npx tsx sim/<id>.sim.ts` passes.
6. `svelte-check` clean. Browser-smoke the win + both losses if possible.

Keep it **fun, challenging, and faithful to the learning.** Be creative with the mechanic (a
drawn PK concentration–time curve, a live dial, a sorting board, a timed catch) — as long as it
lives on the slow physical pump, stays distinct, and never makes the answer obvious.
