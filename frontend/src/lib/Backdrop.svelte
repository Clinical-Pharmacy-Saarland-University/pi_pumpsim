<script lang="ts">
  // Shared animated game background — used on every screen so the look stays
  // consistent. Lives behind the content (z-index 0); the screen container must
  // be position:relative with its content at z-index 1. Art-directed (fixed
  // positions/timings) so it's lively but never random or janky.
  const PILLS = [
    { x: 6, y: 16, w: 78, rot: -22, dur: 12, delay: 0, c1: 'var(--spm-cyan)', c2: '#ffffff', op: 0.22 },
    { x: 84, y: 12, w: 62, rot: 28, dur: 14, delay: 1.5, c1: 'var(--water-bot)', c2: 'var(--spm-cyan)', op: 0.2 },
    { x: 90, y: 60, w: 88, rot: -12, dur: 16, delay: 0.6, c1: 'var(--green)', c2: '#ffffff', op: 0.18 },
    { x: 3, y: 64, w: 66, rot: 18, dur: 13, delay: 2.2, c1: 'var(--meto)', c2: 'var(--water-top)', op: 0.2 },
    { x: 18, y: 86, w: 54, rot: -34, dur: 15, delay: 1, c1: 'var(--spm-cyan)', c2: 'var(--water-bot)', op: 0.16 },
    { x: 73, y: 88, w: 70, rot: 14, dur: 17, delay: 2.8, c1: 'var(--grape)', c2: '#ffffff', op: 0.15 },
    { x: 48, y: 6, w: 50, rot: 40, dur: 11, delay: 0.3, c1: 'var(--water-top)', c2: 'var(--meto)', op: 0.18 },
    { x: 60, y: 40, w: 44, rot: -8, dur: 18, delay: 3.4, c1: 'var(--spm-cyan)', c2: '#ffffff', op: 0.12 },
  ]
  const BUBBLES = [
    { x: 12, s: 10, dur: 9, delay: 0 },
    { x: 28, s: 6, dur: 7, delay: 2 },
    { x: 44, s: 8, dur: 11, delay: 4 },
    { x: 58, s: 5, dur: 8, delay: 1 },
    { x: 71, s: 9, dur: 10, delay: 3 },
    { x: 86, s: 6, dur: 6.5, delay: 5 },
    { x: 95, s: 7, dur: 12, delay: 1.5 },
  ]
</script>

<div class="backdrop" aria-hidden="true">
  <div class="orb orb-a"></div>
  <div class="orb orb-b"></div>
  {#each PILLS as p}
    <div
      class="pill"
      style="left:{p.x}%; top:{p.y}%; width:{p.w}px;
             --rot:{p.rot}deg; --dur:{p.dur}s; --delay:{p.delay}s; --op:{p.op};
             background:linear-gradient(115deg, {p.c1} 0 49%, {p.c2} 51% 100%);"
    ></div>
  {/each}
  {#each BUBBLES as b}
    <span
      class="bubble"
      style="left:{b.x}%; width:{b.s}px; height:{b.s}px; --dur:{b.dur}s; --delay:{b.delay}s;"
    ></span>
  {/each}
  <div class="waterline"></div>
</div>

<style>
  .backdrop {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
  }
  .orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    will-change: transform, opacity;
    animation: orb 9s ease-in-out infinite;
  }
  .orb-a {
    top: -140px;
    left: -120px;
    width: 460px;
    height: 460px;
    background: radial-gradient(circle, rgba(0, 190, 202, 0.45), transparent 70%);
  }
  .orb-b {
    bottom: -180px;
    right: -120px;
    width: 520px;
    height: 520px;
    background: radial-gradient(circle, rgba(124, 92, 255, 0.4), transparent 70%);
    animation-delay: 2.5s;
  }
  .pill {
    position: absolute;
    aspect-ratio: 5 / 2;
    height: auto;
    border-radius: 999px;
    opacity: var(--op);
    transform: rotate(var(--rot));
    filter: blur(0.4px) drop-shadow(0 6px 14px rgba(0, 0, 0, 0.35));
    will-change: transform;
    animation: floatpill var(--dur) ease-in-out var(--delay) infinite;
  }
  /* the seam + a glossy highlight, so the capsule reads as a 3D pill */
  .pill::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.5), transparent 45%);
    mix-blend-mode: overlay;
  }
  .bubble {
    position: absolute;
    bottom: -20px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.9), rgba(0, 190, 202, 0.35));
    opacity: 0;
    will-change: transform, opacity;
    animation: rise var(--dur) linear var(--delay) infinite;
  }
  .waterline {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 120px;
    background: linear-gradient(180deg, transparent, rgba(0, 190, 202, 0.1));
    -webkit-mask: linear-gradient(180deg, transparent, #000);
    mask: linear-gradient(180deg, transparent, #000);
  }

  @keyframes floatpill {
    50% {
      transform: rotate(var(--rot)) translateY(-26px) translateX(10px);
    }
  }
  @keyframes rise {
    0% {
      transform: translateY(0) scale(0.6);
      opacity: 0;
    }
    15% {
      opacity: 0.8;
    }
    85% {
      opacity: 0.5;
    }
    100% {
      transform: translateY(-560px) scale(1.1);
      opacity: 0;
    }
  }
  @keyframes orb {
    50% {
      transform: translate(40px, 30px) scale(1.12);
      opacity: 0.75;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .orb,
    .pill,
    .bubble {
      animation: none;
    }
  }
</style>
