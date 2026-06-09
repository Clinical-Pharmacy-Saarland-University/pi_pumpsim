<script lang="ts">
  import { onMount } from 'svelte'
  import { t } from '../locale.svelte'
  import { game } from '../game.svelte'
  import { api } from '../api'

  let { onclose }: { onclose: () => void } = $props()

  type Dir = 'in' | 'out' | 'stop'

  let speed = $state(60) // 0..100 (%)
  let held = $state<Dir | null>(null)
  let rateInput = $state(2.0)
  let rateSynced = false

  let cap = $derived(game.level?.capacity ?? 100)
  let isReal = $derived(game.level?.backend === 'real')

  // prefill the rate field from the backend's calibrated value (once)
  $effect(() => {
    if (!rateSynced && game.level) {
      rateInput = game.level.pump_rate_ml_s ?? 2.0
      rateSynced = true
    }
  })

  // enter manual mode on open, leave (auto resumes + pump stops) on close
  onMount(() => {
    api.admin.manual(true).catch(() => {})
    return () => {
      api.admin.manual(false).catch(() => {})
    }
  })

  const go = (dir: Dir) => api.admin.pump(dir, speed / 100).catch(() => {})
  const stop = () => {
    held = null
    api.admin.stop().catch(() => {})
  }
  function hold(dir: Dir) {
    held = dir
    go(dir)
  }
  function onSpeed() {
    if (held) go(held) // live-adjust while a button is held
  }
  const timed = (dir: Dir, seconds: number) =>
    api.admin.run(dir, speed / 100, seconds).catch(() => {})
  const setRate = () => api.admin.rate(rateInput).catch(() => {})
  const resetBaseline = () => {
    held = null
    api.admin.reset().catch(() => {})
  }

  const pct = (f: number | undefined) => Math.round((f ?? 0) * 100)
</script>

