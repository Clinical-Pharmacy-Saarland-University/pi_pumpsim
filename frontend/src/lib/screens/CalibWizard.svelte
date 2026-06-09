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

  type Phase = 'intro' | 'deadbandIn' | 'deadbandOut' | 'flow' | 'review' | 'done'
  let phase = $state<Phase>('intro')

  // deadband — manual finder (no auto-ramp): adjust duty, hold to test, capture
  let dbDuty = $state(15) // 0..100
  let dbHeld = $state(false)
  let deadbandIn = $state<number | null>(null)
  let deadbandOut = $state<number | null>(null)

  // flow measurement
  let flowIdx = $state(0)
  let runSecs = $state(10)
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
    dbHeld = false
    running = false
    stopPump()
  }
  function close() {
    cleanup()
    onclose()
  }
  onMount(() => cleanup) // run cleanup on unmount (covers any close path)

  let target = $derived(FLOW_TARGETS[flowIdx])
  let liveRate = $derived(mlPerSec(grams, runSecs))
  const clamp = (v: number) => Math.max(0, Math.min(100, v))

  // --- deadband (manual) ---
  function adjust(d: number) {
    dbDuty = clamp(dbDuty + d)
    if (dbHeld) api.admin.pump(curDir(), dbDuty / 100).catch(() => {}) // live if testing
  }
  const curDir = (): Dir => (phase === 'deadbandIn' ? 'in' : 'out')
  function testHold() {
    dbHeld = true
    api.admin.pump(curDir(), dbDuty / 100).catch(() => {})
  }
  function testRelease() {
    dbHeld = false
    stopPump()
  }
  function captureDeadband() {
    const dir = curDir()
    testRelease()
    const v = dbDuty / 100
    if (dir === 'in') {
      deadbandIn = v
      phase = 'deadbandOut'
    } else {
      deadbandOut = v
      phase = 'flow'
    }
  }
  function skipDeadband() {
    const dir = curDir()
    testRelease()
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
    countdown = runSecs
    api.admin.run(target.dir, target.duty, runSecs).catch(() => {})
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
    <button class="x" onclick={close} aria-label={t('admin.close')}>✕</button>
  </header>

  {#if phase === 'intro'}
    <div class="body">
      <p class="lead">{t('cal.intro')}</p>
      <button class="primary" onclick={() => (phase = 'deadbandIn')}>{t('cal.start')}</button>
    </div>
  {:else if phase === 'deadbandIn' || phase === 'deadbandOut'}
    <div class="body">
      <h3>{t('cal.deadband')} · {dirLabel(curDir())}</h3>
      <p class="lead">{t('cal.deadbandHelp')}</p>
      <div class="gauge">{dbDuty}%</div>
      <div class="adjrow">
        <button onclick={() => adjust(-5)}>−5</button>
        <button onclick={() => adjust(-1)}>−1</button>
        <button onclick={() => adjust(1)}>+1</button>
        <button onclick={() => adjust(5)}>+5</button>
      </div>
      <button
        class="test"
        onpointerdown={testHold}
        onpointerup={testRelease}
        onpointerleave={testRelease}
        onpointercancel={testRelease}>{t('cal.test')}</button
      >
      <button class="flows" onclick={captureDeadband}>{t('cal.capture')} ({dbDuty}%)</button>
      <button class="ghost" onclick={skipDeadband}>{t('cal.skip')}</button>
    </div>
  {:else if phase === 'flow'}
    <div class="body">
      <h3>{t('cal.flowTitle')} · {dirLabel(target.dir)} @ {Math.round(target.duty * 100)}%</h3>
      <p class="lead">{t('cal.flowHelp')}</p>
      {#if running}
        <div class="gauge">{countdown}s</div>
        <div class="muted">{t('cal.running')}</div>
      {:else}
        <div class="secs">
          <span>{t('cal.pickSecs')}:</span>
          <button class:sel={runSecs === 5} onclick={() => (runSecs = 5)}>5 s</button>
          <button class:sel={runSecs === 10} onclick={() => (runSecs = 10)}>10 s</button>
        </div>
        <button class="primary" onclick={startRun}>{t('cal.startRun')} ({runSecs} s)</button>
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
      <button class="ghost" onclick={close}>{t('cal.discard')}</button>
    </div>
  {:else if phase === 'done'}
    <div class="body">
      <p class="lead ok">{t('cal.savedMsg')}</p>
      <p class="lead">{t('cal.savedWhere')}</p>
      <button class="primary" onclick={close}>{t('cal.close')}</button>
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
    gap: 14px;
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
    padding: 18px;
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
  .test {
    background: #3b7bd6;
    color: #fff;
    touch-action: none;
  }
  .test:active {
    transform: scale(0.98);
  }
  .ghost {
    background: var(--surface);
    border: 1px solid var(--border);
    color: #e8edff;
    font-weight: 600;
    font-size: 15px;
    padding: 12px;
  }
  .adjrow {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  .adjrow button {
    background: #1b2440;
    border: 1px solid var(--border);
    color: #e8edff;
    padding: 16px 0;
  }
  .secs {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
    color: var(--dim);
    font-size: 14px;
  }
  .secs button {
    padding: 10px 16px;
    font-size: 15px;
    background: #1b2440;
    border: 1px solid var(--border);
    color: #e8edff;
  }
  .secs button.sel {
    background: var(--spm-cyan, #00beca);
    color: #04222a;
    border-color: var(--spm-cyan, #00beca);
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
