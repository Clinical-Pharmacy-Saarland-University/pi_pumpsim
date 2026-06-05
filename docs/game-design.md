# PumpSim — Game Design (v0.2)

> Living document. Status: **direction chosen** — „Dr. Dosis" blend, **mixed/all ages**.
> Concept brainstorm kept below (§1–§11); the chosen design is **§12**.
> UI language: **German first**, built i18n-ready (English later).

## 1. The setup as a design asset
- **Translucent 3D-printed upper body (~2–3 L)** filled with **dyed water** by a pump
  that goes **in *and* out**.
  - Pump **in** = a dose entering the body (drug concentration ↑).
  - Pump **out** = the body **metabolising/eliminating** the drug (concentration ↓).
    → elimination is *physical and visible*: the patient literally clears the drug.
- **7" touch screen (1280×720 landscape)** = the game: patient character, the
  therapeutic-window gauge / live concentration curve, controls, story, score.
- **Dual representation** (powerful for learning): the **body** shows the concrete
  "how full" while the **screen curve** shows the abstract rise-and-fall over time.
- **Future hardware idea (cheap, huge wow):** an addressable **LED strip inside the
  torso** (WS2812 on a GPIO) that glows **green in the window, amber near the edge,
  red when toxic / too low**. Turns the whole body into a health indicator. Optional.

## 2. Why the old version fell flat → design principles
The old "set a dose, watch it reach a line" is static: one decision, no tension, no
story, no surprise. Fixes:
1. **Make the system dynamic** — the level always decays, so the player must *keep*
   the patient healthy over time, not hit a number once.
2. **Surprise + adaptation** — interaction events (grapefruit, a second drug, genes)
   perturb the system mid-round and force the player to react. This is *also* the
   educational payload.
3. **Character & story** — the torso is *a patient* with a face, mood, and a short
   story. Emotional stakes ("er fühlt sich gut!" / "ihm wird schlecht").
4. **Short rounds + stars** — 60–120 s "a day in the life", 1–3 stars, "nochmal!".
5. **One clear idea per round** — each scenario teaches exactly one concept.

## 3. Educational concepts (kept kid-simple)
| Concept | Kid-friendly framing (DE) |
|---|---|
| Therapeutic window | „Der grüne Bereich" — nicht zu wenig, nicht zu viel |
| Half-life / elimination | „Der Körper baut das Medikament ab" (Wasser läuft raus) |
| Steady state / interval | „Zur richtigen Zeit nachdosieren" |
| **DDI** (drug–drug) | „Zwei Medikamente beeinflussen sich" |
| **DGI** (drug–gene) | „Jeder Körper baut anders schnell ab" (Gene/Enzyme) |
| **FDI** (food–drug) | „Auch Essen & Trinken mischen mit" (Grapefruit!) |

## 4. Concept candidates
Compact; each has a different *core loop*. We pick / blend.

### A. „Grüner Bereich" — live balancing (arcade)
- **Loop:** level decays continuously; tap **Dosis** to top up; **keep it in the
  green band** as long as possible. Events spike/drain it.
- **Body:** rises on dose, falls on metabolism, in real time.
- **Teaches:** window + half-life + that interactions disturb a living system.
- **Fun:** reactive "don't let it die" tension; very walk-up-friendly.
- **Best for:** short attention spans, noisy demo floor.

### B. „Dosis-Detektiv" — case puzzle (story)
- **Loop:** read a short patient case (DE), **choose the right dose**, watch the
  time-lapse. The catch: the case hides an interaction trap (grapefruit / second
  drug / "langsamer Metabolisierer") you must account for.
- **Body:** fills during the time-lapse to reveal success/failure.
- **Teaches:** dosing depends on the patient + spotting DDI/DGI/FDI.
- **Fun:** detective "did you catch the trap?" aha-moments; readable, thoughtful.
- **Best for:** older kids/teens/adults, guided demos.

### C. „Tagesrhythmus" — steady-state timing
- **Loop:** set the **dosing schedule/interval**; keep the saw-tooth inside the band
  across a simulated day. Too often → accumulation (toxic); too rare → no effect.
- **Teaches:** steady state, interval, accumulation (the "realest" PK).
- **Fun:** rhythm-game satisfaction; a bit more abstract.

### D. „Pflege-Patient" — caretaker over a day (narrative / tamagotchi)
- **Loop:** keep your patient well through a "day"; symptoms flare (needs dose),
  life happens (grandma brings grapefruit juice, a missed dose, a double dose).
  React to keep the mood/health bar up.
- **Teaches:** window + interactions, wrapped in care & story.
- **Fun:** emotional attachment, very kid-friendly, replayable.

