Redesign and implement the Codein × CYP2D6 pharmacogenetics story.

Current story problem:
The existing story gives away too much by showing “slow / normal / ultra-fast” before asking the player to classify the outcome. This makes the first question too obvious. The later tramadol-related check is also not intuitive for kids and is not fun. The story must become longer, more visual, and use torso movement much more strongly.

New story title:
“Die Codein-Werkstatt”

Alternative display title:
“Gleiche Pille, anderes Gen”

Core learning goal:
The player should learn that Codein is a prodrug. It must be converted by CYP2D6 into Morphin. Because people can have different CYP2D6 activity, the same Codein dose can lead to too little effect, the right effect, or too much Morphin. The correct response for problematic CYP2D6 phenotypes is not to adjust Codein dose, but to use a pain medicine that does not depend on CYP2D6 activation.

Important design principle:
Do not reveal the CYP2D6 types at the start. First let the torso show the mystery:
same pill, same dose, three different outcomes.
Then the player investigates why.

Use the new star system:

- loss → young: “Noch in Ausbildung”; adult: “In Einarbeitung”
- 1.0★ → young: “Apotheken-Azubi”; adult: “Pharmazie-Azubi”
- 1.5★ → young: “Rezept-Profi”; adult: “PTA (Assistenz)”
- 2.0★ → young: “Dosis-Detektiv”; adult: “Apotheker:in”
- 2.5★ → young: “Interaktions-Profi”; adult: “Fachapotheker:in”
- 3.0★ → young: “SafePolyMed-Meister”; adult: “Klinische:r Pharmazeut:in”

Loss overrides partial stars. If the player reaches a loss outcome, show the loss rank instead of partial star ranking.

Do not show a named 0.5★ rank.

Engine / torso levels:
Use the standard normalized level model:

- green therapeutic band: 55–70
- baseline: 40
- critical low: 35
- critical high: 80
- standard safe target: 62

Patient result levels:

- Patient A / Poor Metabolizer: result level about 37, clearly too low but just above critical-low
- Patient B / Normal Metabolizer: result level about 62, green
- Patient C / Ultra-rapid Metabolizer: real toxic result about 85, but educational demo can cap at 79 with a red “toxisch” flag if needed to avoid accidental auto-loss during non-decision demonstration phases

If the engine auto-finishes on critical-high/critical-low in PLAY phases, make sure early demonstration phases are non-loss demonstration phases or cap the UM demo at 79 with a clear red danger overlay. Strategy/loss phases may use the true toxic level.

Main stage flow:
0 Briefing
1 Same pill challenge
2 Observation question
3 Gene scanner
4 Codein-to-Morphin factory
5 Match outcome to patient
6 Treat Patient A / poor metabolizer
7 Treat Patient C / ultra-rapid metabolizer
8 Medicine cabinet finale
9 Outcome / debrief

This should create 8 meaningful interaction stages:

1. same pill given to all three
2. observation question
3. gene scanner
4. Codein-to-Morphin factory
5. outcome matching
6. poor-metabolizer treatment
7. ultra-rapid-metabolizer treatment
8. medicine cabinet finale

Stage 0 — Briefing

Purpose:
Introduce three similar patients with pain. Do not yet reveal CYP2D6 status.

Do not call them “Zwillinge”, because genetically different “twins” can confuse adult users. Use “drei Patient:innen”, “drei Geschwister”, or “drei Kinder” depending on visual style.

Young copy:
“Drei Kinder haben Zahnweh nach einem kleinen Eingriff. Alle bekommen dieselbe Schmerztablette. Eigentlich müsste das doch bei allen gleich helfen … oder?”

Adult copy:
“Drei Patient:innen erhalten nach einem kleinen Eingriff dieselbe Codein-Dosis. Die Frage: Warum kann die Wirkung trotzdem unterschiedlich sein?”

Goal young:
“Bring alle sicher in den grünen Bereich — nicht zu wenig, nicht zu viel.”

