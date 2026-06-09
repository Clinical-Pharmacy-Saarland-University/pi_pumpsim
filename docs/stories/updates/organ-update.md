Redesign and implement the organ-function / disease–drug interaction story.

Replace the current “Die Nieren-Skala” story with a more intuitive, kid-friendly story built around the metaphor:

“The kidney is the filter/drain.
The dose is the tap.
If the filter becomes weaker, the same dose can make the body level rise too high.”

New story title:
“Der müde Filter”

Alternative title:
“Dose rein, Niere raus”

Core learning goal:
The player should learn that organ function can change how much drug remains in the body. In this story, Metformin leaves the body through the kidneys. If kidney function gets weaker, the same Metformin dose can accumulate. The safe response is to reduce/decrease the dose and monitor kidney function, not to continue full dose and not to stop everything blindly.

For young mode:

- Use “Zucker-Medizin” instead of Metformin as the main label.
- Use “Nieren-Filter” instead of eGFR as the main gameplay concept.
- Use “rauswaschen” or “rausfiltern” instead of renal clearance.
- Use “staut sich” for accumulation.
- Use “Medizin-Tap kleiner stellen” or “kleinere Dosis” for dose reduction.
- Do not require children to know eGFR thresholds.

For adult mode:

- Show real terms as sublabels:
  - Zucker-Medizin = Metformin
  - Nieren-Filter = eGFR / Nierenfunktion
  - rauswaschen = renale Clearance / renale Elimination
  - gefährlich viel = Kumulation / Laktatazidose-Risiko

- Keep the pharmacology accurate:
  - Metformin is renally eliminated.
  - Reduced eGFR reduces clearance.
  - At around eGFR 35 ml/min/1.73 m², dose reduction/capping and monitoring is appropriate.
  - eGFR <30 means Metformin is contraindicated / stop.

Use the new star system:

- loss → young: “Noch in Ausbildung”; adult: “In Einarbeitung”
- 1.0★ → young: “Apotheken-Azubi”; adult: “Pharmazie-Azubi”
- 1.5★ → young: “Rezept-Profi”; adult: “PTA (Assistenz)”
- 2.0★ → young: “Dosis-Detektiv”; adult: “Apotheker:in”
- 2.5★ → young: “Interaktions-Profi”; adult: “Fachapotheker:in”
- 3.0★ → young: “SafePolyMed-Meister”; adult: “Klinische:r Pharmazeut:in”

Loss overrides partial stars. If the player reaches a loss outcome, show the loss rank instead of partial stars.
Do not show a named 0.5★ rank.

Engine / torso levels:
Use the standard normalized level model:

- therapeutic green band: 55–70
- baseline: 40
- stable target: 62
- critical high: 80
- critical low: 35

In this story, the torso level represents “how much Zucker-Medizin / Metformin is in the body”.

Main stage flow:
0 Briefing: Frau Yilmaz and her diabetes medicine
1 Stable usual dose
2 Same dose later, unexpected rise
3 Check-up dashboard: what changed?
4 Filter demo: normal filter vs weak filter
5 Mechanism: medicine leaves through kidneys
6 Dose-tap calibration
7 Kidney passport / monitoring plan
8 Outcome / debrief

This creates 7 meaningful interaction stages:

1. Usual dose
2. Same dose later
3. Check-up dashboard
4. Filter demo
5. Mechanism check
6. Dose-tap calibration
7. Kidney passport / monitoring plan

Stage 0 — Briefing

Purpose:
Introduce Frau Yilmaz and her diabetes medicine without revealing the kidney problem yet.

Young copy:
“Frau Yilmaz, 74, hat Zucker-Krankheit. Jeden Tag nimmt sie ihre Zucker-Medizin. Bisher landet der Spiegel immer schön im grünen Bereich.”

Adult copy:
“Frau Yilmaz, 74, mit Typ-2-Diabetes, nimmt seit Jahren Metformin. Bisher war sie mit der gewohnten Dosis stabil eingestellt.”

