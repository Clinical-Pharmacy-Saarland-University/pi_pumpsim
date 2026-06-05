import type { GameState, ScenarioMeta } from './types'

/** Subscribe to live GameState over WebSocket. Auto-reconnects on drop. */
export function connectTelemetry(
  onMessage: (s: GameState) => void,
  onStatus?: (connected: boolean) => void,
): () => void {
  let ws: WebSocket | null = null
  let closed = false
  let retry: ReturnType<typeof setTimeout> | null = null

  const open = () => {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws'
    ws = new WebSocket(`${proto}://${location.host}/ws`)
    ws.onopen = () => onStatus?.(true)
    ws.onmessage = (e) => onMessage(JSON.parse(e.data) as GameState)
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
  scenarios: () => fetch('/api/scenarios').then((r) => r.json()) as Promise<ScenarioMeta[]>,
  start: (scenario_id: string) => post('/api/game/start', { scenario_id }),
  hold: (on: boolean) => post('/api/game/hold', { on }),
  stop: () => post('/api/game/stop'),
}
