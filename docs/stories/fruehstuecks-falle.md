# Story spec — „Die Frühstücks-Falle" (FDI · Grapefruit × Simvastatin)

> Per-story flow + **torso movement** + kid/adult copy + star logic + loss rules.
> This is the **sign-off spec** and the template for stories 2–6. Engine model = §18/§19
> in `game-design.md`. Status: **IMPLEMENTED & verified** (all three endings + trap-retry,
> kid/adult, compounds). „Dosis senken" = deterministic underdose (see Tunables to randomise).

## Meta
- **Patient:** Herr Schmidt, 68 — erhöhtes Cholesterin → **Simvastatin**.
- **Interaction:** grapefruit juice inhibits **intestinal CYP3A4** → simvastatin ↑ →
  myopathy/rhabdomyolysis. The inhibitors are **furanocoumarins — bergamottin &
  6',7'-dihydroxybergamottin (DHB)**. Effect lasts **days**, and the amount varies per glass
  → the inhibition is **unpredictable**. Real fix: **drop the grapefruit** (or switch to a
  non-CYP3A4 statin). Dose-titration is *not* the real-world move — that's the lesson.
- **Engine numbers** (normalized 0–100, all tunable): band `[55,70]`, baseline `40`,
  critical-high `80`, critical-low `35`, dose `standard = 62`, grapefruit factor `×1.22`.

## End states (the game only ends here — three distinct endings)
| Outcome | Reached by | Torso | Message |
|---|---|---|---|
| **WIN** | „Grapefruit weglassen" → stable in band | green `~62` | „Sicher eingestellt! 🎉" |
| **LOSE — Überdosis** | „Dosis erhöhen" (danger) | critical `90` | „Zu viel Simvastatin → Muskelschäden (Rhabdomyolyse)." |
| **LOSE — Unterdosiert** | „Dosis senken" → variable grapefruit | drops `~50` (under) | „Mit gesenkter Dosis + schwankender Grapefruit fällt der Spiegel zu tief — Cholesterin bleibt hoch." |

