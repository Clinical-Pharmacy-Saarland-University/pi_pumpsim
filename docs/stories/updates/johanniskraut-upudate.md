Implement the expanded Johanniskraut × Ciclosporin story.

Story title:
“Das pflanzliche Leck”

Core learning goal:
Johanniskraut is a CYP3A4/P-gp inducer. It lowers Ciclosporin exposure and can lead to under-immunosuppression and transplant rejection. The player should learn:

1. natural/herbal does not mean harmless;
2. herbal products belong in the medication history;
3. induction builds over days, not instantly;
4. the safe response is to stop Johanniskraut and get professional help, not to self-adjust Ciclosporin.

Use the new star system:

- loss → “Noch in Ausbildung” / “In Einarbeitung”
- 1.0★ → “Apotheken-Azubi” / “Pharmazie-Azubi”
- 1.5★ → “Rezept-Profi” / “PTA (Assistenz)”
- 2.0★ → “Dosis-Detektiv” / “Apotheker:in”
- 2.5★ → “Interaktions-Profi” / “Fachapotheker:in”
- 3.0★ → “SafePolyMed-Meister” / “Klinische:r Pharmazeut:in”

Do not show a named rank for 0.5★. If the player loses, show the loss rank instead of partial stars.

Implement 8 meaningful interaction stages.

Stage 0 — Briefing

Purpose:
Introduce Frau Berger, kidney transplant, and Ciclosporin as the “protective medicine”.

Young copy:
“Frau Berger, 54, hat eine neue Niere bekommen. Damit ihr Körper die neue Niere nicht wegschiebt, nimmt sie jeden Tag ein Schutz-Medikament.”

Adult copy:
“Frau Berger, 54, nach Nierentransplantation. Zum Schutz des Transplantats vor Abstoßung nimmt sie täglich Ciclosporin.”

Goal copy young:
“Halte den Schutz im grünen Bereich. Wenn er zu tief fällt, ist die neue Niere in Gefahr.”

Goal copy adult:
“Halte den Ciclosporin-Talspiegel im therapeutischen Fenster. Fällt er zu tief, droht Abstoßung.”

Torso:
Start at 40, below band.

Stage 1 — Standarddosis

Interaction:
Tap “Standarddosis geben”.

Torso:
40 → 62.

Young reveal:
“Genau richtig — im grünen Bereich! Die neue Niere ist geschützt.”

Adult reveal:
“Im therapeutischen Fenster — Transplantat sicher immunsupprimiert.”

Scoring:
No star; tutorial only.

Stage 2 — Wochen-Zeitleiste

Purpose:
Show that the problem develops slowly and is not an immediate one-breakfast effect.

Interaction:
The player taps or swipes through a 7-day timeline.

Days should show small routine cards:

- Montag: Ciclosporin wie immer
- Dienstag: neuer Kräutertee im Schrank
- Mittwoch: pflanzliche Stimmungskapseln
- Donnerstag: Spaziergang
- Freitag: schlecht geschlafen
- Samstag: gesund gegessen
- Sonntag: Schutz fällt sichtbar

Torso:
Start at 62.
During timeline, slowly drift down to about 58 or 55, not critical.

Young copy:
“Eine Woche später: Frau Berger hat ein paar Dinge in ihrer Routine verändert. Der Schutz fällt nicht sofort — aber nach und nach.”

Adult copy:
“Die neue Exposition wirkt verzögert: Induktion baut sich über Tage auf. Der Talspiegel beginnt langsam zu sinken.”

Scoring:
No star; setup and pharmacology timing.

Stage 3 — Teeküchen-/Taschen-Check

Purpose:
Make the player actively discover the hidden medication-history issue.

Interaction:
Show a table, bag, or tea-kitchen shelf with item cards.
The player drags suspicious/new/medicine-like items into a “Lupe / Medikationscheck” area.
Add a “Fertig” button.

Items:
Correct suspicious items:

- “Pflanzlicher Stimmungstee” with flower/herb icon
- “Stimmungskapseln — pflanzlich”

Harmless distractors:

- Kamillentee
- Wasserflasche
- Apfel or snack
- Spaziergang-Schuhe
- Schlafmaske
- Gesundes Essen
- Ciclosporin blister as known baseline medication

Young prompt:
“Was ist neu oder sieht aus wie ein Mittel? Zieh es in die Lupe.”

Adult prompt:
“Markiere neue Arznei-, Supplement- oder Pflanzenprodukt-Expositionen.”

Scoring:
+0.5★ if the player selects at least one Johanniskraut-related item before pressing “Fertig”.
For kids, finding either the tea or the capsules is enough.
Do not require perfect selection.
Wrong or extra harmless items do not cause loss, but they can remove the chance for a “perfect” internal flag if needed.

Feedback if found:
“Gut gesehen — dieses pflanzliche Mittel müssen wir genauer prüfen.”

Feedback if missed:
“Nicht ganz — hier war ein versteckter Hinweis. Schauen wir genauer hin.”

Story must continue even if the player misses the items.

