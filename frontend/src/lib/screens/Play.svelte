<script lang="ts">
  import { t } from '../locale.svelte'
  import {
    game,
    giveDose,
    toEventReveal,
    mechanismNext,
    medCheckDone,
    choose,
    afterDecision,
    variabilityNext,
    cancelStory,
  } from '../game.svelte'
  import Backdrop from '../Backdrop.svelte'
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

<div class="play">
  <Backdrop />
  <button class="cancel" onclick={cancelStory} aria-label={t('common.cancel')}>✕</button>

  <div class="stage">
    <main class="content">
      {#key game.phase}
        <div class="beat">
          {#if game.phase === 'dose'}
            <div class="emoji">💊</div>
            <h2>{t('dose.startTitle')}</h2>
            <p class="lead">
              {t('dose.startPrompt', { name: t(game.patient.nameKey), drug: t(game.patient.drugKey) })}
            </p>
            <button class="btn primary big" onclick={giveDose}>{t('dose.give')}</button>
          {:else if game.phase === 'dosing' || game.phase === 'settling'}
            <div class="emoji float">🫗</div>
            <p class="lead dim">{game.phase === 'dosing' ? t('dose.rising') : '…'}</p>
          {:else if game.phase === 'reveal'}
            <Reveal />
          {:else if game.phase === 'story'}
            <div class="emoji">{ev.icon}</div>
            <p class="lead">{t(ev.storyKey)}</p>
            <button class="btn primary big" onclick={toEventReveal}>{t('common.next')}</button>
          {:else if game.phase === 'planCheck'}
            <PlanCheck />
          {:else if game.phase === 'mechanism'}
            <!-- bridge: "Grapefruit gefunden" → it only matters for drugs on this route -->
            <div class="emoji">🍊</div>
            {#if ev.bridgeTitleKey}<h2>{t(ev.bridgeTitleKey)}</h2>{/if}
            <p class="lead">{t(ev.mechanismLessonKey)}</p>
            <button class="btn primary big" onclick={mechanismNext}>
              {t(ev.bridgeButtonKey ?? 'common.next')}
            </button>
          {:else if game.phase === 'medcheck'}
            <PlanCheck data={ev.medCheck} onDone={medCheckDone} />
          {:else if game.phase === 'decision'}
            <h2>{t(ev.decisionPromptKey)}</h2>
            <div class="opts">
              {#each choices as c}
                <button class="opt" onclick={() => choose(c)}>{t(c.labelKey)}</button>
              {/each}
            </div>
          {:else if game.phase === 'decided' && game.choice}
            <div class="fb {decidedCls}">{t(game.choice.feedbackKey)}</div>
            <button class="btn primary big" onclick={afterDecision}>
              {game.choice.result === 'retry' ? t('common.retry') : t('common.next')}
            </button>
          {:else if game.phase === 'variability'}
            <div class="emoji">🍊</div>
            <p class="lead">{t('var.story')}</p>
            <button class="btn primary big" onclick={variabilityNext}>{t('common.next')}</button>
          {:else if game.phase === 'fruits'}
            <FruitSort />
          {/if}
        </div>
      {/key}
    </main>
  </div>
</div>

<style>
  .play {
    position: relative;
    height: 100%;
    overflow: hidden;
  }
  .cancel {
    position: absolute;
    top: 16px;
    inset-inline-start: 16px;
    z-index: 3;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--dim);
    font-size: 18px;
    font-weight: 700;
  }
  .cancel:active {
    transform: scale(0.94);
  }

  .stage {
    position: relative;
    z-index: 1;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr;
    align-items: center;
    padding: 28px clamp(36px, 5vw, 80px);
  }

  .content {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    height: 100%;
  }
  .beat {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 22px;
    width: 100%;
    max-width: 760px;
    animation: beatin 0.4s cubic-bezier(0.2, 0.9, 0.3, 1) both;
  }

  .emoji {
    font-size: 84px;
    line-height: 1;
  }
  .emoji.float {
    animation: float 2s ease-in-out infinite;
  }
  h2 {
    font-size: clamp(30px, 3.4vw, 44px);
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: 0.2px;
    background: linear-gradient(90deg, var(--green), var(--spm-cyan-bright));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .lead {
    font-size: clamp(20px, 2.2vw, 28px);
    line-height: 1.5;
    font-weight: 500;
  }
  .lead.dim {
    color: var(--dim);
  }
  .fb {
    font-size: clamp(22px, 2.4vw, 30px);
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

  .opts {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
  }
  .opt {
    text-align: start;
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: 18px;
    padding: 22px 28px;
    font-size: clamp(18px, 1.9vw, 23px);
    font-weight: 700;
    transition: transform 0.1s ease, border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  }
  .opt:active {
    transform: scale(0.98);
    border-color: var(--spm-cyan);
    background: var(--surface2);
    box-shadow: 0 10px 30px rgba(0, 190, 202, 0.22);
  }

  .btn.big {
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
  @keyframes float {
    50% {
      transform: translateY(-10px) rotate(-6deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .beat,
    .emoji.float {
      animation: none;
    }
  }
</style>
