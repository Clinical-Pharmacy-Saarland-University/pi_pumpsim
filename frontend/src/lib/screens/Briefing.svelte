<script lang="ts">
  import { t } from '../locale.svelte'
  import { game, toDose, back } from '../game.svelte'
  import Backdrop from '../Backdrop.svelte'
  import Torso from '../Torso.svelte'
  let patient = $derived(game.patient)
</script>

<div class="briefing">
  <Backdrop />
  <button class="back" onclick={back}><span class="arrow">←</span>{t('common.back')}</button>

  <div class="stage">
    <aside class="torso-pane">
      {#if game.level}<Torso s={game.level} />{/if}
    </aside>
    <main class="content">
      <div class="pill">{game.story ? t(game.story.titleKey) : 'SafePolyMed'}</div>
      <h1>{t(patient.lineKey)}</h1>
      <p class="goal">{t('briefing.goal', { name: t(patient.nameKey), drug: t(patient.drugKey) })}</p>
      <p class="band">{t('band.explain')}</p>
      <button class="btn primary big" onclick={toDose}>{t('common.next')}</button>
    </main>
  </div>
</div>

<style>
  .briefing {
    position: relative;
    height: 100%;
    overflow: hidden;
  }
  .back {
    position: absolute;
    top: 16px;
    inset-inline-start: 16px;
    z-index: 3;
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 13px 22px;
    font-size: 18px;
    font-weight: 700;
    color: var(--dim);
  }
  .back:active {
    transform: scale(0.96);
  }
  :global([dir='rtl']) .arrow {
    transform: scaleX(-1);
  }
  .stage {
    position: relative;
    z-index: 1;
    height: 100%;
    display: grid;
    grid-template-columns: 360px 1fr;
    align-items: center;
    gap: clamp(20px, 3vw, 56px);
    padding: 28px clamp(36px, 5vw, 80px) 28px clamp(24px, 3vw, 48px);
  }
  .torso-pane {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  .content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
    max-width: 720px;
    animation: beatin 0.45s cubic-bezier(0.2, 0.9, 0.3, 1) both;
  }
  .pill {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 7px 18px;
    font-size: 14px;
    font-weight: 700;
    color: var(--spm-cyan-bright);
    letter-spacing: 0.3px;
  }
  h1 {
    font-size: clamp(32px, 3.6vw, 46px);
    font-weight: 900;
    line-height: 1.1;
    background: linear-gradient(90deg, var(--green), var(--spm-cyan-bright));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .goal {
    font-size: clamp(20px, 2.2vw, 27px);
    line-height: 1.5;
  }
  .band {
    font-size: 16px;
    color: var(--dim);
  }
  .btn.big {
    margin-top: 8px;
    padding: 20px 48px;
    font-size: 24px;
    border-radius: 20px;
  }
  @keyframes beatin {
    from {
      opacity: 0;
      transform: translateY(22px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .content {
      animation: none;
    }
  }
</style>
