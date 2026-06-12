// Copy for „Das pflanzliche Leck" (Induktion · Johanniskraut × Ciclosporin). Merged into the
// `de` dict in locale.svelte.ts (last-spread-wins). REWORKED flow (2026-06): dose → leak reveal
// → magnifier investigation → mechanism explanation → calm finale. Conventions: the level =
// „der Spiegel / Schutz-Spiegel" (NEVER „das Wasser" for the concept); danger = „unter dem
// grünen Bereich" (NEVER „rote Linie"); enzymes = „Aufräum-Team / Abbau-Enzyme", CYP3A4+P-gp
// „in Darm und Leber"; two registers; patient-framed; don't presume the player's pick.
export const johanniskrautLocale: Record<string, string> = {
  // ── briefing ──────────────────────────────────────────────────────────────────
  'jk.case': 'Frau Berger, 54 · neue Niere · Schutz-Medikament',
  'jk.case.adult': 'Frau Berger, 54 · nach Nierentransplantation · Ciclosporin',
  'jk.brief.patient': 'Frau Berger, 54, hat eine neue Niere bekommen. Damit die neue Niere gesund bleibt, nimmt sie jeden Tag ein Schutz-Medikament.',
  'jk.brief.patient.adult': 'Frau Berger, 54, nach Nierentransplantation. Zum Schutz des Transplantats nimmt sie täglich Ciclosporin — ein Mittel mit enger therapeutischer Breite.',
  'jk.brief.goal': 'Bring den Schutz-Spiegel in den grünen Bereich und halte ihn dort. Fällt er zu tief, ist die neue Niere in Gefahr.',
  'jk.brief.goal.adult': 'Bring den Ciclosporin-Talspiegel ins therapeutische Fenster und halte ihn dort. Fällt er subtherapeutisch, droht eine Abstoßung.',
  'jk.brief.btn': 'Standarddosis geben',

  // ── dose fill + „Wusstest du?" facts ──────────────────────────────────────────
  'jk.cue.fill': 'Schau auf den Torso — der Schutz-Spiegel steigt in den grünen Bereich.',
  'jk.cue.filled': 'Im grünen Bereich angekommen — der Schutz steht.',
  'jk.fact.kicker': 'Wusstest du?',
  'jk.fact.disease': 'Bei einer neuen Niere muss ein Schutz-Medikament den Körper bremsen, damit er die Niere nicht abwehrt.',
  'jk.fact.disease.adult': 'Nach einer Transplantation verhindert die Immunsuppression (Ciclosporin), dass das Immunsystem das Transplantat abstößt.',
  'jk.fact.drug': 'Das Schutz-Medikament heißt Ciclosporin. Es muss genau richtig dosiert sein — zu wenig schützt nicht.',
  'jk.fact.drug.adult': 'Ciclosporin (Calcineurin-Inhibitor) hat eine enge therapeutische Breite — schon kleine Spiegel-Abfälle gefährden das Transplantat.',
  'jk.fact.window': 'Der grüne Bereich ist das Schutzfenster: darüber wäre es zu viel, darunter zu wenig Schutz.',
  'jk.fact.window.adult': 'Das grüne Band ist das therapeutische Fenster; unter dem Band ist der Talspiegel subtherapeutisch.',
  'jk.fact.monitor': 'Bei diesem Schutz-Medikament wird der Spiegel im Blut regelmäßig kontrolliert — so sieht man, ob die Menge genau stimmt.',
  'jk.fact.monitor.adult': 'Ciclosporin wird über den Talspiegel im Blut überwacht (Drug-Monitoring), um die Dosis im therapeutischen Fenster zu halten.',
  'jk.dose.reveal': 'Genau richtig — im grünen Bereich! Die neue Niere ist geschützt.',
  'jk.dose.reveal.adult': 'Im therapeutischen Fenster — das Transplantat ist ausreichend immunsupprimiert.',
  'jk.dose.next': 'Eine Woche später',

  // ── „eine Woche später": the leak reveal ──────────────────────────────────────
  'jk.leak.fall': 'Eine Woche später — schau auf den Torso: der Schutz-Spiegel ist langsam gesunken.',
  'jk.leak.title': 'Etwas zieht heimlich am Schutz',
  'jk.leak.sub': 'Frau Berger hat alles wie immer genommen — trotzdem ist der Schutz unter den grünen Bereich gerutscht. Etwas Neues muss daran ziehen.',
  'jk.leak.sub.adult': 'Die Ciclosporin-Dosis war unverändert, der Talspiegel ist trotzdem subtherapeutisch. Irgendetwas beschleunigt den Abbau.',
  'jk.leak.btn': 'Spurensuche starten',

  // ── investigation: magnifier over Frau Bergers neue Tees ──────────────────────
  'jk.inv.prompt': 'Frau Berger hat diese Woche ein paar neue Tees getrunken. Untersuche jeden mit der Lupe — was steckt wirklich drin?',
  'jk.inv.prompt.adult': 'Frau Berger hat diese Woche neue Pflanzenpräparate ergänzt. Prüfe jedes — welcher Wirkstoff induziert den Abbau?',
  'jk.inv.watch': 'Tippe die Tees an — die Lupe zeigt, was wirklich drinsteckt. „Pflanzlich" heißt nicht harmlos.',
  'jk.inv.watch.adult': 'Tippe jedes Präparat an — die Lupe nennt den Wirkstoff. „Pflanzlich" ist kein Synonym für „wirkungslos".',
  'jk.inv.tapHint': 'antippen = mit der Lupe ansehen',
  'jk.inv.revealed': 'untersucht',
  'jk.inv.toAccuse': 'Verdächtigen',
  'jk.inv.accusePrompt': 'Welcher Tee zieht heimlich am Schutz? Nimm ihn aus Frau Bergers Plan.',
  'jk.inv.accusePrompt.adult': 'Welches Präparat induziert den Ciclosporin-Abbau? Nimm es aus dem Plan.',
  'jk.inv.take': 'aus dem Plan nehmen',
  'jk.inv.wrong': 'Der ist harmlos — schau nochmal, welcher ein echter Wirkstoff ist.',
  'jk.inv.wrong.adult': 'Kein Induktor — dieses Präparat erklärt den fallenden Spiegel nicht. Schau nochmal.',

  // item shelf names + magnifier reveal lines
  'jk.item.tea': 'Stimmungstee',
  'jk.item.kamille': 'Kamillentee',
  'jk.item.pfeff': 'Pfefferminztee',
  'jk.item.ingwer': 'Ingwertee',
  // reveal = the plant's real identity only — NO „pulls at the protection / doesn't" verdict
  // (the player must decide; the mechanism is taught afterwards in the explanation beat)
  'jk.reveal.tea': 'Johanniskraut (Hypericum perforatum) — pflanzlich, für die Stimmung.',
  'jk.reveal.tea.adult': 'Johanniskraut (Hypericum perforatum) — pflanzliches Stimmungsmittel.',
  'jk.reveal.kamille': 'Kamille (Matricaria) — ein beruhigender Tee.',
  'jk.reveal.kamille.adult': 'Kamille (Matricaria chamomilla) — traditionell beruhigend.',
  'jk.reveal.pfeff': 'Pfefferminze (Mentha) — gut für den Magen.',
  'jk.reveal.pfeff.adult': 'Pfefferminze (Mentha × piperita) — bei Magen-Darm-Beschwerden.',
  'jk.reveal.ingwer': 'Ingwer (Zingiber) — wärmt und hilft bei Übelkeit.',
  'jk.reveal.ingwer.adult': 'Ingwer (Zingiber officinale) — traditionell gegen Übelkeit.',

  // ── mechanism explanation (the lag, taught — not a memory test) ────────────────
  'jk.explain.title': 'Warum läuft der Schutz aus?',
  'jk.explain.body': 'Johanniskraut weckt in Darm und Leber die Abbau-Enzyme — die kleinen Helfer, die Medikamente zerlegen. Über Tage werden es immer mehr. Sie bauen das Schutz-Medikament schneller ab, als es nachkommt — der Schutz läuft langsam aus.',
  'jk.explain.body.adult': 'Hyperforin im Johanniskraut induziert CYP3A4 und P-Glykoprotein in Darm und Leber. Diese werden über Tage hochreguliert und eliminieren Ciclosporin schneller — die Exposition sinkt, der Talspiegel fällt.',
  'jk.explain.rampLabel': 'Abbau-Enzyme („Aufräum-Team")',
  'jk.explain.rampStart': 'Tag 1',
  'jk.explain.rampEnd': 'Tag 7',
  'jk.explain.lag': 'Darum hat man tagelang nichts gemerkt: der erste Schluck tut fast nichts — die Wirkung kommt verzögert, erst wenn das Aufräum-Team groß ist.',
  'jk.explain.lag.adult': 'Deshalb der verzögerte Verlauf: der Effektgipfel der Induktion liegt Tage nach der ersten Einnahme, nicht am selben Tag.',
  'jk.explain.btn': 'Jetzt eingreifen',

  // ── finale: stop the live leak ────────────────────────────────────────────────
  'jk.finale.prompt': 'Schnell — wir müssen das Leck stopfen! Zwei Dinge sind jetzt wichtig.',
  'jk.finale.prompt.adult': 'Schnell — der Talspiegel fällt subtherapeutisch! Zwei Maßnahmen zählen jetzt.',
  'jk.finale.sub': 'Zwei Dinge gehören zusammen: das Johanniskraut absetzen UND die Fachstelle anrufen.',
  'jk.finale.sub.adult': 'Als Einheit handeln: Ursache (Johanniskraut) stoppen, Transplantationszentrum einbeziehen, Talspiegel kontrollieren. Keine eigenmächtige Dosisänderung.',
  'jk.act.absetzen': '🌿 Johanniskraut absetzen',
  'jk.act.absetzen.adult': '🌿 Johanniskraut (Induktor) absetzen',
  'jk.act.fachstelle': '📞 Transplant-Ambulanz / Fachstelle anrufen',
  'jk.act.fachstelle.adult': '📞 Transplantationszentrum kontaktieren',
  'jk.act.spiegel': '🩸 Talspiegel kontrollieren lassen',
  'jk.act.spiegel.adult': '🩸 Ciclosporin-Talspiegel bestimmen',
  'jk.act.verdoppeln': '💊 Ciclosporin heimlich verdoppeln',
  'jk.act.naturmittel': '🌼 Noch ein Naturmittel dazunehmen',
  'jk.fb.absetzen': 'Ursache gestoppt — aber das reicht noch nicht, der Schutz fällt weiter!',
  'jk.fb.absetzen.adult': 'Johanniskraut abgesetzt — aber das genügt allein nicht, der Spiegel fällt weiter.',
  'jk.fb.needCause': 'Fachstelle informiert — aber das reicht noch nicht, der Schutz fällt weiter!',
  'jk.fb.needCause.adult': 'Fachstelle einbezogen — aber das genügt allein nicht, der Spiegel fällt weiter.',
  'jk.fb.spiegel': 'Gut — der Schutz-Spiegel wird jetzt kontrolliert.',
  'jk.fb.spiegel.adult': 'Gut — Talspiegelkontrolle zur Steuerung der Immunsuppression.',
  'jk.fb.verdoppeln': 'Gefährlich — nicht heimlich an der Dosis drehen. Das kann giftig werden, sobald der Tee weg ist.',
  'jk.fb.verdoppeln.adult': 'Gefährlich — eigenmächtiges Hochdosieren bei enger therapeutischer Breite wird toxisch, sobald der Induktor wegfällt.',
  'jk.fb.naturmittel': 'Nein — noch ein Naturmittel bringt nur neue Wechselwirkungen.',
  'jk.fb.naturmittel.adult': 'Falsch — weitere Phytotherapeutika/Supplemente erhöhen das Interaktionsrisiko.',
  'jk.finale.rescue': 'Das Leck ist gestopft — schau auf den Torso: der Spiegel steigt zurück in den grünen Bereich.',
  'jk.finale.rescue.adult': 'Leck gestopft — der Spiegel kehrt um und steigt zurück ins therapeutische Fenster.',

  // ── outcomes + debrief ────────────────────────────────────────────────────────
  'jk.out.win.title': 'Schutz gerettet!',
  'jk.out.win.sub': 'Du hast das Leck rechtzeitig gestoppt — die neue Niere bleibt geschützt.',
  'jk.out.win.sub.adult': 'Johanniskraut abgesetzt, Fachstelle einbezogen, Talspiegel gesichert — Transplantat geschützt.',
  'jk.out.under.title': 'Abstoßung!',
  'jk.out.under.sub': 'Der Schutz ist unter den grünen Bereich gefallen — die neue Niere ist in Gefahr. Probier es nochmal!',
  'jk.out.under.sub.adult': 'Subtherapeutischer Ciclosporin-Spiegel → Abstoßungsgefahr. Deshalb: Johanniskraut absetzen, Fachstelle einbeziehen, Talspiegel kontrollieren.',
  'jk.out.dyk.lag': 'Johanniskraut wirkt verzögert: der erste Schluck tut fast nichts — der Schutz sinkt erst über Tage, wenn die Abbau-Enzyme angewachsen sind.',
  'jk.out.dyk.lag.adult': 'Enzyminduktion (Hyperforin → PXR → CYP3A4/P-gp) wirkt verzögert über Tage; der Effektgipfel liegt nach Beginn der Einnahme, nicht am selben Tag.',
  'jk.out.dyk.herb': 'Natürlich heißt nicht harmlos: Tees, Kapseln und Pflanzenmittel gehören auf die Medikamenten-Liste.',
  'jk.out.dyk.herb.adult': 'Pflanzliche Präparate gehören in die Arzneimittelanamnese; „pflanzlich" ist kein Synonym für „wirkungslos".',
  'jk.out.dyk.under': 'Ein fallender Schutz-Spiegel heißt: zu wenig Schutz. Ursache stoppen UND Fachleute fragen — nie selbst die Dosis ändern.',
  'jk.out.dyk.under.adult': 'Management als Einheit: Johanniskraut absetzen, Transplantationszentrum einbeziehen, Talspiegel kontrollieren — keine eigenmächtige Ciclosporin-Anpassung (enge therapeutische Breite).',
}
