// Headless checks for the calibration math. Run: npx tsx sim/calib.sim.ts
import { mlPerSec, meanMlPerSec, round1 } from '../src/lib/calib'

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

console.log(`\n${fails === 0 ? '✅ ALL PASS' : '❌ ' + fails + ' FAILED'}`)
process.exit(fails === 0 ? 0 : 1)
