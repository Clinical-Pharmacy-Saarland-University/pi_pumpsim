// German-first locale. All user text via t(); English added later as en.ts.
type Params = Record<string, string | number>

const de: Record<string, string> = {
  'app.title': 'SafePolyMed',
  'app.subtitle': 'Bring deinen Patienten sicher durch!',
  'attract.start': 'Tippen zum Starten',

  'common.next': 'Weiter',
  'common.retry': 'Nochmal',
  'band.explain': 'Grüner Bereich = sicher · zu wenig wirkt nicht · zu viel ist gefährlich',
  'bar.title': 'Wirkstoff-Spiegel',

  // patients + drugs
  'p.schmidt.name': 'Herr Schmidt',
  'p.schmidt.line': 'Herr Schmidt, 68 – zu hohes Cholesterin',
  'd.simvastatin': 'Simvastatin',

  // briefing
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

  // knowledge options
  'opt.up': 'steigt ⬆',
  'opt.down': 'sinkt ⬇',
  'opt.none': 'bleibt gleich',
  'q.correct': 'Richtig!',
  'q.wrong': 'Nicht ganz …',

  // decision (shared)
  'dec.prompt': 'Wie reagierst du?',
  'dec.reduce': 'Dosis reduzieren',
  'dec.stopGrapefruit': 'Grapefruit weglassen',
  'dec.nothing': 'Nichts ändern',
  'dec.increase': 'Dosis erhöhen',

  // event: grapefruit
  'ev.grapefruit.story':
    'Herr Schmidt strahlt: „Ich trinke jetzt jeden Morgen ein großes Glas Grapefruitsaft – gesund, oder?“ 🍊',
  'ev.grapefruit.q': 'Was passiert mit dem Simvastatin-Spiegel?',
  'ev.grapefruit.lesson':
    'Grapefruit hemmt das Abbau-Enzym CYP3A4 – Simvastatin wird langsamer abgebaut und sammelt sich an. Der Spiegel steigt.',

  // event: apfel (distractor)
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

  'admin.title': 'Admin',
}

export function t(key: string, params?: Params): string {
  let s = de[key] ?? key
  if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v))
  return s
}
