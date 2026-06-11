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
  // absolute deadline (performance.now() ms) the reset is expected to finish at; the
  // Resetting screen counts down to THIS so it stays accurate even when a background
  // pre-home has already been draining for a while. 0 = unknown.
  prepareDeadline: 0,
  // bumped on every story start so App.svelte can {#key} the play component and force a
  // fresh remount even on a same-story retry (where game.phase stays 'play2').
  runNonce: 0,
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
    const w = { target, then, armed: false }
    extWait = w
    // Watchdog: a story drive's settle is driven only by WS snapshots (onLevel). If the
    // backend crashes/restarts mid-drive (or the WS dies and never recovers), the settle
    // never arrives, `pumping` stays true and the beat wedges with its buttons disabled.
    // Resolve anyway after a generous bound (mirrors prepareThen's grace fallback). Sized
    // to the EFFECTIVE travel time — the pump caps the move at its calibrated rate, so we
    // derive units/s from telemetry when available and never below the requested rate.
    const reqRate = rate && rate > 0 ? rate : 4
    const lvl = game.level
    const pumpUnits =
      lvl && lvl.torso_volume_ml > 0 && lvl.pump_rate_ml_s > 0
        ? (lvl.pump_rate_ml_s / lvl.torso_volume_ml) * 100
        : reqRate
    const effRate = Math.max(0.5, Math.min(reqRate, pumpUnits))
    const watchdogMs = (Math.abs(target - cur) / effRate) * 1000 + 8000
    setTimeout(() => {
      if (extWait === w) {
        extWait = null
        w.then()
      }
    }, watchdogMs)
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
  return connectLevel(onLevel, (c) => {
    game.connected = c
    // On (re)connect, if a story drive is still pending, re-assert its target so a
    // backend that restarted mid-drive resumes moving toward it (the driveTo watchdog
    // covers the case where it doesn't). Harmless on the first connect (extWait null).
    if (c && extWait) api.setTarget(extWait.target)
  })
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
  // bump the run nonce BEFORE entering play2 so the {#key} in App.svelte forces a fresh
  // remount — even on a same-story retry, where game.phase is already 'play2' (so the
  // {#if} alone would not re-create the component and the old beat='outcome' would stick).
  game.runNonce += 1
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
// timestamp (performance.now()) of the last accepted nav, to debounce re-taps. A
// touchscreen double-tap / two-finger tap dispatches two clicks a few ms apart; the
// fast path runs `next()` synchronously WITHOUT entering 'resetting', so the phase guard
// below can't catch the second tap — this time gate does.
let lastNavAt = -1e9
const NAV_DEBOUNCE_MS = 600

// Capture the backend plan's ETA as both seconds and an absolute deadline (so the
// Resetting countdown stays accurate even after a background pre-home has been draining).
function applyPreparePlan(p: { empty_s: number; prime_s: number }): void {
  game.prepareEtaS = p.empty_s + p.prime_s
  game.prepareDeadline = performance.now() + game.prepareEtaS * 1000
}

// Start the between-runs re-home early, without leaving the current phase (the
// outcome screen stays up; on real hardware the tank drains in the background).
// Idempotent — safe to call more than once per run.
export function preHome(): void {
  if (preHomeIssued) return
  preHomeIssued = true
  game.prepareEtaS = 0
  game.prepareDeadline = 0
  // On failure, clear the flag so the next prepareThen still issues a real reset (a stuck
  // preHomeIssued=true would make it skip BOTH the fast path and the issue-prepare block).
  api.prepare().then(applyPreparePlan).catch(() => {
    preHomeIssued = false
  })
}

function prepareThen(next: () => void): void {
  // A reset is already in flight (its blocking "Patient wird vorbereitet" screen is up),
  // or a nav was just accepted. Ignore re-taps so a double-press (e.g. two-finger tap on
  // ← / Nochmal) can't issue a second prepare or bounce through the reset screen.
  if (game.phase === 'resetting' || performance.now() - lastNavAt < NAV_DEBOUNCE_MS) return
  lastNavAt = performance.now()
  // Abandon any pending story-move callback (an aborted mid-drive via ✕) so it can't fire
  // during or after the reset and poke an unmounted story.
  extWait = null
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
    game.prepareDeadline = 0
    api.prepare().then(applyPreparePlan).catch(() => {})
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
