// Headless "play via code" for „Die Blut-Balance" (DDI). Run: npx tsx sim/ddi.sim.ts
// Two-act enzyme-throttle: learn Bremse/Turbo → Act 1 the antibiotic is a Bremse (climb →
// manage down) → Act 2 carbamazepin is a Turbo (drop → manage up) → „Bremse oder Turbo?" sort.
// Asserts the data model + both decisions → torso → outcome → stars.
import {
  DDI_DETEKTIV_PILLS, DDI_DECISION1, DDI_DECISION2, DDI_SORT, DDI_FACTS,
  ddiSortGrade, ddiClever, ddiStars, DDI_BASELINE, DDI_START, DDI_SURGE, DDI_DRIFT_LOW,
  DDI_LINE_HIGH, DDI_LINE_LOW, type SortCat,
} from '../src/lib/stories/ddi'
import { outcomeForLevel, stars, DEFAULT_CFG } from '../src/lib/flow'

let fails = 0
const ok = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) fails++
}

// --- detektiv: exactly one Bremse (the new antibiotic), four neutral pills ---
ok('exactly one Bremse among the detektiv pills', DDI_DETEKTIV_PILLS.filter((p) => p.bremse).length === 1)
ok('the Bremse is the new antibiotic (clarithromycin)', DDI_DETEKTIV_PILLS.find((p) => p.bremse)!.id === 'clarithromycin')
ok('four neutral pills hold the body still', DDI_DETEKTIV_PILLS.filter((p) => !p.bremse).length === 4)
ok('the blood-thinner is NOT a tile (it is the level)', !DDI_DETEKTIV_PILLS.some((p) => p.id === 'phenprocoumon'))

// --- torso levels stay engine-legal; demos clear the window both ways with margin ---
ok('home baseline is the reset level (20)', DDI_BASELINE === 20)
ok('baseline dose sits in the green band', DDI_START >= DEFAULT_CFG.band_low && DDI_START <= DEFAULT_CFG.band_high)
ok('teach-high clears the window with margin (>70+5, <80)', DDI_LINE_HIGH > DEFAULT_CFG.band_high + 5 && DDI_LINE_HIGH < DEFAULT_CFG.critical_high)
ok('teach-low clears under the window (<55, >35)', DDI_LINE_LOW < DEFAULT_CFG.band_low && DDI_LINE_LOW > DEFAULT_CFG.critical_low)
ok('Bremse surge clears the window up, no trip (>=78, <80)', DDI_SURGE >= 78 && DDI_SURGE < DEFAULT_CFG.critical_high)
ok('Turbo drift clears the window down, no trip (<55, >35)', DDI_DRIFT_LOW < DEFAULT_CFG.band_low && DDI_DRIFT_LOW > DEFAULT_CFG.critical_low)
ok('at least 3 rotating dose-fill facts', DDI_FACTS.length >= 3)
ok('no premature „Wechselwirkungen" fact (the helper is seeded instead)', DDI_FACTS.includes('ddi.fact.helper'))

// --- decision 1 (body HIGH → down): one win, three over, one under ---
for (const o of DDI_DECISION1) {
  ok(`d1 ${o.id}: result '${o.result}' matches torso target ${o.target}`, outcomeForLevel(o.target) === o.result)
}
ok('d1 has exactly one winning option (safe)', DDI_DECISION1.filter((o) => o.result === 'win').length === 1)
ok('d1 win settles green (62 < surge 78)', DDI_DECISION1.find((o) => o.id === 'safe')!.target < DDI_SURGE)
ok('d1 over picks cross the top tape (>=80)', DDI_DECISION1.filter((o) => o.result === 'over').every((o) => o.target >= DEFAULT_CFG.critical_high))
ok('d1 the stop pick crosses the bottom tape (<=35)', DDI_DECISION1.find((o) => o.id === 'stop')!.target <= DEFAULT_CFG.critical_low)
ok('d1 „reduceab" is adult-only', DDI_DECISION1.find((o) => o.id === 'reduceab')!.adultOnly === true)

// --- decision 2 (body LOW → up): one win, one under, one over ---
for (const o of DDI_DECISION2) {
  ok(`d2 ${o.id}: result '${o.result}' matches torso target ${o.target}`, outcomeForLevel(o.target) === o.result)
}
ok('d2 has exactly one winning option (safe)', DDI_DECISION2.filter((o) => o.result === 'win').length === 1)
ok('d2 win climbs from low back to green (46 < 62)', DDI_DRIFT_LOW < DDI_DECISION2.find((o) => o.id === 'safe')!.target)
ok('d2 ignore lets it fall through the bottom tape (<=35)', DDI_DECISION2.find((o) => o.id === 'ignore')!.target <= DEFAULT_CFG.critical_low)
ok('d2 self-double overshoots the top tape (>=80)', DDI_DECISION2.find((o) => o.id === 'selfdouble')!.target >= DEFAULT_CFG.critical_high)
ok('d2 has no „stop the pain drug" loss (removing the inducer would help)', !DDI_DECISION2.some((o) => o.id === 'stoppain'))

