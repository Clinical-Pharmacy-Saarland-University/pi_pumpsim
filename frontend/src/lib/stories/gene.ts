// Story „Drei Zwillinge, eine Pille" (DGI · Codein / CYP2D6) — pure data + scoring.
// Codeine is a prodrug activated by CYP2D6 to morphine: poor metabolizers get no
// effect; ultra-rapid metabolizers make too much morphine (real FDA boxed warning).
// Same drug + same dose, different genes → different outcome.
import type { Outcome } from '../flow'

export type Bin = 'low' | 'mid' | 'high' // zu wenig / genau richtig / zu viel

export interface Twin {
  id: 'slow' | 'normal' | 'ultra'
  badge: string
  nameKey: string
  level: number // where the SAME codeine dose lands for this genotype
  bin: Bin // the correct prediction
}
export const GENE_TWINS: Twin[] = [
  { id: 'slow', badge: '🐢', nameKey: 'gene.twin.slow', level: 37, bin: 'low' },
  { id: 'normal', badge: '✅', nameKey: 'gene.twin.normal', level: 62, bin: 'mid' },
  { id: 'ultra', badge: '🐇', nameKey: 'gene.twin.ultra', level: 85, bin: 'high' },
]
export const GENE_BINS: Bin[] = ['low', 'mid', 'high']
export function genePredictCorrect(assign: Record<string, string>): boolean {
  return GENE_TWINS.every((t) => assign[t.id] === t.bin)
}

export const GENE_ULTRA_LEVEL = 85 // the dangerous twin — the decision is about him

export interface GeneOption {
  id: string
  labelKey: string
  feedbackKey: string
  result: Outcome | 'retry'
  target: number
  adultOnly?: boolean
}
// the safety decision for the ultra-rapid twin (most dangerous, real FDA warning)
export const GENE_OPTIONS: GeneOption[] = [
  { id: 'switch', labelKey: 'gene.opt.switch', feedbackKey: 'gene.fb.switch', result: 'win', target: 62 },
  { id: 'keep', labelKey: 'gene.opt.keep', feedbackKey: 'gene.fb.keep', result: 'over', target: 85 },
  { id: 'tramadol', labelKey: 'gene.opt.tramadol', feedbackKey: 'gene.fb.tramadol', result: 'retry', target: 85 },
  { id: 'increase', labelKey: 'gene.opt.increase', feedbackKey: 'gene.fb.increase', result: 'over', target: 90, adultOnly: true },
]