Goal adult:
“Stelle alle drei sicher ein. Gleiche Dosis bedeutet nicht automatisch gleiche Wirkung.”

Torso:
Start at 40.

Stage 1 — Same pill challenge

Purpose:
Create the mystery through torso movement.

Interaction:
Show three patients as cards:

- Patient A
- Patient B
- Patient C

Do not show genotype labels yet.
Show one identical Codein pill card/sprite.
The player gives the same pill to each patient by tapping or dragging the pill onto the patient card.

Recommended interaction:
Tap Patient A → pill flies in → torso moves.
Tap Patient B → torso resets to 40 → pill flies in → torso moves.
Tap Patient C → torso resets to 40 → pill flies in → torso moves.

Torso movement:

- Patient A: 40 → 37, low / almost no effect
- Patient B: 40 → 62, green
- Patient C: 40 → 79 in demo, with red “toxisch” warning flag; internally the true result is 85 for later strategy/loss logic

After each patient, freeze a small mini-bar next to their card:

- Patient A mini-bar: low
- Patient B mini-bar: green
- Patient C mini-bar: high/red warning

Young screen text:
“Gleiche Tablette. Gleiche Dosis. Aber schau genau, was passiert!”

Adult screen text:
“Identische Codein-Dosis — drei unterschiedliche Spiegel.”

Reveal after all three:
Young:
“Komisch! Bei einem passiert fast nichts, bei einem passt es, und bei einem wird es gefährlich viel.”

Adult:
“Auffällig: dieselbe Dosis führt zu subtherapeutischem, therapeutischem und toxischem Effekt.”

Scoring:
No star here. This is the hook.

Stage 2 — Observation question

Purpose:
Ask a non-obvious question based on the observed torso behaviour, not on pre-labelled genotypes.

Prompt young:
“Was ist hier das Rätsel?”

Options young:

1. “Die gleiche Tablette wirkt bei allen anders.” → correct
2. “Patient A hat zu wenig Wasser getrunken.” → wrong
3. “Patient C hat zu schnell geklickt.” → wrong/playful
4. “Die Tablette war kaputt.” → wrong

Correct feedback young:
“Genau! Die Tablette war gleich — aber die Körper haben unterschiedlich reagiert.”

Wrong feedback young:
“Nicht ganz. Die Tablette war gleich. Das Rätsel steckt im Körper der Patient:innen.”

Prompt adult:
“Was zeigt die Beobachtung?”

Options adult:

1. “Gleiche Dosis kann je nach Patient:in unterschiedliche Wirkung erzeugen.” → correct
2. “Die Dosis war bei allen falsch.” → wrong
3. “Der Effekt erklärt sich durch Einnahmezeitpunkt.” → wrong
4. “Codein wirkt unabhängig vom Stoffwechsel.” → wrong

Correct feedback adult:
“Richtig. Die individuelle Aktivierung von Codein bestimmt die Wirkung.”

Wrong feedback adult:
“Nein. Entscheidend ist hier nicht der Einnahmezeitpunkt, sondern die patientenspezifische Aktivierung.”

Scoring:
+0.5★ if correct on first try.

Wrong answers:
Explain + retry. No loss.

Stage 3 — Gene scanner

Purpose:
Reveal the hidden reason after the player has seen the mystery.

Interaction:
Show a “Gen-Scanner”, “Wangenabstrich”, or “Labor-Lupe”.
The player drags/taps the scanner onto each patient.
After scanning, reveal hidden badges.

Badges young:

- Patient A: 🐢 “Umbau-Maschine sehr langsam”
- Patient B: ✅ “Umbau-Maschine normal”
- Patient C: 🚀 “Umbau-Maschine sehr schnell”

Badges adult:

- Patient A: CYP2D6 Poor Metabolizer
- Patient B: CYP2D6 Normal Metabolizer
- Patient C: CYP2D6 Ultra-rapid Metabolizer

Young copy:
“Jetzt sehen wir den Unterschied: In jedem Körper arbeitet die Umbau-Maschine anders schnell.”

