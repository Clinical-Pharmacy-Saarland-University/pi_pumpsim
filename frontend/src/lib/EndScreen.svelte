<script lang="ts">
  import { t } from './locale.svelte'
  import { retry, backToStories, backToStart, preHome } from './game.svelte'
  import Backdrop from './Backdrop.svelte'
  import EndFx from './EndFx.svelte'
  import StarRating from './StarRating.svelte'

  type OutcomeKind = 'win' | 'over' | 'under'
  type Params = Record<string, string | number>

  let {
    outcome,
    titleKey,
    subKey,
    storyTitleKey,
    factKeys = [],
    score = 0,
    params = {},
    onBack = backToStories,
    onRetry = retry,
    onIdle = backToStart,
  }: {
    outcome: OutcomeKind
    titleKey: string
    subKey: string
    storyTitleKey?: string
    factKeys?: string[]
    score?: number
    params?: Params
    onBack?: () => void
    onRetry?: () => void
    onIdle?: () => void
  } = $props()

  let tone = $derived(outcome === 'win' ? 'good' : outcome === 'under' ? 'warn' : 'bad')
  let markGlyph = $derived(outcome === 'win' ? '✓' : outcome === 'under' ? '↓' : '!')
  let fx = $derived(outcome === 'win' ? ('confetti' as const) : outcome === 'over' ? ('siren' as const) : ('sink' as const))

  // Kiosk idle guard: visitors walk away from the outcome screen mid-celebration.
  // After IDLE_S without a touch, ask "still there?" and count down ASK_S; any tap
  // anywhere keeps the screen (e.g. showing parents the stars), silence = onIdle()
  // — resets all the way to the home screen so the next visitor starts fresh.
  const IDLE_S = 45
  const ASK_S = 15
  let askLeft = $state(-1) // -1 = prompt hidden, otherwise seconds until auto-back
  let idleTimer: ReturnType<typeof setTimeout> | undefined
  let askTick: ReturnType<typeof setInterval> | undefined

  function armIdle() {
    clearTimeout(idleTimer)
    clearInterval(askTick)
    askLeft = -1
    idleTimer = setTimeout(() => {
      askLeft = ASK_S
      askTick = setInterval(() => {
        askLeft -= 1
        if (askLeft <= 0) {
          clearInterval(askTick)
          onIdle()
        }
      }, 1000)
    }, IDLE_S * 1000)
  }

  $effect(() => {
    armIdle()
    return () => {
      clearTimeout(idleTimer)
      clearInterval(askTick)
    }
  })

  // Overlap the slow real-hardware re-home (~77s: empty → prime to baseline) with
  // the time the player reads their result, so the next run starts (near-)instantly.
  // 0 = start the moment the outcome appears (the physical tank drains while the
  // on-screen result/stars stay up); bump to e.g. 8000 to hold the result on the
  // tank for a beat first. On mock this is instant and harmless.
  const PREHOME_GRACE_MS = 0
  $effect(() => {
    const id = setTimeout(preHome, PREHOME_GRACE_MS)
    return () => clearTimeout(id)
  })
  let titleText = $derived(t(titleKey, params).replace(' …', '\u00a0…'))
</script>

<!-- any touch anywhere counts as activity (bubbles up from every screen element) -->
<svelte:window onpointerdown={armIdle} />

