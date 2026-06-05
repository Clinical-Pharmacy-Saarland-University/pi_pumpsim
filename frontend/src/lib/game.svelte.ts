// Client-side flow store (Svelte 5 runes). The backend owns the live round
// simulation; this owns which screen is shown and round progression.
import { api, connectTelemetry } from './api'
import type { GameState, ScenarioMeta } from './types'

export type Screen = 'attract' | 'intro' | 'play' | 'result' | 'summary'

export const game = $state({
  screen: 'attract' as Screen,
  connected: false,
  scenarios: [] as ScenarioMeta[],
  index: 0,
  state: null as GameState | null,
  starsPerRound: [] as number[],
})

let seenRunning = false

function onWs(s: GameState) {
  game.state = s
  if (game.screen !== 'play') return
  if (s.phase === 'running') seenRunning = true
  if (seenRunning && s.phase === 'ended') {
    game.starsPerRound[game.index] = s.stars
    game.screen = 'result'
  }
}

export function init(): () => void {
  api.scenarios().then((list) => (game.scenarios = list))
  return connectTelemetry(onWs, (c) => (game.connected = c))
}

export function currentScenario(): ScenarioMeta | undefined {
  return game.scenarios[game.index]
}

export function begin(): void {
  game.index = 0
  game.starsPerRound = []
  game.screen = 'intro'
}

export function startRound(): void {
  const sc = currentScenario()
  if (!sc) return
  seenRunning = false
  api.start(sc.id)
  game.screen = 'play'
}

export function setHold(on: boolean): void {
  api.hold(on)
}

export function next(): void {
  if (game.index < game.scenarios.length - 1) {
    game.index++
    game.screen = 'intro'
  } else {
    game.screen = 'summary'
  }
}

export function restart(): void {
  api.stop()
  game.index = 0
  game.starsPerRound = []
  game.state = null
  game.screen = 'attract'
}

export function totalStars(): number {
  return game.starsPerRound.reduce((a, b) => a + (b ?? 0), 0)
}

/** Operator: jump straight into a scenario (admin). */
export function jumpTo(scenarioId: string): void {
  const i = game.scenarios.findIndex((s) => s.id === scenarioId)
  if (i < 0) return
  game.index = i
  seenRunning = false
  api.start(scenarioId)
  game.screen = 'play'
}
