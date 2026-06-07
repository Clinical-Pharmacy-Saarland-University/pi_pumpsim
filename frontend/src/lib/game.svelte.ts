// Client-side game (Svelte 5 runes). Backend owns the level ("torso twin");
// this owns language/age, story selection, the play flow, reset-between-runs,
// and scoring. target = base × Π(factors).
import { api, connectLevel } from './api'
import { DOSE, type Apply, type Choice, type GameEvent, type Patient } from './events'
import { STORIES, type Story } from './stories'
import type { LevelState } from './types'

export type Phase =
  | 'start'
  | 'storyselect'
  | 'briefing'
  | 'dose'
  | 'dosing'
  | 'doseDone'
  | 'story'
  | 'knowledge'
  | 'lesson'
  | 'decision'
  | 'settling'
  | 'resetting'
  | 'outcome'

export type Outcome = 'win' | 'over' | 'under'
export type AgeGroup = 'young' | 'adult'

function shuffle<T>(a: T[]): T[] {
  const r = a.slice()
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

export const game = $state({
  phase: 'start' as Phase,
  connected: false,
  level: null as LevelState | null,
  ageGroup: 'young' as AgeGroup,
  story: null as Story | null,
  patient: STORIES[0].patient as Patient,
  events: [] as GameEvent[],
  idx: 0,
  base: DOSE.standard as number,
  factors: {} as Record<string, number>,
  lastCorrect: null as boolean | null,
  score: { kCorrect: 0, kTotal: 0, dCorrect: 0, dTotal: 0 },
  outcome: null as Outcome | null,
  stars: 0,
})

let wait: { next: () => void; armed: boolean } | null = null

function computeTarget(): number {
  let t = game.base
  for (const f of Object.values(game.factors)) t *= f
  return Math.max(0, Math.min(100, t))
}

function moveTo(target: number, then: () => void) {
  const cur = game.level?.level ?? target
  api.setTarget(target)
  if (Math.abs(target - cur) < 1) {
    wait = null
    setTimeout(then, 650)
  } else {
    wait = { next: then, armed: false }
  }
}

const PLAY_PHASES = ['dose', 'dosing', 'doseDone', 'story', 'knowledge', 'lesson', 'decision', 'settling']

function onLevel(s: LevelState) {
  game.level = s
  if ((s.zone === 'critical_high' || s.zone === 'critical_low') && PLAY_PHASES.includes(game.phase)) {
    wait = null
    finishOutcome()
    return
  }
  if (wait) {
    if (s.moving) wait.armed = true
    if (wait.armed && !s.moving) {
      const n = wait.next
      wait = null
      n()
    }
  }
}

export function init(): () => void {
  api.reset()
  return connectLevel(onLevel, (c) => (game.connected = c))
}

// --- start / navigation ---
export function setAge(a: AgeGroup): void {
  game.ageGroup = a
}
export function begin(): void {
  game.phase = 'storyselect'
}
export function back(): void {
  if (game.phase === 'storyselect') game.phase = 'start'
  else if (game.phase === 'briefing') game.phase = 'storyselect'
}

export function stories(): Story[] {
  return STORIES
}

export function selectStory(story: Story): void {
  if (!story.available) return
  game.story = story
  game.patient = story.patient
  game.events = shuffle(story.events).map((ev) => ({
    ...ev,
    knowledge: { ...ev.knowledge, options: shuffle(ev.knowledge.options) },
    choices: shuffle(ev.choices),
  }))
  game.idx = 0
  game.base = DOSE.standard
  game.factors = {}
  game.score = { kCorrect: 0, kTotal: 0, dCorrect: 0, dTotal: 0 }
  game.outcome = null
  game.stars = 0
  game.lastCorrect = null
  game.phase = 'briefing'
}

export function toDose(): void {
  game.phase = 'dose'
}

// --- reset between runs (drain torso to baseline; takes time on real hardware) ---
function prepareThen(next: () => void): void {
  game.phase = 'resetting'
  const baseline = game.level?.baseline ?? 42
  moveTo(baseline, next)
}
export function cancelStory(): void {
  prepareThen(() => (game.phase = 'storyselect'))
}
export function retry(): void {
  const s = game.story
  prepareThen(() => (s ? selectStory(s) : (game.phase = 'storyselect')))
}
export function backToStories(): void {
  prepareThen(() => (game.phase = 'storyselect'))
}

// --- dosing ---
export function chooseDose(key: keyof typeof DOSE): void {
  game.base = DOSE[key]
  game.phase = 'dosing'
  moveTo(computeTarget(), () => (game.phase = 'doseDone'))
}
export function holdStart(): void {
  game.phase = 'dosing'
  api.setTarget(game.level?.capacity ?? 100)
}
export function holdStop(): void {
  const lvl = Math.round(game.level?.level ?? DOSE.standard)
  game.base = lvl
  api.setTarget(lvl)
  setTimeout(() => (game.phase = 'doseDone'), 400)
}

// --- events ---
function currentEvent(): GameEvent {
  return game.events[game.idx]
}
export function startEvents(): void {
  game.idx = 0
  game.phase = 'story'
}
export function toKnowledge(): void {
  game.lastCorrect = null
  game.phase = 'knowledge'
}
export function answerKnowledge(optionId: string): void {
  const ev = currentEvent()
  const opt = ev.knowledge.options.find((o) => o.id === optionId)
  const correct = !!opt?.correct
  game.lastCorrect = correct
  game.score.kTotal++
  if (correct) game.score.kCorrect++
  if (ev.factorId && ev.factor) game.factors[ev.factorId] = ev.factor
  api.setTarget(computeTarget())
  game.phase = 'lesson'
}
export function toDecision(): void {
  game.lastCorrect = null
  game.phase = 'decision'
}
export function choose(choice: Choice): void {
  game.lastCorrect = choice.correct
  game.score.dTotal++
  if (choice.correct) game.score.dCorrect++
  applyChoice(choice.apply)
  game.phase = 'settling'
  moveTo(computeTarget(), afterSettle)
}
function applyChoice(a: Apply): void {
  if (a.kind === 'setBase') game.base = a.base
  else if (a.kind === 'removeFactor') delete game.factors[a.factorId]
}
function afterSettle(): void {
  if (game.idx < game.events.length - 1) {
    game.idx++
    game.phase = 'story'
  } else {
    finishOutcome()
  }
}
function finishOutcome(): void {
  const z = game.level?.zone ?? 'under'
  game.outcome = z === 'in' ? 'win' : z === 'over' || z === 'critical_high' ? 'over' : 'under'
  if (game.outcome === 'win') {
    const perfectK = game.score.kCorrect === game.score.kTotal
    const perfectD = game.score.dCorrect === game.score.dTotal
    game.stars = 1 + (perfectK ? 1 : 0) + (perfectD ? 1 : 0)
  } else {
    game.stars = 0
  }
  game.phase = 'outcome'
}
