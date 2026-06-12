<script lang="ts">
  // Self-contained v2 story „Das pflanzliche Leck" (Induktion · Johanniskraut × Ciclosporin).
  // REWORKED flow: the standard dose lands in the green window, then „eine Woche später" the
  // protection has quietly LEAKED below the band (induction). The player investigates Frau
  // Bergers neue Tees with a magnifier (pictures), accuses the herbal culprit (Johanniskraut),
  // sees a plain-language explanation of WHY it leaks AND why it lagged for days, then stops the
  // live leak. DOWN only — no overdose path. The under-loss is a component $effect (the engine
  // auto-trip is gated to PLAY_PHASES, which play2 is not).
  import { onMount } from 'svelte'
  import { t } from '../locale.svelte'
  import { game, driveTo, backToStories } from '../game.svelte'
  import PlayShell from '../PlayShell.svelte'
  import WatchBody from '../WatchBody.svelte'
  import EndScreen from '../EndScreen.svelte'
  import {
    JK_BASELINE, JK_DOSE, JK_LEAK_LEVEL, JK_LEAK_RATE, JK_FINALE_START, JK_FINALE_RATE,
    JK_RESCUE_RATE, JK_DRAIN_TARGET, JK_BAIT_BURST, JK_FINALE_SECONDS, JK_BAIT_TIME_COST,
    JK_FACTS, JK_ITEMS, JK_FINALE_ACTIONS, jkArmsRescue, jkClever, jkPro,
    type JkItem, type JkFinaleAction,
  } from '../stories/johanniskraut'
  import { stars } from '../flow'

  type Beat = 'briefing' | 'dosing' | 'doseReveal' | 'leak' | 'investigate' | 'explain' | 'finale' | 'outcome'
  let beat = $state<Beat>('briefing')
  let outcome = $state<'win' | 'under'>('win')
  let pumping = $state(false) // true while a blocking pump move runs → action buttons disabled

  // dose-fill „Wusstest du?" rotation
  let factIdx = $state(0)
  let fillDone = $state(false)
  let factShownAt = 0
  const FACT_MS = 4500
  const FACT_MIN_MS = 3800

  // leak reveal
  let leaked = $state(false)

  // investigation (magnifier reveal → accuse) — cards shuffled per run (see onMount)
  let items = $state<JkItem[]>([...JK_ITEMS])
  let revealed = $state<Set<string>>(new Set())
  let imgFailed = $state<Set<string>>(new Set())
  let invPhase = $state<'reveal' | 'accuse'>('reveal')
  let wrongIds = $state<Set<string>>(new Set())
  let wrongAccuse = $state(0)
  let invFb = $state<string | null>(null)

  // finale (a timed race)
  let applied = $state<Set<string>>(new Set())
  let baitCount = $state(0)
  let minLevel = $state(JK_FINALE_START)
  let timeLeft = $state(JK_FINALE_SECONDS)
  let resolved = $state(false)
  let rescuing = $state(false)
  let finaleFb = $state<string | null>(null)

  let allRevealed = $derived(revealed.size === JK_ITEMS.length)
  let clever = $derived(jkClever(wrongAccuse))
  let pro = $derived(jkPro(baitCount, minLevel))
  let starCount = $derived(stars(outcome === 'win', clever, pro))
  let stepNum = $derived(
    ['briefing', 'dosing', 'doseReveal'].includes(beat) ? 1
    : beat === 'leak' ? 2
    : beat === 'investigate' ? 3
    : beat === 'explain' ? 4
    : 5,
  )

  onMount(() => {
    items = shuffle([...JK_ITEMS]) // mix the cards so the culprit isn't always first
    drive(JK_BASELINE, 8) // prime = the reset-home level (20), so the DOSE is the only pre-game rise
  })
  function shuffle<T>(a: T[]): T[] {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  // pump wrapper: blocks buttons while the water moves, frees them on settle
  function drive(target: number, rate: number, then: () => void = () => {}) {
    pumping = true
    driveTo(target, rate, () => { pumping = false; then() })
  }

  // rotate dose-fill facts during the (slow) fill; freeze on the current fact once filled
  $effect(() => {
    if (beat !== 'dosing') return
    factIdx = 0
    factShownAt = performance.now()
    const id = setInterval(() => {
      if (fillDone) return
      factIdx = (factIdx + 1) % JK_FACTS.length
      factShownAt = performance.now()
    }, FACT_MS)
    return () => clearInterval(id)
  })
  $effect(() => {
    if (beat !== 'dosing' || !fillDone) return
    const wait = Math.max(700, FACT_MIN_MS - (performance.now() - factShownAt))
    const id = setTimeout(() => (beat = 'doseReveal'), wait)
    return () => clearTimeout(id)
  })

  // finale: a timed RACE — a visible countdown ticks down while the torso drains; running out of
  // time (before both fixes are in) = Abstoßung. Also tracks minLevel for the „fast-save" pro half.
  $effect(() => {
    if (beat !== 'finale' || resolved || rescuing) return
    const id = setInterval(() => {
      if (resolved || rescuing) return
      timeLeft = Math.max(0, timeLeft - 0.1)
      const lv = game.level?.level
      if (lv !== undefined && lv < minLevel) minLevel = lv
      if (timeLeft <= 0) { resolved = true; outcome = 'under'; beat = 'outcome' }
    }, 100)
    return () => clearInterval(id)
  })

  // ── dose ──
  function giveDose() {
    if (pumping) return
    fillDone = false
    beat = 'dosing'
    drive(JK_DOSE, 6, () => (fillDone = true)) // 20 → 62, into the green window
  }

  // ── „eine Woche später": the protection has leaked below the band ──
  function toLeak() {
    leaked = false
    beat = 'leak'
    drive(JK_LEAK_LEVEL, JK_LEAK_RATE, () => (leaked = true)) // 62 → 49
  }

  // ── investigation ──
  function revealItem(item: JkItem) {
    if (pumping || invPhase !== 'reveal' || revealed.has(item.id)) return
    revealed = new Set(revealed).add(item.id)
  }
  function toAccuse() {
    if (!allRevealed || pumping) return
    invPhase = 'accuse'
    invFb = null
  }
  function accuse(item: JkItem) {
    if (pumping || invPhase !== 'accuse' || wrongIds.has(item.id)) return
    if (item.culprit) {
      beat = 'explain'
    } else {
      wrongAccuse += 1
      wrongIds = new Set(wrongIds).add(item.id)
      invFb = 'jk.inv.wrong'
    }
  }

  // ── finale: the live leak + the fixes ──
  function toFinale() {
    if (pumping) return
    applied = new Set()
    baitCount = 0
    minLevel = JK_FINALE_START
    timeLeft = JK_FINALE_SECONDS
    resolved = false
    rescuing = false
    finaleFb = null
    beat = 'finale'
    resumeLeak()
  }
  function resumeLeak() {
    driveTo(JK_DRAIN_TARGET, JK_FINALE_RATE, () => {}) // raw — the torso drains the whole race; buttons stay enabled
  }
  function applyAction(a: JkFinaleAction) {
    if (resolved || rescuing) return
    if (a.kind === 'bait') {
      baitCount += 1
      finaleFb = a.feedbackKey
      timeLeft = Math.max(0, timeLeft - JK_BAIT_TIME_COST) // a wrong fix burns the clock
      const cur = game.level?.level ?? JK_FINALE_START
      const burst = Math.max(JK_DRAIN_TARGET, cur - JK_BAIT_BURST)
      driveTo(burst, 3, () => { if (!resolved && !rescuing) resumeLeak() })
      return
    }
    if (applied.has(a.id)) return
    applied = new Set(applied).add(a.id)
    if (jkArmsRescue([...applied])) {
      rescuing = true
      finaleFb = null
      driveTo(JK_DOSE, JK_RESCUE_RATE, () => {
        if (!resolved) { resolved = true; outcome = 'win'; beat = 'outcome' }
      })
      return
    }
    // one fix in — the drain keeps falling until BOTH are applied (the race is still on)
    finaleFb = a.id === 'absetzen' ? 'jk.fb.absetzen' : 'jk.fb.needCause'
  }
</script>

<div class="root">
  {#if beat === 'outcome'}
    <EndScreen
      {outcome}
      titleKey={`jk.out.${outcome}.title`}
      subKey={`jk.out.${outcome}.sub`}
      storyTitleKey="story.johanniskraut.title"
      score={starCount}
      factKeys={outcome === 'win' ? ['jk.out.dyk.lag', 'jk.out.dyk.herb'] : ['jk.out.dyk.under', 'jk.out.dyk.lag']}
    />
  {:else}
    <PlayShell
      color={game.story?.color ?? '#38e0a0'}
      kicker={t('story.johanniskraut.title')}
      caseLine={t('jk.case')}
      step={stepNum}
      total={5}
      onCancel={backToStories}
    >
      {#key beat}
        <div class="beat">
          {#if beat === 'briefing'}
            <div class="scene">
              <span class="pl-emoji">🧑‍⚕️</span>
              <h1 class="pl-h1">{t('jk.brief.patient')}</h1>
              <p class="pl-lead">{t('jk.brief.goal')}</p>
              <div class="actions">
                <button class="pl-action" disabled={pumping} onclick={giveDose}>{t('jk.brief.btn')}</button>
              </div>
            </div>

          {:else if beat === 'dosing'}
            <div class="scene wide">
              <WatchBody text={t(fillDone ? 'jk.cue.filled' : 'jk.cue.fill')} tone="good" />
              {#key factIdx}
                <div class="factcard pl-card">
                  <span class="factkick">{t('jk.fact.kicker')}</span>
                  <p>{t(JK_FACTS[factIdx])}</p>
                </div>
              {/key}
            </div>

          {:else if beat === 'doseReveal'}
            <div class="scene">
              <div class="reveal pl-good">{t('jk.dose.reveal')}</div>
              <div class="actions">
                <button class="pl-action" onclick={toLeak}>{t('jk.dose.next')}</button>
              </div>
            </div>

          {:else if beat === 'leak'}
            <div class="scene">
              {#if !leaked}
                <WatchBody text={t('jk.leak.fall')} tone="falling" />
              {:else}
                <span class="pl-emoji">📉</span>
                <h2 class="pl-h2">{t('jk.leak.title')}</h2>
                <p class="pl-lead">{t('jk.leak.sub')}</p>
                <div class="actions">
                  <button class="pl-action" onclick={() => (beat = 'investigate')}>{t('jk.leak.btn')}</button>
                </div>
              {/if}
            </div>

          {:else if beat === 'investigate'}
            <div class="task">
              <h2 class="pl-h2 center">{t(invPhase === 'accuse' ? 'jk.inv.accusePrompt' : 'jk.inv.prompt')}</h2>
              <div class="items">
                {#each items as item}
                  {@const isRev = revealed.has(item.id)}
                  <button
                    class="invcard"
                    class:revealed={isRev}
                    class:wrong={wrongIds.has(item.id)}
                    class:accuse={invPhase === 'accuse'}
                    disabled={pumping || (invPhase === 'reveal' && isRev) || wrongIds.has(item.id)}
                    onclick={() => (invPhase === 'accuse' ? accuse(item) : revealItem(item))}
                  >
                    <span class="thumb">
                      {#if isRev && !imgFailed.has(item.id)}
                        <img src={item.img} alt="" onerror={() => (imgFailed = new Set(imgFailed).add(item.id))} />
                      {:else}
                        <span class="emoji">{item.emoji}</span>
                      {/if}
                      {#if !isRev}<span class="lens">🔍</span>{/if}
                    </span>
                    <b class="name">{t(item.labelKey)}</b>
                    {#if isRev}
                      <small class="rev">{t(item.revealKey)}</small>
                    {:else}
                      <small class="hint">{t('jk.inv.tapHint')}</small>
                    {/if}
                    {#if invPhase === 'accuse' && !wrongIds.has(item.id)}<span class="take">↳ {t('jk.inv.take')}</span>{/if}
                  </button>
                {/each}
              </div>
              {#if invPhase === 'reveal'}
                <WatchBody text={t('jk.inv.watch')} tone="still" />
                <div class="actions">
                  <button class="pl-action" disabled={!allRevealed || pumping} onclick={toAccuse}>{t('jk.inv.toAccuse')}</button>
                </div>
              {:else if invFb}
                <WatchBody text={t(invFb)} tone="still" />
              {/if}
            </div>

          {:else if beat === 'explain'}
            <div class="scene wide">
              <h2 class="pl-h2">{t('jk.explain.title')}</h2>
              <p class="pl-lead">{t('jk.explain.body')}</p>
              <div class="ramp" aria-hidden="true">
                <span class="ramplabel">{t('jk.explain.rampLabel')}</span>
                <div class="dots">
                  {#each Array(7) as _, i}
                    <span class="edot" style="--i:{i}"></span>
                  {/each}
                </div>
                <div class="ends"><span>{t('jk.explain.rampStart')}</span><span>{t('jk.explain.rampEnd')}</span></div>
              </div>
              <p class="pl-body gloss">{t('jk.explain.lag')}</p>
              <div class="actions">
                <button class="pl-action" onclick={toFinale}>{t('jk.explain.btn')}</button>
              </div>
            </div>

          {:else if beat === 'finale'}
            <div class="task">
              <h2 class="pl-h2 center">{t('jk.finale.prompt')}</h2>
              {#if rescuing}
                <WatchBody text={t('jk.finale.rescue')} tone="good" />
              {:else}
                <div class="countdown" class:low={timeLeft <= 4} aria-label="Zeit">
                  <div class="bar"><span style="width:{Math.max(0, (timeLeft / JK_FINALE_SECONDS) * 100)}%"></span></div>
                  <b class="secs">{Math.ceil(timeLeft)}s</b>
                </div>
              {/if}
              <div class="optcol">
                {#each JK_FINALE_ACTIONS as a}
                  <button class="pl-opt" class:done={applied.has(a.id)} disabled={resolved || rescuing || applied.has(a.id)} onclick={() => applyAction(a)}>{t(a.labelKey)}</button>
                {/each}
              </div>
              {#if finaleFb && !rescuing}<p class="fb {applied.has('absetzen') ? 'pl-good' : 'pl-warn'}">{t(finaleFb)}</p>{/if}
            </div>
          {/if}
        </div>
      {/key}
    </PlayShell>
  {/if}
</div>

<style>
  .root { position: relative; height: 100%; }
  .beat { height: 100%; display: grid; align-content: center; justify-items: center; gap: var(--sp-4); animation: beatin 0.4s cubic-bezier(0.2, 0.9, 0.3, 1) both; }
  .scene { display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); max-width: 880px; text-align: center; }
  .scene.wide { max-width: 980px; width: 100%; }
  .task { display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); width: 100%; }
  .center { text-align: center; }
  .actions { display: flex; gap: var(--sp-2); justify-content: center; flex-wrap: wrap; }
  .fb { font-size: var(--fs-h2); font-weight: 800; line-height: 1.3; max-width: 900px; text-align: center; }
  .gloss { color: var(--dim); max-width: 820px; text-align: center; }

  .factcard { max-width: 680px; text-align: center; animation: factin 0.4s ease both; }
  .factcard .factkick { display: inline-block; font-size: var(--fs-micro); font-weight: 900; letter-spacing: 1px; text-transform: uppercase; color: var(--spm-cyan-bright); margin-bottom: var(--sp-1); }
  .factcard p { font-size: var(--fs-lead); line-height: 1.45; }
  .reveal { font-size: var(--fs-display); font-weight: 900; line-height: 1.05; text-shadow: 0 0 26px color-mix(in srgb, var(--green) 35%, transparent); }

  /* investigation: magnifier cards (photo reveal → accuse) */
  .items { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-2); width: 100%; max-width: 1040px; }
  .invcard {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    height: 256px; padding: var(--sp-3); /* FIXED height → revealing never grows the card (no row jump) */
    border: 1.5px solid var(--border); border-radius: var(--r-card); background: var(--surface); color: var(--text);
    transition: transform 0.1s ease, border-color 0.2s ease, background 0.2s ease;
  }
  .invcard:active:not(:disabled) { transform: scale(0.96); border-color: color-mix(in srgb, var(--story) 60%, transparent); }
  .invcard.revealed { border-color: color-mix(in srgb, var(--story) 55%, var(--border)); }
  .invcard.accuse:not(.wrong) { border-color: color-mix(in srgb, var(--spm-cyan) 55%, var(--border)); }
  .invcard.wrong { opacity: 0.5; border-color: var(--border); }
  .thumb {
    position: relative; width: 100%; height: 96px; border-radius: 14px; overflow: hidden;
    display: grid; place-items: center; background: color-mix(in srgb, var(--story) 12%, var(--surface2, rgba(255,255,255,0.04)));
  }
  .thumb img { width: 100%; height: 100%; object-fit: cover; }
  .thumb .emoji { font-size: 54px; line-height: 1; }
  .thumb .lens { position: absolute; right: 8px; bottom: 6px; font-size: 30px; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5)); animation: lensbob 2.2s ease-in-out infinite; }
  .invcard .name { font-size: var(--fs-body); font-weight: 800; }
  .invcard .hint { font-size: var(--fs-micro); font-weight: 800; color: var(--dim); text-transform: uppercase; letter-spacing: 0.4px; }
  .invcard .rev { font-size: var(--fs-small); font-weight: 650; color: var(--text); line-height: 1.3; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 4; }
  .invcard .take { font-size: var(--fs-micro); font-weight: 900; color: var(--spm-cyan-bright); text-transform: uppercase; letter-spacing: 0.4px; }

  /* explanation: the „Aufräum-Team wächst über Tage" ramp (decoration of the lag) */
  .ramp { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; max-width: 560px; padding: var(--sp-3) var(--sp-4); border: 1px solid var(--border); border-radius: var(--r-card); background: color-mix(in srgb, var(--story) 9%, var(--surface)); }
  .ramplabel { font-size: var(--fs-micro); font-weight: 900; letter-spacing: 0.6px; text-transform: uppercase; color: color-mix(in srgb, var(--story) 75%, var(--text)); }
  .ramp .dots { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--sp-2); width: 100%; height: 56px; }
  .ramp .edot { flex: 1; align-self: flex-end; border-radius: 999px 999px 6px 6px; background: linear-gradient(180deg, color-mix(in srgb, var(--story) 85%, #fff), var(--story)); height: calc(18% + var(--i) * 13%); opacity: calc(0.5 + var(--i) * 0.08); }
  .ramp .ends { display: flex; justify-content: space-between; width: 100%; font-size: var(--fs-micro); font-weight: 800; color: var(--dim); }

  .optcol { display: flex; flex-direction: column; gap: var(--sp-2); width: 100%; max-width: 720px; }
  .pl-opt.done { border-color: var(--green); background: color-mix(in srgb, var(--green) 12%, var(--surface)); }

  /* finale countdown — the visible deadline (the torso drains in parallel) */
  .countdown { display: flex; align-items: center; gap: var(--sp-3); width: 100%; max-width: 720px; }
  .countdown .bar { flex: 1; height: 16px; border-radius: 999px; overflow: hidden; border: 1px solid var(--border); background: color-mix(in srgb, var(--toxic) 16%, var(--surface)); }
  .countdown .bar span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--green), var(--spm-cyan-bright)); transition: width 0.12s linear; }
  .countdown .secs { min-width: 58px; text-align: right; font-size: var(--fs-h2); font-weight: 900; font-variant-numeric: tabular-nums; color: var(--text); }
  .countdown.low .bar span { background: var(--toxic); }
  .countdown.low .secs { color: var(--toxic); animation: cdpulse 0.7s ease-in-out infinite; }
  @keyframes cdpulse { 50% { opacity: 0.35; } }

  @keyframes beatin { from { opacity: 0; transform: translateY(18px); } }
  @keyframes factin { from { opacity: 0; transform: translateY(8px); } }
  @keyframes lensbob { 50% { transform: translateY(-4px) rotate(-8deg); } }
  @media (prefers-reduced-motion: reduce) { .beat, .factcard, .thumb .lens, .countdown.low .secs { animation: none; } }
</style>
