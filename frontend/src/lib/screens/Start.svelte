<script lang="ts">
  import { t, i18n, setLocale, LOCALES } from '../locale.svelte'
  import { game, setAge, begin } from '../game.svelte'
  import SpmLogo from '../SpmLogo.svelte'

  let { onadmin }: { onadmin: () => void } = $props()

  // Secret admin: double-tap the tiny EU-credit line (nobody taps fine print).
  let lastTap = 0
  function creditTap() {
    const now = performance.now()
    if (now - lastTap < 450) {
      lastTap = 0
      onadmin()
    } else {
      lastTap = now
    }
  }

  // Decorative background — art-directed so it's lively but never random/janky.
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

  const AGES = [
    { id: 'young', emoji: '🧒', key: 'age.young' },
    { id: 'adult', emoji: '🧑', key: 'age.adult' },
  ] as const
</script>

<div class="start">
  <!-- animated background ------------------------------------------------- -->
  <div class="bg" aria-hidden="true">
    <div class="orb orb-a"></div>
    <div class="orb orb-b"></div>
    {#each PILLS as p, i}
      <div
        class="pill"
        style="left:{p.x}%; top:{p.y}%; width:{p.w}px;
               --rot:{p.rot}deg; --dur:{p.dur}s; --delay:{p.delay}s; --op:{p.op};
               background:linear-gradient(115deg, {p.c1} 0 49%, {p.c2} 51% 100%);"
      ></div>
    {/each}
    {#each BUBBLES as b, i}
      <span
        class="bubble"
        style="left:{b.x}%; width:{b.s}px; height:{b.s}px; --dur:{b.dur}s; --delay:{b.delay}s;"
      ></span>
    {/each}
    <div class="waterline"></div>
  </div>

  <!-- hero ----------------------------------------------------------------- -->
  <header class="hero">
    <div class="logo"><SpmLogo /></div>
    <p class="tag">{t('app.subtitle')}</p>
  </header>

  <!-- selectors ------------------------------------------------------------ -->
  <div class="panels">
    <section class="panel lang">
      <div class="phead"><span class="pico">🌐</span>{t('start.lang')}</div>
      <div class="flags">
        {#each LOCALES as l}
          <button
            class="flag-tile"
            class:sel={i18n.locale === l.id}
            onclick={() => setLocale(l.id)}
          >
            <span class="lname">{l.name}</span>
            <span class="check">✓</span>
          </button>
        {/each}
      </div>
    </section>

    <section class="panel age">
      <div class="phead"><span class="pico">🎮</span>{t('start.age')}</div>
      <div class="ages">
        {#each AGES as a}
          <button
            class="age-tile"
            class:sel={game.ageGroup === a.id}
            onclick={() => setAge(a.id)}
          >
            <span class="emoji">{a.emoji}</span>
            <span class="aname">{t(a.key)}</span>
            <span class="check">✓</span>
          </button>
        {/each}
      </div>
    </section>
  </div>

  <!-- CTA ------------------------------------------------------------------ -->
  <button class="go" onclick={begin}>
    <span class="play">▶</span>
    <span class="golabel">{t('start.go')}</span>
    <span class="sheen"></span>
  </button>

  <!-- secret admin trigger (double-tap) ------------------------------------ -->
  <button class="credit" onpointerup={creditTap} tabindex="-1" aria-hidden="true">
    {t('start.credit')}
  </button>
</div>

<style>
  .start {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 26px 48px 14px;
    overflow: hidden;
  }

  /* ---- background ------------------------------------------------------- */
  .bg {
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

  /* ---- hero ------------------------------------------------------------- */
  .hero {
    position: relative;
    z-index: 1;
    text-align: center;
    animation: heroin 0.7s cubic-bezier(0.2, 0.9, 0.3, 1) both;
  }
  .logo {
    width: 580px;
    max-width: 72vw;
    aspect-ratio: 924.6 / 223.5;
    margin: 4px auto 0;
  }
  .tag {
    margin-top: 12px;
    font-size: 23px;
    font-weight: 800;
    background: linear-gradient(90deg, var(--green), var(--spm-cyan-bright));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    letter-spacing: 0.2px;
  }

  /* ---- selectors -------------------------------------------------------- */
  .panels {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 32px;
    width: 100%;
    max-width: 1120px;
    margin-top: 24px;
    animation: panelin 0.7s cubic-bezier(0.2, 0.9, 0.3, 1) 0.12s both;
  }
  .panel {
    flex: 1;
    background: rgba(255, 255, 255, 0.045);
    border: 1px solid var(--border);
    border-radius: 26px;
    padding: 20px 24px 24px;
    backdrop-filter: blur(6px);
  }
  /* the language panel holds 5 tiles, the age panel only 2 — give language the
     extra room so every tile is the same width and "Nederlands" fits on a line */
  .panel.lang {
    flex-grow: 1.5;
  }
  .phead {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--dim);
    margin-bottom: 16px;
  }
  .pico {
    font-size: 22px;
  }

  .flags {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 10px;
  }
  .flag-tile {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 14px 8px;
    min-height: 96px;
    background: var(--surface);
    border: 2px solid var(--border);
    border-radius: 18px;
    transition: transform 0.12s ease, border-color 0.2s ease, background 0.2s ease;
  }
  .lname {
    font-size: 17px;
    font-weight: 800;
    line-height: 1.15;
    white-space: nowrap;
  }

  .ages {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .age-tile {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 22px 12px;
    min-height: 104px;
    background: var(--surface);
    border: 2px solid var(--border);
    border-radius: 20px;
    transition: transform 0.12s ease, border-color 0.2s ease, background 0.2s ease;
  }
  .emoji {
    font-size: 60px;
    line-height: 1;
    animation: bob 3.5s ease-in-out infinite;
  }
  .aname {
    font-size: 17px;
    font-weight: 800;
    line-height: 1.15;
    /* always reserve two lines so a 1-line label ("Erwachsene") and a 2-line one
       ("Kinder & Jugendliche") keep the emoji at the same height — no jump
       between tiles or between languages */
    min-height: 2.3em;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  /* shared selected state + tap feedback */
  .flag-tile:active,
  .age-tile:active {
    transform: scale(0.96);
  }
  .flag-tile.sel,
  .age-tile.sel {
    border-color: var(--spm-cyan);
    background: linear-gradient(160deg, rgba(0, 190, 202, 0.22), rgba(124, 92, 255, 0.14));
    box-shadow: 0 0 0 1px var(--spm-cyan), 0 10px 30px rgba(0, 190, 202, 0.28);
  }
  .check {
    position: absolute;
    top: 8px;
    right: 9px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--spm-cyan);
    color: #04222a;
    font-size: 14px;
    font-weight: 900;
    display: grid;
    place-items: center;
    opacity: 0;
    transform: scale(0.4);
    transition: opacity 0.18s ease, transform 0.18s cubic-bezier(0.2, 1.4, 0.4, 1);
  }
  .sel .check {
    opacity: 1;
    transform: scale(1);
  }

  /* ---- CTA -------------------------------------------------------------- */
  .go {
    position: relative;
    z-index: 1;
    margin-top: 28px;
    width: min(640px, 86%);
    height: 108px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    border-radius: 30px;
    font-size: 40px;
    font-weight: 900;
    letter-spacing: 0.5px;
    color: #04222a;
    background: linear-gradient(120deg, var(--spm-cyan-bright), var(--spm-cyan) 45%, var(--water-bot));
    box-shadow: 0 18px 50px rgba(0, 190, 202, 0.45), inset 0 2px 0 rgba(255, 255, 255, 0.4);
    overflow: hidden;
    animation: goin 0.6s cubic-bezier(0.2, 1.3, 0.4, 1) 0.3s both,
      gopulse 2.4s ease-in-out 1s infinite;
  }
  .go:active {
    transform: scale(0.97);
  }
  .play {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.32);
    font-size: 26px;
    padding-left: 4px;
    animation: nudge 1.6s ease-in-out infinite;
  }
  .sheen {
    position: absolute;
    top: 0;
    left: -60%;
    width: 40%;
    height: 100%;
    background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.55), transparent);
    transform: skewX(-20deg);
    animation: sheen 3.4s ease-in-out 1.4s infinite;
  }

  /* ---- credit / secret admin ------------------------------------------- */
  .credit {
    position: relative;
    z-index: 1;
    margin-top: auto;
    padding: 10px 8px 2px;
    font-size: 12px;
    letter-spacing: 0.4px;
    color: rgba(154, 166, 201, 0.55);
    text-align: center;
    background: transparent;
    border: none;
    cursor: default;
    touch-action: manipulation;
  }

  /* ---- keyframes -------------------------------------------------------- */
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
  @keyframes bob {
    50% {
      transform: translateY(-9px);
    }
  }
  @keyframes gopulse {
    50% {
      box-shadow: 0 22px 64px rgba(0, 190, 202, 0.7), inset 0 2px 0 rgba(255, 255, 255, 0.4);
    }
  }
  @keyframes nudge {
    50% {
      transform: translateX(4px);
    }
  }
  @keyframes sheen {
    0% {
      left: -60%;
    }
    55%,
    100% {
      left: 130%;
    }
  }
  @keyframes heroin {
    from {
      opacity: 0;
      transform: translateY(-26px) scale(0.96);
    }
  }
  @keyframes panelin {
    from {
      opacity: 0;
      transform: translateY(28px);
    }
  }
  @keyframes goin {
    from {
      opacity: 0;
      transform: translateY(34px) scale(0.9);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .orb,
    .pill,
    .bubble,
    .emoji,
    .go,
    .play,
    .sheen,
    .hero,
    .panels {
      animation: none;
    }
  }
</style>