### E. „Interaktions-Labor" — sandbox (discovery)
- **Loop:** free play — pick a drug, dose it, then add grapefruit / Johanniskraut /
  toggle a "Gen-Variante" and **watch** the curve + body change live.
- **Teaches:** cause→effect of interactions; great with a guide explaining.
- **Fun:** experimentation; bolt challenges on for goals.

## 5. The "twist" library (the educational core, reusable across concepts)
Each is a card that pops up (DE text + icon) and changes a parameter. Real mechanism
+ simplified kid line:

| Twist | Real mechanism | Effect in game | Kid line (DE) |
|---|---|---|---|
| 🍊 **Grapefruit** (FDI) | inhibits CYP3A4 | elimination ↓ → level climbs | „Grapefruit bremst den Abbau – es wird zu viel!" |
| 🌿 **Johanniskraut** (herb DDI) | induces CYP3A4/P-gp | elimination ↑ → level drops | „Johanniskraut beschleunigt den Abbau – es wirkt zu wenig!" |
| 💊 **Zweites Medikament – Hemmer** (DDI) | enzyme inhibitor | elimination ↓ → accumulate | „Ein zweites Medikament blockiert das Abbau-Enzym." |
| 💊 **Zweites Medikament – Beschleuniger** (DDI) | enzyme inducer | elimination ↑ → drops | „Ein zweites Medikament kurbelt den Abbau an." |
| 🧬 **Langsamer Metabolisierer** (DGI) | poor metaboliser (e.g. CYP2D6) | low k from the start | „Dieser Körper baut langsam ab – gleiche Dosis, mehr Wirkung." |
| 🧬 **Schneller Metabolisierer** (DGI) | ultra-rapid metaboliser | high k from the start | „Dieser Körper baut schnell ab – braucht öfter." |
| ⏰ **Vergessene Dosis** | adherence | no dose when needed | „Ups – Dosis vergessen!" |
| ⏱ **Doppelte Dosis** | adherence | double bolus | „Aus Versehen doppelt genommen!" |
| 🫘 **Niere/Leber schwach** | reduced clearance | low k | „Die Niere arbeitet langsamer." |

> **DGI = a patient *trait*** set at the start (same dose, different person → different
> outcome — a strong lesson). **FDI/DDI/adherence = *events*** during the round.

## 6. Dosing interaction (how the player gives a dose — point "c")
Avoid a boring slider. Options, by audience:
- **Tap-the-syringe / pill** (big, tactile) — bolus per tap; *timing* is the skill. (Young kids.)
- **Hold-to-infuse** — press and hold to titrate; risk overshoot. (Skill/feel.)
- **Choose strength + count** (5/10/20 mg ×n) — more cognitive. (Older.)
- **Timeline planning** — place doses on a day timeline (for steady-state mode).
- **Decision prompts** on events — „Grapefruit? Trotzdem dosieren?" give/skip/adjust.

## 7. Recommended direction (a blend) — „Dr. Dosis: Bleib im grünen Bereich"
**D + A + one twist/round, story-framed, with a 5-second „Wusstest du?" after each.**

Example round (~90 s):
1. Card: „Mia, 9, hat Fieber. Halte sie im grünen Bereich!" (DE).
2. Live mechanic: paracetamol level decays; tap the syringe to re-dose; body fills/drains.
3. ~40 s in, a twist pops: „🍊 Mia trinkt Grapefruitsaft!" → elimination slows, level
   creeps toward toxic; player must dose less / wait.
4. End: stars by time-in-green + a one-line „Wusstest du?": „Grapefruit kann den Abbau
   mancher Medikamente bremsen."
5. Auto-drain the body, next patient.

Why: keeps the live tension (fun), the story/character (stakes), and delivers exactly
one interaction concept per short round (education), all spotlighting the physical body.

## 8. Scoring & feedback
- **Zeit im grünen Bereich** → 1–3 ⭐ per round.
- **Wohlbefinden-Balken** (well-being): up in window, down when sub-/supra-therapeutic.
- Patient **emotes**: 🙂 gesund · 😣 Schmerzen (zu wenig) · 🤢 Nebenwirkungen (zu viel).
- Optional sound; optional session high-score (no accounts).

## 9. Scenario seeds (DE)
1. **Tutorial** „Max hat Kopfweh" — nur im grünen Bereich halten.
2. **FDI** „Lenas Grapefruit-Frühstück".
3. **DDI** „Opas Tablettenmix" (Hemmer).
4. **Herb-DDI** „Johanniskraut-Tee" (Beschleuniger).
5. **DGI** „Zwei Brüder, eine Dosis" (schnell vs. langsam).
6. **Adherence** „Die vergessene Tablette".

## 10. UI / UX principles
- **Clean play surface** — no admin/debug visible. Big touch targets, kid-readable.
- **Hidden admin** — keyboard shortcut (e.g. `A`) or a hidden gesture (long-press a
  corner) opens calibration/operator settings; never shown during play.
