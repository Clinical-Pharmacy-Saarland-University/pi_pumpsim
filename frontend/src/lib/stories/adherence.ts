// Story „Der Wochen-Pillenplan" (Adhärenz × Lamotrigin) — pure data + sim. The player
// authors a 7-day plan; we replay it as a saw-tooth. Lamotrigin protects only at a
// CONSTANT level: missed days → breakthrough seizures; doubling ("catching up") →
// toxicity. Never double a missed dose. No invented effect.
import type { Outcome } from '../flow'

export const ADH_START = 62
export const ADH_DAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
export const ADH_DELTA: Record<number, number> = { 0: -8, 1: 0, 2: 10 }
export const ADH_RECOVERY = 8 // a correct day right after a gap rebounds fully
export const ADH_CRIT_HIGH = 80
export const ADH_CRIT_LOW = 35

export interface WeekSim {
  levels: number[] // torso target after each played day
  tripIndex: number // day index where a critical line broke (-1 = none)
  outcome: Outcome
}
/** Replay an authored week (slots 0=miss, 1=take, 2=double) into a torso trajectory. */
export function simulateWeek(plan: number[]): WeekSim {
  let level = ADH_START
  let prevGap = false
  const levels: number[] = []
  let outcome: Outcome = 'win'
  let trip = -1
  for (let d = 0; d < plan.length; d++) {
    const slot = plan[d]
    let delta = ADH_DELTA[slot] ?? 0
    if (slot === 1 && prevGap) delta += ADH_RECOVERY // single gap recovers
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

// closing quiz: only "normal weitermachen" is right for a SINGLE missed dose
export interface AdhQuizOpt {
  id: string
  labelKey: string
  feedbackKey: string
  correct: boolean
  adultOnly?: boolean
}
export const ADH_QUIZ: AdhQuizOpt[] = [
  { id: 'normal', labelKey: 'adh.q.normal', feedbackKey: 'adh.qfb.normal', correct: true },
  { id: 'double', labelKey: 'adh.q.double', feedbackKey: 'adh.qfb.double', correct: false },
  { id: 'stop', labelKey: 'adh.q.stop', feedbackKey: 'adh.qfb.stop', correct: false },
  { id: 'retitrate', labelKey: 'adh.q.retitrate', feedbackKey: 'adh.qfb.retitrate', correct: false, adultOnly: true },
]
