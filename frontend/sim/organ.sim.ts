// Headless "play via code" for „Der müde Filter" (organ). Run: npx tsx sim/organ.sim.ts
// Torso-first v2: cold-start twist (same dose now rises) → detective (stillness=harmlos, cause
// staut UP) → live-cut (tap reduzieren mid-rise) → filter plan. Asserts the data model + the
// decision→torso→outcome→stars, incl. the !baited clause that keeps `pro` missable on a win.
import {
  ORGAN_BASE, ORGAN_DOSE, ORGAN_DRIFT, ORGAN_CONFIRM, ORGAN_LIVE_START, ORGAN_OVER, ORGAN_UNDER,
  ORGAN_TRAP_WARN, ORGAN_DETECT, ORGAN_TAPS, ORGAN_PLAN, organClever, organPro,
} from '../src/lib/stories/organ'
import { outcomeForLevel, stars, DEFAULT_CFG } from '../src/lib/flow'

let fails = 0
const ok = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) fails++
}
const c = DEFAULT_CFG

// --- data model legal vs LEVELS ---
ok('dose 62 lands in the green band (win target)', ORGAN_DOSE >= c.band_low && ORGAN_DOSE <= c.band_high)
ok('demo caps stay below the top tape (no trip)', ORGAN_DRIFT < c.critical_high && ORGAN_CONFIRM < c.critical_high && ORGAN_TRAP_WARN < c.critical_high && ORGAN_LIVE_START < c.critical_high)
ok('drift + live-start are clearly over the window', ORGAN_DRIFT > c.band_high && ORGAN_LIVE_START > c.band_high)
ok('the stau-confirmation rises ABOVE the drift', ORGAN_CONFIRM > ORGAN_DRIFT)
ok('over-loss crosses the top tape (>=80)', ORGAN_OVER >= c.critical_high)
ok('under-loss under green w/ ≥5 margin, on/over baseline, above crit-low', ORGAN_UNDER < c.band_low && c.band_low - ORGAN_UNDER >= 5 && ORGAN_UNDER > ORGAN_BASE && ORGAN_UNDER > c.critical_low)
ok('baseline is the live engine baseline (42)', ORGAN_BASE === 42)

// --- detective list ---
ok('exactly one correct cause', ORGAN_DETECT.filter((d) => d.correct).length === 1)
ok('the cause is the kidney', ORGAN_DETECT.find((d) => d.correct)!.id === 'kidney')
ok('three baits', ORGAN_DETECT.filter((d) => !d.correct).length === 3)

// --- taps: decision → torso target → outcome consistency ---
for (const tap of ORGAN_TAPS) {
  ok(`tap ${tap.id}: result '${tap.result}' matches torso target ${tap.target}`, outcomeForLevel(tap.target) === tap.result)
}
ok('exactly one win/under/over tap', ORGAN_TAPS.filter((t) => t.result === 'win').length === 1 && ORGAN_TAPS.filter((t) => t.result === 'under').length === 1 && ORGAN_TAPS.filter((t) => t.result === 'over').length === 1)
ok('win tap === dose (in band); over tap === ORGAN_OVER; under tap === ORGAN_UNDER', ORGAN_TAPS.find((t) => t.id === 'reduce')!.target === ORGAN_DOSE && ORGAN_TAPS.find((t) => t.id === 'full')!.target === ORGAN_OVER && ORGAN_TAPS.find((t) => t.id === 'pause')!.target === ORGAN_UNDER)
ok('pause is adult-only; reduce/full are not', ORGAN_TAPS.find((t) => t.id === 'pause')!.adultOnly === true && !ORGAN_TAPS.find((t) => t.id === 'reduce')!.adultOnly && !ORGAN_TAPS.find((t) => t.id === 'full')!.adultOnly)
ok('young set still has a win and an over (kids can win AND lose)', (() => { const y = ORGAN_TAPS.filter((t) => !t.adultOnly); return y.some((t) => t.result === 'win') && y.some((t) => t.result === 'over') })())

// --- plan cards ---
ok('exactly one trap card, two safe', ORGAN_PLAN.filter((c) => c.trap).length === 1 && ORGAN_PLAN.filter((c) => !c.trap).length === 2)

// --- scoring grades ---
ok('organClever 0/1/2 → 1/0.5/0', organClever(0) === 1 && organClever(1) === 0.5 && organClever(2) === 0)
ok('organPro halves', organPro(true, true) === 1 && organPro(true, false) === 0.5 && organPro(false, true) === 0.5 && organPro(false, false) === 0)

// --- full playthrough traces (the !baited clause keeps pro missable on a win) ---
function play(tapId: string, wrongGuesses: number, finaleClean: boolean, baited = false) {
  const tap = ORGAN_TAPS.find((t) => t.id === tapId)!
  const out = outcomeForLevel(tap.target)
  const timely = out === 'win' && !baited
  return { out, target: tap.target, stars: stars(out === 'win', organClever(wrongGuesses), organPro(timely, finaleClean)) }
}
ok('WIN flawless (kidney-first, no bait, clean plan) → 62, win, 3.0★', (() => { const r = play('reduce', 0, true, false); return r.target === 62 && r.out === 'win' && r.stars === 3 })())
ok('WIN one detective stumble → 2.5★', play('reduce', 1, true, false).stars === 2.5)
ok('WIN clean detective + relapse trap → 2.5★', play('reduce', 0, false, false).stars === 2.5)
ok('WIN baited (then caught) → 2.5★ (pro missable on a win!)', play('reduce', 0, true, true).stars === 2.5)
ok('WIN baited + relapse trap → 2.0★ (no auto-3★ path)', play('reduce', 0, false, true).stars === 2)
ok('WIN scraped (2 wrong + bait + trap) → 1.0★', play('reduce', 2, false, true).stars === 1)
ok('OVER (voller Hahn) → 86, over, 0★', (() => { const r = play('full', 0, true, false); return r.target === 86 && r.out === 'over' && r.stars === 0 })())
ok('UNDER (ganz zu) → 46, under, 0★', (() => { const r = play('pause', 0, true, false); return r.target === 46 && r.out === 'under' && r.stars === 0 })())
ok('any loss = 0★', stars(false, 1, 1) === 0)

console.log(`\n${fails === 0 ? '✅ ALL PASS' : '❌ ' + fails + ' FAILED'}`)
process.exit(fails === 0 ? 0 : 1)
