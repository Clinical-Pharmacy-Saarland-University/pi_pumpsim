// Pure, framework-agnostic flow helpers shared by the story play-components and by
// the headless tsx simulations (so we can "play via code"). No Svelte runes here.

export interface LevelCfg {
  band_low: number
  band_high: number
  critical_high: number
  critical_low: number
  baseline: number
}

export const DEFAULT_CFG: LevelCfg = {
  band_low: 55,
  band_high: 70,
  critical_high: 80,
  critical_low: 35,
  baseline: 40,
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
 * Snaps to the defined rungs (loss=0, then 1.0/1.5/2.0/2.5/3.0 → ×10). t()
 * resolves the age register (kid vs. adult) on top.
 */
export function rankKey(score: number): string {
  const tenths = Math.max(0, Math.min(30, Math.round(score * 10)))
  const rung =
    tenths === 0 ? 0 : tenths <= 10 ? 10 : tenths <= 15 ? 15 : tenths <= 20 ? 20 : tenths <= 25 ? 25 : 30
  return `rank.${rung}`
}

/** Format a star score for display: German decimal comma, trailing ".0" dropped. */
export function formatStars(score: number): string {
  return (Number.isInteger(score) ? String(score) : score.toFixed(1)).replace('.', ',')
}
