<script lang="ts">
  import { t } from '../locale'
  import { game } from '../game.svelte'
  import { api } from '../api'

  let { onclose }: { onclose: () => void } = $props()
</script>

<aside class="admin">
  <header>
    <h2>{t('admin.title')}</h2>
    <button class="x" onclick={onclose} aria-label="schließen">✕</button>
  </header>
  <div class="row">
    <button onclick={() => api.reset()}>Reset Spiegel</button>
    <button onclick={() => api.setTarget(62)}>→ 62 (Band)</button>
    <button onclick={() => api.setTarget(78)}>→ 78 (toxic)</button>
  </div>
  <div class="meta">Phase: <b>{game.phase}</b> · Event {game.idx + 1}/{game.events.length || '-'}</div>
  <pre>{game.level ? JSON.stringify(game.level, null, 2) : '—'}</pre>
  <footer>Taste <kbd>A</kbd> / <kbd>Esc</kbd> schließt</footer>
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
  .row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .row button {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 8px 12px;
    font-weight: 600;
  }
  .meta {
    font-size: 13px;
    color: var(--dim);
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