- **German-first, i18n-ready** — *all* user-facing strings live in a locale module
  (`de.json` now, `en.json` later) behind a `t('key')` lookup; no hard-coded text in
  components. Numbers/units formatted via the locale.
- **Auto-attract / reset** — idle → attract screen; auto-drain body between players.

## 11. Open questions (drive the next iteration)
- **Audience age** (young kids ~6–10 vs teens/adults vs mixed walk-up)? → sets complexity & dosing UI.
- **Guided or walk-up?** → how much on-screen reading vs instant play.
- **One fixed patient** (the torso) or **pick a character** per round?
- **Tone:** playful/cartoony vs cool/semi-clinical?
- **LEDs in the torso** on the table (future)? → shapes the feedback design.
- Which **drugs** to name (real & DE-relevant) vs a generic „Medikament"?

---

## 12. Decided direction — v0.2: „Dr. Dosis" (mixed / all ages)
Chosen: the **blend** (caretaker story + live keep-in-the-green + one twist/round).
Audience **mixed/all ages** ⇒ the guiding rule is **instant to grasp, optional depth**.

### Layered so anyone can play, anyone can learn more
- **Layer 0 (5 seconds):** „Halte die Person im **grünen Bereich**." A gauge with a
  green band; the level **sinks on its own**; you **dose to push it up**. Green =
  patient smiles + stars tick. That's the whole game for a passer-by.
- **Layer 1 (the hook, ~30–40 s in):** an **event** changes the rules — „🍊 Grapefruit!"
  — one friendly line explains it; you must adapt. This is the fun + the lesson.
- **Layer 2 (optional, for lingerers/pros):** the live **curve**, the real terms
  („therapeutisches Fenster", „CYP3A4"), and a 5-second **„Wusstest du?"** at the end.

### Core loop (one patient ≈ 60–90 s)
1. Patient card (DE): name + ailment → goal „im grünen Bereich halten".
2. Level decays continuously (**body pumps out**); player doses (**body pumps in**).
3. One twist fires mid-round (grapefruit / 2nd drug / metaboliser trait).
4. Result: ⭐ by **time-in-green**, patient mood, one **„Wusstest du?"** line.
5. Body **auto-drains**, next patient.

### Dose interaction (recommended)
**Hold-to-infuse syringe:** press & hold the big syringe → the pump runs **in** and
the body fills *while held*; release to stop. Overshoot toward "toxic" is a real risk
→ teaches "not too much," and the touch action maps 1:1 to the physical pump. (Tap-bolus
is the alternative; decided in this iteration.)

### Scoring / feedback
- **Wohlbefinden** bar: ↑ while green, ↓ while too low/high (faster when toxic).
- **Zeit im grünen Bereich** → 1–3 ⭐ per patient; session total at the end.
- On-screen **face emotes** (🙂/😣/🤢) — the *screen* shows mood (the body can't), the
  *body* shows the level. (Future: LED strip glows the body green/red to merge both.)

### Screen layout (1280×720, clean, German)
```
┌───────────────────────────── event banner (when active) ─────────────────────────────┐
│  [Patient face + name/mood]        │   „Wirkstoff-Spiegel"  gauge + green band + curve │
│   (screen = emotion)               │   (mirrors the physical body)                    │
│                                    │                                                  │
│   ⭐⭐ · Wohlbefinden ▓▓▓░          │            ⟶  [ ●  HALTEN zum Dosieren ]  ⟵       │
└──────────────────────────────────────────────────────────────────────────────────────┘
```
The on-screen gauge **replaces the dev water-avatar** (the real body is the vessel);
in dev with no hardware, the gauge stands in for the body.

### Maps onto the existing engine
The current sim already has level, `clearance_k` (decay), dead volume (tube prime),
capacity, target window. The game adds:
- **Events** that modulate `clearance_k` live (🍊 ×0.4, 🌿 ×2, langsam ×0.5, schnell ×2)
  and optionally shift the window;
- a **scenario script** (timed events per patient) + level progression;
- a **well-being** integrator + star scoring;
- a **hold-to-dose** continuous pump-in command (pump start/stop) alongside bolus.

### Tone
Freundlich, farbig, klar — **nicht kindisch**. Works for a 7-year-old and an adult.

### Still open (this iteration)
- **Dose interaction:** hold-to-infuse vs tap-bolus.
- **Session shape:** short fixed arc (~3 patients → „Geschafft!") vs endless
  (one patient, escalating, high-score).
- (defaults unless changed) **Drugs:** real & familiar in DE (Paracetamol/Ibuprofen),
  kept simple. **Feedback:** designed LED-ready but not LED-dependent.