Goal young:
“Hilf Frau Yilmaz, im grünen Bereich zu bleiben — nicht zu wenig, nicht zu viel.”

Goal adult:
“Halte die Metformin-Exposition im therapeutischen Fenster, auch wenn sich die Organfunktion verändert.”

Torso:
Start at 40.

Stage 1 — Stable usual dose

Purpose:
Create the stable baseline.

Interaction:
Player taps:
“Gewohnte Dosis geben”

Torso:
40 → 62

Young copy:
“Die gewohnte Dosis passt. Der Spiegel landet im grünen Bereich.”

Adult copy:
“Mit der bisherigen Metformin-Dosis liegt Frau Yilmaz im therapeutischen Fenster.”

Scoring:
No star. This is tutorial/baseline.

Stage 2 — Same dose later, unexpected rise

Purpose:
Create the mystery before telling the player the answer.

Story setup:
“A few months later, Frau Yilmaz takes the same dose again.”

Interaction:
Player taps:
“Gleiche Dosis wie immer geben”

Torso:
Start from 40 or reset to 40 for a clean comparison.
Then move:
40 → 62 → 76 → 82

If 82 would auto-trigger a loss during this demonstration phase, use a non-loss demo phase or stop at 79 with a red warning flag and a ghost marker showing the projected danger above 80. The actual loss should occur later in the strategy stage.

Young copy:
“Moment — das ist dieselbe Dosis wie sonst. Warum steigt der Spiegel diesmal weiter?”

Adult copy:
“Unveränderte Metformin-Dosis, aber der Spiegel steigt über das Ziel hinaus. Etwas an der Elimination hat sich verändert.”

Simple observation check:
Prompt young:
“Was ist das Rätsel?”

Options:

1. “Gleiche Dosis, aber diesmal zu viel im Körper.” → correct
2. “Sie hat gar keine Medizin genommen.” → wrong
3. “Die Tablette ist verschwunden.” → wrong

Prompt adult:
“Was fällt auf?”

Options:

1. “Gleiche Dosis, aber höhere Exposition.” → correct
2. “Die Dosis wurde erhöht.” → wrong
3. “Der Wirkstoff wurde abgesetzt.” → wrong

Correct feedback:
“Genau — die Dosis war gleich. Also muss sich etwas im Körper verändert haben.”

Wrong feedback:
“Nicht ganz — die Dosis war gleich. Schau auf den Körper: diesmal bleibt mehr Medizin drin.”

Scoring:
+0.5★ if correct first try.

Stage 3 — Check-up dashboard: what changed?

Purpose:
Replace the old obvious detective question. The player should discover the kidney issue from evidence.

Visual:
Show a check-up board comparing “Früher” and “Heute”.

Cards:

1. Nieren-Filter
   - Früher: green / strong
   - Heute: yellow / weaker

2. Tabletten-Stärke
   - Früher: same
   - Heute: same

3. Essen
   - Früher: similar
   - Heute: similar

4. Bewegung
   - Früher: similar
   - Heute: similar

5. Wasser trinken
   - Früher: similar
   - Heute: similar

Adult sublabels:

- Nieren-Filter = eGFR / Nierenfunktion
- Today value: eGFR about 35 ml/min/1.73 m²
- Previous value: normal or green zone

Interaction:
The player taps or drags the changed card into a “Lupe / Check” area.

Prompt young:
“Schau genau: Was hat sich wirklich verändert?”

Prompt adult:
“Welcher Parameter erklärt den höheren Metformin-Spiegel trotz gleicher Dosis?”

Correct:
“Nieren-Filter schwächer geworden”

Wrong cards:

- Essen
- Bewegung
- Tabletten-Stärke
- Wasser trinken

Correct feedback young:
“Richtig! Der Nieren-Filter ist schwächer geworden. Die Medizin kommt langsamer raus.”

Correct feedback adult:
“Korrekt. Die eGFR ist gefallen; die renale Clearance ist reduziert.”

Wrong feedback examples:

