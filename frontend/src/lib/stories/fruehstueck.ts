// Story „Die Frühstücks-Falle" (FDI · Grapefruit × Simvastatin) — pure data.
// Torso-first v2 redesign (docs/stories/overhaul/fruehstuecks-falle.md). Signature
// mechanic: LIFT-TO-TEST — the player removes breakfast items one at a time and reads
// the body; only removing the grapefruit makes the water fall back into the green band
// (stillness = innocent). No on-screen vessel — the real pump is the only readout.
import { LEVELS, type Outcome } from '../flow'

export const FR_BASELINE = LEVELS.start // prepare-patient: below the band on entry
export const FR_DOSE = LEVELS.dose // standard dose lands in the green band

// „Wusstest du?" cards rotated while the (slow) dose pumps in — each key resolves a
// young/adult register via t(). Turns the dead fill time into a teaching moment.
export const FR_FACTS = ['fr.fact.disease', 'fr.fact.drug', 'fr.fact.window', 'fr.fact.timing']
// The torso shows ONLY the green window (LEVELS.bandLow..bandHigh = 55..70); there is
// no red line. So „over" levels sit CLEARLY above the window with margin for an
// imperfect pump — a value just above 70 would read as „still in/at the window".
export const FR_DRIFT = 78 // grapefruit pushes the level up — well over the window (< 80, no trip)
export const FR_DEMO_HIGH = 78 // mechanism re-stack: grapefruit back → clearly over the window
export const FR_ASSAY = 79 // assay proof hub — driven well over the window (< 80, no trip)

// --- detective: lift items off the tray; only grapefruit is the culprit ---
export interface FrTrayItem {
  id: string
  labelKey: string
  icon: string
  culprit?: boolean
}
export const FR_TRAY: FrTrayItem[] = [
  { id: 'apfel', labelKey: 'fr.item.apfel', icon: '🍎' },
  { id: 'birne', labelKey: 'fr.item.birne', icon: '🍐' },
  { id: 'kaffee', labelKey: 'fr.item.kaffee', icon: '☕' },
  { id: 'jog', labelKey: 'fr.item.jog', icon: '🏃' },
  { id: 'grapefruit', labelKey: 'fr.item.grapefruit', icon: '🥤', culprit: true },
]

// --- strategy: the choice itself moves the water ---
export interface FrOption {
  id: string
  labelKey: string
  feedbackKey: string
  result: Outcome | 'retry'
  target?: number // undefined = deliberate STILL (no pump move), e.g. „zeitversetzt"
  adultOnly?: boolean
}
export const FR_OPTIONS: FrOption[] = [
  // ✅ the real fix → settles in the band → WIN (→ fruit assay)
  { id: 'drop', labelKey: 'fr.opt.drop', feedbackKey: 'fr.fb.drop', result: 'win', target: 62 },
  // ❌ trap → the pump does NOT move (stillness): timing doesn't lift CYP3A4 → retry
  { id: 'space', labelKey: 'fr.opt.space', feedbackKey: 'fr.fb.space', result: 'retry' },
  // ❌❌ danger → over the red high tape → LOSE Überdosis
  { id: 'raise', labelKey: 'fr.opt.raise', feedbackKey: 'fr.fb.raise', result: 'over', target: 88 },
  // ⚠️ adult-only → variable inhibition won't settle → drifts out of band → LOSE Unterdosiert
  { id: 'lower', labelKey: 'fr.opt.lower', feedbackKey: 'fr.fb.lower', result: 'under', target: 54, adultOnly: true },
]
// the „Dosis senken" wobble path before it settles out of band (read-the-body honesty)
export const FR_LOWER_WOBBLE = [58, 67, 54]

// --- furanocoumarin assay: reuse the bundled fruit photos (public/fruits/) ---
export interface FrFruit {
  id: string
  img: string
  labelKey: string
  inhibits: boolean // contains furanocoumarins (grapefruit/pomelo/bitter orange)
}
export const FR_FRUITS: FrFruit[] = [
  { id: 'grapefruit', img: '/fruits/grapefruit.jpg', labelKey: 'fruit.grapefruit', inhibits: true },
  { id: 'pomelo', img: '/fruits/pomelo.jpg', labelKey: 'fruit.pomelo', inhibits: true },
  { id: 'bitterorange', img: '/fruits/bitterorange.jpg', labelKey: 'fruit.bitterorange', inhibits: true },
  { id: 'orange', img: '/fruits/orange.jpg', labelKey: 'fruit.orange', inhibits: false },
  { id: 'mandarine', img: '/fruits/mandarine.jpg', labelKey: 'fruit.mandarine', inhibits: false },
  { id: 'zitrone', img: '/fruits/zitrone.jpg', labelKey: 'fruit.zitrone', inhibits: false },
]

/** assay grade for the „pro" half-star: perfect = 1, one wrong = 0.5, two+ = 0. */
export function frAssayGrade(selected: Set<string>): number {
  const wrong = FR_FRUITS.filter((f) => f.inhibits !== selected.has(f.id)).length
  return wrong === 0 ? 1 : wrong === 1 ? 0.5 : 0
}
