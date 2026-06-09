<script lang="ts">
  import { onMount } from 'svelte'
  import { t } from '../locale.svelte'
  import { game } from '../game.svelte'
  import { api } from '../api'
  import { mlPerSec, round1 } from '../calib'

  let { onclose }: { onclose: () => void } = $props()

  type Dir = 'in' | 'out' | 'stop'

  let speed = $state(60) // 0..100 (%)
  let held = $state<Dir | null>(null)
  let rateInput = $state(2.0)
  let rateSynced = false

  // flow-measurement helper: enter measured volume + duration -> ml/s
  let volMl = $state(0)
  let durS = $state(30)
  let calcRate = $derived(mlPerSec(volMl, durS))

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
  function saveCalc() {
    if (calcRate <= 0) return
    rateInput = round1(calcRate)
    api.admin.rate(calcRate).catch(() => {})
  }
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
    <div class="spacer"></div>
    {#if !isReal}<span class="note">{t('admin.mockNote')}</span>{/if}
    <button class="x" onclick={onclose} aria-label={t('admin.close')}>✕</button>
  </header>

  <div class="grid">
    <!-- left: manual jog -->
    <section class="col">
      <div class="speed">
        <label for="sp">{t('admin.speed')}: <b>{speed}%</b></label>
        <input id="sp" type="range" min="0" max="100" bind:value={speed} oninput={onSpeed} />
      </div>

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
    </section>

    <!-- right: calibration + live state -->
    <section class="col">
      <div class="block">
        <div class="bhead">{t('admin.calib')}</div>

        <div class="measure">
          <div class="mlabel">{t('admin.measure')}</div>
          <div class="mrow">
            <label>{t('admin.volume')}
              <input type="number" min="0" step="1" bind:value={volMl} />
            </label>
            <label>{t('admin.duration')}
              <input type="number" min="0.1" step="1" bind:value={durS} />
            </label>
          </div>
          <div class="mresult">= <b>{calcRate.toFixed(1)}</b> ml/s</div>
          <button class="msave" onclick={saveCalc}>{t('admin.saveCalc')}</button>
        </div>

        <label class="ratelabel" for="rate">{t('admin.rate')}</label>
        <div class="raterow">
          <input id="rate" type="number" min="0.01" step="0.1" bind:value={rateInput} />
          <button onclick={setRate}>{t('admin.setRate')}</button>
        </div>
        <p class="deadband">{t('admin.deadbandHint')}</p>
      </div>

      <div class="readout">
        <div class="bhead">{t('admin.state')}</div>
        <div>Level: <b>{game.level ? Math.round(game.level.level) : '–'}</b> / {cap}</div>
        <div>Zone: <b>{game.level?.zone ?? '–'}</b></div>
        <div>
          {t('admin.dir')}: <b>{game.level?.pump_direction ?? '–'}</b> · {pct(game.level?.pump_speed)}%
        </div>
        <div>
          {t('admin.flow')}: <b>{game.level?.pump_flow_ml_s ?? 0}</b> ml/s (×{game.level?.pump_rate_ml_s ??
            0})
        </div>
        <div>{t('admin.running')}: <b>{game.level?.pump_running ? 'AN' : 'aus'}</b></div>
      </div>

      <button class="reset" onclick={resetBaseline}>{t('admin.reset')}</button>
    </section>
  </div>

  <footer><kbd>A</kbd>/<kbd>Esc</kbd> schließt · Geheim-Start: Logo 3× tippen</footer>
</aside>

<style>
  .admin {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: rgba(10, 14, 28, 0.98);
    padding: 18px 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    z-index: 50;
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
  .spacer {
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
  .note {
    font-size: 12px;
    color: #ffb4ad;
  }
  .x {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    width: 44px;
    height: 44px;
    font-size: 18px;
  }

  /* two columns filling the screen */
  .grid {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    align-items: start;
  }
  .col {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  @media (max-width: 760px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }

  .speed label {
    font-size: 15px;
    color: var(--dim);
  }
  input[type='range'] {
    width: 100%;
    height: 48px;
  }
  .pump {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .pump button {
    padding: 40px 0;
    border-radius: 16px;
    font-size: 20px;
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
    font-size: 12px;
    color: var(--dim);
    text-align: center;
    margin-top: -6px;
  }
  .stop {
    background: #d6453b;
    color: #fff;
    border: none;
    border-radius: 14px;
    padding: 18px;
    font-size: 18px;
    font-weight: 800;
  }
  .stop:active {
    transform: scale(0.98);
  }
  .block,
  .readout {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 14px 16px;
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
    padding: 16px 0;
    font-weight: 700;
    color: #e8edff;
  }
  .measure {
    background: rgba(0, 0, 0, 0.22);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 14px;
  }
  .mlabel {
    font-size: 13px;
    font-weight: 700;
    color: var(--dim);
    margin-bottom: 10px;
  }
  .mrow {
    display: flex;
    gap: 10px;
  }
  .mrow label {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: var(--dim);
  }
  .mrow input {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px;
    color: #e8edff;
    font-size: 18px;
    width: 100%;
  }
  .mresult {
    margin: 10px 0;
    font-size: 18px;
  }
  .mresult b {
    font-size: 24px;
    color: var(--spm-cyan, #00beca);
  }
  .msave {
    width: 100%;
    background: var(--spm-cyan, #00beca);
    color: #04222a;
    border: none;
    border-radius: 10px;
    padding: 12px;
    font-weight: 800;
  }

  .ratelabel {
    display: block;
    font-size: 14px;
    color: var(--dim);
    margin-bottom: 6px;
  }
  .raterow {
    display: flex;
    gap: 10px;
  }
  .raterow input {
    flex: 1;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px;
    color: #e8edff;
    font-size: 18px;
  }
  .raterow button {
    background: var(--spm-cyan, #00beca);
    color: #04222a;
    border: none;
    border-radius: 10px;
    padding: 0 20px;
    font-weight: 800;
  }
  .deadband {
    margin: 12px 0 0;
    font-size: 13px;
    line-height: 1.5;
    color: var(--dim);
  }
  .readout {
    font-size: 16px;
    line-height: 1.9;
  }
  .reset {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px;
    font-weight: 600;
    color: #e8edff;
  }
  footer {
    font-size: 11px;
    color: var(--dim);
    text-align: center;
  }
  kbd {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 1px 6px;
  }
</style>