- Food:
  “Nein — das Essen erklärt hier nicht, warum mehr Medizin im Körper bleibt.”
- Tablet strength:
  “Nein — die Tabletten sind gleich stark wie vorher.”
- Water:
  “Nein — mehr Wasser macht einen schwachen Filter nicht einfach wieder stark.”
- Exercise:
  “Nein — Bewegung ist gut, aber hier nicht der Grund für den steigenden Spiegel.”

Wrong answers:
Explain + retry. No loss.

Scoring:
+0.5★ if the kidney-filter card is chosen first try.

Stage 4 — Filter demo: normal filter vs weak filter

Purpose:
Make the mechanism physical and fun. This is the signature mechanic.

Visual metaphor:
A simple tank:
Medicine tap → body tank → kidney filter/drain

Round A: normal filter

- Tap/dose is normal.
- Kidney drain is open/strong.
- Level stabilises green.

Round B: weak filter

- Same tap/dose.
- Kidney drain is narrow/slow.
- Level rises too high.

Interaction:
Player starts each round by tapping:
“Test starten”

Round A torso:
40 → 62

Round B torso:
40 → 62 → 82 or safe demo cap with warning flag

Young copy:
“Die Medizin kommt gleich schnell rein — aber beim müden Filter kommt sie langsamer raus.”

Adult copy:
“Bei reduzierter renaler Clearance bleibt bei gleicher Dosis mehr Metformin im Körper.”

Mini-check:
Prompt young:
“Was ist bei der müden Niere anders?”

Options:

1. “Die Medizin kommt langsamer raus.” → correct
2. “Die Tablette ist stärker geworden.” → wrong
3. “Die Medizin kommt schneller raus.” → wrong

Prompt adult:
“Was passiert bei reduzierter renaler Clearance?”

Options:

1. “Die Exposition steigt bei gleicher Dosis.” → correct
2. “Die Exposition fällt bei gleicher Dosis.” → wrong
3. “Die Dosis wurde automatisch kleiner.” → wrong

Correct feedback:
“Genau — der Abfluss ist langsamer. Deshalb staut sich die Medizin.”

Wrong feedback:
“Nein — die Dosis ist gleich. Das Problem ist der langsamere Abfluss über die Niere.”

Scoring:
+0.5★ if correct first try.

Stage 5 — Mechanism screen: Metformin leaves through kidneys

Purpose:
Short explanation after the player has seen the filter demo.

Young copy:
“Diese Zucker-Medizin wird vor allem über die Nieren wieder aus dem Körper rausgewaschen. Wenn der Nieren-Filter müde ist, bleibt mehr Medizin im Körper. Dann muss weniger rein.”

Adult copy:
“Metformin wird unverändert renal eliminiert. Sinkt die eGFR, sinkt die Clearance. Bei unveränderter Dosis kann Metformin kumulieren; klinisch relevant ist das Risiko einer Metformin-assoziierten Laktatazidose. Konsequenz: Dosis an die eGFR anpassen und Nierenfunktion überwachen.”

Button:
Young: “Dosis anpassen”
Adult: “Dosis kalibrieren”

Scoring:
No separate star. This is explanation and transition.

Stage 6 — Dose-tap calibration

Purpose:
Replace the silly “reduce dose” button with a real visual calibration task.

Visual:
Show the same tank/filter setup:

- The kidney filter is visibly weak/yellow.
- The player controls a medicine tap with three settings.

Tap settings:

1. Full tap / Standarddosis
2. Medium tap / reduzierte Dosis
3. Tiny tap / sehr wenig / Pause

Use large touch targets.
Tap-to-select is the kiosk default.
Drag slider/tap handle is optional enhancement.

Prompt young:
“Der Filter ist langsamer. Wie stellst du den Medizin-Tap ein, damit der Spiegel wieder grün bleibt?”

Prompt adult:
“eGFR etwa 35 ml/min: Welche Metformin-Dosis ist passend?”

Options young:

