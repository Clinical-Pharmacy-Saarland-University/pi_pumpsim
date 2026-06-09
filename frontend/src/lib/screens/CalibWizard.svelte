<script lang="ts">
  import { onMount } from 'svelte'
  import { t } from '../locale.svelte'
  import { api } from '../api'
  import {
    mlPerSec,
    round1,
    buildCalibration,
    FLOW_TARGETS,
    type CalibSample,
    type Dir,
  } from '../calib'

  let { onclose }: { onclose: () => void } = $props()

  const RUN_S = 30
  type Phase = 'intro' | 'deadbandIn' | 'deadbandOut' | 'flow' | 'review' | 'done'
  let phase = $state<Phase>('intro')

  // deadband ramp
  let rampDuty = $state(0) // 0..100
  let ramping = $state(false)
  let deadbandIn = $state<number | null>(null)
  let deadbandOut = $state<number | null>(null)

  // flow measurement
  let flowIdx = $state(0)
  let running = $state(false)
  let countdown = $state(0)
  let grams = $state(0)
  let samples = $state<CalibSample[]>([])

  let timer: ReturnType<typeof setInterval> | null = null
  const clearTimer = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }
  const stopPump = () => api.admin.stop().catch(() => {})

  function cleanup() {
    clearTimer()
    ramping = false
    running = false
    stopPump()
  }
  onMount(() => cleanup) // run cleanup on unmount

  let target = $derived(FLOW_TARGETS[flowIdx])
  let liveRate = $derived(mlPerSec(grams, RUN_S))

  // --- deadband ramp ---
  function startRamp(dir: Dir) {
    clearTimer()
    rampDuty = 0
    ramping = true
    api.admin.pump(dir, 0).catch(() => {})
    timer = setInterval(() => {
      rampDuty = Math.min(100, rampDuty + 3)
      api.admin.pump(dir, rampDuty / 100).catch(() => {})
      if (rampDuty >= 100) clearTimer() // reached the top; capture or redo
    }, 350)
  }
  function captureDeadband(dir: Dir) {
    clearTimer()
    ramping = false
    stopPump()
    const v = round1(rampDuty) / 100
    if (dir === 'in') {
      deadbandIn = v
      phase = 'deadbandOut'
    } else {
      deadbandOut = v
      phase = 'flow'
    }
    rampDuty = 0
  }
  function skipDeadband(dir: Dir) {
    cleanup()
    rampDuty = 0
    if (dir === 'in') {
      deadbandIn = null
      phase = 'deadbandOut'
    } else {
      deadbandOut = null
      phase = 'flow'
    }
  }

  // --- flow ---
  function startRun() {
    clearTimer()
    running = true
    countdown = RUN_S
    api.admin.run(target.dir, target.duty, RUN_S).catch(() => {})
    timer = setInterval(() => {
      countdown = Math.max(0, countdown - 1)
      if (countdown <= 0) {
        clearTimer()
        running = false
      }
    }, 1000)
  }
  function applyFlow() {
    if (liveRate <= 0) return
    samples = [...samples, { dir: target.dir, duty: target.duty, ml_per_s: round1(liveRate) }]
    grams = 0
    if (flowIdx + 1 >= FLOW_TARGETS.length) phase = 'review'
    else flowIdx += 1
  }

  function save() {
    api.admin.saveCalibration(buildCalibration(deadbandIn, deadbandOut, samples)).catch(() => {})
    phase = 'done'
  }

  const pctOf = (v: number | null) => (v == null ? '–' : Math.round(v * 100) + ' %')
  const rateOf = (d: Dir) => samples.find((s) => s.dir === d && s.duty >= 0.999)?.ml_per_s ?? null
  const dirLabel = (d: Dir) => (d === 'in' ? t('admin.pumpIn') : t('admin.pumpOut'))
</script>

