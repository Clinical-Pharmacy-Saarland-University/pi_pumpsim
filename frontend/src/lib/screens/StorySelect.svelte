<script lang="ts">
  import { t } from '../locale.svelte'
  import { selectStory, back } from '../game.svelte'
  import { STORIES } from '../stories'
  import Backdrop from '../Backdrop.svelte'
</script>

<div class="select">
  <Backdrop />

  <!-- dir=ltr pins the back button top-left in every language (same physical-
       consistency rule as the card grid below): the ← always points toward the
       screen edge it sits on, so no RTL arrow flip either. -->
  <header dir="ltr">
    <button class="back" onclick={back}><span class="arrow">←</span>{t('common.back')}</button>
    <h1>{t('stories.title')}</h1>
    <div class="spacer"></div>
  </header>

  <!-- Idiomatic RTL: the frame (.pi) is dir="rtl" for Arabic, so this grid flows
       right-to-left and story 1 lands top-right — where an Arabic reader's eye
       starts. Inside each card, text right-aligns and the badges mirror via the
       logical CSS below. (Only the Start screen pins LTR; content screens mirror,
       which is what Arabic speakers expect.) -->
  <div class="grid">
    {#each STORIES as s, i}
      <!-- only available stories are playable; the rest are disabled and show a
           „coming soon" stamp (selectStory also early-returns while !available) -->
      <button
        class="card"
        class:soon={!s.available}
        style="--c:{s.color}; --i:{i}"
        disabled={!s.available}
        aria-disabled={!s.available}
        onclick={() => selectStory(s)}
      >
        <span class="watermark">{s.icon}</span>
        <span class="chip">{s.icon}</span>
        <span class="title">{t(s.titleKey)}</span>
        <span class="desc">{t(s.descKey)}</span>
        {#if s.available}
          <span class="badge play" aria-hidden="true">▶</span>
        {:else}
          <span class="stamp">🔒 {t('stories.soon')}</span>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .select {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 20px clamp(24px, 3vw, 44px) 26px;
    gap: 16px;
    overflow: hidden;
  }

  /* ---- header ----------------------------------------------------------- */
  header {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    animation: headin 0.5s cubic-bezier(0.2, 0.9, 0.3, 1) both;
  }
  .back {
    justify-self: start;
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 15px 24px;
    font-size: 19px;
    font-weight: 700;
    transition: transform 0.1s ease, border-color 0.2s ease, background 0.2s ease;
  }
  .back:active {
    background: var(--surface2);
    border-color: var(--spm-cyan);
    transform: scale(0.96);
  }
  h1 {
    font-weight: 900;
    text-align: center;
    letter-spacing: 0.3px;
    font-size: 36px;
    background: linear-gradient(90deg, var(--green), var(--spm-cyan-bright));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  /* ---- grid ------------------------------------------------------------- */
  .grid {
    position: relative;
    z-index: 1;
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 18px;
  }
  .card {
    position: relative;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 26px 30px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 13px;
    align-items: flex-start;
    text-align: start;
    transition: transform 0.12s ease, box-shadow 0.25s ease, border-color 0.25s ease,
      background 0.2s ease;
    animation: cardin 0.5s cubic-bezier(0.2, 0.9, 0.3, 1) both;
    animation-delay: calc(var(--i) * 0.07s);
  }

  /* big faded icon for depth, tinted by the story colour */
  .watermark {
    position: absolute;
    inset-inline-end: -18px;
    bottom: -34px;
    font-size: 190px;
    line-height: 1;
    opacity: 0.09;
    transform: rotate(-12deg);
    pointer-events: none;
  }
  .chip {
    display: grid;
    place-items: center;
    width: 86px;
    height: 86px;
    border-radius: 22px;
    font-size: 48px;
    line-height: 1;
    background: color-mix(in srgb, var(--c) 24%, transparent);
    border: 1px solid color-mix(in srgb, var(--c) 48%, transparent);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
  .title {
    font-size: 27px;
    font-weight: 800;
    line-height: 1.15;
  }
  .desc {
    font-size: 18px;
    color: var(--dim);
    line-height: 1.45;
  }

  /* every card glows in its own story colour and invites a tap */
  .card {
    border-color: color-mix(in srgb, var(--c) 55%, var(--border));
    box-shadow: 0 12px 34px color-mix(in srgb, var(--c) 20%, transparent);
  }
  .card:active {
    transform: scale(0.97);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 18px 44px color-mix(in srgb, var(--c) 32%, transparent);
  }

  .badge {
    position: absolute;
    top: 16px;
    inset-inline-end: 16px;
  }
  .badge.play {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--spm-cyan-bright), var(--spm-cyan));
    color: #04222a;
    font-size: 21px;
    padding-left: 3px;
    box-shadow: 0 6px 18px rgba(0, 190, 202, 0.5);
  }

  /* ---- „coming soon" (not yet playable) -------------------------------- */
  .card.soon {
    cursor: default;
    opacity: 0.6;
    border-color: var(--border);
    box-shadow: none;
  }
  .card.soon .chip,
  .card.soon .watermark,
  .card.soon .title,
  .card.soon .desc {
    filter: grayscale(0.65);
  }
  /* disabled buttons don't fire :active, but be explicit — no press feedback */
  .card.soon:active {
    transform: none;
    background: rgba(255, 255, 255, 0.05);
    box-shadow: none;
  }
  /* a tilted rubber-stamp across the card */
  .stamp {
    position: absolute;
    top: 50%;
    /* physical `left`, not inset-inline-start: the centering translate(-50%) is
       physical too, and in RTL the logical pair lands a full width off-center */
    left: 50%;
    transform: translate(-50%, -50%) rotate(-9deg);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 22px;
    border: 3px solid color-mix(in srgb, var(--c) 55%, var(--dim));
    border-radius: 14px;
    background: color-mix(in srgb, var(--bg0) 62%, transparent);
    color: var(--text);
    font-size: 19px;
    font-weight: 900;
    letter-spacing: 1px;
    text-transform: uppercase;
    white-space: nowrap;
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.35);
    pointer-events: none;
  }

  /* ---- keyframes -------------------------------------------------------- */
  @keyframes headin {
    from {
      opacity: 0;
      transform: translateY(-16px);
    }
  }
  @keyframes cardin {
    from {
      opacity: 0;
      transform: translateY(26px) scale(0.96);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .card,
    header {
      animation: none;
    }
  }
</style>
