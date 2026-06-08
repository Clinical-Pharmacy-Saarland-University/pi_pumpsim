// Story „Der Funken-Plan" (DDI) — pure data + scoring. No Svelte runes → testable
// headlessly with tsx. See docs/stories/ddi.md. Phenprocoumon × Clarithromycin:
// the antibiotic inhibits CYP3A4/P-gp, raising the anticoagulant → INR ↑ → bleeding.
import type { Outcome } from '../flow'

export interface DdiCard {
  id: string
  nameKey: string
  roleKey: string
  isNew?: boolean // the freshly-prescribed drug (clarithromycin)
}

export interface DdiOption {
  id: string
  labelKey: string
  feedbackKey: string
  result: Outcome
  target: number // torso target the choice drives to
  adultOnly?: boolean
}

export interface DdiFinaleItem {
  id: string
  labelKey: string
  check: boolean // true = "prüfen/beobachten" (interacts with clarithromycin)
}

export const DDI_CARDS: DdiCard[] = [
  { id: 'phenprocoumon', nameKey: 'ddi.card.phenprocoumon', roleKey: 'ddi.role.phenprocoumon' },
  { id: 'metoprolol', nameKey: 'ddi.card.metoprolol', roleKey: 'ddi.role.metoprolol' },
  { id: 'ramipril', nameKey: 'ddi.card.ramipril', roleKey: 'ddi.role.ramipril' },
  { id: 'metformin', nameKey: 'ddi.card.metformin', roleKey: 'ddi.role.metformin' },
  { id: 'pantoprazol', nameKey: 'ddi.card.pantoprazol', roleKey: 'ddi.role.pantoprazol' },
  { id: 'clarithromycin', nameKey: 'ddi.card.clarithromycin', roleKey: 'ddi.role.clarithromycin', isNew: true },
]

export const DDI_CORRECT: [string, string] = ['clarithromycin', 'phenprocoumon']

export function ddiPairKey(a: string, b: string): string {
  return [a, b].sort().join('|')
}
export function isDdiCorrectPair(a: string, b: string): boolean {
  return ddiPairKey(a, b) === ddiPairKey(DDI_CORRECT[0], DDI_CORRECT[1])
}
/** locale key explaining why a chosen (wrong/right) pair is/ isn't the clash. */
export function ddiPairFeedback(a: string, b: string): string {
  if (isDdiCorrectPair(a, b)) return 'ddi.pair.correct'
  const ids = [a, b]
  if (!ids.includes('clarithromycin')) return 'ddi.pair.notnew'
  const other = ids.find((i) => i !== 'clarithromycin')
  return `ddi.pair.ok.${other}`
}

export const DDI_OPTIONS: DdiOption[] = [
  { id: 'safe', labelKey: 'ddi.opt.safe', feedbackKey: 'ddi.fb.safe', result: 'win', target: 62 },
  { id: 'ignore', labelKey: 'ddi.opt.ignore', feedbackKey: 'ddi.fb.ignore', result: 'over', target: 88 },
  { id: 'ppi', labelKey: 'ddi.opt.ppi', feedbackKey: 'ddi.fb.ppi', result: 'over', target: 84 },
  { id: 'double', labelKey: 'ddi.opt.double', feedbackKey: 'ddi.fb.double', result: 'over', target: 92, adultOnly: true },
  { id: 'stop', labelKey: 'ddi.opt.stop', feedbackKey: 'ddi.fb.stop', result: 'under', target: 28 },
]

export const DDI_FINALE: DdiFinaleItem[] = [
  { id: 'phenprocoumon', labelKey: 'ddi.fin.phenprocoumon', check: true },
  { id: 'simvastatin', labelKey: 'ddi.fin.simvastatin', check: true },
  { id: 'qt', labelKey: 'ddi.fin.qt', check: true },
  { id: 'metformin', labelKey: 'ddi.fin.metformin', check: false },
  { id: 'ramipril', labelKey: 'ddi.fin.ramipril', check: false },
  { id: 'pantoprazol', labelKey: 'ddi.fin.pantoprazol', check: false },
]
/** assignment[id] = player's "prüfen?" choice (true = prüfen). All must match. */
export function ddiFinaleCorrect(assignment: Record<string, boolean>): boolean {
  return DDI_FINALE.every((it) => assignment[it.id] === it.check)
}

export const DDI_START = 62 // already „gut eingestellt" in band (no dose tutorial)
