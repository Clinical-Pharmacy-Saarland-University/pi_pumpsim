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

export const api = {
  /** Tell the torso to move toward `level` (0–100), optionally at a custom rate. */
  setTarget: (level: number, rate?: number) => post('/api/level/target', { level, rate }),
  reset: () => post('/api/level/reset'),

  /** Direct pump control for the admin/calibration screen. speed is 0..1. */
  admin: {
    manual: (on: boolean) => post('/api/admin/manual', { on }),
    pump: (dir: Dir, speed: number) => post('/api/admin/pump', { dir, speed }),
    run: (dir: Dir, speed: number, seconds: number) =>
      post('/api/admin/run', { dir, speed, seconds }),
    stop: () => post('/api/admin/stop'),
    rate: (rate_ml_s: number) => post('/api/admin/rate', { rate_ml_s }),
    reset: () => post('/api/admin/reset'),
    getCalibration: async () => {
      const r = await fetch('/api/admin/calibration')
      if (!r.ok) throw new Error(`calibration -> ${r.status}`)
      return r.json()
    },
    saveCalibration: (c: unknown) => post('/api/admin/calibration', c),
  },
}
