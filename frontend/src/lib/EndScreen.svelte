<script lang="ts">
  import { t } from './locale.svelte'
  import { retry, backToStories } from './game.svelte'
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
  } = $props()

  let tone = $derived(outcome === 'win' ? 'good' : outcome === 'under' ? 'warn' : 'bad')
  let markGlyph = $derived(outcome === 'win' ? '✓' : outcome === 'under' ? '↓' : '!')
  let fx = $derived(outcome === 'win' ? ('confetti' as const) : outcome === 'over' ? ('siren' as const) : ('sink' as const))
  let titleText = $derived(t(titleKey, params).replace(' …', '\u00a0…'))
</script>

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
        <button class="btn back" onclick={onBack}>← {t('stories.title')}</button>
        <button class="btn primary again" onclick={onRetry}>{t('common.retry')}</button>
      </div>
    </section>
  </main>
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
    padding: 17px 20px 17px 30px;
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
  .actions .again {
    box-shadow: 0 18px 46px rgba(76, 201, 240, 0.36);
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
    .facts p {
      animation: none;
    }
  }
</style>
