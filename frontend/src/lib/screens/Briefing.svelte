<script lang="ts">
  import { t } from '../locale.svelte'
  import { game, toDose, back } from '../game.svelte'
  let patient = $derived(game.patient)
</script>

<div class="screen">
  <button class="back" onclick={back}>← {t('common.back')}</button>
  <div class="panel">
    <div class="pill">SafePolyMed</div>
    <h1>{t(patient.lineKey)}</h1>
    <p class="goal">{t('briefing.goal', { name: t(patient.nameKey), drug: t(patient.drugKey) })}</p>
    <p class="band">{t('band.explain')}</p>
    <button class="btn primary" onclick={toDose}>{t('common.next')}</button>
  </div>
</div>

<style>
  .screen {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px clamp(24px, 5vw, 80px);
  }
  .back {
    position: absolute;
    top: 18px;
    left: 18px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 10px 16px;
    font-weight: 600;
  }
  .panel {
    display: flex;
    flex-direction: column;
    gap: 18px;
    align-items: flex-start;
    max-width: 820px;
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
    font-size: 38px;
    font-weight: 800;
  }
  .goal {
    font-size: 22px;
    line-height: 1.5;
  }
  .band {
    font-size: 15px;
    color: var(--dim);
  }
</style>