Adult copy:
“Der Gen-Check zeigt unterschiedliche CYP2D6-Metabolisierertypen.”

Micro-interaction:
After scanning all three, ask one simple check.

Prompt young:
“Was war bei allen gleich?”

Options:

1. “Die Tablette.” → correct
2. “Die Umbau-Maschine.” → wrong
3. “Der Spiegel.” → wrong

Prompt adult:
“Was war kontrolliert gleich?”

Options:

1. “Codein-Dosis.” → correct
2. “CYP2D6-Aktivität.” → wrong
3. “Morphinbildung.” → wrong

Correct feedback:
“Genau — die Dosis war gleich. Der Unterschied lag im Körper.”

Wrong feedback:
“Fast — die Körper waren unterschiedlich. Gleich war die Tablette.”

Scoring:
+0.5★ if this check is correct first try.

Stage 4 — Codein-to-Morphin factory

Purpose:
Make the prodrug mechanism visual and playful. This should be the central child-friendly concept.

Visual metaphor:
A small factory or machine:
Codein pill → CYP2D6 machine → Morphin helper

For each patient, the player drops a Codein pill into that patient’s machine.

Machines:

- Patient A: tiny/broken/slow machine → almost no Morphin drops come out
- Patient B: normal machine → right amount of Morphin
- Patient C: turbo machine → too much Morphin floods out

Torso movement:
Repeat or visually mirror the already observed levels:

- A: low / barely moves
- B: green
- C: high warning

Young copy:
“Codein ist noch nicht der starke Schmerz-Helfer. Der Körper muss es erst umbauen. Dafür braucht er eine Maschine: CYP2D6.”

Adult copy:
“Codein ist ein Prodrug. CYP2D6 wandelt Codein durch O-Demethylierung in Morphin um.”

Young per-patient feedback:

- A:
  “Bei Patient A arbeitet die Maschine kaum. Es entsteht fast kein Morphin — die Schmerzen bleiben.”
- B:
  “Bei Patient B arbeitet die Maschine genau richtig. Der Spiegel landet im grünen Bereich.”
- C:
  “Bei Patient C ist die Maschine zu schnell. Es entsteht zu viel Morphin — das kann gefährlich für die Atmung werden.”

Adult per-patient feedback:

- A:
  “Poor Metabolizer: kaum Morphinbildung → unzureichende Analgesie.”
- B:
  “Normal Metabolizer: erwartete Morphinbildung → therapeutischer Effekt.”
- C:
  “Ultra-rapid Metabolizer: exzessive Morphinbildung → Toxizitäts-/Atemdepressionsrisiko.”

Scoring:
No separate star unless you need one for pacing. The key scoring for this concept happens in the next matching stage.

Stage 5 — Match outcome to patient

Purpose:
Now the low/right/high sorting becomes fair and meaningful, because the player has observed the torso and factory.

Interaction:
Show the three patient cards with their revealed gene/machine badges.
Show three bins:

- “wirkt kaum / zu wenig”
- “passt / genau richtig”
- “zu stark / gefährlich”

Young bin labels:

- 🟦 “zu wenig”
- 🟩 “genau richtig”
- 🟥 “zu viel”

Adult bin labels:

- “subtherapeutisch”
- “therapeutisch”
- “toxisch”

Correct mapping:

- Patient A / 🐢 / PM → low / too little
- Patient B / ✅ / NM → right / green
- Patient C / 🚀 / UM → high / too much

Feedback for correct full match:
Young:
“Perfekt! Langsame Maschine: zu wenig. Normale Maschine: genau richtig. Turbo-Maschine: zu viel.”

Adult:
“Korrekt: PM → subtherapeutisch, NM → therapeutisch, UM → toxisch.”

Feedback for common wrong answer Patient C → low:
Young:
“Aufgepasst: Schnell heißt hier nicht ‘schnell weg’. Schnell heißt: Codein wird schnell in starkes Morphin umgebaut — also zu viel.”

