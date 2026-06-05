import type { Calibration, Telemetry } from './types'

/**
 * Subscribe to live telemetry over a WebSocket. Auto-reconnects on drop.
 * Returns a disposer that closes the socket and stops reconnecting.
 */
export function connectTelemetry(
  onMessage: (t: Telemetry) => void,
  onStatus?: (connected: boolean) => void,
): () => void {
  let ws: WebSocket | null = null
  let closed = false
  let retry: ReturnType<typeof setTimeout> | null = null

  const open = () => {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws'
    ws = new WebSocket(`${proto}://${location.host}/ws`)
    ws.onopen = () => onStatus?.(true)
    ws.onmessage = (e) => onMessage(JSON.parse(e.data) as Telemetry)
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

export const api = {
  prime: () => post('/api/command/prime'),
  dose: (volume_ml: number) => post('/api/command/dose', { volume_ml }),
  stop: () => post('/api/command/stop'),
  reset: () => post('/api/command/reset'),
  empty: () => post('/api/command/empty'),
  setConfig: (cal: Calibration) => post('/api/config', cal),
}
