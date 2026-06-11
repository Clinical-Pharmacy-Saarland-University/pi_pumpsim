<script lang="ts">
  // Shared layout shell for every story screen — the blueprint base.
  // Gives each story its own identity (a soft per-story colour aura filling the
  // frame, from the story's `color`), a persistent case header with progress
  // dots, and one roomy, consistent content area. No on-screen torso — the
  // physical pump is the instrument; this just frames the task and the cues.
  import type { Snippet } from 'svelte'
  import { t } from './locale.svelte'

  let {
    color = 'var(--spm-cyan)',
    kicker = '',
    caseLine = '',
    step = 0,
    total = 0,
    onCancel,
    children,
  }: {
    color?: string
    kicker?: string
    caseLine?: string
    step?: number
    total?: number
    onCancel?: () => void
    children?: Snippet
  } = $props()

  // art-directed (fixed positions/timings → lively but never random/janky): a calm
  // take on the old animated backdrop — drifting pills + rising bubbles tinted to the
  // story colour, layered OVER the static aura. No heavy blur (kept light for the Pi).
  const PILLS = [
    { x: 6, y: 15, w: 74, rot: -20, dur: 15, delay: 0, op: 0.2, c1: 'var(--story)', c2: '#ffffff' },
    { x: 87, y: 12, w: 58, rot: 26, dur: 17, delay: 1.6, op: 0.16, c1: 'var(--spm-cyan)', c2: 'var(--story)' },
    { x: 91, y: 62, w: 84, rot: -12, dur: 19, delay: 0.7, op: 0.14, c1: 'var(--story)', c2: 'var(--water-bot)' },
    { x: 4, y: 68, w: 62, rot: 16, dur: 16, delay: 2.3, op: 0.17, c1: 'var(--water-top)', c2: 'var(--story)' },
    { x: 18, y: 89, w: 52, rot: -32, dur: 18, delay: 1.0, op: 0.13, c1: 'var(--story)', c2: '#ffffff' },
    { x: 73, y: 90, w: 66, rot: 14, dur: 20, delay: 2.9, op: 0.12, c1: 'var(--spm-cyan)', c2: 'var(--story)' },
  ]
  const BUBBLES = [
    { x: 13, s: 9, dur: 11, delay: 0 },
    { x: 31, s: 6, dur: 9, delay: 2.5 },
    { x: 58, s: 8, dur: 13, delay: 4.5 },
    { x: 79, s: 6, dur: 10, delay: 1.4 },
    { x: 93, s: 7, dur: 14, delay: 3.2 },
  ]
</script>

<div class="shell" style="--story:{color}">
  <div class="bg" aria-hidden="true">
    {#each PILLS as p}
      <div
        class="pill"
        style="left:{p.x}%; top:{p.y}%; width:{p.w}px; --rot:{p.rot}deg; --dur:{p.dur}s;
               --delay:{p.delay}s; --op:{p.op};
               background:linear-gradient(115deg, {p.c1} 0 49%, {p.c2} 51% 100%);"
      ></div>
    {/each}
    {#each BUBBLES as b}
      <span class="bubble" style="left:{b.x}%; width:{b.s}px; height:{b.s}px; --dur:{b.dur}s; --delay:{b.delay}s;"></span>
    {/each}
  </div>

  <header class="topbar">
    {#if onCancel}
      <button class="x" onclick={onCancel} aria-label={t('common.back')}>✕</button>
    {/if}
    <div class="ident">
      {#if kicker}<span class="kick">{kicker}</span>{/if}
      {#if caseLine}<span class="case">{caseLine}</span>{/if}
    </div>
    {#if total > 0}
      <div class="steps" aria-label={`Schritt ${step} von ${total}`}>
        {#each Array(total) as _, i}
          <span class="dot" class:on={i < step} class:now={i === step - 1}></span>
        {/each}
      </div>
    {/if}
  </header>

  <main class="content">
    {@render children?.()}
  </main>
</div>

<style>
  .shell {
    position: relative;
    height: 100%;
    overflow: hidden;
    display: grid;
    grid-template-rows: auto 1fr;
  }

  /* per-story atmosphere: a calm colour aura + base wash, instead of a busy
     pill backdrop — fills the whole frame so the screen never feels empty */
  .bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    background:
      radial-gradient(80% 60% at 12% -8%, color-mix(in srgb, var(--story) 26%, transparent), transparent 70%),
      radial-gradient(70% 70% at 100% 108%, color-mix(in srgb, var(--story) 16%, transparent), transparent 72%),
      radial-gradient(120% 100% at 50% 50%, var(--bg1), var(--bg0));
  }
  /* faint grain so the gradients don't band on the kiosk panel */
  .bg::after {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.04;
    background-image: radial-gradient(circle at 50% 50%, #fff 0.6px, transparent 0.7px);
    background-size: 4px 4px;
  }

  /* drifting pills + rising bubbles over the aura — the „animation" the kiosk had */
  .bg .pill {
    position: absolute;
    aspect-ratio: 5 / 2;
    height: auto;
    border-radius: 999px;
    opacity: var(--op);
    transform: rotate(var(--rot));
    filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.3));
    will-change: transform;
    animation: floatpill var(--dur) ease-in-out var(--delay) infinite;
  }
  .bg .pill::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.5), transparent 45%);
    mix-blend-mode: overlay;
  }
  .bg .bubble {
    position: absolute;
    bottom: -18px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.85), color-mix(in srgb, var(--story) 45%, transparent));
    opacity: 0;
    will-change: transform, opacity;
    animation: rise var(--dur) linear var(--delay) infinite;
  }
  @keyframes floatpill {
    50% { transform: rotate(var(--rot)) translateY(-24px) translateX(10px); }
  }
  @keyframes rise {
    0% { transform: translateY(0) scale(0.6); opacity: 0; }
    15% { opacity: 0.7; }
    85% { opacity: 0.4; }
    100% { transform: translateY(-560px) scale(1.1); opacity: 0; }
  }

  .topbar {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: var(--sp-3);
    padding: 18px 28px;
  }
  .x {
    flex: none;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--dim);
    font-size: 18px;
    font-weight: 800;
  }
  .x:active {
    transform: scale(0.94);
  }
  .ident {
    display: flex;
    align-items: baseline;
    gap: var(--sp-2);
    min-width: 0;
    flex: 1;
  }
  .kick {
    flex: none;
    padding: 6px 14px;
    border-radius: var(--r-pill);
    background: color-mix(in srgb, var(--story) 18%, transparent);
    border: 1px solid color-mix(in srgb, var(--story) 50%, transparent);
    color: color-mix(in srgb, var(--story) 72%, var(--text));
    font-size: var(--fs-micro);
    font-weight: 900;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .case {
    font-size: var(--fs-small);
    font-weight: 700;
    color: var(--dim);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .steps {
    flex: none;
    display: flex;
    gap: 7px;
  }
  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--border);
    transition: background 0.3s ease, transform 0.3s ease;
  }
  .dot.on {
    background: color-mix(in srgb, var(--story) 70%, var(--text));
  }
  .dot.now {
    transform: scale(1.35);
    box-shadow: 0 0 10px color-mix(in srgb, var(--story) 70%, transparent);
  }

  .content {
    position: relative;
    z-index: 1;
    min-height: 0;
    display: grid;
    align-items: center;
    padding: 4px clamp(40px, 6vw, 92px) 40px;
  }

  @media (prefers-reduced-motion: reduce) {
    .dot {
      transition: none;
    }
    .bg .pill,
    .bg .bubble {
      animation: none;
    }
  }
</style>