Adult:
“Nein. Bei Codein bedeutet UM schnellere Aktivierung des Prodrugs zu Morphin, nicht einfach schnellere Elimination.”

Feedback for Patient A → high:
Young:
“Nein — bei Patient A fehlt fast die Umbau-Maschine. Ohne Umbau entsteht zu wenig Morphin.”

Adult:
“Nein. PM bilden kaum Morphin; das Problem ist fehlende Wirkung, nicht Überdosierung.”

Wrong answers:
Explain + retry. No loss.

Scoring:
+0.5★ if all three are matched correctly without any wrong placement.

Stage 6 — Strategy: Treat Patient A / Poor Metabolizer

Purpose:
Teach that raising Codein does not solve missing activation.

Set active patient:
Patient A.
Show mini-bar low at about 37.
Torso starts at or moves to 37.

Prompt young:
“Patient A hat noch Schmerzen. Was hilft?”

Options young:

1. “Anderes Schmerzmittel, das die Codein-Maschine nicht braucht” → correct
2. “Mehr Codein geben” → wrong / underdose loss
3. “Einfach warten” → wrong / explain + retry or loss
4. “Noch eine gleiche Tablette” → wrong / underdose loss

Prompt adult:
“PM, subtherapeutisch — wie behandelst du sicher?”

Options adult:

1. “Nicht-CYP2D6-aktiviertes Analgetikum, z. B. Ibuprofen/Paracetamol” → correct
2. “Codein-Dosis erhöhen” → wrong / underdose loss
3. “Bei Codein bleiben” → wrong / underdose loss
4. “Tramadol” → adult-only trap; wrong because CYP2D6-dependent

Young correct feedback:
“Genau! Er braucht ein Schmerzmittel, das nicht erst von dieser Maschine angeschaltet werden muss.”

Adult correct feedback:
“Richtig. Bei PM sollte Codein vermieden und ein nicht-CYP2D6-abhängiges Analgetikum gewählt werden.”

Feedback for “Mehr Codein” young:
“Bringt nichts! Es fehlt die Umbau-Maschine. Mehr Codein macht trotzdem kaum Morphin.”

Feedback for “Mehr Codein” adult:
“Wirkungslos als Lösung: Bei fehlender CYP2D6-Aktivität entsteht auch aus mehr Codein kaum Morphin.”

Feedback for “Bei Codein bleiben”:
“Dann bleibt der Spiegel zu tief und die Schmerzen bleiben.”

Feedback for Tramadol adult:
“Keine gute Ausweichlösung: Tramadol ist ebenfalls CYP2D6-abhängig.”

Torso:

- Correct: 37 → 62, green
- More Codein / stay with Codein: remains about 37 or briefly shakes low → LOSE Unterdosiert
- Tramadol adult trap: remains under-effective or marked unsuitable → explain + retry or loss depending engine design. Preferred: explain + retry in final cabinet; in this strategy stage use loss only for Codein-related wrong choices.

Scoring:
+0.5★ if correct safe treatment is chosen first try.

Stage 7 — Strategy: Treat Patient C / Ultra-rapid Metabolizer

Purpose:
Teach that Codein can become dangerous in ultra-rapid metabolizers.

Set active patient:
Patient C.
Show mini-bar high/toxic.
Torso starts at true toxic result around 85 if this is a PLAY/loss-capable phase.

Prompt young:
“Patient C macht viel zu viel starken Schmerz-Helfer. Was ist sicher?”

Options young:

1. “Weg von Codein: anderes Schmerzmittel” → correct
2. “Mehr Codein geben” → dangerous / overdose loss
3. “Bei Codein bleiben” → overdose loss
4. “Noch schneller wirken lassen” → playful wrong / overdose loss or retry

Prompt adult:
“UM, toxischer Morphin-Effekt — wie behandelst du sicher?”

Options adult:

