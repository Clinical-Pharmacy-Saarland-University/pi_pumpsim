// Story „Die Antibiotika-Kur" (Adhärenz · Antibiotikum/Resistenz) — pure data + model.
// REWORK 2026-06-12 (guided teaching arc). The therapeutic window has a vivid meaning:
//   • green band  = wirksam — enough drug to kill the bacteria, not enough to harm the body
//   • below band  = below the „kill line" (MHK/MIC) — too weak; the toughest bacteria survive
//                   → if the course is cut short they multiply back and become RESISTANT
//   • above band  = zu viel — side effects, no extra benefit
// The arc teaches: doses ACCUMULATE to a steady state, a SKIP drops below the kill line, a
// „catch-up" DOUBLE overshoots, and STOPPING early lets the survivors rebound resistant.
//
// The on-screen curve is a REAL one-compartment oral PK simulation (Bateman superposition of
// daily doses → smooth absorb/eliminate saw-tooth), not hand-drawn segments. The physical pump
// (driveTo) follows scalar anchor levels on the torso's 0..100 scale; the curve is the matching
// blood-vs-time graphic on its own normalised concentration axis. No RNG (sim-/Pi-stable).
import { LEVELS, type Outcome } from '../flow'

// ── torso anchor levels for the course (0..100 scale; band [55,70], crit [35,80]) ──
export const ADH_EMPTY = LEVELS.start // 20 — untreated; the body is full of bacteria
export const ADH_KILL_LINE = LEVELS.bandLow // 55 — below this the antibiotic is too weak to kill (the MIC)
export const ADH_STEADY = LEVELS.dose // 62 — steady state, in the green band: effective + safe
export const ADH_SKIP_LOW = 46 // a missed dose drops here: below the kill line, well above the floor
export const ADH_DOUBLE_HIGH = 78 // a „catch-up" double overshoots: above the band, below crit → side effects, survives
export const ADH_STOP_LOW = 28 // course stopped early: the level falls below the floor → bacteria rebound

// Torso (pump) targets per scenario — the driveTo path the physical tank follows.
export const ADH_TRACK_ACCUM = [20, 40, 56, 62] // build up over 3 doses, into the band (steady state)
export const ADH_TRACK_STOP = [62, 48, 36, 28] // stopped early: the level slides below the floor over days

// ════════════════════════════════════════════════════════════════════════════════════
//  Real one-compartment oral PK (Bateman): C(t) = Σ_doses D·ka/(ka−ke)·(e^−ke·Δt − e^−ka·Δt)
//  Daily dosing at t = day index. Concentrations are normalised (PK_REF = steady peak = 1.0).
// ════════════════════════════════════════════════════════════════════════════════════
export interface PkParams {
  ka: number // first-order absorption rate (1/day)
  ke: number // first-order elimination rate (1/day)
  perDay: number // curve samples per day
}
export const PK: PkParams = { ka: 2.5, ke: 1.1, perDay: 24 } // t½ ≈ 0.63 d — clean accumulating saw-tooth
export const PK_DAYS = 7

// daily dose vectors (amount per day; 0 = skipped) feeding the SAME model per scenario
export const PK_DOSE_FULL = [1, 1, 1, 1, 1, 1, 1] // the correct, completed course (accumulate / cure)
export const PK_DOSE_SKIP = [1, 1, 1, 1, 0] // day 4 forgotten → the trough decays below the MIC
export const PK_DOSE_DOUBLE = [1, 1, 1, 1, 0, 2] // …then „caught up" with a double → a peak over the toxic line
export const PK_DOSE_STOP = [1, 1, 1, 1, 0, 0, 0] // stopped after day 3 → decays away to near zero

