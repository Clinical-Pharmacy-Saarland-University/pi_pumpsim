// Headless "play via code" for „Die Blut-Balance" (DDI). Run: npx tsx sim/ddi.sim.ts
// Torso-first v2: scan-a-pairing (still vs surge) → mechanism/twist demo → read-the-body
// strategy → safe-plan sort. Asserts the data model + decision→torso→outcome→stars.
import {
  DDI_PROBE, DDI_SCAN_PILLS, DDI_OPTIONS, DDI_PLAN_CARDS, ddiPlanCorrect, ddiStars,
  DDI_START, DDI_SURGE, DDI_WARN, DDI_LINE_HIGH, DDI_LINE_LOW, DDI_FACTS,
} from '../src/lib/stories/ddi'
import { outcomeForLevel, stars, DEFAULT_CFG } from '../src/lib/flow'

let fails = 0
const ok = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) fails++
}

// --- scanner: one fixed probe, four still pairings + one surge ---
ok('probe is the new antibiotic (clarithromycin)', DDI_PROBE.id === 'clarithromycin')
ok('exactly one dangerous scan pill (the blood-thinner)', DDI_SCAN_PILLS.filter((p) => p.danger).length === 1)
ok('the dangerous pill is phenprocoumon', DDI_SCAN_PILLS.find((p) => p.danger)!.id === 'phenprocoumon')
ok('four harmless pills hold the body still', DDI_SCAN_PILLS.filter((p) => !p.danger).length === 4)

// --- torso levels stay engine-legal, demos clear the window with pump margin ---
ok('baseline starts in the green band', DDI_START >= DEFAULT_CFG.band_low && DDI_START <= DEFAULT_CFG.band_high)
ok('teach-high clears the window with margin (>70+5, <80)', DDI_LINE_HIGH > DEFAULT_CFG.band_high + 5 && DDI_LINE_HIGH < DEFAULT_CFG.critical_high)
ok('teach-low clears under the window (<55, >35)', DDI_LINE_LOW < DEFAULT_CFG.band_low && DDI_LINE_LOW > DEFAULT_CFG.critical_low)
ok('scanner surge clears the window with margin (>=78, <80)', DDI_SURGE >= 78 && DDI_SURGE > DEFAULT_CFG.band_high + 5 && DDI_SURGE < DEFAULT_CFG.critical_high)
ok('twist warning sits over the surge, no trip', DDI_WARN > DDI_SURGE && DDI_WARN < DEFAULT_CFG.critical_high)
ok('at least 3 rotating dose-fill facts', DDI_FACTS.length >= 3)

// --- strategy: decision → torso target → outcome consistency ---
for (const o of DDI_OPTIONS) {
  ok(`option ${o.id}: result '${o.result}' matches torso target ${o.target}`, outcomeForLevel(o.target) === o.result)
}
ok('exactly one winning option (safe)', DDI_OPTIONS.filter((o) => o.result === 'win').length === 1)
ok('one underdose option (stop the thinner)', DDI_OPTIONS.filter((o) => o.result === 'under').length === 1)
ok('three overdose options (both / ppi / reduce)', DDI_OPTIONS.filter((o) => o.result === 'over').length === 3)
ok('the win move is a real fall (62 < WARN 79)', DDI_OPTIONS.find((o) => o.id === 'safe')!.target < DDI_WARN)
ok('„reduce" is adult-only', DDI_OPTIONS.find((o) => o.id === 'reduce')!.adultOnly === true)
ok('over picks cross the top tape (>=80)', DDI_OPTIONS.filter((o) => o.result === 'over').every((o) => o.target >= DEFAULT_CFG.critical_high))
ok('the stop pick crosses the bottom tape (<=35)', DDI_OPTIONS.find((o) => o.id === 'stop')!.target <= DEFAULT_CFG.critical_low)

// --- safe-plan sort ---
ok('five cards belong in the safe plan', DDI_PLAN_CARDS.filter((c) => c.safe).length === 5)
ok('four cards are not safe', DDI_PLAN_CARDS.filter((c) => !c.safe).length === 4)
const perfect: Record<string, boolean> = {}
for (const c of DDI_PLAN_CARDS) perfect[c.id] = c.safe
ok('sort: all-correct scores true', ddiPlanCorrect(perfect))
ok('sort: one wrong → false', !ddiPlanCorrect({ ...perfect, hide: true }))

// --- scoring: clever (scan + twist) / pro (finale + clean sort) → ddiStars / stars() ---
ok('flawless win = 3.0★', ddiStars(true, { scanClean: true, twistRead: true, sortClean: true }) === 3)
ok('one slip (dirty sort) = 2.5★', ddiStars(true, { scanClean: true, twistRead: true, sortClean: false }) === 2.5)
ok('two slips (misread twist + dirty sort) = 2.0★', ddiStars(true, { scanClean: true, twistRead: false, sortClean: false }) === 2)
ok('worst clean win (all flags missed) = 1.5★', ddiStars(true, { scanClean: false, twistRead: false, sortClean: false }) === 1.5)
ok('parity with stars(win,1,1)', ddiStars(true, { scanClean: true, twistRead: true, sortClean: true }) === stars(true, 1, 1))
ok('any loss = 0★', ddiStars(false, { scanClean: true, twistRead: true, sortClean: true }) === 0)

// --- full playthrough traces ---
function play(optId: string, scanClean: boolean, twistRead: boolean, sortClean: boolean) {
  const o = DDI_OPTIONS.find((x) => x.id === optId)!
  const out = outcomeForLevel(o.target)
  const s = ddiStars(out === 'win', { scanClean, twistRead, sortClean })
  return { torso: o.target, outcome: out, stars: s }
}
const win = play('safe', true, true, true)
ok('WIN path: torso 62, win, 3★', win.torso === 62 && win.outcome === 'win' && win.stars === 3)
const over = play('both', true, true, true)
ok('OVERDOSE path: torso 90, over, 0★', over.torso === 90 && over.outcome === 'over' && over.stars === 0)
const ppi = play('ppi', true, true, true)
ok('TWIST-ECHO path (only stomach): torso 86, over, 0★', ppi.torso === 86 && ppi.outcome === 'over' && ppi.stars === 0)
const under = play('stop', true, true, true)
ok('UNDERDOSE path (stop thinner): torso 30, under, 0★', under.torso === 30 && under.outcome === 'under' && under.stars === 0)

console.log(`\n${fails === 0 ? '✅ ALL PASS' : '❌ ' + fails + ' FAILED'}`)
process.exit(fails === 0 ? 0 : 1)