1. “Großer Tap: volle Dosis wie immer” → overdose loss
2. “Mittlerer Tap: kleinere Dosis” → correct
3. “Mini-Tap: fast nichts / Pause” → underdose loss
4. “Einfach mehr trinken und volle Dosis lassen” → retry trap

Options adult:

1. “Standarddosis beibehalten” → overdose loss
2. “Dosis reduzieren / deckeln + Niere überwachen” → correct
3. “Metformin komplett absetzen” → underdose loss at eGFR 35
4. “Mehr trinken, gleiche Dosis” → retry trap

Correct feedback young:
“Genau! Wenn der Filter langsamer ist, muss weniger Medizin rein. Der Spiegel kommt zurück in den grünen Bereich.”

Correct feedback adult:
“Richtig. Bei eGFR 30–44 wird Metformin reduziert bzw. gedeckelt und die Nierenfunktion engmaschiger überwacht.”

Wrong feedback full dose young:
“Gefährlich! Der müde Filter schafft die volle Menge nicht. Die Medizin staut sich weiter an.”

Wrong feedback full dose adult:
“Gefährlich — volle Dosis bei reduzierter Clearance führt zu Kumulation und erhöhtem Laktatazidose-Risiko.”

Wrong feedback tiny tap young:
“Zu wenig! Jetzt ist kaum noch Zucker-Medizin da — der Blutzucker kann entgleisen.”

Wrong feedback tiny tap adult:
“Überkorrigiert — bei eGFR 35 ist Reduktion indiziert, nicht komplettes Absetzen. Absetzen ist erst bei eGFR <30 angezeigt.”

Trap feedback young:
“Mehr trinken macht den müden Filter nicht einfach wieder stark. Die Dosis muss angepasst werden.”

Trap feedback adult:
“Mehr Flüssigkeit ersetzt keine Dosisanpassung bei chronisch reduzierter eGFR.”

Torso movement:

- Correct medium tap: 82 → 62, green
- Full tap: 82 → 88, critical high → LOSE Überdosis / accumulation
- Tiny tap / stop: 82 → 41, under band → LOSE Unterdosiert / glucose control loss
- More water trap: stays around 82 → explain + retry

Loss rule:
Full dose and tiny/stop are real dangerous strategy choices and end in loss after explanation and torso movement.
The water trap is harmless-wrong: explain + retry.

Scoring:
+0.5★ if the correct medium/reduced tap is selected first try.
+0.5★ bonus/check if the player reaches the correct choice without ever selecting either extreme.
If you prefer not to double-score the same screen, use the second half-star as part of the final passport stage. But target total remains six half-star checks.

Recommended scoring:

- +0.5★ for correct medium/reduced tap first try.
- Do not add a separate “avoid extremes” star here; use the final passport for the sixth star.

Stage 7 — Kidney passport / monitoring plan

Purpose:
Replace the not-fun eGFR quiz with a useful, understandable safety-plan builder.

Win-path only.
Torso holds green at 62 and may glow gently.

Visual:
A small “Nieren-Pass” / “Filter-Check-Karte” / clipboard.

Interaction:
Sort cards into two baskets:

- “gehört in den sicheren Plan”
- “nicht sicher”

Young prompt:
“Baue Frau Yilmaz’ Filter-Plan. Welche Karten gehören dazu?”

Adult prompt:
“Stelle den sicheren Metformin/eGFR-Plan zusammen.”

Young correct cards:

- “Filter regelmäßig prüfen”
- “Dosis an den Filter anpassen”
- “Bei Durchfall/Fieber Fachleute fragen”
- “Nicht heimlich mehr nehmen”
- “Nicht einfach alleine stoppen”

Young wrong cards:

- “Immer volle Dosis”
- “Filter ignorieren”
- “Mehr trinken löst alles”
- “Dosis nach Gefühl ändern”

Adult correct cards:

- “eGFR regelmäßig kontrollieren”
- “Bei eGFR 30–44 Dosis reduzieren/deckeln”
- “Bei eGFR <30 Metformin absetzen/kontraindiziert”
- “Bei akuter Krankheit/Dehydratation ärztlich prüfen”
- “Dosisänderung kontrolliert dokumentieren”

