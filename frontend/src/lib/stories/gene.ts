// Story „Drei Körper, eine Pille" (DGI · Codein/CYP2D6) — pure data + scoring.
// Torso-first v2 (docs/stories/overhaul/build-gene.md). Signature mechanic:
// PREDICT-THEN-POUR — bet first ('zu wenig/genau richtig/zu viel'), then pour the
// IDENTICAL Codein pill into ONE tank, ×3, with a body-swap reset between. The input
// is constant; the hidden variable is the body (the CYP2D6 gene). No on-screen vessel.
import { LEVELS, type Outcome } from '../flow'

// --- torso levels (all from LEVELS; only the green window 55–70 is taped) --------
export const GENE_BASELINE = 40 // body-swap rest level (between bodies, below the window)
export const GENE_A_LOW = 46 // PM pour / treatA start: just UNDER the window ('zu wenig')
export const GENE_B_DOSE = LEVELS.dose // NM pour: rests in the middle of the window (62)
export const GENE_C_HIGH = 78 // UM live rise in treatC: clearly OVER the window, readable (<80)
export const GENE_C_SURGE = 90 // UM pour in the predict-then-pour twist: honestly OVER critHigh
// 'mehr Codein' at PM == current resting level → driveTo's |target-cur|<1 early-branch
// fires (delta 0) → pump is COMMANDED but DEAD STILL. Must equal GENE_A_LOW (46), NOT 47.
export const GENE_A_STILL = GENE_A_LOW // 46 — dead-still trap (delta 0 from the 46 rest)
export const GENE_FINALE_OK = LEVELS.dose // clean card settles in green (62)
export const GENE_FINALE_WARN = 74 // wrong card on C nudges out the top of the window, then corrected

// --- the three bodies (genotype hidden until the scanner) ------------------------
export type GeneBin = 'low' | 'mid' | 'high' // the wager: zu wenig / genau richtig / zu viel
export interface GeneBody {
  id: 'A' | 'B' | 'C'
  nameKey: string
  badgeKey: string
  pour: number // where the IDENTICAL pill drives the water in the predict-then-pour
  pourReadKey: string
  truth: GeneBin
  pkPath: string // PK curve path (see GENE_PK_CURVES)
}
export const GENE_BINS: GeneBin[] = ['low', 'mid', 'high']
export const GENE_BODIES: GeneBody[] = [
  { id: 'A', nameKey: 'gene.body.A', badgeKey: 'gene.badge.slow', pour: GENE_A_LOW, pourReadKey: 'gene.pour.readA', truth: 'low', pkPath: 'M8,150 C70,150 110,120 170,118 C230,116 300,150 352,156' },
  { id: 'B', nameKey: 'gene.body.B', badgeKey: 'gene.badge.normal', pour: GENE_B_DOSE, pourReadKey: 'gene.pour.readB', truth: 'mid', pkPath: 'M8,150 C70,150 100,70 170,66 C240,62 300,140 352,150' },
  { id: 'C', nameKey: 'gene.body.C', badgeKey: 'gene.badge.ultra', pour: GENE_C_SURGE, pourReadKey: 'gene.pour.readC', truth: 'high', pkPath: 'M8,150 C60,150 95,18 150,14 C210,12 270,120 352,140' },
]

// --- PK curves for the scanner visual (same dose → three curves). y: 0=top high,
//     180=bottom; the green band maps to ~y66..86. Pure path strings, drawn light. ---
export const GENE_PK_CURVES = GENE_BODIES.map((b) => ({ id: b.id, d: b.pkPath, badgeKey: b.badgeKey }))

// --- Treat A (Poor Metabolizer): read 'zu tief' → switch (not more codeine) ------
export interface GeneOption {
  id: string
  labelKey: string
  feedbackKey: string
  result: Outcome | 'retry'
  target?: number // undefined = deliberate STILL (no pump move)
  adultOnly?: boolean
}
export const GENE_TREAT_A: GeneOption[] = [
  { id: 'switch', labelKey: 'gene.treatA.opt.switch', feedbackKey: 'gene.treatA.fb.switch', result: 'win', target: 62 },
  { id: 'more', labelKey: 'gene.treatA.opt.more', feedbackKey: 'gene.treatA.fb.more', result: 'under', target: GENE_A_STILL },
  { id: 'wait', labelKey: 'gene.treatA.opt.wait', feedbackKey: 'gene.treatA.fb.wait', result: 'under' },
  { id: 'samepill', labelKey: 'gene.treatA.opt.samepill', feedbackKey: 'gene.treatA.fb.samepill', result: 'under' },
  { id: 'tramadol', labelKey: 'gene.treatA.opt.tramadol', feedbackKey: 'gene.treatA.fb.tramadol', result: 'retry', adultOnly: true },
]

// --- Treat C (Ultra-rapid): read 'zu viel' (live) → switch off codeine ----------
export const GENE_TREAT_C: GeneOption[] = [
  { id: 'switch', labelKey: 'gene.treatC.opt.switch', feedbackKey: 'gene.treatC.fb.switch', result: 'win', target: 62 },
  { id: 'more', labelKey: 'gene.treatC.opt.more', feedbackKey: 'gene.treatC.fb.more', result: 'over', target: 92 },
  { id: 'keep', labelKey: 'gene.treatC.opt.keep', feedbackKey: 'gene.treatC.fb.keep', result: 'over', target: 82 },
  { id: 'tramadol', labelKey: 'gene.treatC.opt.tramadol', feedbackKey: 'gene.treatC.fb.tramadol', result: 'retry', adultOnly: true },
]

// --- Finale cabinet: pick the analgesic that does NOT need the CYP2D6 machine -----
export interface GeneCard {
  id: string
  labelKey: string
  safe: boolean // non-CYP2D6 → belongs on A and C
  adultOnly?: boolean // Tramadol = the adult profi-trap (looks safe, isn't)
}
export const GENE_CABINET: GeneCard[] = [
  { id: 'ibuprofen', labelKey: 'gene.card.ibuprofen', safe: true },
  { id: 'paracetamol', labelKey: 'gene.card.paracetamol', safe: true },
  { id: 'codein', labelKey: 'gene.card.codein', safe: false },
  { id: 'codein2', labelKey: 'gene.card.codein2', safe: false },
  { id: 'tramadol', labelKey: 'gene.card.tramadol', safe: false, adultOnly: true },
]

// --- scoring helpers (pure) ------------------------------------------------------
/** clever half-star: all three first-try bets correct = 1, exactly one miss = 0.5, two+ = 0. */
export function genePredictGrade(betMisses: number): number {
  return betMisses === 0 ? 1 : betMisses === 1 ? 0.5 : 0
}
/** did a bet match the body's truth? */
export function geneBetCorrect(body: GeneBody, bet: GeneBin): boolean {
  return body.truth === bet
}
/** pro half-star: clean treatA + clean treatC + clean finale = 1; one stumble = 0.5; two+ = 0. */
export function geneProGrade(stumbles: number): number {
  return stumbles === 0 ? 1 : stumbles === 1 ? 0.5 : 0
}
