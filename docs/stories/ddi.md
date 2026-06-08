I'll apply every reviewer fix to the spec. The key changes: lead with CYP3A4/P-gp inhibition and demote gut-flora to a minor contributor (drop from young copy), soften the enzyme over-specification for phenprocoumon, call out this as the recommended first build, make tap-tap the primary interaction with drag as the enhancement, and confirm the finale "unbedenklich" cards don't over-claim.

# Story spec — „Der Funken-Plan" (DDI · Clarithromycin × Phenprocoumon)

> Per-story flow + **torso movement** + kid/adult copy + star logic + loss rules.
> Story 3 of 6. Engine model = §18/§19 in `game-design.md`. Built on the §19 template,
> reusing the existing `Choice[]`/decision→torso pipeline; the only new component is one
> pointer/tap pairing mechanic (`PairLink.svelte`, ~150 lines, akin to the fruit grid).
> Status: **DESIGN — ready to implement. ★ RECOMMENDED FIRST BUILD of the five new stories**
> (best engine fit — see Buildability). „Phenprocoumon absetzen" = deterministic underdose
> (Thrombose); „nur Magenschutz" / „verdoppeln" / „ignorieren" = overdose (Blutung).

## Meta
- **Patient:** Herr Schmidt, 72 — **Vorhofflimmern**, seit Jahren **gut eingestellt** auf den
  Vitamin-K-Antagonisten **Phenprocoumon** (Marcumar) zur Schlaganfallprophylaxe. Wegen einer
  **Bronchitis** verschreibt ein **zweiter Arzt** ein Antibiotikum: **Clarithromycin**.
  *(Name bewusst „Herr Schmidt" wie in Story 1 — wiederkehrender Patient, anderer Fall.)*
- **Interaction:** Clarithromycin (Makrolid) **hemmt CYP3A4 und P-Glykoprotein** → die
  **Phenprocoumon-Exposition steigt, der INR steigt** → ernsthaftes **Blutungsrisiko**.
  Phenprocoumon wird **primär über CYP2C9** abgebaut (CYP3A4 trägt geringer bei); die
  Wechselwirkung ist genuin und **in der Fachinformation markiert**, daher die bewusst weiche
  Formulierung *„Clarithromycin hemmt mehrere Abbauwege und erhöht die Phenprocoumon-Wirkung
  (INR ↑)"* — ohne CYP3A4 als **den** Pfad des VKA überzuspezifizieren. *(Antibiotika können
  zudem die Vitamin-K-bildende Darmflora reduzieren — ein realer, aber **schwacher/umstrittener,
  nachgeordneter** Beitrag; nicht gleichrangig zur Enzymhemmung, im `young`-Register **ganz
  weggelassen**.)* Realer Fix: **ein nicht-interagierendes Antibiotikum** wählen (z. B.
  Amoxicillin/Doxycyclin nach Indikation) **oder** Clarithromycin nur **mit engmaschiger
  INR-Kontrolle und ärztlicher Dosisanpassung**. Die übrigen Plan-Medikamente (**Metoprolol,
  Ramipril, Metformin, Pantoprazol**) sind echte, passende Begleitmedikamente und reagieren hier
  in Richtung INR/Blutung **nicht** gefährlich.
  > *Hinweis (Genauigkeit): Warfarin wäre das sauberere CYP-Lehrbuchpaar, aber Phenprocoumon ist
  > korrekt die deutsche Marktwahl — beibehalten, nur die Enzym-Aussage weich halten.*
