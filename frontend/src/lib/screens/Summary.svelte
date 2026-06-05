<script lang="ts">
  import { onMount } from 'svelte'
  import { t } from '../locale'
  import type { ScenarioMeta } from '../types'

  let {
    scenarios,
    starsPerRound,
    onrestart,
  }: { scenarios: ScenarioMeta[]; starsPerRound: number[]; onrestart: () => void } = $props()

  let total = $derived(starsPerRound.reduce((a, b) => a + (b ?? 0), 0))
  let max = $derived(scenarios.length * 3)

  onMount(() => {
    const id = setTimeout(onrestart, 20000)
    return () => clearTimeout(id)
  })
</script>

<div class="summary">
  <div class="tada">🎉</div>
  <h1>{t('summary.title')}</h1>
  <div class="stars">
    {#each Array(max) as _, i}
      <span class:on={i < total}>★</span>
    {/each}
  </div>
  <div class="count">{t('summary.total', { n: total, max })}</div>
  <ul>
    {#each scenarios as s}
      <li>{t('recap.' + s.patient_id)}</li>
    {/each}
  </ul>
  <button class="btn primary" onclick={onrestart}>{t('summary.again')}</button>
</div>

<style>
  .summary {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    text-align: center;
    padding: 30px;
  }
  .tada {
    font-size: 56px;
  }
  h1 {
    font-size: 44px;
    font-weight: 800;
  }
  .stars {
    font-size: 30px;
    letter-spacing: 4px;
  }
  .stars span {
    color: var(--surface2);
  }
  .stars span.on {
    color: var(--grape);
    text-shadow: 0 0 12px rgba(255, 183, 3, 0.5);
  }
  .count {
    font-size: 18px;
    color: var(--dim);
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 10px 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  li {
    font-size: 18px;
    color: var(--green);
    font-weight: 600;
  }
  .btn.primary {
    margin-top: 12px;
  }
</style>
