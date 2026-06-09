// Pure calibration math + types for the admin panel (no Svelte runes -> testable).
// Run the checks with:  npx tsx sim/calib.sim.ts

export type Dir = 'in' | 'out'

export interface CalibSample {
  dir: Dir
  duty: number // 0..1
  ml_per_s: number
}

export interface Calibration {
  deadband_in: number | null
  deadband_out: number | null
  rate_in: number | null
  rate_out: number | null
  dead_space_ml: number | null
  samples: CalibSample[]
}

/** Flow-measurement targets the wizard walks through (duty as a 0..1 fraction). */
export const FLOW_TARGETS: { dir: Dir; duty: number }[] = [
  { dir: 'in', duty: 1.0 },
  { dir: 'out', duty: 1.0 },
  { dir: 'in', duty: 0.6 },
  { dir: 'out', duty: 0.6 },
]

/** Assemble a Calibration; rate_in/out are taken from the 100%-duty samples. */
export function buildCalibration(
  deadbandIn: number | null,
  deadbandOut: number | null,
  samples: CalibSample[],
  deadSpaceMl: number | null = null,
): Calibration {
  const at100 = (d: Dir) =>
    samples.find((s) => s.dir === d && s.duty >= 0.999)?.ml_per_s ?? null
  return {
    deadband_in: deadbandIn,
    deadband_out: deadbandOut,
    rate_in: at100('in'),
    rate_out: at100('out'),
    dead_space_ml: deadSpaceMl,
    samples,
  }
}


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
