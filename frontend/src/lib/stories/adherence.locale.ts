// Copy for „Die Antibiotika-Kur" (Adhärenz · Antibiotikum/Resistenz). Merged into the `de`
// dict in locale.svelte.ts (last-spread-wins). Conventions: the level = „der Spiegel"
// (Wirkstoff im Blut); the green band = „wirksamer/grüner Bereich"; below it = „zu wenig →
// Bakterien überleben"; above it = „zu viel → Nebenwirkungen". Base register = warm/young,
// `.adult` = clinical. Every beat sends the eyes to the body („Schau auf den Körper").
export const adherenceLocale: Record<string, string> = {
  // ── case header ──
  'adh.case': 'Jonas, 16 · bakterielle Mandelentzündung · Antibiotikum',

  // ── beat 0: briefing — patient, goal, and what the green band means ──
  'adh.brief.patient':
    'Das ist Jonas, 16. Er hat eine bakterielle Mandelentzündung – fiese Bakterien im Hals. Dagegen bekommt er ein Antibiotikum (Penicillin): jeden Tag eine Dosis, eine ganze Woche lang.',
  'adh.brief.patient.adult':
    'Jonas, 16, mit bakterieller Mandelentzündung (Streptokokken). Therapie: Penicillin als 7-Tage-Kur, eine Dosis täglich.',
  'adh.brief.goal':
    'Dein Ziel: Halt den Wirkstoff jeden Tag im grünen Bereich, bis die ganze Kur zu Ende ist. Nur dann sterben wirklich alle Bakterien – und keines wird stärker.',
  'adh.brief.goal.adult':
    'Ziel: den Wirkstoffspiegel über die gesamte Kur im wirksamen Fenster halten. Nur eine konsequent zu Ende geführte Kur eradiziert die Erreger und vermeidet Resistenzen.',
  'adh.brief.legend': 'Was die Bereiche am Körper bedeuten:',
  'adh.legend.band': 'Grüner Bereich – genug Wirkstoff: die Bakterien sterben.',
  'adh.legend.band.adult': 'Wirksamer Bereich – über der Hemmschwelle (MHK), unter der Nebenwirkungsschwelle.',
  'adh.legend.low': 'Zu wenig – die stärksten Bakterien überleben und können resistent werden.',
  'adh.legend.low.adult': 'Unter der MHK – subtherapeutisch: resistente Subpopulationen werden selektiert.',
  'adh.legend.high': 'Zu viel – bringt nichts extra, macht aber Nebenwirkungen.',
  'adh.legend.high.adult': 'Oberhalb des Fensters – kein Zusatznutzen, dosisabhängige Nebenwirkungen.',
  'adh.brief.btn': 'Kur starten',

  // ── beat 1: accumulation — doses build up over days into the band ──
  'adh.accum.prompt':
    'Gib Jonas Tag für Tag seine Dosis. Schau auf den Körper und die Kurve: Eine Dosis allein reicht nicht – der Wirkstoff baut sich erst über mehrere Tage auf.',
  'adh.accum.prompt.adult':
    'Verabreiche die täglichen Dosen. Der Spiegel kumuliert über mehrere Tage zum Steady State – eine Einzeldosis erreicht das wirksame Fenster noch nicht.',
  'adh.accum.dose': 'Nächste Dosis geben',
  'adh.accum.watch': 'Schau auf den Körper – der Spiegel steigt.',
  'adh.accum.below': 'Noch zu wenig: Der Spiegel ist unter dem grünen Bereich. Die Bakterien sind noch da.',
  'adh.accum.below.adult': 'Noch subtherapeutisch – der Spiegel liegt unter der Hemmschwelle.',
  'adh.accum.entered': 'Jetzt im Grünen! Genug Wirkstoff – die Bakterien fangen an zu sterben.',
  'adh.accum.entered.adult': 'Im wirksamen Bereich – oberhalb der MHK beginnt die Abtötung.',
  'adh.accum.steady': 'Stabil im grünen Bereich. Jetzt wirkt die Kur – aber sie ist noch nicht zu Ende.',
  'adh.accum.steady.adult': 'Steady State im Fenster erreicht – wirksam. Die Kur muss aber vollständig zu Ende geführt werden.',
  'adh.accum.next': 'Weiter',

  // ── question 1 (conceptual): why daily, not all at once ──
  'adh.q1.prompt': 'Warum jeden Tag eine Dosis – und nicht alles auf einmal am ersten Tag?',
  'adh.q1.steady': 'Der Wirkstoff baut sich über Tage auf – jeden Tag eine Dosis hält ihn gleichmäßig im wirksamen Bereich.',
  'adh.q1.blast': 'Eine große Dosis am ersten Tag würde sofort alle Bakterien töten.',
  'adh.q1.ration': 'Damit die Packung länger reicht.',
  'adh.q1.fb.steady': 'Genau. Eine einzelne Dosis reicht nicht – erst das tägliche Nachlegen hält den Spiegel oben, gleichmäßig im grünen Bereich.',
  'adh.q1.fb.steady.adult': 'Korrekt – die Wirkung hängt am gehaltenen Spiegel (Steady State), nicht an der einzelnen Dosis.',
  'adh.q1.fb.blast': 'Nein – eine Riesendosis auf einmal schießt über (Nebenwirkungen) und ist am nächsten Tag schon wieder weg. Dann sind längst nicht alle Bakterien tot.',
  'adh.q1.fb.blast.adult': 'Nein – eine Einzelgabe überschießt toxisch und fällt rasch wieder unter die MHK; keine anhaltende Abtötung.',
  'adh.q1.fb.ration': 'Darum geht es nicht – es geht um einen gleichmäßigen Spiegel, nicht ums Sparen. Jeden Tag eine Dosis hält ihn stabil.',
  'adh.q1.fb.ration.adult': 'Nein – nicht Vorrat, sondern ein konstanter Spiegel ist der Grund für die tägliche Gabe.',

  // ── beat 2: a skipped dose drops below the kill line ──
  'adh.skip.intro': 'Tag 4: Jonas fühlt sich schon viel besser – und vergisst seine Dosis. Schau, was mit dem Spiegel passiert.',
  'adh.skip.intro.adult': 'Tag 4: deutliche Besserung – eine Dosis wird ausgelassen. Beobachte den Spiegel.',
  'adh.skip.btn': 'Tag ohne Tablette ansehen',
  'adh.skip.watch': 'Schau auf den Körper – der Spiegel sackt ab.',
  'adh.skip.land': 'Der Spiegel ist unter den grünen Bereich gefallen – zu wenig, um die Bakterien zu töten. Die stärksten überleben.',
  'adh.skip.land.adult': 'Der Spiegel ist unter die Hemmschwelle gefallen – subtherapeutisch. Die widerstandsfähigsten Bakterien überleben.',
  'adh.skip.next': 'Was soll Jonas tun?',

  // ── question 2 (the decision): what to do about the missed dose ──
  'adh.q2.prompt': 'Jonas merkt, dass er eine Dosis vergessen hat. Was sollte er jetzt tun?',
  'adh.q2.normal': 'Die nächste Dosis normal und pünktlich nehmen – und die Kur bis zum Ende durchziehen.',
  'adh.q2.double': 'Zwei auf einmal nehmen, um die vergessene nachzuholen.',
  'adh.q2.stop': 'Die Kur jetzt beenden – es geht ihm ja schon besser.',
  'adh.q2.fb.normal': 'Richtig. Einfach normal weiter und die Kur zu Ende. Schauen wir uns trotzdem an, warum die beiden anderen Ideen schaden würden.',
  'adh.q2.fb.normal.adult': 'Korrekt – reguläre Einzeldosis fortsetzen und die Kur vollständig beenden. Sehen wir, warum die Alternativen schaden.',
  'adh.q2.fb.double': 'Nicht ganz – zwei auf einmal holen nichts „nach", sie treiben den Spiegel über den grünen Bereich (Nebenwirkungen). Welche Antwort ist sicher?',
  'adh.q2.fb.double.adult': 'Nein – Verdoppeln kompensiert keine ausgelassene Dosis, sondern überschießt (dosisabhängige Nebenwirkungen).',
  'adh.q2.fb.stop': 'Nicht ganz – sich besser fühlen heißt nicht, dass alle Bakterien tot sind. Wer jetzt abbricht, lässt die stärksten zurück. Welche Antwort ist sicher?',
  'adh.q2.fb.stop.adult': 'Nein – klinische Besserung ≠ Eradikation; ein vorzeitiger Abbruch selektiert Resistenzen.',

  // ── beat 3: demo „nachholen" with a double → overshoot, then the correct fix ──
  'adh.double.intro': 'Idee 1: „Ich nehme zwei auf einmal, um es nachzuholen." Schauen wir, was am Körper passiert.',
  'adh.double.intro.adult': 'Szenario „Nachholen" – Doppeldosis. Beobachte die Richtung des Spiegels.',
  'adh.double.btn': 'Zwei Tabletten geben',
  'adh.double.watch': 'Schau auf den Körper – der Spiegel klettert nach oben.',
  'adh.double.land': 'Über den grünen Bereich hinaus! Zwei auf einmal holen nichts nach – sie machen nur Nebenwirkungen. Mehr Wirkstoff schiebt den Spiegel immer nach oben.',
  'adh.double.land.adult': 'Über das Fenster hinaus – „Nachholen" ist additiv, nicht ausgleichend: mehr Wirkstoff schiebt den Spiegel nach oben (dosisabhängige Toxizität).',
  'adh.double.healBtn': 'Und wie wäre es richtig?',
  'adh.double.heal': 'Richtig ist eine ganz normale Dosis: Schau – der Spiegel sinkt sanft zurück in den grünen Bereich. Eine vergessene Dosis holt man nicht nach.',
  'adh.double.heal.adult': 'Richtig: reguläre Einzeldosis – der Spiegel kehrt ruhig ins Fenster zurück. Verpasste Dosen nicht verdoppeln.',
  'adh.double.next': 'Weiter',

  // ── beat 4: demo „stop early" → the resistance bloom (the climax) ──
  'adh.resist.intro': 'Idee 2: „Mir geht es gut, ich höre einfach auf." Ein paar Tage später bricht Jonas die Kur ab. Schau jetzt genau auf die Bakterien.',
  'adh.resist.intro.adult': 'Szenario „vorzeitiger Abbruch": die Kur wird bei Besserung beendet. Achte auf die Bakterienpopulation.',
  'adh.resist.btn': 'Kur abbrechen',
  'adh.resist.watch': 'Schau auf den Körper – der Spiegel fällt, der Schutz verschwindet.',
  'adh.resist.land': 'Genau die stärksten Bakterien haben überlebt. Ohne Antibiotikum vermehren sie sich wieder – und dieses Antibiotikum kann ihnen jetzt nichts mehr anhaben. Sie sind resistent geworden.',
  'adh.resist.land.adult': 'Die widerstandsfähigsten Erreger haben überlebt und proliferieren ohne Wirkstoff erneut – jetzt resistent gegen dieses Antibiotikum.',
  'adh.resist.note': 'Darum: ein Antibiotikum immer wie verordnet zu Ende nehmen – auch wenn man sich schon besser fühlt.',
  'adh.resist.note.adult': 'Konsequenz: Antibiotika wie verordnet vollständig einnehmen – Resistenzvermeidung ist ein zentrales Therapieziel.',
  'adh.resist.next': 'Warum ist das so gefährlich?',

  // ── question 3 (resistance comprehension) ──
  'adh.q3.prompt': 'Warum ist es gefährlich, ein Antibiotikum zu früh abzusetzen?',
  'adh.q3.resist': 'Die widerstandsfähigsten Bakterien überleben, vermehren sich – und werden resistent.',
  'adh.q3.alldead': 'Gar nicht – wenn man sich besser fühlt, sind die Bakterien schon alle tot.',
  'adh.q3.tolerance': 'Der Körper gewöhnt sich an das Antibiotikum.',
  'adh.q3.fb.resist': 'Genau. Die zähesten überleben die zu niedrige Dosis, kommen zurück – und gegen dieses Mittel ist dann kein Ankommen mehr.',
  'adh.q3.fb.resist.adult': 'Korrekt – subtherapeutische Spiegel selektieren resistente Subpopulationen, die nach Abbruch expandieren.',
  'adh.q3.fb.alldead': 'Nein – sich besser fühlen heißt nicht „alle tot". Die zähesten sind noch da; bricht man jetzt ab, kommen genau die zurück.',
  'adh.q3.fb.alldead.adult': 'Nein – klinische Besserung tritt vor der vollständigen Eradikation ein; Restpopulationen überleben.',
  'adh.q3.fb.tolerance': 'Knapp daneben – nicht der Körper gewöhnt sich, sondern die Bakterien selbst verändern sich und werden unempfindlich.',
  'adh.q3.fb.tolerance.adult': 'Nicht der Wirt – die Resistenz entsteht in den Bakterien (Selektion/Adaptation), nicht durch „Gewöhnung" des Körpers.',

  // ── beat 5: the correct run — finish the whole course ──
  'adh.cure.intro': 'Und so macht Jonas es richtig: Er nimmt jede Dosis – die ganze Kur bis zum letzten Tag.',
  'adh.cure.intro.adult': 'Der korrekte Verlauf: jede Dosis, die Kur vollständig zu Ende.',
  'adh.cure.btn': 'Kur zu Ende führen',
  'adh.cure.watch': 'Schau auf den Körper – der Spiegel kommt zurück ins Grüne und bleibt dort.',
  'adh.cure.done': 'Die ganze Woche im grünen Bereich – jetzt sind wirklich alle Bakterien weg. Kein Rückfall, keine Resistenz.',
  'adh.cure.done.adult': 'Durchgehend im Fenster bis Kurende – vollständige Eradikation, keine Resistenzselektion.',

  // ── finale / outcome ──
  'adh.won.title': 'Kur geschafft!',
  'adh.won.body': 'Jonas hat jede Dosis genommen und die Kur zu Ende gebracht. Alle Bakterien sind weg – und keines konnte stärker werden.',
  'adh.won.body.adult': 'Vollständige, konsequent zu Ende geführte Kur – Erreger eradiziert, keine Resistenzbildung.',
  'adh.won.peek': 'Sehen wir uns das Ergebnis an.',

  'adh.out.win.title': 'Kur geschafft! 🎉',
  'adh.out.win.sub': 'Jeden Tag die Dosis, die ganze Kur zu Ende – alle Bakterien weg, keine Resistenz.',
  'adh.out.win.sub.adult': 'Kur vollständig zu Ende geführt – Erreger eradiziert, Resistenzbildung vermieden.',
  'adh.out.dyk1': 'Ein Antibiotikum wirkt nur, wenn der Wirkstoff über Tage gleichmäßig hoch genug bleibt – darum jeden Tag pünktlich die Dosis.',
  'adh.out.dyk1.adult': 'Antibiotika brauchen einen über der Hemmschwelle (MHK) gehaltenen Spiegel über die gesamte Kurdauer – nicht die einzelne Dosis entscheidet.',
  'adh.out.dyk2': 'Eine vergessene Dosis nicht mit zwei nachholen – das schießt über und macht nur Nebenwirkungen. Einfach normal weiter.',
  'adh.out.dyk2.adult': 'Verpasste Dosen nicht verdoppeln (dosisabhängige Toxizität); reguläre Einzeldosis fortsetzen.',
  'adh.out.dyk3': 'Die Kur immer zu Ende nehmen – auch wenn man sich besser fühlt. Sonst überleben die stärksten Bakterien und werden resistent.',
  'adh.out.dyk3.adult': 'Kur wie verordnet vollständig einnehmen: ein vorzeitiger Abbruch selektiert Resistenzen – ein zentrales Public-Health-Problem.',

  // ── shared bits (curve labels, petri, generic next) ──
  'adh.next': 'Weiter',
  'adh.curve.band': 'wirksam',
  'adh.curve.low': 'zu wenig',
  'adh.curve.high': 'zu viel',
  'adh.petri.label': 'Bakterien im Körper',
  'adh.petri.resistant': 'Bakterien – jetzt resistent!',
  'adh.petri.cleared': 'alle Bakterien weg ✓',
}
