// German-first i18n. Reactive current locale; t() falls back to German for any
// key (and for whole locales) that isn't translated yet.
type Params = Record<string, string | number>

export type Locale = 'de' | 'en' | 'fr' | 'nl' | 'ar'

export const LOCALES: { id: Locale; name: string }[] = [
  { id: 'de', name: 'Deutsch' },
  { id: 'en', name: 'English' },
  { id: 'fr', name: 'Français' },
  { id: 'nl', name: 'Nederlands' },
  { id: 'ar', name: 'العربية' },
]

export type Age = 'young' | 'adult'

// `age` lets a single key carry two registers: t('foo') prefers 'foo.{age}'
// (warm/simple for kids, precise/clinical for adults) and falls back to 'foo'.
export const i18n = $state({ locale: 'de' as Locale, age: 'young' as Age })

export function setLocale(l: Locale): void {
  i18n.locale = l
}
export function setAgeLocale(a: Age): void {
  i18n.age = a
}

const de: Record<string, string> = {
  'app.title': 'SafePolyMed',
  'app.subtitle': 'Bring deinen Patienten sicher durch!',

  // start screen
  'start.lang': 'Sprache',
  'start.age': 'Wer spielt?',
  'age.young': 'Kinder & Jugendliche',
  'age.adult': 'Erwachsene',
  'start.go': "Los geht's",
  'start.credit': 'SafePolyMed · EU-Forschungsprojekt · Klinische Pharmazie, Universität des Saarlandes',

  // story select
  'stories.title': 'Wähle eine Geschichte',
  'stories.soon': 'bald verfügbar',
  'common.back': 'Zurück',
  'common.next': 'Weiter',
  'common.retry': 'Nochmal',
  'common.cancel': 'Abbrechen',

  // story cards (title + short blurb)
  'story.grapefruit.title': 'Die Frühstücks-Falle',
  'story.grapefruit.desc': 'Cholesterin senken – aber Vorsicht beim Frühstück. (Nahrung)',
  'story.johanniskraut.title': 'Das Kräuter-Problem',
  'story.johanniskraut.desc': 'Ein pflanzliches Mittel mischt sich ein. (Pflanze/Arznei)',
  'story.gene.title': 'Jeder ist anders',
  'story.gene.desc': 'Gleiche Dosis, andere Gene. (Gen-Wechselwirkung)',
  'story.ddi.title': 'Der Funken-Plan',
  'story.ddi.desc': 'Zwei Medikamente, ein Problem. (Wechselwirkung)',
  'story.organ.title': 'Schwache Organe',
  'story.organ.desc': 'Niere und Leber arbeiten langsamer.',
  'story.adherence.title': 'Aus Versehen doppelt',
  'story.adherence.desc': 'Eine Tablette zu viel … oder zu wenig?',

  // reset / prepare
  'reset.title': 'Patient wird vorbereitet …',
  'reset.sub': 'Der Spiegel wird zurückgesetzt.',

  // band + bar
  'band.explain': 'Grüner Bereich = sicher · zu wenig wirkt nicht · zu viel ist gefährlich',
  'bar.title': 'Spiegel',

  // patient + drug
  'p.schmidt.name': 'Herr Schmidt',
  'p.schmidt.line': 'Herr Schmidt, 68 – zu hohes Cholesterin',
  'p.schmidt.line.young': 'Herr Schmidt, 68 – sein Blut hat zu viel Fett (Cholesterin).',
  'p.schmidt.line.adult': 'Herr Schmidt, 68 – erhöhtes Cholesterin (Hypercholesterinämie).',
  'd.simvastatin': 'Simvastatin',
  'briefing.goal': 'Stell {name} mit {drug} sicher ein – bring den Spiegel in den grünen Bereich.',
  'briefing.goal.young':
    'Hilf {name}! Gib ihm sein Medikament {drug} so, dass der Spiegel genau im grünen Bereich landet – nicht zu wenig und nicht zu viel.',
  'briefing.goal.adult':
    'Stell {name} mit {drug} therapeutisch sicher ein: Der Wirkstoff-Spiegel soll im grünen Fenster liegen – darunter wirkt es nicht, darüber drohen Nebenwirkungen.',

  // dose — the opening is a guided tutorial: give the standard dose, watch the
  // torso rise into the green window (teaches the window; not a graded choice).
  'dose.startTitle': 'Erste Einstellung',
  'dose.startPrompt': '{name} bekommt die Standarddosis {drug}.',
  'dose.startPrompt.young':
    '{name} bekommt sein Medikament {drug}. Schau, wie der Spiegel langsam in den grünen Bereich steigt!',
  'dose.startPrompt.adult':
    '{name} wird neu auf {drug} eingestellt – mit der üblichen Standarddosis.',
  'dose.give': 'Standarddosis geben',
  'dose.rising': 'Der Spiegel steigt …',
  'timejump': 'Eine Woche später …',

  // knowledge
  'opt.up': 'steigt ⬆',
  'opt.down': 'sinkt ⬇',
  'opt.none': 'bleibt gleich',
  'q.correct': 'Richtig!',
  'q.wrong': 'Nicht ganz …',

  // 5-band reveal („die Überraschung")
  'reveal.way_low': 'Viel zu wenig',
  'reveal.low': 'Zu wenig',
  'reveal.in': 'Genau richtig 🟢',
  'reveal.high': 'Zu viel ⚠️',
  'reveal.way_high': 'Viel zu viel 🛑',
  'reveal.way_low.sub': 'Der Spiegel ist viel zu niedrig – das Medikament wirkt nicht.',
  'reveal.low.sub': 'Knapp unter dem grünen Bereich – es wirkt noch zu schwach.',
  'reveal.in.sub': 'Im grünen Bereich – {name} ist gut eingestellt!',
  'reveal.high.sub': 'Über dem grünen Bereich – jetzt drohen Nebenwirkungen.',
  'reveal.way_high.sub': 'Gefährlich hoch – so wird es giftig!',
  'reveal.redose': 'Nochmal dosieren',

  // detective: which of the morning's items raised the level?
  'detect.prompt': 'Was hat den Wirkstoff-Spiegel steigen lassen?',
  'detect.prompt.young': 'Detektiv-Frage: Was hat den Spiegel steigen lassen?',
  'detect.apfel': '🍎 Der Apfel',
  'detect.birne': '🍐 Die Birne',
  'detect.kaffee': '☕ Der Kaffee',
  'detect.grapefruit': '🍊 Der Grapefruitsaft',
  'detect.jog': '🏃 Das Joggen',
  'detect.tired': '😴 Müde von der Arbeit',
  // per-item feedback (always say why)
  'detect.fb.grapefruit': 'Richtig erkannt – die Grapefruit war’s!',
  'detect.fb.grapefruit.adult': 'Korrekt – der Grapefruitsaft.',
  'detect.fb.apfel': 'Nein – ein Apfel ist harmlos. Denk an die Grapefruit!',
  'detect.fb.apfel.adult': 'Nein – Apfel beeinflusst den Abbau nicht.',
  'detect.fb.birne': 'Nein – eine Birne ist harmlos. Denk an die Grapefruit!',
  'detect.fb.birne.adult': 'Nein – Birne beeinflusst den Abbau nicht.',
  'detect.fb.kaffee': 'Nein – Kaffee macht hier keinen Ärger.',
  'detect.fb.kaffee.adult': 'Nein – Kaffee ist hier unkritisch.',
  'detect.fb.jog': 'Nein – Joggen ist sogar gut fürs Herz!',
  'detect.fb.jog.adult': 'Nein – körperliche Aktivität ist nicht das Problem.',
  'detect.fb.tired': 'Nein – Müdigkeit verändert den Spiegel nicht.',
  'detect.fb.tired.adult': 'Nein – Müdigkeit hat keinen Einfluss auf den Spiegel.',

  // decision / strategy
  'dec.prompt': 'Wie reagierst du?',
  'dec.prompt.young': 'Was tust du jetzt?',
  'dec.reduce': 'Dosis senken',
  'dec.stopGrapefruit': 'Grapefruit weglassen',
  'dec.spaceOut': 'Grapefruit & Tablette zeitversetzt einnehmen',
  'dec.increase': 'Dosis erhöhen',
  // per-choice feedback (always say why)
  'dec.fb.stopGrapefruit': 'Genau – ohne Grapefruit sinkt der Spiegel wieder. Der sauberste Weg!',
  'dec.fb.stopGrapefruit.adult':
    'Richtig – Grapefruit absetzen; das Enzym erholt sich, der Spiegel normalisiert sich. Bevorzugte Lösung.',
  'dec.fb.reduce': 'Mal sehen … aber Vorsicht: die Grapefruit-Menge schwankt von Tag zu Tag.',
  'dec.fb.reduce.adult':
    'Senkt den Spiegel zwar – aber bei schwankender Grapefruit-Menge ist die Hemmung unberechenbar. Riskant.',
  'dec.fb.spaceOut': 'Bringt leider nichts – die Grapefruit wirkt noch tagelang nach. Versuch’s nochmal.',
  'dec.fb.spaceOut.adult':
    'Wirkungslos – die CYP3A4-Hemmung hält Tage an; zeitlicher Abstand hilft nicht. Nochmal.',
  'dec.fb.increase': 'Gefährlich! Noch mehr Wirkstoff – jetzt wird es giftig für die Muskeln.',
  'dec.fb.increase.adult':
    'Gefährlich – mehr Substrat bei gehemmtem Abbau → toxischer Spiegel, Rhabdomyolyse-Risiko.',

  // 5b — variability (only after „Dosis senken")
  'var.story': 'Mal trinkt Herr Schmidt ein großes Glas Grapefruit, mal ein kleines – mal gar keins. Die Menge schwankt …',
  'var.story.adult':
    'Im Wochenverlauf schwankt die getrunkene Grapefruit-Menge – und damit die Stärke der CYP3A4-Hemmung. Bei fest gesenkter Dosis schwankt der Spiegel mit.',

  // event — a loaded breakfast (the culprit is hidden among harmless items)
  'ev.grapefruit.story':
    'Wochenlang läuft alles super! Doch eines Morgens, nach dem Joggen, frühstückt Herr Schmidt kräftig: Müsli mit Apfel und Birne, dazu ein Kaffee und ein großes Glas Grapefruitsaft.',
  'ev.grapefruit.story.young':
    'Wochenlang läuft alles super! 🎉 Doch eines Morgens, nach dem Joggen, frühstückt Herr Schmidt so richtig: Müsli mit Apfel und Birne, dazu ein Kaffee und ein großes Glas Grapefruitsaft.',
  'ev.grapefruit.story.adult':
    'Über Wochen ist Herr Schmidt stabil eingestellt. Eines Morgens – nach dem Joggen – frühstückt er ausgiebig: Müsli mit Apfel und Birne, ein Kaffee und ein großes Glas Grapefruitsaft.',
  // mechanism lesson (after the detective reveals the grapefruit)
  'ev.grapefruit.lesson':
    'Der Grapefruitsaft hemmt das Abbau-Enzym CYP3A4 – Simvastatin sammelt sich an, der Spiegel steigt. Apfel, Birne und Kaffee sind harmlos.',
  'ev.grapefruit.lesson.young':
    'Der Grapefruitsaft bremst das „Aufräum-Enzym“ (CYP3A4) – dann wird Simvastatin langsamer abgebaut und es wird zu viel. Apfel, Birne und Kaffee sind dagegen völlig harmlos.',
  'ev.grapefruit.lesson.adult':
    'Grapefruit hemmt CYP3A4 in der Darmwand – Simvastatin wird langsamer verstoffwechselt und kumuliert, der Spiegel (und das Muskelschaden-Risiko) steigt. Apfel, Birne und Kaffee beeinflussen CYP3A4 nicht.',

  // finale: fruit-identification game (which fruits interact like grapefruit?)
  'fruits.prompt': 'Bei welchen Früchten musst du aufpassen? Wähle alle aus.',
  'fruits.prompt.young': 'Welche dieser Früchte sind tricky fürs Medikament? Tippe alle an.',
  'fruits.prompt.adult': 'Welche dieser Früchte hemmen den Abbau (CYP3A4)? Wähle alle aus.',
  'fruits.confirm': 'Bestätigen',
  'fruits.correct': 'Perfekt – alle richtig erkannt!',
  'fruits.wrong': 'Nicht ganz – schau dir die Auflösung an.',
  'fruits.badge': 'Wechselwirkung',
  'fruits.credit': 'Fotos: Wikimedia Commons',
  'fruits.lesson':
    'Grapefruit, Pomelo und Bitterorange bremsen CYP3A4 – Orange, Mandarine und Zitrone nicht. „Zitrusfrucht" allein ist also noch kein Problem.',
  'fruits.lesson.young':
    'Grapefruit, Pomelo und Bitterorange bremsen das Enzym (CYP3A4) – Orange, Mandarine und Zitrone nicht. Es ist also nicht „jede Zitrusfrucht"!',
  'fruits.lesson.adult':
    'Grapefruit, Pomelo und Bitterorange enthalten die Furanocumarine Bergamottin und 6′,7′-Dihydroxybergamottin, die CYP3A4 hemmen. Süßorange, Mandarine und Zitrone praktisch nicht – „Zitrus" allein sagt also nichts.',
  'fruit.grapefruit': 'Grapefruit',
  'fruit.pomelo': 'Pomelo',
  'fruit.bitterorange': 'Bitterorange',
  'fruit.orange': 'Orange',
  'fruit.mandarine': 'Mandarine',
  'fruit.zitrone': 'Zitrone',

  // outcome
  'out.win.title': 'Sicher eingestellt! 🎉',
  'out.win.sub': '{name} ist im grünen Bereich.',
  'out.over.title': 'Überdosis! ⚠️',
  'out.over.sub': 'Zu viel Simvastatin → Muskelschäden (Rhabdomyolyse).',
  'out.over.sub.young': 'Zu viel! Das kann die Muskeln schädigen.',
  'out.over.sub.adult': 'Überdosis → Muskelschäden (Rhabdomyolyse).',
  'out.under.title': 'Unterdosiert …',
  'out.under.sub': 'Zu wenig Wirkstoff → das Cholesterin bleibt zu hoch.',
  'out.under.sub.young':
    'Mal mehr, mal weniger Grapefruit – mit der kleineren Dosis ist jetzt zu wenig Wirkstoff da. Das Cholesterin bleibt hoch.',
  'out.under.sub.adult':
    'Schwankende Grapefruit-Menge → schwankende Hemmung → mit gesenkter Dosis fällt der Spiegel unter das Fenster. Cholesterin bleibt unkontrolliert. Deshalb: Grapefruit weglassen.',
  'out.stars': '{n} von 3 Sternen',
  'out.dyk': 'Wusstest du?',
  'out.dyk.text':
    'Grapefruitsaft kann den Abbau vieler Medikamente bremsen – eine echte Nahrungs-Wechselwirkung.',
  'out.dyk.text.young':
    'Grapefruit kann den Abbau von Medikamenten ausbremsen. Nicht jedes Essen verträgt sich mit jeder Tablette!',
  'out.dyk.text.adult':
    'Grapefruit hemmt CYP3A4 über Furanocumarine (Bergamottin, 6′,7′-Dihydroxybergamottin) und kann den Spiegel vieler Medikamente erhöhen – der Effekt hält tagelang an.',
  'out.dyk2.text':
    'Und: Grapefruit ist nicht bei jedem Medikament ein Problem – nur bei bestimmten (CYP3A4).',
  'out.dyk2.text.young': 'Und: Grapefruit stört nicht jedes Medikament – nur manche!',
  'out.dyk2.text.adult':
    'Und: Grapefruit beeinflusst nur bestimmte Wirkstoffe (CYP3A4-Substrate), längst nicht alle.',

  // ===== Story „Der Funken-Plan" (DDI · Clarithromycin × Phenprocoumon) =====
  'ddi.new': 'NEU',
  'ddi.brief.patient': 'Herr Schmidt, 72, hat ein zitterndes Herz (Vorhofflimmern) und nimmt einen Blutverdünner (Marcumar). Das klappt seit Jahren super.',
  'ddi.brief.patient.adult': 'Herr Schmidt, 72, mit Vorhofflimmern – seit Jahren stabil auf Phenprocoumon (Marcumar) zur Schlaganfallprophylaxe, INR im Zielbereich.',
  'ddi.brief.goal': 'Jetzt ist er erkältet und bekommt von einem zweiten Arzt ein neues Medikament dazu. Pass auf, dass sich die neuen und die alten Tabletten vertragen!',
  'ddi.brief.goal.adult': 'Wegen einer Bronchitis verordnet ein zweiter Arzt ein Antibiotikum. Prüfe den Gesamtplan auf Wechselwirkungen, bevor er beides nimmt.',
  'ddi.plan.prompt': 'Schau dir an, was Herr Schmidt jeden Tag nimmt – sein Medikationsplan.',
  'ddi.plan.prompt.adult': 'Das ist Herrn Schmidts aktueller Medikationsplan.',
  'ddi.plan.reveal': 'Alles im grünen Bereich – die passen gut zusammen.',
  'ddi.plan.reveal.adult': 'Bestehender Plan, eingespielt – INR im Fenster.',
  'ddi.card.phenprocoumon': 'Phenprocoumon', 'ddi.role.phenprocoumon': 'Blutverdünner',
  'ddi.card.metoprolol': 'Metoprolol', 'ddi.role.metoprolol': 'Herzfrequenz',
  'ddi.card.ramipril': 'Ramipril', 'ddi.role.ramipril': 'Blutdruck',
  'ddi.card.metformin': 'Metformin', 'ddi.role.metformin': 'Zucker',
  'ddi.card.pantoprazol': 'Pantoprazol', 'ddi.role.pantoprazol': 'Magenschutz',
  'ddi.card.clarithromycin': 'Clarithromycin', 'ddi.role.clarithromycin': 'Antibiotikum',
  'ddi.newrx.story': 'Der zweite Arzt sieht nur die Erkältung – nicht den ganzen Plan. Er legt eine neue Tablette dazu: ein Antibiotikum namens Clarithromycin.',
  'ddi.newrx.story.adult': 'Der zweite Arzt verordnet Clarithromycin (Makrolid-Antibiotikum) – ohne den bestehenden Gerinnungshemmer im Blick. Die Karte landet neu im Plan.',
  'ddi.newrx.reveal': 'Sechs Tabletten jetzt. Eine davon zofft sich mit einer alten – welche zwei?',
  'ddi.newrx.reveal.adult': 'Sechs Wirkstoffe. Eine Kombination ist als Wechselwirkung markiert – welches Paar?',
  'ddi.pair.prompt': 'Welche zwei Tabletten zoffen sich? Tippe die eine, dann die andere an.',
  'ddi.pair.prompt.adult': 'Verbinde das neue Medikament mit dem vorhandenen, mit dem es kollidiert: erst die eine Karte antippen, dann die andere.',
  'ddi.pair.correct': 'Treffer! ⚡ Das Antibiotikum und der Blutverdünner streiten sich.',
  'ddi.pair.correct.adult': 'Korrekt – Clarithromycin × Phenprocoumon: die markierte Wechselwirkung.',
  'ddi.pair.notnew': 'Fast – aber such die neue Tablette. Das Problem kam erst mit ihr dazu.',
  'ddi.pair.notnew.adult': 'Die Wechselwirkung muss das neu hinzugekommene Medikament betreffen – prüfe Clarithromycin gegen den Bestand.',
  'ddi.pair.ok.pantoprazol': 'Nein – das Antibiotikum und der Magenschutz vertragen sich.',
  'ddi.pair.ok.metoprolol': 'Nein – die beiden machen keinen Ärger.',
  'ddi.pair.ok.ramipril': 'Nein – passt zusammen.',
  'ddi.pair.ok.metformin': 'Nein – die zwei vertragen sich.',
  'ddi.mech': 'Das Antibiotikum bremst die „Aufräum-Maschine" der Leber (CYP3A4) und einen „Türsteher" im Darm (P-gp). Dadurch bleibt mehr Blutverdünner im Körper – das Blut wird zu dünn. Eine Wechselwirkung sind immer zwei zusammen!',
  'ddi.mech.adult': 'Clarithromycin hemmt CYP3A4 und P-Glykoprotein und bremst so mehrere Abbauwege des Phenprocoumons → erhöhte Exposition → INR ↑ → Blutungsrisiko. Wechselwirkung = ein Paar, nie eine Pille allein.',
  'ddi.dec.prompt': 'Was tust du jetzt?',
  'ddi.dec.prompt.adult': 'Wie reagierst du auf die Wechselwirkung?',
  'ddi.opt.safe': 'Anderes Antibiotikum / INR engmaschig kontrollieren',
  'ddi.opt.ignore': 'Wechselwirkung ignorieren',
  'ddi.opt.ppi': 'Nur einen Magenschutz dazugeben',
  'ddi.opt.double': 'Antibiotikum verdoppeln',
  'ddi.opt.stop': 'Phenprocoumon aus Panik ganz absetzen',
  'ddi.fb.safe': 'Genau – entweder ein Antibiotikum, das sich verträgt, oder den Arzt das Blut engmaschig prüfen lassen. Sicher!',
  'ddi.fb.safe.adult': 'Richtig – auf ein nicht-interagierendes Antibiotikum ausweichen oder Clarithromycin nur unter engmaschiger INR-Kontrolle/Dosisanpassung. Bevorzugte Lösung.',
  'ddi.fb.ignore': 'Gefährlich! Das Blut wird zu dünn – er kann anfangen zu bluten.',
  'ddi.fb.ignore.adult': 'Gefährlich – ungebremste INR-Erhöhung → Blutungsrisiko.',
  'ddi.fb.ppi': 'Bringt nichts gegen das Problem – der Magenschutz macht das Blut nicht weniger dünn.',
  'ddi.fb.ppi.adult': 'Wirkungslos gegen die Ursache – ein PPI schützt den Magen, senkt aber den INR nicht; das Blutungsrisiko bleibt.',
  'ddi.fb.double': 'Falsch – mehr Hemmstoff verschärft die Wechselwirkung; das Blut wird noch dünner.',
  'ddi.fb.double.adult': 'Falsch – mehr Hemmstoff verschärft die Wechselwirkung; INR steigt weiter.',
  'ddi.fb.stop': 'Vorsicht – ohne Blutverdünner ist sein Herz nicht mehr geschützt; jetzt droht ein Schlaganfall.',
  'ddi.fb.stop.adult': 'Gefährlich – Absetzen nimmt den Schlaganfallschutz; das Thrombose-/Embolierisiko steigt. Die Lösung ist das Antibiotikum, nicht das Absetzen des VKA.',
  'ddi.fin.prompt': 'Letzter Check: Vertragen sich diese Kombinationen mit dem neuen Antibiotikum?',
  'ddi.fin.prompt.adult': 'Plan-Check: Ordne die Kombinationen mit Clarithromycin ein – unbedenklich oder prüfen?',
  'ddi.fin.phenprocoumon': 'Clarithromycin + Phenprocoumon (Blutverdünner)',
  'ddi.fin.simvastatin': 'Clarithromycin + Simvastatin (Cholesterin)',
  'ddi.fin.qt': 'Clarithromycin + ein Herzrhythmus-Mittel',
  'ddi.fin.metformin': 'Clarithromycin + Metformin (Zucker)',
  'ddi.fin.ramipril': 'Clarithromycin + Ramipril (Blutdruck)',
  'ddi.fin.pantoprazol': 'Clarithromycin + Pantoprazol (Magenschutz)',
  'ddi.fin.check': 'prüfen', 'ddi.fin.safe': 'unbedenklich', 'ddi.fin.confirm': 'Bestätigen',
  'ddi.fin.correct': 'Perfekt – du prüfst den ganzen Plan, nicht nur eine Pille!',
  'ddi.fin.wrong': 'Nicht ganz – schau dir die Auflösung an.',
  'ddi.fin.lesson': 'Manche Kombis sind okay, andere muss man genau prüfen. Darum schaut man immer den ganzen Plan an – nicht nur eine Tablette.',
  'ddi.fin.lesson.adult': 'Makrolide interagieren über CYP3A4/P-gp mit mehreren Substraten (VKA, Statine) und können QT additiv verlängern; die anderen Begleiter sind hier unkritisch. Deshalb: immer den Gesamtplan abgleichen.',
  'ddi.out.win.title': 'Sicher kombiniert! 🎉',
  'ddi.out.win.sub': 'Du hast gemerkt, welche zwei sich zoffen – Herr Schmidt bleibt geschützt.',
  'ddi.out.win.sub.adult': 'INR im Zielbereich, Schlaganfallschutz erhalten.',
  'ddi.out.over.title': 'Blutung! ⚠️',
  'ddi.out.over.sub': 'Das Blut ist zu dünn geworden – das ist gefährlich.',
  'ddi.out.over.sub.adult': 'INR zu hoch → erhöhte Blutungsgefahr (z. B. Hämatome, GI-Blutung).',
  'ddi.out.under.title': 'Ungeschützt …',
  'ddi.out.under.sub': 'Ohne den Blutverdünner ist sein Herz ungeschützt – das kann zum Schlaganfall führen.',
  'ddi.out.under.sub.adult': 'VKA abgesetzt → kein Schlaganfallschutz → Thrombose-/Embolierisiko. Lösung war das Antibiotikum, nicht das Absetzen.',
  'ddi.out.dyk1': 'Eine Wechselwirkung sind immer zwei Mittel zusammen – hier das Antibiotikum + der Blutverdünner.',
  'ddi.out.dyk1.adult': 'Clarithromycin hemmt CYP3A4 & P-gp und bremst den Abbau des Phenprocoumons → INR ↑ → Blutungsrisiko (fachinfo-markiert).',
  'ddi.out.dyk2': 'Darum prüft man immer den ganzen Plan – nicht nur die neue Tablette für sich.',
  'ddi.out.dyk2.adult': 'Deshalb der Apotheken-Cross-Check: jedes neue Medikament gegen den gesamten Bestand prüfen.',

  // admin
  'admin.title': 'Admin / Kalibrierung',
  'admin.pumpIn': '▲ Pumpe REIN',
  'admin.pumpOut': '▼ Pumpe RAUS',
  'admin.stop': '■ Stopp',
  'admin.reset': 'Auf Basislinie',
  'admin.close': 'Schließen',
}

