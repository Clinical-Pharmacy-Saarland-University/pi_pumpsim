<script lang="ts">
  // „Two exits" teaching animation for the organ story (kidney/liver). NOT a level
  // mirror (the physical pump owns the level) — an anatomical diagram that shows HOW
  // the medicine leaves the body: 💊 particles drift from the central blood pool out
  // to the LEBER (liver, breaks it down) and the NIERE (kidney, washes it out).
  //   mode 'both'   — both exits flow (a normal drug uses both ways)
  //   mode 'kidney' — the liver door is CLOSED for Metformin → everything goes renal
  //   mode 'tired'  — the kidney is tired: it flows slowly + a particle backs up (stau)
  // Pi-safe: light CSS transforms/opacity only, no heavy blur. Touch-only, reduced-motion safe.
  type Mode = 'both' | 'kidney' | 'tired'
  let {
    mode = 'both',
    liverLabel = 'Leber',
    kidneyLabel = 'Nieren',
    bloodLabel = 'Blut',
    tiredNote = '',
  }: {
    mode?: Mode
    liverLabel?: string
    kidneyLabel?: string
    bloodLabel?: string
    tiredNote?: string
  } = $props()

  // staggered particle delays (s) per track — a calm, readable flow, not a swarm
  const DROPS = [0, 0.9, 1.8, 2.7]
  let liverClosed = $derived(mode !== 'both')
  let kidneyTired = $derived(mode === 'tired')
</script>

