<script lang="ts">
  import { t } from '../locale.svelte'
  import { game, retry, backToStories } from '../game.svelte'

  let info = $derived(
    game.outcome === 'win'
      ? { title: 'out.win.title', sub: 'out.win.sub', cls: 'good' }
      : game.outcome === 'over'
        ? { title: 'out.over.title', sub: 'out.over.sub', cls: 'bad' }
        : { title: 'out.under.title', sub: 'out.under.sub', cls: 'warn' },
  )
</script>

<div class="screen">
  <h1 class={info.cls}>{t(info.title)}</h1>
  <p class="sub">{t(info.sub, { name: t(game.patient.nameKey) })}</p>

  {#if game.outcome === 'win'}
    <div class="stars">
      {#each [0, 1, 2] as i}<span class:on={i < game.stars}>★</span>{/each}
    </div>
    <div class="count">{t('out.stars', { n: game.stars })}</div>
  {/if}

  <div class="dyk">
    <span class="lbl">{t('out.dyk')}</span>
    <p>{t('out.dyk.text')}</p>
  </div>

  <div class="actions">
    <button class="btn" onclick={backToStories}>← {t('stories.title')}</button>
    <button class="btn primary" onclick={retry}>{t('common.retry')}</button>
  </div>
</div>

<style>
  .screen {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    text-align: center;
    padding: 30px;
  }
  h1 {
    font-size: 46px;
    font-weight: 800;
  }
  h1.good {
    color: var(--green);
  }
  h1.warn {
    color: var(--grape);
  }
  h1.bad {
    color: var(--toxic);
  }
  .sub {
    font-size: 20px;
    color: var(--text);
    max-width: 620px;
  }
  .stars {
    font-size: 56px;
    letter-spacing: 8px;
  }
  .stars span {
    color: var(--surface2);
  }
  .stars span.on {
    color: var(--grape);
    text-shadow: 0 0 16px rgba(255, 183, 3, 0.5);
  }
  .count {
    font-size: 16px;
    color: var(--dim);
  }
  .dyk {
    max-width: 640px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 16px 24px;
    margin-top: 6px;
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
  .actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }
</style>
