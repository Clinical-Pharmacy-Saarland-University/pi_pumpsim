export type Zone = 'critical_low' | 'under' | 'in' | 'over' | 'critical_high'

// live state from the backend "torso twin"
export interface LevelState {
  level: number
  target: number
  moving: boolean
  direction: 'in' | 'out' | 'stop'
  zone: Zone
  in_band: boolean
  capacity: number
  baseline: number
  band_low: number
  band_high: number
  critical_high: number
  critical_low: number
  pump_running: boolean
  // pump / admin telemetry
  pump_direction: 'in' | 'out' | 'stop'
  pump_speed: number // 0..1 duty fraction
  pump_flow_ml_s: number
  pump_rate_ml_s: number // calibrated full-speed flow
  manual: boolean
  backend: string // "mock" | "real"
  version: string // app version (from the repo-root VERSION file)
}
