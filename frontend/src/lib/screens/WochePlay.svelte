<script lang="ts">
  // Self-contained v2 story „Der Wochen-Pillenplan" (Adhärenz · Lamotrigin).
  // Blueprint screen on <PlayShell/> + the .pl-* kit. Signature mechanic: COMPOSE-A-WEEK then
  // HAND-CRANK — the player authors a 7-slot Mo–So plan (0/1/2 pills) with zero time pressure,
  // then turns each day by hand; the plan becomes a saw-tooth carved into the real torso AND a
  // drawn PK concentration–time curve. The pump is the instrument; the curve is the authored
  // shape made legible. A forced twist demo shows a "catch-up" double climbing the WRONG way.
  // Losses rebuilt via a manual $effect (auto-trip is engine-gated to PLAY_PHASES, not play2).
  import { onMount } from 'svelte'
  import { t } from '../locale.svelte'
  import { game, driveTo, backToStories } from '../game.svelte'
  import PlayShell from '../PlayShell.svelte'
  import WatchBody from '../WatchBody.svelte'
  import EndScreen from '../EndScreen.svelte'
  import {
    ADH_DAYS, ADH_FACTS, ADH_DECISION, simulateWeek, isCleanPlan,
    levelToY, dayToX, ADH_PLOT_TOP, ADH_PLOT_BOT, ADH_PLOT_LEFT, ADH_PLOT_RIGHT,
    ADH_CURVE_W, ADH_CURVE_H, type AdhDecisionOpt,
  } from '../stories/adherence'
  import { LEVELS, stars, type Outcome } from '../flow'

  type Beat = 'setup' | 'filling' | 'build' | 'play' | 'twistDouble' | 'decide' | 'won' | 'outcome'
  let beat = $state<Beat>('setup')
  let outcome = $state<Outcome>('win')
  let pumping = $state(false)
  let resolved = $state(false)

  // dose-fill rotation
  let factIdx = $state(0)
  let fillDone = $state(false)
  let factShownAt = 0
  const FACT_MS = 4500
  const FACT_MIN_MS = 3800

  // authored week
  let plan = $state<number[]>([1, 1, 1, 1, 1, 1, 1])
  let weekLevels = $state<number[]>([])
  let weekTrip = $state(-1)
  let weekOutcome = $state<Outcome>('win')
  let drawnDays = $state(0)
  let dayCue = $state('adh.play.watch.held')
  let dayTone = $state<'good' | 'falling' | 'rising'>('good')

  // twist demo + decision
  let twistGiven = $state(false)
  let dMsg = $state<string | null>(null)
  let decideWrong = $state(false)
  let decideDone = $state(false)

  let dOptions = $derived(ADH_DECISION.filter((o) => game.ageGroup === 'adult' || !o.adultOnly))
  let clever = $derived(isCleanPlan(plan) ? 1 : 0.5)
  let pro = $derived(decideDone ? (decideWrong ? 0.5 : 1) : 0)
  let starCount = $derived(stars(outcome === 'win', clever, pro))
  let drawnPoints = $derived(
    weekLevels.slice(0, drawnDays).map((l, i) => `${dayToX(i)},${levelToY(l)}`).join(' '),
  )
  let bandTop = levelToY(LEVELS.bandHigh)
  let bandBot = levelToY(LEVELS.bandLow)
  let stepNum = $derived(
    ['setup', 'filling'].includes(beat) ? 1
    : beat === 'build' ? 2
    : beat === 'play' ? 3
    : beat === 'twistDouble' ? 4
    : beat === 'decide' ? 5
    : 6,
  )

  onMount(() => drive(LEVELS.start, 8)) // sit at the empty baseline (the reset already homed here)

  function drive(target: number, rate: number, then: () => void = () => {}) {
    pumping = true
    driveTo(target, rate, () => { pumping = false; then() })
  }

  // rotate dose-fill facts during the prime (20→62)
  $effect(() => {
    if (beat !== 'filling') return
    factIdx = 0
    factShownAt = performance.now()
    const id = setInterval(() => {
      if (fillDone) return
      factIdx = (factIdx + 1) % ADH_FACTS.length
      factShownAt = performance.now()
    }, FACT_MS)
    return () => clearInterval(id)
  })
  $effect(() => {
    if (beat !== 'filling' || !fillDone) return
    const wait = Math.max(700, FACT_MIN_MS - (performance.now() - factShownAt))
    const id = setTimeout(() => (beat = 'build'), wait)
    return () => clearTimeout(id)
  })

  // manual auto-trip during the hand-cranked week (an authored bad plan crosses a tape)
  $effect(() => {
    if (beat !== 'play' || resolved) return
    const lv = game.level?.level
    if (lv === undefined) return
    if (lv >= 80) { resolved = true; outcome = 'over'; beat = 'outcome' }
    else if (lv <= 35) { resolved = true; outcome = 'under'; beat = 'outcome' }
  })

  function openCalendar() {
    if (pumping) return
    fillDone = false
    beat = 'filling'
    drive(LEVELS.dose, 7, () => (fillDone = true)) // 20 → 62 prime
  }

  function cycle(d: number) {
    if (pumping) return
    const next = [...plan]
    next[d] = (next[d] + 1) % 3
    plan = next
  }

  function startWeek() {
    if (pumping) return
    const s = simulateWeek(plan)
    weekLevels = s.levels; weekTrip = s.tripIndex; weekOutcome = s.outcome
    drawnDays = 0
    beat = 'play'
  }
  function nextDay() {
    if (pumping || drawnDays >= weekLevels.length) return
    const d = drawnDays
    const slot = plan[d]
    dayCue = slot === 0 ? 'adh.play.watch.gap' : slot === 2 ? 'adh.play.watch.up' : 'adh.play.watch.held'
    dayTone = slot === 0 ? 'falling' : slot === 2 ? 'rising' : 'good'
    drive(weekLevels[d], slot === 1 ? 6 : 4, () => {
      drawnDays = d + 1
      if (resolved) return
      if (drawnDays >= weekLevels.length && weekTrip === -1) {
        drive(LEVELS.dose, 6, () => (beat = 'twistDouble')) // reset to full for the twist demo
      }
    })
  }

  function twistDrop() {
    if (pumping || twistGiven) return
    twistGiven = true
    drive(78, 4) // 62 → 78 wrong-way climb from a full body — clearly over the window (no trip)
  }
  function twistNext() {
    if (pumping) return
    drive(54, 6, () => (beat = 'decide')) // drop to a gap state for the read-the-body decision
  }

  function pickDecide(o: AdhDecisionOpt) {
    if (pumping || decideDone) return
    dMsg = o.feedbackKey
    if (o.result === 'win') {
      decideDone = true
      drive(62, 4, () => (beat = 'won')) // 54 → 62 heal
    } else if (o.target !== undefined) {
      decideWrong = true
      drive(o.target, 4, () => drive(54, 6)) // wrong-way climb, then settle back for a retry
    } else {
      decideWrong = true // no-move stillness ("weglassen / abwarten")
    }
  }
