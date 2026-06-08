I'll apply the reviewer fixes to the spec. Let me work through each one carefully, especially the accuracy corrections.

The key changes I'm making:
1. **ACCURACY (PM factor)**: Lower PM ×0.71→×0.6 (~44→~37), just above crit-low 35, matching "kaum Morphin / wirkt nicht"
2. **ACCURACY (UM demo)**: Cap the UM educational demo fill at 79 (under crit-high 80) with a separate "this would be toxic" visual flag, so the demo doesn't trip onLevel() auto-outcome; confirm the demo runs in a non-PLAY phase
3. **BUILDABILITY**: Specify exact `moveTo(baseline)→moveTo(resultLevel)` call sequence instead of `api.reset()`
4. **SCOPING**: Auto-resolve the NM twin, merge the finale match into the demo, trim to 2 real decisions (PM, UM)
5. **COPY**: Note the young-register option-set intent
6. Keep the tramadol non-solution prominent (good, keep)

Here is the improved full markdown:

```markdown
# Story spec — „Drei Zwillinge, eine Pille" (DGI · CYP2D6 × Codein)

> Per-story flow + **torso movement** + kid/adult copy + star logic + loss rules.
> Story 3 of 6 (the **DGI / pharmacogenetics** archetype). Engine model = §18/§19 in
> `game-design.md`. Template = `fruehstuecks-falle.md`. Status: **DESIGN — ready to implement.**
> **Unique mechanic:** a **Predict-and-Sort Triptychon** — the SAME pill is dropped on three
> genotype-twins; the player sorts each twin into a *predicted* outcome bin („zu wenig / genau
> richtig / zu viel"), then a sequential one-pill-three-results torso demo confirms or corrects
> **and locks in the matching „was hilft" measure for each twin** (the finale match is folded into
> this resolution to protect the 2–3 min time budget).

## Meta
- **Patient:** **Drei Geschwister** („Zwillinge", äußerlich gleich), je mit Zahnschmerzen nach
  einem kleinen Eingriff. Jedes hat ein anderes **CYP2D6**-Gen:
  🐢 **langsam** (Poor Metabolizer, PM) · ✅ **normal** (Extensive/Normal Metabolizer, EM/NM) ·
  🐇 **ultraschnell** (Ultra-rapid Metabolizer, UM). Alle drei bekommen **GENAU DIESELBE**
  Codein-Tablette in derselben Dosis.
- **Drug:** **Codein** — ein **Prodrug** (Analgetikum). Es wird vom Enzym **CYP2D6** per
  **O-Demethylierung** in das eigentlich wirksame **Morphin** umgewandelt. Codein selbst wirkt
  kaum; die Wirkung kommt vom gebildeten Morphin.
- **Interaction (DGI — drug–gene):** **derselbe Stoff, dieselbe Dosis, anderes Gen → anderes
  Ergebnis.**
  - **Poor Metabolizer** (z. B. **CYP2D6\*4/\*4**, ~7 % der Europäer): bilden **praktisch kein
    Morphin** → **keine Schmerzlinderung**. *Dosis erhöhen hilft nicht* — es fehlt das Enzym,
    nicht die Dosis.
  - **Ultra-rapid Metabolizer** (Gen-**Duplikation \*1xN**): bilden **zu viel Morphin** →
    **Atemdepression** (kann lebensgefährlich sein).
  - Real fix für PM/UM: auf ein **nicht-CYP2D6-aktiviertes Analgetikum** ausweichen (z. B.
    **Ibuprofen / Paracetamol**) — **NICHT** die Codein-Dosis verstellen, und **NICHT Tramadol**
    (auch CYP2D6-abhängig). Das ist der **CPIC-Leitlinien**-Schritt und die Basis der
    **EMA-2013-Beschränkung** und der **FDA-Boxed-Warning**.
- **Engine numbers** (normalized 0–100, all tunable): band `[55,70]`, baseline `40`,
  critical-high `80`, critical-low `35`. **Genotyp als Faktor** auf die Standard-Codeindosis
  (Substrat-Soll `62`):
  - 🐢 PM **×0.60** → `~37` (knapp über critical-low `35`, sichtbar fast leer — „kaum Morphin /
    wirkt nicht") · ✅ NM **×1.00** → `~62` (im Band) · 🐇 UM **×1.37** → echter Effekt `~85`
    (über critical-high `80` = toxisch), **in der Lehr-Demo aber auf `79` gedeckelt** (siehe
    Beat 2-Demo + Tunables: der Demo-Fill darf das Auto-Outcome nicht auslösen; „zu viel/toxisch"
    wird über ein separates rotes Flag gezeigt, nicht über das Überschreiten der Linie).

> **Why PM dropped from `~44` to `~37`:** a CYP2D6 poor metabolizer forms **essentially no**
> active morphine from codeine — the result is „basically nothing", not „~70 % of normal effect".
> `~37` sits just above critical-low `35`, so the bar reads visibly near-empty and matches the
> copy „kaum Morphin / wirkt nicht". (`44` was correctly *under-band*, so the outcome was right,
> but the number read as „most of the way there".)

## End states (the game only ends here — three distinct endings)
| Outcome | Reached by | Torso | Message |
|---|---|---|---|
| **WIN** | beide problematischen Zwillinge (🐢+🐇) mit dem **Nicht-CYP2D6-Analgetikum** versorgt (✅ NM braucht keine Aktion und wird automatisch aufgelöst) → alle drei ruhen im Band | green, all three `~62` | „Alle drei sicher — du hast nach dem Gen gewählt! 🎉" |
| **LOSE — Überdosis** | beim Ultraschnellen bleibt es bei Codein **oder** dessen Codein-Dosis wird **erhöht** | critical `~92` (über `80`) | „Ultraschnell + Codein → zu viel Morphin → Atemdepression." |
| **LOSE — Unterdosiert** | beim Langsamen bleibt es bei Codein **oder** dessen Codein-Dosis wird **erhöht** | drops/holds `~37` (unter `55`) | „Langsam + Codein → kein Morphin → keine Schmerzlinderung. Dosis hoch ändert nichts — es fehlt das Enzym." |

## Loss / retry rule (decided)
- **Every answer is explained first** — right: *„genau, weil…"*; wrong: *„nein, weil…"*.
- **Sort-Phase (Vorhersage) = harmlos** — eine falsche Einsortierung ist **immer** „explain +
  retry": die Auflösung erklärt *warum* (siehe Fallen unten), die Karte springt zurück, neu
  sortieren. Kein Spielende in der Sort-Phase. (Sie ist eine Vorhersage, kein Behandlungsfehler.)
- **Strategie-Phase (Behandlung) = entscheidet das Ende:**
  - 🐢/🐇 → **richtiges Nicht-CYP2D6-Analgetikum** → ihr Spiegel fährt ins Band → **WIN-Pfad.**
  - 🐢/🐇 → **„Codein-Dosis erhöhen" (Falle/Gefahr):** beim Langsamen **explain + LOSE
    (Unterdosiert)** (Enzym fehlt, nicht Dosis); beim Ultraschnellen **explain + LOSE
    (Überdosis)** (noch mehr Morphin).
  - 🐢/🐇 → **„bei Codein bleiben"** → der falsche Spiegel hält → **LOSE** (Unter- bzw. Überdosis).
  - ✅ NM braucht **keine** Umstellung und wird **automatisch** aufgelöst (kein Behandlungs-Beat
    für NM) — „Codein in normaler Dosis ist hier korrekt" wird nur als Auflösungs-Text gezeigt.
- **WIN** = beide problematischen Zwillinge mit dem richtigen Alternativ-Analgetikum versorgt.
  Retry offered on every loss.

## Star logic (decided) — summed, shown N/3 (0 on any loss)
- ⭐ **Vorhersager** — alle drei Zwillinge **beim ersten Versuch** richtig einsortiert (keine
  falsche Einsortierung).
- ⭐ **Schlau** — beim ersten problematischen Zwilling **sofort** das Nicht-CYP2D6-Analgetikum
  gewählt (nie „Dosis erhöhen" / „bei Codein bleiben" angetippt).
- ⭐ **Profi** — Lauf komplett ohne Falle/Verlust beendet (alle drei im Band, keine Retries in
  der Strategie-Phase).

## Flow & torso movement
> **Trimmed for the walk-up time budget (~2–3 min):** the player makes **two real decisions**
> (🐢 PM, 🐇 UM). The NM twin **auto-resolves** (it needs no action — see tunables), and the old
> standalone finale match is **folded into the Triptychon-Demo** (each twin's „was hilft" is
> locked in at the moment its result is revealed). So the beats are: **Sort (predict) → Demo
> (resolve + lock-in measure) → Mechanism → 2 Strategy decisions → Outcome.**
>
> Torso ist **sequenziell, eine Pille → drei Ergebnisse**; **zwischen den Zwillingen Rücksetzen
> auf baseline `40`** (jeder Zwilling startet frisch). Das macht den Vergleich sichtbar: gleiche
> Pille, drei verschiedene Endstände. Drei kleine **MiniBars** stehen die ganze Zeit
> nebeneinander und merken sich das Ergebnis jedes Zwillings (großer Torso spielt es nacheinander
> vor).

| # | Beat | Phase kind | Player action | Torso (from→to) | Branch |
|---|---|---|---|---|---|
| 0 | Briefing | settling/non-interactive | — | `40` (below band) | → 1 |
| 1 | Die drei Zwillinge | settling/non-interactive | „Weiter" (Gen-Badges 🐢✅🐇 aufdecken) | `40` (hält) | → 2 |
| 2a | Predict-and-Sort | interactive (no auto-outcome) | jeden Zwilling in einen Bin sortieren | — (keine Bewegung; reine Vorhersage) | alle 3 platziert → 2b · falsch → explain+retry |
| 2b | Triptychon-Demo (Auflösung + „was hilft" lock-in) | **settling/non-interactive — NOT in PLAY_PHASES** | „Weiter" pro Zwilling | sequenziell, je von `40`: 🐢→`~37` · ✅→`~62` · 🐇→`79` (gedeckelt, rotes „toxisch"-Flag) | → 3 |
| 3 | Mechanismus | settling/non-interactive | „Weiter" | (steht beim letzten Stand) | → 4 |
| 4 | Strategie 🐢 (langsam) | **interactive (PLAY) — auto-outcome active** | Behandlung wählen | see below | branches |
| 5 | Strategie 🐇 (ultraschnell) | **interactive (PLAY) — auto-outcome active** | Behandlung wählen | see below | branches |
| 6 | Outcome | end | — | alle drei `~62` (oder Verlust-Stand) | end |

> **Phase-kind invariant (critical for the UM demo).** The torso's auto-outcome (`onLevel()` →
> instant loss when level ≥ critical-high `80`) fires **only in PLAY_PHASES**. Beat **2b
> (Triptychon-Demo) is a settling/non-interactive phase, NOT in PLAY_PHASES**, so even the
> *capped* UM demo fill cannot end the game. As a belt-and-braces second guard, the UM **demo**
> fill is capped at **`79`** (under `80`) and „zu viel/toxisch" is conveyed by a **separate red
> overlay flag**, not by crossing the line. The full toxic level `~85`/`~92` only appears in the
> **Strategy/loss** beats (4–5), where ending the game is the intended behavior.

**Beat 2b — Triptychon-Demo (the „aha", torso reacts per twin; folds in the finale match):**
Großer Torso wird **vor jedem Zwilling auf `40` zurückgesetzt** und fährt dann zum Genotyp-Stand;
die jeweilige MiniBar friert das Ergebnis ein. **In demselben Reveal wird die zugehörige Maßnahme
(„was hilft") fest verknüpft** — bei 🐢 und 🐇 das Nicht-CYP2D6-Analgetikum, bei ✅ „Codein normal
ist ok" —, sodass kein separater Match-Beat mehr nötig ist.
| Zwilling | Faktor | Torso in der Demo (from→to) | Zone / Flag | „was hilft" (lock-in) | Lese-Botschaft |
|---|---|---|---|---|---|
| 🐢 langsam (PM) | ×0.60 | `40 → ~37` | unter critical-low-nahe / „leer"-Flag | anderes Analgetikum (kein CYP2D6) | „kaum Morphin — wirkt nicht" |
| ✅ normal (NM) | ×1.00 | `40 → ~62` | grünes Band | Codein normal ist ok (kein Beat) | „genau richtig" |
| 🐇 ultraschnell (UM) | ×1.37 (real `~85`) | `40 → 79` **(Demo gedeckelt)** | knapp unter `80` + **rotes „toxisch"-Flag** | anderes Analgetikum (kein CYP2D6) | „so viel Morphin wäre **über** der roten Linie — gefährlich" |

> **Exact call sequence for the demo (per twin) — use the WS-driven settle, NOT `api.reset()`.**
> `api.reset()` resets to **baseline `42`** (not `40`) and also resets the rate, so it would break
> the „identical start" comparison. Instead **chain `moveTo()` like the existing standard-dose
> fill / drift settling pattern:**
> ```
> for (twin of [pm, nm, um]) {
>   await moveTo(40);                 // explicit baseline reset (settle to 40, NOT api.reset())
>   await moveTo(twin.demoLevel);     // pm:37 · nm:62 · um:79 (capped)
>   miniBar[twin.id].freeze(twin.demoLevel);
>   lockInMeasure(twin.id);           // fold-in of the old finale match
>   // show reveal copy + (for UM) the red „toxisch"-Flag overlay
> }
> ```
> `moveTo(x)` is the existing `setTarget(x)` + WS settle helper already used for the
> standard-dose fill and the grapefruit drift. `demoLevel` ≠ `resultLevel` only for UM
> (demo `79`, real result `85`).

**Beat 4/5 branches (torso reacts to each — these ARE PLAY phases, so crossing `80` ends the game):**
| Zwilling | Choice | Torso | Result |
|---|---|---|---|
| 🐢 langsam | ✅ Nicht-CYP2D6-Analgetikum (Ibuprofen/Paracetamol) | `~37 → 62` (steigt ins Band) | → **WIN-Pfad** |
| 🐢 langsam | ⚠️ Codein-Dosis erhöhen (Falle) | hält `~37` (kein Morphin trotz mehr Codein) | explain + **LOSE (Unterdosiert)** |
| 🐢 langsam | ❌ bei Codein bleiben | hält `~37` (unter Band) | explain + **LOSE (Unterdosiert)** |
| 🐇 ultraschnell | ✅ Nicht-CYP2D6-Analgetikum | startet vom echten `~85` → `62` (sinkt ins Band) | → **WIN-Pfad** |
| 🐇 ultraschnell | ❌❌ Codein-Dosis erhöhen (Gefahr) | `~85 → ~92` (tiefer in kritisch) | explain + **LOSE (Überdosis)** |
| 🐇 ultraschnell | ❌ bei Codein bleiben | hält `~85` (über `80`) | explain + **LOSE (Überdosis)** |

> Note: in the **Strategy** beat the UM twin's level is the **real `~85`** (the demo cap of `79`
> applied only to the educational Beat 2b). Here crossing `80` and the resulting loss are
> intended.

**During the win path:** sobald beide problematischen Zwillinge versorgt sind, stehen alle drei
MiniBars **ruhig im grünen Band** und dürfen sanft grün glühen → direkt zum Outcome (kein
separater Match-Beat mehr; der Wissens-Check „Gen → Ergebnis → Maßnahme" wurde in die Demo
verlegt).

---

## Copy — kid (`young`) / adult (`adult`)
> Every option, feedback line and instruction has both registers. Kids = warm/concrete; adults =
> precise + real terms. Für `young` heißen die Bins **„zu wenig / genau richtig / zu viel"** mit
> Tier-Bildern (🐢🟢🐇); Erwachsene sehen zusätzlich die Fachbegriffe (PM/NM/UM).
>
> **Young-register option-set note (intended).** Wie in Story 1 (dort wird „Dosis senken" für
> `young` versteckt) blendet `young` nuancierte Optionen aus, **außer** wenn eine Option eine
> *klare Gefahr* ist und gerade deshalb lehrreich. „**Codein-Dosis erhöhen**" wird daher in beiden
> Strategie-Beats **auch dem `young`-Register gezeigt** — das ist Absicht: es ist eine eindeutige,
> greifbare Falle/Gefahr („mehr hilft nicht / mehr ist gefährlich"), kein subtiler Titrationsschritt.

### 0 · Briefing
- **Patient** — young: „Drei Geschwister haben Zahnweh. Sie sehen gleich aus – aber tief in
  ihnen tickt ein kleiner Helfer unterschiedlich schnell." · adult: „Drei Geschwister mit akuten
  Schmerzen nach einem kleinen Eingriff. Äußerlich gleich – aber jeder hat einen anderen
  **CYP2D6-Metabolisierertyp**."
- **Ziel** — young: „Sorge dafür, dass alle drei sicher im grünen Bereich landen – nicht zu
  wenig, nicht zu viel." · adult: „Stelle alle drei sicher ein. Achtung: gleiche Tablette,
  gleiche Dosis – das Gen entscheidet über das Ergebnis."

### 1 · Die drei Zwillinge (setup + same-dose framing)
- **Story** — young: „Jeder bekommt GENAU DIESELBE Tablette: Codein gegen die Schmerzen. Aber
  schau – einer baut sie **langsam** ab (🐢), einer **normal** (✅), einer **viel zu schnell**
  (🐇)." · adult: „Alle drei erhalten **dieselbe Codein-Dosis**. Codein ist ein **Prodrug** –
  es muss vom Enzym **CYP2D6** erst zu **Morphin** umgebaut werden. 🐢 Poor · ✅ Normal · 🐇
  Ultra-rapid Metabolizer."
- **Button:** „Weiter"

### 2a · Predict-and-Sort (the unique mechanic — instruction)
- **Prompt** — young: „Rate vorher! Zieh jeden ins richtige Fach: **zu wenig**, **genau
  richtig** oder **zu viel** Schmerzmittel." · adult: „**Vorhersage:** Ordne jeden Genotyp dem
  erwarteten Ergebnis zu – **zu wenig / im Fenster / zu viel** Morphin."
- **Bins** — young: „🟦 zu wenig" · „🟩 genau richtig" · „🟥 zu viel" · adult: „Unterdosis
  (PM)" · „Therapeutisch (NM)" · „Überdosis (UM)"
- **Feedback (per sort)**
  - 🐢 → „zu wenig" ✓ — young: „Richtig! Der Langsame baut kaum Morphin – also zu wenig." ·
    adult: „Korrekt – PM bilden kaum Morphin → subtherapeutisch."
  - ✅ → „genau richtig" ✓ — young: „Genau – der Normale landet im Grünen." · adult: „Korrekt –
    NM erreichen das therapeutische Fenster."
  - 🐇 → „zu viel" ✓ — young: „Richtig! Der Schnelle macht zu viel Morphin – gefährlich." ·
    adult: „Korrekt – UM bilden zu viel Morphin → Überdosis-Risiko."
- **Feedback (the harmless traps → explain + retry):**
  - 🐇 fälschlich in „zu wenig" („schnell = schnell weg") — young: „Aufgepasst – schnell heißt
    hier **mehr** Morphin, nicht weniger! Der Schnelle baut die Pille schneller **in** das starke
    Morphin um. Versuch's nochmal." · adult: „Nein – UM bedeutet **schnellere Aktivierung** des
    Prodrugs → **mehr** Morphin, nicht weniger. Nochmal."
  - 🐢 fälschlich in „zu viel" — young: „Nein – der **Langsame** baut kaum um, ihm fehlt das
    Morphin. Das ist *zu wenig*." · adult: „Nein – PM bilden **kaum** Morphin → *zu wenig*, nicht
    zu viel."
  - andere Vertauschung — young: „Noch nicht – schau aufs Tier: 🐢 langsam = zu wenig, 🐇 schnell
    = zu viel." · adult: „Nicht ganz – PM = zu wenig, NM = richtig, UM = zu viel."

### 2b · Triptychon-Demo / Auflösung (one pill, three results — torso reacts; folds in „was hilft")
- **Prompt** — young: „Jetzt schau zu: dieselbe Pille bei jedem – und der Spiegel landet jedes
  Mal woanders! Merk dir gleich, **was jedem hilft**." · adult: „Auflösung – identische Dosis,
  drei Spiegel; pro Zwilling wird die passende **Maßnahme** mitgezeigt:"
- **Per twin reveal (with locked-in measure)**
  - 🐢 (`40→~37`) — young: „🐢 Langsam: fast **kein** Morphin – der Spiegel bleibt ganz unten.
    Wirkt nicht. → **Er braucht ein anderes Schmerzmittel.**" · adult: „PM: praktisch keine
    Morphin-Bildung – **subtherapeutisch** (klar unter dem Fenster). → **Maßnahme:
    nicht-CYP2D6-aktiviertes Analgetikum.**"
  - ✅ (`40→~62`) — young: „✅ Normal: genau im Grünen. Passt – **Codein normal ist hier okay.**" ·
    adult: „NM: im therapeutischen Fenster – **Codein in normaler Dosis ist korrekt** (keine
    Umstellung nötig)."
  - 🐇 (`40→79`, **rotes „toxisch"-Flag**) — young: „🐇 Schnell: **so viel** Morphin – das wäre
    **über** der roten Linie! Gefährlich für die Atmung. → **Er braucht ein anderes
    Schmerzmittel.**" · adult: „UM: exzessive Morphin-Bildung – der echte Spiegel läge **über**
    critical-high → Atemdepressionsrisiko (in der Demo gedeckelt + rot markiert). → **Maßnahme:
    nicht-CYP2D6-aktiviertes Analgetikum.**"

### 3 · Mechanismus (lesson — exactly one concept)
- young: „Das ist der ganze Trick: **gleiche Pille, gleiche Dosis – andere Gene, anderes
  Ergebnis.** Man kann es am Gen **vorhersagen**. Beim Langsamen und beim Schnellen darf man
  **nicht an der Codein-Dosis drehen** – man nimmt ein **anderes** Schmerzmittel." · adult:
  „**Codein ist ein Prodrug; der CYP2D6-Metabolisierertyp entscheidet über die Wirkung.** Gleiche
  Dosis → bei PM zu wenig, bei UM zu viel Morphin. Die Lösung ist **nicht** Dosistitration,
  sondern bei PM/UM ein **nicht-CYP2D6-aktiviertes Analgetikum** (z. B. Ibuprofen/Paracetamol).
  **Tramadol ist keine Alternative** – ebenfalls CYP2D6-abhängig."

### 4 · Strategie 🐢 langsam (decision — torso reacts)
- **Prompt** — young: „Der Langsame hat noch Schmerzen – was tust du?" · adult: „PM,
  subtherapeutisch – wie behandelst du?"
- ✅ **Anderes Schmerzmittel (Ibuprofen/Paracetamol)** — young: „Genau! Ein Mittel, das **kein**
  CYP2D6 braucht – wirkt bei ihm zuverlässig." · adult: „Richtig – nicht-CYP2D6-aktiviertes
  Analgetikum; wirkt unabhängig vom Genotyp."
- ⚠️ **Codein-Dosis erhöhen** *(Falle → LOSE Unterdosiert)* — young: „Bringt nichts! Ihm fehlt
  das **Enzym**, nicht die Dosis – mehr Pille = trotzdem kein Morphin." · adult: „Wirkungslos –
  bei fehlendem CYP2D6 entsteht auch aus mehr Codein **kein** Morphin. (Und mehr unverstoffwechseltes
  Codein bringt eigene Risiken.)"
- ❌ **Bei Codein bleiben** *(→ LOSE Unterdosiert)* — young: „Dann bleibt der Spiegel zu tief –
  er hat weiter Schmerzen." · adult: „Subtherapeutisch – keine Analgesie."

### 5 · Strategie 🐇 ultraschnell (decision — torso reacts)
- **Prompt** — young: „Der Schnelle hat viel zu viel Morphin – was tust du?" · adult: „UM,
  toxischer Spiegel – wie behandelst du?"
- ✅ **Anderes Schmerzmittel (Ibuprofen/Paracetamol)** — young: „Genau! Weg vom Codein – ein
  Mittel, das **kein** CYP2D6 braucht. Sicher." · adult: „Richtig – Codein absetzen,
  nicht-CYP2D6-aktiviertes Analgetikum; vermeidet die Morphin-Überproduktion."
- ❌❌ **Codein-Dosis erhöhen** *(Gefahr → LOSE Überdosis)* — young: „Gefährlich! Noch mehr
  Morphin – jetzt wird die Atmung bedroht." · adult: „Gefährlich – noch mehr Substrat → noch mehr
  Morphin → Atemdepression."
- ❌ **Bei Codein bleiben** *(→ LOSE Überdosis)* — young: „Dann bleibt es zu viel – die Atmung
  ist in Gefahr." · adult: „Bleibt toxisch – Atemdepressionsrisiko."

### 6 · Outcome / Debrief (three endings)
- **WIN** — young: „Geschafft! Alle drei sind sicher im Grünen – weil du nach dem **Gen**
  entschieden hast, nicht nach der Dosis. 🎉" · adult: „Alle drei therapeutisch versorgt –
  genotyp-geleitete Auswahl statt Dosistitration."
- **LOSE — Überdosis** — young: „Beim Schnellen war es zu viel Morphin – das bedroht die Atmung." ·
  adult: „UM + Codein → exzessives Morphin → Atemdepression. Lösung: nicht-CYP2D6-aktiviertes
  Analgetikum."
- **LOSE — Unterdosiert** — young: „Beim Langsamen kam kein Morphin an – mehr Pille ändert das
  nicht, ihm fehlt das Enzym." · adult: „PM + Codein → kein wirksames Morphin → keine Analgesie.
  Dosiserhöhung wirkungslos (Enzymmangel). Lösung: anderes Analgetikum."
- **Debrief facts (both shown):**
  1. young: „Codein muss im Körper erst zu Morphin umgebaut werden – das macht das Enzym CYP2D6.
     Wie schnell, steht im Gen." · adult: „Codein ist ein Prodrug; **CYP2D6** aktiviert es per
     **O-Demethylierung** zu Morphin. Der Metabolisierertyp (PM/NM/UM) bestimmt die Wirkung."
  2. young: „Gleiche Pille, andere Gene → anderes Ergebnis. Darum kennt man das Gen und wählt
     **danach** das Schmerzmittel. **Tramadol zählt übrigens nicht** – das braucht auch CYP2D6!" ·
     adult: „Reale Grundlage: **EMA-2013-Beschränkung** & **FDA-Boxed-Warning** (kindliche
     Todesfälle, Säugling über Muttermilch einer UM-Mutter, Koren et al., *Lancet* 2006).
     **CPIC**: bei PM/UM auf ein nicht-CYP2D6-Analgetikum ausweichen – **nicht Tramadol**."

---

## The unique mechanic — Predict-and-Sort Triptychon (full implementable detail)

**Core idea.** One identical pill, three genotype-twins, three divergent outcomes shown **side by
side**. The player's verb is **predict-by-sorting-into-bins**, then a **sequential one-pill →
three-results** torso demo confirms or corrects **and locks in each twin's „was hilft" measure**.
This is the only mechanic in the game that puts *identical input → divergent output* on screen
simultaneously — the ideal visual for pharmacogenetics.

**Two phases.**
1. **Sort (prediction).** Three twin cards (🐢/✅/🐇) and three bins („zu wenig / genau richtig /
   zu viel"). The player places each twin. **No torso movement** — this is a guess.
2. **Demo (resolution + measure lock-in).** The torso plays each twin's result in turn (settle to
   `40`, then to the genotype demo level), MiniBars freeze the three end states, and the matching
   **measure** („anderes Analgetikum" for 🐢/🐇, „Codein ok" for ✅) is shown and locked in. This
   replaces the old standalone finale match. **This phase is NOT in PLAY_PHASES** (no auto-outcome),
   and the UM fill is **capped at `79`** with a red „toxisch" flag.

**Interaction model (touch-first, with graceful degrade).**
- **Primary:** drag a twin card onto a bin (`drag`/`drop`).
- **Degrade (for touch reliability on the Pi):** **tap-card-then-tap-bin** — tap a twin to
  select (it lifts/highlights), tap a bin to drop it there. Identical data + scoring; this is the
  reliable path and should be the default on the kiosk.
- A twin can be re-sorted before confirming; „Auflösen" button is enabled once all three are
  placed.

**Data shape** (in `frontend/src/lib/events.ts`, alongside the existing event pool):
```ts
type Genotype = 'pm' | 'nm' | 'um';
type Bin = 'low' | 'in' | 'high';

