// Headless "play via code" for „Die Antibiotika-Kur" (adherence). Run: npx tsx sim/adherence.sim.ts
// Guided teaching arc: accumulate to steady state → Q1 → skipped dose → Q2 → „nachholen" double
// (overshoot) → stop-early RESISTANCE bloom → Q3 → finish the course. Asserts the torso anchors,
// the REAL one-compartment PK model (band split per scenario), the bacteria-kill helper, the three
// questions (incl. correct option NOT always first), and scoring.
import {
  ADH_EMPTY, ADH_KILL_LINE, ADH_STEADY, ADH_SKIP_LOW, ADH_DOUBLE_HIGH, ADH_STOP_LOW,
  ADH_TRACK_ACCUM, ADH_TRACK_STOP,
  PK, PK_DOSE_FULL, PK_DOSE_SKIP, PK_DOSE_DOUBLE, PK_DOSE_STOP,
  PK_MIC, PK_TOX, PK_YMAX, pkTrace, pkPolyline, pkX, pkY, ADH_PLOT,
  ADH_BUGS, ADH_RESISTANT, bugsAliveAt,
  ADH_Q1, ADH_Q2, ADH_Q3, adhOptionsFor, adhCleverGrade, adhProGrade, ADH_OUTCOME,
} from '../src/lib/stories/adherence'
import { outcomeForLevel, stars, DEFAULT_CFG, LEVELS } from '../src/lib/flow'

let fails = 0
const ok = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) fails++
}
const c = DEFAULT_CFG
const strictlyUp = (a: number[]) => a.every((v, i) => i === 0 || v > a[i - 1])
const strictlyDown = (a: number[]) => a.every((v, i) => i === 0 || v < a[i - 1])
const wMax = (tr: { t: number; c: number }[], a: number, b: number) => Math.max(...tr.filter((s) => s.t >= a && s.t <= b).map((s) => s.c))
const wMin = (tr: { t: number; c: number }[], a: number, b: number) => Math.min(...tr.filter((s) => s.t >= a && s.t <= b).map((s) => s.c))

// --- torso anchor levels legal vs the band/critical lines ---
ok('empty === LEVELS.start, below the band', ADH_EMPTY === LEVELS.start && ADH_EMPTY < c.band_low)
ok('kill line === band_low (the MIC edge)', ADH_KILL_LINE === LEVELS.bandLow)
ok('steady === LEVELS.dose, in the green band → win', ADH_STEADY === LEVELS.dose && outcomeForLevel(ADH_STEADY) === 'win')
ok('skip-low below the kill line, above the floor → under', ADH_SKIP_LOW < ADH_KILL_LINE && ADH_SKIP_LOW > c.critical_low && outcomeForLevel(ADH_SKIP_LOW) === 'under')
ok('double-high above band, below crit (overshoot survives) → over', ADH_DOUBLE_HIGH > c.band_high && ADH_DOUBLE_HIGH < c.critical_high && outcomeForLevel(ADH_DOUBLE_HIGH) === 'over')
ok('stop-low below the floor → under', ADH_STOP_LOW < c.critical_low && outcomeForLevel(ADH_STOP_LOW) === 'under')
ok('accum torso track climbs empty → steady in the band', ADH_TRACK_ACCUM[0] === ADH_EMPTY && strictlyUp(ADH_TRACK_ACCUM) && ADH_TRACK_ACCUM[ADH_TRACK_ACCUM.length - 1] === ADH_STEADY)
ok('accum first dose still below the band (one dose is not enough)', ADH_TRACK_ACCUM[1] < c.band_low)
ok('stop torso track: steady → strictly down → below the floor', ADH_TRACK_STOP[0] === ADH_STEADY && strictlyDown(ADH_TRACK_STOP) && ADH_TRACK_STOP[ADH_TRACK_STOP.length - 1] <= c.critical_low)