// Start-screen translations (test of the t() mechanism). Everything else still
// falls back to German until the rest of each dictionary is written.
const en: Record<string, string> = {
  'app.subtitle': 'Get your patient through safely!',
  'start.lang': 'Language',
  'start.age': "Who's playing?",
  'age.young': 'Kids & teens',
  'age.adult': 'Adults',
  'start.go': "Let's go",
  'start.credit': 'SafePolyMed · EU research project · Clinical Pharmacy, Saarland University',
  // story select
  'stories.title': 'Choose a story',
  'common.back': 'Back',
  'story.grapefruit.title': 'The Breakfast Trap',
  'story.grapefruit.desc': 'Lower cholesterol — but watch out at breakfast. (Food)',
  'story.johanniskraut.title': 'The Herbal Problem',
  'story.johanniskraut.desc': 'A herbal remedy gets involved. (Herb/drug)',
  'story.gene.title': 'Everyone is different',
  'story.gene.desc': 'Same dose, different genes. (Gene interaction)',
  'story.ddi.title': 'When pills clash',
  'story.ddi.desc': 'Two medicines, one problem. (Interaction)',
  'story.organ.title': 'Weak organs',
  'story.organ.desc': 'Kidney and liver work more slowly.',
  'story.adherence.title': 'Double by accident',
  'story.adherence.desc': 'One pill too many … or too few?',
}

