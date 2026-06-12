// Story „Drei Körper, eine Pille" (DGI · Codein/CYP2D6) — pure data + scoring (no Svelte runes).
//
// Overhaul v2.1 (2026-06-12): OBSERVE → PUZZLE → REVEAL (replaces the old predict-then-pour).
// The player gives the IDENTICAL Codein pill to three DISTINCT kids side-by-side, watches each
// Spiegel and keeps a frozen marker per kid, then works out the puzzle ("same pill — different
// bodies"), ASSIGNS the hidden genotype machines (the INVERSION: a high Spiegel means a FAST
// machine, because Codein is a prodrug the machine turns INTO the real painkiller), is rewarded
// with the animated PK curves, and finally learns the fix (switch off Codein — never "more
// Codein"). No auto-pump on mount; moderate demo levels (top 76, no ceiling slam).
//
// The spine: the GENE, not the dose, decides. Fast machine → MORE painkiller → too much.
import { LEVELS, type Outcome } from '../flow'

// --- torso levels (all relative to LEVELS; only the green window 55–70 is taped) -----------
export const GENE_BASELINE = 40 // common rest before/between doses (player-primed, never on mount)
export const GENE_A_LOW = 46 // Mara (PM): barely moves, just UNDER the window ('zu wenig')
export const GENE_B_DOSE = LEVELS.dose // Jonas (NM): rests mid-green (62)
export const GENE_C_HIGH = 76 // Emil (UM): races OVER the window, readable (>70, <80 — no slam)
// 'mehr Codein' at Mara == her resting level → driveTo's |target-cur|<1 early-branch fires
// (delta 0) → the pump is COMMANDED but DEAD STILL. Must equal GENE_A_LOW (46), NOT 47:
// |47-46|=1 is NOT < 1, which would (wrongly) take the moving path and break the trap.
export const GENE_A_STILL = GENE_A_LOW
export const GENE_C_OVER = 84 // 'mehr Codein' at Emil: honestly over critical-high → over loss
export const GENE_C_KEEP = 82 // 'bei Codein bleiben' at Emil: stays toxic over the window → over loss
export const GENE_FINALE_OK = LEVELS.dose // clean card settles in green (62)
export const GENE_FINALE_WARN = 74 // wrong card on Emil nudges out the top of the window, then corrected

// --- the genotype machines (hidden until the player assigns them) ---------------------------
// The INVERSION lives here: a FAST machine makes the MOST painkiller → the HIGHEST Spiegel.
export type GeneBin = 'low' | 'mid' | 'high' // the Spiegel result bin
export type GeneMachineId = 'slow' | 'normal' | 'fast'
export interface GeneMachine {
  id: GeneMachineId
  labelKey: string
  emoji: string
  bin: GeneBin // the Spiegel bin this machine produces (slow→low, normal→mid, fast→high)
}
export const GENE_MACHINES: GeneMachine[] = [
  { id: 'slow', labelKey: 'gene.machine.slow', emoji: '🐢', bin: 'low' },
  { id: 'normal', labelKey: 'gene.machine.normal', emoji: '🚶', bin: 'mid' },
  { id: 'fast', labelKey: 'gene.machine.fast', emoji: '🚀', bin: 'high' },
]

// --- the three kids (same pill, distinct avatars; genotype hidden until the assign step) ----
export interface GeneBody {
  id: 'A' | 'B' | 'C'
  nameKey: string
  emoji: string // distinct avatar (skin tone) — memorable for the recall/assign step
  level: number // where the IDENTICAL pill drives the Spiegel
  truth: GeneBin // the Spiegel result bin (low/mid/high)
  machine: GeneMachineId // the hidden genotype (slow/normal/fast) — must satisfy machine.bin === truth
  readKey: string // verdict copy against the Spiegel after the dose
  badgeKey: string // the genotype badge revealed at the curves beat
  pkPath: string // PK morphine concentration–time curve (see GENE_PK_CURVES)
}
export const GENE_BINS: GeneBin[] = ['low', 'mid', 'high']
// Display order is deliberately NOT low→mid→high (that would give the pattern away). Cards show
// Jonas (normal) · Emil (fast) · Mara (slow). Code/sim reference kids by id, never by index.
export const GENE_BODIES: GeneBody[] = [
  { id: 'B', nameKey: 'gene.body.B', emoji: '👦🏽', level: GENE_B_DOSE, truth: 'mid', machine: 'normal', readKey: 'gene.dose.readB', badgeKey: 'gene.badge.normal', pkPath: 'M8,150 C70,150 100,70 170,66 C240,62 300,140 352,150' },
  { id: 'C', nameKey: 'gene.body.C', emoji: '🧒🏿', level: GENE_C_HIGH, truth: 'high', machine: 'fast', readKey: 'gene.dose.readC', badgeKey: 'gene.badge.ultra', pkPath: 'M8,150 C60,150 95,18 150,14 C210,12 270,120 352,140' },
  { id: 'A', nameKey: 'gene.body.A', emoji: '👧🏻', level: GENE_A_LOW, truth: 'low', machine: 'slow', readKey: 'gene.dose.readA', badgeKey: 'gene.badge.slow', pkPath: 'M8,150 C70,150 110,120 170,118 C230,116 300,150 352,156' },
]

