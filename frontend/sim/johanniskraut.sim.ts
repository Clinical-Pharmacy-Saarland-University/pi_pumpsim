// Headless "play via code" for „Das pflanzliche Leck" (johanniskraut). Run: npx tsx sim/johanniskraut.sim.ts
// REWORKED v2: dose into the green window → „eine Woche später" the protection has leaked below the
// band → magnifier investigation (find the herbal culprit among Frau Bergers neue Tees) → mechanism
// explanation → calm live leak-stop finale. DOWN ONLY (no over path). Asserts the level model, the
// investigation items, the finale stop-the-fall rule, and the star scoring.
import {
  JK_BASELINE, JK_DOSE, JK_LEAK_LEVEL, JK_FINALE_START, JK_FLOOR, JK_DRAIN_TARGET, JK_PRO_MIN,
  JK_BAIT_BURST, JK_LEAK_RATE, JK_FINALE_RATE, JK_RESCUE_RATE, JK_FINALE_SECONDS, JK_BAIT_TIME_COST,
  JK_ITEMS, JK_CULPRIT, JK_FINALE_ACTIONS, JK_MANDATORY, jkArmsRescue, jkClever, jkPro,
} from '../src/lib/stories/johanniskraut'
import { outcomeForLevel, stars, DEFAULT_CFG } from '../src/lib/flow'

let fails = 0
const ok = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) fails++
}
const c = DEFAULT_CFG

// --- data model legal vs LEVELS / down-only ---
ok('baseline === reset-home level (so the DOSE is the only pre-game rise)', JK_BASELINE === c.baseline)
ok('baseline primes below the band', JK_BASELINE < c.band_low)
ok('dose lands in the green window', JK_DOSE >= c.band_low && JK_DOSE <= c.band_high)
ok('leak level is visibly under the band, above the floor', JK_LEAK_LEVEL < c.band_low && JK_LEAK_LEVEL > JK_FLOOR)
ok('finale starts where the week left it (= leak level)', JK_FINALE_START === JK_LEAK_LEVEL)
ok('drain target sits under the floor (so the fall reaches it)', JK_DRAIN_TARGET < JK_FLOOR)
ok('floor + pro-min are under the band, pro-min above the floor', JK_FLOOR < c.band_low && JK_PRO_MIN < c.band_low && JK_PRO_MIN > JK_FLOOR)
ok('the finale fall is gentle (rate <= 1 u/s)', JK_FINALE_RATE > 0 && JK_FINALE_RATE <= 1)
ok('leak + rescue rates are positive', JK_LEAK_RATE > 0 && JK_RESCUE_RATE > 0)
ok('the finale has a positive countdown; a bait costs less than the whole clock', JK_FINALE_SECONDS > 0 && JK_BAIT_TIME_COST > 0 && JK_BAIT_TIME_COST < JK_FINALE_SECONDS)
ok('no level is ever above the band (down-only)', [JK_BASELINE, JK_DOSE, JK_LEAK_LEVEL, JK_FINALE_START, JK_DRAIN_TARGET, JK_PRO_MIN].every((l) => l <= c.band_high))

// --- investigation items ---
ok('four investigation items', JK_ITEMS.length === 4)
ok('exactly one culprit', JK_ITEMS.filter((i) => i.culprit).length === 1)
ok('the culprit id === JK_CULPRIT (johanniskraut)', JK_ITEMS.find((i) => i.culprit)!.id === JK_CULPRIT && JK_CULPRIT === 'johanniskraut')
ok('every item has a photo under /johanniskraut/, a label + a reveal key', JK_ITEMS.every((i) => i.img.startsWith('/johanniskraut/') && !!i.labelKey && !!i.revealKey && !!i.emoji))
ok('item ids are unique', new Set(JK_ITEMS.map((i) => i.id)).size === JK_ITEMS.length)

// --- finale actions ---
ok('two mandatory (cause+contact) + two baits, no bonus (4 total)', JK_FINALE_ACTIONS.filter((a) => a.kind === 'mandatory').length === 2 && JK_FINALE_ACTIONS.filter((a) => a.kind === 'bait').length === 2 && JK_FINALE_ACTIONS.length === 4)
ok('mandatory slots are cause + contact', JK_FINALE_ACTIONS.filter((a) => a.kind === 'mandatory').map((a) => a.slot).sort().join(',') === 'cause,contact')
ok('JK_MANDATORY === [absetzen,fachstelle]', JK_MANDATORY.join(',') === 'absetzen,fachstelle')

// --- decision → torso target → outcome consistency (down-only) ---
ok('the fall path is an under-loss', outcomeForLevel(JK_DRAIN_TARGET) === 'under' && outcomeForLevel(JK_FLOOR) === 'under')
ok('the rescue settle lands in the band (win)', outcomeForLevel(JK_DOSE) === 'win')
ok('the leaked torso reads under the band', outcomeForLevel(JK_LEAK_LEVEL) === 'under')
// stop-the-fall rule: one mandatory action does NOT arm the rescue; both do
ok('one mandatory action does NOT arm the rescue', jkArmsRescue(['absetzen']) === false && jkArmsRescue(['fachstelle']) === false)
ok('both mandatory actions arm the rescue', jkArmsRescue(['absetzen', 'fachstelle']) === true)
ok('a bait burst clamps >= drain target, never over the band', Math.max(JK_DRAIN_TARGET, JK_FINALE_START - JK_BAIT_BURST) >= JK_DRAIN_TARGET && JK_FINALE_START - JK_BAIT_BURST <= c.band_high)

// --- scoring traces (win / under; no over) ---
ok('flawless = 3★', stars(true, jkClever(0), jkPro(0, 48)) === 3)
ok('one wrong accusation = 2.5★', stars(true, jkClever(1), jkPro(0, 48)) === 2.5)
ok('two wrong accusations lose the clever bonus = 2★', stars(true, jkClever(2), jkPro(0, 48)) === 2)
ok('one bait loses the clean half = 2.5★', stars(true, jkClever(0), jkPro(1, 48)) === 2.5)
ok('a slow save (dipped below pro-min) = 2.5★', stars(true, jkClever(0), jkPro(0, 40)) === 2.5)
ok('scraped win, both pro halves lost = 1★', stars(true, jkClever(2), jkPro(2, 40)) === 1)
ok('any loss (Abstoßung) = 0★', stars(false, 1, 1) === 0)
ok('clever grades 0/1/2+ wrong → 1 / 0.5 / 0', jkClever(0) === 1 && jkClever(1) === 0.5 && jkClever(2) === 0 && jkClever(3) === 0)
ok('pro halves earnable AND missable', jkPro(0, 48) === 1 && jkPro(1, 48) === 0.5 && jkPro(0, 40) === 0.5 && jkPro(1, 40) === 0)
// over is unreachable
ok('no exported target produces an over outcome', ![JK_BASELINE, JK_DOSE, JK_LEAK_LEVEL, JK_FINALE_START, JK_DRAIN_TARGET].some((l) => outcomeForLevel(l) === 'over'))

console.log(`\n${fails === 0 ? '✅ ALL PASS' : '❌ ' + fails + ' FAILED'}`)
process.exit(fails === 0 ? 0 : 1)
