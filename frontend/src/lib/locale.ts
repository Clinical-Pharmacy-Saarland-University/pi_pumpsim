// German-first locale. All user-facing text goes through t(); add en.ts later.
type Params = Record<string, string | number>

const de: Record<string, string> = {
  'app.title': 'Dr. Dosis',
  'attract.tagline': 'Bleib im grünen Bereich!',
  'attract.family': 'Hilf der Familie, gesund zu bleiben!',
  'attract.start': 'Tippen zum Starten',

  'intro.patientOf': 'Patient {n}/{total}',
  'intro.go': 'Los!',
  'intro.give': 'Gib {name} etwas {drug}!',
  'intro.goal': 'Halte den Wirkstoff-Spiegel im grünen Bereich.',

  'play.gaugeTitle': 'Wirkstoff-Spiegel',
  'play.hold': 'HALTEN',
  'play.holdSub': 'zum Dosieren',
  'play.wellbeing': 'Wohlbefinden',
  'play.inGreenFor': '{s} s im grünen Bereich',
  'status.in': 'Im grünen Bereich!',
  'status.low': 'Zu wenig!',
  'status.high': 'Zu viel!',

  'hint.fill': 'Fülle den grünen Bereich',
  'hint.keep': 'Super! Halte ihn dort.',

  'result.starsFor': 'für {name}',
  'result.greenPct': '{p} % im grünen Bereich',
  'result.didYouKnow': 'Wusstest du?',
  'result.next': 'Weiter',

  'summary.title': 'Geschafft!',
  'summary.total': '{n} von {max} Sternen',
  'summary.again': 'Nochmal',

  // patients (by patient_id)
  'p.max.name': 'Max',
  'p.max.line': 'Max, 8 – Fieber',
  'p.eva.name': 'Eva',
  'p.eva.line': 'Eva (Mama), 42 – Cholesterin',
  'p.opa.name': 'Opa Karl',
  'p.opa.line': 'Opa Karl, 70 – Blutdruck',

  // drugs (by drug_id)
  'd.para.short': 'Para',
  'd.para.full': 'Paracetamol',
  'd.sim.short': 'Sim',
  'd.sim.full': 'Simvastatin',
  'd.meto.short': 'Meto',
  'd.meto.full': 'Metoprolol',

  // events (by type)
  'ev.grapefruit': '🍊 {name} trinkt Grapefruitsaft!',
  'ev.grapefruit.sub': 'Der Abbau wird langsamer.',
  'ev.inducer': '💊 {name} bekommt ein zweites Medikament',
  'ev.inducer.sub': 'Der Abbau wird schneller.',

  // „Wusstest du?" facts (by patient_id)
  'fact.max': 'Auch Paracetamol kann in zu hoher Dosis der Leber schaden – bleib im grünen Bereich!',
  'fact.eva': 'Grapefruit bremst das Abbau-Enzym (CYP3A4) – dann steigt der Spiegel von Simvastatin und es kann Muskelschmerzen geben.',
  'fact.opa': 'Opa baut Medikamente über das Enzym CYP2D6 langsam ab – wegen seiner Gene. Gleiche Dosis, stärkere Wirkung.',

  // summary recap (by patient_id)
  'recap.max': 'Max ✓ richtig dosiert',
  'recap.eva': 'Eva ✓ Grapefruit gemeistert',
  'recap.opa': 'Opa Karl ✓ langsamen Stoffwechsel erkannt',

  'admin.title': 'Admin',
}

export function t(key: string, params?: Params): string {
  let s = de[key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v))
  }
  return s
}
