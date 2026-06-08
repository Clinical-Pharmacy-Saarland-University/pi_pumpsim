<script lang="ts">
  // The on-screen twin of the physical torso — the hero of every in-game screen.
  // A tall vessel with the fixed green band, animated liquid, rising bubbles and a
  // lively "pumping" state while the (slow) level moves toward its target.
  import { t } from './locale.svelte'
  import type { LevelState } from './types'

  let { s, compact = false }: { s: LevelState; compact?: boolean } = $props()

  const clamp = (v: number) => Math.max(0, Math.min(100, v))
  const pct = (v: number) => clamp((v / s.capacity) * 100)

  let waterH = $derived(pct(s.level))
  let bandTop = $derived(100 - pct(s.band_high))
  let bandH = $derived(pct(s.band_high) - pct(s.band_low))
  let critHigh = $derived(pct(s.critical_high))
  let critLow = $derived(pct(s.critical_low))
  let accent = $derived(
    s.zone === 'in'
      ? 'var(--green)'
      : s.zone === 'under' || s.zone === 'critical_low'
        ? 'var(--grape)'
        : 'var(--toxic)',
  )

  // art-directed bubbles (no randomness → never janky)
  const BUBBLES = [
    { x: 22, s: 9, d: 3.4, delay: 0 },
    { x: 44, s: 6, d: 2.7, delay: 0.7 },
    { x: 63, s: 11, d: 3.9, delay: 1.2 },
    { x: 78, s: 7, d: 3.0, delay: 0.3 },
    { x: 34, s: 8, d: 3.2, delay: 1.7 },
    { x: 56, s: 5, d: 2.5, delay: 1.0 },
    { x: 70, s: 9, d: 3.6, delay: 2.1 },
  ]
</script>

<div class="torso" class:compact style="--accent:{accent}">
  <div class="vessel" class:moving={s.moving} class:inband={s.in_band}>
    <!-- danger tints top & bottom -->
    <div class="tint over"></div>
    <div class="tint under"></div>

    <!-- the fixed taped therapeutic band -->
    <div class="band" style="top:{bandTop}%; height:{bandH}%">
      <span class="tape t-top"></span>
      <span class="tape t-bot"></span>
    </div>

    <!-- critical lines -->
    <div class="crit" style="bottom:{critHigh}%"></div>
    <div class="crit low" style="bottom:{critLow}%"></div>

    <!-- the liquid -->
    <div class="water" style="height:{waterH}%">
      <div class="surface"><span class="wave w1"></span><span class="wave w2"></span></div>
      {#each BUBBLES as b}
        <span class="bubble" style="left:{b.x}%; width:{b.s}px; height:{b.s}px; --d:{b.d}s; --delay:{b.delay}s"></span>
      {/each}
    </div>

    <!-- pumping direction chevrons while moving -->
    {#if s.moving}
      <div class="flow {s.direction}">
        {#each [0, 1, 2] as i}<span style="--i:{i}">{s.direction === 'in' ? '▲' : '▼'}</span>{/each}
      </div>
    {/if}
  </div>

  <div class="cap">{t('bar.title')}</div>
</div>

<style>
  .torso {
    --w: 240px;
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .torso.compact {
    --w: 150px;
  }
  .vessel {
    position: relative;
    width: var(--w);
    height: 540px;
    border-radius: 110px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
    border: 2px solid var(--border);
    box-shadow: inset 0 2px 18px rgba(0, 0, 0, 0.45), 0 18px 50px rgba(0, 0, 0, 0.45);
    overflow: hidden;
    transition: box-shadow 0.4s ease;
  }
  .torso.compact .vessel {
    height: 360px;
    border-radius: 75px;
  }
  .vessel.inband {
    box-shadow: inset 0 2px 18px rgba(0, 0, 0, 0.45), 0 0 44px color-mix(in srgb, var(--accent) 55%, transparent);
  }
  .vessel.moving {
    animation: pump 1.4s ease-in-out infinite;
  }

  .tint {
    position: absolute;
    left: 0;
    right: 0;
    pointer-events: none;
  }
  .tint.over {
    top: 0;
    height: 22%;
    background: linear-gradient(180deg, rgba(255, 107, 122, 0.16), transparent);
  }
  .tint.under {
    bottom: 0;
    height: 30%;
    background: linear-gradient(0deg, rgba(255, 183, 3, 0.12), transparent);
  }

  .band {
    position: absolute;
    left: 0;
    right: 0;
    background: var(--green-soft);
  }
  .tape {
    position: absolute;
    left: -2px;
    right: -2px;
    height: 4px;
    background: repeating-linear-gradient(90deg, var(--green-line) 0 14px, transparent 14px 22px);
  }
  .tape.t-top {
    top: -2px;
  }
  .tape.t-bot {
    bottom: -2px;
  }
  .crit {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: repeating-linear-gradient(90deg, var(--toxic) 0 8px, transparent 8px 16px);
    opacity: 0.5;
  }
  .crit.low {
    background: repeating-linear-gradient(90deg, var(--grape) 0 8px, transparent 8px 16px);
  }

  .water {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, var(--water-top), var(--water-bot));
    box-shadow: 0 0 30px color-mix(in srgb, var(--accent) 45%, transparent);
    transition: height 0.12s linear, box-shadow 0.4s ease;
  }
  .surface {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 0;
  }
  .wave {
    position: absolute;
    left: 50%;
    top: 0;
    width: 360px;
    height: 360px;
    transform: translate(-50%, -50%);
    border-radius: 43%;
    background: color-mix(in srgb, var(--water-top) 70%, #fff);
    opacity: 0.5;
    animation: slosh 7s linear infinite;
  }
  .wave.w2 {
    width: 420px;
    height: 420px;
    opacity: 0.28;
    animation-duration: 11s;
    animation-direction: reverse;
  }
  .bubble {
    position: absolute;
    bottom: 4px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.25));
    opacity: 0;
    animation: rise var(--d) linear var(--delay) infinite;
  }
  .vessel.moving .bubble {
    animation-duration: calc(var(--d) * 0.55);
  }

  .flow {
    position: absolute;
    inset-inline-end: 14px;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--accent);
    font-size: 22px;
    text-shadow: 0 0 10px var(--accent);
  }
  .flow.out {
    flex-direction: column-reverse;
  }
  .flow span {
    opacity: 0.25;
    animation: chev 1.1s ease-in-out infinite;
    animation-delay: calc(var(--i) * 0.18s);
  }
  .cap {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--dim);
  }

  @keyframes slosh {
    from { transform: translate(-50%, -50%) rotate(0); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
  @keyframes rise {
    0% { transform: translateY(0) scale(0.6); opacity: 0; }
    15% { opacity: 0.85; }
    85% { opacity: 0.5; }
    100% { transform: translateY(-440px) scale(1.1); opacity: 0; }
  }
  @keyframes pump {
    50% { box-shadow: inset 0 2px 18px rgba(0, 0, 0, 0.45), 0 0 60px color-mix(in srgb, var(--accent) 70%, transparent); }
  }
  @keyframes chev {
    50% { opacity: 1; transform: translateY(-4px); }
  }
  @media (prefers-reduced-motion: reduce) {
    .wave, .bubble, .vessel.moving, .flow span { animation: none; }
  }
</style>