// --- the real one-compartment PK model + band split per scenario ---
ok('band lines ordered: 0 < MIC < TOX < YMAX', 0 < PK_MIC && PK_MIC < PK_TOX && PK_TOX < PK_YMAX)
ok('PK params sane (ka > ke > 0, samples/day ≥ 8)', PK.ka > PK.ke && PK.ke > 0 && PK.perDay >= 8)
const full = pkTrace(PK_DOSE_FULL)
ok('full course normalised peak ≈ 1.0', Math.abs(wMax(full, 0, PK_DAYS_END()) - 1) < 0.05)
ok('full course: ONE dose is not enough (day-0 trough below MIC)', wMin(full, 0, 0.99) < PK_MIC)
ok('full course accumulates INTO the band by ~day 2 (trough above MIC)', wMin(full, 2, 2.99) > PK_MIC)
ok('full course steady state sits in the band (trough > MIC, peak < TOX)', wMin(full, 5, 5.99) > PK_MIC && wMax(full, 5, 5.99) < PK_TOX)
const skip = pkTrace(PK_DOSE_SKIP)
ok('skip: the forgotten-dose trough dips below the MIC', wMin(skip, 4, 5) < PK_MIC)
const dbl = pkTrace(PK_DOSE_DOUBLE)
ok('double: the catch-up peak crosses the toxic line', wMax(dbl, 5, 6) > PK_TOX)
const stop = pkTrace(PK_DOSE_STOP)
ok('stop: decays far below the MIC and stays', stop[stop.length - 1].c < PK_MIC * 0.5)
ok('pkY inverted + clamped (higher conc → smaller y)', pkY(PK_MIC) > pkY(PK_TOX) && pkY(99) >= ADH_PLOT.top && pkY(-9) <= ADH_PLOT.bot)
ok('pkX maps a [t0,t1] window across the plot, monotonic', pkX(3, 3, 5) === ADH_PLOT.left && pkX(5, 3, 5) === ADH_PLOT.right && pkX(4.5, 3, 5) > pkX(3.5, 3, 5))
ok('pkPolyline reveals only up to revealT', pkPolyline(full, 0, 3, 1).split(' ').length < pkPolyline(full, 0, 3, 3).split(' ').length)

// --- bacteria kill helper ---
ok('exactly 10 bugs, 2 tough, distinct ids', ADH_BUGS.length === 10 && ADH_BUGS.filter((b) => b.tough).length === 2 && new Set(ADH_BUGS.map((b) => b.id)).size === 10)
ok('resistant bloom is non-empty with its own ids', ADH_RESISTANT.length > 0 && new Set([...ADH_BUGS, ...ADH_RESISTANT].map((b) => b.id)).size === ADH_BUGS.length + ADH_RESISTANT.length)
ok('below the kill line nothing dies (all alive)', bugsAliveAt(ADH_EMPTY) === ADH_BUGS.length && bugsAliveAt(ADH_KILL_LINE - 1) === ADH_BUGS.length)
ok('at steady state only the 2 tough cling on', bugsAliveAt(ADH_STEADY) === 2)
ok('kill is monotonic non-increasing as the level rises', [20, 40, 50, 55, 58, 60, 62, 80].every((l, i, a) => i === 0 || bugsAliveAt(l) <= bugsAliveAt(a[i - 1])))
ok('never kills below the tough floor', [55, 60, 62, 70, 90].every((l) => bugsAliveAt(l) >= 2))

// --- the three teaching questions ---
for (const [name, q] of [['Q1', ADH_Q1], ['Q2', ADH_Q2], ['Q3', ADH_Q3]] as const) {
  ok(`${name}: exactly one correct option`, q.filter((o) => o.correct).length === 1)
  ok(`${name}: three options, distinct ids + label/feedback keys`, q.length === 3 && new Set(q.map((o) => o.id)).size === 3 && q.every((o) => o.labelKey && o.fbKey))
}
ok('Q1 correct = „steady"', ADH_Q1.find((o) => o.correct)!.id === 'steady')
ok('Q2 correct = „normal"', ADH_Q2.find((o) => o.correct)!.id === 'normal')
ok('Q3 correct = „resist"', ADH_Q3.find((o) => o.correct)!.id === 'resist')
ok('the correct option is NOT always first', !(ADH_Q1[0].correct && ADH_Q2[0].correct && ADH_Q3[0].correct) && ADH_Q1.findIndex((o) => o.correct) > 0)
ok('adhOptionsFor drops adult-only traps for kids', adhOptionsFor(ADH_Q2, false).every((o) => !o.adultOnly) && adhOptionsFor(ADH_Q2, true).length >= adhOptionsFor(ADH_Q2, false).length)

// --- scoring (always a teaching win; stars grade comprehension) ---
ok('the arc always reaches a win', ADH_OUTCOME === 'win')
ok('cleverGrade: first-try Q1 = 1, second try = 0.5', adhCleverGrade(false) === 1 && adhCleverGrade(true) === 0.5)
ok('proGrade: 0/1/2 stumbles → 1/0.5/0', adhProGrade(0) === 1 && adhProGrade(1) === 0.5 && adhProGrade(2) === 0)
ok('flawless (no stumble) = 3★', stars(true, adhCleverGrade(false), adhProGrade(0)) === 3)
ok('one Q1 slip = 2.5★', stars(true, adhCleverGrade(true), adhProGrade(0)) === 2.5)
ok('one safety-question slip = 2.5★', stars(true, adhCleverGrade(false), adhProGrade(1)) === 2.5)
ok('stumbled every question = 1.5★ (still a teaching win)', stars(true, adhCleverGrade(true), adhProGrade(2)) === 1.5)

console.log(`\n${fails === 0 ? '✅ ALL PASS' : '❌ ' + fails + ' FAILED'}`)
process.exit(fails === 0 ? 0 : 1)

function PK_DAYS_END(): number { return PK_DOSE_FULL.length }
