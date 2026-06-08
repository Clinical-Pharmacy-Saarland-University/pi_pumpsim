// Headless "play via code" for the adherence story. Run: npx tsx sim/adherence.sim.ts
import { simulateWeek, isCleanPlan, ADH_QUIZ } from '../src/lib/stories/adherence'

let fails = 0
const ok = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) fails++
}

const clean = [1, 1, 1, 1, 1, 1, 1]
ok('clean 7×1 → win, no trip, holds ~62', (() => { const s = simulateWeek(clean); return s.outcome === 'win' && s.tripIndex === -1 && s.levels[6] === 62 })())
ok('isCleanPlan(7×1) = true', isCleanPlan(clean))
ok('isCleanPlan with a double = false', !isCleanPlan([1, 2, 1, 1, 1, 1, 1]))

ok('single mid-week gap recovers → win', (() => { const s = simulateWeek([1, 0, 1, 1, 1, 1, 1]); return s.outcome === 'win' && s.tripIndex === -1 })())
ok('single gap dips below band then rebounds (54→62)', (() => { const s = simulateWeek([1, 0, 1, 1, 1, 1, 1]); return s.levels[1] === 54 && s.levels[2] === 62 })())

ok('two doubles → over (82), trips on day 2', (() => { const s = simulateWeek([2, 2, 1, 1, 1, 1, 1]); return s.outcome === 'over' && s.tripIndex === 1 && s.levels[1] === 82 })())
ok('single double from steady survives (72, no trip)', (() => { const s = simulateWeek([2, 1, 1, 1, 1, 1, 1]); return s.outcome === 'win' && s.tripIndex === -1 && s.levels[0] === 72 })())

ok('four gaps in a row → under (≤35), trips on day 4', (() => { const s = simulateWeek([0, 0, 0, 0, 1, 1, 1]); return s.outcome === 'under' && s.tripIndex === 3 && s.levels[3] === 30 })())
ok('three gaps in a row survives (38 > 35)', (() => { const s = simulateWeek([0, 0, 0, 1, 1, 1, 1]); return s.outcome === 'win' && s.tripIndex === -1 })())

ok('quiz: exactly one correct (normal weitermachen)', ADH_QUIZ.filter((q) => q.correct).length === 1 && ADH_QUIZ.find((q) => q.correct)!.id === 'normal')
ok('quiz: retitrate is adult-only and not the answer here', ADH_QUIZ.find((q) => q.id === 'retitrate')!.adultOnly === true && ADH_QUIZ.find((q) => q.id === 'retitrate')!.correct === false)

console.log(`\n${fails === 0 ? '✅ ALL PASS' : '❌ ' + fails + ' FAILED'}`)
process.exit(fails === 0 ? 0 : 1)