Adult wrong cards:

- “eGFR ignorieren”
- “volle Dosis unabhängig von Nierenfunktion”
- “Metformin bei eGFR 35 automatisch komplett absetzen”
- “Dosis eigenmächtig nach Gefühl ändern”

Feedback all correct young:
“Perfekt — der Filter wird geprüft und die Dosis passt zur Niere.”

Feedback all correct adult:
“Korrekt — eGFR-gesteuerte Dosierung plus Monitoring.”

Wrong feedback:
“Das gehört nicht in einen sicheren Plan. Versuch es nochmal.”

Retry:
Wrong cards snap back.
No loss in this finale, but wrong placement removes the finale star.

Scoring:
+0.5★ if the kidney passport is completed without wrong card.

Optional adult-only eGFR mapping inside the passport:
If adult mode has room, include a compact mapping card:

- eGFR ≥60 → standard possible
- eGFR 30–44 → reduce/deckel + monitor
- eGFR <30 → stop / contraindicated

For young mode, use colours:

- green filter → normal tap
- yellow filter → smaller tap
- red filter → stop and ask doctor

Stage 8 — Outcome / debrief

Win condition:
Correct dose-tap calibration and kidney passport completed.

Win copy young:
“Sicher dosiert! 🎉 Du hast den Medizin-Tap an den müden Filter angepasst.”

Win copy adult:
“Sicher dosiert — Metformin-Dosis an die eGFR angepasst und Monitoring geplant.”

Lose — overdose / accumulation:
Triggered by full dose with weak kidney.

Young:
“Zu viel! Der müde Filter konnte die volle Menge nicht rauswaschen. Die Medizin hat sich angestaut.”

Adult:
“Überdosis/Kumulation: volle Metformin-Dosis bei reduzierter renaler Clearance → erhöhtes Laktatazidose-Risiko.”

Lose — underdose:
Triggered by stopping or making dose far too small at eGFR 35.

Young:
“Jetzt ist zu wenig Zucker-Medizin da — der Blutzucker kann wieder zu hoch werden.”

Adult:
“Unterdosiert: bei eGFR 35 ist Reduktion indiziert, nicht komplettes Absetzen. Zu wenig Metformin kann die Glukosekontrolle verschlechtern.”

Debrief young:

1. “Manche Medikamente werden über die Nieren rausgewaschen.”
2. “Wenn der Nieren-Filter müde ist, bleibt mehr Medizin im Körper.”
3. “Dann muss der Medizin-Tap kleiner gestellt werden.”
4. “Nicht einfach volle Dosis weiternehmen — aber auch nicht allein alles stoppen.”
5. “Filter regelmäßig prüfen und Fachleute fragen.”

Debrief adult:

1. “Metformin wird unverändert renal eliminiert.”
2. “Sinkt die eGFR, sinkt die Clearance; Metformin kann kumulieren.”
3. “Bei eGFR 30–44: Dosis reduzieren/deckeln und Nierenfunktion engmaschiger kontrollieren.”
4. “Bei eGFR <30: Metformin kontraindiziert / absetzen.”
5. “Die zentrale Disease–Drug-Interaction lautet: Organfunktion steuert Dosierung.”

Star scoring:
Award six half-star checks:

1. +0.5★ Same-dose observation correct first try.
2. +0.5★ Check-up dashboard: kidney-filter card identified first try.
3. +0.5★ Filter demo check correct first try.
4. +0.5★ Dose-tap calibration: reduced/medium dose chosen first try.
5. +0.5★ Strategy safety: no extreme choice selected before correct dose.
6. +0.5★ Kidney passport completed without wrong card.

Total possible: 3.0★.

If the player loses:
Show loss rank only.

If the player wins:
Show star total and corresponding rank:

