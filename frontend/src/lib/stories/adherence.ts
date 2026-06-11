// Story „Der Wochen-Pillenplan" (Adhärenz · Lamotrigin) — pure data + sim.
// Torso-first v2 (docs/stories/overhaul/build-adherence.md). Signature mechanic:
// COMPOSE-A-WEEK then HAND-CRANK — author a 7-slot Mo–So plan (0/1/2 pills), then turn
// each day by hand; the plan becomes a saw-tooth carved into the real torso AND a drawn
// PK curve. Lamotrigin protects only at a CONSTANT Spiegel: gaps sink it (under), doubling
// to "catch up" climbs it the WRONG way toward over (additive — more drug pushes UP).
// No on-screen vessel — the pump is the readout; the PK curve is the authored shape (band only).
import { LEVELS, type Outcome } from '../flow'

export const ADH_START: number = LEVELS.dose // steady state = 62, in the green band
export const ADH_DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] // labels (also via adh.day.*)
export const ADH_DELTA: Record<number, number> = { 0: -8, 1: 0, 2: 16 } // gap / held / DOUBLE
export const ADH_RECOVERY = 8 // a single take right after a gap rebounds fully (54 -> 62)
export const ADH_CRIT_HIGH = LEVELS.critHigh // 80 (invisible auto-trip)
export const ADH_CRIT_LOW = LEVELS.critLow // 35 (invisible auto-trip)

// dose-fill "Wusstest du?" cards rotated while the prime pumps in (20 -> 62)
export const ADH_FACTS = ['adh.fact.disease', 'adh.fact.drug', 'adh.fact.window', 'adh.fact.timing']

// live read-the-body decision after a gap leaves the Spiegel low (sitting at ~54).
// target undefined = deliberate STILL (no pump move). Right answer dictated by the body.
export interface AdhDecisionOpt {
  id: string
  labelKey: string
  feedbackKey: string
  result: Outcome | 'still' // 'still' = the no-move "weglassen/abwarten" answer
  target?: number // 62 heal / 70 wrong-way overshoot / undefined = still
  holdMs?: number // dwell at the extreme (the double pauses near over)
  adultOnly?: boolean
}
export const ADH_DECISION: AdhDecisionOpt[] = [
  { id: 'single', labelKey: 'adh.dec.single', feedbackKey: 'adh.decfb.single', result: 'win', target: 62 },
  { id: 'double', labelKey: 'adh.dec.double', feedbackKey: 'adh.decfb.double', result: 'over', target: 70, holdMs: 1000 },
  { id: 'omit', labelKey: 'adh.dec.omit', feedbackKey: 'adh.decfb.omit', result: 'still' },
  { id: 'retitrate', labelKey: 'adh.dec.retitrate', feedbackKey: 'adh.decfb.retitrate', result: 'still', adultOnly: true },
]
// NB: 'double' target 70 OVERSHOOTS the band's top edge (wrong-way) but SURVIVES (70 < 80).
// It is scored as a wrong tap, not an instant loss — the loss path is the authored stacked-
// double trap, not this dip. ('over' here labels "wrong direction"; the component treats it
// as a non-correct tap. outcomeForLevel(70)==='win' is fine.)

export interface WeekSim {
  levels: number[] // torso target after each played day
  tripIndex: number // day index where a critical line broke (-1 = none)
  outcome: Outcome
}
/** Replay an authored week (0=gap, 1=take, 2=double) into a torso trajectory. */
export function simulateWeek(plan: number[]): WeekSim {
  let level = ADH_START
  let prevGap = false
  const levels: number[] = []
  let outcome: Outcome = 'win'
  let trip = -1
  for (let d = 0; d < plan.length; d++) {
    const slot = plan[d]
    let delta = ADH_DELTA[slot] ?? 0
    if (slot === 1 && prevGap) delta += ADH_RECOVERY // single take after a gap recovers fully
    level = Math.max(0, Math.min(100, level + delta))
    levels.push(level)
    prevGap = slot === 0
    if (level >= ADH_CRIT_HIGH) { outcome = 'over'; trip = d; break }
    if (level <= ADH_CRIT_LOW) { outcome = 'under'; trip = d; break }
  }
  return { levels, tripIndex: trip, outcome }
}
export function isCleanPlan(plan: number[]): boolean {
  return plan.length === ADH_DAYS.length && plan.every((s) => s === 1)
}

// --- PK concentration–time curve (qualitative SVG; band only, no numeric axis) ---
export const ADH_CURVE_W = 700
export const ADH_CURVE_H = 240
export const ADH_PLOT_TOP = 20
export const ADH_PLOT_BOT = 220
export const ADH_PLOT_LEFT = 40
export const ADH_PLOT_RIGHT = 660
/** level 0..100 -> y (inverted, clamped to the plot area). */
export function levelToY(level: number): number {
  const c = Math.max(0, Math.min(100, level))
  return ADH_PLOT_BOT - (c / 100) * (ADH_PLOT_BOT - ADH_PLOT_TOP)
}
/** day index 0..6 -> x across the plot. */
export function dayToX(d: number): number {
  const n = ADH_DAYS.length - 1
  return ADH_PLOT_LEFT + (d / n) * (ADH_PLOT_RIGHT - ADH_PLOT_LEFT)
}

/** clever bonus: clean 7x1 first run (no retry) = 1; recovered-gap/retry win = 0.5; else 0. */
export function adhCleverGrade(planClean: boolean, retried: boolean): number {
  return planClean && !retried ? 1 : 0.5
}
/** pro bonus: correct live decision on FIRST tap = 1; corrected after a wrong tap = 0.5;
 *  a flawless clean run with NO gap to decide auto-earns 1 (proved by held water). */
export function adhProGrade(decisionFacedAndFirstTry: boolean, hadToCorrect: boolean, cleanNoDecision: boolean): number {
  if (cleanNoDecision) return 1
  if (decisionFacedAndFirstTry) return 1
  return hadToCorrect ? 0.5 : 0
}

// legacy closing quiz — KEPT as data only (NOT a star decider); backs the debrief fact.
export interface AdhQuizOpt { id: string; labelKey: string; feedbackKey: string; correct: boolean; adultOnly?: boolean }
export const ADH_QUIZ: AdhQuizOpt[] = [
  { id: 'normal', labelKey: 'adh.q.normal', feedbackKey: 'adh.qfb.normal', correct: true },
  { id: 'double', labelKey: 'adh.q.double', feedbackKey: 'adh.qfb.double', correct: false },
  { id: 'stop', labelKey: 'adh.q.stop', feedbackKey: 'adh.qfb.stop', correct: false },
  { id: 'retitrate', labelKey: 'adh.q.retitrate', feedbackKey: 'adh.qfb.retitrate', correct: false, adultOnly: true },
]