- **The lesson (exactly one):** Eine Wechselwirkung ist ein **PAAR**. Man prüft den **ganzen
  Plan** und sucht, welches **vorhandene** Medikament mit dem **neuen** kollidiert — statt jede
  Pille einzeln zu beurteilen. *(Genau der Apotheken-Abgleich, „cross-check".)*
- **Engine numbers** (normalized 0–100, all tunable): band `[55,70]`, baseline „neu eingestellt"
  in-band `62`, critical-high `80`, critical-low `35`. INR-Proxy: der Torso steht **stabil bei
  `62`** (gut eingestellt) — er steigt erst **als Folge** der Strategie-Entscheidung, nicht
  während des Linkens. Interaktions-Faktor (bei Ignorieren) `×1.35` → Drift Richtung `~84`.

## End states (the game only ends here — three distinct endings)
| Outcome | Reached by | Torso | Message |
|---|---|---|---|
| **WIN** | „Anderes Antibiotikum / INR engmaschig kontrollieren" → stabil im Band | green `~62` | „Sicher kombiniert! 🎉 INR im Zielbereich, Schutz bleibt." |
| **LOSE — Überdosis (Blutung)** | „Wechselwirkung ignorieren" / „nur Magenschutz dazu" / „Antibiotikum verdoppeln" | critical `~88` | „INR zu hoch → erhöhte Blutungsgefahr." |
| **LOSE — Unterdosiert (Thrombose)** | „Phenprocoumon aus Panik ganz absetzen" | drops `~28` (unter crit-low) | „Ohne Blutverdünner ungeschützt → Schlaganfall-/Thrombose-Risiko." |

## Loss / retry rule (decided)
- **Every answer is explained first** — right: *„genau, weil…"*; wrong: *„nein, weil…"*.
- **Wrong link in the pair mechanic → roter Rückprall + Erklärung + retry** (kein Verlust): die
  gezogene Linie schnappt zurück, das harmlose Paar leuchtet kurz und sagt *„diese zwei
  vertragen sich"*. Beliebig oft wiederholbar bis das **richtige** Paar (Clarithromycin ↔
  Phenprocoumon) verbunden ist. Der Torso bleibt dabei **fest bei `62`** (noch ist nichts
  passiert — der Konflikt ist nur **erkannt**).
- **„Wechselwirkung ignorieren" / „nur Magenschutz dazugeben" / „Antibiotikum verdoppeln" →
  explain + LOSE (Überdosis/Blutung).** Alle drei sind reale Fehlgriffe: Pantoprazol schützt den
  Magen, senkt aber **nicht** den INR; Verdoppeln verschärft die Hemmung.
- **„Phenprocoumon absetzen" → explain + LOSE (Unterdosiert/Thrombose).** Aus Panik den
  Gerinnungshemmer wegzulassen nimmt den Schlaganfallschutz — der eigentliche Grund der Therapie.
- **„Anderes Antibiotikum / INR engmaschig kontrollieren" → WIN.** Retry wird bei jedem Verlust
  angeboten.