const fr: Record<string, string> = {
  'app.subtitle': 'Amène ton patient à bon port, en toute sécurité !',
  'start.lang': 'Langue',
  'start.age': 'Qui joue ?',
  'age.young': 'Enfants & ados',
  'age.adult': 'Adultes',
  'start.go': "C'est parti !",
  'start.credit':
    "SafePolyMed · Projet de recherche de l'UE · Pharmacie clinique, Université de la Sarre",
  // story select
  'stories.title': 'Choisis une histoire',
  'common.back': 'Retour',
  'story.grapefruit.title': 'Le piège du petit-déjeuner',
  'story.grapefruit.desc': 'Faire baisser le cholestérol – mais attention au petit-déjeuner. (Alimentation)',
  'story.johanniskraut.title': 'Le problème des plantes',
  'story.johanniskraut.desc': "Un remède à base de plantes s'en mêle. (Plante/médicament)",
  'story.gene.title': 'Chacun est différent',
  'story.gene.desc': 'Même dose, gènes différents. (Interaction génétique)',
  'story.ddi.title': 'Quand les pilules se disputent',
  'story.ddi.desc': 'Deux médicaments, un problème. (Interaction)',
  'story.organ.title': 'Organes affaiblis',
  'story.organ.desc': 'Les reins et le foie travaillent plus lentement.',
  'story.adherence.title': 'Le double par erreur',
  'story.adherence.desc': 'Un comprimé de trop … ou pas assez ?',
}

