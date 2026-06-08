// Story „Das Teeküchen-Regal" (Induktion · Johanniskraut × Ciclosporin) — pure data.
// St. John's Wort (hyperforin) induces CYP3A4 + P-gp → ciclosporin level DROPS →
// the transplant loses its protection (documented acute rejection, Ruschitzka 2000
// for heart tx; renal cases documented separately). An inducer makes a drug work
// TOO LITTLE — the only direction is DOWN (no overdose). Real fix: stop the herb.
// The real-time win/lose lives in JkPlay (race the draining level); this is config.

export const JK_START = 62 // protected, in band
export const JK_FLOOR = 38 // reaching this during the leak = rejection (above crit_low 35)
export const JK_DRAIN_TARGET = 33 // where the unchecked drain heads (slow)

export interface JkAction {
  id: string
  labelKey: string
  feedbackKey: string
  kind: 'fix' | 'help' | 'koeder'
}
// art-directed order so the dominant fix isn't trivially first
export const JK_ACTIONS: JkAction[] = [
  { id: 'tee', labelKey: 'jk.act.tee', feedbackKey: 'jk.fb.tee', kind: 'koeder' },
  { id: 'ambulanz', labelKey: 'jk.act.ambulanz', feedbackKey: 'jk.fb.ambulanz', kind: 'help' },
  { id: 'absetzen', labelKey: 'jk.act.absetzen', feedbackKey: 'jk.fb.absetzen', kind: 'fix' },
  { id: 'verdoppeln', labelKey: 'jk.act.verdoppeln', feedbackKey: 'jk.fb.verdoppeln', kind: 'koeder' },
  { id: 'spiegel', labelKey: 'jk.act.spiegel', feedbackKey: 'jk.fb.spiegel', kind: 'help' },
]
export const JK_HELP_IDS = JK_ACTIONS.filter((a) => a.kind === 'help').map((a) => a.id)
