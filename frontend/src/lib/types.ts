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
  // physical mapping for the virtual torso (from calibration)
  torso_volume_ml: number // ml from level 0 to level 100
  level_ml: number
  target_ml: number
  pump_running: boolean
  pump_busy: boolean // a timed run / prepare sequence is in progress
  homed: boolean // twin anchored to a known physical level (marking workflow)
  // pump / admin telemetry
  pump_direction: 'in' | 'out' | 'stop'
  pump_speed: number // 0..1 duty fraction
  pump_flow_ml_s: number
  pump_rate_ml_s: number // calibrated full-speed flow
  manual: boolean
  backend: string // "mock" | "real"
  version: string // app version (from the repo-root VERSION file)
  // DEV physics sim (mock only): the hidden TRUE water level the system doesn't know
  sim_active: boolean
  sim_level: number
  sim_level_ml: number
}
