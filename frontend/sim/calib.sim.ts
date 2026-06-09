// Headless checks for the calibration math. Run: npx tsx sim/calib.sim.ts
import { mlPerSec, meanMlPerSec, round1, buildCalibration, FLOW_TARGETS } from '../src/lib/calib'

let fails = 0
const ok = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) fails++
}

ok('600 ml over 30 s = 20 ml/s', mlPerSec(600, 30) === 20)
ok('zero duration -> 0 (no div-by-zero)', mlPerSec(600, 0) === 0)
ok('negative duration -> 0', mlPerSec(600, -5) === 0)
ok('NaN volume -> 0', mlPerSec(NaN, 30) === 0)
ok('negative volume clamped -> 0', mlPerSec(-100, 30) === 0)

ok('round1 rounds to one decimal', round1(19.96) === 20 && round1(2.34) === 2.3)

ok(
  'mean of 600/610/590 over 30 s ≈ 20',
  round1(
    meanMlPerSec([
      { volumeMl: 600, seconds: 30 },
      { volumeMl: 610, seconds: 30 },
      { volumeMl: 590, seconds: 30 },
    ]),
  ) === 20,
)
ok('mean ignores bad samples', meanMlPerSec([{ volumeMl: 300, seconds: 0 }]) === 0)

// --- buildCalibration -------------------------------------------------------
const cal = buildCalibration(0.2, 0.25, [
  { dir: 'in', duty: 1.0, ml_per_s: 8.5 },
  { dir: 'out', duty: 1.0, ml_per_s: 6.0 },
  { dir: 'in', duty: 0.6, ml_per_s: 4.8 },
])
ok('rate_in taken from in@100%', cal.rate_in === 8.5)
ok('rate_out taken from out@100%', cal.rate_out === 6.0)
ok('deadbands preserved', cal.deadband_in === 0.2 && cal.deadband_out === 0.25)
ok('samples preserved', cal.samples.length === 3)
ok('dead_space_ml defaults to null', cal.dead_space_ml === null)
ok('dead_space_ml passed through', buildCalibration(null, null, [], 12.5).dead_space_ml === 12.5)
ok('rate null when no 100% sample', buildCalibration(null, null, [{ dir: 'in', duty: 0.6, ml_per_s: 4 }]).rate_in === null)
ok('FLOW_TARGETS covers both directions at 100%', FLOW_TARGETS.some((t) => t.dir === 'in' && t.duty === 1) && FLOW_TARGETS.some((t) => t.dir === 'out' && t.duty === 1))

console.log(`\n${fails === 0 ? '✅ ALL PASS' : '❌ ' + fails + ' FAILED'}`)
process.exit(fails === 0 ? 0 : 1)
