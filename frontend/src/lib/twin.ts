// In-browser "torso twin" for the web demo build (VITE_TWIN=browser): a TypeScript port
// of the backend's LevelController (backend/app/game/controller.py) plus the slice of
// LevelRunner (backend/app/game/runner.py) the game needs — calibrated pump pacing,
// reset and the between-runs prepare. No Pi, no pump, no backend: the twin IS the torso.
// Pure (no Svelte runes, no DOM) so the headless sim (sim/twin.sim.ts) can drive it.
import type { LevelState, Zone } from './types'

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const round = (v: number, dp: number) => Math.round(v * 10 ** dp) / 10 ** dp

// Mirrors backend LevelConfig (and the frontend LEVELS in flow.ts) — keep in lockstep.
export interface LevelConfig {
  capacity: number
  baseline: number
  band_low: number
  band_high: number
  critical_high: number
  critical_low: number
  rate: number // units/s — the game's default pace
}

export const DEFAULT_LEVEL_CONFIG: LevelConfig = {
  capacity: 100,
  baseline: 20,
  band_low: 55,
  band_high: 70,
  critical_high: 80,
  critical_low: 35,
  rate: 4,
}

// The committed pump calibration (backend/app/game/calibration.py DEFAULT): full-duty
// flow per direction and the torso volume. These cap how fast the water may move, so
// the virtual torso fills at the same pace as the real one.
export const DEFAULT_PUMP = {
  rate_in_ml_s: 41.9,
  rate_out_ml_s: 41.3,
  torso_volume_ml: 1800,
}

// The between-runs reset is housekeeping, not gameplay, and there is no real tank to
// empty and re-prime: drain back to baseline briskly instead of at pump pace, so the
// next run can start right away.
const PREPARE_RATE = 20 // units/s

export class LevelController {
  cfg: LevelConfig
  level: number
  target: number
  rate: number

  constructor(cfg: LevelConfig = DEFAULT_LEVEL_CONFIG) {
    this.cfg = cfg
    this.level = cfg.baseline
    this.target = cfg.baseline
    this.rate = cfg.rate
  }

  setTarget(target: number, rate?: number): void {
    this.target = clamp(target, 0, this.cfg.capacity)
    if (rate !== undefined) this.rate = Math.max(0.1, rate)
  }

  reset(immediate = true): void {
    this.target = this.cfg.baseline
    this.rate = this.cfg.rate
    if (immediate) this.level = this.cfg.baseline
  }

  tick(dt: number): void {
    const d = this.target - this.level
    const step = this.rate * dt
    if (Math.abs(d) <= step) this.level = this.target
    else this.level += d > 0 ? step : -step
    this.level = clamp(this.level, 0, this.cfg.capacity)
  }

  get moving(): boolean {
    return Math.abs(this.target - this.level) > 1e-6
  }

  get direction(): 'in' | 'out' | 'stop' {
    if (!this.moving) return 'stop'
    return this.target > this.level ? 'in' : 'out'
  }

  get inBand(): boolean {
    return this.cfg.band_low <= this.level && this.level <= this.cfg.band_high
  }

  get zone(): Zone {
    const c = this.cfg
    if (this.level >= c.critical_high) return 'critical_high'
    if (this.level <= c.critical_low) return 'critical_low'
    if (this.level > c.band_high) return 'over'
    if (this.level < c.band_low) return 'under'
    return 'in'
  }
}

/** The runner half: paces the level by the calibrated pump (like the backend's auto
 *  mode on the mock pump) and answers the game's REST commands. */
export class BrowserTwin {
  ctrl = new LevelController()
  pump = { ...DEFAULT_PUMP }
  version: string
  private prepareRate: number | null = null // set while a prepare drains; cleared on settle
  private flowMlS = 0
  private pumpDir: 'in' | 'out' | 'stop' = 'stop'

  constructor(version = '') {
    this.version = version
  }

  setTarget(level: number, rate?: number): void {
    this.prepareRate = null
    this.ctrl.setTarget(level, rate)
  }