// --- capstone sort: two of each category, grading ---
ok('sort has two Bremsen', DDI_SORT.filter((i) => i.cat === 'bremse').length === 2)
ok('sort has two Turbos', DDI_SORT.filter((i) => i.cat === 'turbo').length === 2)
ok('sort cross-links grapefruit (story 1) as a Bremse', DDI_SORT.find((i) => i.id === 'grapefruit')!.cat === 'bremse')
ok('sort cross-links johanniskraut (story 2) as a Turbo', DDI_SORT.find((i) => i.id === 'johanniskraut')!.cat === 'turbo')
const perfect: Record<string, SortCat> = {}
for (const i of DDI_SORT) perfect[i.id] = i.cat
ok('sort grade: all correct = 1.0', ddiSortGrade(perfect) === 1)
ok('sort grade: one wrong = 0.5', ddiSortGrade({ ...perfect, grapefruit: 'turbo' }) === 0.5)
ok('sort grade: two wrong = 0', ddiSortGrade({ ...perfect, grapefruit: 'turbo', johanniskraut: 'bremse' }) === 0)

// --- scoring: clever (detektiv) + pro (sort), win needs BOTH decisions safe ---
ok('clever: 0 wrong guesses = 1.0', ddiClever(0) === 1)
ok('clever: 1 wrong guess = 0.5', ddiClever(1) === 0.5)
ok('clever: 2+ wrong guesses = 0', ddiClever(2) === 0)
ok('flawless win = 3.0★', ddiStars(true, 0, 1) === 3)
ok('one slip (a wrong detektiv guess) = 2.5★', ddiStars(true, 1, 1) === 2.5)
ok('two slips (wrong guess + close sort) = 2.0★', ddiStars(true, 1, 0.5) === 2)
ok('worst clean win (sloppy detektiv + sort) = 1.0★', ddiStars(true, 2, 0) === 1)
ok('parity with stars(win,1,1)', ddiStars(true, 0, 1) === stars(true, 1, 1))
ok('any loss = 0★', ddiStars(false, 0, 1) === 0)

// --- full playthrough traces ---
function play(d1: string, d2: string, wrong: number, sortGrade: number) {
  const o1 = DDI_DECISION1.find((x) => x.id === d1)!
  const out1 = outcomeForLevel(o1.target)
  if (out1 !== 'win') return { stage: 'act1', outcome: out1, stars: ddiStars(false, wrong, sortGrade) }
  const o2 = DDI_DECISION2.find((x) => x.id === d2)!
  const out2 = outcomeForLevel(o2.target)
  if (out2 !== 'win') return { stage: 'act2', outcome: out2, stars: ddiStars(false, wrong, sortGrade) }
  return { stage: 'done', outcome: 'win' as const, stars: ddiStars(true, wrong, sortGrade) }
}
const full = play('safe', 'safe', 0, 1)
ok('FULL WIN: both decisions safe, 3★', full.stage === 'done' && full.outcome === 'win' && full.stars === 3)
const act1bleed = play('keepboth', 'safe', 0, 1)
ok('ACT-1 OVERDOSE (keep both): over, 0★', act1bleed.stage === 'act1' && act1bleed.outcome === 'over' && act1bleed.stars === 0)
const act1clot = play('stop', 'safe', 0, 1)
ok('ACT-1 UNDERDOSE (stop thinner): under, 0★', act1clot.stage === 'act1' && act1clot.outcome === 'under' && act1clot.stars === 0)
const act2clot = play('safe', 'ignore', 0, 1)
ok('ACT-2 UNDERDOSE (ignore turbo): under, 0★', act2clot.stage === 'act2' && act2clot.outcome === 'under' && act2clot.stars === 0)
const act2bleed = play('safe', 'selfdouble', 0, 1)
ok('ACT-2 OVERDOSE (self-double): over, 0★', act2bleed.stage === 'act2' && act2bleed.outcome === 'over' && act2bleed.stars === 0)

console.log(`\n${fails === 0 ? '✅ ALL PASS' : '❌ ' + fails + ' FAILED'}`)
process.exit(fails === 0 ? 0 : 1)
