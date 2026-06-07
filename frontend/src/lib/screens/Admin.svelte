<script lang="ts">
  import { t } from '../locale.svelte'
  import { game } from '../game.svelte'
  import { api } from '../api'

  let { onclose }: { onclose: () => void } = $props()
  let cap = $derived(game.level?.capacity ?? 100)
  let baseline = $derived(game.level?.baseline ?? 42)

  function stopHere() {
    api.setTarget(Math.round(game.level?.level ?? baseline))
  }
</script>

<aside class="admin">
  <header>
    <h2>{t('admin.title')}</h2>
    <button class="x" onclick={onclose} aria-label="schließen">✕</button>
  </header>

  <!-- manual pump: hold to run, release to stop (for calibration/testing) -->
  <div class="pump">
    <button
      class="in"
      onpointerdown={() => api.setTarget(cap)}
      onpointerup={stopHere}
      onpointerleave={stopHere}
      onpointercancel={stopHere}>{t('admin.pumpIn')}</button
    >
    <button
      class="out"
      onpointerdown={() => api.setTarget(0)}
      onpointerup={stopHere}
      onpointerleave={stopHere}
      onpointercancel={stopHere}>{t('admin.pumpOut')}</button
    >
  </div>
  <div class="row">
    <button onclick={stopHere}>{t('admin.stop')}</button>
    <button onclick={() => api.setTarget(baseline)}>{t('admin.reset')}</button>
  </div>

  <div class="readout">
    <div>Level: <b>{game.level ? Math.round(game.level.level) : '-'}</b> / {cap}</div>
    <div>
      Zone: <b>{game.level?.zone ?? '-'}</b> · Richtung: <b>{game.level?.direction ?? '-'}</b>
    </div>
    <div>Pumpe: <b>{game.level?.pump_running ? 'AN' : 'aus'}</b></div>
  </div>

  <pre>{game.level ? JSON.stringify(game.level, null, 2) : '—'}</pre>
  <footer>Taste <kbd>A</kbd> / <kbd>Esc</kbd> schließt</footer>
</aside>

<style>
  .admin {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: min(420px, 92%);
    background: rgba(12, 16, 32, 0.97);
    border-left: 1px solid var(--border);
    box-shadow: -20px 0 60px rgba(0, 0, 0, 0.5);
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    z-index: 50;
    overflow-y: auto;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  h2 {
    font-size: 18px;
  }
  .x {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    width: 38px;
    height: 38px;
  }
  .pump {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .pump button {
    padding: 22px 0;
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
  .readout {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px;
    font-size: 14px;
    line-height: 1.6;
  }
  pre {
    margin: 0;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px;
    font-size: 11px;
    color: var(--dim);
    white-space: pre-wrap;
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