/** single-dose Bateman unit response at elapsed time dt (days). */
function bateman(dt: number, ka: number, ke: number): number {
  if (dt < 0) return 0
  if (Math.abs(ka - ke) < 1e-6) return ka * dt * Math.exp(-ke * dt)
  return (ka / (ka - ke)) * (Math.exp(-ke * dt) - Math.exp(-ka * dt))
}
/** concentration time-course for a daily dose vector, sampled at PK.perDay resolution. */
export function pkSamples(doses: number[], p: PkParams = PK): { t: number; c: number }[] {
  const steps = doses.length * p.perDay
  const out: { t: number; c: number }[] = []
  for (let s = 0; s <= steps; s++) {
    const t = s / p.perDay
    let c = 0
    for (let d = 0; d < doses.length; d++) if (doses[d] > 0 && t >= d) c += doses[d] * bateman(t - d, p.ka, p.ke)
    out.push({ t, c })
  }
  return out
}

// normalise so the steady-state peak of the completed course = 1.0
const _full = pkSamples(PK_DOSE_FULL)
export const PK_REF = Math.max(..._full.map((s) => s.c))
/** normalised concentration time-course (peak of the full course ≈ 1.0). */
export function pkTrace(doses: number[], p: PkParams = PK): { t: number; c: number }[] {
  return pkSamples(doses, p).map((s) => ({ t: s.t, c: s.c / PK_REF }))
}

// therapeutic window on the normalised axis. Tuned (see sim) so the completed course's steady
// troughs (~0.72) sit above the MIC and its peaks (~1.0) below the toxic line; a skipped-dose
// trough (~0.28) dips below the MIC and a „catch-up" double peak (~1.19) crosses the toxic line.
export const PK_MIC = 0.55 // kill line (lower band edge)
export const PK_TOX = 1.1 // toxic line (upper band edge)
export const PK_YMAX = 1.4 // top of the plot's concentration axis

// ── PK plot geometry ──
export const ADH_PLOT = { w: 720, h: 250, top: 20, bot: 198, left: 40, right: 700 }
/** normalised concentration → y (inverted, clamped to the plot area). */
export function pkY(c: number): number {
  const v = Math.max(0, Math.min(PK_YMAX, c))
  return ADH_PLOT.bot - (v / PK_YMAX) * (ADH_PLOT.bot - ADH_PLOT.top)
}
/** time (days) within a window [t0,t1] → x across the plot. */
export function pkX(t: number, t0: number, t1: number): number {
  if (t1 <= t0) return ADH_PLOT.left
  const f = Math.max(0, Math.min(1, (t - t0) / (t1 - t0)))
  return ADH_PLOT.left + f * (ADH_PLOT.right - ADH_PLOT.left)
}
/** SVG polyline `points` for a trace, clipped to a [t0,t1] window and revealed up to revealT. */
export function pkPolyline(trace: { t: number; c: number }[], t0: number, t1: number, revealT: number): string {
  return trace
    .filter((s) => s.t >= t0 - 1e-9 && s.t <= Math.min(t1, revealT) + 1e-9)
    .map((s) => `${pkX(s.t, t0, t1).toFixed(1)},${pkY(s.c).toFixed(1)}`)
    .join(' ')
}

// ── bacteria petri (the visible enemy) ──
// A fixed starting colony (no RNG). The two `tough` ones are the survivors that cling on at
// the kill line and — if the course is cut short — multiply into the resistant colony below.
export interface Bug {
  id: string
  x: number // % position in the petri
  y: number
  tough?: boolean
}
export const ADH_BUGS: Bug[] = [
  { id: 'b1', x: 24, y: 30 },
  { id: 'b2', x: 42, y: 20 },
  { id: 'b3', x: 60, y: 28 },
  { id: 'b4', x: 76, y: 40 },
  { id: 'b5', x: 30, y: 58 },
  { id: 'b6', x: 50, y: 70 },
  { id: 'b7', x: 70, y: 60 },
  { id: 'b8', x: 16, y: 46 },
  { id: 't1', x: 44, y: 46, tough: true },
  { id: 't2', x: 64, y: 50, tough: true },
]
// the resistant bloom (deterministic positions) shown when the course is stopped early
export const ADH_RESISTANT: Bug[] = [
  { id: 'r1', x: 30, y: 26 },
  { id: 'r2', x: 52, y: 20 },
  { id: 'r3', x: 72, y: 30 },
  { id: 'r4', x: 22, y: 44 },
  { id: 'r5', x: 38, y: 60 },
  { id: 'r6', x: 58, y: 64 },
  { id: 'r7', x: 78, y: 52 },
  { id: 'r8', x: 48, y: 40 },
]

