Redesign and implement the Clarithromycin × Phenprocoumon DDI story.

Replace the current “Der Funken-Plan” structure with a more intuitive, kid-friendly story built around blood balance, medication-plan scanning, torso movement, and safe-plan building.

New story title:
“Die Blut-Balance”

Alternative title:
“Zu dick, zu dünn”

Core learning goal:
The player should learn that a new medication can change the effect of an existing medication. In this story, a new antibiotic makes the blood-thinner effect too strong. The safe response is not to ignore it, not to add only stomach protection, and not to stop the blood-thinner alone. The safe response is to check the whole medication plan and involve pharmacy/doctor: choose a better-fitting antibiotic or monitor the blood value closely and adjust medically.

Design principle:
Do not make the gameplay depend on knowing the names “Phenprocoumon”, “Clarithromycin”, or “INR”.
For young mode:

- Use “Blutverdünner”, “neues Antibiotikum”, “Blut-Balance”, “Blutwert”.
- Do not use INR as a core gameplay term.
- Do not ask children to recognise specialist interaction pairs from drug names.

For adult mode:

- Show real names underneath the simple labels:
  - Blutverdünner = Phenprocoumon / Marcumar
  - neues Antibiotikum = Clarithromycin
  - Blut-Balance / Blutwert = INR

- Keep adult pharmacology precise but not overloaded.

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

- therapeutic / safe green band: 55–70
- stable safe baseline: 62
- critical high: 80
- critical low: 35

In this story the torso represents blood-thinner effect / blood-balance:

- too low = too little clot protection / clot or stroke risk
- green = balanced protection
- too high = bleeding risk

Important:
In young mode, label the torso scale as “Blut-Balance” or “Blutverdünner-Wirkung”.
In adult mode, label it as “INR / Antikoagulationswirkung” if appropriate.

Main stage flow:
0 Briefing: Herr Schmidt and blood balance
1 Balance tutorial
2 New antibiotic enters the medication plan
3 Interaction scanner
4 Torso demo: blood-thinner effect rises
5 Warning-sign mini-game
6 Strategy choice
7 Safe-plan builder finale
8 Outcome / debrief

This creates 7 meaningful interaction stages:

1. Balance tutorial
2. Add new antibiotic to plan
3. Interaction scanner
4. Effect demo
5. Warning-sign sorting
6. Strategy choice
7. Safe-plan builder finale

Stage 0 — Briefing

Purpose:
Introduce the patient and the balance metaphor.

Young copy:
“Herr Schmidt, 72, hat ein Herz, das manchmal aus dem Takt kommt. Damit sich keine gefährlichen Blutklumpen bilden, nimmt er jeden Tag einen Blutverdünner. Der muss genau richtig wirken: nicht zu schwach und nicht zu stark.”

Adult copy:
“Herr Schmidt, 72, mit Vorhofflimmern, ist seit Jahren stabil auf Phenprocoumon eingestellt. Der Gerinnungsschutz muss im Zielbereich bleiben: zu niedrig bedeutet Thrombose-/Schlaganfallrisiko, zu hoch bedeutet Blutungsrisiko.”

Goal young:
“Halte die Blut-Balance im grünen Bereich.”

Goal adult:
“Halte die Antikoagulation / INR im Zielbereich.”

Torso:
Start at 62, green.

Stage 1 — Balance tutorial

Purpose:
Make the level meaning understandable before any drug interaction appears.

Interaction:
Show a simple balance scale or three-zone bar:

- left / low: “zu wenig Schutz”
- middle / green: “genau richtig”
- right / high: “Blutungsgefahr”

Player taps:
“Tägliche Dosis nehmen”

Torso:
62 stays green or gently pulses green.
No major movement needed, but the green state should be visually reinforced.

Young copy:
“Im grünen Bereich ist es genau richtig: genug Schutz vor Blutklumpen, aber nicht zu viel Blutungsgefahr.”

Adult copy:
“Im Zielbereich besteht ausreichender Schlaganfallschutz ohne unnötig erhöhtes Blutungsrisiko.”

Simple check:
Prompt young:
“Was passiert, wenn der Blutverdünner viel zu stark wirkt?”

Options:

1. “Es kann leichter bluten.” → correct
2. “Die Tablette verschwindet.” → wrong
3. “Das Herz wird größer.” → wrong

