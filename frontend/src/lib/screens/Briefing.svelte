<script lang="ts">
  import { t } from '../locale'
  import TorsoBar from '../TorsoBar.svelte'
  import type { LevelState } from '../types'
  import type { Patient } from '../events'

  let {
    patient,
    level,
    onnext,
  }: { patient: Patient; level: LevelState; onnext: () => void } = $props()
</script>

<div class="screen">
  <div class="panel">
    <div class="pill">SafePolyMed</div>
    <h1>{t(patient.lineKey)}</h1>
    <p class="goal">
      {t('briefing.goal', { name: t(patient.nameKey), drug: t(patient.drugKey) })}
    </p>
    <p class="band">{t('band.explain')}</p>
    <button class="btn primary" onclick={onnext}>{t('common.next')}</button>
  </div>
  <div class="bar"><TorsoBar s={level} /></div>
</div>

<style>
  .screen {
    height: 100%;
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: clamp(20px, 4vw, 48px);
    align-items: center;
    padding: 24px clamp(20px, 4vw, 48px);
  }
  .panel {
    display: flex;
    flex-direction: column;
    gap: 18px;
    align-items: flex-start;
  }
  .pill {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 6px 16px;
    font-size: 13px;
    color: var(--dim);
  }
  h1 {
    font-size: 34px;
    font-weight: 800;
  }
  .goal {
    font-size: 20px;
    line-height: 1.5;
  }
  .band {
    font-size: 15px;
    color: var(--dim);
  }
  .bar {
    height: 100%;
    display: flex;
    justify-content: center;
  }
</style>
