// Copy for „Der müde Filter" (Organ/DOI · eGFR↓ × Metformin). Merged into the `de` dict in
// locale.svelte.ts (last-spread-wins). Conventions: the level = „der Spiegel" (never „das
// Wasser"); danger = „über/unter den grünen Bereich" (NEVER „rote Linie"); two registers on
// every key; patient-framed; the kidney = „der Abfluss / Nieren-Filter". (story.organ.title/desc
// live in the shared dict and are rewritten there to „Der müde Filter".)
export const organLocale: Record<string, string> = {
  // case header (persistent)
  'organ.case': 'Frau Yilmaz, 74 · Metformin',

  // beat 0 — briefing (kidney deliberately NOT mentioned)
  'organ.brief.patient': 'Frau Yilmaz, 74, hat die Zucker-Krankheit (Diabetes) und nimmt seit Jahren jeden Tag dieselbe Zucker-Medizin.',
  'organ.brief.patient.adult': 'Frau Yilmaz, 74 – Typ-2-Diabetes, seit Jahren stabil auf Metformin in gewohnter Dosis.',
  'organ.brief.goal': 'Hilf Frau Yilmaz! Halte den Spiegel im grünen Bereich – nicht zu wenig, nicht zu viel.',
  'organ.brief.goal.adult': 'Halte den Metformin-Spiegel im grünen Fenster – auch wenn sich am Körper etwas ändert.',
  'organ.brief.go': "Los geht's",

  // beat 1 — dose + the cold-start twist
  'organ.dose.prompt': 'Der Körper zeigt den Spiegel – wie viel Zucker-Medizin in Frau Yilmaz’ Blut ist. Gib ihr ihre gewohnte Dosis.',
  'organ.dose.prompt.adult': 'Der Torso zeigt den Metformin-Spiegel im Blut. Gib Frau Yilmaz ihre gewohnte Dosis.',
  'organ.dose.btn': 'Gewohnte Dosis geben',
  'organ.cue.fill': 'Schau auf den Körper – die Dosis läuft ein, der Spiegel steigt satt in den grünen Bereich. So sieht normal aus.',
  'organ.cue.fill.adult': 'Schau auf den Körper – der Spiegel läuft in den grünen Bereich. So war es immer.',
  'organ.cue.creep': 'Warte … er hört nicht auf zu steigen. Derselbe Hahn – und der Spiegel klettert von allein über den grünen Bereich.',
  'organ.cue.creep.adult': 'Achtung – der Spiegel steigt weiter, über den grünen Bereich hinaus, obwohl die Dosis unverändert ist.',

  // dose-fill „Wusstest du?" facts
  'organ.fact.kicker': 'Wusstest du?',
  'organ.fact.disease': 'Bei der Zucker-Krankheit ist zu viel Zucker im Blut. Die Medizin hilft, ihn im Griff zu halten.',
  'organ.fact.disease.adult': 'Beim Typ-2-Diabetes ist der Blutzucker chronisch erhöht; Metformin senkt ihn und hält ihn stabil.',
  'organ.fact.drug': 'Metformin ist die häufigste Zucker-Medizin. Man nimmt sie meist jeden Tag in gleicher Menge.',
  'organ.fact.drug.adult': 'Metformin ist First-Line bei Typ-2-Diabetes – Dauertherapie in fester Tagesdosis.',
  'organ.fact.kidney': 'Die Nieren sind der Abfluss: Sie waschen viele Medikamente wieder aus dem Körper heraus.',
  'organ.fact.kidney.adult': 'Metformin wird unverändert renal eliminiert – die Niere ist der Hauptausgang aus dem Körper.',
  'organ.fact.window': 'Wichtig ist die richtige Menge im Blut: zu wenig wirkt nicht, zu viel kann schaden.',
  'organ.fact.window.adult': 'Der Spiegel muss im therapeutischen Fenster bleiben – zu hoch wird gefährlich, zu tief unwirksam.',

  // beat 2 — the question
  'organ.q.prompt': 'Gleiche Tablette wie immer – gestern stand der Spiegel satt im Grünen, heute klebt er über dem grünen Bereich. Was hat sich verändert?',
  'organ.q.prompt.adult': 'Gleiche Dosis wie immer – der Spiegel steht plötzlich über dem grünen Fenster. Was hat sich geändert?',
  'organ.q.watch': 'Schau auf den Körper – der Spiegel zittert hoch über dem grünen Bereich.',
  'organ.q.btn': 'Am Körper nachsehen',

  // beat 3 — detective (stillness = harmlos; the cause moves UP because it STAUT sich)
  'organ.det.prompt': 'Warum steht der Spiegel so hoch? Tippe deine Vermutung an – und schau, ob sich am Körper etwas tut.',
  'organ.det.prompt.adult': 'Warum steigt der Spiegel, obwohl die Dosis gleich blieb? Prüfe jede Vermutung am Körper.',
  'organ.det.watch': 'Schau auf den Körper – bewegt sich der Spiegel, wenn deine Vermutung stimmt?',
  'organ.det.strong': '💊 Die Tabletten sind stärker geworden',
  'organ.det.food': '🍞 Sie isst zu viel Süßes',
  'organ.det.drink': '💧 Sie trinkt zu wenig',
  'organ.det.kidney': '🫘 Der Abfluss – der Nieren-Filter – ist müde geworden',
  'organ.det.kidney.adult': '🫘 Die Nierenfunktion ist gefallen (eGFR ↓)',
  'organ.dfb.strong': 'Der Spiegel rührt sich nicht – es sind dieselben Tabletten wie immer. Das war’s nicht.',
  'organ.dfb.food': 'Der Spiegel rührt sich nicht – Essen ändert nicht, wie viel Medizin im Körper bleibt.',
  'organ.dfb.drink': 'Der Spiegel rührt sich nicht – und mehr trinken macht müde Nieren nicht wieder jung. Das war’s nicht.',
  'organ.dfb.kidney': 'Schau – der Spiegel klebt noch ein Stück höher an der Kante, es STAUT sich! Ein müder Abfluss lässt die Medizin langsamer raus, und dieselbe Menge staut sich höher.',
  'organ.dfb.kidney.adult': 'Genau – sinkt die eGFR, sinkt die renale Clearance: Metformin geht langsamer raus und staut sich bei gleicher Dosis höher.',
  'organ.det.confirm': 'Schau auf den Körper – der Spiegel staut sich noch ein Stück höher.',
  'organ.det.found': 'Gefunden: der müde Nieren-Filter.',
  'organ.det.foundPeek': 'Der Abfluss ist müde – aber was heißt das für die Dosis? Schauen wir es uns an.',
  'organ.det.foundPeek.adult': 'Reduzierte renale Clearance bei eGFR ~35 – klären wir die Konsequenz für die Dosis.',
  'organ.det.causeYoung': 'Müder Nieren-Filter',
  'organ.det.causeAdult': 'Niere · eGFR ~35',

  // beat 4 — mechanism (one sentence)
  'organ.mech': 'Die Medizin verlässt den Körper über die Nieren – den Abfluss. Müder Abfluss → mehr bleibt drin → also muss weniger rein.',
  'organ.mech.adult': 'Renale Elimination: Metformin verlässt den Körper über die Niere. Sinkt die eGFR (~35), kumuliert der Wirkstoff – also Dosis reduzieren.',
  'organ.mech.watch': 'Schau auf den Körper – der Spiegel klebt noch oben an der Kante.',
  'organ.mech.btn': 'Hahn einstellen',

  // beat 5 — the live cut
  'organ.live.prompt': 'Der Hahn ist offen – schau, der Spiegel STEIGT. Stell ihn ein, bevor das Wasser über den grünen Bereich läuft!',
  'organ.live.prompt.adult': 'Der Hahn läuft – der Spiegel steigt live über den grünen Bereich. Stell die Dosis ein, bevor es zu hoch wird.',
  'organ.live.watch': 'Er STEIGT – schau auf den Körper! Der Spiegel zieht über den grünen Bereich.',
  'organ.tap.reduce': '🔽 Hahn kleiner stellen (reduzieren)',
  'organ.tap.pause': '⏹ Hahn ganz zu (Pause / absetzen)',
  'organ.tap.full': '🔼 Voller Hahn (gewohnte Dosis lassen)',
  'organ.tap.bait': '💧 Nur mehr trinken',
  'organ.tfb.reduce': 'Schau – der Spiegel sackt zurück und ruht im grünen Bereich. Kleiner gestellt – und den Filter weiter im Auge behalten.',
  'organ.tfb.reduce.adult': 'Dosis an die Niere angepasst (reduziert/gedeckelt) UND weiter überwacht – der Spiegel pendelt zurück ins Fenster.',
  'organ.tfb.full': 'Zu hoch! Der müde Abfluss schafft die volle Menge nicht – schau, das Wasser läuft über den grünen Bereich.',
  'organ.tfb.full.adult': 'Gefährlich – volle Dosis bei reduzierter Clearance → Kumulation → Laktatazidose-Risiko. Der Spiegel läuft über.',
  'organ.tfb.pause': 'Zu weit zu! Jetzt ist zu wenig Zucker-Medizin da – der Spiegel fällt unter den grünen Bereich und der Zucker entgleist.',
  'organ.tfb.pause.adult': 'Überkorrektur bei eGFR 35: ganz absetzen → Spiegel zu tief → Blutzucker entgleist. Absetzen wäre erst bei eGFR < 30 richtig.',
  'organ.tfb.bait': 'Der Spiegel rührt sich nicht – mehr trinken hilft dem müden Filter nicht. Stell den Hahn ein. Versuch’s nochmal.',
  'organ.tfb.bait.adult': 'Wirkungslos – mehr Flüssigkeit ersetzt keine Dosisanpassung bei chronisch reduzierter eGFR. Nochmal.',
  'organ.live.reduce': 'Schau auf den Körper – der Spiegel sackt zurück in den grünen Bereich.',
  'organ.live.over': 'Schau auf den Körper – der Spiegel läuft über den grünen Bereich hinaus!',
  'organ.live.under': 'Schau auf den Körper – der Spiegel fällt unter den grünen Bereich …',

  // beat 5 win landing
  'organ.won.title': 'Genau richtig eingestellt!',
  'organ.won.body': 'Du hast den Hahn rechtzeitig kleiner gestellt – und behältst den Filter weiter im Auge. Nicht „einmal reduziert und für immer sicher".',
  'organ.won.body.adult': 'Dosis rechtzeitig an die eingeschränkte Niere angepasst – und engmaschiger überwacht. Reduzieren UND beobachten.',
  'organ.won.peek': 'Bleibt es jetzt sicher? Machen wir einen Plan für die nächsten Monate.',

  // beat 6 — filter plan
  'organ.plan.prompt': 'Plan für die kommenden Monate: Was sollte Frau Yilmaz tun? Tippe jede Karte an.',
  'organ.plan.prompt.adult': 'Welche Maßnahmen sichern Frau Yilmaz für die kommenden Monate? Tippe jede Karte an.',
  'organ.plan.check': '🩺 Den Nieren-Filter regelmäßig prüfen lassen',
  'organ.plan.check.adult': '🩺 Nierenfunktion (eGFR) engmaschig kontrollieren',
  'organ.plan.ask': '👩‍⚕️ Bei Krankheit Fachleute fragen',
  'organ.plan.ask.adult': '👩‍⚕️ Bei akuter Erkrankung/Dehydratation Rücksprache halten',
  'organ.plan.relapse': '🔼 Einfach wieder volle Dosis nehmen, wenn’s besser geht',
  'organ.plan.relapse.adult': '🔼 Wieder auf die volle Dosis gehen, sobald es besser scheint',
  'organ.plan.safe': 'Gut – das hält Frau Yilmaz sicher. Der Spiegel bleibt ruhig im grünen Bereich.',
  'organ.plan.safe.adult': 'Richtig – Monitoring + Rücksprache halten den Spiegel stabil im Fenster.',
  'organ.plan.trapWarn': 'Schau auf den Körper – zu hoch! Der Filter ist noch müde, die volle Dosis staut sich wieder. Nimm das zurück.',
  'organ.plan.trapWarn.adult': 'Achtung – die eGFR ist weiter reduziert; die volle Dosis kumuliert erneut. Zurücknehmen.',
  'organ.plan.takeback': 'Zurücknehmen',
  'organ.plan.done': 'Weiter',

  // beat 7 — outcome / debrief
  'organ.out.win.title': 'Sicher dosiert!',
  'organ.out.win.sub': 'Du hast den Hahn rechtzeitig kleiner gestellt – der Spiegel ruht im grünen Bereich.',
  'organ.out.win.sub.adult': 'Dosis an die eingeschränkte Niere angepasst (reduziert + überwacht) – Frau Yilmaz liegt im Fenster.',
  'organ.out.over.title': 'Übergelaufen!',
  'organ.out.over.sub': 'Die volle Dosis war zu viel für den müden Abfluss – der Spiegel ist über den grünen Bereich gelaufen.',
  'organ.out.over.sub.adult': 'Überdosis: volle Dosis bei reduzierter renaler Clearance → Kumulation → Laktatazidose-Risiko.',
  'organ.out.under.title': 'Zu wenig …',
  'organ.out.under.sub': 'Ganz abgedreht war zu viel – jetzt ist zu wenig Zucker-Medizin da und der Blutzucker entgleist.',
  'organ.out.under.sub.adult': 'Unterdosiert: komplett abgesetzt bei eGFR 35 → Spiegel zu tief → Blutzucker entgleist. Absetzen erst bei eGFR < 30.',
  'organ.out.dyk1': 'Die Nieren sind der Abfluss: Sie waschen die Medizin aus dem Körper. Müder Abfluss = dieselbe Menge staut sich höher.',
  'organ.out.dyk1.adult': 'Metformin wird unverändert renal eliminiert; sinkt die eGFR, sinkt die Clearance und der Wirkstoff kumuliert.',
  'organ.out.dyk2': 'Dann hilft nicht mehr trinken, sondern: den Hahn kleiner stellen – und den Filter weiter prüfen lassen.',
  'organ.out.dyk2.adult': 'Bei eGFR 30–44: Dosis reduzieren/deckeln + Niere überwachen. Komplett absetzen erst bei eGFR < 30 (andere Patientin, anderer Wert).',
  'organ.out.dyk.over': 'Bei einer schwächeren Niere wird die gewohnte Dosis schnell zu viel – sie staut sich über den grünen Bereich.',
  'organ.out.dyk.over.adult': 'Volle Dosis bei reduzierter Clearance → Kumulation. Die Organfunktion steuert die Dosierung.',
  'organ.out.dyk.under': 'Ganz absetzen ist hier zu viel: dann ist zu wenig Medizin da und der Zucker entgleist – nicht „du warst zu vorsichtig".',
  'organ.out.dyk.under.adult': 'Absetzen ist bei eGFR 35 eine Überkorrektur (Glukosekontrolle verloren) – komplettes Absetzen erst bei eGFR < 30.',
}