Stage 4 — Etikett-Lupe

Purpose:
Reveal that the vague herbal item is Johanniskraut / Hypericum perforatum.

Interaction:
Player taps/holds/drags a magnifying glass over the label or peels a label corner.
Initial label:
“Pflanzlich. Für gute Stimmung.”

Reveal label:
“Johanniskraut / Hypericum perforatum”

Young copy:
“Aha! Auf dem Etikett steht Johanniskraut. Das ist auch ein Wirkstoff — nicht nur Tee.”

Adult copy:
“Wirkstoffangabe: Hypericum perforatum. Klinisch relevant bei Ciclosporin.”

Scoring:
No star. This is the correction/reveal stage.

Stage 5 — Detektivfrage

Purpose:
The player now makes the causal connection.

Prompt young:
“Detektiv-Frage: Was zieht den Schutz nach unten?”

Prompt adult:
“Was senkt den Ciclosporin-Spiegel?”

Options:

- Johanniskraut → correct
- Kamillentee → wrong
- Gesundes Essen → wrong
- Spaziergang → wrong
- Wenig Schlaf → wrong
- Viel Wasser trinken → wrong

Correct feedback young:
“Richtig erkannt — das Johanniskraut war’s!”

Correct feedback adult:
“Korrekt — Johanniskraut / Hypericum perforatum.”

Wrong feedback:
Explain briefly and retry. Do not cause loss.

Scoring:
+0.5★ if Johanniskraut is selected on the first try.

Stage 6 — Mechanismus + Zeit-Effekt

Purpose:
Teach that Johanniskraut is the inverse of grapefruit:
grapefruit blocks breakdown and raises levels;
Johanniskraut speeds cleanup/export and lowers levels.

Interaction:
Small “enzyme factory” or “cleanup team” mini-animation.
The player taps through 3–4 days or turns a dial:

- Day 1: normal cleanup
- Day 3: more cleanup helpers
- Day 7: too many cleanup helpers
- Result: Ciclosporin drops too low

Young copy:
“Johanniskraut macht das Aufräum-Team im Körper schneller. Das passiert nicht sofort — es baut sich über mehrere Tage auf. Dann wird zu viel Schutz-Medikament weggeräumt.”

Adult copy:
“Hyperforin aktiviert PXR und induziert CYP3A4 sowie P-Glykoprotein. Dadurch werden Metabolismus und Efflux von Ciclosporin gesteigert. Die Induktion baut sich verzögert über Tage auf.”

Interaction check:
Ask one simple question after the animation.

Young prompt:
“Passiert das sofort oder nach und nach?”

Adult prompt:
“Wie verhält sich eine Induktion zeitlich?”

Options:

- “Nach und nach über Tage” → correct
- “Sofort nach dem ersten Schluck” → wrong
- “Nur wenn man gleichzeitig Ciclosporin nimmt” → wrong

Feedback correct:
“Genau — Induktion braucht Zeit.”

Feedback wrong:
“Fast — anders als ein Soforteffekt baut sich Induktion erst nach und nach auf.”

Scoring:
+0.5★ if correct on first try.

Stage 7 — Strategie wählen

Purpose:
Reintroduce a real strategy decision before the leak finale.

Prompt young:
“Der Schutz fällt. Was ist sicher?”

Prompt adult:
“Wie sollte Frau Berger sicher reagieren?”

Young options:

1. “Johanniskraut stoppen und Hilfe holen” → correct
2. “Mehr Tee trinken” → wrong
3. “Einfach doppelt so viel Schutz-Medikament nehmen” → wrong/danger
4. “Abwarten” → wrong

Adult options:

1. “Johanniskraut absetzen + Transplant-Ambulanz/Apotheke kontaktieren” → correct
2. “Talspiegel kontrollieren lassen” → partial-correct, explain that it is needed but not sufficient alone
3. “Ciclosporin eigenmächtig erhöhen” → wrong/danger
4. “Johanniskraut-Dosis steigern” → wrong
5. “Nichts tun, weil pflanzlich” → wrong

Correct feedback young:
“Genau — das Pflanzenmittel stoppen und Fachleute fragen. Nicht selbst an der Dosis drehen.”

Correct feedback adult:
“Richtig — Johanniskraut absetzen, Talspiegel prüfen und Transplantationszentrum/ärztliche Stelle einbeziehen. Keine eigenmächtige Ciclosporin-Anpassung.”

Wrong feedback:
Explain and retry unless the design wants immediate loss for dangerous options. Preferred: explain + retry, because the leak finale provides the real loss pressure.

Scoring:
+0.5★ if the safe strategy is chosen first try.
For adult mode, “Talspiegel kontrollieren lassen” alone should not get the full strategy star unless combined with stopping Johanniskraut/professional contact.

Stage 8 — Leck-Finale: “Stopp das Leck”

Purpose:
Action climax. The level is falling; the player must seal the right interventions and avoid bait.

Interaction:
Real-time drag-to-seal defense.
Use the existing/spec’d leak mechanic:

- cracks/leaks appear on a sign/shelf
- player drags patch cards onto correct leaks
- wrong bait cards cause a short downward burst
- the torso level drifts downward while leaks are open
- soft floor must stay above the critical-low auto-trip threshold

Visual:
CSS/SVG shelf-sign or board.
Use emoji/card UI:

- 🌿 Johanniskraut absetzen
- 🩸 Spiegel messen lassen
- 📞 Transplant-Ambulanz anrufen
- 🍵 Mehr Tee trinken
- 💊 Heimlich Dosis verdoppeln
- 🌼 Noch ein Naturmittel dazu

Real leaks:

1. “Johanniskraut absetzen” — dominant / required for basic win
2. “Spiegel messen lassen” — good follow-up
3. “Transplant-Ambulanz anrufen” — good follow-up

Bait:

1. “Mehr Tee trinken”
2. “Heimlich Dosis verdoppeln”
3. “Noch ein Naturmittel dazu”

Basic win:
Seal “Johanniskraut absetzen” before timeout. The level should stop falling and recover toward green.

Professional/perfect win:
Seal all three real actions, draw no bait, and keep the level above the Profi threshold.

Loss:
If the player fails to seal the key action before the committed timeout, the level falls to critical low and outcome is underdosing/rejection. There is no overdose path in this story.

Scoring:
+0.5★ if the player survives the leak finale by sealing Johanniskraut absetzen in time.
+0.5★ for Profi performance:

- all three real measures sealed;
- zero bait cards dragged;
- minimum level never below 45.

Outcome / Debrief

If loss:
Show loss rank only:
Young: “Noch in Ausbildung”
Adult: “In Einarbeitung”

Loss copy young:
“Der Schutz ist zu tief gefallen — die neue Niere ist in Gefahr. Probier’s nochmal!”

Loss copy adult:
“Subtherapeutischer Ciclosporin-Spiegel → Abstoßungsgefahr. Deshalb: Johanniskraut absetzen, Talspiegel kontrollieren und ärztlich gegensteuern.”

If win:
Show star total and rank using the new star system.

Debrief young:

1. “Johanniskraut kurbelt das Aufräum-Team an — dann kann zu wenig Schutz-Medikament da sein.”
2. “Natürlich heißt nicht harmlos.”
3. “Tee, Kapseln und Pflanzenmittel gehören auch in den Medikationscheck.”
4. “Nicht selbst die Dosis ändern — Fachleute fragen.”

Debrief adult:

1. “Hyperforin induziert über PXR CYP3A4 und P-Glykoprotein.”
2. “Ciclosporin-Exposition sinkt → subtherapeutischer Talspiegel → Abstoßungsgefahr.”
3. “Pflanzliche Präparate und Supplements sind Teil der Arzneimittelanamnese.”
4. “Management: Johanniskraut absetzen, Talspiegel kontrollieren, Transplantationszentrum/ärztliche Stelle einbeziehen.”

Asset plan:
Use only one external real image if needed: a licensed Johanniskraut / Hypericum perforatum plant photo for the story card or intro.
Preferred sources:

- Wikimedia Commons
- Openverse / Creative Commons search
- CC0 image repositories

Do not use:

- Amazon/Walmart/product listing photos
- real supplement brand labels
- random Google Images
- images without a clear license

For in-game items, use custom CSS/SVG/emoji cards instead of product photos:

- generic tea tin
- generic capsule bottle
- generic label saying “pflanzlich”
- generic “Johanniskraut / Hypericum perforatum” reveal

For every external image, create an attribution record:
{
"file": "hypericum-perforatum.jpg",
"title": "...",
"author": "...",
"source": "...",
"license": "CC BY-SA 4.0 / CC BY 4.0 / CC0 / public domain",
"changes": "cropped/resized/color adjusted or none"
}

Implementation order:

1. Add story data and stage IDs.
2. Implement static screens: briefing, standard dose, mechanism, debrief.
3. Implement week timeline.
4. Implement Teeküchen-/Taschen-Check.
5. Implement label magnifier/reveal.
6. Implement detective question.
7. Implement enzyme-factory timing check.
8. Implement strategy question.
9. Implement leak finale.
10. Wire scoring and new star rank display.
11. Add asset attribution metadata.
12. Play-test kid mode first for readability and touch target size.
13. Then tune adult wording and leak difficulty.

Acceptance criteria:

- The player can miss the Johanniskraut item during the Teeküchen-/Taschen-Check and still continue, but loses the related +0.5★.
- The story no longer gives away the answer in the intro.
- There are 8 meaningful interaction stages.
- The story teaches delayed induction, not immediate inhibition.
- The leak finale remains the climax, not the only real question.
- “Johanniskraut absetzen” is the key survival action.
- “Spiegel messen” and “Transplant-Ambulanz anrufen” improve the score/performance.
- Dangerous options never become valid solutions.
- There is no overdose ending.
- External images are licensed and attributed, or replaced with custom CSS/SVG/emoji graphics.
