// Headless "play via code" for „Die Frühstücks-Falle" (FDI). Run: npx tsx sim/fruehstueck.sim.ts
// Torso-first v2: lift-to-test detective (still vs fall) → mechanism tank-demo →
// strategy (the choice moves the water) → furanocoumarin assay. Asserts the data
// model + decision→torso→outcome→stars.
import {
  FR_TRAY, FR_OPTIONS, FR_FRUITS, frAssayGrade, FR_LOWER_WOBBLE,
  FR_BASELINE, FR_DOSE, FR_DRIFT, FR_DEMO_HIGH, FR_ASSAY,
} from '../src/lib/stories/fruehstueck'
import { outcomeForLevel, stars, DEFAULT_CFG } from '../src/lib/flow'

let fails = 0
const ok = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) fails++
}

// --- lift-to-test tray: one culprit, the rest innocent ---
ok('exactly one culprit on the tray', FR_TRAY.filter((i) => i.culprit).length === 1)
ok('the culprit is the grapefruit juice', FR_TRAY.find((i) => i.culprit)!.id === 'grapefruit')
ok('four innocent breakfast items', FR_TRAY.filter((i) => !i.culprit).length === 4)

// --- torso levels stay engine-legal ---
ok('baseline is below the band', FR_BASELINE < DEFAULT_CFG.band_low)
ok('standard dose lands in the green band', FR_DOSE >= DEFAULT_CFG.band_low && FR_DOSE <= DEFAULT_CFG.band_high)
ok('breakfast drift caps below the red high tape', FR_DRIFT < DEFAULT_CFG.critical_high)
ok('mechanism re-stack caps below the red high tape', FR_DEMO_HIGH < DEFAULT_CFG.critical_high)
ok('assay proof hub caps below the red high tape', FR_ASSAY < DEFAULT_CFG.critical_high)

// --- strategy: decision → torso target → outcome consistency ---
const byId = (id: string) => FR_OPTIONS.find((o) => o.id === id)!
for (const o of FR_OPTIONS) {
  if (o.result === 'retry') ok(`option ${o.id}: retry has NO pump move (stillness)`, o.target === undefined)
  else ok(`option ${o.id}: result '${o.result}' matches torso target ${o.target}`, outcomeForLevel(o.target!) === o.result)
}
ok('one winning option (drop the grapefruit)', FR_OPTIONS.filter((o) => o.result === 'win').length === 1)
ok('one overdose option (raise)', FR_OPTIONS.filter((o) => o.result === 'over').length === 1)
ok('one underdose option (lower)', FR_OPTIONS.filter((o) => o.result === 'under').length === 1)
ok('one retry trap (space out)', FR_OPTIONS.filter((o) => o.result === 'retry').length === 1)
ok('„lower" is adult-only', byId('lower').adultOnly === true)
ok('the raise pick crosses the red high tape (>=80)', byId('raise').target! >= DEFAULT_CFG.critical_high)
ok('the lower wobble settles under the band but above crit-low', byId('lower').target! < DEFAULT_CFG.band_low && byId('lower').target! > DEFAULT_CFG.critical_low)
ok('the lower wobble ends at the option target', FR_LOWER_WOBBLE[FR_LOWER_WOBBLE.length - 1] === byId('lower').target)
ok('the wobble never trips a red tape', FR_LOWER_WOBBLE.every((v) => v < DEFAULT_CFG.critical_high && v > DEFAULT_CFG.critical_low))

// --- furanocoumarin assay ---
ok('three fruits inhibit, three are safe', FR_FRUITS.filter((f) => f.inhibits).length === 3 && FR_FRUITS.filter((f) => !f.inhibits).length === 3)
const all = new Set(FR_FRUITS.filter((f) => f.inhibits).map((f) => f.id))
ok('assay: perfect selection = 1.0', frAssayGrade(all) === 1)
const oneWrong = new Set([...all, 'orange'])
ok('assay: one wrong = 0.5', frAssayGrade(oneWrong) === 0.5)
ok('assay: empty selection = 0 (all 3 inhibitors missed)', frAssayGrade(new Set()) === 0)

// --- scoring: clever (detective lifts) / pro (assay) → stars() ---
const score = (wrongLifts: number, assay: number) =>
  stars(true, wrongLifts === 0 ? 1 : wrongLifts === 1 ? 0.5 : 0, assay)
ok('flawless win (no wrong lift, perfect assay) = 3.0★', score(0, 1) === 3)
ok('one stray lift, perfect assay = 2.5★', score(1, 1) === 2.5)
ok('clean detective, one assay slip = 2.5★', score(0, 0.5) === 2.5)
ok('scraped win (2 lifts + assay miss) = 1.0★', score(2, 0) === 1)
ok('any loss = 0★', stars(false, 1, 1) === 0)

// --- full playthrough traces ---
function play(optId: string, wrongLifts: number, assay: number) {
  const o = byId(optId)
  const out = o.result === 'retry' ? 'win' : outcomeForLevel(o.target!)
  const s = out === 'win' ? score(wrongLifts, assay) : 0
  return { torso: o.target, outcome: out, stars: s }
}
const win = play('drop', 0, 1)
ok('WIN path: torso 62, win, 3★', win.torso === 62 && win.outcome === 'win' && win.stars === 3)
const over = play('raise', 0, 1)
ok('OVERDOSE path: torso 88, over, 0★', over.torso === 88 && over.outcome === 'over' && over.stars === 0)
const under = play('lower', 0, 1)
ok('UNDERDOSE path: torso 54, under, 0★', under.torso === 54 && under.outcome === 'under' && under.stars === 0)

console.log(`\n${fails === 0 ? '✅ ALL PASS' : '❌ ' + fails + ' FAILED'}`)
process.exit(fails === 0 ? 0 : 1)