Prompt adult:
“Was bedeutet ein zu hoher Gerinnungshemmungs-Effekt?”

Options:

1. “Erhöhtes Blutungsrisiko.” → correct
2. “Verlust des Schlaganfallschutzes.” → wrong; this is low effect
3. “Keine klinische Relevanz.” → wrong

Correct feedback young:
“Genau — zu stark bedeutet Blutungsgefahr.”

Correct feedback adult:
“Korrekt — zu hohe Antikoagulation erhöht das Blutungsrisiko.”

Wrong feedback:
“Fast — zu stark heißt hier: Das Blut wird zu dünn, Blutungen werden wahrscheinlicher.”

Scoring:
+0.5★ if correct first try.

Stage 2 — New antibiotic enters the medication plan

Purpose:
Introduce the idea that a new medication must be checked against the old plan.

Interaction:
Show Herrn Schmidts current medication plan as simple cards.

Existing cards young:

- Blutverdünner
- Herz-Mittel
- Blutdruck-Mittel
- Zucker-Mittel
- Magenschutz

Existing cards adult, shown as sublabels:

- Blutverdünner — Phenprocoumon / Marcumar
- Herzfrequenz — Metoprolol
- Blutdruck — Ramipril
- Zucker — Metformin
- Magenschutz — Pantoprazol

Story young:
“Herr Schmidt bekommt eine Bronchitis. Ein zweiter Arzt gibt ihm ein neues Antibiotikum. Jetzt kommt eine neue Karte in den Plan.”

Story adult:
“Wegen Bronchitis wird Clarithromycin verordnet. Die neue Verordnung muss gegen den bestehenden Medikationsplan geprüft werden.”

Interaction:
Player drags or taps the “neues Antibiotikum” card into the medication plan.

New card young:
“Neues Antibiotikum”

New card adult:
“Clarithromycin — neues Antibiotikum”

Torso:
Stays green at 62.
Optional: short yellow pulse on the new card, not on the torso.

Copy after card enters:
Young:
“Neue Tablette im Plan! Jetzt prüfen wir: Verträgt sie sich mit den alten?”

Adult:
“Neue Substanz im Plan. Jetzt erfolgt der Interaktionscheck gegen den Bestand.”

Scoring:
No star. This is setup.

Stage 3 — Interaction scanner

Purpose:
Replace the old drug-name pair quiz with an active investigation.

Core idea:
The player scans the new antibiotic against each old medication. The child does not need to know which pair is risky in advance; the scanner reveals it through feedback.

Interaction:
Show the new antibiotic card highlighted on the left/top.
Show the existing medication cards around it.
Player uses a “Scanner”, “Lupe”, or “Interaktions-Check” beam:

- Tap the new antibiotic, then tap an old medication; or
- drag the scanner over one old medication while the antibiotic is highlighted.

Preferred kiosk interaction:
Tap old card to scan it against the highlighted new antibiotic.
Drag/beam can be an enhancement, but tapping must fully work.

Scan outcomes:

1. Antibiotic + Blutverdünner / Phenprocoumon → warning, correct discovery
2. Antibiotic + Magenschutz / Pantoprazol → green “passt hier”
3. Antibiotic + Zucker-Mittel / Metformin → green “passt hier”
4. Antibiotic + Blutdruck-Mittel / Ramipril → green “passt hier”
5. Antibiotic + Herz-Mittel / Metoprolol → green “passt hier” for this simplified story

Important:
For this kid-friendly version, do not turn this into a complex full DDI checker. Only the blood-thinner pair is the relevant danger in the story.

Prompt young:
“Scanne das neue Antibiotikum mit den alten Medikamenten. Welche alte Karte macht Alarm?”

Prompt adult:
“Prüfe Clarithromycin gegen den bestehenden Plan. Welche bestehende Medikation ist in diesem Fall kritisch?”

Correct discovery feedback young:
“Alarm! Das neue Antibiotikum macht den Blutverdünner stärker. Die Blut-Balance kann zu hoch steigen.”

Correct discovery feedback adult:
“Kritische Kombination erkannt: Clarithromycin kann die Phenprocoumon-Wirkung erhöhen; der INR kann steigen.”

Safe-pair feedback young:
“Diese Kombination macht hier keinen Blut-Balance-Alarm.”

