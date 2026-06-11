// Headless "play via code" for „Das pflanzliche Leck" (johanniskraut). Run: npx tsx sim/johanniskraut.sim.ts
// Torso-first v2: investigate a fixed week, read the delayed fall, BACK-DATE the cause to the quiet
// tea-day (Di = a true no-move), stop the leak live. DOWN ONLY (no over path). Asserts the data
// model + week integrity + the back-date candidate set + the finale stop-the-fall rule + stars.
import {
  JK_BASELINE, JK_DOSE, JK_READ_LEVEL, JK_FINALE_START, JK_FLOOR, JK_DRAIN_TARGET, JK_PRO_MIN,
  JK_TICK_INDUCER, JK_TICK_DELAY, JK_TICK_PENALTY, JK_BAIT_BURST, JK_WEEK_DAYS, JK_FINALE_ACTIONS,
  JK_MANDATORY, jkArmsRescue, JK_CAUSE_DAY, JK_DECOY_DAY, JK_MECH_CANDIDATES, jkClever, jkPro,
} from '../src/lib/stories/johanniskraut'
import { outcomeForLevel, stars, DEFAULT_CFG } from '../src/lib/flow'

let fails = 0
const ok = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) fails++
}
const c = DEFAULT_CFG

// --- data model legal vs LEVELS / down-only ---
ok('baseline primes below the band', JK_BASELINE < c.band_low)
ok('dose lands in the green window', JK_DOSE >= c.band_low && JK_DOSE <= c.band_high)
ok('read-the-body torso is visibly under the band', JK_READ_LEVEL < c.band_low)
ok('finale start is under the band, above the floor', JK_FINALE_START < c.band_low && JK_FINALE_START > JK_FLOOR)
ok('drain target sits under the floor (so the fall reaches it)', JK_DRAIN_TARGET < JK_FLOOR)
ok('floor + pro-min are under the band, pro-min above the floor', JK_FLOOR < c.band_low && JK_PRO_MIN < c.band_low && JK_PRO_MIN > JK_FLOOR)
ok('the Dienstag delay is a TRUE no-move (tick === 0)', JK_TICK_DELAY === 0)
ok('every "real" tick is visible on the slow pump (>=4)', JK_TICK_INDUCER >= 4 && JK_TICK_PENALTY >= 4)
// down-only: no exported level/target is above the window
ok('no level is ever above the band (down-only)', [JK_BASELINE, JK_DOSE, JK_READ_LEVEL, JK_FINALE_START, JK_DRAIN_TARGET, JK_PRO_MIN, ...JK_WEEK_DAYS.map((d) => d.level)].every((l) => l <= c.band_high))

// --- week data integrity ---
ok('seven days', JK_WEEK_DAYS.length === 7)
const causeDay = JK_WEEK_DAYS.find((d) => d.id === JK_CAUSE_DAY)!
ok('cause day (Di) has a herb card and inducerTick === DELAY (0)', causeDay.cards.some((k) => k.kind === 'herb') && causeDay.inducerTick === JK_TICK_DELAY)
ok('at least one LATE inducer day with a visible tick (5)', JK_WEEK_DAYS.some((d) => d.inducerTick === JK_TICK_INDUCER && d.cards.some((k) => k.kind === 'herb')))
ok('the decoy day (So) has NO herb card (back-date away from it)', !JK_WEEK_DAYS.find((d) => d.id === JK_DECOY_DAY)!.cards.some((k) => k.kind === 'herb'))
ok('every day carry level > floor', JK_WEEK_DAYS.every((d) => d.level > JK_FLOOR))
ok('the week ends under the band', JK_WEEK_DAYS[JK_WEEK_DAYS.length - 1].level < c.band_low)

// --- mechanism candidate set (inference, not a 7-day sweep) ---
ok('candidates include the cause + the decoy', JK_MECH_CANDIDATES.includes(JK_CAUSE_DAY) && JK_MECH_CANDIDATES.includes(JK_DECOY_DAY))
ok('candidates === [di,mi,fr,so] (length 4)', JK_MECH_CANDIDATES.length === 4 && JK_MECH_CANDIDATES.join(',') === 'di,mi,fr,so')
ok('every candidate id exists in the week', JK_MECH_CANDIDATES.every((id) => JK_WEEK_DAYS.some((d) => d.id === id)))

