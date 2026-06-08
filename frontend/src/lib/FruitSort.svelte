<script lang="ts">
  // The finale: a grid of fruit photos. Tap every fruit that interacts like
  // grapefruit (CYP3A4), then confirm. Teaches "it's not all citrus".
  import { t } from './locale.svelte'
  import { game, fruitsDone } from './game.svelte'
  import type { Fruit } from './events'

  let fg = $derived(game.events[game.idx].fruitGame!)
  let selected = $state(new Set<string>())
  let confirmed = $state(false)
  let correct = $state(false)

  function toggle(id: string) {
    if (confirmed) return
    const s = new Set(selected)
    if (s.has(id)) s.delete(id)
    else s.add(id)
    selected = s
  }
  function confirm() {
    if (confirmed) return
    correct = fg.fruits.every((f) => f.interacts === selected.has(f.id))
    confirmed = true
  }
  const tileRight = (f: Fruit) => f.interacts === selected.has(f.id)
</script>

<div class="fruits">
  {#if !confirmed}
    <h2>{t(fg.promptKey)}</h2>
  {:else}
    <div class="fb {correct ? 'good' : 'bad'}">
      {correct ? t('fruits.correct') : t('fruits.wrong')}
    </div>
  {/if}

  <div class="grid">
    {#each fg.fruits as f}
      <button
        class="tile"
        class:sel={selected.has(f.id) && !confirmed}
        class:culprit={confirmed && f.interacts}
        class:safe={confirmed && !f.interacts}
        disabled={confirmed}
        onclick={() => toggle(f.id)}
      >
        <img src={f.img} alt={t(f.labelKey)} />
        <span class="name">{t(f.labelKey)}</span>
        {#if selected.has(f.id) && !confirmed}<span class="pick">✓</span>{/if}
        {#if confirmed}
          <span class="mark {tileRight(f) ? 'ok' : 'no'}">{tileRight(f) ? '✓' : '✗'}</span>
          {#if f.interacts}<span class="tag">{t('fruits.badge')}</span>{/if}
        {/if}
      </button>
    {/each}
  </div>

  {#if !confirmed}
    <button class="btn primary" onclick={confirm} disabled={selected.size === 0}>
      {t('fruits.confirm')}
    </button>
    <p class="credit">{t('fruits.credit')}</p>
  {:else}
    <p class="lesson">{t(fg.lessonKey)}</p>
    <button class="btn primary" onclick={() => fruitsDone(correct)}>{t('common.next')}</button>
  {/if}
</div>

<style>
  .fruits {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    width: 100%;
    text-align: center;
  }
  h2 {
    font-size: 26px;
    font-weight: 800;
    max-width: 760px;
  }
  .fb {
    font-size: 26px;
    font-weight: 800;
  }
  .fb.good {
    color: var(--green);
  }
  .fb.bad {
    color: var(--toxic);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    width: 100%;
    max-width: 720px;
  }
  .tile {
    position: relative;
    padding: 0;
    border: 3px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    background: var(--surface);
    transition: transform 0.1s ease, border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  }
  .tile img {
    display: block;
    width: 100%;
    height: 120px;
    object-fit: cover;
  }
  .tile .name {
    display: block;
    padding: 8px 6px;
    font-size: 16px;
    font-weight: 700;
  }
  .tile:active {
    transform: scale(0.97);
  }
  .tile.sel {
    border-color: var(--spm-cyan);
    box-shadow: 0 0 0 2px var(--spm-cyan), 0 8px 22px rgba(0, 190, 202, 0.3);
  }
  .tile.culprit {
    border-color: var(--toxic);
    box-shadow: 0 0 16px rgba(255, 107, 122, 0.45);
  }
  .tile.safe {
    opacity: 0.55;
  }
  /* selection check (pre-confirm) */
  .pick {
    position: absolute;
    top: 6px;
    inset-inline-end: 6px;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: var(--spm-cyan);
    color: #04222a;
    font-weight: 900;
    display: grid;
    place-items: center;
  }
  /* per-tile correctness (post-confirm) */
  .mark {
    position: absolute;
    top: 6px;
    inset-inline-start: 6px;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    font-weight: 900;
    display: grid;
    place-items: center;
    color: #fff;
  }
  .mark.ok {
    background: var(--green);
    color: #04221a;
  }
  .mark.no {
    background: var(--toxic);
  }
  .tag {
    position: absolute;
    bottom: 40px;
    inset-inline: 0;
    margin: 0 6px;
    background: rgba(255, 107, 122, 0.92);
    color: #fff;
    font-size: 12px;
    font-weight: 800;
    padding: 2px 0;
    border-radius: 6px;
  }
  .lesson {
    font-size: 19px;
    line-height: 1.5;
    max-width: 720px;
  }
  .credit {
    font-size: 12px;
    color: var(--dim);
  }
</style>
