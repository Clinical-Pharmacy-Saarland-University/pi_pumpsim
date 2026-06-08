Now I have the exact data shapes and the catalogue order. The catalogue order in `stories.ts` is: grapefruit (1), johanniskraut (2), gene (3), ddi (4), **organ (5)**, adherence (6). The spec's "Story 5 of 6 (`organ`)" is correct; the NAMING fix is about cross-spec consistency, which I'll bake into the header note.

I also confirmed the existing engine uses `DecisionResult = 'win' | 'overdose' | 'underdose' | 'retry'` and that losses are reached via the settling `moveTo` (the controller drives level toward target). I'll align the spec's type names and finale component reuse to the real codebase. Here is the improved full spec.

# Story spec — „Die Nieren-Skala" (DOI · eGFR × Metformin)

> Per-story flow + **torso movement** + kid/adult copy + star logic + loss rules.
> **Story 5 of 6** (`organ`). Catalogue order is fixed in `frontend/src/lib/stories.ts`: **1** grapefruit · **2** johanniskraut · **3** gene · **4** ddi · **5** organ · **6** adherence. (Numbering corrected across all specs to match this `STORIES[]` order — `gene` = Story 3, `ddi` = Story 4, `organ` = Story 5, `adherence` = Story 6; no two specs share a number.)
> Engine model = §18/§19 in `game-design.md`. Status: **DESIGNED — not yet implemented.**
> Unique mechanic = a **read-a-gauge → set-a-dial calibration** (eGFR-Tacho + 3-Stufen-Dosis-Regler). „Standarddosis behalten" = deterministic overdose; „sehr niedrig / aussetzen" = deterministic underdose (see Tunables to randomise / add a 4th notch).

## Meta
- **Patient:** Frau Yilmaz, 74 — Typ-2-Diabetes seit Jahren auf **Metformin**; bei der Kontrolle ist die Nierenfunktion gesunken (**eGFR ≈ 35 ml/min/1,73 m²**).
- **Interaction:** **Drug–Organ-Interaktion (renale Clearance).** Metformin wird **unverändert renal eliminiert** (kein Leber-Metabolismus). Eine schwache Niere scheidet langsamer aus → bei voller Dosis **kumuliert** Metformin → erhöhtes Risiko der seltenen, aber lebensbedrohlichen **Laktatazidose** (MALA — metformin-associated lactic acidosis). Reale Leitlinien-/Label-Schwellen (eGFR in ml/min/1,73 m²): **≥ 60** Standarddosis; **45–59** Standarddosis möglich, Niere überwachen; **30–44** Dosis **reduzieren / deckeln** (max. ~1000 mg/Tag) **+ engmaschiger kontrollieren**, kein Neubeginn; **< 30 kontraindiziert → absetzen.** Der reale Fix bei eGFR ≈ 35: **Dosis reduzieren UND die Niere überwachen** (nicht absetzen, nicht voll weiterdosieren). Dose-Titration nach eGFR ist hier *die* korrekte, leitliniengetreue Handlung — das ist die Lektion.
- **Engine numbers** (normalized 0–100, all tunable): band `[55,70]`, baseline `40`, critical-high `80`, critical-low `35`, dose `standard = 62`. eGFR-Event-Drift Ziel `~82`. Dosis-Stufen-Faktoren (gegen die durch die schwache Niere reduzierte Clearance): `Standard ×1.32` (→ ~82, über 80), `reduziert ×1.00` (→ ~62, Bandmitte), `sehr niedrig ×0.66` (→ ~41, unter Band). „Niere erholt sich von allein" = harmlose Falle (kein Faktor, retry).

## End states (the game only ends here — three distinct endings)
| Outcome | Reached by | Torso | Message |
|---|---|---|---|
| **WIN** | Regler auf **„reduziert"** → stabil im Band | green `~62` | „Sicher dosiert! 🎉 Dosis an die Niere angepasst." |
| **LOSE — Überdosis** | Regler auf **„Standard behalten"** (danger) | critical `~88` | „Metformin staut sich an → Laktatazidose-Risiko." |
| **LOSE — Unterdosiert** | Regler auf **„sehr niedrig" / aussetzen** | drops `~41` (under) | „Zu wenig Metformin – der Blutzucker entgleist." |