</script>

<div class="root">
  {#if beat === 'outcome'}
    <EndScreen
      {outcome}
      titleKey={`adh.out.${outcome}.title`}
      subKey={`adh.out.${outcome}.sub`}
      storyTitleKey="story.adherence.title"
      score={starCount}
      factKeys={outcome === 'win'
        ? ['adh.out.dyk1', 'adh.out.dyk2']
        : outcome === 'over'
          ? ['adh.out.dyk.over', 'adh.out.dyk2']
          : ['adh.out.dyk.under', 'adh.out.dyk1']}
    />
  {:else}
    <PlayShell
      color={game.story?.color ?? '#9aa6c9'}
      kicker={t('story.adherence.title')}
      caseLine={t('adh.case')}
      step={stepNum}
      total={7}
      onCancel={backToStories}
    >
      {#key beat}
        <div class="beat">
          {#if beat === 'setup'}
            <div class="scene">
              <span class="pl-emoji">⏰</span>
              <h1 class="pl-h1">{t('adh.brief.patient')}</h1>
              <p class="pl-lead">{t('adh.brief.goal')}</p>
              <div class="actions">
                <button class="pl-action" disabled={pumping} onclick={openCalendar}>{t('adh.setup.btn')}</button>
              </div>
            </div>

          {:else if beat === 'filling'}
            <div class="scene wide">
              <WatchBody text={t(fillDone ? 'adh.setup.filled' : 'adh.setup.cue')} tone="good" />
              {#key factIdx}
                <div class="factcard pl-card">
                  <span class="factkick">{t('adh.fact.kicker')}</span>
                  <p>{t(ADH_FACTS[factIdx])}</p>
                </div>
              {/key}
            </div>

          {:else if beat === 'build'}
            <div class="task">
              <h2 class="pl-h2 center">{t('adh.build.prompt')}</h2>
              <div class="week">
                {#each plan as slot, d}
                  <button class="slot s{slot}" disabled={pumping} onclick={() => cycle(d)}>
                    <span class="dayname">{ADH_DAYS[d]}</span>
                    <span class="pills">{slot === 0 ? '—' : slot === 1 ? '💊' : '💊💊'}</span>
                    <small>{t(slot === 0 ? 'adh.slot.empty' : slot === 1 ? 'adh.slot.one' : 'adh.slot.double')}</small>
                  </button>
                {/each}
              </div>
              <p class="pl-body hint">{t('adh.build.hint')}</p>
              <div class="actions">
                <button class="pl-action" disabled={pumping} onclick={startWeek}>{t('adh.build.play')}</button>
              </div>
            </div>

          {:else if beat === 'play'}
            <div class="task">
              <div class="ticker">{drawnDays < ADH_DAYS.length ? t(`adh.day.${ADH_DAYS[drawnDays].toLowerCase()}`) : t(`adh.day.${ADH_DAYS[ADH_DAYS.length - 1].toLowerCase()}`)}</div>
              <svg class="curve" viewBox={`0 0 ${ADH_CURVE_W} ${ADH_CURVE_H}`} aria-hidden="true">
                <rect x={ADH_PLOT_LEFT} y={bandTop} width={ADH_PLOT_RIGHT - ADH_PLOT_LEFT} height={bandBot - bandTop} class="cband" />
                {#each ADH_DAYS as day, i}
                  <line x1={dayToX(i)} y1={ADH_PLOT_TOP} x2={dayToX(i)} y2={ADH_PLOT_BOT} class="cgrid" />
                  <text x={dayToX(i)} y={ADH_PLOT_BOT + 20} class="cday">{day}</text>
                {/each}
                {#if drawnDays > 0}
                  <polyline points={drawnPoints} class="cline" />
                  <circle cx={dayToX(drawnDays - 1)} cy={levelToY(weekLevels[drawnDays - 1])} r="6" class="cdot" />
                {/if}
              </svg>
              <WatchBody text={t(dayCue)} tone={dayTone} />
              {#if drawnDays < weekLevels.length}
                <div class="actions">
                  <button class="pl-action" disabled={pumping} onclick={nextDay}>{t('adh.play.next')}</button>
                </div>
              {/if}
            </div>

          {:else if beat === 'twistDouble'}
            <div class="scene">
              <h2 class="pl-h2">{t('adh.twist.prompt')}</h2>
              {#if !twistGiven}
                <div class="actions">
                  <button class="pl-action" disabled={pumping} onclick={twistDrop}>{t('adh.twist.btn')}</button>
                </div>
              {:else if pumping}
                <WatchBody text={t('adh.twist.cue')} tone="rising" />
              {:else}
                <p class="fb pl-warn">{t('adh.twist.land')}</p>
                <div class="actions">
                  <button class="pl-action" onclick={twistNext}>{t('adh.twist.next')}</button>
                </div>
              {/if}
            </div>

          {:else if beat === 'decide'}
            <div class="task">
              {#if decideDone}
                <WatchBody text={t('adh.decfb.single')} tone="good" />
              {:else}
                <h2 class="pl-h2 center">{t('adh.decide.prompt')}</h2>
                <div class="optcol">
                  {#each dOptions as o}
                    <button class="pl-opt" disabled={pumping} onclick={() => pickDecide(o)}>{t(o.labelKey)}</button>
                  {/each}
                </div>
                {#if pumping}<WatchBody text={t('adh.play.watch.up')} tone="rising" />{:else if dMsg}<p class="fb pl-warn">{t(dMsg)}</p>{/if}
              {/if}
            </div>

          {:else if beat === 'won'}
            <div class="scene">
              <h2 class="pl-h2 pl-good">{t('adh.won.title')}</h2>
              <p class="pl-lead">{t('adh.won.body')}</p>
              <p class="pl-body">{t('adh.won.peek')}</p>
              <div class="actions">
                <button class="pl-action" onclick={() => (beat = 'outcome')}>{t('common.next')}</button>
              </div>
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
  .hint { color: var(--dim); max-width: 760px; text-align: center; }

  .factcard { max-width: 680px; text-align: center; animation: factin 0.4s ease both; }
  .factcard .factkick { display: inline-block; font-size: var(--fs-micro); font-weight: 900; letter-spacing: 1px; text-transform: uppercase; color: var(--spm-cyan-bright); margin-bottom: var(--sp-1); }
  .factcard p { font-size: var(--fs-lead); line-height: 1.45; }

  /* the 7-day authoring strip */
  .week { display: grid; grid-template-columns: repeat(7, 1fr); gap: var(--sp-2); width: 100%; max-width: 1000px; }
  .slot { display: flex; flex-direction: column; align-items: center; gap: 6px; min-height: 130px; padding: var(--sp-3) var(--sp-1); border: 1.5px solid var(--border); border-radius: var(--r-card); background: var(--surface); color: var(--text); transition: transform 0.1s ease, border-color 0.2s ease; }
  .slot:active:not(:disabled) { transform: scale(0.96); }
  .slot .dayname { font-size: var(--fs-small); font-weight: 800; color: var(--dim); }
  .slot .pills { font-size: 30px; line-height: 1; min-height: 34px; }
  .slot small { font-size: 11px; font-weight: 700; color: var(--dim); text-align: center; }
  .slot.s0 { border-color: color-mix(in srgb, var(--grape) 55%, transparent); }
  .slot.s2 { border-color: color-mix(in srgb, var(--toxic) 55%, transparent); }

  .ticker { font-size: var(--fs-h1); font-weight: 900; color: color-mix(in srgb, var(--story) 75%, var(--text)); }

  /* drawn PK concentration–time curve (qualitative; band only, no numbers) */
  .curve { width: 100%; max-width: 760px; height: auto; background: rgba(255, 255, 255, 0.03); border-radius: var(--r-card); }
  .cband { fill: color-mix(in srgb, var(--green) 20%, transparent); }
  .cgrid { stroke: var(--border); stroke-width: 1; opacity: 0.4; }
  .cday { fill: var(--dim); font-size: 14px; font-weight: 800; text-anchor: middle; }
  .cline { fill: none; stroke: var(--story); stroke-width: 4; stroke-linejoin: round; stroke-linecap: round; }
  .cdot { fill: #fff; stroke: var(--story); stroke-width: 3; }

  .optcol { display: flex; flex-direction: column; gap: var(--sp-2); width: 100%; max-width: 720px; }

  @keyframes beatin { from { opacity: 0; transform: translateY(18px); } }
  @keyframes factin { from { opacity: 0; transform: translateY(8px); } }
  @media (prefers-reduced-motion: reduce) { .beat, .factcard { animation: none; } }
</style>