1. “Codein vermeiden; nicht-CYP2D6-aktiviertes Analgetikum wählen” → correct
2. “Codein-Dosis erhöhen” → dangerous / overdose loss
3. “Bei Codein bleiben” → overdose loss
4. “Tramadol” → adult-only trap; wrong because CYP2D6-dependent

Young correct feedback:
“Genau! Kein Codein mehr — sonst wird zu viel starkes Morphin daraus.”

Adult correct feedback:
“Richtig. Bei UM sollte Codein vermieden werden, da exzessive Morphinbildung droht.”

Feedback for “Mehr Codein” young:
“Gefährlich! Noch mehr Codein macht bei ihm noch mehr Morphin. Das kann die Atmung bedrohen.”

Feedback for “Mehr Codein” adult:
“Gefährlich: mehr Substrat bei ultra-rascher Aktivierung → noch mehr Morphin → Atemdepressionsrisiko.”

Feedback for “Bei Codein bleiben”:
“Dann bleibt es zu viel. Das ist gefährlich.”

Feedback for Tramadol adult:
“Keine sichere Alternative: Tramadol ist ebenfalls CYP2D6-abhängig.”

Torso:

- Correct: 85 → 62, green
- More Codein: 85 → 92, critical high → LOSE Überdosis
- Stay with Codein: holds around 85 → LOSE Überdosis

Scoring:
+0.5★ if correct safe treatment is chosen first try.

Stage 8 — Medicine cabinet finale

Purpose:
Replace the boring tramadol question with an intuitive final selection task.
The player chooses safe pain medicine cards from a cabinet.

Visual:
Medicine cabinet with cards.
Show three patient mini-bars. Patient B is already green. Patient A and C need safe non-CYP2D6 options.

Young prompt:
“Welche Schmerzmittel-Karte braucht die Codein-Maschine nicht?”

Young cards:

- “Ibuprofen / Paracetamol” → correct
- “Mehr Codein” → wrong
- “Nochmal Codein” → wrong
- “Stärkerer Codein-Saft” → wrong
- optional playful wrong: “Zauber-Zahnbonbon” → wrong but harmless/funny

Adult prompt:
“Welche Option ist für PM/UM als Codein-Ausweichstrategie geeignet?”

Adult cards:

- “Ibuprofen / Paracetamol” → correct
- “Mehr Codein” → wrong
- “Codein retard / andere Codein-Dosis” → wrong
- “Tramadol” → wrong professional trap
- optional “Morphin unter ärztlicher Kontrolle” → omit unless the story wants complexity; preferred to keep simple and choose non-CYP2D6 options only

Young correct feedback:
“Richtig! Diese Mittel brauchen die Codein-Umbau-Maschine nicht.”

Adult correct feedback:
“Richtig. Nicht-CYP2D6-aktivierte Analgetika umgehen das Aktivierungsproblem.”

Young wrong feedback for Codein options:
“Nein — das benutzt wieder dieselbe Codein-Maschine. Bei A wirkt es kaum, bei C wird es gefährlich.”

Adult wrong feedback for Tramadol:
“Tramadol ist keine saubere Alternative, weil auch CYP2D6 an der Aktivierung beteiligt ist.”

Interaction:
Allow the player to drag the correct card to both Patient A and Patient C, or tap the correct cabinet card once and apply it to both problem patients.
Patient B remains marked:
“Codein normal war hier okay.”

Torso:
After correct final choice, all three mini-bars stabilize in green.
Optional final torso animation:
active torso moves to 62 and glows green.

Scoring:
+0.5★ if the correct non-CYP2D6 option is chosen without selecting a Codein/tramadol trap.

Stage 9 — Outcome / Debrief

Win condition:
The player has treated Patient A and Patient C safely and completed the medicine cabinet finale.

Win copy young:
“Geschafft! Alle drei sind sicher im grünen Bereich — weil du nicht einfach nach Dosis entschieden hast, sondern nach der Umbau-Maschine. 🎉”

Win copy adult:
“Alle drei therapeutisch versorgt — genotyp-geleitete Analgetika-Auswahl statt Codein-Dosistitration.”

