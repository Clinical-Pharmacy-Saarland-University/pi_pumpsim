<script lang="ts">
  import { onMount } from 'svelte'
  import { t } from '../locale'
  import Mascot from '../Mascot.svelte'
  import type { ScenarioMeta } from '../types'

  let {
    scenario,
    index,
    total,
    ongo,
  }: { scenario: ScenarioMeta; index: number; total: number; ongo: () => void } = $props()

  let name = $derived(t('p.' + scenario.patient_id + '.name'))
  let line = $derived(t('p.' + scenario.patient_id + '.line'))
  let drugShort = $derived(t('d.' + scenario.drug_id + '.short'))

  onMount(() => {
    const id = setTimeout(ongo, 6500) // auto-advance
    return () => clearTimeout(id)
  })
</script>

<div class="intro">
  <div class="of">{t('intro.patientOf', { n: index + 1, total })}</div>
  <h2>{line}</h2>
  <div class="mascot"><Mascot drugId={scenario.drug_id} size={110} /></div>
  <p class="give">{t('intro.give', { name, drug: drugShort })}</p>
  <p class="goal">{t('intro.goal')}</p>
  <button class="btn primary" onclick={ongo}>{t('intro.go')}</button>
</div>

<style>
  .intro {
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    text-align: center;
    padding: 30px;
  }
  .of {
    font-size: 16px;
    color: var(--dim);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 6px 16px;
  }
  h2 {
    font-size: 34px;
    font-weight: 800;
  }
  .mascot {
    margin: 6px 0;
  }
  .give {
    font-size: 22px;
    font-weight: 700;
  }
  .goal {
    font-size: 17px;
    color: var(--dim);
    max-width: 520px;
  }
  .btn.primary {
    margin-top: 14px;
  }
</style>
