// Story „Die Blut-Balance" (DDI · Phenprocoumon) — pure data + scoring. Torso-first v2.
// Signature mechanic: THE ENZYME IS A THROTTLE. The torso level = how much blood thinner
// is working; a little body „Helfer" (the metabolising enzyme) clears it at a steady rate,
// so the level holds in the green. A drug can do one of two things to that helper:
//   • BREMSE (inhibitor) — jams the helper → thinner piles up → level RISES → bleeding.
//   • TURBO  (inducer)   — revs the helper → thinner cleared too fast → level FALLS → clot.
// Two-act story, both directions real:
//   Act 1 — Clarithromycin (new antibiotic) is a BREMSE → level climbs → manage it.
//   Act 2 — Carbamazepin (for trigeminal neuralgia) is a TURBO → level drops → manage it.
// Capstone — a general „Bremse oder Turbo?" sort that cross-links Grapefruit (story 1,
// inhibitor) and Johanniskraut (story 2, inducer). No on-screen vessel — the real pump is
// the readout; the Werkstatt SVG only shows the enzyme mechanism. No Svelte runes → headless-testable.
import { LEVELS, stars, type Outcome } from '../flow'

// ── torso levels (all engine-legal: demos clear the band but stay inside 35..80) ─
export const DDI_BASELINE = LEVELS.start // 20 — reset/home level the pump is prepared at
export const DDI_START = LEVELS.dose // 62 — stable in the green band („gut eingestellt")
export const DDI_LINE_HIGH = 78 // meaning-teach: clearly over the band (>70, <80, no trip)
export const DDI_LINE_LOW = 50 // meaning-teach: clearly under the band (<55, >35, no trip)
export const DDI_SURGE = 78 // Act 1 Bremse: the antibiotic drives the body up to here
export const DDI_DRIFT_LOW = 46 // Act 2 Turbo: carbamazepin drifts the body down to here

// rotating „Wusstest du?" cards during the slow baseline fill (20→62). NO interaction fact
// here — the concept isn't introduced yet; the last card seeds the „Helfer" instead.
export const DDI_FACTS = ['ddi.fact.disease', 'ddi.fact.drug', 'ddi.fact.window', 'ddi.fact.helper']

// ── the enzyme-throttle modes (shared by the Werkstatt component) ────────────────
export type Throttle = 'normal' | 'bremse' | 'turbo'

// ── Act 1 · Enzym-Detektiv — which of his drugs jams the helper? ─────────────────
// The blood thinner is the LEVEL (the substrate), never a tile. The player tests the new
// antibiotic against the existing plan; only the antibiotic is the Bremse (drives the body
// up), the four others hold it dead still. Mirrors story 1's lift-to-test detective.
export interface DdiPill {
  id: string
  nameKey: string
  roleKey: string
  bremse?: boolean // the new antibiotic — the only one that moves the body
}
export const DDI_DETEKTIV_PILLS: DdiPill[] = [
  { id: 'metoprolol', nameKey: 'ddi.card.metoprolol', roleKey: 'ddi.role.metoprolol' },
  { id: 'ramipril', nameKey: 'ddi.card.ramipril', roleKey: 'ddi.role.ramipril' },
  { id: 'metformin', nameKey: 'ddi.card.metformin', roleKey: 'ddi.role.metformin' },
  { id: 'clarithromycin', nameKey: 'ddi.card.clarithromycin', roleKey: 'ddi.role.clarithromycin', bremse: true },
  { id: 'pantoprazol', nameKey: 'ddi.card.pantoprazol', roleKey: 'ddi.role.pantoprazol' },
]

// ── decision options (the choice itself moves the body — read it off the real pump) ─
export interface DdiOption {
  id: string
  labelKey: string
  feedbackKey: string
  result: Outcome // 'win' settles green; 'over'/'under' cross an invisible red tape
  target: number
  adultOnly?: boolean
}