  reset(): void {
    this.prepareRate = null
    this.ctrl.reset(true)
  }

  /** Between-runs re-home: back to baseline. Returns the plan fields the game reads. */
  prepare(): { empty_s: number; prime_s: number; eta_s: number; backend: string } {
    const c = this.ctrl
    c.setTarget(c.cfg.baseline)
    c.rate = c.cfg.rate // like the backend's post-prepare sync: next run starts at the default pace
    this.prepareRate = PREPARE_RATE
    const eta = Math.abs(c.level - c.cfg.baseline) / PREPARE_RATE
    return { empty_s: round(eta, 1), prime_s: 0, eta_s: round(eta, 1), backend: 'browser' }
  }

  /** Full-duty pump rate for a direction, in level-units/s. */
  private pumpUnits(direction: 'in' | 'out'): number {
    const ml = direction === 'out' ? this.pump.rate_out_ml_s : this.pump.rate_in_ml_s
    return (ml / this.pump.torso_volume_ml) * this.ctrl.cfg.capacity
  }

  /** Port of LevelRunner._auto_follow: move toward target at the game's pace, capped at
   *  what the pump can deliver (a prepare drains at PREPARE_RATE instead). */
  tick(dt: number): void {
    const c = this.ctrl
    const diff = c.target - c.level
    if (Math.abs(diff) < 1e-6 || dt <= 0) {
      this.prepareRate = null
      this.pumpDir = 'stop'
      this.flowMlS = 0
      return
    }
    const direction = diff > 0 ? 'in' : 'out'
    const cap = this.prepareRate ?? this.pumpUnits(direction)
    const want = this.prepareRate ?? c.rate
    const delivered = Math.min(want * dt, cap * dt, Math.abs(diff))
    c.level = clamp(c.level + (direction === 'in' ? delivered : -delivered), 0, c.cfg.capacity)
    this.pumpDir = direction
    this.flowMlS = ((delivered / dt) * this.pump.torso_volume_ml) / c.cfg.capacity
  }

  snapshot(): LevelState {
    const c = this.ctrl
    const cap = c.cfg.capacity || 100
    const vol = this.pump.torso_volume_ml
    const rate = this.pumpDir === 'out' ? this.pump.rate_out_ml_s : this.pump.rate_in_ml_s
    return {
      level: round(c.level, 2),
      target: round(c.target, 2),
      moving: c.moving,
      direction: c.direction,
      zone: c.zone,
      in_band: c.inBand,
      capacity: c.cfg.capacity,
      baseline: c.cfg.baseline,
      band_low: c.cfg.band_low,
      band_high: c.cfg.band_high,
      critical_high: c.cfg.critical_high,
      critical_low: c.cfg.critical_low,
      torso_volume_ml: vol,
      level_ml: round((c.level / cap) * vol, 1),
      target_ml: round((c.target / cap) * vol, 1),
      pump_running: this.pumpDir !== 'stop',
      pump_busy: false, // no timed pump sequences in the browser
      homed: true, // the twin is ground truth — always at a known level
      pump_direction: this.pumpDir,
      pump_speed: rate > 0 ? round(Math.min(1, this.flowMlS / rate), 3) : 0, // flow fraction
      pump_flow_ml_s: round(this.flowMlS, 3),
      pump_rate_ml_s: rate,
      manual: false,
      backend: 'browser',
      version: this.version,
      sim_active: false,
      sim_level: 0,
      sim_level_ml: 0,
    }
  }
}

/** Tick `twin` on a wall-clock timer and push a snapshot to `onMessage` each tick — the
 *  stand-in for the backend loop + WebSocket. Returns a disposer. */
export function runTwin(
  twin: BrowserTwin,
  onMessage: (s: LevelState) => void,
  tickHz = 20,
): () => void {
  let last = performance.now()
  onMessage(twin.snapshot())
  const id = setInterval(() => {
    const now = performance.now()
    twin.tick((now - last) / 1000)
    last = now
    onMessage(twin.snapshot())
  }, 1000 / tickHz)
  return () => clearInterval(id)
}
