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

/** Stars (0–3): base for a win + a "clever" star + a "pro" star. 0 on any loss. */
export function stars(win: boolean, clever: boolean, pro: boolean): number {
  if (!win) return 0
  return 1 + (clever ? 1 : 0) + (pro ? 1 : 0)
}
