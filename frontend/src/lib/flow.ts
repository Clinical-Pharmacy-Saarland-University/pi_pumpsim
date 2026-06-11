// Pure, framework-agnostic flow helpers shared by the story play-components and by
// the headless tsx simulations (so we can "play via code"). No Svelte runes here.

export interface LevelCfg {
  band_low: number
  band_high: number
  critical_high: number
  critical_low: number
  baseline: number
}

// ── THE single source of truth for the torso level model (0–100) ──────────────
// These exact values are TAPED on the physical torso (the green band + the two red
// lines) and define where the pump is PREPARED before every scenario. Every story
// imports `LEVELS` instead of hardcoding its own start/dose/band. Change them HERE
// and in the backend `LevelConfig` (backend/app/game/controller.py) TOGETHER — the
// two must always match, because the backend drives the real pump and the marks.
export const LEVELS = {
  start: 20, // prepare-patient: torso reset level, well below the band (patient ungeschützt)
  bandLow: 55, // lower green tape — start of the therapeutic window
  bandHigh: 70, // upper green tape — end of the therapeutic window
  dose: 62, // a correct standard dose lands here (inside the band)
  critLow: 35, // lower red line — too little (ineffective / under)
  critHigh: 80, // upper red line — too much (toxic / over)
} as const

export const DEFAULT_CFG: LevelCfg = {
  band_low: LEVELS.bandLow,
  band_high: LEVELS.bandHigh,
  critical_high: LEVELS.critHigh,
  critical_low: LEVELS.critLow,
  baseline: LEVELS.start,
}

export type Outcome = 'win' | 'over' | 'under'

/** Where did the settled level land? in band = win, above = over(dose), below = under(dose). */
export function outcomeForLevel(level: number, c: LevelCfg = DEFAULT_CFG): Outcome {
  if (level > c.band_high) return 'over'
  if (level < c.band_low) return 'under'
  return 'win'
}

/**
 * Stars (0–3, in 0.5 steps): 1 for a win + a "clever" and a "pro" bonus. Each
 * bonus is earned fully (1), partly (0.5 — a stumble: a retry / one wrong tap) or
 * not at all (0) — that 0.5 is what produces HALF stars. 0 on any loss.
 *   3.0 = flawless · 2.5 = one small stumble · … · 1.0 = scraped the win.
 */
export function stars(win: boolean, clever: number, pro: number): number {
  if (!win) return 0
  return 1 + clever + pro
}

/**
 * Locale key for the rank TITLE shown next to the stars, from a star score.
 * 0.5-star wins deliberately have no named rank; callers can hide the title via
 * hasRankTitle(). Losses use rank.0 explicitly.
 */
export function rankKey(score: number): string {
  const tenths = Math.max(0, Math.min(30, Math.round(score * 10)))
  const rung = tenths < 10 ? 0 : tenths <= 10 ? 10 : tenths <= 15 ? 15 : tenths <= 20 ? 20 : tenths <= 25 ? 25 : 30
  return `rank.${rung}`
}

export function hasRankTitle(score: number): boolean {
  return Math.round(score * 10) >= 10
}

/** Format a star score for display: German decimal comma, trailing ".0" dropped. */
export function formatStars(score: number): string {
  return (Number.isInteger(score) ? String(score) : score.toFixed(1)).replace('.', ',')
}
