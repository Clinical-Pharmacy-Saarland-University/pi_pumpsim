// Headless "play via code" for „Der Wochen-Pillenplan" (adherence). Run: npx tsx sim/adherence.sim.ts
// Torso-first v2: compose a 7-day plan, hand-crank it into a saw-tooth. Asserts the data model
// (deltas, decision options, the PK-curve helpers) + week-replay traces + decision→outcome→stars.
import {
  simulateWeek, isCleanPlan, ADH_QUIZ, ADH_DECISION, ADH_DELTA, ADH_RECOVERY, ADH_START,
  ADH_CRIT_HIGH, ADH_CRIT_LOW, ADH_DAYS, levelToY, dayToX, ADH_PLOT_LEFT, ADH_PLOT_RIGHT,
  adhCleverGrade, adhProGrade,
} from '../src/lib/stories/adherence'
import { outcomeForLevel, stars, DEFAULT_CFG, LEVELS } from '../src/lib/flow'

let fails = 0
const ok = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) fails++
}
const c = DEFAULT_CFG

// --- data model legal vs LEVELS ---
ok('steady state === LEVELS.dose, in the band', ADH_START === LEVELS.dose && ADH_START >= c.band_low && ADH_START <= c.band_high)
ok('deltas: gap -8, held 0, double +16', ADH_DELTA[0] === -8 && ADH_DELTA[1] === 0 && ADH_DELTA[2] === 16)
ok('recovery is 8', ADH_RECOVERY === 8)
ok('crit lines mirror LEVELS', ADH_CRIT_HIGH === LEVELS.critHigh && ADH_CRIT_LOW === LEVELS.critLow)
ok('seven days', ADH_DAYS.length === 7)
ok('clean 7×1 plan true, any 0/2 false', isCleanPlan([1, 1, 1, 1, 1, 1, 1]) && !isCleanPlan([1, 0, 1, 1, 1, 1, 1]) && !isCleanPlan([1, 2, 1, 1, 1, 1, 1]))

// --- decision options ---
ok('exactly one winning decision (single, 62 in band)', ADH_DECISION.filter((o) => o.result === 'win').length === 1 && ADH_DECISION.find((o) => o.id === 'single')!.target === 62 && outcomeForLevel(62) === 'win')
ok('double overshoots the top edge but survives (70 === bandHigh, <80, holds)', (() => { const d = ADH_DECISION.find((o) => o.id === 'double')!; return d.target === LEVELS.bandHigh && d.target! < ADH_CRIT_HIGH && (d.holdMs ?? 0) > 0 })())
ok('omit + retitrate are the no-move (still) answers', ADH_DECISION.find((o) => o.id === 'omit')!.target === undefined && ADH_DECISION.find((o) => o.id === 'retitrate')!.target === undefined)
ok('retitrate is adult-only', ADH_DECISION.find((o) => o.id === 'retitrate')!.adultOnly === true)
ok('every decision result is win|over|under|still', ADH_DECISION.every((o) => ['win', 'over', 'under', 'still'].includes(o.result)))

// --- simulateWeek traces ---
ok('clean week → all 62, no trip, win', (() => { const s = simulateWeek([1, 1, 1, 1, 1, 1, 1]); return s.outcome === 'win' && s.tripIndex === -1 && s.levels.every((l) => l === 62) })())
ok('gap→single recovers (62,54,62…), win', (() => { const s = simulateWeek([1, 0, 1, 1, 1, 1, 1]); return s.outcome === 'win' && s.tripIndex === -1 && s.levels[1] === 54 && s.levels[2] === 62 })())
ok('single double from full → 78, survives (twist demo level)', (() => { const s = simulateWeek([1, 1, 2, 1, 1, 1, 1]); return s.outcome === 'win' && s.tripIndex === -1 && s.levels[2] === 78 && 78 < ADH_CRIT_HIGH })())
ok('stacked doubles → 62→78→94 over, trips day 1', (() => { const s = simulateWeek([2, 2, 1, 1, 1, 1, 1]); return s.outcome === 'over' && s.tripIndex === 1 && s.levels[1] >= ADH_CRIT_HIGH })())
ok('staircase 4 gaps → 30 under, trips day 3', (() => { const s = simulateWeek([0, 0, 0, 0, 1, 1, 1]); return s.outcome === 'under' && s.tripIndex === 3 && s.levels[3] <= ADH_CRIT_LOW })())
ok('three gaps survive (38 > 35)', (() => { const s = simulateWeek([0, 0, 0, 1, 1, 1, 1]); return s.outcome === 'win' && s.tripIndex === -1 })())
ok('winning traces never breach crit lines', (() => { const s = simulateWeek([1, 0, 1, 1, 1, 1, 1]); return s.levels.every((l) => l > c.critical_low && l < c.critical_high) })())

// --- PK-curve helpers ---
ok('levelToY inverted (higher level → smaller y)', levelToY(LEVELS.bandLow) > levelToY(LEVELS.bandHigh))
ok('dayToX spans the plot, monotonic', dayToX(0) === ADH_PLOT_LEFT && dayToX(6) === ADH_PLOT_RIGHT && dayToX(3) > dayToX(2))

// --- scoring grades + traces ---
ok('cleverGrade: clean+no-retry=1, else 0.5', adhCleverGrade(true, false) === 1 && adhCleverGrade(false, false) === 0.5 && adhCleverGrade(true, true) === 0.5)
ok('proGrade: cleanNoDecision=1, first-try=1, corrected=0.5, missed=0', adhProGrade(false, false, true) === 1 && adhProGrade(true, false, false) === 1 && adhProGrade(false, true, false) === 0.5 && adhProGrade(false, false, false) === 0)
ok('flawless clean week (no decision) = 3★', stars(true, adhCleverGrade(true, false), adhProGrade(false, false, true)) === 3)
ok('win, recovered gap, decided first-try = 2.5★', stars(true, adhCleverGrade(false, false), adhProGrade(true, false, false)) === 2.5)
ok('win, recovered gap, wrong tap first = 2.0★', stars(true, 0.5, 0.5) === 2)
ok('over loss = 0★', outcomeForLevel(94) === 'over' && stars(false, 1, 1) === 0)
ok('under loss = 0★', outcomeForLevel(30) === 'under' && stars(false, 1, 1) === 0)
ok('quiz: exactly one correct (normal), retitrate adult-only/not the answer', ADH_QUIZ.filter((q) => q.correct).length === 1 && ADH_QUIZ.find((q) => q.correct)!.id === 'normal' && ADH_QUIZ.find((q) => q.id === 'retitrate')!.adultOnly === true)

console.log(`\n${fails === 0 ? '✅ ALL PASS' : '❌ ' + fails + ' FAILED'}`)
process.exit(fails === 0 ? 0 : 1)