## Loss / retry rule (decided)
- **Every answer is explained first** — right: *„genau, weil…"*; wrong: *„nein, weil…"*.
- **Harmless-wrong → explain + retry** (detective; the „zeitversetzt" trap; fruit-finale mistakes).
- **„Dosis erhöhen" → explain + LOSE (Überdosis).**
- **„Dosis senken" → a short variability beat → LOSE (Unterdosiert)** — it *looks* fixed, then
  the swinging grapefruit amount drops him under the window. Teaches *why* we don't dose-chase.
- **„Grapefruit weglassen" → WIN.** Retry offered on every loss.

## Star logic (decided) — summed, shown N/3 (0 on any loss)
- ⭐ **Überlebt** — ended in the green band (only the „weglassen" path).
- ⭐ **Schlau** — detective correct **first try** (no wrong taps).
- ⭐ **Profi** — fruit finale fully correct **first try**.
> (We dropped „chose the best fix" as a star — since only „weglassen" wins, it's implied.)

## Flow & torso movement
| # | Beat | Player action | Torso (from→to) | Branch |
|---|---|---|---|---|
| 0 | Briefing | — | `40` (below band) | → 1 |
| 1 | Standarddosis | tap „Standarddosis geben" | `40 → 62` (into green) | → 2 |
| 2 | Das Frühstück | „Weiter" (interaction fires) | `62 → 76` (drift up) | → 3 |
| 3 | Detektiv | pick the culprit | — | right → 4 · wrong → explain+retry |
| 4 | Mechanismus | „Weiter" | — | → 5 |
| 5 | Strategie | pick the fix | see below | branches |
| 5b | *(senken only)* Variabilität | „Weiter" | `62 → ~50` (wobbles, then under) | → Outcome (Unterdosiert) |
| 6 | Frucht-Finale *(win path only)* | multi-select fruits | **steady green** | → 7 |
| 7 | Outcome | — | (stays) | end |

**Beat 5 branches (torso reacts to each):**
| Choice | Torso | Result |
|---|---|---|
| ✅ Grapefruit weglassen | `76 → 62` (green) | → Frucht-Finale → **WIN** |
| ⚠️ Dosis senken | `76 → 62`, then 5b wobble `→ ~50` | → **LOSE (Unterdosiert)** |
| ❌ zeitversetzt einnehmen (trap) | stays `76` | explain + **retry** |
| ❌❌ Dosis erhöhen (danger) | `76 → 90` (critical) | explain + **LOSE (Überdosis)** |

**Torso during the fruit finale (point 2):** it **holds steady in the green band** (patient is
safe) and may glow gently green. The fruit round is a *forward-looking knowledge check*
(„welche Früchte sind sonst noch tückisch?") — deliberately decoupled from the level, no
movement. (Alternative if you want it livelier: a hypothetical „was-wäre-wenn"-bump when you
tap a culprit — say the word.)

---

## Copy — kid (`young`) / adult (`adult`)
> Every option, feedback line and instruction has both registers. Kids = warm/concrete;
> adults = precise + real terms. For `young` the nuanced **„Dosis senken"** option is **hidden**
> (kids see 3 choices: weglassen / zeitversetzt / erhöhen); adults see all 4.

### 0 · Briefing
- **Patient** — young: „Herr Schmidt, 68 – sein Blut hat zu viel Fett (Cholesterin)." ·
  adult: „Herr Schmidt, 68 – erhöhtes Cholesterin (Hypercholesterinämie)."
- **Ziel** — young: „Hilf Herrn Schmidt! Bring den Spiegel in den grünen Bereich – nicht zu
  wenig, nicht zu viel." · adult: „Stell Herrn Schmidt mit Simvastatin sicher ein – der
  Spiegel soll im grünen Fenster liegen."

### 1 · Standarddosis (tutorial fill)
- **Prompt** — young: „Gib Herrn Schmidt seine normale Dosis Simvastatin. Schau, wie der
  Spiegel langsam in den grünen Bereich steigt!" · adult: „Herr Schmidt wird auf die
  Standarddosis Simvastatin eingestellt."
- **Button:** „Standarddosis geben"
- **Reveal (🟢):** young: „Genau richtig – im grünen Bereich! Genau da soll er bleiben." ·
  adult: „Im therapeutischen Fenster – gut eingestellt."

### 2 · Das Frühstück (the trap)
- **Story** — young: „Wochenlang läuft alles super! 🎉 Doch eines Morgens, nach dem Joggen,
  frühstückt Herr Schmidt so richtig: Müsli mit Apfel und Birne, ein Kaffee – und ein großes
  Glas Grapefruitsaft." · adult: „Über Wochen stabil eingestellt. Eines Morgens, nach dem
  Joggen, frühstückt er ausgiebig: Müsli mit Apfel und Birne, ein Kaffee und ein großes Glas
  Grapefruitsaft."
- **Reveal (⚠️):** young: „Oh – zu viel! Irgendetwas hat den Spiegel steigen lassen." ·
  adult: „Zu viel – der Spiegel ist über das grüne Fenster gestiegen."

### 3 · Detektiv
- **Prompt** — young: „Detektiv-Frage: Was hat den Spiegel steigen lassen?" · adult: „Was
  hat den Wirkstoff-Spiegel steigen lassen?"
- **Options:** 🍎 Apfel · 🍐 Birne · ☕ Kaffee · 🍊 Grapefruit ✓ · 🏃 Joggen · 😴 Müde von der Arbeit
- **Feedback**
  - Grapefruit ✓ — young: „Richtig erkannt – die Grapefruit war's!" · adult: „Korrekt – der Grapefruitsaft."
  - Apfel/Birne — young: „Nein – Obst wie Apfel und Birne ist harmlos. Denk an die Grapefruit!" · adult: „Nein – Apfel/Birne beeinflussen den Abbau nicht."
  - Kaffee — young: „Nein – Kaffee macht hier keinen Ärger." · adult: „Nein – Kaffee ist hier unkritisch."
  - Joggen — young: „Nein – Joggen ist sogar gut fürs Herz!" · adult: „Nein – körperliche Aktivität ist nicht das Problem."
  - Müdigkeit — young: „Nein – Müdigkeit verändert den Spiegel nicht." · adult: „Nein – Müdigkeit hat keinen Einfluss auf den Spiegel."

### 4 · Mechanismus (lesson)
- young: „Die Grapefruit bremst das „Aufräum-Enzym" CYP3A4. Dann wird Simvastatin langsamer
  abgebaut und es wird zu viel. Apfel, Birne und Kaffee sind harmlos."
- adult: „Grapefruit hemmt CYP3A4 in der Darmwand – Simvastatin kumuliert, der Spiegel (und
  das Muskelschaden-Risiko) steigt. Apfel, Birne und Kaffee tun das nicht."

### 5 · Strategie (decision — torso reacts)
- **Prompt** — young: „Was tust du jetzt?" · adult: „Wie reagierst du?"
- ✅ **Grapefruit weglassen** — young: „Genau – ohne Grapefruit sinkt der Spiegel wieder. Der
  sauberste Weg!" · adult: „Richtig – Grapefruit absetzen; das Enzym erholt sich, der Spiegel
  normalisiert sich. Bevorzugte Lösung."
- ⚠️ **Dosis senken** *(adults only → leads to 5b)* — young: *(hidden)* · adult: „Senkt den
  Spiegel zwar … aber Vorsicht – die Grapefruit-Menge schwankt."
- ❌ **Zeitversetzt einnehmen** *(trap → retry)* — young: „Bringt leider nichts – die
  Grapefruit wirkt noch tagelang nach. Versuch's nochmal." · adult: „Wirkungslos – die
  CYP3A4-Hemmung hält Tage an; zeitlicher Abstand hilft nicht. Nochmal."
- ❌❌ **Dosis erhöhen** *(danger → LOSE Überdosis)* — young: „Gefährlich! Noch mehr Wirkstoff –
  jetzt wird es giftig für die Muskeln." · adult: „Gefährlich – mehr Substrat bei gehemmtem
  Abbau → toxischer Spiegel, Rhabdomyolyse-Risiko."

### 5b · Variabilität *(only after „Dosis senken")*
- **Story** — adult: „Im Wochenverlauf trinkt Herr Schmidt mal ein großes, mal ein kleines
  Glas Grapefruit – mal gar keins. Die Hemmung schwankt also – und mit der fest reduzierten
  Dosis schwankt der Spiegel mit." *(torso wobbles, then settles **under** the band)*
- **Reveal (🔻 zu wenig):** adult: „Jetzt zu wenig – der Spiegel ist unter das Fenster
  gefallen."

### 6 · Frucht-Finale *(win path only — torso steady green)*
- **Prompt** — young: „Welche dieser Früchte sind tricky fürs Medikament? Tippe alle an." ·
  adult: „Welche dieser Früchte hemmen den Abbau (CYP3A4)? Wähle alle aus."
  *(Grapefruit is itself a correct answer — so the prompt asks „which of these", not „like grapefruit".)*
- **Interagieren ✓:** Grapefruit · Pomelo · Bitterorange — **harmlos:** Orange · Mandarine · Zitrone
- **Feedback:** correct „Perfekt – alle richtig erkannt!" · wrong „Nicht ganz – schau dir die Auflösung an."
- **Lesson** — young: „Grapefruit, Pomelo und Bitterorange bremsen das Enzym – Orange,
  Mandarine und Zitrone nicht. Also nicht „jede Zitrusfrucht"!" · adult: „Grapefruit, Pomelo
  und Bitterorange enthalten die Furanocumarine **Bergamottin** und
  **6',7'-Dihydroxybergamottin**, die CYP3A4 hemmen; Süßorange, Mandarine und Zitrone praktisch nicht."

### 7 · Outcome / Debrief (three endings)
- **WIN** — young: „Sicher eingestellt! 🎉 Herr Schmidt ist im grünen Bereich." · adult:
  „Sicher eingestellt – Herr Schmidt liegt im therapeutischen Fenster."
- **LOSE — Überdosis** — young: „Zu viel! Das kann die Muskeln schädigen." · adult: „Überdosis →
  Muskelschäden (Rhabdomyolyse)."
- **LOSE — Unterdosiert** — young: „Mal mehr, mal weniger Grapefruit – jetzt ist zu wenig
  Wirkstoff da." · adult: „Unterdosiert: schwankende Grapefruit-Menge → schwankende Hemmung →
  Spiegel unter dem Fenster. Cholesterin bleibt unkontrolliert. Deshalb: Grapefruit weglassen."
- **Debrief facts (both shown):**
  1. young: „Grapefruit bremst den Abbau (CYP3A4) – dann wird das Statin zu viel." · adult:
     „Grapefruit hemmt CYP3A4 → Simvastatin ↑ → Muskelschäden. Wirkstoffe: Furanocumarine
     (Bergamottin, 6',7'-Dihydroxybergamottin)."
  2. young: „Und: nicht jede Frucht macht das – nur Grapefruit, Pomelo & Bitterorange." ·
     adult: „Und: nur CYP3A4-Substrate sind betroffen; „Zitrus" allein sagt nichts."

---

## Tunables (for feel)
- Drift/settle speed = the slow pump rate in `backend/app/game/controller.py` (`rate`).
- `factor` 1.22 sets how far „zu viel" goes (62→~76). Raise toward critical for more drama.
- 5b underdose target (`~50`) sets how clearly the underdose reads (below `55`, above crit-low `35`).
- **Open:** make „Dosis senken" a *deterministic* underdose loss (current spec) vs a *random*
  „sometimes it works" (more true-to-life unpredictability, less reliable teaching).
