import type { LevelState } from './types'

/** Subscribe to live level state over WebSocket. Auto-reconnects. */
export function connectLevel(
  onMessage: (s: LevelState) => void,
  onStatus?: (connected: boolean) => void,
): () => void {
  let ws: WebSocket | null = null
  let closed = false
  let retry: ReturnType<typeof setTimeout> | null = null

  const open = () => {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws'
    ws = new WebSocket(`${proto}://${location.host}/ws`)
    ws.onopen = () => onStatus?.(true)
    ws.onmessage = (e) => onMessage(JSON.parse(e.data) as LevelState)
    ws.onclose = () => {
      onStatus?.(false)
      if (!closed) retry = setTimeout(open, 1000)
    }
    ws.onerror = () => ws?.close()
  }
  open()
  return () => {
    closed = true
    if (retry) clearTimeout(retry)
    ws?.close()
  }
}

async function post(path: string, body?: unknown): Promise<unknown> {
  const res = await fetch(path, {
    method: 'POST',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`${path} -> ${res.status}`)
  return res.json()
}

type Dir = 'in' | 'out' | 'stop'

/** Kiosk health for the admin badges (real on the Pi, faked on the dev PC). */
export interface SystemHealth {
  overlay: 'on' | 'off' | 'unknown'
  pi: boolean
  simulated: boolean
  temp_c: number | null
  throttled: string | null // raw vcgencmd bitmask, e.g. "0x0"
  under_voltage_now: boolean | null
  freq_capped_now: boolean | null
  throttled_now: boolean | null
  soft_temp_now: boolean | null
  under_voltage_ever: boolean | null
  freq_capped_ever: boolean | null
  throttled_ever: boolean | null
  soft_temp_ever: boolean | null
}

/** The re-home plan: derived (or overridden) empty/prime durations. */
export interface PreparePlan {
  empty_s: number
  empty_src: 'derived' | 'from_level' | 'fallback'
  water_ml: number // torso water to remove (capacity for a full re-zero, else the known level)
  overpump_ml: number // absolute safety margin pumped past empty
  empty_ml: number // = water_ml + dead_space_ml + overpump_ml
  from_level: number // level assumed full when draining (capacity = full re-zero)
  prime_ml: number
  prime_s: number
  prime_src: 'derived' | 'override'
  prime_duty: number // duty 0..1 the prime-to-baseline runs at (gentle, no splash)
  tube_prime_s: number
  dead_space_ml: number
  baseline: number
  volume_ml: number
  rate_in: number
  rate_out: number
  eta_s: number // empty_s + prime_s — the countdown total for the prepare screen
  backend: string
}

export const api = {
  /** Tell the torso to move toward `level` (0–100), optionally at a custom rate. */
  setTarget: (level: number, rate?: number) => post('/api/level/target', { level, rate }),
  reset: () => post('/api/level/reset'),
  /** Between-runs re-home: drains only the known end-of-run volume when homed (fast),
   *  primes to baseline, snaps the twin. Returns the plan (incl. eta_s for the countdown). */
  prepare: () => post('/api/level/prepare') as Promise<PreparePlan>,

  /** Direct pump control for the admin/calibration screen. speed is 0..1. */
  admin: {
    manual: (on: boolean) => post('/api/admin/manual', { on }),
    pump: (dir: Dir, speed: number) => post('/api/admin/pump', { dir, speed }),
    run: (dir: Dir, speed: number, seconds: number) =>
      post('/api/admin/run', { dir, speed, seconds }),
    /** Live-adjust the speed of a running manual/timed job (no timer reset). */
    setSpeed: (speed: number) => post('/api/admin/speed', { speed }),
    stop: () => post('/api/admin/stop'),
    reset: () => post('/api/admin/reset'),
    getCalibration: async () => {
      const r = await fetch('/api/admin/calibration')
      if (!r.ok) throw new Error(`calibration -> ${r.status}`)
      return r.json()
    },
    saveCalibration: (c: unknown) => post('/api/admin/calibration', c),
    empty: (seconds?: number) => post('/api/admin/empty', { seconds: seconds ?? null }),
    /** Initialize = a FULL re-home (drains a whole torso, not just the known level) —
     *  the robust trust-reset for first boot / recovery. {full:true} forces it. */
    prepare: () => post('/api/level/prepare', { full: true }),
    /** Prime-only init: no drain — assume the torso was hand-emptied, prime to baseline. */
    prime: () => post('/api/level/prime'),
    /** Marking workflow: overpump empty + anchor the twin at level 0 ("home"). */
    home: () => post('/api/level/home'),
    /** Drive to an exact level to tape a mark (needs a homed twin to be accurate). */
    goto: (level: number) => post('/api/level/goto', { level }),
    preparePlan: async (): Promise<PreparePlan> => {
      const r = await fetch('/api/level/prepare_plan')
      if (!r.ok) throw new Error(`prepare_plan -> ${r.status}`)
      return r.json()
    },

    /** System: overlay lock + SoC temp/throttle health + clean power control. */
    system: async (): Promise<SystemHealth> => {
      const r = await fetch('/api/admin/system')
      if (!r.ok) throw new Error(`system -> ${r.status}`)
      return r.json()
    },
    shutdown: () => post('/api/admin/shutdown'),
    reboot: () => post('/api/admin/reboot'),
  },

  /** DEV-only (mock): rehearse the init flow against a torso with unknown water. */
  dev: {
    simulateStart: (fill: number) => post('/api/dev/simulate_start', { fill }),
    clearSim: () => post('/api/dev/clear_sim'),
  },
}
