<script lang="ts">
  import { t } from '../locale'
  import type { GameState, ScenarioMeta } from '../types'

  let {
    state,
    scenarios,
    onjump,
    onclose,
  }: {
    state: GameState | null
    scenarios: ScenarioMeta[]
    onjump: (id: string) => void
    onclose: () => void
  } = $props()
</script>

<aside class="admin">
  <header>
    <h2>{t('admin.title')}</h2>
    <button class="x" onclick={onclose} aria-label="schließen">✕</button>
  </header>

  <div class="jump">
    {#each scenarios as s}
      <button onclick={() => onjump(s.id)}>{s.id} · {t('p.' + s.patient_id + '.name')}</button>
    {/each}
  </div>

  <pre>{state ? JSON.stringify(state, null, 2) : '—'}</pre>
  <footer>Taste <kbd>A</kbd> / <kbd>Esc</kbd> schließt · {state?.pump_running ? 'Pumpe AN' : 'Pumpe aus'}</footer>
</aside>

<style>
  .admin {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: min(420px, 92vw);
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
  .jump {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .jump button {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 8px 14px;
    font-weight: 600;
  }
  pre {
    margin: 0;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px;
    font-size: 11px;
    line-height: 1.5;
    color: var(--dim);
    white-space: pre-wrap;
    word-break: break-word;
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