## Star logic (decided) — summed, shown N/3 (0 on any loss)
- ⭐ **Überlebt** — im grünen Band geendet (nur der „sicher kombinieren"-Pfad).
- ⭐ **Schlau** — das **richtige Paar im ersten Versuch** verbunden (kein falscher Link, kein
  Rückprall).
- ⭐ **Profi** — im Finale **alle** Karten korrekt einsortiert **im ersten Versuch** (siehe Beat 6).

## Flow & torso movement
| # | Beat | Player action | Torso (from→to) | Branch |
|---|---|---|---|---|
| 0 | Briefing | — | `62` (stabil im Band, „gut eingestellt") | → 1 |
| 1 | Der Plan | tap „Medikationsplan ansehen" | `62` (hält) | → 2 |
| 2 | Neue Verordnung | „Weiter" (zweiter Arzt → Clarithromycin landet im Plan) | `62` (hält, pulsiert kurz) | → 3 |
| 3 | **Funken-Plan** (mechanic) | richtiges Paar antippen (Tap-Tap) oder Linie ziehen | `62` (hält — Konflikt nur **erkannt**) | richtig → 4 · falsch → Rückprall+retry |
| 4 | Mechanismus | „Weiter" | `62` (hält) | → 5 |
| 5 | Strategie | pick the fix | see below | branches |
| 6 | Finale: Plan-Check | Begleit-Karten in „passt / prüfen" sortieren *(win path only)* | **steady green** | → 7 |
| 7 | Outcome | — | (stays) | end |

**Beat 5 branches (torso reacts to each):**
| Choice | Torso | Result |
|---|---|---|
| ✅ Anderes Antibiotikum / INR engmaschig kontrollieren | `62` (bleibt grün) | → Plan-Check-Finale → **WIN** |
| ❌ Wechselwirkung ignorieren (danger) | `62 → ~88` (drift über crit-high `80`) | explain + **LOSE (Überdosis/Blutung)** |
| ❌ Nur Magenschutz dazugeben (trap-danger) | `62 → ~84` (steigt trotzdem) | explain + **LOSE (Überdosis/Blutung)** |
| ❌❌ Antibiotikum verdoppeln (danger) | `62 → ~92` (kritisch) | explain + **LOSE (Überdosis/Blutung)** |
| ❌ Phenprocoumon ganz absetzen (panic) | `62 → ~28` (unter crit-low `35`) | explain + **LOSE (Unterdosiert/Thrombose)** |

> **Design note — torso pacing fits the slow pump.** Der Torso bewegt sich **nie** während der
> schnellen Geste; er steht bei `62` und **driftet erst nach der Strategie-Entscheidung**
> langsam in sein Ende. Das gesamte „Tempo" liegt auf dem Bildschirm (Karten verbinden), die
> langsame Pumpe zeigt nur das **gesetzte Ergebnis** — genau wie vom Engine-Constraint verlangt.

**Torso during the Plan-Check finale (point 2):** er **hält stabil im grünen Band** (Patient ist
sicher versorgt) und darf sanft grün glühen. Die Finalrunde ist ein **vorausschauender
Wissens-Check** („welche der übrigen Kombinationen sind okay?") — bewusst vom Pegel **entkoppelt**,
keine Bewegung. *(Alternative für mehr Leben: ein hypothetischer „Was-wäre-wenn"-Ausschlag, wenn
man eine wirklich riskante Karte fälschlich als „passt" einsortiert — sag Bescheid.)*

---

## Copy — kid (`young`) / adult (`adult`)
> Jede Option, jede Rückmeldung und jede Anweisung hat beide Register. Kinder = warm/konkret;
> Erwachsene = präzise + echte Begriffe. Für `young` ist die nuancierte Option **„Antibiotikum
> verdoppeln"** **ausgeblendet** (Kinder sehen 4 Optionen: sicher kombinieren / ignorieren / nur
> Magenschutz / Phenprocoumon absetzen); Erwachsene sehen alle 5. *(Story 1 hat 4 Optionen; die
> 5. „verdoppeln" für Erwachsene ist die bewusste Ausnahme — siehe Scoping.)*

### 0 · Briefing
- **Patient** — young: „Herr Schmidt, 72, hat ein zitterndes Herz (Vorhofflimmern). Damit kein
  gefährliches Blutgerinnsel entsteht, nimmt er ein Mittel, das sein Blut dünner macht
  (Marcumar). Das klappt seit Jahren super." · adult: „Herr Schmidt, 72, mit Vorhofflimmern;
  seit Jahren stabil auf **Phenprocoumon** (Marcumar, Vitamin-K-Antagonist) zur
  Schlaganfallprophylaxe – INR im Zielbereich."
- **Ziel** — young: „Jetzt ist er erkältet und bekommt von einem **zweiten** Arzt ein neues
  Medikament dazu. Pass auf, dass die neuen und die alten Tabletten sich vertragen!" · adult:
  „Wegen einer Bronchitis verordnet ein **zweiter Arzt** ein Antibiotikum. Prüfe den
  **Gesamtplan** auf Wechselwirkungen, bevor er beides nimmt."

### 1 · Der Plan (intro to the medication list)
- **Prompt** — young: „Schau dir an, was Herr Schmidt jeden Tag schluckt. Das ist sein
  Medikamenten-Plan." · adult: „Das ist Herrn Schmidts aktueller Medikationsplan."
- **Button:** „Medikationsplan ansehen"
- **Plan (current 5 — Karten):**
  💊 **Phenprocoumon** (Blutverdünner) · 💊 **Metoprolol** (Herzfrequenz) ·
  💊 **Ramipril** (Blutdruck) · 💊 **Metformin** (Zucker) · 💊 **Pantoprazol** (Magenschutz)
- **Reveal (🟢):** young: „Alles im grünen Bereich – die passen gut zusammen." · adult:
  „Bestehender Plan, eingespielt – INR im Fenster."

### 2 · Neue Verordnung (the trap arrives)
- **Story** — young: „Der zweite Arzt sieht nur die Erkältung – nicht den ganzen Plan. Er legt
  eine **neue** Tablette dazu: ein Antibiotikum namens **Clarithromycin**." · adult: „Der zweite
  Arzt verordnet **Clarithromycin** (Makrolid-Antibiotikum) – ohne den bestehenden
  Gerinnungshemmer im Blick. Die Karte landet **neu** im Plan."
- **Reveal (⚠️):** young: „Sechs Tabletten jetzt. Eine davon zofft sich mit einer alten –
  welche zwei?" · adult: „Sechs Wirkstoffe. Eine Kombination ist in der Fachinformation
  als Wechselwirkung markiert – welches Paar?"

### 3 · Der Funken-Plan (the unique mechanic — see full spec below)
- **Prompt** — young: „Welche **zwei** Tabletten zoffen sich? **Tippe die eine, dann die andere**
  an (oder zieh mit dem Finger eine Linie dazwischen)!" · adult: „Verbinde das **neue**
  Medikament mit dem **vorhandenen**, mit dem es kollidiert: erst die eine Karte antippen, dann
  die andere (oder eine Linie zwischen beide ziehen)."
- **Correct pair:** **Clarithromycin ↔ Phenprocoumon**
- **Feedback**
  - Clarithromycin ↔ Phenprocoumon ✓ — young: „Treffer! ⚡ Das Antibiotikum und der Blutverdünner
    streiten sich." · adult: „Korrekt – Clarithromycin × Phenprocoumon: die markierte
    Wechselwirkung."
  - Clarithromycin ↔ Pantoprazol — young: „Nein – das Antibiotikum und der Magenschutz vertragen
    sich." · adult: „Nein – Clarithromycin und Pantoprazol interagieren hier nicht relevant."
  - Clarithromycin ↔ Metoprolol — young: „Nein – die beiden machen keinen Ärger." · adult: „Nein –
    keine klinisch relevante Wechselwirkung."
  - Clarithromycin ↔ Ramipril — young: „Nein – passt zusammen." · adult: „Nein – Ramipril ist hier
    unkritisch."
  - Clarithromycin ↔ Metformin — young: „Nein – die zwei vertragen sich." · adult: „Nein –
    Metformin ist hier nicht das Problem."
  - Ein Paar **ohne** das Neue (z. B. Metoprolol ↔ Ramipril) — young: „Fast – aber such die
    **neue** Tablette. Das Problem kam erst mit ihr dazu." · adult: „Die Wechselwirkung muss das
    **neu hinzugekommene** Medikament betreffen – prüfe Clarithromycin gegen den Bestand."

### 4 · Mechanismus (lesson)
- young: „Das Antibiotikum bremst die „Aufräum-Maschine" der Leber (CYP3A4) und einen
  „Türsteher" im Darm (P-gp). Dadurch bleibt mehr Blutverdünner im Körper – das Blut wird
  **zu** dünn. Eine Wechselwirkung sind immer **zwei** zusammen!" · adult: „Clarithromycin hemmt
  **CYP3A4** und **P-Glykoprotein** und **bremst so mehrere Abbauwege** des Phenprocoumons →
  erhöhte Exposition → **INR ↑** → Blutungsrisiko. *(Antibiotika können nachgeordnet auch die
  Vitamin-K-bildende Darmflora vermindern.)* Wechselwirkung = ein **Paar**, nie eine Pille
  allein."

### 5 · Strategie (decision — torso reacts)
- **Prompt** — young: „Was tust du jetzt?" · adult: „Wie reagierst du auf die Wechselwirkung?"
- ✅ **Anderes Antibiotikum / INR engmaschig kontrollieren** — young: „Genau – entweder ein
  Antibiotikum nehmen, das sich verträgt, oder den Arzt das Blut **engmaschig** prüfen lassen.
  Sicher!" · adult: „Richtig – auf ein nicht-interagierendes Antibiotikum ausweichen **oder**
  Clarithromycin nur unter **engmaschiger INR-Kontrolle/Dosisanpassung** durch den Arzt.
  Bevorzugte Lösung."
- ❌ **Wechselwirkung ignorieren** *(danger → LOSE Überdosis)* — young: „Gefährlich! Das Blut wird
  zu dünn – er kann anfangen zu bluten." · adult: „Gefährlich – ungebremste INR-Erhöhung →
  Blutungsrisiko."
- ❌ **Nur einen Magenschutz dazugeben** *(trap-danger → LOSE Überdosis)* — young: „Bringt nichts
  gegen das Problem – der Magenschutz macht das Blut nicht weniger dünn." · adult: „Wirkungslos
  gegen die Ursache – ein PPI schützt den Magen, senkt aber den **INR nicht**; das
  Blutungsrisiko bleibt."
- ❌❌ **Antibiotikum verdoppeln** *(adults only → LOSE Überdosis)* — young: *(hidden)* · adult:
  „Falsch – mehr Hemmstoff verschärft die Wechselwirkung; INR steigt weiter."
- ❌ **Phenprocoumon aus Panik ganz absetzen** *(panic → LOSE Unterdosiert)* — young: „Vorsicht –
  ohne Blutverdünner ist sein Herz nicht mehr geschützt; jetzt droht ein Schlaganfall." · adult:
  „Gefährlich – Absetzen nimmt den Schlaganfallschutz; das **Thrombose-/Embolierisiko** steigt.
  Die Lösung ist das **Antibiotikum**, nicht das Absetzen des VKA."

### 6 · Finale: Plan-Check *(win path only — torso steady green)*
- **Prompt** — young: „Letzter Check: Sortiere die übrigen Kombinationen. **Passt zusammen**
  oder **lieber genau hinschauen**? Zieh jede Karte in den richtigen Korb." · adult: „Plan-Check:
  Ordne die folgenden **Kombinationen mit dem neuen Antibiotikum** ein – **unbedenklich** oder
  **prüfen/beobachten**?"
- **Karten (Clarithromycin + …):**
  - **„prüfen/beobachten" ✓** — **+ Phenprocoumon** (die bekannte: INR-Anstieg) · **+ Simvastatin**
    (CYP3A4-Substrat → Myopathie-Risiko, *Brücke zu Story 1*) · **+ ein QT-verlängerndes Mittel**
    *(adult-Label; young: „+ ein Herzrhythmus-Mittel")* (additive QT-Verlängerung)
  - **„unbedenklich" ✓** — **+ Metformin** · **+ Ramipril** · **+ Pantoprazol**
    *(echte Begleiter, die mit Clarithromycin in Richtung INR/Blutung **nicht** relevant
    interagieren — Label „unbedenklich" meint **in dieser Konstellation**, nicht „niemals,
    keinerlei Wechselwirkung")*
- **Feedback:** alle richtig „Perfekt – du prüfst den **ganzen** Plan, nicht nur eine Pille!" ·
  falsch „Nicht ganz – schau dir die Auflösung an." *(falsche Karte schnappt zurück, retry)*
- **Lesson** — young: „Manche Kombis sind okay, andere muss man genau prüfen. Darum schaut man
  immer den **ganzen** Plan an – nicht nur eine Tablette." · adult: „Makrolide interagieren über
  **CYP3A4/P-gp** mit mehreren Substraten (VKA, Statine) und können **QT additiv** verlängern;
  die anderen Begleiter sind in dieser Konstellation unkritisch. Deshalb: **immer den
  Gesamtplan** abgleichen."

### 7 · Outcome / Debrief (three endings)
- **WIN** — young: „Sicher kombiniert! 🎉 Du hast gemerkt, welche zwei sich zoffen – Herr
  Schmidt bleibt geschützt." · adult: „Sicher kombiniert – INR im Zielbereich, Schlaganfallschutz
  erhalten."
- **LOSE — Überdosis (Blutung)** — young: „Das Blut ist zu dünn geworden – das ist gefährlich." ·
  adult: „INR zu hoch → erhöhte Blutungsgefahr (z. B. Hämatome, GI-Blutung)."
- **LOSE — Unterdosiert (Thrombose)** — young: „Ohne den Blutverdünner ist sein Herz ungeschützt
  – das kann zum Schlaganfall führen." · adult: „VKA abgesetzt → kein Schlaganfallschutz →
  Thrombose-/Embolierisiko. Lösung war das Antibiotikum, nicht das Absetzen."
- **Debrief facts (both shown):**
  1. young: „Eine Wechselwirkung sind immer **zwei** Mittel zusammen – hier das Antibiotikum +
     der Blutverdünner." · adult: „Clarithromycin hemmt **CYP3A4 & P-gp** und bremst so den Abbau
     des Phenprocoumons → **INR ↑** → Blutungsrisiko. Makrolid + VKA ist eine
     fachinfo-markierte Wechselwirkung."
  2. young: „Darum prüft man **immer den ganzen Plan** – nicht nur die neue Tablette für sich." ·
     adult: „Deshalb der Apotheken-**Cross-Check**: jedes **neue** Medikament gegen den
     **gesamten Bestand** prüfen, nicht isoliert bewerten."

---

## The unique mechanic — „Der Funken-Plan" (Connect-the-Clash)

**Archetype:** Pairing / connect-the-pair. Der Spieler markiert die kollidierende **Beziehung**
zwischen zwei Medikamenten-Karten — **primär per Tap-Tap** (erste Karte antippen, dann zweite),
**optional per Drag** (Finger zieht eine leuchtende Linie). Bewusst anders als alle anderen
Stories: keine Foto-Multi-Auswahl (Story 1), kein Dial (Organ), kein Triptychon (Gen), keine
Echtzeit-Leck-Abwehr (Johanniskraut), kein Timeline-Authoring (Adhärenz). Die Geste **verkörpert**
die Lektion: eine Wechselwirkung **ist** ein Paar.

### Data shape
```ts
// src/lib/events.ts (story „ddi")
type DdiCard = {
  id: string;            // 'phenprocoumon' | 'metoprolol' | 'ramipril' |
                         // 'metformin' | 'pantoprazol' | 'clarithromycin'
  name: string;          // i18n key → locale (z. B. t('ddi.card.phenprocoumon'))
  role: string;          // kurze Funktion, i18n: „Blutverdünner" / „Magenschutz" …
  emoji: string;         // '💊' (Foto optional, s. Assets)
  isNew?: boolean;       // true nur für clarithromycin (neu hinzugekommen → hervorgehoben)
};

type DdiPairTask = {
  cards: DdiCard[];                 // 6 Karten, im Kreis/Raster angeordnet
  correct: [string, string];       // ['clarithromycin', 'phenprocoumon'] (ungeordnet)
  // Erklärtext je falschem Paar (Fallback: generisch „diese zwei vertragen sich"):
  wrongPairFeedback: Record<string, string>;  // key = sortierte id-Paare 'a|b' → i18n key
};
```

### Layout & interaction (PairLink.svelte)
- **6 Karten** in einem ruhigen Raster oder leichten Bogen (touch-Targets ≥ 88×88 px;
  finger-freundlich, kein Hover — `:active`/persistente Klassen, gemäß Touch-Konvention).
  Die **neue** Karte (`isNew` = Clarithromycin) ist deutlich markiert (Akzentrand „NEU",
  sanftes Pulsieren), damit Kinder wissen, wo der Start liegt — ohne die Antwort zu verraten.
- **Primäre Geste = Tap-Tap (Default auf dem Kiosk, wegen Touch-Zuverlässigkeit):** erste Karte
  antippen → sie hebt sich hervor/„armed" → zweite Karte antippen → Paar wird geschlossen.
  Dieselbe Validierung wie beim Drag. Nochmal die armierte Karte antippen hebt die Auswahl auf.
- **Optionale Geste = Drag (die Verbesserung, nicht die Grundlage):** `pointerdown` auf einer
  Karte startet die Linie; eine **SVG-`<path>`** (oder `<line>`) folgt dem Finger
  (`pointermove`) von der Startkarten-Mitte zur Fingerspitze; `pointerup` über einer **anderen**
  Karte schließt das Paar. Single active pointer (`setPointerCapture`); außerhalb losgelassen →
  Linie verpufft, kein Effekt. **Der Drag ist optional — Tap-Tap allein muss vollständig
  spielbar sein.**
- **Korrekt** (Clarithromycin ↔ Phenprocoumon, **Reihenfolge egal**): die Linie **rastet ein**,
  leuchtet auf (Funken/Glow entlang des Pfads, reines CSS/SVG), beide Karten bekommen einen
  grünen „⚡ Wechselwirkung erkannt"-Status → Übergang zu Beat 4. Der **Torso bewegt sich
  nicht** (`62` hält) — der Konflikt ist nur **erkannt**, noch nicht behandelt.
- **Falsch** (jedes andere Paar): **roter Rückprall** — die Linie schnappt mit kurzem
  Shake/Snap-back zurück (bzw. die armierte Auswahl blinkt rot und löst sich), das verbundene
  Paar blinkt rot, die passende `wrongPairFeedback`-Zeile erscheint (*„diese zwei vertragen
  sich"*), dann **retry**. Kein Verlust, kein Torso-Effekt, beliebig oft. Ein Paar **ohne** die
  neue Karte triggert die spezielle „such die neue Tablette"-Zeile (s. Beat 3).

### Scoring
- ⭐ **Schlau** vergeben, wenn das **erste** geschlossene Paar bereits korrekt ist
  (`attempts === 1`, kein Rückprall). Jeder Rückprall setzt das Flag und entzieht den Stern,
  blockiert aber **nicht** das Weiterkommen.
- Das Finale (Beat 6, Plan-Check) vergibt ⭐ **Profi** bei **fehlerfreier** Erstsortierung.

### How the torso reacts (summary)
- **Während Beat 3:** **keine Bewegung**, Torso fix bei `62` (grün). Das ist absichtlich — die
  langsame Pumpe darf während der schnellen Geste nichts tun (Engine-Constraint).
- **Erst nach Beat 5** (Strategie) driftet der Torso langsam in sein Ende (s. Branch-Tabelle):
  WIN bleibt `62`; Blutungs-Verluste steigen `→ 84…92`; das Absetzen fällt `→ 28`.

---

## Buildability (★ recommended first build of the five)
- **Bester Engine-Fit der fünf neuen Stories.** Die Strategie-Verzweigungen (Beat 5) mappen
  **1:1** auf die bestehende `Choice[]`/`result→moveTo`-Pipeline; das Beat-6-Finale
  („Kombis in passt/prüfen-Körbe sortieren") kann **`PlanCheck.svelte` bzw. das
  FruitSort-Multi-Select-Muster nahezu unverändert wiederverwenden**. Deshalb als **erste**
  der neuen Stories umsetzen.
- **Einziges neues Bauteil = `PairLink.svelte`** (Linie zwischen 6 Karten ziehen/tippen):
  genuin neu, aber **klein und in sich geschlossen** (~150 Zeilen, reines CSS/SVG). **Tap-Tap
  ist Default/primär** auf dem Kiosk; der **Drag ist nur die Verbesserung** — die Story ist
  vollständig per Tap-Tap spielbar, falls der Drag auf der Touch-Hardware zickt.
- Keine Backend-Änderung: der Torso reagiert über dieselben `setTarget`-Aufrufe wie Story 1.

## Accuracy (real drug + real interaction, no invention)
- **Phenprocoumon** (Marcumar) ist der in **Deutschland** dominierende **Vitamin-K-Antagonist**;
  enge therapeutische Breite, **INR-gesteuert** — realistischer als Warfarin für ein deutsches
  Publikum. *(Warfarin wäre das sauberere CYP-Lehrbuchpaar; Phenprocoumon ist dennoch die
  korrekte deutsche Marktwahl — beibehalten, nur die Enzym-Aussage weich halten.)*
- **Phenprocoumon-Metabolismus:** primär **CYP2C9** (CYP3A4 nachgeordnet). Daher **nicht**
  CYP3A4 als **den** Abbauweg des VKA überspezifizieren; die im Spiel verwendete Formulierung
  lautet bewusst *„Clarithromycin hemmt mehrere Abbauwege und erhöht die Phenprocoumon-Wirkung
  (INR ↑)"*.
- **Clarithromycin × VKA** ist eine **dokumentierte, fachinformations-markierte** Wechselwirkung.
  **Dominanter, gut belegter Mechanismus:** Clarithromycin **hemmt CYP3A4 und P-Glykoprotein**
  → erhöhte Phenprocoumon-Exposition → **INR ↑ → Blutungsrisiko**. *(Nachgeordnet/umstritten:
  Antibiotika können die **Vitamin-K-produzierende Darmflora** reduzieren — ein realer, aber
  **schwacher, nicht gleichrangiger** Beitrag; im `young`-Register weggelassen, damit die
  Ein-Konzept-Regel klar bleibt.)* Leitlinien/Fachinfos empfehlen **INR-Kontrolle** bei
  Beginn/Ende der Antibiose oder ein **nicht-interagierendes Antibiotikum**. *(Keine erfundenen
  Effekte: alle genannten Mechanismen sind real; sie werden nur korrekt **gewichtet**.)*
- **Innocent-bystander-Karten sind echte, plausible Begleiter** eines 72-Jährigen mit VHF/
  Komorbidität und reagieren mit Clarithromycin **in Richtung INR/Blutung nicht** klinisch
  relevant: **Metoprolol** (Frequenzkontrolle), **Ramipril** (RR/Herz), **Metformin** (Diabetes),
  **Pantoprazol** (Magenschutz). *(Bewusst NICHT als „interagierend" markiert; das Label
  „unbedenklich" im Finale meint **in dieser Konstellation/Richtung**, nicht „niemals, keinerlei
  Wechselwirkung".)*
- **Falsche Strategien sind reale Pitfalls, keine Fiktion:** Ignorieren (häufigster Fehler);
  „nur Magenschutz" (PPI behandelt das Blutungs**symptomrisiko** GI-seitig, senkt aber den
  **INR nicht** — verbreitetes Missverständnis); „Antibiotikum verdoppeln" (verschärft die
  Hemmung); „VKA aus Panik absetzen" (nimmt den **Schlaganfallschutz** — die gefährlichste
  Überreaktion). Der **richtige** Weg (anderes Antibiotikum **oder** engmaschige INR-Kontrolle/
  Dosisanpassung) entspricht der Leitlinienpraxis.
- **Finale-Karten sind ebenfalls real:** Clarithromycin × **Simvastatin** (CYP3A4-Substrat →
  Myopathie — bewusste Brücke zu Story 1) und Clarithromycin × **QT-verlängernde Mittel**
  (additive QT-Verlängerung) sind dokumentiert; die „unbedenklich"-Karten sind die echten
  Begleiter (in Richtung INR/Blutung clean). *(QT-Karte für `young` sprachlich vereinfacht zu
  „Herzrhythmus-Mittel".)*
- **Disclaimer-Hinweis:** generische Therapieentscheidungen sind ärztlich/individuell; das Spiel
  lehrt das **Prinzip** (Paar-Erkennung & Gesamtplan-Abgleich), keine konkrete Verordnung.

## Assets
- **6 Medikamenten-Karten** (Beat 3): Name + Rolle + `💊` (kein Foto zwingend). **Optional**
  Blister-/Tabletten-Fotos von **Wikimedia Commons** (CC) — sonst sauberes Emoji/Icon, wie der
  Rest des Spiels. Pillen-Farbcodierung nicht nötig (verwirrt eher).
- **SVG-Connector**: leuchtende Linie mit **Funken/Glow** (korrekt) und **Shake/Snap-back**
  (falsch) — **reines CSS/SVG**, keine Bibliothek, keine externen Bilder. *(Nur für die optionale
  Drag-Geste nötig; Tap-Tap kommt mit Karten-Highlights aus.)*
- **„NEU"-Badge** für die Clarithromycin-Karte (CSS).
- **Finale (Beat 6):** zwei Körbe „passt / prüfen" + 6 Kombi-Karten (Text), kein Bild nötig.
- **Locale:** alle Strings nach `frontend/src/lib/locale.svelte.ts` unter `ddi.*` (DE; EN/NL/AR
  fallen auf DE zurück), in beiden Registern (`young`/`adult`).

## Tunables (for feel)
- Drift/Settle-Tempo = die langsame Pumprate in `backend/app/game/controller.py` (`rate`).
- **Überdosis-Faktor** (`×1.35` → `~84`): höher = dramatischer über crit-high `80`; „verdoppeln"
  ein paar Einheiten höher (`~92`), „ignorieren"/„nur Magenschutz" knapp darüber (`~84–88`).
- **Unterdosis-Ziel beim Absetzen** (`~28`): klar **unter** crit-low `35` (Thrombose lesbar);
  Abstand zum Band absichtlich groß, damit „kein Schutz mehr" deutlich wird.
- **Markierung der neuen Karte** (Pulsstärke / „NEU"-Badge): stärker = mehr Hilfe für Kinder,
  schwächer = mehr Detektiv-Anspruch für Erwachsene. Ggf. registerabhängig.
- **Mechanik-Toleranz:** Drag-Trefferradius der Zielkarte (großzügig für Finger); **Tap-Tap ist
  der Default und immer aktiv**, der Drag nur die optionale Verbesserung.
- **Finale-Schärfe:** Anzahl „prüfen"- vs. „unbedenklich"-Karten (aktuell 3/3) steuert die
  Schwierigkeit der Schlussrunde.
- **Scoping-Note:** Erwachsene sehen **5** Strategie-Optionen (eine mehr als Story 1s 4, durch
  „verdoppeln"); `young` bleibt bei **4** wie spezifiziert. „nur Magenschutz" und „ignorieren"
  führen beide → identisches **Überdosis**-Ende, aber mit **getrennten Erklärungen** (bewusst).