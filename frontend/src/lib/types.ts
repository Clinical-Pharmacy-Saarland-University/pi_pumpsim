export interface Calibration {
  pump_rate_ml_s: number
  dead_volume_ml: number
  capacity_ml: number
  target_low_ml: number
  target_high_ml: number
  clearance_k: number
}

export type Mode = 'idle' | 'priming' | 'dosing'

export interface Telemetry {
  t: number
  mode: Mode
  pump_running: boolean
  pump_flow_ml_s: number
  primed: boolean
  primed_ml: number
  delivered_ml: number
  level_ml: number
  in_target: boolean
  calibration: Calibration
}
