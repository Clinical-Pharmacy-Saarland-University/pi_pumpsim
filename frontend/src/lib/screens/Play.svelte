<script lang="ts">
  import { t } from '../locale.svelte'
  import {
    game,
    chooseDose,
    holdStart,
    holdStop,
    startEvents,
    toKnowledge,
    answerKnowledge,
    toDecision,
    choose,
    cancelStory,
  } from '../game.svelte'

  let ev = $derived(game.events[game.idx])
  let doseStatus = $derived(
    game.level?.zone === 'in'
      ? { key: 'dose.settled.in', cls: 'good' }
      : game.level && game.level.level > game.level.band_high
        ? { key: 'dose.settled.over', cls: 'bad' }
        : { key: 'dose.settled.under', cls: 'warn' },
  )

  function holdDown(e: PointerEvent) {
    e.preventDefault()
    holdStart()
  }
</script>

<div class="screen">
  <button class="cancel" onclick={cancelStory}>✕ {t('common.cancel')}</button>

  <div class="panel">
    {#if game.phase === 'dose'}
      <h2>{t('dose.prompt')}</h2>
      <div class="row">
        <button class="btn" onclick={() => chooseDose('low')}>{t('dose.low')}</button>
        <button class="btn" onclick={() => chooseDose('standard')}>{t('dose.standard')}</button>
        <button class="btn" onclick={() => chooseDose('high')}>{t('dose.high')}</button>
      </div>
      <button
        class="hold"
        onpointerdown={holdDown}
        onpointerup={holdStop}
        onpointerleave={holdStop}
        onpointercancel={holdStop}>{t('dose.hold')}</button
      >
      <p class="hint">{t('dose.arcadeHint')}</p>
    {:else if game.phase === 'dosing' || game.phase === 'settling'}
      <div class="dots">…</div>
    {:else if game.phase === 'doseDone'}
      <div class="status {doseStatus.cls}">{t(doseStatus.key)}</div>
      <p class="time">{t('timejump')}</p>
      <button class="btn primary" onclick={startEvents}>{t('common.next')}</button>
    {:else if game.phase === 'story'}
      <div class="icon">{ev.icon}</div>
      <p class="story">{t(ev.storyKey)}</p>
      <button class="btn primary" onclick={toKnowledge}>{t('common.next')}</button>
    {:else if game.phase === 'knowledge'}
      <h2>{t(ev.knowledge.promptKey)}</h2>
      <div class="col">
        {#each ev.knowledge.options as o}
          <button class="btn" onclick={() => answerKnowledge(o.id)}>{t(o.labelKey)}</button>
        {/each}
      </div>
    {:else if game.phase === 'lesson'}
      <div class="fb {game.lastCorrect ? 'good' : 'bad'}">
        {game.lastCorrect ? t('q.correct') : t('q.wrong')}
      </div>
      <p class="story">{t(ev.knowledge.lessonKey)}</p>
      <button class="btn primary" onclick={toDecision}>{t('common.next')}</button>
    {:else if game.phase === 'decision'}
      <h2>{t(ev.decisionPromptKey)}</h2>
      <div class="col">
        {#each ev.choices as c}
          <button class="btn" onclick={() => choose(c)}>{t(c.labelKey)}</button>
        {/each}
      </div>
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
  .row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
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
  .hint {
    font-size: 14px;
    color: var(--dim);
  }
  .time {
    font-size: 16px;
    color: var(--dim);
  }
  .status {
    font-size: 30px;
    font-weight: 800;
  }
  .status.good,
  .fb.good {
    color: var(--green);
  }
  .status.warn {
    color: var(--grape);
  }
  .status.bad,
  .fb.bad {
    color: var(--toxic);
  }
  .fb {
    font-size: 24px;
    font-weight: 800;
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
  .hold {
    background: linear-gradient(135deg, var(--water-top), var(--water-bot));
    border-radius: 16px;
    padding: 18px 44px;
    font-size: 18px;
    font-weight: 800;
    color: #fff;
    touch-action: none;
  }
  .hold:active {
    transform: scale(0.97);
  }
</style>
