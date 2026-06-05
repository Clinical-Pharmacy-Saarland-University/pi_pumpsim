<script lang="ts">
  import { untrack } from 'svelte'
  import { api } from './api'
  import type { Calibration, Telemetry } from './types'

  interface Props {
    cal: Calibration
    telemetry: Telemetry | null
    onClose: () => void
  }
  let { cal, telemetry, onClose }: Props = $props()

  // editable draft, seeded ONCE from the calibration at open time (untrack:
  // we deliberately don't want it to follow the live telemetry while editing)
  let draft = $state<Calibration>(untrack(() => ({ ...cal })))
  let error = $state<string | null>(null)
  let saved = $state(false)

  const fields: { key: keyof Calibration; label: string; step: number }[] = [
    { key: 'pump_rate_ml_s', label: 'Pump rate (ml/s)', step: 0.1 },
    { key: 'dead_volume_ml', label: 'Dead volume (ml)', step: 0.5 },
    { key: 'capacity_ml', label: 'Capacity (ml)', step: 5 },
    { key: 'target_low_ml', label: 'Target low (ml)', step: 1 },
    { key: 'target_high_ml', label: 'Target high (ml)', step: 1 },
    { key: 'clearance_k', label: 'Clearance k (1/s)', step: 0.005 },
  ]

  async function save() {
    error = null
    saved = false
    try {
      await api.setConfig(draft)
      saved = true
      setTimeout(() => (saved = false), 1500)
    } catch (e) {
      error = String(e)
    }
  }

  function resync() {
    draft = { ...cal }
    error = null
  }
</script>

<aside class="admin">
  <header>
    <h2>Admin · Calibration</h2>
    <button class="close" onclick={onClose} aria-label="Close admin">✕</button>
  </header>

  <div class="grid">
    {#each fields as f}
      <label>
        <span>{f.label}</span>
        <input type="number" step={f.step} bind:value={draft[f.key]} />
      </label>
    {/each}
  </div>

  <div class="actions">
    <button class="primary" onclick={save}>Apply</button>
    <button onclick={resync}>Resync</button>
    {#if saved}<span class="ok">saved ✓</span>{/if}
    {#if error}<span class="err">{error}</span>{/if}
  </div>

  <section class="debug">
    <h3>Live telemetry</h3>
    <pre>{telemetry ? JSON.stringify(telemetry, null, 2) : '—'}</pre>
  </section>

  <footer>Press <kbd>A</kbd> or <kbd>Esc</kbd> to close · keyboard-friendly</footer>
</aside>

<style>
  .admin {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: min(420px, 90vw);
    background: rgba(12, 16, 32, 0.97);
    border-left: 1px solid var(--panel-border);
    box-shadow: -20px 0 60px rgba(0, 0, 0, 0.5);
    padding: 18px 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
    z-index: 50;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  h2 {
    margin: 0;
    font-size: 18px;
  }
  .close {
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 10px;
    width: 38px;
    height: 38px;
    font-size: 16px;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: var(--text-dim);
  }
  input {
    font: inherit;
    color: var(--text);
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 10px;
    padding: 10px;
  }
  input:focus {
    outline: 2px solid var(--accent);
    border-color: transparent;
  }
  .actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .actions button {
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 10px;
    padding: 10px 16px;
  }
  .actions .primary {
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    border: none;
    font-weight: 600;
  }
  .ok {
    color: var(--good);
    font-size: 13px;
  }
  .err {
    color: var(--bad);
    font-size: 12px;
  }
  .debug h3 {
    margin: 6px 0;
    font-size: 13px;
    color: var(--text-dim);
  }
  pre {
    margin: 0;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid var(--panel-border);
    border-radius: 10px;
    padding: 10px;
    font-size: 11px;
    line-height: 1.5;
    color: var(--text-dim);
    white-space: pre-wrap;
    word-break: break-word;
  }
  footer {
    margin-top: auto;
    font-size: 11px;
    color: var(--text-dim);
  }
  kbd {
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 6px;
    padding: 1px 6px;
    font-size: 11px;
  }
</style>
