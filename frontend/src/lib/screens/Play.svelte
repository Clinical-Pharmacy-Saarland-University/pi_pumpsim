<script lang="ts">
  import { t } from '../locale.svelte'
  import {
    game,
    giveDose,
    toEventReveal,
    mechanismNext,
    choose,
    afterDecision,
    variabilityNext,
    cancelStory,
  } from '../game.svelte'
  import Reveal from '../Reveal.svelte'
  import PlanCheck from '../PlanCheck.svelte'
  import FruitSort from '../FruitSort.svelte'

  let ev = $derived(game.events[game.idx])
  // hide adult-only options (e.g. „Dosis senken") for the young register
  let choices = $derived(ev.choices.filter((c) => game.ageGroup === 'adult' || !c.adultOnly))
  let decidedCls = $derived(
    game.choice?.result === 'win' ? 'good' : game.choice?.result === 'retry' ? 'warn' : 'bad',
  )
</script>

<div class="screen">
  <button class="cancel" onclick={cancelStory}>✕ {t('common.cancel')}</button>

  <div class="panel">
    {#if game.phase === 'dose'}
      <div class="icon">💊</div>
      <h2>{t('dose.startTitle')}</h2>
      <p class="story">
        {t('dose.startPrompt', { name: t(game.patient.nameKey), drug: t(game.patient.drugKey) })}
      </p>
      <button class="btn primary" onclick={giveDose}>{t('dose.give')}</button>
    {:else if game.phase === 'dosing'}
      <p class="time">{t('dose.rising')}</p>
      <div class="dots">…</div>
    {:else if game.phase === 'settling'}
      <div class="dots">…</div>
    {:else if game.phase === 'reveal'}
      <Reveal />
    {:else if game.phase === 'story'}
      <div class="icon">{ev.icon}</div>
      <p class="story">{t(ev.storyKey)}</p>
      <button class="btn primary" onclick={toEventReveal}>{t('common.next')}</button>
    {:else if game.phase === 'planCheck'}
      <PlanCheck />
    {:else if game.phase === 'mechanism'}
      <div class="icon">💡</div>
      <p class="story">{t(ev.mechanismLessonKey)}</p>
      <button class="btn primary" onclick={mechanismNext}>{t('common.next')}</button>
    {:else if game.phase === 'decision'}
      <h2>{t(ev.decisionPromptKey)}</h2>
      <div class="col">
        {#each choices as c}
          <button class="btn" onclick={() => choose(c)}>{t(c.labelKey)}</button>
        {/each}
      </div>
    {:else if game.phase === 'decided' && game.choice}
      <div class="fb {decidedCls}">{t(game.choice.feedbackKey)}</div>
      <button class="btn primary" onclick={afterDecision}>
        {game.choice.result === 'retry' ? t('common.retry') : t('common.next')}
      </button>
    {:else if game.phase === 'variability'}
      <div class="icon">🍊</div>
      <p class="story">{t('var.story')}</p>
      <button class="btn primary" onclick={variabilityNext}>{t('common.next')}</button>
    {:else if game.phase === 'fruits'}
      <FruitSort />
    {/if}
  </div>
</div>

<style>
  .screen {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px clamp(24px, 6vw, 110px);
  }
  .cancel {
    position: absolute;
    top: 18px;
    left: 18px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 10px 16px;
    font-weight: 600;
    color: var(--dim);
  }
  .panel {
    display: flex;
    flex-direction: column;
    gap: 18px;
    align-items: flex-start;
    width: 100%;
    max-width: 820px;
  }
  h2 {
    font-size: 30px;
    font-weight: 800;
  }
  .col {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    max-width: 640px;
  }
  .col .btn {
    text-align: left;
  }
  .icon {
    font-size: 64px;
  }
  .story {
    font-size: 24px;
    line-height: 1.5;
  }
  .time {
    font-size: 16px;
    color: var(--dim);
  }
  .fb {
    font-size: 24px;
    font-weight: 800;
    line-height: 1.4;
  }
  .fb.good {
    color: var(--green);
  }
  .fb.warn {
    color: var(--grape);
  }
  .fb.bad {
    color: var(--toxic);
  }
  .dots {
    font-size: 56px;
    color: var(--dim);
    animation: pulse 1s ease-in-out infinite;
  }
  @keyframes pulse {
    50% {
      opacity: 0.3;
    }
  }
</style>
