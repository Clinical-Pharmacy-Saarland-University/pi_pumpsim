// Copy for „Drei Körper, eine Pille" (DGI · Codein/CYP2D6). Merged into the `de` dict in
// locale.svelte.ts (last-spread-wins). t() resolves `key.adult` for adults, else the plain key —
// so the PLAIN key is the young value and `.adult` carries the adult register.
//
// Conventions (NON-NEGOTIABLE): the level = „der Spiegel" (never „das Wasser"); danger = „über/
// unter den grünen Bereich" (NEVER „rote Linie/Marke"); the enzyme = „Umbau-Maschine" (young) /
// CYP2D6 (adult); the active drug = „Schmerz-Stopper" (young) / Morphin (adult). Codein is
// introduced once for kids as „ein starkes Schmerzmittel". Two registers on every key.
export const geneLocale: Record<string, string> = {
  // ── case header ──
  'gene.case': 'Mara, Jonas & Emil, 8 · Zahnweh nach kleiner OP',
  'gene.case.adult': 'Mara, Jonas & Emil (8 J.) · post-OP-Analgesie',

  // ── briefing (explains Codein for kids) ──
  'gene.brief.patient': 'Mara, Jonas und Emil haben nach einer kleinen Operation Zahnweh. Alle drei bekommen GENAU dieselbe Schmerz-Tablette: Codein.',
  'gene.brief.patient.adult': 'Drei Geschwister mit Schmerzen nach einem kleinen Eingriff erhalten dieselbe Codein-Dosis. Codein selbst wirkt kaum – der Körper muss es erst aktivieren.',
  'gene.brief.goal': 'Gib jedem Kind dieselbe Tablette und schau, wie hoch der Spiegel im Körper steigt. Wirkt sie bei allen gleich – oder nicht?',
  'gene.brief.goal.adult': 'Verabreiche jedem die identische Dosis und lies den Spiegel am Torso ab. Gleiche Dosis heißt nicht gleiche Wirkung.',
  'gene.brief.go': "Los geht's",

  // ── kids ──
  'gene.body.A': 'Mara',
  'gene.body.B': 'Jonas',
  'gene.body.C': 'Emil',

  // ── dose (three kids side by side) ──
  'gene.dose.prompt': 'Tippe bei jedem Kind auf „Tablette geben" – und merk dir, wo der Spiegel landet!',
  'gene.dose.prompt.adult': 'Verabreiche jedem die identische Codein-Dosis und beobachte den resultierenden Spiegel.',
  'gene.dose.give': 'Tablette geben',
  'gene.dose.given': 'gegeben ✓',
  'gene.dose.watch': 'Schau auf den Spiegel!',
  'gene.dose.watch.adult': 'Beobachte den Spiegel am Torso.',
  'gene.dose.readA': 'Maras Spiegel steht knapp UNTER dem grünen Bereich – das ist zu wenig.',
  'gene.dose.readA.adult': 'Mara: der Spiegel steht unter dem therapeutischen Fenster – subtherapeutisch.',
  'gene.dose.readB': 'Jonas’ Spiegel steht genau im grünen Bereich – passt!',
  'gene.dose.readB.adult': 'Jonas: der Spiegel steht mitten im therapeutischen Fenster.',
  'gene.dose.readC': 'Emils Spiegel steht WEIT ÜBER dem grünen Bereich – viel zu viel! Bei DERSELBEN Pille!',
  'gene.dose.readC.adult': 'Emil: der Spiegel steht weit über dem therapeutischen Fenster.',
  'gene.dose.reveal': 'Komisch, oder? Gleiche Tablette, gleiche Dosis – aber bei Mara zu wenig, bei Jonas genau richtig, bei Emil zu viel.',
  'gene.dose.reveal.adult': 'Dieselbe Dosis führt zu subtherapeutischem, therapeutischem und toxischem Spiegel.',

  // ── per-kid frozen marker tags ──
  'gene.mark.low': 'zu wenig',
  'gene.mark.mid': 'genau richtig',
  'gene.mark.high': 'zu viel',

  // ── generic ──
  'gene.next': 'Weiter',

  // ── observe: „Huch? Was ist denn hier los?" ──
  'gene.observe.prompt': 'Huch? Was ist denn hier los?',
  'gene.observe.prompt.adult': 'Was zeigt die Beobachtung?',
  'gene.observe.opt.diff': 'Die gleiche Tablette wirkt bei jedem Kind anders.',
  'gene.observe.opt.diff.adult': 'Gleiche Dosis kann je nach Patient:in unterschiedlich wirken.',
  'gene.observe.opt.broken': 'Eine der Tabletten war kaputt.',
  'gene.observe.opt.broken.adult': 'Eine Tablette war defekt oder unterdosiert.',
  'gene.observe.opt.size': 'Ein Kind ist größer oder hat mehr getrunken.',
  'gene.observe.opt.size.adult': 'Unterschiede durch Körpergröße oder Trinkmenge.',
  'gene.observe.opt.swallow': 'Sie haben unterschiedlich schnell geschluckt.',
  'gene.observe.opt.swallow.adult': 'Unterschiede durch den Einnahmezeitpunkt.',
  'gene.observe.fb.right': 'Genau! Die Tablette war bei allen gleich. Der Unterschied steckt im Körper der Kinder.',
  'gene.observe.fb.right.adult': 'Richtig – die individuelle Verarbeitung im Körper bestimmt die Wirkung, nicht die Tablette.',
  'gene.observe.fb.wrong': 'Nicht ganz. Die Tablette war bei allen gleich – das Rätsel steckt im Körper. Versuch es nochmal!',
  'gene.observe.fb.wrong.adult': 'Nein. Dosis und Tablette waren identisch; entscheidend ist die patientenspezifische Verarbeitung. Nochmal.',

  // ── assign genotype machines (the inversion puzzle) ──
  'gene.assign.intro': 'Codein ist noch kein fertiger Schmerz-Stopper. Erst eine winzige Umbau-Maschine im Körper macht daraus die Wirkung – wie schnell sie arbeitet, bestimmen die Gene. Bei jedem Kind anders!',
  'gene.assign.intro.adult': 'Codein ist ein Prodrug: erst das Enzym CYP2D6 aktiviert es zu Morphin. Wie aktiv das Enzym ist, ist genetisch festgelegt – bei jedem anders.',
  'gene.assign.prompt': 'Welche Maschine steckt in welchem Kind? Denk daran, wie hoch der Spiegel war!',
  'gene.assign.prompt.adult': 'Ordne jedem Patienten den CYP2D6-Typ zu – nutze den beobachteten Spiegel.',
  'gene.assign.pick': 'Maschine wählen, dann aufs Kind tippen.',
  'gene.assign.pick.adult': 'Typ wählen, dann auf den Patienten tippen.',
  'gene.machine.slow': '🐢 langsame Maschine',
  'gene.machine.slow.adult': 'PM · langsam',
  'gene.machine.normal': '🚶 normale Maschine',
  'gene.machine.normal.adult': 'NM · normal',
  'gene.machine.fast': '🚀 schnelle Maschine',
  'gene.machine.fast.adult': 'UM · ultraschnell',
  'gene.assign.fb.invert': 'Andersrum! Eine schnelle Maschine macht ganz viel Schmerz-Stopper – also einen hohen Spiegel. Wer hatte den höchsten Spiegel?',
  'gene.assign.fb.invert.adult': 'Invertiert: schnellere Aktivierung = mehr Morphin = höherer Spiegel. Der höchste Spiegel gehört zum schnellsten Typ.',
  'gene.assign.fb.wrong': 'Noch nicht. Denk an den Spiegel: niedrig = langsame Maschine, grün = normale, hoch = schnelle.',
  'gene.assign.fb.wrong.adult': 'Noch nicht passend. Niedriger Spiegel → PM, im Fenster → NM, hoch → UM.',
  'gene.assign.fb.right': 'Stark! Niedrig = langsam, grün = normal, hoch = schnell – genau richtig umgedacht!',
  'gene.assign.fb.right.adult': 'Korrekt: niedrig → PM, im Fenster → NM, hoch → UM.',

  // ── animated PK curves (reward) + revealed badges ──
  'gene.curves.title': 'Gleiche Pille – drei Kurven',
  'gene.curves.title.adult': 'Identische Dosis – drei Verläufe',
  'gene.curves.sub': 'So viel Schmerz-Stopper entsteht über die Zeit – aus DERSELBEN Tablette.',
  'gene.curves.sub.adult': 'Morphin-Konzentration über die Zeit aus identischer Codein-Dosis – drei CYP2D6-Phänotypen.',
  'gene.curves.band': 'grüner Bereich',
  'gene.badge.slow': '🐢 baut sehr langsam um',
  'gene.badge.slow.adult': 'PM · langsam (CYP2D6)',
  'gene.badge.normal': '🚶 baut normal um',
  'gene.badge.normal.adult': 'NM · normal (CYP2D6)',
  'gene.badge.ultra': '🚀 baut sehr schnell um',
  'gene.badge.ultra.adult': 'UM · ultraschnell (CYP2D6)',

  // ── Treat A (Poor Metabolizer) ──
  'gene.treatA.prompt': 'Mara hat immer noch Zahnweh – ihr Spiegel ist zu tief, knapp unter dem grünen Bereich. Was sollte Mara jetzt bekommen?',
  'gene.treatA.prompt.adult': 'Maras Spiegel ist subtherapeutisch (knapp unter dem Fenster). Was sollte sie erhalten?',
  'gene.treatA.opt.switch': 'Ein Schmerzmittel geben, das ohne die Umbau-Maschine wirkt',
  'gene.treatA.opt.switch.adult': 'Auf ein nicht-CYP2D6-aktiviertes Analgetikum wechseln (z. B. Ibuprofen)',
  'gene.treatA.opt.more': 'Mehr Codein geben',
  'gene.treatA.opt.wait': 'Einfach abwarten',
  'gene.treatA.opt.samepill': 'Nochmal dieselbe Tablette geben',
  'gene.treatA.opt.tramadol': 'Stattdessen Tramadol geben',
  'gene.treatA.fb.switch': 'Genau – ein Mittel ohne Umbau-Maschine wirkt bei Mara sicher. Schau, wie ihr Spiegel ins Grüne steigt!',
  'gene.treatA.fb.switch.adult': 'Richtig – ein nicht-CYP2D6-abhängiges Analgetikum wirkt unabhängig vom Genotyp. Der Spiegel steigt ins Fenster.',
  'gene.treatA.fb.more': 'Schau auf den Körper – nichts bewegt sich! Ohne Umbau-Maschine wird auch aus mehr Codein kaum Schmerz-Stopper. Mara bleibt zu tief.',
  'gene.treatA.fb.more.adult': 'Der Spiegel rührt sich nicht – ohne CYP2D6 erzeugt mehr Substrat kein zusätzliches Morphin. Subtherapeutisch.',
  'gene.treatA.fb.wait': 'Der Spiegel bleibt unten – der Schmerz hält an. Warten hilft nicht.',
  'gene.treatA.fb.wait.adult': 'Keine Änderung – der Spiegel bleibt subtherapeutisch, die Analgesie fehlt.',
  'gene.treatA.fb.samepill': 'Gleiches Ergebnis – dieselbe Pille, dieselbe fehlende Maschine. Der Spiegel bleibt zu tief.',
  'gene.treatA.fb.samepill.adult': 'Identische Gabe, identisches Problem – ohne CYP2D6 keine wirksame Aktivierung.',
  'gene.treatA.fb.tramadol': 'Vorsicht – Tramadol braucht dieselbe Umbau-Maschine. Bei Mara hilft es genauso wenig. Versuch es nochmal.',
  'gene.treatA.fb.tramadol.adult': 'Falle – Tramadol wird ebenfalls über CYP2D6 aktiviert; dasselbe genetische Problem. Nochmal.',

  // ── Treat C (Ultra-rapid, live) ──
  'gene.treatC.intro': 'Jetzt Emil. Er bekommt dieselbe Tablette – schau, was passiert.',
  'gene.treatC.intro.adult': 'Emil erhält die identische Codein-Dosis – beobachte den Spiegel.',
  'gene.treatC.give': 'Pille geben',
  'gene.treatC.rising': 'Schau! Der Spiegel rast hoch über den grünen Bereich!',
  'gene.treatC.rising.adult': 'Der Spiegel steigt rapide über das therapeutische Fenster.',
  'gene.treatC.prompt': 'Emils Spiegel ist viel zu hoch – über dem grünen Bereich. Was ist jetzt sicher für Emil?',
  'gene.treatC.prompt.adult': 'Toxischer Morphinspiegel über dem Fenster. Was ist die sichere Maßnahme?',
  'gene.treatC.opt.switch': 'Weg vom Codein – ein anderes Schmerzmittel geben',
  'gene.treatC.opt.switch.adult': 'Codein absetzen, auf ein nicht-CYP2D6-Analgetikum wechseln',
  'gene.treatC.opt.more': 'Mehr Codein geben',
  'gene.treatC.opt.keep': 'Einfach beim Codein bleiben',
  'gene.treatC.opt.tramadol': 'Stattdessen Tramadol geben',
  'gene.treatC.fb.switch': 'Genau – ohne Umbau-Maschine entsteht kein Extra-Schmerz-Stopper. Schau, wie der Spiegel zurück ins Grüne sinkt!',
  'gene.treatC.fb.switch.adult': 'Richtig – ein nicht-CYP2D6-Analgetikum vermeidet die Überaktivierung. Der Spiegel sinkt ins Fenster.',
  'gene.treatC.fb.more': 'Gefährlich! Die schnelle Maschine macht aus noch mehr Codein noch mehr Schmerz-Stopper – der Spiegel schießt weit über den grünen Bereich.',
  'gene.treatC.fb.more.adult': 'Gefährlich – mehr Substrat bei UM = exzessives Morphin. Der Spiegel steigt weit über das Fenster (Atemdepression).',
  'gene.treatC.fb.keep': 'Gefährlich – Emils schnelle Maschine bildet weiter zu viel Schmerz-Stopper. Der Spiegel bleibt weit über dem grünen Bereich.',
  'gene.treatC.fb.keep.adult': 'Gefährlich – fortgesetztes Codein bei UM hält den toxischen Spiegel über dem Fenster.',
  'gene.treatC.fb.tramadol': 'Vorsicht – Tramadol braucht dieselbe schnelle Maschine. Auch das wird zu viel. Versuch es nochmal.',
  'gene.treatC.fb.tramadol.adult': 'Falle – Tramadol ist ebenfalls CYP2D6-abhängig; bei UM überaktiviert. Nochmal.',

  // ── finale: medicine cabinet ──
  'gene.finale.prompt': 'Wähle ein Schmerzmittel, das ohne die Umbau-Maschine wirkt – und gib es Mara und Emil.',
  'gene.finale.prompt.adult': 'Wähle das nicht-CYP2D6-aktivierte Analgetikum für Mara und Emil.',
  'gene.finale.pickFor': 'Karte aufs Kind tippen',
  'gene.finale.pickFor.adult': 'Karte auf den Patienten tippen',
  'gene.finale.applied': 'versorgt',
  'gene.card.ibuprofen': 'Ibuprofen',
  'gene.card.ibuprofen.adult': 'Ibuprofen (nicht-CYP2D6)',
  'gene.card.paracetamol': 'Paracetamol',
  'gene.card.paracetamol.adult': 'Paracetamol (nicht-CYP2D6)',
  'gene.card.codein': 'Codein',
  'gene.card.codein2': 'Codein (höhere Dosis)',
  'gene.card.tramadol': 'Tramadol',
  'gene.card.tramadol.adult': 'Tramadol (CYP2D6-abhängig!)',
  'gene.finale.warn': 'Schau auf den Körper – der Spiegel zieht nach oben aus dem grünen Bereich heraus! Diese Karte braucht die Umbau-Maschine.',
  'gene.finale.warn.adult': 'Der Spiegel steigt über das therapeutische Fenster hinaus – dieses Mittel ist CYP2D6-abhängig, ungeeignet.',
  'gene.finale.bad': 'Ungeeignet – das braucht die Umbau-Maschine. Wähl ein anderes.',
  'gene.finale.bad.adult': 'Ungeeignet – CYP2D6-abhängig. Bitte ein nicht-CYP2D6-Analgetikum wählen.',
  'gene.finale.good': 'Der Spiegel ruht im grünen Bereich und glüht grün – sicher!',
  'gene.finale.good.adult': 'Der Spiegel ruht im therapeutischen Fenster – sicher und genotyp-unabhängig.',

  // ── won micro-beat ──
  'gene.won.title': 'Alle drei sicher!',
  'gene.won.peek': 'Jonas war von Anfang im grünen Bereich; Mara und Emil hast du über den Wechsel auf ein anderes Schmerzmittel gerettet.',
  'gene.won.peek.adult': 'NM von Beginn im Fenster; PM und UM über den Wechsel auf ein nicht-CYP2D6-Analgetikum versorgt.',

  // ── outcome / debrief ──
  'gene.out.win.title': 'Sicher behandelt!',
  'gene.out.win.sub': 'Gleiche Pille, drei Körper – du hast jeden sicher in den grünen Bereich gebracht.',
  'gene.out.win.sub.adult': 'Du hast den Genotyp gelesen und für PM/UM auf ein nicht-CYP2D6-Analgetikum gewechselt – wirksam und sicher.',
  'gene.out.over.title': 'Zu viel Schmerz-Stopper!',
  'gene.out.over.sub': 'Emils schnelle Maschine hat aus dem Codein viel zu viel gemacht – der Spiegel schoss weit über den grünen Bereich.',
  'gene.out.over.sub.adult': 'Ultra-rapid Metabolizer + Codein → Morphin-Überschuss → Atemdepressionsrisiko (reale FDA-Boxed-Warning).',
  'gene.out.under.title': 'Wirkung fehlt',
  'gene.out.under.sub': 'Maras Umbau-Maschine fehlt fast – mehr oder dieselbe Codein-Pille macht trotzdem kaum Schmerz-Stopper. Der Schmerz blieb.',
  'gene.out.under.sub.adult': 'Poor Metabolizer: kaum Morphinbildung – Dosiserhöhung bringt mangels Enzym keine Analgesie.',
  'gene.out.dyk1': 'Gleiches Medikament, gleiche Dosis, andere Gene – ganz anderes Ergebnis. Das Gen entscheidet, nicht die Menge.',
  'gene.out.dyk1.adult': 'Codein ist ein Prodrug; der CYP2D6-Metabolisierertyp bestimmt Wirkung und Risiko – gleiche Dosis, anderer Effekt.',
  'gene.out.dyk2': 'Passt die Umbau-Maschine nicht, dreht man nicht an der Codein-Menge – man nimmt ein Mittel, das sie gar nicht braucht.',
  'gene.out.dyk2.adult': 'Bei PM/UM ein nicht-CYP2D6-aktiviertes Analgetikum wählen – nicht Tramadol (ebenfalls CYP2D6-abhängig).',
  'gene.out.dyk.over': 'Schnell ist hier nicht gut: Emils Umbau-Maschine macht aus dem Codein viel zu schnell viel zu viel Schmerz-Stopper – und das ist gefährlich.',
  'gene.out.dyk.over.adult': 'Ultra-rapid Metabolizer bilden exzessiv Morphin; Codein ist bei Kindern post-Tonsillektomie kontraindiziert.',
  'gene.out.dyk.under': 'Fehlt die Umbau-Maschine, hilft mehr Codein nicht – der Körper kann es einfach nicht in den Schmerz-Stopper umbauen.',
  'gene.out.dyk.under.adult': 'Beim Poor Metabolizer fehlt die Aktivierung; Dosissteigerung erhöht das Risiko ohne Analgesie-Gewinn.',
}