<aside class="wiz">
  <header>
    <h2>{t('cal.title')}</h2>
    {#if phase === 'flow'}<span class="step">{t('cal.step')} {flowIdx + 1}/{FLOW_TARGETS.length}</span>{/if}
    <div class="sp"></div>
    <button class="x" onclick={onclose} aria-label={t('admin.close')}>✕</button>
  </header>

  {#if phase === 'intro'}
    <div class="body">
      <p class="lead">{t('cal.intro')}</p>
      <button class="primary" onclick={() => (phase = 'deadbandIn')}>{t('cal.start')}</button>
    </div>
  {:else if phase === 'deadbandIn' || phase === 'deadbandOut'}
    {@const dir = phase === 'deadbandIn' ? 'in' : 'out'}
    <div class="body">
      <h3>{t('cal.deadband')} · {dirLabel(dir)}</h3>
      <p class="lead">{t('cal.deadbandHelp')}</p>
      <div class="gauge">{rampDuty}%</div>
      {#if !ramping}
        <button class="primary" onclick={() => startRamp(dir)}>{t('cal.ramp')}</button>
      {:else}
        <button class="flows" onclick={() => captureDeadband(dir)}>{t('cal.flowsNow')}</button>
      {/if}
      <button class="ghost" onclick={() => skipDeadband(dir)}>{t('cal.skip')}</button>
    </div>
  {:else if phase === 'flow'}
    <div class="body">
      <h3>{t('cal.flowTitle')} · {dirLabel(target.dir)} @ {Math.round(target.duty * 100)}%</h3>
      <p class="lead">{t('cal.flowHelp')}</p>
      {#if running}
        <div class="gauge">{countdown}s</div>
        <div class="muted">{t('cal.running')}</div>
      {:else}
        <button class="primary" onclick={startRun}>{t('cal.startRun')}</button>
        <label class="glabel">{t('cal.grams')}
          <input type="number" min="0" step="1" bind:value={grams} />
        </label>
        <div class="muted">= <b>{liveRate.toFixed(1)}</b> ml/s</div>
        <button class="flows" onclick={applyFlow} disabled={liveRate <= 0}>{t('cal.apply')}</button>
      {/if}
    </div>
  {:else if phase === 'review'}
    <div class="body">
      <h3>{t('cal.review')}</h3>
      <div class="results">
        <div>{t('cal.deadband')} {dirLabel('in')}: <b>{pctOf(deadbandIn)}</b></div>
        <div>{t('cal.deadband')} {dirLabel('out')}: <b>{pctOf(deadbandOut)}</b></div>
        <div>{t('cal.rate')} {dirLabel('in')}: <b>{rateOf('in') ?? '–'}</b> ml/s</div>
        <div>{t('cal.rate')} {dirLabel('out')}: <b>{rateOf('out') ?? '–'}</b> ml/s</div>
      </div>
      <table class="samples">
        <thead><tr><th>Richtung</th><th>Tastgrad</th><th>ml/s</th></tr></thead>
        <tbody>
          {#each samples as s}
            <tr><td>{s.dir}</td><td>{Math.round(s.duty * 100)}%</td><td>{s.ml_per_s}</td></tr>
          {/each}
        </tbody>
      </table>
      <button class="primary" onclick={save}>{t('cal.save')}</button>
      <button class="ghost" onclick={onclose}>{t('cal.discard')}</button>
    </div>
  {:else if phase === 'done'}
    <div class="body">
      <p class="lead ok">{t('cal.savedMsg')}</p>
      <button class="primary" onclick={onclose}>{t('cal.close')}</button>
    </div>
  {/if}
</aside>

<style>
  .wiz {
    position: absolute;
    inset: 0;
    background: rgba(8, 11, 22, 0.99);
    padding: 18px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    z-index: 60;
    overflow-y: auto;
  }
  header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  h2 {
    font-size: 20px;
  }
  .step {
    font-size: 12px;
    font-weight: 800;
    color: var(--dim);
  }
  .sp {
    flex: 1;
  }
  .x {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    width: 44px;
    height: 44px;
    font-size: 18px;
  }
  .body {
    flex: 1;
    max-width: 560px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    justify-content: center;
  }
  h3 {
    font-size: 22px;
    text-align: center;
  }
  .lead {
    font-size: 16px;
    line-height: 1.5;
    color: var(--dim);
    text-align: center;
  }
  .lead.ok {
    color: var(--green, #1f9d6b);
    font-size: 22px;
    font-weight: 800;
  }
  .gauge {
    font-size: 72px;
    font-weight: 900;
    text-align: center;
    color: var(--spm-cyan, #00beca);
  }
  .muted {
    text-align: center;
    color: var(--dim);
    font-size: 18px;
  }
  .muted b {
    color: var(--spm-cyan, #00beca);
    font-size: 22px;
  }
  button {
    border: none;
    border-radius: 14px;
    padding: 20px;
    font-size: 19px;
    font-weight: 800;
  }
  .primary {
    background: var(--spm-cyan, #00beca);
    color: #04222a;
  }
  .flows {
    background: #1f9d6b;
    color: #fff;
  }
  .flows:disabled {
    opacity: 0.4;
  }
  .ghost {
    background: var(--surface);
    border: 1px solid var(--border);
    color: #e8edff;
    font-weight: 600;
    font-size: 15px;
    padding: 12px;
  }
  .glabel {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 14px;
    color: var(--dim);
  }
  .glabel input {
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px;
    color: #e8edff;
    font-size: 22px;
  }
  .results {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 14px 16px;
    font-size: 16px;
    line-height: 1.9;
  }
  .samples {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  .samples th,
  .samples td {
    border: 1px solid var(--border);
    padding: 6px 10px;
    text-align: center;
  }
  .samples th {
    color: var(--dim);
    font-weight: 700;
  }
</style>