<div class="exits {mode}" role="img" aria-label="{liverLabel} · {bloodLabel} · {kidneyLabel}">
  <!-- LEBER exit (left) -->
  <div class="exit liver" class:closed={liverClosed}>
    <div class="organ">
      <span class="blob"></span>
      {#if liverClosed}<span class="gate" aria-hidden="true">✕</span>{/if}
    </div>
    <span class="name">{liverLabel}</span>
  </div>

  <!-- left track: pool → liver -->
  <div class="track left" class:closed={liverClosed}>
    {#each DROPS as d}<span class="drop" style="--d:{d}s">💊</span>{/each}
  </div>

  <!-- central blood pool -->
  <div class="pool">
    <span class="pill p1">💊</span>
    <span class="pill p2">💊</span>
    <span class="pill p3">💊</span>
    <span class="poolname">{bloodLabel}</span>
  </div>

  <!-- right track: pool → kidney -->
  <div class="track right" class:tired={kidneyTired}>
    {#each DROPS as d}<span class="drop" style="--d:{d}s">💊</span>{/each}
    {#if kidneyTired}<span class="drop backup" style="--d:0.4s">💊</span>{/if}
  </div>

  <!-- NIERE exit (right) -->
  <div class="exit kidney" class:tired={kidneyTired}>
    <div class="organ">
      <span class="bean">🫘</span>
    </div>
    <span class="name">{kidneyLabel}{#if kidneyTired && tiredNote}<small> · {tiredNote}</small>{/if}</span>
  </div>
</div>

<style>
  .exits {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(4px, 1vw, 12px);
    width: 100%;
    max-width: 940px;
    padding: 8px 0;
  }

  /* exit nodes (organs) */
  .exit {
    flex: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 132px;
  }
  .organ {
    position: relative;
    width: 104px;
    height: 104px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 2px solid var(--border);
    background: rgba(255, 255, 255, 0.04);
  }
  .exit .name {
    font-size: var(--fs-body);
    font-weight: 850;
    color: var(--text);
  }
  .exit .name small {
    font-weight: 800;
    color: var(--toxic);
  }

  /* liver: a soft amber/brown organ blob */
  .liver .blob {
    width: 66px;
    height: 56px;
    border-radius: 60% 70% 64% 56% / 70% 66% 60% 64%;
    background: radial-gradient(60% 60% at 38% 32%, #c98a4e, #7a4a22 78%);
    box-shadow: inset 0 -6px 12px rgba(0, 0, 0, 0.35), 0 4px 14px rgba(122, 74, 34, 0.4);
    transition: filter 0.4s ease, opacity 0.4s ease;
  }
  .liver.closed .blob {
    filter: grayscale(0.8) brightness(0.7);
    opacity: 0.55;
  }
  .liver .gate {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: var(--toxic);
    font-size: 56px;
    font-weight: 950;
    text-shadow: 0 0 14px color-mix(in srgb, var(--toxic) 60%, transparent);
    animation: stamp 0.4s cubic-bezier(0.2, 1.5, 0.4, 1) both;
  }

  /* kidney: the bean, glowing green normally, amber + pulsing when tired */
  .kidney .organ {
    border-color: color-mix(in srgb, var(--green) 55%, var(--border));
    box-shadow: 0 0 18px color-mix(in srgb, var(--green) 22%, transparent);
    transition: border-color 0.4s ease, box-shadow 0.4s ease;
  }
  .kidney .bean {
    font-size: 56px;
    line-height: 1;
    filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.4));
  }
  .kidney.tired .organ {
    border-color: color-mix(in srgb, var(--toxic) 60%, var(--border));
    box-shadow: 0 0 22px color-mix(in srgb, var(--toxic) 30%, transparent);
    animation: tiredpulse 1.8s ease-in-out infinite;
  }
  .kidney.tired .bean {
    filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.4)) saturate(0.7) brightness(0.9);
  }

  /* central blood pool */
  .pool {
    position: relative;
    flex: none;
    width: 138px;
    height: 116px;
    display: grid;
    place-items: center;
    border-radius: 22px;
    border: 2px solid color-mix(in srgb, var(--toxic) 35%, var(--border));
    background:
      radial-gradient(120% 90% at 50% 120%, color-mix(in srgb, var(--toxic) 30%, transparent), transparent 70%),
      rgba(255, 255, 255, 0.05);
    overflow: hidden;
  }
  .poolname {
    position: absolute;
    bottom: 7px;
    font-size: var(--fs-micro);
    font-weight: 900;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    color: var(--dim);
  }
  .pool .pill {
    position: absolute;
    font-size: 22px;
    animation: bob 3.2s ease-in-out infinite;
  }
  .pool .p1 { top: 18px; left: 28px; animation-delay: 0s; }
  .pool .p2 { top: 30px; right: 24px; animation-delay: 0.7s; }
  .pool .p3 { top: 50px; left: 50px; animation-delay: 1.4s; }

  /* flowing tracks (pool → organ) */
  .track {
    position: relative;
    flex: 1 1 auto;
    min-width: 96px;
    max-width: 230px;
    height: 56px;
    align-self: center;
  }
  .track::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 6%;
    right: 6%;
    height: 3px;
    transform: translateY(-50%);
    border-radius: 3px;
    background: repeating-linear-gradient(90deg, color-mix(in srgb, var(--toxic) 30%, transparent) 0 8px, transparent 8px 16px);
    opacity: 0.5;
  }
  .track .drop {
    position: absolute;
    top: 50%;
    font-size: 19px;
    margin-top: -12px;
    opacity: 0;
    will-change: transform, opacity;
  }
  /* right track: pool (left) → kidney (right) */
  .track.right .drop {
    left: 0;
    animation: flowRight 3.6s linear var(--d) infinite;
  }
  .track.right.tired .drop {
    animation-duration: 6.4s; /* the tired kidney clears slowly */
  }
  .track.right .drop.backup {
    animation: backup 3.2s ease-in-out 0.4s infinite; /* one particle staut zurück */
  }
  /* left track: pool (right) → liver (left) */
  .track.left .drop {
    right: 0;
    animation: flowLeft 3.6s linear var(--d) infinite;
  }
  .track.left.closed .drop {
    animation: none;
    opacity: 0; /* the liver door is shut for Metformin — nothing flows */
  }

  @keyframes flowRight {
    0% { transform: translateX(0); opacity: 0; }
    12% { opacity: 1; }
    82% { opacity: 1; }
    100% { transform: translateX(190px); opacity: 0; }
  }
  @keyframes flowLeft {
    0% { transform: translateX(0); opacity: 0; }
    12% { opacity: 1; }
    82% { opacity: 1; }
    100% { transform: translateX(-190px); opacity: 0; }
  }
  @keyframes backup {
    0%, 100% { transform: translateX(70px); opacity: 0; }
    30% { opacity: 1; }
    60% { transform: translateX(18px); opacity: 1; } /* drifts back toward the pool */
    80% { opacity: 0.3; }
  }
  @keyframes bob {
    50% { transform: translateY(-6px) rotate(8deg); }
  }
  @keyframes tiredpulse {
    50% { box-shadow: 0 0 30px color-mix(in srgb, var(--toxic) 42%, transparent); }
  }
  @keyframes stamp {
    from { transform: scale(1.8); opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .pool .pill, .track .drop, .kidney.tired .organ, .liver .gate { animation: none; }
    .track .drop { opacity: 0.9; }
    .track.left.closed .drop { opacity: 0; }
  }
</style>