/**
 * How many of the starting colony are still alive at a given level:
 *  • in/above the band the antibiotic kills them off (only the 2 tough ones cling on at steady state);
 *  • below the kill line it is too weak — the survivors hang on.
 * Monotonically non-increasing as the level rises into the band; used for the accumulation beat.
 */
export function bugsAliveAt(level: number, total: number = ADH_BUGS.length): number {
  const tough = ADH_BUGS.filter((b) => b.tough).length
  if (level < ADH_KILL_LINE) return total // too weak to kill → all survive
  const span = ADH_STEADY - ADH_KILL_LINE // 55 → 62
  const over = span > 0 ? Math.min(1, (level - ADH_KILL_LINE) / span) : 1
  return Math.max(tough, Math.round(total - (total - tough) * over))
}

// ── the three teaching questions (each: exactly one correct; distractors target a REAL
// misconception). The correct option is deliberately NOT always first. ──
export interface AdhQOpt {
  id: string
  labelKey: string
  fbKey: string
  correct: boolean
  adultOnly?: boolean
}

// Q1 (after accumulation): why a dose every day instead of one big dose? (correct = 2nd)
export const ADH_Q1: AdhQOpt[] = [
  { id: 'blast', labelKey: 'adh.q1.blast', fbKey: 'adh.q1.fb.blast', correct: false },
  { id: 'steady', labelKey: 'adh.q1.steady', fbKey: 'adh.q1.fb.steady', correct: true },
  { id: 'ration', labelKey: 'adh.q1.ration', fbKey: 'adh.q1.fb.ration', correct: false },
]
// Q2 (after a skipped dose): what should Jonas do? (correct = 3rd)
export const ADH_Q2: AdhQOpt[] = [
  { id: 'double', labelKey: 'adh.q2.double', fbKey: 'adh.q2.fb.double', correct: false },
  { id: 'stop', labelKey: 'adh.q2.stop', fbKey: 'adh.q2.fb.stop', correct: false },
  { id: 'normal', labelKey: 'adh.q2.normal', fbKey: 'adh.q2.fb.normal', correct: true },
]
// Q3 (after the resistance bloom): why is stopping early dangerous? (correct = 2nd)
export const ADH_Q3: AdhQOpt[] = [
  { id: 'tolerance', labelKey: 'adh.q3.tolerance', fbKey: 'adh.q3.fb.tolerance', correct: false },
  { id: 'resist', labelKey: 'adh.q3.resist', fbKey: 'adh.q3.fb.resist', correct: true },
  { id: 'allDead', labelKey: 'adh.q3.alldead', fbKey: 'adh.q3.fb.alldead', correct: false },
]

/** options for the current age group (drops adult-only profi-traps for the kids' register). */
export function adhOptionsFor(opts: AdhQOpt[], adult: boolean): AdhQOpt[] {
  return opts.filter((o) => adult || !o.adultOnly)
}

// ── scoring (always a teaching WIN at the end; the stars grade comprehension) ──
// clever (0.5/1) = the conceptual Q1; pro (0/0.5/1) = the two safety decisions Q2 + Q3.
/** Q1 right first try = 1; needed a second try = 0.5 (the beat is gated, so never 0). */
export function adhCleverGrade(q1Stumbled: boolean): number {
  return q1Stumbled ? 0.5 : 1
}
/** Q2+Q3: 0 stumbles = 1, one = 0.5, both = 0. */
export function adhProGrade(stumbles: number): number {
  return [1, 0.5, 0][Math.min(2, Math.max(0, stumbles))]
}

// the story always reaches the cure (guided teach) → the outcome is always a win.
export const ADH_OUTCOME: Outcome = 'win'