const nl: Record<string, string> = {
  'app.subtitle': 'Loods je patiënt veilig erdoorheen!',
  'start.lang': 'Taal',
  'start.age': 'Wie speelt er?',
  'age.young': 'Kinderen & jongeren',
  'age.adult': 'Volwassenen',
  'start.go': 'Aan de slag',
  'start.credit':
    'SafePolyMed · EU-onderzoeksproject · Klinische Farmacie, Universiteit van Saarland',
  // story select
  'stories.title': 'Kies een verhaal',
  'common.back': 'Terug',
  'story.grapefruit.title': 'De ontbijtval',
  'story.grapefruit.desc': 'Cholesterol verlagen – maar pas op bij het ontbijt. (Voeding)',
  'story.johanniskraut.title': 'Het kruidenprobleem',
  'story.johanniskraut.desc': 'Een kruidenmiddel mengt zich erin. (Plant/geneesmiddel)',
  'story.gene.title': 'Iedereen is anders',
  'story.gene.desc': 'Zelfde dosis, andere genen. (Gen-interactie)',
  'story.ddi.title': 'Als pillen ruziën',
  'story.ddi.desc': 'Twee medicijnen, één probleem. (Interactie)',
  'story.organ.title': 'Zwakke organen',
  'story.organ.desc': 'Nieren en lever werken trager.',
  'story.adherence.title': 'Per ongeluk dubbel',
  'story.adherence.desc': 'Eén tablet te veel … of te weinig?',
}