Safe-pair feedback adult:
“In dieser Story keine relevante Erhöhung des Blutungs-/INR-Risikos.”

If player scans many wrong cards first:
Allow continued scanning. Do not block story.
After all safe cards are scanned, the blood-thinner card can pulse to guide the player.

Scoring:
+0.5★ if the player finds the blood-thinner pair first try.
Alternative if first-try is too strict:
+0.5★ if the player finds it before scanning more than two harmless cards.
Use one consistent rule across stories.

Recommended scoring rule:
+0.5★ if first scanned old medication is the blood-thinner.

No loss in this stage.

Stage 4 — Torso demo: blood-thinner effect rises

Purpose:
Show the body consequence. This is where the torso must move.

Transition:
After scanner identifies the risky pair, show a short demonstration:
“What would happen if he simply takes both without checking?”

Torso movement:
62 → 76 → 84

If 84 would auto-trigger a loss in this phase, either:

- make this a non-loss demo phase, or
- stop at 79 with a red warning flag and reserve 84/88 for the later strategy-loss phase.

Recommended:
Use 76 as warning level in demo, then show a projected ghost/marker at 84 saying “würde gefährlich hoch werden”.
The actual loss movement happens in the strategy stage.

Young copy:
“Das neue Antibiotikum macht den Blutverdünner stärker. Die Blut-Balance steigt zu hoch.”

Adult copy:
“Clarithromycin kann die Phenprocoumon-Wirkung verstärken; die INR würde ansteigen.”

Mechanism young:
“Eine Wechselwirkung bedeutet: Zwei Mittel zusammen verändern die Wirkung. Hier wird der Blutverdünner zu stark.”

Mechanism adult:
“Clarithromycin hemmt relevante Abbau-/Transportwege und kann die VKA-Wirkung erhöhen. Klinisch relevant ist der INR-Anstieg und das Blutungsrisiko.”

Do not over-specify CYP3A4 as the sole Phenprocoumon pathway.
Adult copy should stay soft:
“mehrere Abbau-/Transportwege”
“kann die Phenprocoumon-Wirkung erhöhen”
“INR-Anstieg”
Avoid saying:
“Phenprocoumon is mainly CYP3A4-metabolised.”

Scoring:
+0.5★ via a small check after the demo.

Prompt young:
“Was macht das neue Antibiotikum mit dem Blutverdünner?”

Options:

1. “Es macht ihn stärker.” → correct
2. “Es schaltet ihn komplett aus.” → wrong
3. “Es macht gar nichts.” → wrong

Prompt adult:
“Welche Richtung hat die Interaktion?”

Options:

1. “Antikoagulationswirkung / INR steigt.” → correct
2. “Antikoagulationswirkung fällt ab.” → wrong
3. “Keine relevante Änderung.” → wrong

Correct feedback:
“Genau — die Wirkung steigt zu hoch.”

Wrong feedback:
“Nein — in diesem Fall wird die Blutverdünner-Wirkung stärker, nicht schwächer.”

Stage 5 — Warning-sign mini-game

Purpose:
Replace abstract INR questioning with concrete consequences.

Interaction:
Sort warning cards into two baskets:

- “Warnzeichen”
- “Nicht der Hauptalarm hier”

Young prompt:
“Woran merkt man, dass die Blut-Balance zu hoch sein könnte? Sortiere die Karten.”

Adult prompt:
“Welche Zeichen passen zu erhöhter Antikoagulation / Blutungsrisiko?”

Young warning cards:

- “Nasenbluten”
- “Große blaue Flecken”
- “Blutung hört schlecht auf”

Young non-main-problem cards:

- “Tablette schmeckt bitter”
- “Er hat Wasser getrunken”
- “Er trägt blaue Socken”

Adult warning cards:

- “Hämatome”
- “Epistaxis”
- “GI-Blutung / schwarzer Stuhl”
- “INR erhöht” if you want one technical card

Adult non-main-problem cards:

- “bitterer Geschmack”
- “normale Flüssigkeitsaufnahme”
- “leichte Müdigkeit ohne Blutungszeichen”

Feedback all correct young:
“Super — das sind Warnzeichen für zu viel Blutverdünnung.”

Feedback all correct adult:
“Korrekt — typische Hinweise auf erhöhte Blutungsneigung bzw. erhöhten INR.”

