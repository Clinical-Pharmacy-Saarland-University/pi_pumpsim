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

  // The capsule's face reacts to its own level: sleepy with too little drug, hopeful on
  // the way up, happy in the band, worried above it, dizzy past the red line. The pupils
  // follow the pump (up while filling, down while draining). Purely decorative.
  type Mood = 'sleepy' | 'hopeful' | 'happy' | 'worried' | 'dizzy'
  let mood = $derived<Mood>(
    s.zone === 'critical_low'
      ? 'sleepy'
      : s.zone === 'under'
        ? 'hopeful'
        : s.zone === 'in'
          ? 'happy'
          : s.zone === 'over'
            ? 'worried'
            : 'dizzy',
  )
  let gaze = $derived(
    s.moving ? (s.direction === 'in' ? -6 : 6) : mood === 'hopeful' ? -3 : mood === 'sleepy' ? 3 : 0,
  )

  // face geometry (viewBox 0 0 120 64): two eyes on one line
  const EYES = [34, 86]
  const CY = 36
  // upper eyelid closed down to `frac` of the eye's height: the part of the ellipse above it
  function lid(cx: number, rx: number, ry: number, frac: number): string {
    const y = CY - ry + 2 * ry * frac
    const dx = rx * Math.sqrt(Math.max(0, 1 - ((y - CY) / ry) ** 2))
    return `M ${cx - dx} ${y} A ${rx} ${ry} 0 ${frac > 0.5 ? 1 : 0} 1 ${cx + dx} ${y} Z`
  }
  // dizzy eyes: a two-turn spiral around each eye centre
  const SPIRALS = EYES.map((cx) => {
    const pts = Array.from({ length: 41 }, (_, i) => {
      const a = (i / 40) * Math.PI * 4
      const r = 2 + (i / 40) * 15
      return `${(cx + r * Math.cos(a)).toFixed(1)} ${(CY + r * Math.sin(a)).toFixed(1)}`
    })
    return `M ${pts.join(' L ')}`
  })
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

    <!-- the capsule's face -->
    <svg class="face {mood}" viewBox="0 0 120 64" aria-hidden="true">
      {#key mood}
        <g class="mood">
          {#if mood === 'happy'}
            {#each EYES as cx}
              <path class="arc" d="M {cx - 15} {CY + 6} Q {cx} {CY - 20} {cx + 15} {CY + 6}" />
              <ellipse class="blush" cx={cx < 60 ? cx - 6 : cx + 6} cy={CY + 20} rx="9" ry="4.5" />
            {/each}
          {:else if mood === 'dizzy'}
            {#each SPIRALS as d}<path class="spiral" {d} />{/each}
          {:else}
            {@const big = mood === 'worried'}
            {#each EYES as cx, i}
              <g class="eye">
                <ellipse class="white" {cx} cy={CY} rx={big ? 20 : 18} ry={big ? 23 : 20} />
                <g class="pupil" style="transform: translateY({gaze}px)">
                  <circle {cx} cy={CY} r={big ? 6 : 8.5} />
                  <circle class="glint" cx={cx - 3} cy={CY - 3} r="2.6" />
                </g>
                {#if mood === 'sleepy'}<path class="lid" d={lid(cx, 18, 20, 0.55)} />{/if}
                {#if big}
                  <path
                    class="brow"
                    d={i === 0
                      ? `M ${cx - 17} ${CY - 22} L ${cx + 11} ${CY - 33}`
                      : `M ${cx - 11} ${CY - 33} L ${cx + 17} ${CY - 22}`}
                  />
                {/if}
              </g>
            {/each}
          {/if}
        </g>
      {/key}
      {#if mood === 'sleepy' && !s.moving}<text class="zzz" x="108" y="14">z</text>{/if}
    </svg>

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

  /* the band + red lines are tape on the OUTSIDE of the torso: draw them over the water */
  .band {
    position: absolute;
    z-index: 1;
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
    z-index: 1;
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
    overflow: hidden; /* keep the slosh + bubbles inside the water, so the surface reads true */
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

  /* the face sits in the dome, above the red line, drawn over everything */
  .face {
    position: absolute;
    z-index: 2;
    top: 6%;
    left: 50%;
    width: calc(var(--w) * 0.55);
    transform: translateX(-50%);
    overflow: visible;
    pointer-events: none;
  }
  .face .mood {
    transform-box: fill-box;
    transform-origin: center;
    animation: pop 0.35s ease-out;
  }
  .face .white {
    fill: #f4f7ff;
    stroke: #0b1020;
    stroke-width: 2.5;
  }
  .face .pupil {
    fill: #0b1020;
    transition: transform 0.5s ease;
  }
  .face .glint {
    fill: #fff;
  }
  .face .eye {
    transform-box: fill-box;
    transform-origin: center;
    animation: blink 4.6s ease-in-out infinite;
  }
  .face.sleepy .eye {
    animation: none;
  }
  .face .lid {
    fill: #2a3354;
    stroke: #0b1020;
    stroke-width: 2;
  }
  .face .brow,
  .face .arc,
  .face .spiral {
    fill: none;
    stroke: #f4f7ff;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .face .brow {
    stroke-width: 4;
  }
  .face .arc {
    stroke-width: 5;
  }
  .face .spiral {
    stroke-width: 3.2;
    transform-box: fill-box;
    transform-origin: center;
    animation: spin 1.6s linear infinite;
  }
  .face .blush {
    fill: #ff8fab;
    opacity: 0.55;
  }
  .face .zzz {
    fill: var(--dim);
    font-size: 15px;
    font-weight: 800;
    animation: zz 2.4s ease-in-out infinite;
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
  @keyframes pop {
    from { transform: scale(0.6); opacity: 0; }
  }
  @keyframes blink {
    0%, 92%, 100% { transform: scaleY(1); }
    96% { transform: scaleY(0.08); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes zz {
    0% { transform: translate(0, 6px); opacity: 0; }
    40% { opacity: 1; }
    100% { transform: translate(6px, -10px); opacity: 0; }
  }
  @media (prefers-reduced-motion: reduce) {
    .wave, .bubble, .vessel.moving, .flow span { animation: none; }
    .face .mood, .face .eye, .face .spiral, .face .zzz { animation: none; }
  }
</style>
