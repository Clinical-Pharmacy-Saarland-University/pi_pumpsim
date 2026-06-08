// Client-side game (Svelte 5 runes). Backend owns the level ("torso twin");
// this owns language/age, story selection, the play flow, reset-between-runs,
// and scoring. The per-story flow (see docs/stories/fruehstuecks-falle.md):
//   dose → reveal → story(loaded) → drift → reveal → detective → mechanism →
//   strategy → [decided feedback] → {win→fruit finale | overdose | underdose(5b) | retry}
//   → outcome. The strategy decision drives the torso directly (no needle).
import { api, connectLevel } from './api'
import { DOSE, type Choice, type GameEvent, type Patient } from './events'
import { setAgeLocale } from './locale.svelte'
import { STORIES, type Story } from './stories'
import type { LevelState } from './types'

export type Phase =
  | 'start'
  | 'storyselect'
  | 'play2' // self-contained v2 story components (ddi, organ, …)
  | 'briefing'
  | 'dose'
  | 'dosing'
  | 'reveal'
  | 'story'
  | 'planCheck'
  | 'mechanism'
  | 'decision'
  | 'decided'
  | 'variability'
  | 'settling'
  | 'fruits'
  | 'resetting'
  | 'outcome'

export type Outcome = 'win' | 'over' | 'under'
export type AgeGroup = 'young' | 'adult'
export type RevealKind = 'dose' | 'event'

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
  revealKind: 'dose' as RevealKind,
  choice: null as Choice | null, // the picked strategy (for the 'decided' feedback)
  // pc = detective (first-try clean), k = fruit finale (all correct)
  score: { kCorrect: 0, kTotal: 0, pcCorrect: 0, pcTotal: 0 },
  outcome: null as Outcome | null,
  stars: 0,
})

let wait: { next: () => void; armed: boolean } | null = null
// a second, independent torso driver for the self-contained v2 stories (so they can
// move the torso + detect settle without going through story-1's phase machine).
let extWait: { target: number; then: () => void; armed: boolean } | null = null

export function driveTo(target: number, rate: number | undefined, then: () => void): void {
  const cur = game.level?.level ?? target
  api.setTarget(target, rate)
  if (Math.abs(target - cur) < 1) {
    extWait = null
    setTimeout(then, 450)
  } else {
    extWait = { target, then, armed: false }
  }
}

function computeTarget(): number {
  let t = game.base
  for (const f of Object.values(game.factors)) t *= f
  return Math.max(0, Math.min(100, t))
}

