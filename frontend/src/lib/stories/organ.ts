// Story „Der müde Filter" (Organ/DOI · renale Clearance × Metformin) — pure data + scoring.
// v3 rework (2026-06-12): THE TWO-EXITS IDEA. Medicine leaves the body two ways — the LEBER
// breaks it down, the NIERE washes it out. Metformin is special: the liver doesn't touch it,
// so it leaves ONLY via the kidney (unchanged). A tired kidney → the SAME dose now piles up.
// The player discovers the exit (kidney animation), adjusts the dose to the tired kidney, then
// sorts which drugs lean on the kidney. No on-screen level mirror — the physical pump is the
// readout; the kidney animation teaches the mechanism. No Svelte runes → headless-testable.
import { LEVELS, type Outcome } from '../flow'

// --- torso levels (all engine-legal; band [55,70], over ≥80, under <55; demos moderate) ---
export const ORGAN_BASE = 42 // baseline the pump homes to — the empty starting body, no medicine
export const ORGAN_DOSE = LEVELS.dose // 62 — the usual dose lands mid green band (also the win target)
export const ORGAN_DRIFT = 76 // same-dose creep over the green window — moderate, < 80 (no trip)
export const ORGAN_CONFIRM = 78 // the stau backs up a last step once the blocked exit is found, < 80
export const ORGAN_OVER = 86 // over-loss: visible overflow over the window (> 80 → outcome 'over')
export const ORGAN_UNDER = 46 // under-loss: under green (≥5 below), on/over baseline, above critLow 35

// --- dose-fill „Wusstest du?" facts (rotated while 42→62→76 pumps; kid/adult via t()) ---
export const ORGAN_FACTS = ['organ.fact.disease', 'organ.fact.drug', 'organ.fact.exits', 'organ.fact.window']

// --- beat 3: the two exits — where does Metformin leave? (liver = plausible-wrong, kidney = the cause) ---
// Most drugs DO leave via the liver, so „Leber" is the tempting common answer — but Metformin is
// the exception (renally cleared, unchanged). Picking the liver first is the honest misread.
export interface OrganExit {
  id: 'liver' | 'kidney'
  labelKey: string
  correct: boolean // kidney only — Metformin is renally eliminated, not metabolized
  feedbackKey: string
}
export const ORGAN_EXITS: OrganExit[] = [
  { id: 'liver', labelKey: 'organ.exit.liver', correct: false, feedbackKey: 'organ.exfb.liver' },
  { id: 'kidney', labelKey: 'organ.exit.kidney', correct: true, feedbackKey: 'organ.exfb.kidney' },
]

// --- beat 4: the dose decision (no „Hahn" — it is the DOSE: how much medicine you give) ---
export interface OrganTap {
  id: 'reduce' | 'pause' | 'full'
  labelKey: string
  feedbackKey: string
  result: Outcome // 'win' | 'under' | 'over'
  target: number // the real driveTo target
  adultOnly?: boolean // „ganz absetzen" hidden for young (the absetzen nuance is an adult call)
}
export const ORGAN_TAPS: OrganTap[] = [
  { id: 'reduce', labelKey: 'organ.tap.reduce', feedbackKey: 'organ.tfb.reduce', result: 'win', target: ORGAN_DOSE }, // 62
  { id: 'pause', labelKey: 'organ.tap.pause', feedbackKey: 'organ.tfb.pause', result: 'under', target: ORGAN_UNDER, adultOnly: true }, // 46
  { id: 'full', labelKey: 'organ.tap.full', feedbackKey: 'organ.tfb.full', result: 'over', target: ORGAN_OVER }, // 86
]
// harmless bait — never moves the pump, always a retry. „Mehr trinken" doesn't help a tired kidney.
export const ORGAN_BAIT_FEEDBACK = 'organ.tfb.bait'

// --- beat 5: the drug sort — which medicines lean on the kidney? (teaches „depends on the drug") ---
// renal:true  = the kidney is a primary exit → the dose depends on renal function (drives the sort)
// renal:false = leaves mainly via the liver (a tired kidney barely matters)
// `tagKey` is the PRECISE elimination phrase shown in the reveal — Metformin is the exception that
// leaves ONLY via the kidney (unchanged), whereas Penicillin is PRIMARILY (not only) renal. Keeping
// that distinction honest matters: „über die Nieren" alone overstates the others.
export interface OrganDrug {
  id: string
  labelKey: string
  renal: boolean
  tagKey: string
}
export const ORGAN_DRUGS: OrganDrug[] = [
  { id: 'metformin', labelKey: 'organ.drug.metformin', renal: true, tagKey: 'organ.tag.metformin' }, // hero — unchanged renal, not metabolized
  { id: 'penicillin', labelKey: 'organ.drug.penicillin', renal: true, tagKey: 'organ.tag.penicillin' }, // antibiotic — PRIMARILY renal (not only), dose-adjusted
  { id: 'paracetamol', labelKey: 'organ.drug.paracetamol', renal: false, tagKey: 'organ.tag.paracetamol' }, // primarily hepatic metabolism
  { id: 'simvastatin', labelKey: 'organ.drug.simvastatin', renal: false, tagKey: 'organ.tag.simvastatin' }, // primarily hepatic (CYP3A4) — a story-1 callback
]

/** clever = the exits read (beat 3): 1 if the kidney was found with no wrong tap, 0.5 with one, 0 with ≥2. */
export function organClever(wrongGuesses: number): number {
  return wrongGuesses === 0 ? 1 : wrongGuesses === 1 ? 0.5 : 0
}
/** pro = the drug sort (beat 5): 1 if every drug is sorted correctly, 0.5 with one mistake, 0 with ≥2. */
export function organSortGrade(selected: Set<string>): number {
  const wrong = ORGAN_DRUGS.filter((d) => d.renal !== selected.has(d.id)).length
  return wrong === 0 ? 1 : wrong === 1 ? 0.5 : 0
}