// Act 1 — body sits HIGH (Bremse). Bring it DOWN into green without dropping through the floor.
export const DDI_DECISION1: DdiOption[] = [
  { id: 'safe', labelKey: 'ddi.d1.safe', feedbackKey: 'ddi.d1.fb.safe', result: 'win', target: DDI_START },
  { id: 'keepboth', labelKey: 'ddi.d1.keepboth', feedbackKey: 'ddi.d1.fb.keepboth', result: 'over', target: 90 },
  { id: 'ppi', labelKey: 'ddi.d1.ppi', feedbackKey: 'ddi.d1.fb.ppi', result: 'over', target: 86 },
  { id: 'reduceab', labelKey: 'ddi.d1.reduceab', feedbackKey: 'ddi.d1.fb.reduceab', result: 'over', target: 88, adultOnly: true },
  { id: 'stop', labelKey: 'ddi.d1.stop', feedbackKey: 'ddi.d1.fb.stop', result: 'under', target: 30 },
]

// Act 2 — body sits LOW (Turbo). Bring it UP into green without overshooting the ceiling.
// (No „stop the pain drug" option: removing the inducer would RAISE the level back toward
// green, so it isn't a loss — the honest losses are ignoring it or self-dosing the thinner.)
export const DDI_DECISION2: DdiOption[] = [
  { id: 'safe', labelKey: 'ddi.d2.safe', feedbackKey: 'ddi.d2.fb.safe', result: 'win', target: DDI_START },
  { id: 'ignore', labelKey: 'ddi.d2.ignore', feedbackKey: 'ddi.d2.fb.ignore', result: 'under', target: 30 },
  { id: 'selfdouble', labelKey: 'ddi.d2.selfdouble', feedbackKey: 'ddi.d2.fb.selfdouble', result: 'over', target: 85 },
]

// ── capstone · „Bremse oder Turbo?" sort (the general enzyme lesson) ─────────────
// Framed about the HELPER in general (not „does it move THIS thinner"), so Grapefruit (a real
// CYP3A4 inhibitor → story 1) and Johanniskraut (an inducer → story 2) are honest cross-links.
export type SortCat = 'bremse' | 'turbo' | 'neutral'
export interface DdiSortItem { id: string; labelKey: string; cat: SortCat }
export const DDI_SORT: DdiSortItem[] = [
  { id: 'clarithromycin', labelKey: 'ddi.sort.clarithromycin', cat: 'bremse' },
  { id: 'grapefruit', labelKey: 'ddi.sort.grapefruit', cat: 'bremse' },
  { id: 'carbamazepin', labelKey: 'ddi.sort.carbamazepin', cat: 'turbo' },
  { id: 'johanniskraut', labelKey: 'ddi.sort.johanniskraut', cat: 'turbo' },
  { id: 'herzmittel', labelKey: 'ddi.sort.herzmittel', cat: 'neutral' },
  { id: 'wasser', labelKey: 'ddi.sort.wasser', cat: 'neutral' },
]
/** Grade the sort: all-correct = 1.0, off by one = 0.5, else 0 (feeds the `pro` star half). */
export function ddiSortGrade(assign: Record<string, SortCat | undefined>): number {
  const right = DDI_SORT.filter((i) => assign[i.id] === i.cat).length
  if (right === DDI_SORT.length) return 1
  if (right >= DDI_SORT.length - 1) return 0.5
  return 0
}

// ── scoring (mirrors story 1's stars(win, clever, pro) contract) ─────────────────
/** clever half: the Enzym-Detektiv read — 0 wrong guesses = 1.0, one = 0.5, two+ = 0. */
export function ddiClever(wrongGuesses: number): number {
  return wrongGuesses === 0 ? 1 : wrongGuesses === 1 ? 0.5 : 0
}
/** Full star score (1.0–3.0 in halves). win requires BOTH decisions safe; any trip = 0. */
export function ddiStars(win: boolean, wrongGuesses: number, sortGrade: number): number {
  return stars(win, ddiClever(wrongGuesses), sortGrade)
}