<div class="end">
  <Backdrop />
  <EndFx variant={fx} />

  <main class="board {tone}">
    <section class="result" aria-labelledby="end-title">
      {#if storyTitleKey}
        <div class="story">{t(storyTitleKey)}</div>
      {/if}

      <div class="verdict">
        <div class="mark" aria-hidden="true">
          <span>{markGlyph}</span>
        </div>

        <div class="headline">
          <h1 id="end-title">{titleText}</h1>
          <p>{t(subKey, params)}</p>
        </div>
      </div>

      <div class="score-card">
        {#if outcome === 'win'}
          <StarRating score={score} size={54} />
        {:else}
          <div class="loss-rank">
            <span>{t('out.rankLabel')}</span>
            <b>{t('rank.0')}</b>
          </div>
        {/if}
      </div>
    </section>

    <section class="learn" class:few={factKeys.length <= 1}>
      <div class="label">{t('out.dyk')}</div>
      <div class="facts" class:few={factKeys.length <= 1}>
        {#each factKeys as key, i}
          <p style="--i:{i}">{t(key)}</p>
        {/each}
      </div>
      <div class="actions">
        <button class="btn back" onclick={onBack}><span class="arrow">←</span> {t('stories.title')}</button>
        <button class="btn primary again" onclick={onRetry}>{t('common.retry')}</button>
      </div>
    </section>
  </main>

  {#if askLeft >= 0}
    <div class="idle-ask" role="alertdialog" aria-labelledby="idle-title">
      <div class="card">
        <div class="wave" aria-hidden="true">👋</div>
        <h2 id="idle-title">{t('out.idle.title')}</h2>
        <p>{t('out.idle.sub', { s: askLeft })}</p>
        <div class="bar" aria-hidden="true">
          <span style="width:{(askLeft / ASK_S) * 100}%"></span>
        </div>
        <button class="btn primary stay" onclick={armIdle}>{t('out.idle.stay')}</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .end {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .board {
    position: relative;
    z-index: 1;
    height: 100%;
    display: grid;
    grid-template-columns: minmax(0, 0.98fr) minmax(390px, 1.02fr);
    grid-template-rows: minmax(0, 1fr);
    gap: 30px;
    padding: 38px 46px 40px;
    animation: enter 0.42s cubic-bezier(0.2, 0.9, 0.3, 1) both;
  }

  .result,
  .learn {
    min-width: 0;
  }

  .result {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    align-content: stretch;
    gap: 20px;
  }

  .story,
  .label,
  .loss-rank span {
    color: var(--spm-cyan-bright);
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 0.8px;
    text-transform: uppercase;
  }

  .verdict {
    align-self: center;
    display: grid;
    grid-template-columns: 132px minmax(0, 1fr);
    align-items: center;
    gap: 22px;
    min-width: 0;
  }

  .mark {
    --tone: var(--green);
    width: 132px;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 8px solid color-mix(in srgb, var(--tone) 72%, transparent);
    background:
      radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--tone) 18%, transparent), transparent 61%),
      rgba(255, 255, 255, 0.045);
    box-shadow:
      0 0 32px color-mix(in srgb, var(--tone) 26%, transparent),
      inset 0 0 28px rgba(255, 255, 255, 0.06);
  }
  .board.warn .mark {
    --tone: var(--grape);
  }
  .board.bad .mark {
    --tone: var(--toxic);
  }
  .mark span {
    width: 78%;
    color: var(--tone);
    font-size: 78px;
    font-weight: 950;
    line-height: 0.9;
    text-align: center;
  }

  .headline {
    display: grid;
    gap: 10px;
  }
  h1 {
    color: var(--green);
    font-size: clamp(40px, 4.45vw, 58px);
    font-weight: 950;
    line-height: 1.01;
    text-shadow: 0 0 30px rgba(56, 224, 160, 0.35);
  }
  .board.warn h1 {
    color: var(--grape);
    font-size: clamp(38px, 4.1vw, 54px);
    text-shadow: 0 0 28px rgba(255, 183, 3, 0.25);
  }
  .board.bad h1 {
    color: var(--toxic);
    text-shadow: 0 0 30px rgba(255, 107, 122, 0.34);
  }
  .headline p {
    max-width: 720px;
    color: var(--text);
    font-size: clamp(19px, 1.9vw, 25px);
    font-weight: 750;
    line-height: 1.28;
  }

  .score-card {
    width: min(560px, 100%);
    min-height: 94px;
    display: flex;
    align-items: center;
    padding: 13px 17px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.055);
  }
  .score-card :global(.rating) {
    width: 100%;
    flex-wrap: nowrap;
  }
  .score-card :global(.stars) {
    flex: none;
  }
  .score-card :global(.title) {
    min-width: 0;
  }
  .score-card :global(.title .lbl) {
    color: var(--spm-cyan-bright);
    font-weight: 900;
  }
  .score-card :global(.title .name) {
    font-size: clamp(22px, 2.25vw, 30px);
  }
  .score-card :global(.title .count) {
    font-size: 14px;
  }
  .loss-rank {
    display: grid;
    gap: 4px;
  }
  .loss-rank b {
    font-size: clamp(22px, 2.25vw, 30px);
    line-height: 1.1;
  }

  .learn {
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 18px;
    padding-block: 10px 0;
  }

  .facts {
    display: grid;
    align-content: start;
    gap: 12px;
    min-height: 0;
  }
  .facts.few {
    padding-top: 64px;
  }
  .facts p {
    position: relative;
    /* logical padding: the accent bar sits on the inline-start edge (::before
       uses inset-inline-start), so the larger pad must follow it — in RTL both
       move to the right together instead of fighting each other */
    padding-block: 17px;
    padding-inline: 30px 20px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.055);
    color: var(--text);
    font-size: clamp(17px, 1.55vw, 22px);
    font-weight: 700;
    line-height: 1.36;
    animation: factIn 0.36s cubic-bezier(0.2, 0.9, 0.3, 1) both;
    animation-delay: calc(var(--i) * 0.07s + 0.16s);
  }
  .facts.few p {
    min-height: 112px;
    display: flex;
    align-items: center;
    font-size: clamp(20px, 1.85vw, 25px);
  }
  .facts p::before {
    content: '';
    position: absolute;
    inset-inline-start: 13px;
    top: 18px;
    bottom: 18px;
    width: 4px;
    border-radius: 4px;
    background: var(--grape);
  }

  .actions {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 14px;
  }
  .actions .btn {
    min-height: 76px;
    padding: 13px 18px;
    border-radius: 8px;
    font-size: clamp(19px, 1.85vw, 24px);
    font-weight: 900;
    line-height: 1.08;
    white-space: normal;
  }
  .actions .back {
    background: rgba(255, 255, 255, 0.075);
  }
  .actions .back .arrow {
    display: inline-block;
  }
  /* the back-nav arrow points the other way in RTL (Arabic): ← reads as → */
  :global([dir='rtl']) .actions .back .arrow {
    transform: scaleX(-1);
  }
  .actions .again {
    box-shadow: 0 18px 46px rgba(76, 201, 240, 0.36);
  }

  .idle-ask {
    position: absolute;
    inset: 0;
    z-index: 5;
    display: grid;
    place-items: center;
    background: rgba(5, 8, 16, 0.72);
    animation: idleFade 0.25s ease both;
  }
  .idle-ask .card {
    display: grid;
    justify-items: center;
    gap: 14px;
    width: min(580px, 86%);
    padding: 32px 40px 28px;
    border: 1px solid var(--border);
    border-radius: 18px;
    background: radial-gradient(120% 140% at 50% -20%, var(--bg1), var(--bg0));
    box-shadow: var(--shadow);
    text-align: center;
    animation: idlePop 0.3s cubic-bezier(0.2, 1.4, 0.4, 1) both;
  }
  .wave {
    font-size: 52px;
    line-height: 1;
    transform-origin: 70% 80%;
    animation: wave 1.1s ease-in-out infinite;
  }
  .idle-ask h2 {
    font-size: 36px;
    font-weight: 950;
  }
  .idle-ask p {
    color: var(--text);
    font-size: 20px;
    font-weight: 700;
  }
  .bar {
    width: 100%;
    height: 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    overflow: hidden;
  }
  .bar span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--water-top), var(--spm-cyan));
    transition: width 1s linear;
  }
  .idle-ask .stay {
    min-height: 64px;
    margin-top: 4px;
    padding: 14px 40px;
    border-radius: 12px;
    font-size: 22px;
    font-weight: 900;
  }

  @keyframes idleFade {
    from {
      opacity: 0;
    }
  }
  @keyframes idlePop {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
  }
  @keyframes wave {
    0%,
    100% {
      transform: rotate(-12deg);
    }
    50% {
      transform: rotate(16deg);
    }
  }

  @keyframes enter {
    from {
      opacity: 0;
      transform: translateY(18px);
    }
  }
  @keyframes factIn {
    from {
      opacity: 0;
      transform: translateX(16px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .board,
    .facts p,
    .wave {
      animation: none;
    }
  }
</style>