// torso targets for the decision branches (robust to tuning the band)
const bandMid = () => {
  const s = game.level
  return s ? (s.band_low + s.band_high) / 2 : 62
}
const underTarget = () => {
  const s = game.level
  return s ? s.band_low - 5 : 50
}
const overTarget = () => {
  const s = game.level
  return s ? s.critical_high + 10 : 90
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

const PLAY_PHASES = [
  'dose', 'dosing', 'reveal', 'story', 'planCheck', 'mechanism', 'decision', 'decided',
  'variability', 'settling', 'fruits',
]

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
  if (extWait) {
    if (s.moving) extWait.armed = true
    if ((extWait.armed && !s.moving) || Math.abs(s.level - extWait.target) < 0.6) {
      const n = extWait.then
      extWait = null
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
  setAgeLocale(a)
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
  // self-contained v2 stories run their own flow component (App routes by id)
  if (story.engine === 'v2') {
    game.story = story
    game.patient = story.patient
    game.outcome = null
    game.stars = 0
    game.phase = 'play2'
    return
  }
  game.story = story
  game.patient = story.patient
  game.events = shuffle(story.events).map((ev) => ({
    ...ev,
    planCheck: ev.planCheck ? { ...ev.planCheck, items: shuffle(ev.planCheck.items) } : undefined,
    fruitGame: ev.fruitGame ? { ...ev.fruitGame, fruits: shuffle(ev.fruitGame.fruits) } : undefined,
    choices: shuffle(ev.choices),
  }))
  game.idx = 0
  game.base = DOSE.standard
  game.factors = {}
  game.score = { kCorrect: 0, kTotal: 0, pcCorrect: 0, pcTotal: 0 }
  game.choice = null
  game.outcome = null
  game.stars = 0
  game.lastCorrect = null
  game.revealKind = 'dose'
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

// --- dosing (guided tutorial: give the standard dose → fills into the window) ---
export function giveDose(): void {
  game.base = DOSE.standard
  game.phase = 'dosing'
  moveTo(computeTarget(), () => showReveal('dose'))
}

// --- the 5-band reveal ("am I in the window?") ---
function showReveal(kind: RevealKind): void {
  game.revealKind = kind
  game.phase = 'reveal'
}
export function revealNext(): void {
  if (game.revealKind === 'dose') {
    if (game.level?.in_band) startStory()
    else game.phase = 'dose' // missed the window → dose again
  } else {
    game.phase = 'planCheck' // the event reveal → go find the cause
  }
}

// --- event: loaded story → drift → reveal → detective → mechanism ---
function currentEvent(): GameEvent {
  return game.events[game.idx]
}
function startStory(): void {
  game.idx = 0
  game.phase = 'story'
}
export function toEventReveal(): void {
  // the interaction fires: apply its factor, drift, then reveal where it landed
  const ev = currentEvent()
  if (ev.factorId && ev.factor) game.factors[ev.factorId] = ev.factor
  game.phase = 'settling'
  moveTo(computeTarget(), () => showReveal('event'))
}
export function planCheckDone(firstTryCorrect: boolean): void {
  game.score.pcTotal++
  if (firstTryCorrect) game.score.pcCorrect++
  game.phase = 'mechanism'
}
export function mechanismNext(): void {
  game.phase = 'decision'
}

// --- strategy decision (drives the torso; always explain first) ---
export function choose(choice: Choice): void {
  game.choice = choice
  game.lastCorrect = choice.result === 'win'
  game.phase = 'decided' // show the per-choice feedback before anything moves
}
export function afterDecision(): void {
  const c = game.choice
  if (!c) return
  switch (c.result) {
    case 'retry':
      game.phase = 'decision'
      break
    case 'win':
      game.factors = {} // grapefruit dropped → settles back to the dose
      game.phase = 'settling'
      moveTo(computeTarget(), startFruits)
      break
    case 'overdose':
      game.phase = 'settling'
      moveTo(overTarget(), finishOutcome) // crosses the critical line → loss
      break
    case 'underdose':
      game.phase = 'settling'
      moveTo(bandMid(), startVariability) // looks fixed first…
      break
  }
}

// --- 5b: variability (only after „Dosis senken") → drops under the band ---
function startVariability(): void {
  game.phase = 'variability'
}
export function variabilityNext(): void {
  game.phase = 'settling'
  moveTo(underTarget(), finishOutcome)
}

// --- finale: identify which fruits interact like grapefruit (win path only) ---
function startFruits(): void {
  game.lastCorrect = null
  game.phase = 'fruits'
}
export function fruitsDone(allCorrect: boolean): void {
  game.lastCorrect = allCorrect
  game.score.kTotal++
  if (allCorrect) game.score.kCorrect++
  finishOutcome()
}

// --- outcome + stars ---
function finishOutcome(): void {
  const z = game.level?.zone ?? 'under'
  game.outcome = z === 'in' ? 'win' : z === 'over' || z === 'critical_high' ? 'over' : 'under'
  if (game.outcome === 'win') {
    const detectiveClean = game.score.pcTotal > 0 && game.score.pcCorrect === game.score.pcTotal
    const fruitClean = game.score.kTotal > 0 && game.score.kCorrect === game.score.kTotal
    game.stars = 1 + (detectiveClean ? 1 : 0) + (fruitClean ? 1 : 0)
  } else {
    game.stars = 0
  }
  game.phase = 'outcome'
}