const ar: Record<string, string> = {
  'app.subtitle': 'اجتَز بمريضك بأمان!',
  'start.lang': 'اللغة',
  'start.age': 'مَن يلعب؟',
  'age.young': 'الأطفال والمراهقون',
  'age.adult': 'البالغون',
  'start.go': 'هيا نبدأ',
  'start.credit': 'SafePolyMed · مشروع بحثي من الاتحاد الأوروبي · الصيدلة السريرية، جامعة زارلاند',
  // story select
  'stories.title': 'اختر قصة',
  'common.back': 'رجوع',
  'story.grapefruit.title': 'فخ الفطور',
  'story.grapefruit.desc': 'خفض الكوليسترول – لكن انتبه عند الفطور. (غذاء)',
  'story.johanniskraut.title': 'مشكلة الأعشاب',
  'story.johanniskraut.desc': 'مكمّل عشبي يتدخل. (نبات/دواء)',
  'story.gene.title': 'كل شخص مختلف',
  'story.gene.desc': 'نفس الجرعة، جينات مختلفة. (تفاعل جيني)',
  'story.ddi.title': 'عندما تتعارض الأدوية',
  'story.ddi.desc': 'دواءان، مشكلة واحدة. (تفاعل دوائي)',
  'story.organ.title': 'أعضاء ضعيفة',
  'story.organ.desc': 'الكلى والكبد يعملان ببطء أكبر.',
  'story.adherence.title': 'جرعة مضاعفة عن طريق الخطأ',
  'story.adherence.desc': 'حبة زائدة … أم ناقصة؟',
}

const dicts: Record<Locale, Record<string, string>> = { de, en, fr, nl, ar }

export function t(key: string, params?: Params): string {
  const dict = dicts[i18n.locale]
  const aged = `${key}.${i18n.age}`
  // age-specific → age-specific(de) → plain → plain(de) → key
  let s = dict[aged] ?? de[aged] ?? dict[key] ?? de[key] ?? key
  if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v))
  return s
}
