// Story „Die Nieren-Skala" (DOI · eGFR × Metformin) — pure data + scoring. Testable
// headlessly. Metformin is cleared unchanged by the kidney; a weak kidney (low eGFR)
// → accumulation → lactic-acidosis risk. The fix is to reduce the dose to the eGFR.
import type { Outcome } from '../flow'

export const ORGAN_START = 40
export const ORGAN_DOSE = 62
export const ORGAN_EVENT_TARGET = 82 // drifts up after the kidney weakens

export interface OrganDetectItem {
  id: string
  labelKey: string
  correct: boolean
  feedbackKey: string
}
export const ORGAN_DETECT: OrganDetectItem[] = [
  { id: 'kidney', labelKey: 'organ.det.kidney', correct: true, feedbackKey: 'organ.dfb.kidney' },
  { id: 'carbs', labelKey: 'organ.det.carbs', correct: false, feedbackKey: 'organ.dfb.carbs' },
  { id: 'strong', labelKey: 'organ.det.strong', correct: false, feedbackKey: 'organ.dfb.strong' },
  { id: 'move', labelKey: 'organ.det.move', correct: false, feedbackKey: 'organ.dfb.move' },
  { id: 'drink', labelKey: 'organ.det.drink', correct: false, feedbackKey: 'organ.dfb.drink' },
  { id: 'fever', labelKey: 'organ.det.fever', correct: false, feedbackKey: 'organ.dfb.fever' },
]

export interface DialNotch {
  id: 'low' | 'reduced' | 'standard'
  labelKey: string
  mgKey: string
  feedbackKey: string
  result: Outcome
  target: number
  adultOnly?: boolean
}
// dial left→right: sehr niedrig · reduziert · Standard
export const ORGAN_NOTCHES: DialNotch[] = [
  { id: 'low', labelKey: 'organ.notch.low', mgKey: 'organ.mg.low', feedbackKey: 'organ.fb.low', result: 'under', target: 41, adultOnly: true },
  { id: 'reduced', labelKey: 'organ.notch.reduced', mgKey: 'organ.mg.reduced', feedbackKey: 'organ.fb.reduced', result: 'win', target: 62 },
  { id: 'standard', labelKey: 'organ.notch.standard', mgKey: 'organ.mg.standard', feedbackKey: 'organ.fb.standard', result: 'over', target: 88 },
]
export const ORGAN_TRAP_FEEDBACK = 'organ.fb.trap' // „mehr trinken" → retry

export const EGFR = 35 // Frau Yilmaz's value (yellow zone 30–44)

// finale: map each eGFR band to the correct measure
export type OrganMeasure = 'standard' | 'reduce' | 'stop'
export interface OrganFinaleRow {
  id: string
  egfrKey: string
  correct: OrganMeasure
}
export const ORGAN_FINALE: OrganFinaleRow[] = [
  { id: 'high', egfrKey: 'organ.fin.high', correct: 'standard' },
  { id: 'mid', egfrKey: 'organ.fin.mid', correct: 'reduce' },
  { id: 'low', egfrKey: 'organ.fin.low', correct: 'stop' },
]
export const ORGAN_MEASURES: OrganMeasure[] = ['standard', 'reduce', 'stop']
export function organFinaleCorrect(assign: Record<string, string>): boolean {
  return ORGAN_FINALE.every((r) => assign[r.id] === r.correct)
}
