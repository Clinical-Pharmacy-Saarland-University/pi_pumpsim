<script lang="ts">
  import { t } from '../locale.svelte'
  import { selectStory, back } from '../game.svelte'
  import { STORIES } from '../stories'
</script>

<div class="select">
  <header>
    <button class="back" onclick={back}>← {t('common.back')}</button>
    <h1>{t('stories.title')}</h1>
    <div class="spacer"></div>
  </header>

  <div class="grid">
    {#each STORIES as s}
      <button
        class="card"
        class:disabled={!s.available}
        style="--c:{s.color}"
        onclick={() => selectStory(s)}
        disabled={!s.available}
      >
        <div class="icon">{s.icon}</div>
        <div class="title">{t(s.titleKey)}</div>
        <div class="desc">{t(s.descKey)}</div>
        {#if !s.available}<div class="soon">{t('stories.soon')}</div>{/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .select {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 18px clamp(18px, 3vw, 36px) 24px;
    gap: 14px;
  }
  header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
  }
  .back {
    justify-self: start;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 10px 16px;
    font-weight: 600;
  }
  h1 {
    font-size: 26px;
    font-weight: 800;
    text-align: center;
  }
  .grid {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 16px;
  }
  .card {
    position: relative;
    background: var(--surface);
    border: 1px solid var(--border);
    border-left: 5px solid var(--c);
    border-radius: 18px;
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
    text-align: left;
    transition: transform 0.08s ease, background 0.2s ease;
  }
  .card:not(.disabled):hover {
    background: var(--surface2);
  }
  .card:not(.disabled):active {
    transform: scale(0.98);
  }
  .card.disabled {
    opacity: 0.45;
    cursor: default;
  }
  .icon {
    font-size: 40px;
  }
  .title {
    font-size: 20px;
    font-weight: 800;
  }
  .desc {
    font-size: 14px;
    color: var(--dim);
    line-height: 1.4;
  }
  .soon {
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--dim);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 3px 10px;
  }
</style>