// --- PK curves for the animated reveal (same dose → three curves). y: 0=top high, 180=bottom;
//     the green band maps to ~y56..96. Pure path strings + the machine's pace emoji. ----------
export const GENE_PK_CURVES = GENE_BODIES.map((b) => ({
  id: b.id,
  d: b.pkPath,
  emoji: GENE_MACHINES.find((m) => m.id === b.machine)!.emoji,
  nameKey: b.nameKey,
}))

// --- observe beat: „Huch? Was ist denn hier los?" — sensible distractors, one truth ----------
export interface GeneObserveOption {
  id: string
  labelKey: string
  correct: boolean
}
export const GENE_OBSERVE: GeneObserveOption[] = [
  { id: 'diff', labelKey: 'gene.observe.opt.diff', correct: true },
  { id: 'broken', labelKey: 'gene.observe.opt.broken', correct: false },
  { id: 'size', labelKey: 'gene.observe.opt.size', correct: false },
  { id: 'swallow', labelKey: 'gene.observe.opt.swallow', correct: false },
]

// --- Treat A (Poor Metabolizer): read 'zu tief' → switch (not more codeine) -----------------
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
  { id: 'more', labelKey: 'gene.treatA.opt.more', feedbackKey: 'gene.treatA.fb.more', result: 'under', target: GENE_A_STILL /* 46 = rest → dead still → under */ },
  { id: 'wait', labelKey: 'gene.treatA.opt.wait', feedbackKey: 'gene.treatA.fb.wait', result: 'under' /* no move, hold 46 */ },
  { id: 'samepill', labelKey: 'gene.treatA.opt.samepill', feedbackKey: 'gene.treatA.fb.samepill', result: 'under' /* no move, hold 46 */ },
  { id: 'tramadol', labelKey: 'gene.treatA.opt.tramadol', feedbackKey: 'gene.treatA.fb.tramadol', result: 'retry', adultOnly: true },
]

// --- Treat C (Ultra-rapid): read 'zu viel' (live) → switch off codeine -----------------------
export const GENE_TREAT_C: GeneOption[] = [
  { id: 'switch', labelKey: 'gene.treatC.opt.switch', feedbackKey: 'gene.treatC.fb.switch', result: 'win', target: 62 },
  { id: 'more', labelKey: 'gene.treatC.opt.more', feedbackKey: 'gene.treatC.fb.more', result: 'over', target: GENE_C_OVER },
  { id: 'keep', labelKey: 'gene.treatC.opt.keep', feedbackKey: 'gene.treatC.fb.keep', result: 'over', target: GENE_C_KEEP },
  { id: 'tramadol', labelKey: 'gene.treatC.opt.tramadol', feedbackKey: 'gene.treatC.fb.tramadol', result: 'retry', adultOnly: true },
]

// --- Finale cabinet: pick the analgesic that does NOT need the CYP2D6 machine ----------------
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

// --- scoring + assignment helpers (pure) ----------------------------------------------------
/** did the assigned machine match the kid's Spiegel (the inversion solved)? slow↔low etc. */
export function geneAssignCorrect(body: GeneBody, machineId: GeneMachineId): boolean {
  const m = GENE_MACHINES.find((x) => x.id === machineId)
  return !!m && m.bin === body.truth
}
/** clever half-star (front): observe + assign both first-try = 1; exactly one miss = 0.5; two = 0. */
export function geneCleverGrade(misses: number): number {
  return misses === 0 ? 1 : misses === 1 ? 0.5 : 0
}
/** pro half-star (back): clean treatA + clean treatC + clean finale = 1; one stumble = 0.5; two+ = 0. */
export function geneProGrade(stumbles: number): number {
  return stumbles === 0 ? 1 : stumbles === 1 ? 0.5 : 0
}