Wrong feedback:
“Nicht ganz — wir suchen Zeichen, die zu Blutungen passen.”

Retry:
Wrong cards can snap back with explanation.
No loss.

Scoring:
+0.5★ if all warning signs are sorted correctly without a wrong placement.

Torso:
Hold at warning state, e.g. 76 with yellow/red glow.
No additional pump movement required.

Stage 6 — Strategy choice

Purpose:
The player decides what should happen now. This is the main branching/loss stage with torso movement.

Prompt young:
“Was ist jetzt sicher?”

Prompt adult:
“Wie sollte auf die Wechselwirkung reagiert werden?”

Young options:

1. “Apotheke/Arztpraxis prüft den ganzen Plan” → correct/safe path
2. “Ein anderes Antibiotikum nehmen, das besser passt” → correct/safe path
3. “Einfach beide nehmen und nichts sagen” → overdose/bleeding loss
4. “Nur Magenschutz dazugeben” → overdose/bleeding loss
5. “Blutverdünner aus Angst weglassen” → underdose/clot loss

Adult options:

1. “Alternative Antibiose prüfen oder INR engmaschig kontrollieren” → correct/safe path
2. “Clarithromycin ohne Kontrolle zusätzlich geben” → overdose/bleeding loss
3. “Nur PPI/Magenschutz ergänzen” → overdose/bleeding loss
4. “Phenprocoumon eigenmächtig absetzen” → underdose/thrombosis loss
5. “Antibiotikum-Dosis erhöhen” → adult-only overdose/bleeding loss

Correct feedback young:
“Genau — den ganzen Plan prüfen und Fachleute einbeziehen. Dann bleibt die Blut-Balance sicher.”

Correct feedback adult:
“Richtig — interaktionsärmere Antibiose prüfen oder Clarithromycin nur mit engmaschiger INR-Kontrolle und ärztlicher Dosisanpassung einsetzen.”

Feedback “Einfach beide nehmen” young:
“Gefährlich — dann wird der Blutverdünner zu stark und Blutungen werden wahrscheinlicher.”

Feedback “Einfach beide nehmen” adult:
“Gefährlich — unkontrollierte INR-Erhöhung mit Blutungsrisiko.”

Feedback “Nur Magenschutz” young:
“Magenschutz schützt nicht vor zu dünnem Blut. Die Blut-Balance steigt trotzdem zu hoch.”

Feedback “Nur Magenschutz” adult:
“Ein PPI senkt den INR nicht. Das Blutungsrisiko durch die erhöhte Antikoagulation bleibt.”

Feedback “Blutverdünner weglassen” young:
“Vorsicht — ohne Blutverdünner ist Herr Schmidt nicht mehr vor Blutklumpen geschützt.”

Feedback “Phenprocoumon absetzen” adult:
“Gefährlich — eigenmächtiges Absetzen nimmt den Schlaganfallschutz und erhöht das Thrombose-/Embolierisiko.”

Feedback “Antibiotikum-Dosis erhöhen” adult:
“Falsch — mehr Hemmstoff verschärft die Interaktion und kann den INR weiter erhöhen.”

Torso movement:

- Correct safe strategy: from warning/demo level back to 62, green
- Ignore / simply take both: 62 or 76 → 88, critical high → LOSE Überdosis/Blutung
- Only stomach protection: 62 or 76 → 84, critical high → LOSE Überdosis/Blutung
- Stop blood-thinner: 62 or 76 → 28, critical low → LOSE Unterdosiert/Thrombose
- Increase antibiotic dose: 62 or 76 → 92, critical high → LOSE Überdosis/Blutung

Scoring:
+0.5★ if a safe strategy is chosen first try.

Loss rule:
Dangerous choices in this stage end the game after explanation and torso movement.
Retry offered after loss.

Stage 7 — Safe-plan builder finale

Purpose:
Replace the current pharmacist-only finale with a generally understandable final task:
“What belongs in the safe plan?”

This is win-path only.
Torso holds green around 62 and may glow gently.

Interaction:
Show a clipboard or medication-plan board.
The player sorts action cards into:

- “gehört in den sicheren Plan”
- “nicht sicher”

Young prompt:
“Baue den sicheren Plan für Herr Schmidt. Welche Karten gehören dazu?”

