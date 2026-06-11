// Story „Der müde Filter" (Organ/DOI · eGFR↓ × Metformin) — pure data + scoring.
// Torso-first v2 (docs/stories/overhaul/build-organ.md). Signature mechanic:
// CALIBRATE-A-LIVE-INFLOW vs an invisible weakened drain — the kidney clears Metformin
// (the drain); a weak kidney clears less → the SAME dose accumulates → the Spiegel rises
// live over the green window; the player taps „reduzieren" mid-rise to settle it back into
// green. No on-screen vessel — the pump is the readout. No Svelte runes → headless-testable.
import { LEVELS, type Outcome } from '../flow'

// --- torso levels (all engine-legal; see build-organ.md §3) ---
export const ORGAN_BASE = 42 // physical baseline the pump snaps to (game.level.baseline ?? 42)
export const ORGAN_DOSE = LEVELS.dose // 62 — standard dose lands mid green band (also the win target)
export const ORGAN_DRIFT = 78 // cold-start creep + untouched live cap: clearly over the window, < 80 (no trip)
export const ORGAN_CONFIRM = 79.3 // beat-3 upward stau-confirmation: staut höher, clings at the edge, < 80
export const ORGAN_LIVE_START = 76 // beat-5 live rise start: already out of green (> 70), still < 80
export const ORGAN_OVER = 86 // over-loss: visible overflow over the window (> 80 → outcome 'over')
export const ORGAN_UNDER = 46 // under-loss: under green (< 55, ≥5 below) but on/over baseline (> 42, > critLow 35)
export const ORGAN_TRAP_WARN = 72 // beat-6 finale trap warning: just over green, < 80, then taken back

// --- dose-fill facts (rotated while 42→62→78 pumps; kid/adult via t()) ---
export const ORGAN_FACTS = ['organ.fact.disease', 'organ.fact.drug', 'organ.fact.kidney', 'organ.fact.window']

// --- beat 3: hypotheses tested ON the body (3 baits + the cause) ---
export interface OrganDetectItem {
  id: string
  labelKey: string
  correct: boolean // true only for the müder-Abfluss cause
  feedbackKey: string
}
export const ORGAN_DETECT: OrganDetectItem[] = [
  { id: 'strong', labelKey: 'organ.det.strong', correct: false, feedbackKey: 'organ.dfb.strong' },
  { id: 'food', labelKey: 'organ.det.food', correct: false, feedbackKey: 'organ.dfb.food' },
  { id: 'drink', labelKey: 'organ.det.drink', correct: false, feedbackKey: 'organ.dfb.drink' },
  { id: 'kidney', labelKey: 'organ.det.kidney', correct: true, feedbackKey: 'organ.dfb.kidney' },
]

// --- beat 5: the live-cut taps (the dose calibration) ---
export interface OrganTap {
  id: 'reduce' | 'pause' | 'full'
  labelKey: string
  feedbackKey: string
  result: Outcome // 'win' | 'under' | 'over'
  target: number
  adultOnly?: boolean // 'pause' (komplett absetzen) hidden for young
}
export const ORGAN_TAPS: OrganTap[] = [
  { id: 'reduce', labelKey: 'organ.tap.reduce', feedbackKey: 'organ.tfb.reduce', result: 'win', target: ORGAN_DOSE }, // 62
  { id: 'pause', labelKey: 'organ.tap.pause', feedbackKey: 'organ.tfb.pause', result: 'under', target: ORGAN_UNDER, adultOnly: true }, // 46
  { id: 'full', labelKey: 'organ.tap.full', feedbackKey: 'organ.tfb.full', result: 'over', target: ORGAN_OVER }, // 86
]
// harmless bait — never moves the pump, never an extreme, always retry.
// BUT: a bait tap before the catch forfeits the `pro` timely half (sets `baited`); see §10.
export const ORGAN_BAIT_FEEDBACK = 'organ.tfb.bait'

// --- beat 6: filter plan cards (2 safe + 1 trap) ---
export interface OrganPlanCard {
  id: string
  labelKey: string
  trap?: boolean // 'wieder volle Dosis' — warns then must be taken back
}
export const ORGAN_PLAN: OrganPlanCard[] = [
  { id: 'check', labelKey: 'organ.plan.check' },
  { id: 'ask', labelKey: 'organ.plan.ask' },
  { id: 'relapse', labelKey: 'organ.plan.relapse', trap: true },
]

/** clever = the detective read (beat 3): 1 if found with no wrong tap, 0.5 with one, 0 with ≥2. */
export function organClever(wrongGuesses: number): number {
  return wrongGuesses === 0 ? 1 : wrongGuesses === 1 ? 0.5 : 0
}
/** pro = 0.5·timelyReduce (clean unbaited live-cut) + 0.5·finaleClean (no trap tapped). */
export function organPro(timelyReduce: boolean, finaleClean: boolean): number {
  return (timelyReduce ? 0.5 : 0) + (finaleClean ? 0.5 : 0)
}
