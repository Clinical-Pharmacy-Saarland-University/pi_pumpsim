<script lang="ts">
  import { t, i18n, setLocale, LOCALES } from '../locale.svelte'
  import { game, setAge, begin } from '../game.svelte'
  import SpmLogo from '../SpmLogo.svelte'
  import Backdrop from '../Backdrop.svelte'

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

  // Secret admin (touch): triple-tap the SafePolyMed logo (3 quick taps).
  let logoTaps = 0
  let logoTimer: ReturnType<typeof setTimeout> | null = null
  function logoTap() {
    logoTaps += 1
    if (logoTimer) clearTimeout(logoTimer)
    if (logoTaps >= 3) {
      logoTaps = 0
      onadmin()
      return
    }
    logoTimer = setTimeout(() => (logoTaps = 0), 600)
  }

  // emoji pairs: 🧒/🧑 render almost identically (Segoe + Noto), so each tile
  // shows two figures — pigtails+kid vs. woman+beard read as "kids" / "grown-ups"
  // at a glance, the pair matches the plural labels, and mixed skin tones keep
  // the booth's audience represented.
  const AGES = [
    { id: 'young', emoji: '👧👦🏽', key: 'age.young' },
    { id: 'adult', emoji: '👩🧔🏿', key: 'age.adult' },
  ] as const
</script>

<div class="start">
  <Backdrop />

  <!-- hero ----------------------------------------------------------------- -->
  <header class="hero">
    <button class="logo" onpointerup={logoTap} aria-label="SafePolyMed" tabindex="-1">
      <SpmLogo />
    </button>
    <p class="tag">{t('app.subtitle')}</p>
  </header>

  <!-- selectors ------------------------------------------------------------ -->
  <!-- dir=ltr pins panel + tile order on this screen: tapping العربية must not
       teleport the tile the user just touched. Everything here is centered, so
       Arabic loses nothing; the rest of the app still mirrors via dir=rtl. -->
  <div class="panels" dir="ltr">
    <section class="panel lang">
      <div class="phead"><span class="pico">🌐</span>{t('start.lang')}</div>
      <div class="langs">
        {#each LOCALES as l}
          <button
            class="lang-tile"
            class:sel={i18n.locale === l.id}
            onclick={() => setLocale(l.id)}
          >
            <span class="bubble" dir="auto">{l.hello}</span>
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

  /* ---- hero ------------------------------------------------------------- */
  .hero {
    position: relative;
    z-index: 1;
    text-align: center;
    animation: heroin 0.7s cubic-bezier(0.2, 0.9, 0.3, 1) both;
  }
  .logo {
    display: block;
    width: 580px;
    max-width: 72vw;
    aspect-ratio: 924.6 / 223.5;
    margin: 4px auto 0;
    background: none;
    border: none;
    padding: 0;
    overflow: visible;
    cursor: pointer;
    touch-action: manipulation;
  }
  .tag {
    margin-top: 12px;
    font-size: 23px;
    /* explicit line-height: Arabic falls back to a font with much taller
       'normal' metrics — without this the subtitle grows ~20px on locale
       switch and the whole column below jumps */
    line-height: 1.45;
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
    line-height: 1.4; /* pin against Arabic font metrics (see .tag) */
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--dim);
    margin-bottom: 16px;
  }
  .pico {
    font-size: 22px;
  }

  .langs {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 10px;
  }
  .lang-tile {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 14px 6px 12px;
    min-height: 124px;
    background: var(--surface);
    border: 2px solid var(--border);
    border-radius: 18px;
    transition: transform 0.12s ease, border-color 0.2s ease, background 0.2s ease;
  }
  /* each language greets you in its own words — a little speech bubble */
  .bubble {
    position: relative;
    padding: 8px 13px 9px;
    font-size: 20px;
    font-weight: 900;
    line-height: 1;
    white-space: nowrap;
    color: var(--spm-cyan-bright);
    background: rgba(255, 255, 255, 0.09);
    border-radius: 13px;
    transition: background 0.2s ease, color 0.2s ease;
  }
  .bubble::after {
    /* the bubble's tail */
    content: '';
    position: absolute;
    left: 14px;
    bottom: -7px;
    width: 13px;
    height: 8px;
    background: inherit;
    clip-path: polygon(0 0, 100% 0, 25% 100%);
  }
  .lang-tile.sel .bubble {
    color: #04222a;
    background: linear-gradient(120deg, var(--spm-cyan-bright), var(--spm-cyan));
  }
  .lname {
    font-size: 14px;
    font-weight: 700;
    line-height: 1.15;
    letter-spacing: 0.3px;
    color: var(--dim);
    white-space: nowrap;
    transition: color 0.2s ease;
  }
  .lang-tile.sel .lname {
    color: #fff;
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
    /* two glyphs per tile now — sized so the pair stays inside the tile */
    font-size: 46px;
    line-height: 1;
    letter-spacing: 2px;
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
  .lang-tile:active,
  .age-tile:active {
    transform: scale(0.96);
  }
  .lang-tile.sel,
  .age-tile.sel {
    border-color: var(--spm-cyan);
    background: linear-gradient(160deg, rgba(0, 190, 202, 0.22), rgba(124, 92, 255, 0.14));
    box-shadow: 0 0 0 1px var(--spm-cyan), 0 10px 30px rgba(0, 190, 202, 0.28);
  }
  .check {
    position: absolute;
    top: 8px;
    inset-inline-end: 9px;
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
    line-height: 1.5; /* pin against Arabic font metrics (see .tag) */
    letter-spacing: 0.4px;
    color: rgba(154, 166, 201, 0.55);
    text-align: center;
    background: transparent;
    border: none;
    cursor: default;
    touch-action: manipulation;
  }

  /* ---- keyframes -------------------------------------------------------- */
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
