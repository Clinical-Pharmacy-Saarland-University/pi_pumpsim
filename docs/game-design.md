# PumpSim — Game Design (v0.6)

> Living document. **Status: v0.7 — see §19 (current).** (§18 holds the level model.)
> Context: a university **„Tag der offenen Tür"**, theme **SafePolyMed** (safe
> polymedication): drug–drug, food–drug, and drug–gene interactions.
> Core loop changed from twitch-balancing to a **decision game with a slow physical
> reveal** (real pump is slow; the therapeutic window is a **fixed taped band**).
> §1–§17 are earlier iterations kept for reference; **§18 supersedes the v0.5 loop**.
> UI language: **German first**, i18n-ready.

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

### Locked decisions
- **Dosing:** hold-to-infuse (hold syringe → pump in; release → stop; overshoot = risk).
- **Session:** short fixed **3-patient arc** → „Geschafft!" summary. Walk away anytime.
- **Drugs:** real & familiar in DE (Paracetamol/Ibuprofen), kept simple.
- **Feedback:** designed LED-ready, not LED-dependent.

### The 3-patient arc (concrete)
_(Finalized in §16 — „Hilf der Familie!", accurate drugs:)_
| # | Patient (DE) | Drug | Twist | Teaches |
|---|---|---|---|---|
| 1 | „Max, 8 – Fieber" | Paracetamol „Para" | none (tutorial) | hold-to-dose, keep green |
| 2 | „Eva (Mama), 42 – Cholesterin" | Simvastatin „Sim" | 🍊 Grapefruit → decay ×0.4 | FDI: Spiegel ↑ → Muskelschmerzen |
| 3 | „Opa Karl, 70 – Blutdruck" | Metoprolol „Meto" | langsamer Stoffwechsel (k×0.4) | DGI: same dose hits harder |
Then **„Geschafft!"**: total ⭐ + a one-line recap of each lesson.

### Hold-to-infuse mechanic
- Big circular **„HALTEN"** syringe button. While held: pump runs **in**, level rises
  at `pump_rate`; plunger animates; subtle sound. Release → stop. Decay always runs.
- **Overshoot above the band = toxic** → well-being drops → you learn to pulse/anticipate.
- Skill = account for the *ongoing* drain while you dose.

### Scoring / feedback (concrete enough to build)
- **Time-in-green** drives stars per patient: `≥80% → ⭐⭐⭐`, `≥50% → ⭐⭐`, `>0 → ⭐`.
- **Wohlbefinden** bar (mood) = visual only: rises in-green, falls out (steeper when
  toxic). Patient face 🙂/😣/🤢 follows it. A live „X s im grünen Bereich" counter.
- Per patient ~60–75 s. Forgiving: low score still finishes the arc (everyone "wins").

### PK numbers (starter, all calibratable in the existing config)
Normalized 0–100 "Spiegel" scale (calibration maps it to physical ml later).
- band: P1 `[35,65]`, P2 `[40,60]`, P3 `[42,58]` (narrows slightly).
- decay `k`: ~`0.03/s`; grapefruit ×0.4; slow-metaboliser ×0.4.
- `pump_rate`: fills ~0–100 in ~6–8 s of holding (tune for feel).

### Starter German copy (→ becomes `de` locale)
- Attract: „**Dr. Dosis** — Bleib im grünen Bereich!" · „Tippen zum Starten"
- In round: „Halte den Spiegel im **grünen Bereich**" · Button „HALTEN" ·
  Status „Im grünen Bereich!" / „Zu wenig!" / „Zu viel!"
- Events: „🍊 Lena trinkt Grapefruitsaft!" · „🧬 Onkel Tom baut langsam ab"
- End: „Geschafft!" · „Wusstest du? Grapefruit kann den Abbau mancher Medikamente bremsen."

## 13. First playable (Milestone 2 scope)
Build on the existing scaffold, **mock pump on the dev PC**:
- Replace the dev water-avatar with the **„Spiegel" gauge + green band** (+ optional curve).
- **Hold-to-infuse** control (continuous pump-in command) + decay already in engine.
- **Event system** (timed `clearance_k` modulation) + the **3-patient arc** script.
- **Well-being + stars + time-in-green**; attract → 3 patients → „Geschafft!".
- All strings via a **`de` locale** module (`t('key')`) — i18n-ready, German shipped.
- Defer: LEDs, sound polish, patient #3's 2nd-drug event, real hardware.
Outcome: a full, demoable round loop you can play in a browser, no Pi needed.

---

## 14. Game flow & screen wireframes (v0.4)

### State machine
```
        ┌─────────────────────────────── (idle timeout, any state) ──────────────┐
        ▼                                                                         │
   ┌─────────┐  tap   ┌───────┐  →  ┌──────┐  time/fail  ┌────────┐  next  ┌─────────┐
   │ ATTRACT │ ─────► │ INTRO │ ──► │ PLAY │ ──────────► │ RESULT │ ─────► │ (next   │
   │ (idle)  │        │patient│     │      │             │ patient│        │ patient)│
   └─────────┘        └───────┘     └──────┘             └────────┘        └────┬────┘
        ▲                                                                       │ after #3
        │                          ┌─────────────┐                             ▼
        └───── „Nochmal" / idle ───│  „GESCHAFFT" │◄────────────────────────────┘
                                   │  (summary)   │
                                   └─────────────┘
   ADMIN: hidden — keyboard `A` or 3-s long-press top-left corner; overlay; never in normal play.
```
Between players the **body auto-drains** (pump out to empty) so each session starts clean.

### Screens
**ATTRACT (idle)** — magnet for passers-by.
```
┌──────────────────────────────────────────────────────┐
│                    💧  Dr. Dosis                       │
│              Bleib im grünen Bereich!                  │
│         (body gently fills/drains in a loop)          │
│                                                        │
│                 ▶  Tippen zum Starten                  │
└──────────────────────────────────────────────────────┘
```

**INTRO (per patient)** — 1 card, ~3 s or tap „Los!".
```
┌──────────────────────────────────────────────────────┐
│   Patient 1/3                                          │
│        🧒  „Max, 8 — Fieber"                           │
│   Halte seinen Wirkstoff-Spiegel im grünen Bereich.   │
│                      [  Los!  ]                        │
└──────────────────────────────────────────────────────┘
```

**PLAY** — the core screen.
```
┌──────────────────────────────────────────────────────────────┐
│ Patient 2/3   Lena, 10 · Schmerzen        ⭐⭐☆       0:42     │  top bar
│        ┌──────── 🍊 Lena trinkt Grapefruitsaft! ────────┐     │  event banner
│        └────────────────────────────────────────────────┘     │
│   ┌───────────────┐                         ┌──────┐          │
│   │   ( face 🙂 )  │                         │░░░░░░│          │
│   │               │                         │▓▓▓▓▓▓│ green band│
│   │   Lena        │                         │██████│ ← level   │
│   │ Wohlbefinden  │                         │██████│   gauge   │
│   │ ▓▓▓▓▓░░        │                         │██████│ (=body)   │
│   └───────────────┘                         └──────┘          │
│   „Im grünen Bereich!"  ·  18 s                               │
│              ┌────────────────────────────┐                   │
│              │   ◉   HALTEN  zum Dosieren  │  ← hold to infuse │
│              └────────────────────────────┘                   │
└──────────────────────────────────────────────────────────────┘
```

**RESULT (per patient)** — ~4 s or tap „Weiter".
```
┌──────────────────────────────────────────────────────┐
│                  ⭐⭐☆   für Lena                       │
│            72 % im grünen Bereich · 🙂                  │
│  Wusstest du?  Grapefruit kann den Abbau mancher      │
│                Medikamente bremsen.                     │
│                     [  Weiter  ]                       │
└──────────────────────────────────────────────────────┘
```

**„GESCHAFFT" (summary)** — end of the 3-patient arc.
```
┌──────────────────────────────────────────────────────┐
│                   🎉  Geschafft!                       │
│                 ⭐⭐⭐⭐⭐⭐⭐☆☆  (7/9)                    │
│   Max ✓ richtig dosiert · Lena ✓ Grapefruit gemeistert │
│   Onkel Tom ✓ langsamer Stoffwechsel erkannt          │
│              [ Nochmal ]     (auto-reset)              │
└──────────────────────────────────────────────────────┘
```

**ADMIN (hidden overlay)** — operator only. Calibration (pump rate, dead volume,
level→ml mapping, window), manual pump in/out test, language, exit. Entered by
keyboard `A` or a 3-second long-press in the top-left corner; never shown in play.

### Idle / reset rules
- No input for ~20 s in INTRO/RESULT/SUMMARY, or ~30 s mid-PLAY → fade to ATTRACT,
  drain the body.
- ATTRACT loops a gentle fill/drain demo to attract attention.

## 15. Visual & art direction (v0.4)
Goal: **clean, modern, friendly — not childish**; readable across a crowded room;
works for a 7-year-old and an adult. The physical body is the hero; the screen is
calm and legible around it.

Principles:
- **Big, few elements.** One primary action (HALTEN), one primary readout (gauge).
- **Color = meaning.** Green = good/therapeutic; amber = edge; red = too much/too little.
- **Rounded, soft, tactile.** Large touch targets, gentle motion, no clutter.
- **Type:** one friendly geometric sans; large weights; high contrast.

Two candidate **directions** were explored:
- **L — „Klar & Freundlich" (light):** airy off-white, soft shadows, vivid friendly
  accents. Reads great in bright daylight rooms; approachable.
- **D — „Cool & Modern" (dark):** deep navy, glowing green target, glassy cards. Sleeker,
  more "tech/game"; makes the gauge glow. (Matches the current dev scaffold.)

> **Chosen: D — „Cool & Modern" (dark).**
> Palette: bg `#0b1020`/`#161f3d`, green `#38e0a0`, water `#4cc9f0→#7c5cff`,
> grapefruit/amber `#ffb703`, toxic `#ff6b7a`.

### Drug mascots (decided: real names + a friendly pill character)
- Each drug = a rounded pill/capsule with eyes + a small mouth, a short name, a color.
- Shown in: patient INTRO („Gib Max etwas **Para**!"), a small badge by the HALTEN
  button in play, and it visually „flows in" while dosing. 2–3 expressions.
- Names = friendly short forms paired with the real name in small text:
  **Para** (Paracetamol), **Ibu** (Ibuprofen), **Sim** (Simvastatin)…
- Clearly toys, not endorsements.

## 16. Scenario scripts & PK tuning (v0.4)

### Global model & constants (normalized 0–100 „Spiegel" scale)
- **Decay** (metabolism / pump-out): `dC/dt = -k·C`.
- **Dose** (hold / pump-in): `dC/dt = +rate` while held. `rate = 10 /s`
  (a ~1 s hold ≈ +10; lets you titrate in quarter-band nudges).
- **Tube** starts **primed** (gameplay is immediate; dead-volume is a hardware-calibration
  concern, not a game mechanic).
- **Time-in-green** fraction `f` → stars: `f≥0.80 → ⭐⭐⭐`, `≥0.55 → ⭐⭐`, `≥0.30 → ⭐`, else 0.
- **Wohlbefinden** `W` (0–100, start 60, cosmetic): in-green `+6/s`; below-low `−4/s`;
  above-high (toxic) `−8/s`. Face: 🙂 in green · 😣 too low · 🤢 too high.

### The three rounds — „Hilf der Familie!" (accurate, age-appropriate)
| # | Family member | Drug (mascot) | Band | k (1/s) | Start | Event | Dur | Teaches |
|---|---|---|---|---|---|---|---|---|
| 1 | **Max, 8 – Fieber** (tutorial) | Paracetamol **„Para"** 🟠 | 35–65 | 0.025 | 0 (fill up) | — | ~45 s | window; *zu viel = leberschädlich*; hints |
| 2 | **Eva (Mama), 42 – Cholesterin** | Simvastatin **„Sim"** 🔵 | 40–60 | 0.030 | 50 (in band) | `t=25s` 🍊 → `k ×0.4` | ~60 s | FDI: Grapefruit ↑ Statin-Spiegel → Muskelschmerzen |
| 3 | **Opa Karl, 70 – Blutdruck** | Metoprolol **„Meto"** 🟣 | 42–58 | **0.012** (slow) | 0 | *(opt.* `t=40s` 💊 inducer → `k ×2.5`)* | ~70 s | DGI: CYP2D6 langsam → stärkere Wirkung |

- **Difficulty curve:** band narrows 30→20→16; clearance manipulated by trait/event.
- **Tutorial hints (P1 only):** pulsing arrow on HALTEN; „Fülle den grünen Bereich" →
  once in green „Super! Halte ihn dort." Hints off for P2/P3.
- **P3's 2nd-drug event is Milestone-2-optional** (full vision keeps it; first slice may omit).

## 17. German copy / locale draft (→ `frontend/src/locales/de.json`)
All UI text via `t('key')`; **no hard-coded strings** in components (English added later as
`en.json`). `{name}`, `{n}`, `{p}`, `{s}` are interpolations.

```jsonc
{
  "app.title": "Dr. Dosis",
  "attract.tagline": "Bleib im grünen Bereich!",
  "attract.start": "Tippen zum Starten",

  "intro.patientOf": "Patient {n}/3",
  "intro.go": "Los!",
  "intro.goal": "Halte den Wirkstoff-Spiegel im grünen Bereich.",

  "play.gaugeTitle": "Wirkstoff-Spiegel",
  "play.hold": "HALTEN",
  "play.holdSub": "zum Dosieren",
  "play.wellbeing": "Wohlbefinden",
  "play.inGreenFor": "{s} s im grünen Bereich",
  "status.in": "Im grünen Bereich!",
  "status.low": "Zu wenig!",
  "status.high": "Zu viel!",

  "result.starsFor": "für {name}",
  "result.greenPct": "{p}% im grünen Bereich",
  "result.didYouKnow": "Wusstest du?",
  "result.next": "Weiter",

  "summary.title": "Geschafft!",
  "summary.again": "Nochmal",

  // tutorial hints (Max)
  "hint.fill": "Fülle den grünen Bereich",
  "hint.hold": "Halten zum Dosieren",
  "hint.keep": "Super! Halte ihn dort.",

  // family framing + patient cards
  "attract.family": "Hilf der Familie, gesund zu bleiben!",
  "intro.give": "Gib {name} etwas {drug}!",
  "p1.name": "Max", "p1.line": "Max, 8 – Fieber",
  "p2.name": "Eva", "p2.line": "Eva (Mama), 42 – Cholesterin",
  "p3.name": "Opa Karl", "p3.line": "Opa Karl, 70 – Blutdruck",

  // drug mascots (short name + real name)
  "drug.para": "Para", "drug.para.full": "Paracetamol",
  "drug.sim": "Sim", "drug.sim.full": "Simvastatin",
  "drug.meto": "Meto", "drug.meto.full": "Metoprolol",

  // events
  "ev.grapefruit": "🍊 {name} trinkt Grapefruitsaft!",
  "ev.grapefruit.sub": "Der Abbau wird langsamer.",
  "ev.inducer": "💊 {name} bekommt ein zweites Medikament",
  "ev.inducer.sub": "Der Abbau wird schneller.",
  "ev.slowMetab": "🧬 Opa Karl baut von Natur aus langsam ab",

  // „Wusstest du?" facts
  "fact.p1": "Auch Paracetamol kann in zu hoher Dosis der Leber schaden – bleib im grünen Bereich!",
  "fact.p2": "Grapefruit bremst das Abbau-Enzym (CYP3A4) – dann steigt der Spiegel von Simvastatin und es kann Muskelschmerzen geben.",
  "fact.p3": "Opa baut Medikamente über das Enzym CYP2D6 langsam ab – wegen seiner Gene. Gleiche Dosis, stärkere Wirkung.",

  // summary recap
  "recap.p1": "Max ✓ richtig dosiert",
  "recap.p2": "Eva ✓ Grapefruit gemeistert",
  "recap.p3": "Opa Karl ✓ langsamen Stoffwechsel erkannt"
}
```

**Decided:** real drug names **+ mascot pill**; jargon = **plain word + real term in
brackets**; tone „du".

### Drugs & pharmacological accuracy (open — your call)
⚠️ The **grapefruit ↔ CYP3A4** interaction is real for CYP3A4 substrates (Simvastatin,
Amlodipin, Ciclosporin…) — **not** for Paracetamol/Ibuprofen. So naming real drugs *and*
staying accurate needs care. A **family framing** resolves it cleanly (members of
different ages → age-appropriate, accurate drugs, and a cohesive „hilf der Familie" story):

| Round | Family member | Drug (mascot) | Real basis |
|---|---|---|---|
| 1 | Max, 8 – Fieber | Paracetamol („Para") | therapeutic window; overdose = leberschädlich (accurate, important) |
| 2 | Mama – Cholesterin | Simvastatin („Sim") + 🍊 | grapefruit ↑ Statin-Spiegel → Muskelschmerzen (textbook CYP3A4) |
| 3 | Opa – langsamer Metabolisierer | CYP2D6-Arznei (z.B. Metoprolol) | Gen-Variante → stärkere Wirkung |

Alternative: keep kid drugs (Paracetamol/Ibuprofen) with **simplified** effects (+ tiny
„vereinfacht dargestellt"). Your accuracy bar + preferred teaching examples decide this.

### German wording
„du"-Ansprache used throughout. Open to your edits on any phrasing.


---

## 18. v0.6 — open-day "SafePolyMed" decision game (CURRENT)

**Context.** University *Tag der offenen Tür*. Theme **SafePolyMed** — safe
polymedication: **DDI** (drug–drug), **FDI** (food–drug), **DGI** (drug–gene)
interactions. Audience: general public, with student/staff presenters.

**Constraints that reshaped the design.**
1. Real pump is **slow** (big torso) — no fast fills → twitch-balancing is out.
2. The therapeutic window is a **fixed taped band** on the torso → *same band for every
   scenario*; only the drug/story/interaction changes.
3. Needs **stories + interaction** (questions, buttons).
4. Must be possible to **lose**.
5. Must teach **gene + polymedication** (Johanniskraut, grapefruit, …), educational.
6. "Cool story" with question/button interactions.

### The reframe — slowness becomes the drama
A patient sits **inside** the fixed band. An interaction is introduced and the level
**slowly drifts toward a danger line**; the player must make the **right decision** to
stop it before it crosses. Slow = suspense + thinking time. Movements stay **small**
(action happens *around* the band), so the slow pump is fine.

- **Screen = the whole game** (story, questions, buttons, the level bar). Full-screen.
- **Torso = digital twin**: an on-screen **vertical bar** with the fixed band marked,
  moving at the **realistic slow pump speed**. In dev it's the only view; on hardware the
  real torso mirrors it. (So the entire game is build/test-able on screen, no Pi needed.)

### Core loop (v0.6)
1. **Briefing** — patient + *Medikationsplan*; the band = therapeutic window
   („zu wenig = wirkt nicht · zu viel = gefährlich"). Reset: bar pre-filled to a baseline
   just **below** the band (small/fast).
2. **Initial dose** — buttons (niedrig / standard / hoch) set a target; the bar rises into
   the band → patient „eingestellt".
3. **Interaction event(s)** — each a little story:
   - **Setup** (story) → **knowledge question** (buttons) → short **mechanism lesson**.
   - The level begins a **slow drift** toward a danger tape.
   - **Decision** (buttons): the right call halts/reverses the drift in time; wrong/late → it
     keeps going.
4. **Outcome / you can lose**: end **in band** → ✅ win; **over the top tape** → ❌ overdose;
   **below the bottom tape** → ❌ ineffective; hitting a **critical line** → immediate loss.
   Stars by centredness + correct answers. Quick retry.

### Level model (normalized 0–100, the engine)
- **Fixed band** `[55, 70]` (same every scenario). Baseline (reset) ≈ `40`.
  Critical-high `≈ 80` (severe toxic → instant loss). Critical-low `≈ 45` (useless).
- **Dose → base target**: niedrig `≈ 50`, standard `≈ 62`, hoch `≈ 74`.
- **Interaction factor**: multiplies the effective target. Inhibitor (grapefruit) `×1.22`
  (raises), inducer (Johanniskraut) `×0.8` (lowers), DGI poor-metaboliser `×1.3`, etc.
- `target = base_dose × Π(factors)`, clamped. The bar **moves toward target at the slow
  pump rate**. Decisions change `base_dose` or remove a factor → target shifts → drift.
- Outcome evaluated when events resolve + level settles (or instant loss at a critical line).

### Scenario 1 (flagship to build) — „Die Grapefruit-Falle"
Patient **Herr Schmidt, 68 — Simvastatin** (Cholesterin). Textbook CYP3A4 + grapefruit;
relatable; both failure modes.

| step | level effect | German copy |
|---|---|---|
| Briefing | bar at baseline 40 | „Herr Schmidt, 68 – zu hohes Cholesterin. Stell ihn mit **Simvastatin** sicher ein." |
| Dose: **standard** ✓ | target 62 → into band | „Welche Dosis?" [niedrig / **standard** / hoch] → „Im grünen Bereich – gut eingestellt!" |
| Event 🍊 | — | „Herr Schmidt trinkt jeden Morgen ein großes Glas **Grapefruitsaft**." |
| Knowledge Q | — | „Was passiert mit dem Simvastatin-Spiegel?" [**steigt** ✓ / sinkt / bleibt gleich] |
| Lesson | factor ×1.22 → target ≈ 76, bar **drifts up** toward toxic | „Grapefruit hemmt das Abbau-Enzym **CYP3A4** – der Wirkstoff sammelt sich an." |
| Decision | | „Wie reagierst du?" |
| → Dosis reduzieren ✓ | base 50 → 50×1.22 ≈ 61 (band) | win path |
| → Grapefruit weglassen ✓ | factor removed → 62 (band) | win path |
| → nichts ändern ✗ | stays ≈ 76 (toxic) | lose |
| → Dosis erhöhen ✗✗ | 74×1.22 ≈ 90 (critical) | instant lose |
| Outcome ✅ | in band | „Sicher eingestellt! 🎉" + stars |
| Outcome ❌ over | > 70 / critical | „Zu viel Simvastatin → Muskelschäden (Rhabdomyolyse). ⚠️" |
| Outcome ❌ under | < 55 | „Zu wenig Wirkstoff → das Cholesterin bleibt hoch." |
| Wusstest du? | | „Grapefruitsaft kann den Abbau **vieler** Medikamente bremsen – eine echte Nahrungs-Wechselwirkung." |

### Scenario template → the other SafePolyMed scenarios (same engine, new content)
A scenario = `{ patient, drug, Medikationsplan, doseOptions, events:[ { story,
knowledgeQ, factor, lesson, decisions:[{label, Δbase|removeFactor, correct}] } ],
outcomes }`. Then:
- **FDI** — Grapefruit (×1.22 ↑) — *Scenario 1*.
- **Herb/DDI induction** — **Johanniskraut** (×0.8 ↓ → efficacy loss; e.g. „die Pille wirkt
  nicht mehr", or anticoagulant/immunsuppressivum).
- **DGI (Gene)** — *Metabolisierer-Status* (e.g. Codein + CYP2D6: same dose, ×1.3 poor →
  toxic, or ×0.6 ultra-rapid → no effect).
- **DDI / Polymedikation** — a second drug added to the *Medikationsplan* interacts.

### Win/lose & scoring
- **Win** = end inside the band. **Lose** = end out of band, or hit a critical line.
- Loss shows a memorable consequence (Rhabdomyolyse / kein Schutz) + the lesson; easy retry.
- Stars: centredness + correct knowledge answers + correct decision. Optional session
  high-score board for the open day.

### Locked decisions (v0.6)
- **Input = discrete buttons** (dose: niedrig/standard/hoch; decisions: labelled choices).
  **Arcade dosing = optional**: hold-to-fill + stop-in-the-green as an alternative dose
  mechanic (and for the "drain back" correction). Buttons are the inclusive default.
- **Structure = hybrid event pool.** Each interaction is an **authored event**; a play =
  a patient + **1–3 events drawn & shuffled** from the pool, with randomised
  magnitude / answer-order / metaboliser trait. Recognisable beats, never identical.
- **Drift = gentle** (always time to read); you **lose by a wrong choice or a bad final
  level**, not by a clock. (A hard "critical line" still gives an instant dramatic loss.)
- Title/branding: „Dr. Dosis" vs SafePolyMed-branded — TBD.

### Session walkthrough (the full beat list — Herr Schmidt / grapefruit)
0 Start → 1 Briefing (patient + band) → 2 Dosis (buttons *or* arcade fill-stop) →
3 „eine Woche später" → 4 Event (story) → 4a Wissensfrage (+lesson) → 4b slow drift →
5 Reagieren (decision) → 6 Outcome (win / lose). See the table in this section.

### Event-authoring schema (the pool)
```
Event = {
  id, type: 'FDI'|'DDI'|'DGI'|'distractor',
  story,                         // DE setup line(s)
  knowledgeQ: { prompt, options[], correct, lesson },   // optional
  effect: { factor } | { removeFactor } | { none },     // what it does to the level
  decision: { prompt, options:[ { label, apply, correct } ] },
  icon,
}
```
Starter pool:
- `grapefruit` (FDI, ×1.22 ↑) — **flagship/Scenario 1**.
- `johanniskraut` (induction, ×0.8 ↓ → efficacy loss).
- `gene_poor` / `gene_fast` (DGI trait, ×1.3 / ×0.6) — set at briefing, shifts correct dose.
- `second_drug_inhibitor` / `_inducer` (DDI / polymed).
- `apfel` / `wasser` (**distractor**, no effect → correct decision = *nichts ändern*; teaches
  discernment + replay variety).

### Randomness points (replayability)
which event(s) fire · order · magnitude · answer-button order · metaboliser trait ·
patient from a pool · 1 vs 2–3 stacked events (difficulty). Optional session high-score.

### Superseded from v0.5
The hold-to-infuse twitch loop and the „Hilf der Familie" 3-patient arc (§12–§17) are
**replaced** by this decision loop. Reusable as-is: German locale + `t()`, the dark theme,
the screen-routing/flow shell, and the gauge (→ the fixed-band torso bar).

---

## 19. v0.7 — story framework & finale (CURRENT)

Builds on §18 and keeps its engine unchanged (`target = base × Π(factors)`, the **fixed
taped band**, the **slow torso**). This section adds the reusable **story framework**: a
stage system, the **5-band reveal**, **age-adapted copy** (kid/adult on every option,
feedback and instruction), **tactile elements**, a **decision that drives the torso** (three
endings), and a **fruit-identification finale**. §18's level model + accuracy framing still
hold; §19 supersedes its flow. The flagship story **„Die Frühstücks-Falle"** is built; its
authoritative spec is [`docs/stories/fruehstuecks-falle.md`](stories/fruehstuecks-falle.md).

### Design pillars
1. **Transfer knowledge *and* have fun.**
2. **Never invent pharmacology that isn't real.** (Wrong answers are real pitfalls, not fiction.)
3. **The slow pump can't do twitch** → fast play lives **on the screen**; the physical
   torso shows the **settled aftermath**.
4. **A story = data.** Engine + finale are shared; stories 2–6 just fill in content.

### Flow
```
 Intro ──▶ [ Stage ]×N ──▶ Strategy ──▶ Finale ──▶ Debrief
 patient    beat + element   what to do   fruit ID   stars +
 (age copy) + 5-band reveal  (→ torso)    (photos)   „Wusstest du?"
```
> **Full per-story spec (authoritative): [`docs/stories/fruehstuecks-falle.md`](stories/fruehstuecks-falle.md).**

### 1. Intro — patient + age register
Each user string has two registers: **`young`** (warm, concrete — „Herr Schmidt hat zu
viel Fett im Blut") and **`adult`** (precise, real terms — „…nimmt Simvastatin 40 mg gegen
erhöhtes Cholesterin"). Same flow for both; `young` may use fewer/simpler options. Gene
stories set the patient **trait** here. Bar pre-filled to baseline (below band).

### 2. Stages (the middle) — beat + element + reveal
Each stage = **setup beat → one interaction element → effect on level → reveal**.
**Element library** (reusable across stories):
| Element | Player does | Real skill |
|---|---|---|
| `knowledge` | MC: „Was passiert mit dem Spiegel?" | mechanism understanding |
| `planCheck` *(tactile)* | tap the conflicting entry in the *Medikationsplan* | what a pharmacist does |
| `discernment` *(tactile)* | pick which item interacts (Grapefruit/Apfel/Wasser) | discernment / distractor |
| `decision` | what do you do? (reduce/stop/switch/nothing) | clinical decision |
Correct answers/decisions bank **Stabilität** (drives the finale difficulty).

### The 5-band Reveal („the surprise")
The slow bar **creeps** into one of five bands; each shows a patient face + a one-line
consequence. The creep *is* the suspense (you don't know where it stops):
| Band | Range | Reading |
|---|---|---|
| viel zu wenig | `< 45` (critical-low) | wirkt gar nicht |
| zu wenig | `45–55` | wirkt zu schwach |
| 🟢 im Fenster | `55–70` (band) | genau richtig |
| zu viel | `70–80` | Nebenwirkungen drohen |
| viel zu viel | `> 80` (critical-high) | gefährlich → instant loss |
Numbers = §18 defaults, all tunable in the engine/config.

### 3. Strategy — the decision drives the torso (no needle)
The fix is a **`decision`**, and each option **moves the torso to its zone** with feedback
(always say why). There's **no titration mini-game** — for an unpredictable interaction you
wouldn't dose-chase, so the *choice* is the skill. Each option maps to an **outcome**:
- **win** — the real fix → torso back into the band → on to the finale.
- **overdose** — a dangerous move → torso over the critical line → loss.
- **underdose** — a workaround that fails (e.g. *variable* inhibition) → torso under → loss.
- **retry** — a harmless-but-wrong trap → explain + choose again.

**Rule:** *every answer is explained first*; harmless-wrong **retries**, dangerous/failed
moves **lose** (with the real consequence + retry). The taped band is fixed, so the drama is
*which zone you land in* (the 5-band reveal), not a precision input.
*(We tried an on-screen titration „needle" and removed it: titrating around grapefruit is
unrealistic, and it punished the player who picked the right answer.)*

### 4. The fruit finale (the visual closer)
After the **winning fix**, a grid of **6 real fruit photos** (multi-select): *„Welche Früchte können
denselben Ärger machen?"*. Tap every fruit that inhibits CYP3A4, confirm → each tile reveals
its true status + a lesson. Teaches the real nuance: **Grapefruit + Pomelo + Bitterorange**
interact (furanocoumarins); **Orange/Mandarine/Zitrone** don't — it's *not* „all citrus".
- Photos are **downloaded from Wikimedia Commons and bundled** in `frontend/public/fruits/`
  (offline-safe for the kiosk); attribution in `fruits/CREDITS.txt` (mostly CC BY-SA; lemon PD).
- This replaced an earlier „Ramipril / not-all-drugs" epilogue; that nuance survives as a
  debrief line. (Generic shape, reusable: any story can swap in its own 6-item identification.)

### 5. Debrief & scoring
- **Win** = ends in band. **Stars (summed, N/3):** ⭐ in band · ⭐ detective correct first try ·
  ⭐ fruit finale perfect first try.
- **Lose** = ends over (Überdosis) or under (Unterdosiert) → **0 ⭐**, show the *real
  consequence* + the lesson + **quick retry**.
- **„Wusstest du?"** takeaways, age-adapted — adults also get the compound names
  (Bergamottin, 6′,7′-Dihydroxybergamottin).

### Reusable story shape (data — engine + finale are shared)
```
Story = {
  patient + drug + condition,        // + age-register copy (young | adult)
  trait?,                            // gene stories: set at intro (e.g. poor metaboliser ×1.3)
  stages: [ { beat, element, effect } ],   // element ∈ {knowledge, planCheck, discernment, decision}
  strategy: { options:[ { label, feedback, result, adultOnly? } ] },  // result ∈ win|overdose|underdose|retry
  finale?: { fruitGame },            // optional visual closer (6-item identify, with photos)
  debrief: { stars, facts },
}
```
**Per-story finale framing.** Grapefruit/statin = a **decision** (no antidote, no titration).
Other stories can use a real precision/timing mechanic *where it's honest* — e.g. an overdose
story with **antidote-in-time** (paracetamol → N-acetylcystein, best within ~8 h), opioid →
Naloxon, Warfarin → Vitamin K. Pick the mechanic that matches the real medicine.

### Flagship: „Die Frühstücks-Falle" (the blueprint)
The title/icon deliberately don't name grapefruit (no spoiler); the culprit is hidden in a
loaded breakfast and the player must identify it.
| # | Beat | Element | Torso | Reveal / result |
|---|---|---|---|---|
| 0 | **Intro** — Herr Schmidt, 68, Simvastatin (age copy) | — | 40 | Ziel: ins grüne Fenster |
| 1 | **Standarddosis** — one tap (guided tutorial fill) | guided | 40 → 62 | 🟢 im Fenster |
| 2 | **Loaded breakfast** — Joggen, Müsli + Apfel + Birne, Kaffee, Grapefruitsaft | `story` | 62 → 76 ↑ | ⚠️ zu viel |
| 3 | **Detektiv** — „Was war's?" (Apfel/Birne/Kaffee/Grapefruit/Joggen/Müdigkeit) | `discernment` | — | per-item feedback |
| 4 | **Mechanismus** — CYP3A4-Lektion (Apfel/Birne/Kaffee harmlos) | lesson | — | — |
| 5 | **Strategie** — „Wie reagierst du?" (→ torso) | `decision` | per choice (↓) | feedback per choice |
| 6 | **Frucht-Finale** *(win only)* — 6 Fotos: welche Früchte? | multi-select | steady green | „nicht jede Zitrusfrucht" |
| 7 | **Outcome** — ⭐ + „Wusstest du?" (×2) | — | — | win / Überdosis / Unterdosiert |

**Strategy options (beat 5) — each moves the torso:**
- ✅ **Grapefruit weglassen** → 76 → 62 (green) → **WIN** → fruit finale.
- ⚠️ **Dosis senken** *(adults only)* → looks fixed (76→62), then a **Variabilität** beat (the
  grapefruit amount swings) drops him under → **LOSE: Unterdosiert**.
- ❌ **zeitversetzt einnehmen** — *trap* (CYP3A4 block lasts **days**) → explain + **retry**.
- ❌❌ **Dosis erhöhen** → 76 → 90 (critical) → **LOSE: Überdosis**.

**Accuracy (the „don't invent" anchor):** grapefruit inhibits **intestinal CYP3A4** via
furanocoumarins (**bergamottin, 6′,7′-dihydroxybergamottin**) → simvastatin ↑ → myopathy /
rhabdomyolysis; the effect persists **days** and the amount **varies per glass** (so
dose-chasing underdoses). Fix = drop the grapefruit (or switch to a non-CYP3A4 statin,
Pravastatin/Rosuvastatin). **No antidote** → the fix is a *decision*, not a titration.

### Decided defaults (this session — change anytime)
- **Length:** tutorial dose → breakfast → detective → mechanism → strategy → (fruit finale) →
  outcome (~2–3 min).
- **No needle:** the strategy decision moves the torso; **three endings** (win / Überdosis /
  Unterdosiert) + a retry trap. „Dosis senken" → deterministic underdose (variability beat).
- **Fruit finale = all-citrus hard mode:** Grapefruit/Pomelo/Bitterorange interact; Orange/
  Mandarine/Zitrone don't.
- **Numbers:** §18 defaults — band `[55,70]`, baseline `40`, critical `80`/`35`, 5-band
  cutoffs as above.