<aside class="admin">
  <header>
    <h2>{t('admin.title')}</h2>
    <span class="badge" class:real={isReal}>{isReal ? 'REAL' : 'MOCK'}</span>
    <button class="x" onclick={onclose} aria-label={t('admin.close')}>✕</button>
  </header>

  {#if !isReal}<div class="note">{t('admin.mockNote')}</div>{/if}

  <!-- speed -->
  <div class="speed">
    <label for="sp">{t('admin.speed')}: <b>{speed}%</b></label>
    <input id="sp" type="range" min="0" max="100" bind:value={speed} oninput={onSpeed} />
  </div>

  <!-- hold to pump -->
  <div class="pump">
    <button
      class="in"
      onpointerdown={() => hold('in')}
      onpointerup={stop}
      onpointerleave={stop}
      onpointercancel={stop}>{t('admin.pumpIn')}</button
    >
    <button
      class="out"
      onpointerdown={() => hold('out')}
      onpointerup={stop}
      onpointerleave={stop}
      onpointercancel={stop}>{t('admin.pumpOut')}</button
    >
  </div>
  <div class="hint">{t('admin.hold')}</div>
  <button class="stop" onclick={stop}>{t('admin.stop')}</button>

  <!-- timed runs (auto-stop) -->
  <div class="block">
    <div class="bhead">{t('admin.timed')}</div>
    <div class="timed">
      {#each [15, 30, 60] as s}
        <button onclick={() => timed('in', s)}>▲ {s}s</button>
      {/each}
    </div>
    <div class="timed">
      {#each [15, 30, 60] as s}
        <button onclick={() => timed('out', s)}>▼ {s}s</button>
      {/each}
    </div>
  </div>

  <!-- calibration -->
  <div class="block">
    <div class="bhead">{t('admin.calib')}</div>
    <label class="ratelabel" for="rate">{t('admin.rate')}</label>
    <div class="raterow">
      <input id="rate" type="number" min="0.01" step="0.1" bind:value={rateInput} />
      <button onclick={setRate}>{t('admin.setRate')}</button>
    </div>
    <p class="deadband">{t('admin.deadbandHint')}</p>
  </div>

  <!-- live state -->
  <div class="readout">
    <div class="bhead">{t('admin.state')}</div>
    <div>Level: <b>{game.level ? Math.round(game.level.level) : '–'}</b> / {cap}</div>
    <div>Zone: <b>{game.level?.zone ?? '–'}</b></div>
    <div>{t('admin.dir')}: <b>{game.level?.pump_direction ?? '–'}</b> · {pct(game.level?.pump_speed)}%</div>
    <div>{t('admin.flow')}: <b>{game.level?.pump_flow_ml_s ?? 0}</b> ml/s (×{game.level?.pump_rate_ml_s ?? 0})</div>
    <div>{t('admin.running')}: <b>{game.level?.pump_running ? 'AN' : 'aus'}</b></div>
  </div>

  <div class="row">
    <button onclick={resetBaseline}>{t('admin.reset')}</button>
  </div>

  <footer>
    <kbd>A</kbd>/<kbd>Esc</kbd> schließt · Geheim-Start: Ecke oben links lang drücken
  </footer>
</aside>

<style>
  .admin {
    position: absolute;
    top: 0;
    inset-inline-end: 0;
    height: 100%;
    width: min(460px, 96%);
    background: rgba(12, 16, 32, 0.97);
    border-inline-start: 1px solid var(--border);
    box-shadow: -20px 0 60px rgba(0, 0, 0, 0.5);
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 50;
    overflow-y: auto;
  }
  header {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  h2 {
    font-size: 18px;
    flex: 1;
  }
  .badge {
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 1px;
    padding: 4px 10px;
    border-radius: 999px;
    background: #6b7794;
    color: #04222a;
  }
  .badge.real {
    background: var(--green, #1f9d6b);
    color: #fff;
  }
  .x {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    width: 38px;
    height: 38px;
  }
  .note {
    background: rgba(214, 69, 59, 0.14);
    border: 1px solid rgba(214, 69, 59, 0.4);
    border-radius: 10px;
    padding: 8px 10px;
    font-size: 12px;
    color: #ffb4ad;
  }
  .speed label {
    font-size: 14px;
    color: var(--dim);
  }
  input[type='range'] {
    width: 100%;
    height: 40px;
  }
  .pump {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .pump button {
    padding: 26px 0;
    border-radius: 14px;
    font-size: 17px;
    font-weight: 800;
    color: #fff;
    touch-action: none;
  }
  .pump .in {
    background: #1f9d6b;
  }
  .pump .out {
    background: #3b7bd6;
  }
  .pump button:active {
    transform: scale(0.97);
  }
  .hint {
    font-size: 11px;
    color: var(--dim);
    text-align: center;
    margin-top: -4px;
  }
  .stop {
    background: #d6453b;
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 14px;
    font-size: 16px;
    font-weight: 800;
  }
  .stop:active {
    transform: scale(0.98);
  }
  .block,
  .readout {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px;
  }
  .bhead {
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--dim);
    margin-bottom: 10px;
  }
  .timed {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
  }
  .timed + .timed {
    margin-top: 8px;
  }
  .timed button {
    background: #1b2440;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 0;
    font-weight: 700;
    color: #e8edff;
  }
  .ratelabel {
    display: block;
    font-size: 13px;
    color: var(--dim);
    margin-bottom: 6px;
  }
  .raterow {
    display: flex;
    gap: 8px;
  }
  .raterow input {
    flex: 1;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px;
    color: #e8edff;
    font-size: 16px;
  }
  .raterow button {
    background: var(--spm-cyan, #00beca);
    color: #04222a;
    border: none;
    border-radius: 10px;
    padding: 0 16px;
    font-weight: 800;
  }
  .deadband {
    margin: 10px 0 0;
    font-size: 12px;
    line-height: 1.5;
    color: var(--dim);
  }
  .readout {
    font-size: 14px;
    line-height: 1.7;
  }
  .row {
    display: flex;
    gap: 8px;
  }
  .row button {
    flex: 1;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px;
    font-weight: 600;
  }
  footer {
    margin-top: auto;
    font-size: 11px;
    color: var(--dim);
  }
  kbd {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 1px 6px;
  }
</style>
