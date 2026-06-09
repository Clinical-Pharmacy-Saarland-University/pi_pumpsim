<script lang="ts">
  import { t } from '../locale.svelte'
  import { game, retry, backToStories } from '../game.svelte'
  import Backdrop from '../Backdrop.svelte'
  import StarRating from '../StarRating.svelte'

  let info = $derived(
    game.outcome === 'win'
      ? { title: 'out.win.title', sub: 'out.win.sub', cls: 'good' }
      : game.outcome === 'over'
        ? { title: 'out.over.title', sub: 'out.over.sub', cls: 'bad' }
        : { title: 'out.under.title', sub: 'out.under.sub', cls: 'warn' },
  )
</script>

<div class="outcome">
  <Backdrop />

  <div class="stage">
    <main class="content">
      <h1 class={info.cls}>{t(info.title)}</h1>
      <p class="sub">{t(info.sub, { name: t(game.patient.nameKey) })}</p>

      {#if game.outcome === 'win'}
        <StarRating score={game.stars} />
      {/if}

      <div class="dyk">
        <span class="lbl">{t('out.dyk')}</span>
        <p>{t('out.dyk.text')}</p>
        {#if game.outcome === 'win'}
          <p class="second">{t('out.dyk2.text')}</p>
          <p class="second">{t('out.dyk3.text')}</p>
        {/if}
      </div>

      <div class="actions">
        <button class="btn" onclick={backToStories}>← {t('stories.title')}</button>
        <button class="btn primary" onclick={retry}>{t('common.retry')}</button>
      </div>
    </main>
  </div>
</div>

<style>
  .outcome {
    position: relative;
    height: 100%;
    overflow: hidden;
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
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    max-width: 720px;
    justify-self: center;
    animation: beatin 0.45s cubic-bezier(0.2, 0.9, 0.3, 1) both;
  }
  h1 {
    font-size: clamp(40px, 4.6vw, 58px);
    font-weight: 900;
    line-height: 1.05;
  }
  h1.good {
    color: var(--green);
    text-shadow: 0 0 28px rgba(56, 224, 160, 0.4);
  }
  h1.warn {
    color: var(--grape);
  }
  h1.bad {
    color: var(--toxic);
    text-shadow: 0 0 28px rgba(255, 107, 122, 0.4);
  }
  .sub {
    font-size: clamp(18px, 2vw, 23px);
    line-height: 1.5;
  }
  .dyk {
    max-width: 680px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 16px 24px;
    margin-top: 4px;
  }
  .dyk .lbl {
    font-size: 13px;
    color: var(--grape);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }
  .dyk p {
    margin-top: 6px;
    font-size: 18px;
    line-height: 1.5;
  }
  .dyk .second {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
    color: var(--dim);
  }
  .actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
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
