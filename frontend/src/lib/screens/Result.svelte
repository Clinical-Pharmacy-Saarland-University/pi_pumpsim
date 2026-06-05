<script lang="ts">
  import { onMount } from 'svelte'
  import { t } from '../locale'
  import type { ScenarioMeta } from '../types'

  let {
    scenario,
    stars,
    greenPct,
    onnext,
  }: { scenario: ScenarioMeta; stars: number; greenPct: number; onnext: () => void } = $props()

  let name = $derived(t('p.' + scenario.patient_id + '.name'))
  let fact = $derived(t('fact.' + scenario.patient_id))

  onMount(() => {
    const id = setTimeout(onnext, 9000)
    return () => clearTimeout(id)
  })
</script>

<div class="result">
  <div class="stars">
    {#each [0, 1, 2] as i}
      <span class:on={i < stars}>★</span>
    {/each}
  </div>
  <div class="for">{t('result.starsFor', { name })}</div>
  <div class="pct">{t('result.greenPct', { p: greenPct })}</div>
  <div class="dyk">
    <span class="lbl">{t('result.didYouKnow')}</span>
    <p>{fact}</p>
  </div>
  <button class="btn primary" onclick={onnext}>{t('result.next')}</button>
</div>

<style>
  .result {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    text-align: center;
    padding: 30px;
  }
  .stars {
    font-size: 64px;
    letter-spacing: 8px;
  }
  .stars span {
    color: var(--surface2);
  }
  .stars span.on {
    color: var(--grape);
    text-shadow: 0 0 18px rgba(255, 183, 3, 0.5);
  }
  .for {
    font-size: 26px;
    font-weight: 800;
  }
  .pct {
    font-size: 18px;
    color: var(--green);
    font-weight: 700;
  }
  .dyk {
    max-width: 620px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 18px 24px;
    margin-top: 8px;
  }
  .dyk .lbl {
    font-size: 14px;
    color: var(--grape);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }
  .dyk p {
    margin-top: 6px;
    font-size: 18px;
    line-height: 1.5;
  }
  .btn.primary {
    margin-top: 10px;
  }
</style>