Adult prompt:
“Stelle den sicheren Managementplan zusammen.”

Young correct cards:

- “Alle Medikamente zeigen”
- “Apotheke/Arztpraxis fragen”
- “Blut-Balance / Blutwert prüfen”
- “Besser passendes Antibiotikum prüfen”
- “Auf Blutungszeichen achten”

Young wrong cards:

- “Blutverdünner verstecken”
- “Blutverdünner alleine weglassen”
- “Nur Magenschutz und weiter so”
- “Doppelt Antibiotikum nehmen”

Adult correct cards:

- “Vollständigen Medikationsplan abgleichen”
- “INR engmaschig kontrollieren”
- “Interaktionsärmere Antibiose prüfen”
- “Ärztliche Dosisanpassung nur kontrolliert”
- “Patient auf Blutungszeichen hinweisen”

Adult wrong cards:

- “VKA eigenmächtig absetzen”
- “Nur PPI ergänzen”
- “Clarithromycin ohne Monitoring fortführen”
- “Antibiotikum-Dosis erhöhen”

Feedback all correct young:
“Perfekt — so bleibt Herr Schmidt geschützt und die Blut-Balance im grünen Bereich.”

Feedback all correct adult:
“Korrekt — vollständiger Cross-Check, Monitoring und kontrolliertes Management.”

Wrong feedback:
“Das gehört nicht in einen sicheren Plan. Versuch es nochmal.”

Scoring:
+0.5★ if the safe plan is built without any wrong card.

Optional:
If the player chooses one wrong card, snap it back and allow retry, but remove the +0.5★ finale star.

Stage 8 — Outcome / debrief

Win condition:
Safe strategy chosen and safe-plan builder completed.

Win copy young:
“Sicher kombiniert! 🎉 Herr Schmidt bleibt geschützt: keine Blutklumpen, keine unnötige Blutungsgefahr.”

Win copy adult:
“Sicher kombiniert — Gerinnungsschutz erhalten, Blutungsrisiko kontrolliert, Medikationsplan geprüft.”

Lose — overdose / bleeding:
Triggered by ignoring interaction, adding only stomach protection, or increasing antibiotic dose.

Young:
“Die Blut-Balance ist zu hoch gestiegen. Das Blut ist zu dünn — Blutungen werden gefährlicher.”

Adult:
“INR / Antikoagulationswirkung zu hoch → erhöhtes Blutungsrisiko.”

Lose — underdose / clot or stroke:
Triggered by stopping the blood-thinner.

Young:
“Jetzt ist zu wenig Schutz da. Es können gefährliche Blutklumpen entstehen.”

Adult:
“VKA abgesetzt → Verlust des Schlaganfallschutzes → Thrombose-/Embolierisiko.”

Debrief young:

1. “Eine Wechselwirkung entsteht oft durch zwei Mittel zusammen — hier neues Antibiotikum + Blutverdünner.”
2. “Das Antibiotikum kann den Blutverdünner stärker machen.”
3. “Zu viel Blutverdünnung bedeutet Blutungsgefahr.”
4. “Zu wenig Blutverdünnung bedeutet Gefahr durch Blutklumpen.”
5. “Darum immer den ganzen Medikamentenplan zeigen und Fachleute fragen.”

Debrief adult:

1. “Clarithromycin kann die Phenprocoumon-Wirkung erhöhen; klinisch relevant ist der INR-Anstieg.”
2. “Das Risiko ist Blutung bei zu starker Antikoagulation.”
3. “Eigenmächtiges Absetzen des VKA ist ebenfalls gefährlich, weil der Schlaganfallschutz verloren geht.”
4. “Management: interaktionsärmere Antibiose prüfen oder engmaschige INR-Kontrolle mit ärztlicher Dosisanpassung.”
5. “Der zentrale Apotheken-Schritt ist der Cross-Check: jede neue Medikation gegen den gesamten Bestand prüfen.”

Star scoring:
Award six half-star checks:

1. +0.5★ Balance tutorial check correct first try.
2. +0.5★ Interaction scanner finds blood-thinner pair first try.
3. +0.5★ Direction check correct first try: antibiotic makes blood-thinner effect too strong.
4. +0.5★ Warning signs sorted correctly without wrong placement.
5. +0.5★ Safe strategy chosen first try.
6. +0.5★ Safe-plan builder completed without wrong card.