interface GeneTwin {
  id: Genotype;
  badge: '🐢' | '✅' | '🐇';
  labelYoung: string;        // „langsam" | „normal" | „schnell"
  labelAdult: string;        // „Poor (PM)" | „Normal (NM)" | „Ultra-rapid (UM)"
  factor: number;            // 0.60 | 1.00 | 1.37  → result = doseBase(62) × factor
  correctBin: Bin;           // 'low' | 'in' | 'high'
  resultLevel: number;       // ~37 | ~62 | ~85  (real settled level, used in Strategy/loss)
  demoLevel: number;         // ~37 | ~62 | 79    (educational demo fill; UM capped under 80)
  toxicFlag: boolean;        // true for UM → show red „toxisch" overlay instead of crossing 80
  autoResolve: boolean;      // true for NM → no Strategy beat, resolved automatically
  treatment: {
    win: 'altAnalgesic';     // non-CYP2D6 analgesic (Ibuprofen/Paracetamol)
    trap: 'raiseDose';       // raise codeine dose → lose (PM=under, UM=over)
    stay: 'keepCodeine';     // keep codeine → lose
    needsSwitch: boolean;    // pm:true, nm:false, um:true
  };
  // copy keys → locale.svelte.ts (sort feedback, demo reveal, strategy options)
}
```
Suggested values:
```ts
const TWINS: GeneTwin[] = [
  { id:'pm', badge:'🐢', factor:0.60, correctBin:'low',  resultLevel:37, demoLevel:37, toxicFlag:false, autoResolve:false, treatment:{ needsSwitch:true,  ... } },
  { id:'nm', badge:'✅', factor:1.00, correctBin:'in',   resultLevel:62, demoLevel:62, toxicFlag:false, autoResolve:true,  treatment:{ needsSwitch:false, ... } },
  { id:'um', badge:'🐇', factor:1.37, correctBin:'high', resultLevel:85, demoLevel:79, toxicFlag:true,  autoResolve:false, treatment:{ needsSwitch:true,  ... } },
];
```

**What's correct.**
- **Sort phase:** 🐢→`low`, ✅→`in`, 🐇→`high`. The one *signature wrong answer* is 🐇→`low`
  („schnell = schnell weg"), which gets a dedicated correction line (faster activation → **more**
  morphine).
- **Strategy phase:** for 🐢 and 🐇 the **only** winning choice is the **non-CYP2D6 analgesic**.
  „Dosis erhöhen" and „bei Codein bleiben" both lose (PM→Unterdosis, UM→Überdosis). ✅
  **auto-resolves** (no Strategy beat; Codein normal dose is fine).
- **Measure lock-in (folded-in finale):** at reveal time each twin's Genotyp→Effekt→Maßnahme
  triple is bound — PM and UM → „anderes Analgetikum", NM → „Codein ok". No separate match beat.

**Scoring (feeds the stars).**
- `predictorPerfect` = all three sorted correctly **with zero wrong placements** → ⭐ Vorhersager.
- `wiseFirstTry` = the **first** problematic twin (PM or UM) treated with the alt-analgesic
  **without** ever tapping „Dosis erhöhen"/„bei Codein bleiben" → ⭐ Schlau.
- `flawless` = whole run finished with **no** strategy-phase loss/retry (all three end in band) →
  ⭐ Profi.

**How the torso reacts.**
- Sort phase: **no movement** (prediction only).
- Demo phase (Beat 2b, **non-PLAY**): per twin, `moveTo(40)` then `moveTo(demoLevel)` — **never
  `api.reset()`** (that goes to baseline `42` and resets the rate, breaking the identical-start
  comparison). The matching **MiniBar** freezes that twin's level; the UM fill stops at `79` and
  shows the red „toxisch" flag.
- Strategy phase (Beats 4–5, **PLAY**, auto-outcome active): the active twin's level animates per
  the branch table from its **real** `resultLevel` (PM `37→62` on win; UM `85→62` on win; loss
  paths hold or push deeper into the red — UM-raise → `~92`).
- Win path: all three MiniBars hold steady in the green band (safe), gentle green glow allowed →
  straight to Outcome.

**Reuse notes (implementation).** Genotype = a **factor multiplier** in the existing
`target = base × Π(factors)` model (story 1 already does this with the grapefruit ×1.22). The
three mini-bars **reuse `MiniBar.svelte`** (render three instances). The sequential playback
**reuses `moveTo()`/settling chaining** already used for the standard-dose fill and the drift
(`moveTo(40)` → `moveTo(demoLevel)` per twin; do **not** call `api.reset()` here). Drag-to-bin
**degrades to tap-card-then-tap-bin** for touch reliability — ship the tap path as default on the
kiosk. The folded-in measure lock-in needs **no extra screen** — it is rendered inside the Demo
reveal.

---

## Accuracy (real drug + real interaction — no invention)
- **Codein is a prodrug.** Analgesia comes from **morphine**, formed by **CYP2D6-mediated
  O-demethylation** of codeine. Codeine itself has low intrinsic μ-opioid affinity. ✔
- **Poor Metabolizers** (e.g. **CYP2D6\*4/\*4**; ~7 % of Europeans, with broad population
  variation) form **essentially no** morphine → **inadequate analgesia** („basically nothing",
  not a partial effect — hence the demo level `~37`, near critical-low, not `~44`). Increasing the
  codeine dose does **not** restore efficacy — the activating enzyme is absent. ✔
- **Ultra-rapid Metabolizers** (CYP2D6 gene **duplication \*1xN**) form excess morphine →
  **respiratory depression / toxicity**. ✔ *(The educational demo caps the visual at `79` and
  flags „toxisch" in red so it doesn't trip the auto-loss before the player reaches the strategy
  beats; the real toxic level `~85`/`~92` applies in the strategy/loss beats.)*
- **Real-world evidence:** documented **child deaths** after tonsillectomy/adenoidectomy in UM
  children; a breastfed neonate's morphine toxicity from an **ultra-rapid-metabolizer mother**
  (**Koren et al., *Lancet* 2006**). Basis of the **EMA 2013** restriction (codeine
  contraindicated <12 y, restricted to 12–18, contraindicated in known/suspected UM and in
  breastfeeding) and the **FDA boxed warning**. ✔
- **Correct clinical move = guideline-true.** Per **CPIC** (CYP2D6/codeine guideline): for
  **PM and UM**, use a **non-CYP2D6-activated analgesic** (e.g. ibuprofen, paracetamol/morphine
  as appropriate) — **avoid tramadol** (also CYP2D6-dependent). The game's win is exactly this:
  *switch the analgesic, don't re-dose the codeine.* ✔
- **No invented effects.** Every wrong answer is a real pitfall: „raise the codeine dose"
  (real, ineffective for PM / dangerous for UM), „keep codeine", and the „fast = less" intuition
  error. **Tramadol is explicitly named as a *non*-solution** because it shares the CYP2D6
  pathway (a common exam-level trap) — kept prominent in the Mechanism, Finale lesson and Debrief. ✔
- **Simplifications (honest framing).** Genotype is rendered as a single **factor** on a
  normalized level (not a PK simulation); only three of the genotype classes are shown
  (PM / NM / UM), omitting Intermediate (IM) for clarity — the spec notes this is a pedagogical
  reduction, not a claim that only three types exist. Exact percentages and star factors are
  tunables, not clinical figures. The PM result is intentionally placed near „empty" (`~37`) to
  match the reality of *no* active morphine, and the UM demo is intentionally capped (`79`) for
  pedagogy while the true level is over-the-line. ✔

---

## Assets
- **Three patient avatars** (the „twins" — visibly *similar*, to sell „äußerlich gleich"), each
  with a **gene badge** overlay: 🐢 (langsam/PM) · ✅ (normal/NM) · 🐇 (ultraschnell/UM). Emoji
  badges work on the Pi (fonts-noto-color-emoji already installed); avatars can be simple
  illustrated faces or silhouettes.
- **Identical Codein pill sprite** — one sprite reused on all three cards, visually emphasised as
  „**gleiche Dosis**" (same pill, three twins). One shared image, not three.
- **Three bins** with the young labels (🟦 zu wenig / 🟩 genau richtig / 🟥 zu viel) and adult
  sublabels (PM/NM/UM).
- **Alternative-analgesic icon** — a generic non-codeine pill/blister labelled „Ibuprofen /
  Paracetamol" (the win choice). Optional „❌ Tramadol" decoy icon for the lesson/debrief.
- **Red „toxisch"-Flag overlay** — a simple red badge/banner shown on the UM demo fill (since the
  demo bar is capped at `79` and does not cross `80`, the danger must be conveyed visually). Reuse
  the existing critical-zone red styling.
- **Three MiniBars** — reuse `MiniBar.svelte` (no new asset).
- Photos optional (CC from Wikimedia if wanted): a codeine blister, a morphine structure for the
  adult debrief. **None required to ship** — emoji + simple SVGs suffice.
- All user-facing strings → **`frontend/src/lib/locale.svelte.ts`** (DE first, EN/NL/AR fall
  back). New story card → **`frontend/src/lib/stories.ts`** (replace the „Gene/CYP2D6" placeholder).

---

## Tunables (for feel)
- **Genotype factors / result levels** — PM `×0.60→~37` (near critical-low `35`, „fast leer" for
  teaching punch), NM `×1.00→~62`, UM `×1.37→~85` (real, over `80`). Push UM higher (toward `92`)
  for more overdose drama; pull PM toward `35` for an even starker „nothing happens".
- **UM demo cap** — `79` (the *educational* Beat 2b fill stays under critical-high `80` and uses
  the red „toxisch" flag), so the demo can't trigger the auto-outcome. The **strategy/loss** beat
  uses the real `~85`. Keep the cap < `80`.
- **Demo phase kind** — Beat 2b MUST be a **settling/non-interactive** phase (NOT in PLAY_PHASES)
  so `onLevel()` can't end the game; this is the primary guard, the `79` cap is the backup.
- **Demo pacing** — pause between the three twin fills (`moveTo` settle time) so each end state
  registers before the next; `moveTo(40)` between twins (NOT `api.reset()`) is what makes „same
  pill, different result" legible.
- **Reset-between-twins level** — `40` (baseline) via `moveTo(40)`. Keep identical for all three so
  the *only* visible variable is the genotype. (Avoid `api.reset()`, which targets `42` + resets
  the rate.)
- **UM loss-on-raise target** — `~92` (push deeper into critical when the player raises the UM
  codeine dose) for a clear „it got worse".
- **NM auto-resolve** — NM has **no Strategy beat** (it needs no action); it is resolved in the
  Demo. Toggle off only if you want a third decision (raises time budget).
- **Bin labels** — young tier shows tiers as 🐢/🟢/🐇 + „zu wenig/genau richtig/zu viel"; adults
  add PM/NM/UM.
- **IM omission** — currently 3 genotype classes for clarity; adding Intermediate (IM, a fourth
  bin/twin) is possible but raises difficulty — keep to 3 for a walk-up audience.
- **Drag vs tap** — ship **tap-card-then-tap-bin** as the kiosk default; enable drag as an
  enhancement where pointer support is reliable.
- **Decision count** — trimmed to **2 real decisions** (PM, UM) + sort; the finale match is folded
  into the Demo. If you want it longer, re-expose NM and/or split the match back out.
```