- 1.0★ → “Apotheken-Azubi” / “Pharmazie-Azubi”
- 1.5★ → “Rezept-Profi” / “PTA (Assistenz)”
- 2.0★ → “Dosis-Detektiv” / “Apotheker:in”
- 2.5★ → “Interaktions-Profi” / “Fachapotheker:in”
- 3.0★ → “SafePolyMed-Meister” / “Klinische:r Pharmazeut:in”

Suggested data model:

Patient:
{
id: "yilmaz",
age: 74,
conditionYoung: "Zucker-Krankheit",
conditionAdult: "Typ-2-Diabetes",
drugYoung: "Zucker-Medizin",
drugAdult: "Metformin"
}

Organ status:
{
id: "kidney_filter",
previous: {
young: "Filter stark",
adult: "eGFR normal",
color: "green"
},
current: {
young: "Filter müde",
adult: "eGFR ca. 35 ml/min/1,73 m²",
color: "yellow"
}
}

Dose tap options:
[
{
id: "full",
labelYoung: "Großer Tap: volle Dosis",
labelAdult: "Standarddosis beibehalten",
factor: 1.32,
target: 88,
result: "overdose"
},
{
id: "reduced",
labelYoung: "Mittlerer Tap: kleinere Dosis",
labelAdult: "Dosis reduzieren/deckeln + überwachen",
factor: 1.0,
target: 62,
result: "win"
},
{
id: "tiny",
labelYoung: "Mini-Tap: fast nichts / Pause",
labelAdult: "Metformin komplett absetzen",
factor: 0.66,
target: 41,
result: "underdose"
},
{
id: "water",
labelYoung: "Mehr trinken, volle Dosis lassen",
labelAdult: "Mehr trinken, gleiche Dosis",
result: "retry"
}
]

Implementation notes:

- Do not reveal the kidney answer before the check-up dashboard.
- The old detective question should be removed or replaced by the dashboard.
- The old pure eGFR quiz should be replaced by the kidney passport / safety-plan builder.
- Young mode should not require eGFR knowledge.
- Adult mode may show eGFR 35 and thresholds as sublabels.
- The dose decision should be visual: medicine tap + kidney drain/filter.
- Tap-to-select must be the default kiosk interaction.
- Drag/slider behaviour is optional enhancement only.
- Use CSS/SVG/emoji for filter, tap, tank, and dashboard. No external images required.
- If using a gauge, it should be explanatory, not the main quiz for kids.
- The torso should move in several meaningful places:
  1. stable usual dose to green,
  2. same dose later rising high,
  3. filter demo normal vs weak,
  4. dose-tap strategy returning to green or causing loss.

- All wrong answers should explain first. Dangerous dose choices end in loss; harmless misconceptions retry.

Suggested implementation order:

1. Add/rename story metadata to “Der müde Filter”.
2. Add young/adult label system for Metformin/Zucker-Medizin and eGFR/Nieren-Filter.
3. Implement Stage 0–2 story and torso movement.
4. Implement check-up dashboard.
5. Implement filter/tank demo.
6. Implement mechanism transition screen.
7. Implement dose-tap calibration with four options.
8. Wire win/loss torso movements.
9. Implement kidney passport / monitoring-plan builder.
10. Wire six half-star scoring flags and new rank display.
11. Add win/loss debrief.
12. Play-test young mode first: no eGFR knowledge should be needed.
13. Tune torso timing so the “same dose now rises” moment is visually obvious but not too slow.

Acceptance criteria:

- The story no longer tells the player the kidney answer before asking the detective task.
- The first mystery is: same dose, different body level.
- Kids can solve the story using the filter/tap metaphor without knowing eGFR.
- Adults still see correct Metformin/eGFR terminology.
- The torso moves repeatedly and meaningfully.
- The dose decision is not a two-option button question; it is a visual calibration task.
- Full dose with weak kidney causes high-level loss.
- Stopping/mini-dose at eGFR 35 causes underdose loss.
- Reduced/medium dose returns the torso to green.
- The finale teaches monitoring and kidney-based dose adjustment, not a dry eGFR quiz.
- Star scoring uses the 0–3★ system in 0.5 increments.
- Loss outcomes override partial stars.