// --- finale actions ---
ok('two mandatory (cause+contact), one bonus (monitor), three baits', JK_FINALE_ACTIONS.filter((a) => a.kind === 'mandatory').length === 2 && JK_FINALE_ACTIONS.filter((a) => a.kind === 'bonus').length === 1 && JK_FINALE_ACTIONS.filter((a) => a.kind === 'bait').length === 3)
ok('mandatory slots are cause + contact; bonus is monitor', JK_FINALE_ACTIONS.filter((a) => a.kind === 'mandatory').map((a) => a.slot).sort().join(',') === 'cause,contact' && JK_FINALE_ACTIONS.find((a) => a.kind === 'bonus')!.slot === 'monitor')
ok('JK_MANDATORY === [absetzen,fachstelle]', JK_MANDATORY.join(',') === 'absetzen,fachstelle')

// --- decision → torso target → outcome consistency (down-only) ---
ok('the fall path is an under-loss', outcomeForLevel(JK_DRAIN_TARGET) === 'under' && outcomeForLevel(JK_FLOOR) === 'under')
ok('the rescue settle lands in the band (win)', outcomeForLevel(JK_DOSE) === 'win')
ok('read-the-body torso reads under (→ handeln right)', outcomeForLevel(JK_READ_LEVEL) === 'under')
// stop-the-fall rule: one mandatory action does NOT arm the rescue; both do
ok('one mandatory action does NOT arm the rescue', jkArmsRescue(['absetzen']) === false && jkArmsRescue(['fachstelle']) === false)
ok('both mandatory actions arm the rescue', jkArmsRescue(['absetzen', 'fachstelle']) === true)
// a bait burst stays above the drain target and never goes over the band
ok('a bait burst clamps >= drain target, never over the band', Math.max(JK_DRAIN_TARGET, JK_FINALE_START - JK_BAIT_BURST) >= JK_DRAIN_TARGET && JK_FINALE_START - JK_BAIT_BURST <= c.band_high)

// --- scoring traces (win / under; no over) ---
ok('flawless = 3★', stars(true, jkClever(1, 0, true, true), jkPro(true, 0, 50)) === 3)
ok('one false flag is forgiven (still 3★)', stars(true, jkClever(1, 1, true, true), jkPro(true, 0, 50)) === 3)
ok('two false flags lose the detective half = 2.5★', stars(true, jkClever(1, 2, true, true), jkPro(true, 0, 50)) === 2.5)
ok('one read/back-date stumble = 2.5★', stars(true, jkClever(1, 0, false, true), jkPro(true, 0, 50)) === 2.5)
ok('skipped the bonus leak = 2.5★', stars(true, jkClever(1, 0, true, true), jkPro(false, 0, 50)) === 2.5)
ok('one bait = 2.5★', stars(true, jkClever(1, 0, true, true), jkPro(true, 1, 50)) === 2.5)
ok('scraped win, both bonuses lost = 1★', stars(true, jkClever(0, 2, false, false), jkPro(false, 2, 40)) === 1)
ok('any loss (Abstoßung) = 0★', stars(false, 1, 1) === 0)
ok('no herb found → detective 0, back-date clean 0.5', jkClever(0, 0, true, true) === 0.5)
ok('pro halves missable', jkPro(false, 0, 50) === 0.5 && jkPro(true, 1, 50) === 0.5 && jkPro(true, 0, 40) === 0.5)
// over is unreachable
ok('no exported target produces an over outcome', ![JK_BASELINE, JK_DOSE, JK_READ_LEVEL, JK_FINALE_START, JK_DRAIN_TARGET, ...JK_WEEK_DAYS.map((d) => d.level)].some((l) => outcomeForLevel(l) === 'over'))

console.log(`\n${fails === 0 ? '✅ ALL PASS' : '❌ ' + fails + ' FAILED'}`)
process.exit(fails === 0 ? 0 : 1)
