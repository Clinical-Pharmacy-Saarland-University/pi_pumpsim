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

export const i18n = $state({ locale: 'de' as Locale })

export function setLocale(l: Locale): void {
  i18n.locale = l
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
  'story.grapefruit.title': 'Die Grapefruit-Falle',
  'story.grapefruit.desc': 'Cholesterin senken – aber Vorsicht beim Frühstück. (Nahrung)',
  'story.johanniskraut.title': 'Das Kräuter-Problem',
  'story.johanniskraut.desc': 'Ein pflanzliches Mittel mischt sich ein. (Pflanze/Arznei)',
  'story.gene.title': 'Jeder ist anders',
  'story.gene.desc': 'Gleiche Dosis, andere Gene. (Gen-Wechselwirkung)',
  'story.ddi.title': 'Wenn sich Pillen streiten',
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
  'd.simvastatin': 'Simvastatin',
  'briefing.goal': 'Stell {name} mit {drug} sicher ein – bring den Spiegel in den grünen Bereich.',

  // dose
  'dose.prompt': 'Welche Dosis gibst du?',
  'dose.low': 'niedrig',
  'dose.standard': 'standard',
  'dose.high': 'hoch',
  'dose.arcadeHint': 'oder: HALTEN zum Dosieren – im grünen Bereich loslassen',
  'dose.hold': 'HALTEN',
  'dose.settled.in': 'Im grünen Bereich – gut eingestellt!',
  'dose.settled.under': 'Noch zu wenig …',
  'dose.settled.over': 'Zu viel!',
  'timejump': 'Eine Woche später …',

  // knowledge
  'opt.up': 'steigt ⬆',
  'opt.down': 'sinkt ⬇',
  'opt.none': 'bleibt gleich',
  'q.correct': 'Richtig!',
  'q.wrong': 'Nicht ganz …',

  // decision
  'dec.prompt': 'Wie reagierst du?',
  'dec.reduce': 'Dosis reduzieren',
  'dec.stopGrapefruit': 'Grapefruit weglassen',
  'dec.nothing': 'Nichts ändern',
  'dec.increase': 'Dosis erhöhen',

  // events
  'ev.grapefruit.story':
    'Herr Schmidt strahlt: „Ich trinke jetzt jeden Morgen ein großes Glas Grapefruitsaft – gesund, oder?“ 🍊',
  'ev.grapefruit.q': 'Was passiert mit dem Simvastatin-Spiegel?',
  'ev.grapefruit.lesson':
    'Grapefruit hemmt das Abbau-Enzym CYP3A4 – Simvastatin wird langsamer abgebaut und sammelt sich an. Der Spiegel steigt.',
  'ev.apfel.story': 'Herr Schmidt isst zum Frühstück einen Apfel. 🍎',
  'ev.apfel.q': 'Was passiert mit dem Simvastatin-Spiegel?',
  'ev.apfel.lesson':
    'Ein Apfel ist harmlos – keine Wechselwirkung. Nicht jede Kleinigkeit verändert die Dosis!',

  // outcome
  'out.win.title': 'Sicher eingestellt! 🎉',
  'out.win.sub': '{name} ist im grünen Bereich.',
  'out.over.title': 'Überdosis! ⚠️',
  'out.over.sub': 'Zu viel Simvastatin → Muskelschäden (Rhabdomyolyse).',
  'out.under.title': 'Wirkt nicht …',
  'out.under.sub': 'Zu wenig Wirkstoff → das Cholesterin bleibt zu hoch.',
  'out.stars': '{n} von 3 Sternen',
  'out.dyk': 'Wusstest du?',
  'out.dyk.text':
    'Grapefruitsaft kann den Abbau vieler Medikamente bremsen – eine echte Nahrungs-Wechselwirkung.',

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
}

const ar: Record<string, string> = {
  'app.subtitle': 'اجتَز بمريضك بأمان!',
  'start.lang': 'اللغة',
  'start.age': 'مَن يلعب؟',
  'age.young': 'الأطفال والمراهقون',
  'age.adult': 'البالغون',
  'start.go': 'هيا نبدأ',
  'start.credit': 'SafePolyMed · مشروع بحثي من الاتحاد الأوروبي · الصيدلة السريرية، جامعة زارلاند',
}

const dicts: Record<Locale, Record<string, string>> = { de, en, fr, nl, ar }

export function t(key: string, params?: Params): string {
  let s = dicts[i18n.locale][key] ?? de[key] ?? key
  if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v))
  return s
}
