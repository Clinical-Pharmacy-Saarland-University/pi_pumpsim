// Copy for „Der Wochen-Pillenplan" (Adhärenz · Lamotrigin). Merged into the `de` dict in
// locale.svelte.ts (last-spread-wins). Conventions: the level = „der Spiegel" (never „das
// Wasser" for the concept); danger = „über/unter den grünen Bereich" (NEVER „rote Linie");
// two registers on every key; patient-framed; don't presume the player's pick.
export const adherenceLocale: Record<string, string> = {
  // ── case header ──
  'adh.case': 'Lena, 22 · Epilepsie · Lamotrigin',

  // ── beat 0: setup (collapsed briefing + steady + event) ──
  'adh.brief.patient': 'Das ist Lena, 22. Sie studiert und hat Epilepsie. Eine kleine Tablette jeden Tag sorgt dafür, dass keine Anfälle kommen.',
  'adh.brief.patient.adult': 'Lena, 22, Studentin mit Epilepsie. Sie nimmt Lamotrigin (Antiepileptikum) zum Anfallsschutz – eine Tablette täglich.',
  'adh.brief.goal': 'Es ist Prüfungswoche und viel los. Hilf Lena, ihren Rhythmus zu halten: jeden Tag genau eine Tablette. Bau zuerst ihre ganze Woche – ganz in Ruhe, ohne Zeitdruck.',
  'adh.brief.goal.adult': 'Prüfungswoche, viel Stress. Halte Lenas Wirkspiegel über die Woche konstant im grünen Bereich. Plane zuerst die ganze Woche (Mo–So) – ohne Zeitdruck, danach spielst du sie Tag für Tag ab.',
  'adh.setup.btn': 'Kalender öffnen',

  // dose-fill "Wusstest du?" cards (while the prime 20 -> 62 pumps in)
  'adh.fact.kicker': 'Wusstest du?',
  'adh.fact.disease': 'Bei Epilepsie schützt ein gleichmäßiger Wirkstoff-Spiegel vor Anfällen – jeden Tag gleich viel.',
  'adh.fact.disease.adult': 'Epilepsie: Anfallsschutz hängt am konstanten Wirkspiegel. Schwankungen – nach oben oder unten – sind das Risiko.',
  'adh.fact.drug': 'Lamotrigin ist Lenas Anfallsschutz. Es wirkt nur, wenn immer gleich viel im Blut ist.',
  'adh.fact.drug.adult': 'Lamotrigin (Antiepileptikum): Wirkung über den Steady State – nicht über die einzelne Tablette.',
  'adh.fact.window': 'Der grüne Bereich ist genau richtig: zu wenig schützt nicht, zu viel macht müde und schwindelig.',
  'adh.fact.window.adult': 'Therapeutischer Bereich: darunter kein Schutz (Durchbruchsanfall), darüber dosisabhängige Toxizität (Ataxie, Doppelbilder).',
  'adh.fact.timing': 'Am besten jeden Tag zur gleichen Zeit – so bleibt der Spiegel ruhig im Grünen.',
  'adh.fact.timing.adult': 'Feste Einnahmezeit hält den Spiegel stabil; eine vergessene Dosis wird NICHT durch Verdoppeln ausgeglichen.',
  'adh.setup.cue': 'Schau auf den Körper – der Spiegel steigt ruhig in den grünen Bereich.',
  'adh.setup.cue.adult': 'Schau auf den Körper – der Wirkspiegel läuft in den therapeutischen Bereich ein.',
  'adh.setup.filled': 'Eingestellt. Der Spiegel ruht jetzt ruhig im Grünen – das ist Lenas guter Rhythmus.',
  'adh.setup.filled.adult': 'Steady State erreicht – der Spiegel ruht im grünen Bereich. Genau diesen Zustand soll der Plan halten.',

  // ── beat 1: build the week (the signature authoring beat) ──
  'adh.build.prompt': 'Bau Lenas Woche – ganz in Ruhe. Tippe jeden Tag: einmal = eine 💊, nochmal = zwei (nachholen), nochmal = leer (vergessen).',
  'adh.build.prompt.adult': 'Erstelle Lenas 7-Tage-Plan (Mo–So), ohne Zeitdruck. Tippen wechselt pro Tag: eine Tablette → doppelt („Nachholen") → leer (vergessene Dosis).',
  'adh.build.hint': 'Tipp: probier ruhig aus, was passiert – z. B. einen Tag leer lassen oder einen Tag doppeln. Beim Abspielen zeigt dir der Körper, wohin der Spiegel geht.',
  'adh.build.hint.adult': 'Du darfst Lücken und Doppeldosen einbauen – die Wiedergabe zeigt dir am Körper, in welche Richtung der Spiegel läuft.',
  'adh.slot.empty': 'leer · vergessen',
  'adh.slot.one': 'eine Tablette',
  'adh.slot.double': 'doppelt · nachholen',
  'adh.slot.tap': 'tippen',
  'adh.build.play': 'Woche starten',

  // ── day ticker (beat 2) ──
  'adh.day.mo': 'Montag', 'adh.day.di': 'Dienstag', 'adh.day.mi': 'Mittwoch',
  'adh.day.do': 'Donnerstag', 'adh.day.fr': 'Freitag', 'adh.day.sa': 'Samstag', 'adh.day.so': 'Sonntag',

  // ── beat 2: hand-crank playback ──
  'adh.play.prompt': 'Dreh die Woche Tag für Tag. Schau bei jedem Tag auf den Körper – dein Plan wird zur Kurve.',
  'adh.play.prompt.adult': 'Spiele die Woche tagweise ab. Bei jedem Tag folgt der Spiegel am Körper deinem Plan.',
  'adh.play.next': 'Nächster Tag',
  'adh.play.watch.held': 'Schau auf den Körper – der Spiegel bleibt ruhig im Grünen. Gehalten.',
  'adh.play.watch.held.adult': 'Schau auf den Körper – der Spiegel hält sich im therapeutischen Bereich (gehalten).',
  'adh.play.watch.gap': 'Schau auf den Körper – der Spiegel sackt eine Stufe ab, unter den grünen Bereich.',
  'adh.play.watch.gap.adult': 'Schau auf den Körper – die ausgelassene Dosis senkt den Spiegel unter das Fenster.',
  'adh.play.watch.up': 'Schau auf den Körper – der Spiegel klettert nach oben, in Richtung „zu hoch".',
  'adh.play.watch.up.adult': 'Schau auf den Körper – die Doppeldosis treibt den Spiegel nach oben, über den grünen Bereich.',
  'adh.bubble.held': 'Spiegel gehalten',
  'adh.bubble.gap': 'der Spiegel sackt ab',
  'adh.bubble.up': 'der Spiegel klettert nach oben',

  // ── beat 3: live read-the-body decision ──
  'adh.decide.prompt': 'Lena hat eine Tablette vergessen. Was sollte sie jetzt tun? Schau, wo der Spiegel steht – tief, aber noch nicht am Boden.',
  'adh.decide.prompt.adult': 'Lena hat eine Dosis ausgelassen; der Spiegel sitzt unter dem grünen Bereich (klar über der unteren Grenze). Wie sollte sie fortfahren? Lies den Körper.',
  'adh.dec.single': 'Heute EINE Tablette, ganz normal weiter',
  'adh.dec.double': 'Morgen ZWEI nehmen, um es nachzuholen',
  'adh.dec.omit': 'Die Pille heute ganz weglassen und abwarten',
  'adh.dec.retitrate': 'Die Dosis langsam neu aufbauen',
  'adh.decfb.single': 'Genau – schau, wie der Spiegel ruhig zurück ins Grüne steigt. Eine vergessene Tablette holt man NICHT mit zwei nach.',
  'adh.decfb.single.adult': 'Korrekt – mit der Einzeldosis fortfahren; der Spiegel kehrt in den therapeutischen Bereich zurück. Verpasste Dosis nicht verdoppeln.',
  'adh.decfb.double': 'Schau auf den Körper – zwei auf einmal lassen den Spiegel nach OBEN klettern, nicht zurück ins Grüne. Das ist die falsche Richtung.',
  'adh.decfb.double.adult': 'Falsch – „Nachholen" treibt den Spiegel nach oben (dosisabhängige Toxizität); mehr Wirkstoff schiebt ihn immer hinauf, nicht zurück.',
  'adh.decfb.omit': 'Nichts passiert – der Spiegel bewegt sich nicht. Weglassen ist nicht die Lösung; einfach normal mit der einen Tablette weiter.',
  'adh.decfb.omit.adult': 'Nichts passiert – Aussetzen löst das Problem nicht (und Antiepileptika nie eigenmächtig absetzen). Mit der üblichen Einzeldosis fortfahren.',
  'adh.decfb.retitrate': 'Das gilt erst nach einer LÄNGEREN Pause – hier war nur ein Tag. Da reicht: normal mit der einen Tablette weiter.',
  'adh.decfb.retitrate.adult': 'Nur nach längerer Pause korrekt (dann neu eintitrieren – sonst Risiko schwerer Hautreaktionen, SJS/TEN). Für eine einzelne vergessene Dosis genügt die normale Einzeldosis.',
  'adh.decide.next': 'Weiter',

  // ── beat 4: the twist (forced full-body double) ──
  'adh.twist.prompt': 'Und wenn Lena an einem schon „vollen" Tag verdoppelt? Dreh den Tag und schau genau hin.',
  'adh.twist.prompt.adult': 'Was macht eine Doppeldosis auf einen bereits vollen Spiegel? Spiele den Tag ab und beobachte die Richtung.',
  'adh.twist.btn': 'Tag drehen',
  'adh.twist.cue': 'Schau, wie der Spiegel nach oben klettert – nahe an „zu hoch", nicht zurück ins Grüne.',
  'adh.twist.cue.adult': 'Schau, wie der Spiegel steigt – bis dicht unter „über den Bereich". Mehr Wirkstoff schiebt immer nach oben.',
  'adh.twist.land': 'Nachholen macht es schlimmer, nicht besser: der Spiegel steigt die falsche Richtung. Ein zweites Mal verdoppeln – und es kippt über den grünen Bereich.',
  'adh.twist.land.adult': 'Additive Wahrheit: „Nachholen" ist nie neutral. Aus dem vollen Körper treibt die Doppeldosis nach oben; gestapelt kippt der Spiegel über die kritische Grenze.',
  'adh.twist.next': 'Weiter',

  // ── beat 5: finale ──
  'adh.won.title': 'Rhythmus gehalten!',
  'adh.won.body': 'Schau auf den Körper – das ruhige Wasser… der Spiegel ruht im Grünen, das IST der Beweis. Jeden Tag genau eine, die ganze Woche.',
  'adh.won.body.adult': 'Schau auf den Körper – der flache, im grünen Bereich ruhende Verlauf belegt die Regel: konstant einnehmen, nie verdoppeln.',
  'adh.won.peek': 'Sehen wir uns das Ergebnis an.',

  // ── outcomes (EndScreen) ──
  'adh.out.win.title': 'Rhythmus gehalten!',
  'adh.out.win.sub': 'Jeden Tag genau eine – Lena ist die ganze Woche sicher geschützt. Der Spiegel ruht im Grünen.',
  'adh.out.win.sub.adult': 'Konstanter Spiegel über die Woche – durchgehender Anfallsschutz im therapeutischen Bereich.',
  'adh.out.over.title': 'Überschossen!',
  'adh.out.over.sub': 'Zwei auf einmal haben den Spiegel über den grünen Bereich getrieben – das macht müde, schwindelig und unsicher auf den Beinen.',
  'adh.out.over.sub.adult': 'Überdosis durch „Nachholen" → dosisabhängige Toxizität (Ataxie, Doppelbilder, Sedierung). Verpasste Dosis niemals verdoppeln.',
  'adh.out.under.title': 'Schutz weg …',
  'adh.out.under.sub': 'Zu oft vergessen – ohne genug Wirkstoff bricht der Schutz weg, ein Anfall kann kommen.',
  'adh.out.under.sub.adult': 'Unterdosiert durch wiederholte Auslassungen → Spiegel unter dem Fenster → Durchbruchsanfall.',
  'adh.out.dyk1': 'Jeden Tag genau eine Tablette hält den Schutz gleichmäßig – Regelmäßigkeit ist hier die Medizin.',
  'adh.out.dyk1.adult': 'Lamotrigin schützt nur bei konstantem Wirkspiegel – die Regelmäßigkeit selbst ist die Therapie.',
  'adh.out.dyk2': 'Eine vergessene Tablette nicht mit zwei nachholen – einfach normal mit der einen weitermachen.',
  'adh.out.dyk2.adult': 'Verpasste Dosis nicht verdoppeln (Toxizität). Nach längerer Pause neu eintitrieren (sonst Risiko SJS/TEN); Antiepileptikum nie eigenmächtig absetzen.',
  'adh.out.dyk.over': 'Mehr Wirkstoff schiebt den Spiegel immer nach oben – auf einen vollen Körper draufgesetzt kippt er über den grünen Bereich.',
  'adh.out.dyk.over.adult': '„Nachholen" ist additiv und nie neutral: aus einem vollen Spiegel überschießt die Doppeldosis – das ist die häufige, gefährliche Fehlannahme.',
  'adh.out.dyk.under': 'Mehrere Tage hintereinander vergessen, und der Schutz sackt Stufe für Stufe weg.',
  'adh.out.dyk.under.adult': 'Non-Adhärenz ist eine Hauptursache von Durchbruchsanfällen – wiederholte Auslassungen senken den Spiegel unter das Fenster.',

  // ── legacy quiz strings (data-only; back the debrief; not a star decider) ──
  'adh.q.normal': 'Einfach normal mit einer Tablette weitermachen',
  'adh.q.double': 'Am nächsten Tag zwei nehmen, um es nachzuholen',
  'adh.q.stop': 'Lieber ganz aufhören, ist eh stressig',
  'adh.q.retitrate': 'Nach einer längeren Pause die Dosis langsam neu aufbauen',
  'adh.qfb.normal': 'Genau! Eine vergessene Tablette holt man nicht durch zwei nach – einfach normal weiter.',
  'adh.qfb.normal.adult': 'Korrekt – vergessene Dosis nicht verdoppeln; mit der üblichen Einzeldosis fortfahren.',
  'adh.qfb.double': 'Nein – zwei auf einmal ist zu viel. Der Spiegel schießt über, das wird gefährlich.',
  'adh.qfb.double.adult': 'Falsch – Verdopplung führt zu dosisabhängiger Toxizität (Ataxie, Doppelbilder, Sedierung).',
  'adh.qfb.stop': 'Nein – ohne Tabletten fehlt der Schutz, dann können Anfälle kommen.',
  'adh.qfb.stop.adult': 'Falsch – Absetzen entzieht den Anfallsschutz → Durchbruchsanfälle; AED nie eigenmächtig abbrechen.',
  'adh.qfb.retitrate': 'Das gilt für eine längere Pause – hier war nur ein Tag. Da reicht: einfach normal weitermachen.',
  'adh.qfb.retitrate.adult': 'Richtig nur für eine längere Pause (dann neu eintitrieren – sonst Risiko SJS/TEN). Für eine einzelne vergessene Dosis genügt: normal weitermachen.',
}
