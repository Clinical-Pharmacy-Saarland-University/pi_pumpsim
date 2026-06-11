// Client-side game (Svelte 5 runes). The backend owns the level ("torso twin");
// this module owns language/age, story selection, reset-between-runs, and the
// shared torso primitives every story leans on: driveTo / hold / testHypothesis.
// Each story is a self-contained v2 play component (src/lib/screens/<Id>Play.svelte)
// that owns its own beat flow and win/lose — see docs/stories/overhaul/.
import { api, connectLevel } from './api'
import { setAgeLocale, setLocale } from './locale.svelte'
import { STORIES, type Story } from './stories'
import type { Patient } from './events'
import type { LevelState } from './types'

export type Phase = 'start' | 'storyselect' | 'play2' | 'resetting'
export type AgeGroup = 'young' | 'adult'

export const game = $state({
  phase: 'start' as Phase,
  connected: false,
  level: null as LevelState | null,
  ageGroup: 'young' as AgeGroup,
  story: null as Story | null,
  patient: STORIES[0].patient as Patient,
  // estimated total seconds for the current between-runs reset (empty + prime), from
  // the backend plan — the "Patient wird vorbereitet" screen counts down from it. 0 = unknown.
  prepareEtaS: 0,
})

// two independent settle-waiters: `wait` for the between-runs re-home (prepare),
// `extWait` for story moves (driveTo). onLevel fires the callback once the pump
// settles. The re-home waiter is busy-aware (a prepare sequence pins `moving`
// false while it pumps, so it watches `pump_busy` too).
let wait: { next: () => void; armed: boolean } | null = null
let extWait: { target: number; then: () => void; armed: boolean } | null = null

// --- shared story primitives (the "torso is the instrument" grammar) ----------
// Move the torso toward `target` at `rate` (units/s); `then` fires on settle.
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

// Hold the body DEAD STILL for `ms`, issuing no pump command, then run `then`.
// Stillness itself is the message ("nichts bewegt sich → harmlos").
export function hold(ms: number, then: () => void): void {
  setTimeout(then, ms)
}

// Test a hypothesis ON the body: a real cause drives the pump (the water travels),
// a harmless one holds it still for `holdMs` (no movement = the answer). `then`
// fires once the verdict has been shown.
export function testHypothesis(
  opts: { real: boolean; target?: number; rate?: number; holdMs?: number },
  then: () => void,
): void {
  if (opts.real && opts.target !== undefined) driveTo(opts.target, opts.rate, then)
  else setTimeout(then, opts.holdMs ?? 1400)
}

function onLevel(s: LevelState) {
  game.level = s
  if (wait) {
    const active = s.moving || s.pump_busy // re-home pumps with moving pinned false
    if (active) wait.armed = true
    if (wait.armed && !active) {
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
}
export function stories(): Story[] {
  return STORIES
}

// every story is a self-contained v2 play component, routed by id in App.svelte
export function selectStory(story: Story): void {
  if (!story.available) return
  game.story = story
  game.patient = story.patient
  game.phase = 'play2'
}

// --- reset between runs: full re-home (empty → prime → sync) ------------------
// Slow on real hardware (overpumps empty, then primes to baseline); on mock the
// backend just settles the twin at baseline, so it's quick.

// A background pre-home can be kicked off from the outcome screen to overlap that
// slow real-hardware re-home with the time the player spends reading their result.
// `preHomeIssued` tracks it so prepareThen never double-drains: if it already
// finished we skip the wait entirely; if it's still running we ride it out.
let preHomeIssued = false

// Start the between-runs re-home early, without leaving the current phase (the
// outcome screen stays up; on real hardware the tank drains in the background).
// Idempotent — safe to call more than once per run.
export function preHome(): void {
  if (preHomeIssued) return
  preHomeIssued = true
  game.prepareEtaS = 0
  api.prepare().then((p) => (game.prepareEtaS = p.empty_s + p.prime_s)).catch(() => {})
}

function prepareThen(next: () => void): void {
  const st = game.level
  // a background pre-home already settled at baseline → no reset wait, jump through
  if (preHomeIssued && st?.homed && !st.moving && !st.pump_busy) {
    preHomeIssued = false
    next()
    return
  }
  game.phase = 'resetting'
  if (!preHomeIssued) {
    // fresh reset → issue it and capture the ETA for the countdown. (An in-flight
    // pre-home already set prepareEtaS; ride it out without restarting.)
    game.prepareEtaS = 0
    api.prepare().then((p) => (game.prepareEtaS = p.empty_s + p.prime_s)).catch(() => {})
  }
  preHomeIssued = false
  const w = { next, armed: false }
  wait = w
  // grace fallback: if the re-home never visibly starts (e.g. already at baseline
  // on mock), proceed anyway so we never hang on the "preparing patient" screen.
  setTimeout(() => {
    if (wait === w && !w.armed) {
      wait = null
      next()
    }
  }, 2500)
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
// Kiosk idle return: a walked-away player gets reset all the way to the home
// screen, with language + age hard-reset to the defaults (German · kids), so the
// next visitor always starts from a clean, predictable state.
export function backToStart(): void {
  prepareThen(() => {
    setLocale('de')
    setAge('young')
    game.phase = 'start'
  })
}