Lose — underdose:
Triggered by poor metabolizer staying on Codein or receiving more Codein.

Young:
“Bei Patient A kam fast kein starkes Schmerzmittel an. Mehr Codein ändert das nicht — die Umbau-Maschine fehlt.”

Adult:
“PM + Codein → kaum Morphinbildung → unzureichende Analgesie. Dosiserhöhung löst den Enzymmangel nicht.”

Lose — overdose:
Triggered by ultra-rapid metabolizer staying on Codein or receiving more Codein.

Young:
“Bei Patient C wurde zu viel Morphin gebildet. Das kann die Atmung gefährden.”

Adult:
“UM + Codein → exzessive Morphinbildung → Atemdepressionsrisiko.”

Debrief young:

1. “Codein muss im Körper erst in Morphin umgebaut werden.”
2. “Dafür braucht der Körper die CYP2D6-Umbau-Maschine.”
3. “Manche Menschen bauen fast nichts um — dann wirkt Codein kaum.”
4. “Manche bauen zu schnell um — dann kann zu viel Morphin entstehen.”
5. “Darum nimmt man bei solchen Gen-Typen ein anderes Schmerzmittel und dreht nicht einfach an der Codein-Dosis.”

Debrief adult:

1. “Codein ist ein Prodrug; CYP2D6 aktiviert Codein zu Morphin.”
2. “CYP2D6-PM bilden kaum Morphin → unzureichende Analgesie.”
3. “CYP2D6-UM können exzessive Morphinmengen bilden → Atemdepressionsrisiko.”
4. “Bei PM und UM ist ein nicht-CYP2D6-aktiviertes Analgetikum die sichere Strategie.”
5. “Tramadol ist keine saubere Alternative, weil es ebenfalls CYP2D6-abhängig ist.”

Star scoring:
Award six half-star checks:

1. +0.5★ Observation question correct first try.
2. +0.5★ Gene scanner check correct first try.
3. +0.5★ Outcome matching completed first try.
4. +0.5★ Patient A / PM treated correctly first try.
5. +0.5★ Patient C / UM treated correctly first try.
6. +0.5★ Medicine cabinet finale perfect: correct non-CYP2D6 option chosen and no Codein/tramadol trap selected.

If loss:
Show loss rank only.

If win:
Show total stars and corresponding rank.

Implementation notes:

- Hide CYP2D6 type labels until the gene scanner stage.
- Do not start with “slow / normal / fast” as the first quiz.
- Use torso movement early in Stage 1 to create the mystery.
- Use mini-bars to preserve each patient’s result while the main torso animates sequentially.
- Use Patient A/B/C labels before genotype reveal.
- Use “Codein-Maschine” or “Umbau-Maschine” for young mode.
- Use CYP2D6, prodrug, Morphinbildung, PM/NM/UM for adult mode.
- Tramadol should be adult-only or debrief-only. Do not make tramadol a central kid question.
- For kiosk/touch reliability, every drag interaction should also support tap-card-then-tap-target.
- All game cards should have large touch targets.
- The medicine cabinet should use generic icons/cards, not real product packaging.

Acceptance criteria:

- The story no longer gives away the answer in the first screen.
- The player first observes different torso outcomes before learning about CYP2D6.
- The torso moves in multiple stages: same-pill challenge, factory, PM treatment, UM treatment, final stabilization.
- There are at least 8 meaningful interaction stages.
- The story teaches “same dose, different genes, different result.”
- The story clearly teaches that Codein is activated to Morphin by CYP2D6.
- The story clearly teaches that PM leads to too little Morphin and UM leads to too much Morphin.
- The story clearly teaches not to solve PM/UM by changing Codein dose.
- Kid mode does not require knowing what tramadol is.
- Adult mode may include tramadol as a professional trap.
- Star scoring uses the new 0–3★ system in 0.5 increments.
- Loss outcomes override partial stars.
- All endings use the torso/mini-bar state consistently.