Total possible: 3.0★.

If the player loses:
Show loss rank only.

If the player wins:
Show star total and rank:

- 1.0★ → “Apotheken-Azubi” / “Pharmazie-Azubi”
- 1.5★ → “Rezept-Profi” / “PTA (Assistenz)”
- 2.0★ → “Dosis-Detektiv” / “Apotheker:in”
- 2.5★ → “Interaktions-Profi” / “Fachapotheker:in”
- 3.0★ → “SafePolyMed-Meister” / “Klinische:r Pharmazeut:in”

Data model suggestion:

Use generic card roles for young mode and real drug names as adult sublabels.

Medication cards:
[
{
id: "blood_thinner",
labelYoung: "Blutverdünner",
labelAdult: "Phenprocoumon / Marcumar",
roleYoung: "Schutz vor Blutklumpen",
roleAdult: "Vitamin-K-Antagonist",
emoji: "🩸",
isExisting: true
},
{
id: "antibiotic",
labelYoung: "Neues Antibiotikum",
labelAdult: "Clarithromycin",
roleYoung: "gegen Bronchitis",
roleAdult: "Makrolid-Antibiotikum",
emoji: "💊",
isNew: true
},
{
id: "stomach_protection",
labelYoung: "Magenschutz",
labelAdult: "Pantoprazol",
emoji: "🛡️",
isExisting: true
},
{
id: "sugar_medicine",
labelYoung: "Zucker-Mittel",
labelAdult: "Metformin",
emoji: "🍬",
isExisting: true
},
{
id: "blood_pressure",
labelYoung: "Blutdruck-Mittel",
labelAdult: "Ramipril",
emoji: "❤️",
isExisting: true
},
{
id: "heart_rate",
labelYoung: "Herz-Mittel",
labelAdult: "Metoprolol",
emoji: "💓",
isExisting: true
}
]

Interaction scanner:

- correct pair: antibiotic + blood_thinner
- all other existing cards are safe/neutral in this simplified story
- scanning wrong cards gives feedback but no loss

Implementation notes:

- The old pair-link mechanic can be reused conceptually, but it should be presented as a scanner/check tool rather than a blind pair quiz.
- Tap interaction must be primary and fully functional on the touch screen.
- Drag/beam/line visuals are optional enhancement.
- Do not rely on real medication photos. Use CSS/SVG/emoji cards.
- Use “Blut-Balance” visual scale for young mode.
- Use adult sublabels for real terms.
- Keep the torso active: green balance, warning rise, strategy win/loss movement.
- Keep all action cards large enough for finger input.
- Keep wrong answers educational: explain first, then retry unless the choice is a dangerous strategy in Stage 6.

Suggested implementation order:

1. Add new story metadata/title and route.
2. Add medication-card data with young/adult labels.
3. Implement Stage 0–2 static/story screens and new-antibiotic card entry.
4. Implement Balance tutorial and first scoring flag.
5. Implement InteractionScanner component.
6. Implement torso effect demo with safe demo cap if needed.
7. Implement warning-sign sorting component, reusing existing sort/grid patterns if possible.
8. Implement Strategy choice using existing Choice[]/moveTo branching.
9. Implement SafePlanBuilder component, reusing existing card-sort/multi-select logic.
10. Wire six half-star scoring flags and new rating table.
11. Add win/loss debrief copy.
12. Play-test young mode first: no INR required, no drug-name memorisation required.
13. Tune torso levels and animation timing.

Acceptance criteria:

- Young players can understand the story without knowing INR, Phenprocoumon, or Clarithromycin.
- The first real task is not a pure guess; the scanner lets the player investigate.
- The torso moves in multiple meaningful places:
  - stable green balance,
  - interaction effect rises,
  - safe strategy returns to green,
  - wrong strategies produce high bleeding-risk or low clot-risk outcomes.

- The story has at least 7 meaningful interaction stages.
- The final task is a safe-plan builder, not a pharmacist-only interaction-classification quiz.
- Adult mode still contains the real clinical terms.
- The story teaches that a new medication must be checked against the whole existing plan.
- The story teaches both dangers: too much blood-thinner effect and stopping the blood-thinner.
- Star scoring uses the new 0–3★ system in 0.5 increments.
- Loss outcomes override partial stars.
