// Copy for „Der müde Filter" (Organ/DOI · renale Clearance × Metformin). Merged into the `de`
// dict in locale.svelte.ts (last-spread-wins). v3 rework (2026-06-12): the TWO-EXITS idea.
// Wording rules the user asked for:
//  • YOUNG register avoids „Spiegel" → „wie viel Medizin im Blut ist" / „die Medizin im Blut";
//    the visible water shows the medicine. ADULT keeps „(Metformin-)Spiegel" (clinical, correct).
//  • never „zittert" (water doesn't tremble) — use „steht/steigt/staut sich höher".
//  • never „Hahn" for the dose — the dose is „die Dosis / weniger Medizin"; only the kidney is
//    the „Ausgang/Abfluss". Danger = „über/unter den grünen Bereich" (never „rote Linie").
export const organLocale: Record<string, string> = {
  // case header (persistent)
  'organ.case': 'Frau Yilmaz, 74 · Metformin',

  // beat 0 — briefing (kidney deliberately NOT mentioned yet)
  'organ.brief.patient': 'Frau Yilmaz, 74, hat die Zucker-Krankheit (Diabetes). Jeden Tag nimmt sie dieselbe kleine Tablette dagegen.',
  'organ.brief.patient.adult': 'Frau Yilmaz, 74 – Typ-2-Diabetes, seit Jahren stabil auf Metformin in gewohnter Dosis.',
  'organ.brief.goal': 'Hilf Frau Yilmaz! Das Wasser im Körper zeigt, wie viel Medizin in ihrem Blut ist. Halt die Menge im grünen Bereich – nicht zu wenig, nicht zu viel.',
  'organ.brief.goal.adult': 'Halte den Metformin-Spiegel im grünen Fenster – auch wenn sich am Körper etwas ändert.',
  'organ.brief.go': "Los geht's",

  // beat 1 — dose + the cold-start twist (same dose, now too high)
  'organ.dose.prompt': 'Gib Frau Yilmaz ihre gewohnte Tablette. Schau, wie das Wasser steigt – so viel Medizin ist dann in ihrem Blut.',
  'organ.dose.prompt.adult': 'Gib Frau Yilmaz ihre gewohnte Dosis Metformin. Das Wasser zeigt den Wirkstoffspiegel im Blut.',
  'organ.dose.btn': 'Gewohnte Dosis geben',
  'organ.cue.fill': 'Die Tablette wirkt – die Medizin im Blut steigt satt in den grünen Bereich. Genau so war es immer.',
  'organ.cue.fill.adult': 'Der Spiegel läuft in den grünen Bereich – so war Frau Yilmaz seit Jahren eingestellt.',
  'organ.cue.creep': 'Moment … es steigt weiter! Dieselbe Tablette – und die Medizin im Blut klettert von allein über den grünen Bereich.',
  'organ.cue.creep.adult': 'Achtung – der Spiegel steigt weiter über den grünen Bereich, obwohl die Dosis unverändert ist.',

  // dose-fill „Wusstest du?" facts
  'organ.fact.kicker': 'Wusstest du?',
  'organ.fact.disease': 'Bei der Zucker-Krankheit ist zu viel Zucker im Blut. Die Tablette hilft, ihn im Griff zu halten.',
  'organ.fact.disease.adult': 'Beim Typ-2-Diabetes ist der Blutzucker chronisch erhöht; Metformin senkt ihn und hält ihn stabil.',
  'organ.fact.drug': 'Frau Yilmaz’ Medizin heißt Metformin. Man nimmt sie meist jeden Tag in gleicher Menge.',
  'organ.fact.drug.adult': 'Metformin ist First-Line bei Typ-2-Diabetes – Dauertherapie in fester Tagesdosis.',
  'organ.fact.exits': 'Medizin muss auch wieder aus dem Körper raus. Dafür gibt es zwei Ausgänge: die Leber und die Nieren.',
  'organ.fact.exits.adult': 'Arzneistoffe verlassen den Körper über zwei Wege: hepatische Metabolisierung (Leber) oder renale Ausscheidung (Niere).',
  'organ.fact.window': 'Wichtig ist die richtige Menge im Blut: zu wenig wirkt nicht, zu viel kann schaden.',
  'organ.fact.window.adult': 'Der Spiegel muss im therapeutischen Fenster bleiben – zu hoch wird gefährlich, zu tief unwirksam.',

  // beat 2 — the question (the high water IS the question)
  'organ.q.prompt': 'Gleiche Tablette wie immer – gestern lag die Medizin schön im Grünen, heute steht sie hoch über dem grünen Bereich. Was hat sich verändert?',
  'organ.q.prompt.adult': 'Gleiche Dosis wie immer – der Spiegel steht plötzlich über dem grünen Fenster. Was hat sich geändert?',
  'organ.q.watch': 'Schau auf den Körper – die Medizin im Blut steht hoch über dem grünen Bereich.',
  'organ.q.watch.adult': 'Schau auf den Körper – der Spiegel steht über dem grünen Bereich.',
  'organ.q.btn': 'Nachforschen',

  // beat 3 — the two exits (kidney animation · observe → reason → reveal) ★ clever
  'organ.exits.intro': 'Damit die Medizin nicht endlos steigt, muss sie wieder raus. Der Körper hat dafür zwei Ausgänge.',
  'organ.exits.intro.adult': 'Damit der Spiegel nicht weiter steigt, muss der Wirkstoff eliminiert werden – über einen von zwei Wegen.',
  'organ.exits.prompt': 'Über welchen Ausgang verlässt Metformin den Körper? Tippe deinen Verdacht an.',
  'organ.exits.prompt.adult': 'Über welchen Weg wird Metformin ausgeschieden? Wähle.',
  'organ.exits.watch': 'Schau dir die zwei Ausgänge an – Leber und Nieren.',
  'organ.exit.liver': '🟤 Über die Leber – sie baut die Medizin ab',
  'organ.exit.liver.adult': '🟤 Hepatisch – die Leber baut den Wirkstoff ab',
  'organ.exit.kidney': '🫘 Über die Nieren – sie waschen die Medizin raus',
  'organ.exit.kidney.adult': '🫘 Renal – die Niere scheidet den Wirkstoff aus',
  'organ.exfb.liver': 'Knifflig! Die meisten Medikamente gehen über die Leber raus – aber Metformin nicht. Die Leber baut Metformin gar nicht ab. Probier den anderen Ausgang.',
  'organ.exfb.liver.adult': 'Plausibel, aber falsch: Metformin wird NICHT hepatisch metabolisiert. Der hepatische Weg fällt hier weg – wähl den anderen.',
  'organ.exfb.kidney': 'Genau! Metformin ist besonders: Die Leber lässt es in Ruhe. Es verlässt den Körper NUR über die Nieren – unverändert.',
  'organ.exfb.kidney.adult': 'Richtig – Metformin wird unverändert renal eliminiert (kaum hepatischer Metabolismus). Die Niere ist der einzige Ausgang.',

  // labels inside the OrganExits animation
  'organ.lbl.liver': 'Leber',
  'organ.lbl.kidney': 'Nieren',
  'organ.lbl.blood': 'Blut',

  // beat 3b — reveal: the only exit is tired → it backs up (torso staut höher)
  'organ.reveal.title': 'Nur ein Ausgang – und der ist müde.',
  'organ.reveal.title.adult': 'Einziger Eliminationsweg – jetzt eingeschränkt.',
  'organ.reveal.body': 'Beim Arzt-Check kam heraus: Frau Yilmaz’ Nieren sind müder geworden. Wird der einzige Ausgang langsamer, staut sich dieselbe Menge Medizin höher. Schau auf den Körper!',
  'organ.reveal.body.adult': 'Bei der Routinekontrolle ist die Nierenfunktion gefallen (eGFR ~35). Sinkt die renale Clearance, kumuliert Metformin bei gleicher Dosis. Schau auf den Körper.',
  'organ.reveal.stau': 'Schau – die Medizin im Blut staut sich noch ein Stück höher.',
  'organ.reveal.stau.adult': 'Schau – der Spiegel staut sich noch etwas höher.',

  // beat 4 — the dose decision (it is the DOSE, never a „Hahn")
  'organ.decide.prompt': 'Die müde Niere schafft die gewohnte Menge nicht mehr – die Medizin steht zu hoch. Was tust du?',
  'organ.decide.prompt.adult': 'Bei reduzierter renaler Clearance kumuliert die gewohnte Dosis. Wie reagierst du?',
  'organ.decide.watch': 'Schau auf den Körper – die Medizin steht über dem grünen Bereich.',
  'organ.decide.watch.adult': 'Schau auf den Körper – der Spiegel steht über dem grünen Bereich.',
  'organ.tap.reduce': '🔽 Weniger Medizin geben (Dosis an die müde Niere anpassen)',
  'organ.tap.reduce.adult': '🔽 Dosis reduzieren (an die eingeschränkte eGFR anpassen)',
  'organ.tap.pause': '⏹ Metformin ganz weglassen',
  'organ.tap.pause.adult': '⏹ Metformin komplett absetzen',
  'organ.tap.full': '🔼 Die gewohnte Menge weitergeben',
  'organ.tap.full.adult': '🔼 Die gewohnte Dosis beibehalten',
  'organ.tap.bait': '💧 Einfach mehr Wasser trinken',
  'organ.tap.bait.adult': '💧 Nur mehr trinken',
  'organ.tfb.reduce': 'Schau – die Medizin sackt zurück in den grünen Bereich: weniger rein, weil nur ein müder Ausgang übrig ist.',
  'organ.tfb.reduce.adult': 'Dosis an die Niere angepasst (reduziert/gedeckelt) UND weiter überwacht – der Spiegel pendelt zurück ins Fenster.',
  'organ.tfb.full': 'Zu viel! Die müde Niere schafft die gewohnte Menge nicht – schau, die Medizin läuft über den grünen Bereich.',
  'organ.tfb.full.adult': 'Gefährlich – volle Dosis bei reduzierter Clearance → Kumulation → Laktatazidose-Risiko. Der Spiegel läuft über.',
  'organ.tfb.pause': 'Zu viel des Guten! Jetzt ist gar keine Zucker-Medizin mehr da – die Menge fällt unter den grünen Bereich und der Blutzucker entgleist.',
  'organ.tfb.pause.adult': 'Überkorrektur bei eGFR ~35: ganz absetzen → Spiegel zu tief → Blutzucker entgleist. Komplett absetzen wäre erst bei eGFR < 30 richtig.',
  'organ.tfb.bait': 'Die Medizin rührt sich nicht – mehr trinken macht eine müde Niere nicht wieder jung. Du musst die Dosis anpassen. Versuch’s nochmal.',
  'organ.tfb.bait.adult': 'Wirkungslos – mehr Flüssigkeit ersetzt keine Dosisanpassung bei chronisch reduzierter eGFR. Nochmal.',
  'organ.move.reduce': 'Schau auf den Körper – die Medizin sackt zurück in den grünen Bereich.',
  'organ.move.reduce.adult': 'Schau auf den Körper – der Spiegel sackt zurück in den grünen Bereich.',
  'organ.move.over': 'Schau auf den Körper – die Medizin läuft über den grünen Bereich hinaus!',
  'organ.move.over.adult': 'Schau auf den Körper – der Spiegel läuft über den grünen Bereich!',
  'organ.move.under': 'Schau auf den Körper – die Medizin fällt unter den grünen Bereich …',
  'organ.move.under.adult': 'Schau auf den Körper – der Spiegel fällt unter den grünen Bereich …',

  // beat 4 win landing (no more cryptic „einmal reduziert und für immer sicher")
  'organ.won.title': 'Genau richtig angepasst!',
  'organ.won.body': 'Du hast weniger Medizin gegeben – passend zur müden Niere. Die Menge ruht wieder im grünen Bereich, und die Niere bleibt im Blick.',
  'organ.won.body.adult': 'Dosis an die eingeschränkte Niere angepasst (reduziert + überwacht) – der Spiegel liegt wieder im Fenster.',
  'organ.won.peek': 'Eine letzte Frage: Bei welchen Medikamenten ist die Niere genauso wichtig wie bei Metformin?',
  'organ.won.peek.adult': 'Zum Abschluss: Bei welchen Wirkstoffen steuert die Niere die Dosis genauso?',

  // beat 5 — the drug sort (which medicines lean on the kidney?) ★ pro
  'organ.sort.prompt': 'Manche Medizin geht über die Nieren raus, andere über die Leber. Tippe alle an, die – wie Metformin – über die NIEREN gehen.',
  'organ.sort.prompt.adult': 'Welche dieser Wirkstoffe werden überwiegend RENAL ausgeschieden (Dosis von der Nierenfunktion abhängig)? Wähle alle aus.',
  'organ.sort.btn': 'Prüfen',
  'organ.sort.cue': 'Schau auf den Körper …',
  'organ.sort.correct': 'Alles richtig! Bei diesen zählt die Niere.',
  'organ.sort.close': 'Fast – einer sitzt noch falsch. Schau dir die Auflösung an.',
  'organ.sort.wrong': 'Noch nicht ganz – schau dir die Auflösung an.',
  // precise per-drug elimination tags — Metformin is the only-via-kidney exception, the others
  // are PRIMARILY one route (Penicillin is not exclusively renal).
  'organ.tag.metformin': 'nur über die Nieren',
  'organ.tag.metformin.adult': 'unverändert renal (nicht metabolisiert)',
  'organ.tag.penicillin': 'primär über die Nieren',
  'organ.tag.penicillin.adult': 'primär renal ausgeschieden',
  'organ.tag.paracetamol': 'primär über die Leber',
  'organ.tag.paracetamol.adult': 'primär hepatisch metabolisiert',
  'organ.tag.simvastatin': 'primär über die Leber',
  'organ.tag.simvastatin.adult': 'primär hepatisch (CYP3A4)',
  'organ.sort.lesson': 'Manche Medizin geht nur über die Nieren raus (wie Metformin), manche primär über die Nieren, manche primär über die Leber. Bei „Nieren-Medizin" muss die Dosis runter, wenn die Niere müde ist – bei „Leber-Medizin" ist das weniger wichtig.',
  'organ.sort.lesson.adult': 'Der Eliminationsweg entscheidet: bei primär renal ausgeschiedenen Wirkstoffen steuert die Nierenfunktion die Dosis; bei primär hepatisch metabolisierten kaum. Selten ist ein Stoff nur über einen Weg eliminiert (Metformin: unverändert renal).',
  'organ.drug.metformin': 'Metformin (Zucker-Medizin)',
  'organ.drug.metformin.adult': 'Metformin',
  'organ.drug.penicillin': 'Penicillin (ein Antibiotikum)',
  'organ.drug.penicillin.adult': 'Penicillin (Antibiotikum)',
  'organ.drug.paracetamol': 'Paracetamol (gegen Schmerz & Fieber)',
  'organ.drug.paracetamol.adult': 'Paracetamol',
  'organ.drug.simvastatin': 'Simvastatin (gegen zu viel Cholesterin)',
  'organ.drug.simvastatin.adult': 'Simvastatin',

  // beat 6 — outcome / debrief
  'organ.out.win.title': 'Sicher dosiert!',
  'organ.out.win.sub': 'Du hast die Dosis an die müde Niere angepasst – die Medizin ruht im grünen Bereich.',
  'organ.out.win.sub.adult': 'Dosis an die eingeschränkte Niere angepasst (reduziert + überwacht) – Frau Yilmaz liegt im Fenster.',
  'organ.out.over.title': 'Übergelaufen!',
  'organ.out.over.sub': 'Die gewohnte Menge war zu viel für die müde Niere – die Medizin ist über den grünen Bereich gelaufen.',
  'organ.out.over.sub.adult': 'Überdosis: volle Dosis bei reduzierter renaler Clearance → Kumulation → Laktatazidose-Risiko.',
  'organ.out.under.title': 'Zu wenig …',
  'organ.out.under.sub': 'Ganz weglassen war zu viel – jetzt fehlt die Zucker-Medizin und der Blutzucker entgleist.',
  'organ.out.under.sub.adult': 'Unterdosiert: komplett abgesetzt bei eGFR ~35 → Spiegel zu tief → Blutzucker entgleist. Absetzen erst bei eGFR < 30.',
  'organ.out.dyk1': 'Metformin ist besonders: Die Leber lässt es in Ruhe – es geht nur über die Nieren raus. Müde Niere = dieselbe Menge staut sich höher.',
  'organ.out.dyk1.adult': 'Metformin wird unverändert renal eliminiert (kaum hepatischer Metabolismus); sinkt die eGFR, sinkt die Clearance und der Wirkstoff kumuliert.',
  'organ.out.dyk2': 'Bei „Nieren-Medizin" muss die Dosis runter, wenn die Niere müde ist – mehr trinken hilft nicht. Bei „Leber-Medizin" zählt die Niere weniger.',
  'organ.out.dyk2.adult': 'Bei eGFR 30–44: Dosis reduzieren/deckeln + Niere überwachen; absetzen erst < 30. Bei hepatisch eliminierten Stoffen steuert die Niere die Dosis kaum.',
  'organ.out.dyk.over': 'Bei einer müden Niere wird die gewohnte Menge schnell zu viel – sie staut sich über den grünen Bereich.',
  'organ.out.dyk.over.adult': 'Volle Dosis bei reduzierter Clearance → Kumulation. Die Organfunktion steuert die Dosierung.',
  'organ.out.dyk.under': 'Ganz weglassen ist hier zu viel: dann fehlt die Medizin und der Zucker entgleist – nicht „du warst zu vorsichtig".',
  'organ.out.dyk.under.adult': 'Absetzen ist bei eGFR ~35 eine Überkorrektur (Glukosekontrolle verloren) – komplettes Absetzen erst bei eGFR < 30.',
}
