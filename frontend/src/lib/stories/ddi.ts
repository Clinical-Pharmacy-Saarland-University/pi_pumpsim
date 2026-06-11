// Story „Die Blut-Balance" (DDI · Clarithromycin × Phenprocoumon) — pure data + scoring.
// Torso-first v2 (docs/stories/overhaul/build-ddi.md). Signature mechanic: SCAN-A-PAIRING —
// lock the new antibiotic as ONE fixed probe and scan it against each pill already in the
// plan; four pairings hold der Spiegel DEAD STILL (vertragen sich), the blood-thinner pairing
// makes it SURGE on its own (the antibiotic makes the thinner STRONGER → blood too thin).
// The only story with BOTH an over (bleeding) and an under (clot) loss from DIFFERENT picks.
// No on-screen vessel — the real pump is the readout. No Svelte runes → headless-testable.
import { LEVELS, stars, type Outcome } from '../flow'

// ── torso levels (all from LEVELS; demos clear the window but stay inside 35..80) ─
export const DDI_START = LEVELS.dose // 62 — already „gut eingestellt" in the green window
export const DDI_LINE_HIGH = 78 // meaning-teach: clearly over the window (> 70, < critHigh 80)
export const DDI_LINE_LOW = 50 // meaning-teach: clearly under the window (< 55, > critLow 35)
export const DDI_SURGE = 78 // scanner alarm — clearly over the window, no trip (> 70, < 80)
export const DDI_WARN = 79 // held warning after the Magenschutz demo (> DDI_SURGE, < 80)

// rotating „Wusstest du?" cards shown during the slow baseline fill (20→62)
export const DDI_FACTS = ['ddi.fact.disease', 'ddi.fact.drug', 'ddi.fact.window', 'ddi.fact.timing']

// ── the fixed probe + the existing plan (4 harmless + the gated blood-thinner) ─
export const DDI_PROBE = { id: 'clarithromycin', nameKey: 'ddi.card.clarithromycin', roleKey: 'ddi.role.clarithromycin' }

export interface DdiScanPill {
  id: string
  nameKey: string
  roleKey: string
  danger?: boolean // the blood-thinner — the only pairing that moves the water
}
export const DDI_SCAN_PILLS: DdiScanPill[] = [
  { id: 'metoprolol', nameKey: 'ddi.card.metoprolol', roleKey: 'ddi.role.metoprolol' },
  { id: 'ramipril', nameKey: 'ddi.card.ramipril', roleKey: 'ddi.role.ramipril' },
  { id: 'metformin', nameKey: 'ddi.card.metformin', roleKey: 'ddi.role.metformin' },
  { id: 'pantoprazol', nameKey: 'ddi.card.pantoprazol', roleKey: 'ddi.role.pantoprazol' },
  { id: 'phenprocoumon', nameKey: 'ddi.card.phenprocoumon', roleKey: 'ddi.role.phenprocoumon', danger: true },
]

// ── Stage 5 strategy: the choice itself moves the water (read off the HIGH tank) ─
export interface DdiOption {
  id: string
  labelKey: string
  feedbackKey: string
  result: Outcome // 'win' settles to green; 'over'/'under' cross an invisible red tape
  target: number
  adultOnly?: boolean
}
export const DDI_OPTIONS: DdiOption[] = [
  { id: 'safe', labelKey: 'ddi.opt.safe', feedbackKey: 'ddi.fb.safe', result: 'win', target: 62 },
  { id: 'both', labelKey: 'ddi.opt.both', feedbackKey: 'ddi.fb.both', result: 'over', target: 90 },
  { id: 'ppi', labelKey: 'ddi.opt.ppi', feedbackKey: 'ddi.fb.ppi', result: 'over', target: 86 },
  { id: 'reduce', labelKey: 'ddi.opt.reduce', feedbackKey: 'ddi.fb.reduce', result: 'over', target: 88, adultOnly: true },
  { id: 'stop', labelKey: 'ddi.opt.stop', feedbackKey: 'ddi.fb.stop', result: 'under', target: 30 },
]

// ── Stage 6 finale: build the safe plan (sort; win-path only) ─────────────────
export interface DdiPlanCard { id: string; labelKey: string; safe: boolean }
export const DDI_PLAN_CARDS: DdiPlanCard[] = [
  { id: 'showall', labelKey: 'ddi.plan.showall', safe: true },
  { id: 'pharmacy', labelKey: 'ddi.plan.pharmacy', safe: true },
  { id: 'bloodvalue', labelKey: 'ddi.plan.bloodvalue', safe: true },
  { id: 'otherab', labelKey: 'ddi.plan.otherab', safe: true },
  { id: 'signs', labelKey: 'ddi.plan.signs', safe: true },
  { id: 'hide', labelKey: 'ddi.plan.hide', safe: false },
  { id: 'selfdouble', labelKey: 'ddi.plan.selfdouble', safe: false },
  { id: 'onlystomach', labelKey: 'ddi.plan.onlystomach', safe: false },
  { id: 'saynothing', labelKey: 'ddi.plan.saynothing', safe: false },
]
/** assignment[id] = player's bin (true = „sicherer Plan"). All must match safe. */
export function ddiPlanCorrect(assignment: Record<string, boolean>): boolean {
  return DDI_PLAN_CARDS.every((c) => assignment[c.id] === c.safe)
}

/** Star score (1.0–3.0 in 0.5 steps) via the shared two-bonus `stars()` contract.
 *  clever = the scanner read (no early jab at the locked tile) + the twist read;
 *  pro = 0.5 for reaching the finale + 0.5 for a clean safe-plan sort. Any loss = 0. */
export function ddiStars(
  win: boolean,
  f: { scanClean: boolean; twistRead: boolean; sortClean: boolean },
): number {
  const clever = (f.scanClean ? 0.5 : 0) + (f.twistRead ? 0.5 : 0)
  const pro = 0.5 + (f.sortClean ? 0.5 : 0)
  return stars(win, clever, pro)
}