> **Loss is reached via the settling move (verified against story 1's pattern):** every notch confirm calls `api.setTarget(62 × factor)`; the backend's slow `moveTo` then drifts the level, and the frontend's `onLevel` handler trips `finishOutcome` when the level crosses a critical line **during the settling phase** (settling IS a play phase). „Standard behalten" → target `~88`, level crosses crit-high `80` mid-drift → instant Überdosis loss. „sehr niedrig" → target `~41`, level settles under band `55` (above crit-low `35`) → Unterdosis loss evaluated when the move settles. „reduziert" → target `62`, level drifts back into band → WIN. No new ending mechanism — reuses the exact `result → moveTo → onLevel/settle → finishOutcome` chain from story 1. (`DecisionResult` already = `'win' | 'overdose' | 'underdose' | 'retry'` in `events.ts`; reuse it verbatim.)

## Loss / retry rule (decided)
- **Jede Reglerstellung wird zuerst erklärt** — richtig: *„genau, weil…"*; falsch: *„nein, weil…"*.
- **Harmless-wrong → explain + retry** (Detektiv-Fehltipps; die „Niere erholt sich von allein"-Falle; Finale-Fehler).
- **„Standard behalten" → explain + LOSE (Überdosis)** — volle Dosis bei schwacher Niere → Kumulation über `80`.
- **„sehr niedrig / aussetzen" → explain + LOSE (Unterdosiert)** — überkorrigiert, der Spiegel fällt unter das Band; Blutzucker steigt. Teaches *warum nicht einfach absetzen*.
- **„reduziert" → WIN.** Retry wird nach jedem Verlust angeboten.

## Star logic (decided) — summed, shown N/3 (0 on any loss)
- ⭐ **Überlebt** — im grünen Band geendet (nur der „reduziert"-Pfad).
- ⭐ **Schlau** — Detektiv-Frage **beim ersten Versuch** richtig (keine Fehltipps).
- ⭐ **Profi** — der Dosis-Regler **beim ersten Versuch** auf „reduziert" (kein Verlust, kein Retry); **und** das Finale komplett richtig beim ersten Versuch.

## Flow & torso movement
| # | Beat | Player action | Torso (from→to) | Branch |
|---|---|---|---|---|
| 0 | Briefing | — | `40` (below band) | → 1 |
| 1 | Standarddosis | tap „Standarddosis geben" | `40 → 62` (into green) | → 2 |
| 2 | Der Laborwert | „Weiter" (event fires) | `62 → ~82` (slow drift up) | → 3 |
| 3 | Detektiv | pick the cause | — | right → 4 · wrong → explain+retry |
| 4 | Mechanismus | „Weiter" | — | → 5 |
| 5 | Strategie = **die Nieren-Skala** | read gauge, set dial | see below | branches |
| 6 | Finale *(win path only)* | **eGFR → Dosis zuordnen** | **steady green** | → 7 |
| 7 | Outcome | — | (stays) | end |

**Beat 5 branches (torso reacts to each dial notch, all via the settling `moveTo`):**
| Dial notch | Torso | Result |
|---|---|---|
| ✅ **reduziert** | `~82 → 62` (green, drifts back down) | → Finale → **WIN** |
| ❌❌ **Standard behalten** (danger) | `~82 → ~88` (crosses crit-high `80` mid-drift) | explain + **LOSE (Überdosis)** |
| ❌ **sehr niedrig / aussetzen** | `~82 → ~41` (settles under band) | explain + **LOSE (Unterdosiert)** |
| ❌ **„Niere erholt sich von allein" (mehr trinken, gleiche Dosis)** *(trap)* | stays `~82` | explain + **retry** |

> The trap is a **separate tap target below the dial** („Ich lass die Dosis – die Niere erholt sich schon"), not a dial notch, so it can't be confused with a calibration step. The dial itself has exactly **three snap-notches** (Standard / reduziert / sehr niedrig).

**Torso during the finale:** it **holds steady in the green band** (Frau Yilmaz ist sicher) and may glow gently green. The finale is a *forward-looking knowledge check* („welche Dosis passt zu welcher Niere?") — deliberately decoupled from the level, no movement.

---

## The unique mechanic — „Die Nieren-Skala" (read-a-gauge → set-a-dial)

> **Archetype:** continuous **read-the-value-then-set-the-control** calibration. The only calibration mechanic in the set. The player reads a live **eGFR-Tacho** (half-circle gauge) and sets a **Dosis-Regler** (3-notch snap dial) into the matching zone. Gauge and dial are **visually coupled**: the gauge's coloured zone the needle sits in can **highlight the matching dial notch** (halo) — see the coupling rule for the decided per-register behaviour.

**Screen layout (beat 5):**
1. **eGFR-Tacho** (top): an SVG half-circle, 0 → 90+ ml/min, three coloured zones — **rot < 30**, **gelb 30–44**, **grün ≥ 45** — with a needle resting in **gelb at ~35** (Frau Yilmaz's value). A small numeric readout: „eGFR 35 ml/min". The needle does a short settle-animation on entry (drops from ~90 to 35) so the player *sees* the kidney getting weaker. Display-only (no touch).
2. **Dosis-Regler** (below, the interactive control): a horizontal track with **three snap-notches**, large touch targets, left→right = **„sehr niedrig" · „reduziert" · „Standard"**. **Interaction model (decided): the dial degrades to tap-a-notch as the kiosk default** — tapping a notch selects + snaps to it; **pointer-drag is a progressive enhancement** (drag the handle, it snaps to the nearest notch on release). Touch-only audiences and the Pi kiosk get the reliable tap path; no interaction depends on a successful drag. The currently selected notch shows its mg label and a one-line consequence preview *only after* confirm (no spoilers while selecting). A **„Dosis geben"** confirm button locks the choice.
3. **Trap button** (small, below the dial): „Dosis lassen, mehr trinken – die Niere erholt sich".

**Coupling rule (the teaching visual) — decided per register:** the gauge zone the needle is in (here **gelb**) lights up. The **halo hint on the matching dial notch** („reduziert") is **ON for `young`** (the answer pulses as a learning scaffold) and **OFF for `adult`** (adults must read-and-decide — no pre-highlighted answer, so the calibration is a real choice). Wrong notches are **never blocked** in either register — the player can still choose them and learn from the loss.

**Data shape (proposed, `frontend/src/lib/events.ts` + `stories.ts`):** reuse the existing `Choice` type for the three notches (it already carries `result: DecisionResult` and `adultOnly?`), and add a small renal-dial wrapper. This keeps the strategy beat on the same `choices[] → result → setTarget` pipeline as story 1.
```ts
// reused engine: target = DOSE.standard × factor, then api.setTarget → backend slow moveTo
// `result` reuses the existing DecisionResult union: 'win' | 'overdose' | 'underdose' | 'retry'
type DialNotch = Choice & {        // Choice: { id, labelKey, feedbackKey, correct, result, adultOnly? }
  notch: 'standard' | 'reduced' | 'low';
  mgKey: string;                   // locale key, e.g. "2× 500 mg / Tag"
  factor: number;                  // ×1.32 | ×1.00 | ×0.66 (vs. weak-kidney clearance)
};
type RenalDialEvent = {
  id: 'metformin_egfr';
  egfr: 35;                        // needle value (ml/min)
  zones: [{lo:0,hi:30,color:'red'}, {lo:30,hi:45,color:'yellow'}, {lo:45,hi:120,color:'green'}];
  correctNotch: 'reduced';         // lit-zone → notch map (for ⭐Profi check + young halo)
  haloByRegister: { young: true; adult: false };   // decided coupling default
  notches: DialNotch[];            // standard (overdose), reduced (win), low (underdose, adultOnly)
  trapKey: 'kidney_recovers';      // separate tap target, not a notch → result:'retry'
};
```

**What's correct:** at eGFR ≈ 35 (gelbe Zone, 30–44) the only winning notch is **„reduziert"**. „Standard" = overdose loss; „sehr niedrig/aussetzen" = underdose loss; the „Niere erholt sich"-trap = retry.

**Scoring:** ⭐ **Profi** requires the dial set to **„reduziert" on the first confirm** (no prior wrong confirm, no trap tap) **and** a clean finale. Any wrong confirm clears the Profi star for this run even if the retry then wins (consistent with story 1's „first try" stars).

**How the torso reacts:** on confirm, the frontend sets `target = 62 × notch.factor` → `api.setTarget(target)` → the backend's slow `moveTo` drifts the level. „reduziert" pulls `~82 → 62` (visible drift back *down* into green — the satisfying „I fixed it" beat). „Standard" pushes `~82 → ~88` (over `80` → Überdosis loss as the level crosses the critical line **during the settling move**). „sehr niedrig" pulls `~82 → ~41` (down through the band to under `55`, settling above crit-low `35` → Unterdosis loss on settle). The trap leaves `target` unchanged → torso holds at `~82`, then the explain+retry returns the player to the dial.

---

## Copy — kid (`young`) / adult (`adult`)
> Every option, feedback line and instruction has both registers. Kids = warm/concrete; adults = precise + real terms. For `young` the dial is **simplified to 2 visible notches** (reduziert / Standard) plus the trap — the „sehr niedrig"-underdose notch is **hidden** for kids (`adultOnly: true`; adults see all three notches + trap). The gauge stays for both, but kids get the colour story („Tacho ist im Gelben") rather than the number, and the **halo hint is ON for kids, OFF for adults**.

### 0 · Briefing
- **Patient** — young: „Frau Yilmaz, 74. Sie hat Zucker-Krankheit (Diabetes) und nimmt jeden Tag dieselbe Medizin dagegen." · adult: „Frau Yilmaz, 74 – Typ-2-Diabetes, seit Jahren stabil auf Metformin in gewohnter Dosis."
- **Ziel** — young: „Hilf Frau Yilmaz! Bring den Spiegel in den grünen Bereich – nicht zu wenig, nicht zu viel." · adult: „Stell Frau Yilmaz mit Metformin sicher ein – der Spiegel soll im grünen Fenster bleiben, auch wenn sich etwas ändert."

### 1 · Standarddosis (tutorial fill)
- **Prompt** — young: „Gib Frau Yilmaz ihre normale Dosis. Schau, wie der Spiegel langsam in den grünen Bereich steigt!" · adult: „Frau Yilmaz wird auf ihre Standarddosis Metformin eingestellt."
- **Button:** „Standarddosis geben"
- **Reveal (🟢):** young: „Genau richtig – im grünen Bereich! Genau da soll sie bleiben." · adult: „Im therapeutischen Fenster – gut eingestellt."

### 2 · Der Laborwert (the event)
- **Story** — young: „Monatelang läuft alles gut. Doch beim Arzt-Check zeigt das Blut: Frau Yilmaz' Nieren sind müder geworden. Und langsam steigt der Spiegel…" · adult: „Über Monate stabil. Bei der Routinekontrolle ist die Nierenfunktion gefallen: **eGFR 35 ml/min** (vorher normal). Der Spiegel beginnt langsam zu steigen."
- **Visual:** der eGFR-Tacho erscheint und der Zeiger **fällt sichtbar** von grün in die gelbe Zone (~35); der Torso **driftet langsam nach oben** Richtung `~82`.
- **Reveal (⚠️):** young: „Oh – zu viel! Irgendetwas staut sich an." · adult: „Zu viel – der Spiegel ist über das grüne Fenster gestiegen, Metformin kumuliert."

### 3 · Detektiv
- **Prompt** — young: „Detektiv-Frage: Warum staut sich die Medizin jetzt an?" · adult: „Warum steigt der Metformin-Spiegel, obwohl die Dosis gleich blieb?"
- **Options:** 🫘 Die Nieren sind schwächer geworden ✓ · 🍞 Sie isst zu viele Kohlenhydrate · 💊 Die Tabletten sind zu stark · 🏃 Zu wenig Bewegung · 💧 Sie trinkt zu wenig · 🌡️ Sie hat Fieber
- **Feedback**
  - Nieren schwächer ✓ — young: „Richtig! Die Nieren waschen die Medizin aus dem Körper. Sind sie müde, bleibt mehr drin." · adult: „Korrekt – die renale Clearance ist gesunken (eGFR ↓), Metformin wird langsamer ausgeschieden und kumuliert."
  - Kohlenhydrate — young: „Nein – Essen verändert hier nicht, wie viel Medizin im Körper bleibt." · adult: „Nein – die Kohlenhydratzufuhr beeinflusst die Metformin-Elimination nicht."
  - Tabletten zu stark — young: „Nein – es sind dieselben Tabletten wie immer." · adult: „Nein – die Dosis ist unverändert; geändert hat sich die Ausscheidung."
  - Zu wenig Bewegung — young: „Nein – Bewegung ist gut, aber nicht der Grund." · adult: „Nein – körperliche Aktivität verändert die renale Clearance nicht relevant."
  - Trinkt zu wenig — young: „Nein – mehr trinken macht müde Nieren nicht wieder jung." · adult: „Nein – Flüssigkeit allein hebt eine chronisch reduzierte eGFR nicht an."
  - Fieber — young: „Nein – Fieber ist hier nicht das Problem." · adult: „Nein – akute Faktoren spielen hier keine Rolle; der eGFR-Wert ist chronisch gesunken."

### 4 · Mechanismus (lesson)
- young: „Stell dir die Niere wie eine Pumpe vor, die die Medizin wieder aus dem Körper rauswäscht. Ist die Pumpe müde, schafft sie weniger – dann muss weniger rein. Also: schwache Niere = kleinere Dosis." · adult: „Metformin wird **unverändert über die Nieren ausgeschieden**. Sinkt die eGFR, sinkt die Clearance → Metformin kumuliert → Risiko der **Laktatazidose**. Konsequenz: **Dosis an die eGFR anpassen** (reduzieren), nicht stur weiterdosieren."

### 5 · Strategie = die Nieren-Skala (decision — torso reacts)
- **Prompt** — young: „Der Tacho zeigt: die Niere ist im **gelben** Bereich – nur halbe Kraft. Stell den Regler auf die passende Dosis!" · adult: „Der eGFR-Tacho steht bei **35 ml/min (gelbe Zone, 30–44)**. Stell den Dosis-Regler passend ein und gib die Dosis."
- **Dial notch — ✅ reduziert** — young: „Genau – weniger Medizin, weil die Niere weniger schafft. Der Spiegel kommt zurück in den grünen Bereich!" · adult: „Richtig – bei eGFR 30–44 wird die Dosis **reduziert/gedeckelt UND die Niere überwacht**. Der Spiegel normalisiert sich. Leitliniengetreu."
- **Dial notch — ❌❌ Standard behalten** *(danger → LOSE Überdosis)* — young: „Gefährlich! Die müde Niere schafft die volle Menge nicht – jetzt staut es sich richtig an." · adult: „Gefährlich – volle Dosis bei reduzierter Clearance → Kumulation → toxischer Spiegel, **Laktatazidose-Risiko**."
- **Dial notch — ❌ sehr niedrig / aussetzen** *(adults only → LOSE Unterdosiert)* — young: *(versteckt)* · adult: „Zu stark gesenkt bzw. abgesetzt – jetzt ist zu wenig da. Der **Blutzucker entgleist**. (Absetzen wäre erst bei eGFR < 30 nötig.)"
- **Trap — ❌ „Niere erholt sich von allein" (mehr trinken, gleiche Dosis)** *(trap → retry)* — young: „Bringt leider nichts – müde Nieren werden vom Trinken nicht wieder jung. Die Dosis muss runter. Versuch's nochmal." · adult: „Wirkungslos – eine chronisch reduzierte eGFR kommt nicht von allein zurück; mehr Flüssigkeit ersetzt keine Dosisanpassung. Nochmal."

### 6 · Finale *(win path only — torso steady green)* — „eGFR → Dosis zuordnen"
> **Component reuse (decided):** the finale uses the **same assign-to-bin / drag-or-tap matcher component as `ddi` and `gene`** (three cards → three target fields). Do **not** build a third bespoke matcher — story 1's fruit multi-select grid is *not* reused here; this is the shared bin-assignment widget. Tap-to-assign is the kiosk default; drag is the enhancement (same degrade-to-tap rule as the dial).
- **Prompt** — young: „Letzte Aufgabe: Welche Dosis passt zu welcher Niere? Zieh jede Niere auf das richtige Feld." · adult: „Ordne jede eGFR-Stufe der korrekten Metformin-Maßnahme zu."
- **Pairs (correct mapping):**
  - 🟢 **eGFR ≥ 60** → **Standarddosis** *(young: „starke Niere → normale Dosis")*
  - 🟡 **eGFR 30–44** → **Dosis reduzieren / deckeln + Niere überwachen** *(young: „halbe Kraft → weniger Dosis")*
  - 🔴 **eGFR < 30** → **Metformin absetzen (kontraindiziert)** *(young: „Niere zu schwach → Pause / andere Medizin")*
- **Feedback:** correct „Perfekt – alle richtig zugeordnet!" · wrong „Nicht ganz – schau dir die Auflösung an."
- **Lesson** — young: „Je müder die Niere, desto weniger Dosis – und ganz schwach heißt: Pause und mit dem Arzt eine andere Medizin finden." · adult: „eGFR ≥ 60 Standard · 45–59 möglich mit Überwachung · 30–44 reduzieren/deckeln · < 30 kontraindiziert. **Die Niere steuert die Dosis.**"

### 7 · Outcome / Debrief (three endings)
- **WIN** — young: „Sicher dosiert! 🎉 Du hast die Dosis an die müde Niere angepasst." · adult: „Sicher dosiert – Dosis an die eGFR angepasst (reduziert + überwacht), Frau Yilmaz liegt im therapeutischen Fenster."
- **LOSE — Überdosis** — young: „Zu viel! Die müde Niere konnte die volle Menge nicht ausscheiden." · adult: „Überdosis: volle Dosis bei reduzierter renaler Clearance → Kumulation → Laktatazidose-Risiko."
- **LOSE — Unterdosiert** — young: „Jetzt zu wenig – der Zucker im Blut steigt wieder." · adult: „Unterdosiert: zu stark reduziert/abgesetzt → Wirkspiegel zu niedrig → Blutzucker entgleist. Absetzen erst bei eGFR < 30."
- **Debrief facts (both shown):**
  1. young: „Die Nieren waschen die Medizin aus dem Körper. Müde Nieren = weniger Dosis." · adult: „Metformin wird unverändert renal eliminiert; sinkt die eGFR, muss die Dosis sinken (Kumulation → Laktatazidose)."
  2. young: „Bei jeder Medizin gilt: erst die Niere checken, dann die Dosis wählen." · adult: „eGFR ist eine reale Steuergröße der Dosierung: ≥ 60 Standard · 30–44 reduzieren + überwachen · < 30 absetzen."

---

## Accuracy notes (real drug + real interaction — no invention)
- **Metformin** ist orales Antidiabetikum der **ersten Wahl** bei Typ-2-Diabetes (Deutschland/DDG, EASD/ADA) und wird **unverändert renal eliminiert** (vernachlässigbarer hepatischer Metabolismus, keine relevante Plasmaproteinbindung) → die Niere bestimmt die Elimination. Korrekt.
- **eGFR-Schwellen** (ml/min/1,73 m²) entsprechen Fachinformation/EMA-Empfehlungen: **≥ 60** keine Anpassung; **45–59** fortführbar, Niere überwachen, Risikofaktoren beachten; **30–44** Dosis reduzieren (Tageshöchstdosis ca. 1000 mg) **+ häufigere Kontrollen**, **kein Neubeginn**; **< 30 kontraindiziert** → absetzen. Bei eGFR ≈ 35 ist **Reduzieren + Überwachen** (nicht absetzen, nicht voll weiter) die richtige, leitliniengetreue Handlung. *(Reviewer-bestätigt: Schwellen entsprechen aktueller EMA/FI-Leitlinie; „reduzieren" bei 35 korrekt; Monitoring ist Teil der realen Maßnahme und steht in der WIN-/Adult-Copy.)*
- **Laktatazidose** ist die reale, seltene aber lebensbedrohliche Komplikation der Metformin-**Akkumulation** bei eingeschränkter Niere (MALA — metformin-associated lactic acidosis). Korrekt — keine erfundene Komplikation, kein erfundenes Gegenmittel.
- **Wrong answers are real-world pitfalls:** „volle Dosis weiter" (häufiger Fehler, der MALA begünstigt), „einfach absetzen" (überkorrigiert → Hyperglykämie; Absetzen ist erst < 30 indiziert), „mehr trinken, Niere erholt sich" (verbreiteter Laien-Irrglaube — chronische Niereninsuffizienz bildet sich nicht durch Trinken zurück; bewusst als harmlose Falle gewählt). Keine Fiktion.
- **Vereinfachungen (bewusst, nicht falsch):** der normalisierte 0–100-Spiegel und die Faktoren sind ein didaktisches Modell des Plasmaspiegels, keine echten mg/L; die eGFR ist auf einen festen Wert (35) gesetzt; die 45–59-„Überwachen"-Stufe ist im Hauptspiel zusammengefasst und erscheint nur im Finale als eigene Nuance. **Pharmakologisch nichts erfunden.**

## Assets
- **eGFR-Tacho:** animiertes SVG-Halbkreis-Gauge — drei Farbzonen (rot < 30, gelb 30–44, grün ≥ 45), Skala 0–90+, Zeiger mit Settle-Animation, numerischer Readout „35 ml/min". Inline-SVG, kein Bild nötig (konsistent mit dem On-Screen-Torso). Touch-frei (nur Anzeige).
- **Dosis-Regler:** 3-Notch-Snap-Dial. **Kiosk-Default = Tap-a-Notch** (Tippen wählt + rastet ein); Pointer-Drag ist optionale Verbesserung (rastet beim Loslassen auf die nächste Notch). Große Touch-Ziele, Snap-Animation, **Halo-Hinweis auf der korrekten Notch nur für `young`** (für `adult` aus). Inline-SVG/HTML.
- **Detektiv-Icons:** 🫘 (Niere/Bohne) · 🍞 · 💊 · 🏃 · 💧 · 🌡️ (Emoji, wie Story 1).
- **Finale:** **dieselbe Zuordnungs-Komponente wie `ddi`/`gene`** (drei eGFR-Karten grün/gelb/rot + drei Maßnahmen-Felder, Drag/Tap-to-assign, Tap = Default). Reine Typo/Farbe — keine Fotos nötig, kein neuer Matcher.
- **Optional (CC):** Metformin-Blisterfoto von **Wikimedia Commons** (CC-BY/CC0) für das Briefing; ein stilisiertes Nieren-Icon. Nicht erforderlich.
- **Neuer Patienteneintrag:** Frau Yilmaz (Alter 74, Diabetes) in `events.ts` (`PATIENTS[]`) + Story-Karte in `stories.ts`; Copy in `locale.svelte.ts`.

## Tunables (for feel)
- Drift/settle speed = die langsame Pumpenrate in `backend/app/game/controller.py` (`rate`). Der Event-Drift `62 → ~82` ist die Spannung — langsam genug, dass der Spieler die Niere-Skala in Ruhe liest.
- `factor` je Notch (`1.32 / 1.00 / 0.66`) bestimmt, wie weit Über-/Unterdosis gehen. Standard auf `~88` (deutlich über 80 → klarer Überdosis-Verlust beim Settling-Move); „sehr niedrig" auf `~41` (unter 55, über crit-low 35 → klar unterdosiert ohne sofortigen crit-low-Trigger).
- eGFR-Event-Ziel `~82`: knapp über das Band, damit „reduziert" den Spiegel sichtbar **zurück nach unten** ins Band zieht (das befriedigende „repariert"-Gefühl).
- **Decided (war Open #2):** Halo-Hinweis auf der korrekten Notch **an für `young`, aus für `adult`** — so müssen Erwachsene wirklich ablesen-und-entscheiden (Reviewer-Fix: sonst ist der WIN für Erwachsene trivial vorgehighlightet).
- **Open #1:** „sehr niedrig" deterministisch (current spec) vs. eine **echte Dosis-Slider-Variante** (kontinuierlich 0–100 % statt 3 Notches; WIN-Fenster z. B. 40–70 % der Standarddosis) — präziser am Kalibrier-Archetyp, aber schwieriger für Kinder.
- **Open #2:** eGFR fest auf 35 vs. **randomisiert** (z. B. 32 / 38 / 41) pro Run → Wiederspielwert, aber das Finale lehrt die Schwellen ohnehin schon.