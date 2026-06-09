// Pure calibration math for the admin panel (no Svelte runes -> unit-testable).
// Run the checks with:  npx tsx sim/calib.sim.ts

/** Flow rate in ml/s from a measured volume over a duration. Safe on bad input. */
export function mlPerSec(volumeMl: number, seconds: number): number {
  if (!Number.isFinite(volumeMl) || !Number.isFinite(seconds) || seconds <= 0) return 0
  return Math.max(0, volumeMl) / seconds
}

/** Mean ml/s across repeated measurements (ignores invalid / zero samples). */
export function meanMlPerSec(samples: Array<{ volumeMl: number; seconds: number }>): number {
  const rates = samples.map((s) => mlPerSec(s.volumeMl, s.seconds)).filter((r) => r > 0)
  if (rates.length === 0) return 0
  return rates.reduce((a, b) => a + b, 0) / rates.length
}

/** Round to 1 decimal (for display). */
export function round1(x: number): number {
  return Math.round(x * 10) / 10
}
