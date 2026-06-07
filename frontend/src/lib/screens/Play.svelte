<script lang="ts">
  import { t } from '../locale'
  import TorsoBar from '../TorsoBar.svelte'
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

  <div class="bar">
    {#if game.level}<TorsoBar s={game.level} />{/if}
  </div>
</div>

<style>
  .screen {
    height: 100vh;
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: clamp(20px, 4vw, 48px);
    align-items: center;
    padding: 24px clamp(20px, 4vw, 48px);
  }
  .panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    min-width: 0;
  }
  h2 {
    font-size: 28px;
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
    gap: 10px;
    width: 100%;
    max-width: 520px;
  }
  .col .btn {
    text-align: left;
  }
  .icon {
    font-size: 56px;
  }
  .story {
    font-size: 22px;
    line-height: 1.5;
    max-width: 560px;
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
    font-size: 26px;
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
    font-size: 22px;
    font-weight: 800;
  }
  .dots {
    font-size: 48px;
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
    padding: 18px 40px;
    font-size: 18px;
    font-weight: 800;
    color: #fff;
    touch-action: none;
  }
  .hold:active {
    transform: scale(0.97);
  }
  .bar {
    height: 84vh;
    display: flex;
    justify-content: center;
  }
</style>
