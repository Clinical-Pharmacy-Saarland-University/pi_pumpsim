<script lang="ts">
  import { onMount } from 'svelte'
  import { t } from '../locale.svelte'
  import { game } from '../game.svelte'
  import { api } from '../api'
  import CalibWizard from './CalibWizard.svelte'
  import NumPad from '../NumPad.svelte'

  let { onclose }: { onclose: () => void } = $props()

  let wizard = $state(false)
  let pad = $state<null | { label: string; unit: string; set: (v: number) => void }>(null)
  const openPad = (label: string, unit: string, set: (v: number) => void) =>
    (pad = { label, unit, set })

  type Dir = 'in' | 'out' | 'stop'

  let speed = $state(60) // 0..100 (%)
  let held = $state<Dir | null>(null)

  // empty/reset params + torso volume (loaded from calibration on mount)
  let emptyS = $state(0)
  let primeMl = $state(0)
  let volumeMl = $state(0)

  let cap = $derived(game.level?.capacity ?? 100)
  let isReal = $derived(game.level?.backend === 'real')

  // enter manual mode on open, leave (auto resumes + pump stops) on close
  onMount(() => {
    api.admin.manual(true).catch(() => {})
    api.admin
      .getCalibration()
      .then((c) => {
        emptyS = c.empty_overpump_s ?? 0
        primeMl = c.prime_in_ml ?? 0
        volumeMl = c.torso_volume_ml ?? 0
      })
      .catch(() => {})
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
  const resetBaseline = () => {
    held = null
    api.admin.reset().catch(() => {})
  }
  const saveResetParams = async () => {
    try {
      await api.admin.saveCalibration({
        empty_overpump_s: emptyS || null,
        prime_in_ml: primeMl || null,
        // 0 must not write null (the volume has a real committed default, 1.8 L);
        // omit the key so the stored value stays untouched
        ...(volumeMl > 0 ? { torso_volume_ml: volumeMl } : {}),
      })
      // re-sync with what was actually stored (e.g. volume left at 0 -> show stored)
      const c = await api.admin.getCalibration()
      emptyS = c.empty_overpump_s ?? 0
      primeMl = c.prime_in_ml ?? 0
      volumeMl = c.torso_volume_ml ?? 0
    } catch {}
  }
  const doEmpty = () => api.admin.empty(emptyS || undefined).catch(() => {})
  const doCalibReset = () => api.admin.calibratedReset().catch(() => {})

  const pct = (f: number | undefined) => Math.round((f ?? 0) * 100)
</script>

<aside class="admin">
  <header>
    <h2>{t('admin.title')}</h2>
    <span class="badge" class:real={isReal}>{isReal ? 'REAL' : 'MOCK'}</span>
    {#if game.level?.version}<span class="ver">v{game.level.version}</span>{/if}
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
        <button class="wizbtn" onclick={() => (wizard = true)}>{t('cal.startGuided')}</button>
      </div>

      <div class="readout">
        <div class="bhead">{t('admin.state')}</div>
        <div>
          Level: <b>{game.level ? Math.round(game.level.level) : '–'}</b> / {cap}
          {#if game.level}
            · <b>{Math.round(game.level.level_ml ?? 0)}</b> / {Math.round(game.level.torso_volume_ml ?? 0)} ml
          {/if}
        </div>
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

      <div class="block">
        <div class="bhead">{t('admin.resetSection')}</div>
        <div class="mrow">
          <button class="numbtn" onclick={() => openPad(t('admin.emptyTime'), 's', (v) => (emptyS = v))}>
            <span>{t('admin.emptyTime')}</span><b>{emptyS}</b>
          </button>
          <button class="numbtn" onclick={() => openPad(t('admin.primeMl'), 'ml', (v) => (primeMl = v))}>
            <span>{t('admin.primeMl')}</span><b>{primeMl}</b>
          </button>
          <button class="numbtn" onclick={() => openPad(t('admin.volumeMl'), 'ml', (v) => (volumeMl = v))}>
            <span>{t('admin.volumeMl')}</span><b>{volumeMl}</b>
          </button>
        </div>
        <button class="msave" onclick={saveResetParams}>{t('admin.saveParams')}</button>
        <div class="resetrow">
          <button class="empty" onclick={doEmpty}>{t('admin.empty')}</button>
          <button class="calibreset" onclick={doCalibReset}>{t('admin.calibReset')}</button>
        </div>
        <p class="deadband">{t('admin.resetHint')}</p>
      </div>

      <button class="reset" onclick={resetBaseline}>{t('admin.reset')}</button>
    </section>
  </div>

  <footer><kbd>A</kbd>/<kbd>Esc</kbd> schließt · Geheim-Start: Logo 3× tippen</footer>

  {#if pad}
    <NumPad
      label={pad.label}
      unit={pad.unit}
      onsubmit={(v) => {
        pad?.set(v)
        pad = null
      }}
      oncancel={() => (pad = null)}
    />
  {/if}

  {#if wizard}<CalibWizard onclose={() => (wizard = false)} />{/if}
</aside>

<style>
  .admin {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: #0a0e1c;
    padding: 18px 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    z-index: 50;
    overflow-y: auto;
    scrollbar-width: none; /* hide scrollbar on the kiosk */
  }
  .admin::-webkit-scrollbar {
    display: none;
  }
  .admin button {
    touch-action: manipulation; /* no tap delay (.pump buttons override below) */
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
  .ver {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--border);
    color: var(--dim);
    font-variant-numeric: tabular-nums;
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
  .wizbtn {
    width: 100%;
    background: linear-gradient(120deg, var(--spm-cyan, #00beca), var(--green, #1f9d6b));
    color: #04222a;
    border: none;
    border-radius: 12px;
    padding: 14px;
    font-weight: 800;
    font-size: 16px;
    margin-bottom: 12px;
  }
  .mrow {
    display: flex;
    gap: 10px;
  }
  .numbtn {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 12px;
    color: #e8edff;
  }
  .numbtn span {
    font-size: 12px;
    color: var(--dim);
  }
  .numbtn b {
    font-size: 20px;
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
  .resetrow {
    display: flex;
    gap: 8px;
    margin-top: 10px;
  }
  .resetrow button {
    flex: 1;
    border: none;
    border-radius: 10px;
    padding: 14px 8px;
    font-weight: 800;
  }
  .empty {
    background: #d6453b;
    color: #fff;
  }
  .calibreset {
    background: #3b7bd6;
    color: #fff;
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
