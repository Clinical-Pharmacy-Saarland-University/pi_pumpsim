export type Phase = 'idle' | 'running' | 'ended'

export interface GameState {
  phase: Phase
  scenario_id: string | null
  t: number
  duration: number
  level: number
  capacity: number
  band_low: number
  band_high: number
  in_green: boolean
  well_being: number
  time_in_green: number
  green_pct: number
  hold: boolean
  k_mult: number
  active_event: string | null
  stars: number
  pump_running: boolean
}

export interface ScenarioMeta {
  id: string
  patient_id: string
  drug_id: string
  band_low: number
  band_high: number
  duration: number
  tutorial: boolean
  events: { t: number; type: string }[]
}
