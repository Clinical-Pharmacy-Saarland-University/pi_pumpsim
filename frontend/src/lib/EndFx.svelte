<script lang="ts">
  // Outcome-screen effect layer, one treatment per outcome:
  //   win   → confetti  (fluttering confetti rain in brand colours)
  //   over  → siren     (rotating warning-light beams + red edge vignette)
  //   under → sink      (cold motes settling + the waterline draining away)
  // All animations are transform/opacity only (the Pi GPU chokes on animated
  // filters/blur), with art-directed seeded layouts so every run looks identical.
  let { variant }: { variant: 'confetti' | 'siren' | 'sink' } = $props()

  // tiny deterministic PRNG (mulberry32) — "random" layouts that never change
  function rng(seed: number) {
    return () => {
      seed |= 0
      seed = (seed + 0x6d2b79f5) | 0
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  const CONFETTI_COLORS = [
    'var(--spm-cyan)',
    'var(--spm-cyan-bright)',
    'var(--green)',
    'var(--grape)',
    'var(--water-bot)',
    '#ffffff',
  ]
  const r1 = rng(7)
  const CONFETTI = Array.from({ length: 46 }, (_, i) => ({
    x: r1() * 100,
    w: 8 + r1() * 8,
    h: 5 + r1() * 6,
    dur: 3.4 + r1() * 2.8,
    delay: r1() * 4.5,
    flut: 0.7 + r1() * 0.7,
    rz: -40 + r1() * 80,
    swx: -34 + r1() * 68,
    round: i % 5 === 0,
    c: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }))

  // cold motes sinking down
  const r7 = rng(42)
  const MOTES = Array.from({ length: 16 }, (_, i) => ({
    x: 2 + r7() * 96,
    s: 4 + r7() * 7,
    dur: 7 + r7() * 6,
    delay: r7() * 7,
    sw: -20 + r7() * 40,
    c: i % 3 === 0 ? 'rgba(76,201,240,.55)' : 'rgba(154,166,201,.5)',
  }))
</script>

<div class="fx" aria-hidden="true">
  {#if variant === 'confetti'}
    <!-- outer span falls, inner span flutters -->
    {#each CONFETTI as p}
      <span
        class="cf"
        style="left:{p.x}%; --dur:{p.dur}s; --delay:{p.delay}s;"
      >
        <span
          class="cf-i"
          class:round={p.round}
          style="width:{p.w}px; height:{p.h}px; background:{p.c};
                 --flut:{p.flut}s; --rz:{p.rz}deg; --swx:{p.swx}px;"
        ></span>
      </span>
    {/each}
  {:else if variant === 'siren'}
    <div class="beacon beacon-a"></div>
    <div class="beacon beacon-b"></div>
  {:else if variant === 'sink'}
    <div class="cold-band"></div>
    {#each MOTES as m}
      <span class="mote" style="left:{m.x}%; width:{m.s}px; height:{m.s}px; background:{m.c}; --dur:{m.dur}s; --delay:{m.delay}s; --sw:{m.sw}px;"></span>
    {/each}
    <div class="drain"></div>
  {/if}
</div>

{#if variant === 'siren'}
  <!-- the vignette sits ABOVE the content so it frames the whole screen -->
  <div class="fx-over vignette" aria-hidden="true"></div>
{/if}

<style>
  .fx {
    position: absolute;
    inset: 0;
    z-index: 0; /* above Backdrop (also z 0, earlier in DOM), below the board (z 1) */
    pointer-events: none;
    overflow: hidden;
  }
  .fx-over {
    position: absolute;
    inset: 0;
    z-index: 2; /* edge-only treatment may sit above the content */
    pointer-events: none;
  }

  /* ---------- win: confetti ---------- */
  .cf {
    position: absolute;
    top: -30px;
    will-change: transform;
    animation: cf-fall var(--dur) linear var(--delay) infinite;
  }
  .cf-i {
    display: block;
    border-radius: 2px;
    will-change: transform;
    animation: cf-flutter var(--flut) ease-in-out infinite alternate;
  }
  .cf-i.round {
    border-radius: 50%;
  }
  @keyframes cf-fall {
    to {
      transform: translateY(800px);
    }
  }
  @keyframes cf-flutter {
    from {
      transform: rotate(var(--rz)) rotateX(0deg) translateX(0);
    }
    to {
      transform: rotate(calc(var(--rz) * -1)) rotateX(180deg) translateX(var(--swx));
    }
  }

  /* ---------- over: siren ---------- */
  .vignette {
    background: radial-gradient(120% 120% at 50% 50%, transparent 62%, rgba(255, 45, 70, 0.26) 100%);
  }
  .beacon {
    position: absolute;
    width: 1700px;
    height: 1700px;
    border-radius: 50%;
    background: conic-gradient(
      from 0deg,
      rgba(255, 60, 80, 0.34) 0deg 26deg,
      transparent 26deg 180deg,
      rgba(255, 60, 80, 0.22) 180deg 206deg,
      transparent 206deg 360deg
    );
    -webkit-mask: radial-gradient(circle, #000 0 42%, transparent 70%);
    mask: radial-gradient(circle, #000 0 42%, transparent 70%);
    will-change: transform;
  }
  .beacon-a {
    top: -1100px;
    left: calc(18% - 850px);
    animation: beacon-spin 4s linear infinite;
  }
  .beacon-b {
    top: -1100px;
    right: calc(18% - 850px);
    animation: beacon-spin 4s linear infinite reverse;
  }
  @keyframes beacon-spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* ---------- under: sink ---------- */
  .cold-band {
    position: absolute;
    left: -25%;
    top: 8%;
    width: 150%;
    height: 40%;
    border-radius: 50%;
    background: linear-gradient(90deg, transparent, rgba(76, 201, 240, 0.08) 35%, rgba(154, 166, 201, 0.08) 70%, transparent);
    transform: skewY(-5deg);
    will-change: transform;
    animation: band-drift 12s ease-in-out infinite alternate;
  }
  @keyframes band-drift {
    from {
      transform: skewY(-5deg) translateX(-6%);
    }
    to {
      transform: skewY(-5deg) translateX(6%);
    }
  }
  .mote {
    position: absolute;
    top: -16px;
    border-radius: 50%;
    opacity: 0;
    will-change: transform, opacity;
    animation: mote-sink var(--dur) linear var(--delay) infinite;
  }
  @keyframes mote-sink {
    0% {
      transform: translate(0, 0);
      opacity: 0;
    }
    12% {
      opacity: 0.7;
    }
    50% {
      transform: translate(var(--sw), 390px);
    }
    88% {
      opacity: 0.45;
    }
    100% {
      transform: translate(0, 780px);
      opacity: 0;
    }
  }
  .drain {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 150px;
    background: linear-gradient(180deg, transparent, rgba(76, 201, 240, 0.28));
    transform-origin: bottom;
    will-change: transform, opacity;
    animation: drain 4.5s ease-in-out infinite alternate;
  }
  @keyframes drain {
    from {
      transform: scaleY(1);
      opacity: 0.9;
    }
    to {
      transform: scaleY(0.25);
      opacity: 0.4;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .fx :global(*) {
      animation: none !important;
    }
  }
</style>
