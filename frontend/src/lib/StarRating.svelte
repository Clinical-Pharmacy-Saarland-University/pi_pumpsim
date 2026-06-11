<script lang="ts">
  // Shared outcome rating: three stars that fill in 0.5 steps (a half star is a
  // clipped gold overlay), plus the age-adaptive rank TITLE next to them. Used by
  // story 1 (Outcome) and every v2 story so the look + titles stay consistent.
  import { t } from './locale.svelte'
  import { rankKey, formatStars } from './flow'

  let {
    score,
    showTitle = true,
    size = 56,
  }: { score: number; showTitle?: boolean; size?: number } = $props()

  const SLOTS = [0, 1, 2]
  // 0..1 fill for star i (i=0 is the first star): score 2.5 → [1, 1, 0.5]
  const fillOf = (i: number) => Math.max(0, Math.min(1, score - i))
  // A geometric 50% clip of this star glyph reads too heavy because the glow and
  // left-side points carry more visual weight. Pull fractional fills back a touch.
  const paintOf = (i: number) => {
    const f = fillOf(i)
    return f > 0 && f < 1 ? f * 0.86 : f
  }
  let title = $derived(t(rankKey(score)))
  let countLabel = $derived(t('out.stars', { n: formatStars(score) }))
</script>

<div class="rating" style="--sz:{size}px" role="img" aria-label={`${countLabel} — ${title}`}>
  <div class="stars">
    {#each SLOTS as i}
      <span
        class="star"
        class:lit={fillOf(i) > 0}
        class:full={fillOf(i) >= 1}
        class:partial={fillOf(i) > 0 && fillOf(i) < 1}
        style="--i:{i}; --fill:{paintOf(i) * 100}%"
      >★</span>
    {/each}
  </div>
  {#if showTitle}
    <div class="title">
      <span class="lbl">{t('out.rankLabel')}</span>
      <span class="name">{title}</span>
      <span class="count">{countLabel}</span>
    </div>
  {/if}
</div>

<style>
  .rating {
    display: flex;
    align-items: center;
    gap: clamp(14px, 1.6vw, 26px);
    flex-wrap: wrap;
  }
  .stars {
    display: flex;
    gap: 8px;
    font-size: var(--sz);
    line-height: 1;
  }
  .star {
    position: relative;
    display: inline-block;
    width: 1em;
    height: 1em;
    background: linear-gradient(90deg, var(--grape) 0 var(--fill), rgba(255, 255, 255, 0.17) var(--fill) 100%);
    background-clip: text;
    color: transparent;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .star.full {
    filter: drop-shadow(0 0 12px rgba(255, 183, 3, 0.42));
  }
  .star.partial {
    filter: drop-shadow(0 0 5px rgba(255, 183, 3, 0.18));
  }
  .star.lit {
    animation: pop 0.45s cubic-bezier(0.2, 1.5, 0.4, 1) both;
    animation-delay: calc(var(--i) * 0.15s + 0.2s);
  }

  .title {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .title .lbl {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--grape);
  }
  .title .name {
    font-size: clamp(20px, 2.2vw, 28px);
    font-weight: 900;
    line-height: 1.1;
    color: var(--text);
  }
  .title .count {
    font-size: 13px;
    color: var(--dim);
  }

  @keyframes pop {
    from {
      opacity: 0;
      transform: scale(0.2) rotate(-25deg);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .star.lit {
      animation: none;
    }
  }
</style>
