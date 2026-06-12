<script lang="ts">
  // Self-contained v2 story „Die Antibiotika-Kur" (Adhärenz · Antibiotikum/Resistenz).
  // REWORK 2026-06-12 — a GUIDED TEACHING ARC. Every beat motivates the next move and pairs the
  // real pump (driveTo) with two on-screen aids that mirror the body: a REAL one-compartment oral
  // PK curve (smooth absorb/eliminate saw-tooth, band + kill line + toxic line) and a bacteria
  // petri that thins out, survives, blooms RESISTANT, or clears.
  // Arc: briefing → accumulate to steady state → Q1 → skipped dose → Q2 → „nachholen" double
  // (overshoot, then the correct fix) → stop-early RESISTANCE bloom → Q3 → finish the course → win.
  // It always reaches the cure (a teaching win); the stars grade the three questions.
  import { onMount } from 'svelte'
  import { t } from '../locale.svelte'
  import { game, driveTo, backToStories } from '../game.svelte'
  import PlayShell from '../PlayShell.svelte'
  import WatchBody from '../WatchBody.svelte'
  import EndScreen from '../EndScreen.svelte'
  import {
    ADH_EMPTY, ADH_KILL_LINE, ADH_STEADY, ADH_SKIP_LOW, ADH_DOUBLE_HIGH,
    ADH_TRACK_ACCUM, ADH_TRACK_STOP,
    PK_DOSE_FULL, PK_DOSE_SKIP, PK_DOSE_DOUBLE, PK_DOSE_STOP,
    pkTrace, pkPolyline, pkX, pkY, PK_MIC, PK_TOX, ADH_PLOT,
    ADH_BUGS, ADH_RESISTANT, bugsAliveAt,
    ADH_Q1, ADH_Q2, ADH_Q3, adhOptionsFor, adhCleverGrade, adhProGrade,
    type AdhQOpt,
  } from '../stories/adherence'
  import { stars } from '../flow'

  type Beat = 'briefing' | 'accumulate' | 'q1' | 'skip' | 'q2' | 'double' | 'resistance' | 'q3' | 'cure' | 'won' | 'outcome'
  let beat = $state<Beat>('briefing')
  let pumping = $state(false)

  // ── the PK curve: a scenario dose-vector, a plotted [t0,t1] day-window, and how far it is drawn ──
  let pkDoses = $state<number[]>(PK_DOSE_FULL)
  let pkWin = $state<[number, number]>([0, 3])
  let pkReveal = $state(0)
  let pkTraceArr = $derived(pkTrace(pkDoses))
  let pkPts = $derived(pkPolyline(pkTraceArr, pkWin[0], pkWin[1], pkReveal))
  let pkDot = $derived.by(() => {
    const r = Math.min(pkWin[1], pkReveal)
    const pts = pkTraceArr.filter((s) => s.t >= pkWin[0] - 1e-9 && s.t <= r + 1e-9)
    return pts.length ? pts[pts.length - 1] : null
  })
  let pkTimer: ReturnType<typeof setInterval> | undefined
  function animatePk(to: number, ms = 1100, onDone: () => void = () => {}) {
    clearInterval(pkTimer)
    const from = pkReveal
    const start = performance.now()
    pkTimer = setInterval(() => {
      const f = Math.min(1, (performance.now() - start) / ms)
      pkReveal = from + (to - from) * f
      if (f >= 1) { clearInterval(pkTimer); pkReveal = to; onDone() }
    }, 1000 / 60)
  }
  $effect(() => () => clearInterval(pkTimer))

  // curve band geometry (normalised concentration axis)
  const yTox = pkY(PK_TOX)
  const yMic = pkY(PK_MIC)

  // ── the bacteria petri stage (scripted per beat; 'accum' derives the live count from the level) ──
  type BugStage = 'full' | 'accum' | 'survivors' | 'resistant' | 'cleared'
  let bugStage = $state<BugStage>('full')

  let accumStep = $state(0) // 0 = at the empty start, 1..3 = doses given
  let skipStarted = $state(false)
  let doubleGiven = $state(false)
  let doubleHealed = $state(false)
  let resistStarted = $state(false)
  let resistDone = $state(false)
  let cureStarted = $state(false)
  let cureDone = $state(false)

  // questions (gated: must pick the correct option to proceed; wrong tap = feedback + stumble)
  let q1Done = $state(false), q1Msg = $state<string | null>(null), q1Stumbled = $state(false)
  let q2Done = $state(false), q2Msg = $state<string | null>(null), q2Stumbled = $state(false)
  let q3Done = $state(false), q3Msg = $state<string | null>(null), q3Stumbled = $state(false)

  let adult = $derived(game.ageGroup === 'adult')
  let clever = $derived(adhCleverGrade(q1Stumbled))
  let pro = $derived(adhProGrade((q2Stumbled ? 1 : 0) + (q3Stumbled ? 1 : 0)))
  let starCount = $derived(stars(true, clever, pro))

  let stepNum = $derived(
    beat === 'briefing' ? 1
    : beat === 'accumulate' || beat === 'q1' ? 2
    : beat === 'skip' || beat === 'q2' ? 3
    : beat === 'double' ? 4
    : beat === 'resistance' || beat === 'q3' ? 5
    : 6,
  )

  // live accumulation caption, read off the body
  let accumCue = $derived(
    (game.level?.level ?? ADH_EMPTY) >= ADH_STEADY - 2 ? 'adh.accum.steady'
    : (game.level?.level ?? ADH_EMPTY) >= ADH_KILL_LINE ? 'adh.accum.entered'
    : 'adh.accum.below',
  )

  // petri caption (single readable line BELOW the dish — never overlapping the bugs)
  let petriCap = $derived(
    bugStage === 'resistant' ? { key: 'adh.petri.resistant', cls: 'warn' }
    : bugStage === 'cleared' ? { key: 'adh.petri.cleared', cls: 'good' }
    : { key: 'adh.petri.label', cls: '' },
  )

  // ── bacteria render model (deterministic; CSS handles fade/scale/bloom) ──
  type RBug = { id: string; x: number; y: number; kind: 'normal' | 'tough' | 'resistant'; alive: boolean }
  const NONTOUGH = ADH_BUGS.filter((b) => !b.tough)
  const TOUGH = ADH_BUGS.filter((b) => b.tough)
  let renderBugs = $derived.by<RBug[]>(() => {
    const lvl = game.level?.level ?? ADH_EMPTY
    if (bugStage === 'resistant') {
      return [
        ...ADH_BUGS.map((b) => ({ ...b, kind: (b.tough ? 'resistant' : 'normal') as RBug['kind'], alive: !!b.tough })),
        ...ADH_RESISTANT.map((b) => ({ ...b, kind: 'resistant' as const, alive: true })),
      ]
    }
    if (bugStage === 'cleared') {
      return [
        ...ADH_BUGS.map((b) => ({ ...b, kind: 'normal' as const, alive: false })),
        ...ADH_RESISTANT.map((b) => ({ ...b, kind: 'resistant' as const, alive: false })),
      ]
    }
    if (bugStage === 'survivors') {
      return ADH_BUGS.map((b) => ({ ...b, kind: (b.tough ? 'tough' : 'normal') as RBug['kind'], alive: !!b.tough }))
    }
    if (bugStage === 'accum') {
      const nonToughAlive = Math.max(0, bugsAliveAt(lvl) - TOUGH.length)
      return [
        ...NONTOUGH.map((b, i) => ({ ...b, kind: 'normal' as const, alive: i < nonToughAlive })),
        ...TOUGH.map((b) => ({ ...b, kind: 'tough' as const, alive: true })),
      ]
    }
    return ADH_BUGS.map((b) => ({ ...b, kind: (b.tough ? 'tough' : 'normal') as RBug['kind'], alive: true }))
  })

  onMount(() => drive(ADH_EMPTY, 8)) // sit at the untreated baseline (the reset already homed here)

  function drive(target: number, rate: number, then: () => void = () => {}) {
    pumping = true
    driveTo(target, rate, () => { pumping = false; then() })
  }

  // ── beat transitions that set up the curve for the next scene ──
  function enterAccumulate() {
    if (pumping) return
    beat = 'accumulate'; bugStage = 'accum'
    pkDoses = PK_DOSE_FULL; pkWin = [0, 3]; pkReveal = 0; accumStep = 0
  }
  function nextDose() {
    if (pumping || accumStep >= ADH_TRACK_ACCUM.length - 1) return
    const next = accumStep + 1
    animatePk(next, 850)
    drive(ADH_TRACK_ACCUM[next], next === ADH_TRACK_ACCUM.length - 1 ? 4 : 6, () => { accumStep = next; pkReveal = next })
  }

  function enterSkip() { beat = 'skip'; bugStage = 'survivors'; pkDoses = PK_DOSE_SKIP; pkWin = [3, 5]; pkReveal = 4 }
  function playSkip() {
    if (pumping || skipStarted) return
    skipStarted = true
    animatePk(5, 1300)
    drive(ADH_SKIP_LOW, 5)
  }

  function enterDouble() { beat = 'double'; pkDoses = PK_DOSE_DOUBLE; pkWin = [3, 6]; pkReveal = 4 }
  function giveDouble() {
    if (pumping || doubleGiven) return
    doubleGiven = true
    animatePk(6, 1500)
    drive(ADH_DOUBLE_HIGH, 4)
  }
  function healDouble() {
    if (pumping || doubleHealed) return
    drive(ADH_STEADY, 4, () => (doubleHealed = true)) // 78 → 62: the right level sits calmly in the band
  }

  function enterResist() { beat = 'resistance'; pkDoses = PK_DOSE_STOP; pkWin = [3, 7]; pkReveal = 4 }
  function stopCourse() {
    if (pumping || resistStarted) return
    resistStarted = true
    animatePk(7, 2000)
    let i = 1
    const step = () => {
      if (i >= ADH_TRACK_STOP.length) { bugStage = 'resistant'; resistDone = true; return }
      drive(ADH_TRACK_STOP[i], 5, () => { i++; step() })
    }
    step()
  }

  function enterCure() { beat = 'cure'; bugStage = 'survivors'; pkDoses = PK_DOSE_FULL; pkWin = [0, 7]; pkReveal = 0 }
  function finishCourse() {
    if (pumping || cureStarted) return
    cureStarted = true
    animatePk(7, 2200, () => { bugStage = 'cleared'; cureDone = true }) // the last survivors die — none left to resist
    drive(ADH_STEADY, 6)
  }

  function pick(opt: AdhQOpt, which: 1 | 2 | 3) {
    if (pumping) return
    if (which === 1) { q1Msg = opt.fbKey; if (opt.correct) q1Done = true; else q1Stumbled = true }
    else if (which === 2) { q2Msg = opt.fbKey; if (opt.correct) q2Done = true; else q2Stumbled = true }
    else { q3Msg = opt.fbKey; if (opt.correct) q3Done = true; else q3Stumbled = true }
  }
</script>

<div class="root">
  <!-- local snippets (declared on the plain div, NOT inside <PlayShell>, so they are reusable
       helpers rather than snippet props of the shell) -->
  {#snippet petri()}
    <div class="petricol">
      <div class="petri" class:resistant={bugStage === 'resistant'} class:cleared={bugStage === 'cleared'}>
        {#each renderBugs as b (b.id)}
          <span class="bug {b.kind}" class:dead={!b.alive} style="left:{b.x}%; top:{b.y}%; --i:{b.x % 7}"></span>
        {/each}
      </div>
      <span class="plabel {petriCap.cls}">{t(petriCap.key)}</span>
    </div>
  {/snippet}

  {#snippet pkcurve()}
    <svg class="curve" viewBox={`0 0 ${ADH_PLOT.w} ${ADH_PLOT.h}`} aria-hidden="true">
      <!-- zones -->
      <rect class="zhigh" x={ADH_PLOT.left} y={ADH_PLOT.top} width={ADH_PLOT.right - ADH_PLOT.left} height={yTox - ADH_PLOT.top} />
      <rect class="cband" x={ADH_PLOT.left} y={yTox} width={ADH_PLOT.right - ADH_PLOT.left} height={yMic - yTox} />
      <rect class="zlow" x={ADH_PLOT.left} y={yMic} width={ADH_PLOT.right - ADH_PLOT.left} height={ADH_PLOT.bot - yMic} />
      <line class="limit" x1={ADH_PLOT.left} y1={yTox} x2={ADH_PLOT.right} y2={yTox} />
      <line class="killline" x1={ADH_PLOT.left} y1={yMic} x2={ADH_PLOT.right} y2={yMic} />
      <!-- zone labels -->
      <text class="zlbl high" x={ADH_PLOT.left + 8} y={ADH_PLOT.top + 15}>{t('adh.curve.high')}</text>
      <text class="zlbl band" x={ADH_PLOT.left + 8} y={(yTox + yMic) / 2 + 5}>{t('adh.curve.band')}</text>
      <text class="zlbl low" x={ADH_PLOT.left + 8} y={ADH_PLOT.bot - 8}>{t('adh.curve.low')}</text>
      <!-- axis -->
      <line class="axis" x1={ADH_PLOT.left} y1={ADH_PLOT.bot} x2={ADH_PLOT.right} y2={ADH_PLOT.bot} />
      <text class="axislbl" x={ADH_PLOT.right} y={ADH_PLOT.bot + 16}>Zeit →</text>
      <!-- the drawn PK trace -->
      {#if pkPts}
        <polyline points={pkPts} class="cline" />
      {/if}
      {#if pkDot}
        <circle cx={pkX(pkDot.t, pkWin[0], pkWin[1])} cy={pkY(pkDot.c)} r="5.5" class="cdot" />
      {/if}
    </svg>
  {/snippet}

  {#if beat === 'outcome'}
    <EndScreen
      outcome="win"
      titleKey="adh.out.win.title"
      subKey="adh.out.win.sub"
      storyTitleKey="story.adherence.title"
      score={starCount}
      factKeys={['adh.out.dyk1', 'adh.out.dyk2', 'adh.out.dyk3']}
    />
  {:else}
    <PlayShell
      color={game.story?.color ?? '#9aa6c9'}
      kicker={t('story.adherence.title')}
      caseLine={t('adh.case')}
      step={stepNum}
      total={6}
      onCancel={backToStories}
    >
      {#key beat}
        <div class="beat">
          {#if beat === 'briefing'}
            <div class="brief">
              <div class="heroes"><span>🧑</span><span class="vs">vs</span><span class="bugs">🦠</span></div>
              <p class="intro">{t('adh.brief.patient')}</p>
              <p class="goal">{t('adh.brief.goal')}</p>
              <div class="legend">
                <span class="lgtitle">{t('adh.brief.legend')}</span>
                <span class="lgrow high"><i></i>{t('adh.legend.high')}</span>
                <span class="lgrow band"><i></i>{t('adh.legend.band')}</span>
                <span class="lgrow low"><i></i>{t('adh.legend.low')}</span>
              </div>
              <button class="pl-action" disabled={pumping} onclick={enterAccumulate}>{t('adh.brief.btn')}</button>
            </div>

          {:else if beat === 'accumulate'}
            <div class="task">
              <p class="lead-c">{t('adh.accum.prompt')}</p>
              <div class="stage">{@render petri()}{@render pkcurve()}</div>
              {#if pumping}
                <WatchBody text={t('adh.accum.watch')} tone="rising" />
              {:else}
                <WatchBody text={t(accumCue)} tone={accumCue === 'adh.accum.below' ? 'watch' : 'good'} />
              {/if}
              <div class="actions">
                {#if accumStep < ADH_TRACK_ACCUM.length - 1}
                  <button class="pl-action" disabled={pumping} onclick={nextDose}>💊 {t('adh.accum.dose')}</button>
                {:else}
                  <button class="pl-action" disabled={pumping} onclick={() => (beat = 'q1')}>{t('adh.accum.next')}</button>
                {/if}
              </div>
            </div>

          {:else if beat === 'q1'}
            <div class="task qa">
              <h2 class="pl-h2 center">{t('adh.q1.prompt')}</h2>
              {#if q1Done}
                <p class="fb pl-good">{t(q1Msg ?? 'adh.q1.fb.steady')}</p>
                <div class="actions"><button class="pl-action" onclick={enterSkip}>{t('adh.next')}</button></div>
              {:else}
                <div class="optcol">
                  {#each adhOptionsFor(ADH_Q1, adult) as o}
                    <button class="pl-opt" disabled={pumping} onclick={() => pick(o, 1)}>{t(o.labelKey)}</button>
                  {/each}
                </div>
                {#if q1Msg}<p class="fb pl-warn">{t(q1Msg)}</p>{/if}
              {/if}
            </div>

          {:else if beat === 'skip'}
            <div class="task">
              {#if !skipStarted}
                <h2 class="pl-h2 center">{t('adh.skip.intro')}</h2>
                <div class="stage">{@render petri()}{@render pkcurve()}</div>
                <div class="actions"><button class="pl-action" disabled={pumping} onclick={playSkip}>{t('adh.skip.btn')}</button></div>
              {:else}
                <div class="stage">{@render petri()}{@render pkcurve()}</div>
                {#if pumping}
                  <WatchBody text={t('adh.skip.watch')} tone="falling" />
                {:else}
                  <p class="fb pl-warn">{t('adh.skip.land')}</p>
                  <div class="actions"><button class="pl-action" onclick={() => (beat = 'q2')}>{t('adh.skip.next')}</button></div>
                {/if}
              {/if}
            </div>

          {:else if beat === 'q2'}
            <div class="task qa">
              <h2 class="pl-h2 center">{t('adh.q2.prompt')}</h2>
              {#if q2Done}
                <p class="fb pl-good">{t(q2Msg ?? 'adh.q2.fb.normal')}</p>
                <div class="actions"><button class="pl-action" onclick={enterDouble}>{t('adh.next')}</button></div>
              {:else}
                <div class="optcol">
                  {#each adhOptionsFor(ADH_Q2, adult) as o}
                    <button class="pl-opt" disabled={pumping} onclick={() => pick(o, 2)}>{t(o.labelKey)}</button>
                  {/each}
                </div>
                {#if q2Msg}<p class="fb pl-warn">{t(q2Msg)}</p>{/if}
              {/if}
            </div>

          {:else if beat === 'double'}
            <div class="task">
              {#if !doubleGiven}
                <h2 class="pl-h2 center">{t('adh.double.intro')}</h2>
                <div class="stage">{@render petri()}{@render pkcurve()}</div>
                <div class="actions"><button class="pl-action" disabled={pumping} onclick={giveDouble}>💊💊 {t('adh.double.btn')}</button></div>
              {:else}
                <div class="stage">{@render petri()}{@render pkcurve()}</div>
                {#if pumping && !doubleHealed}
                  <WatchBody text={t('adh.double.watch')} tone="rising" />
                {:else if !doubleHealed}
                  <p class="fb pl-warn">{t('adh.double.land')}</p>
                  <div class="actions"><button class="pl-action" disabled={pumping} onclick={healDouble}>{t('adh.double.healBtn')}</button></div>
                {:else if pumping}
                  <WatchBody text={t('adh.double.watch')} tone="falling" />
                {:else}
                  <p class="fb pl-good">{t('adh.double.heal')}</p>
                  <div class="actions"><button class="pl-action" onclick={enterResist}>{t('adh.double.next')}</button></div>
                {/if}
              {/if}
            </div>

          {:else if beat === 'resistance'}
            <div class="task">
              {#if !resistStarted}
                <h2 class="pl-h2 center">{t('adh.resist.intro')}</h2>
                <div class="stage">{@render petri()}{@render pkcurve()}</div>
                <div class="actions"><button class="pl-action" disabled={pumping} onclick={stopCourse}>{t('adh.resist.btn')}</button></div>
              {:else}
                <div class="stage">{@render petri()}{@render pkcurve()}</div>
                {#if !resistDone}
                  <WatchBody text={t('adh.resist.watch')} tone="falling" />
                {:else}
                  <p class="fb pl-warn">{t('adh.resist.land')}</p>
                  <p class="note">{t('adh.resist.note')}</p>
                  <div class="actions"><button class="pl-action" onclick={() => (beat = 'q3')}>{t('adh.resist.next')}</button></div>
                {/if}
              {/if}
            </div>

          {:else if beat === 'q3'}
            <div class="task qa">
              <h2 class="pl-h2 center">{t('adh.q3.prompt')}</h2>
              {#if q3Done}
                <p class="fb pl-good">{t(q3Msg ?? 'adh.q3.fb.resist')}</p>
                <div class="actions"><button class="pl-action" onclick={enterCure}>{t('adh.next')}</button></div>
              {:else}
                <div class="optcol">
                  {#each adhOptionsFor(ADH_Q3, adult) as o}
                    <button class="pl-opt" disabled={pumping} onclick={() => pick(o, 3)}>{t(o.labelKey)}</button>
                  {/each}
                </div>
                {#if q3Msg}<p class="fb pl-warn">{t(q3Msg)}</p>{/if}
              {/if}
            </div>

          {:else if beat === 'cure'}
            <div class="task">
              {#if !cureStarted}
                <h2 class="pl-h2 center">{t('adh.cure.intro')}</h2>
                <div class="stage">{@render petri()}{@render pkcurve()}</div>
                <div class="actions"><button class="pl-action" disabled={pumping} onclick={finishCourse}>{t('adh.cure.btn')}</button></div>
              {:else}
                <div class="stage">{@render petri()}{@render pkcurve()}</div>
                {#if !cureDone}
                  <WatchBody text={t('adh.cure.watch')} tone="good" />
                {:else}
                  <p class="fb pl-good">{t('adh.cure.done')}</p>
                  <div class="actions"><button class="pl-action" onclick={() => (beat = 'won')}>{t('adh.won.peek')}</button></div>
                {/if}
              {/if}
            </div>

          {:else if beat === 'won'}
            <div class="brief">
              <h2 class="pl-h2 pl-good">{t('adh.won.title')}</h2>
              <p class="goal">{t('adh.won.body')}</p>
              <button class="pl-action" onclick={() => (beat = 'outcome')}>{t('adh.next')}</button>
            </div>
          {/if}
        </div>
      {/key}
    </PlayShell>
  {/if}
</div>

<style>
  .root { position: relative; height: 100%; }
  .beat { height: 100%; display: grid; align-content: center; justify-items: center; gap: var(--sp-3); overflow-y: auto; animation: beatin 0.4s cubic-bezier(0.2, 0.9, 0.3, 1) both; }
  .task { display: flex; flex-direction: column; align-items: center; gap: var(--sp-3); width: 100%; max-width: 1000px; }
  .task.qa { gap: var(--sp-4); }
  .center { text-align: center; }
  .lead-c { color: var(--dim); max-width: 880px; text-align: center; font-size: var(--fs-body); line-height: 1.45; }
  .actions { display: flex; gap: var(--sp-2); justify-content: center; flex-wrap: wrap; }
  .fb { font-size: var(--fs-h2); font-weight: 800; line-height: 1.3; max-width: 920px; text-align: center; }
  .note { color: var(--dim); max-width: 840px; text-align: center; font-size: var(--fs-body); }

  /* ── briefing (compact so it never clips inside the 1280×720 frame) ── */
  .brief { display: flex; flex-direction: column; align-items: center; gap: var(--sp-2); max-width: 900px; text-align: center; }
  .heroes { display: flex; align-items: center; gap: var(--sp-3); font-size: 44px; line-height: 1; }
  .heroes .vs { font-size: var(--fs-small); font-weight: 900; color: var(--dim); text-transform: uppercase; letter-spacing: 1px; }
  .heroes .bugs { filter: drop-shadow(0 0 10px color-mix(in srgb, var(--toxic) 60%, transparent)); }
  .brief .intro { font-size: clamp(19px, 2.1vw, 25px); font-weight: 800; line-height: 1.3; max-width: 880px; }
  .brief .goal { font-size: var(--fs-body); color: var(--text); line-height: 1.4; max-width: 820px; }
  .legend { display: grid; gap: 6px; justify-items: start; text-align: start; padding: var(--sp-2) var(--sp-3); border: 1px solid var(--border); border-radius: var(--r-card); background: var(--surface); max-width: 740px; margin-top: 2px; }
  .lgtitle { font-size: var(--fs-micro); font-weight: 900; letter-spacing: 0.8px; text-transform: uppercase; color: var(--dim); }
  .lgrow { display: flex; align-items: center; gap: 10px; font-size: var(--fs-small); font-weight: 700; line-height: 1.25; }
  .lgrow i { flex: none; width: 16px; height: 16px; border-radius: 5px; }
  .lgrow.high i { background: color-mix(in srgb, var(--toxic) 45%, transparent); border: 1px solid var(--toxic); }
  .lgrow.band i { background: color-mix(in srgb, var(--green) 45%, transparent); border: 1px solid var(--green); }
  .lgrow.low i { background: color-mix(in srgb, var(--grape) 40%, transparent); border: 1px solid var(--grape); }
  .brief .pl-action { margin-top: var(--sp-2); }

  /* petri + curve side by side */
  .stage { display: grid; grid-template-columns: minmax(190px, 0.55fr) minmax(0, 1fr); gap: var(--sp-4); align-items: center; width: 100%; max-width: 980px; }

  /* ── bacteria petri ── */
  .petricol { display: flex; flex-direction: column; align-items: center; gap: 10px; }
  .petri { position: relative; aspect-ratio: 1 / 1; width: 100%; max-width: 230px; border-radius: 50%; border: 2px solid var(--border); background: radial-gradient(circle at 38% 32%, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02) 60%, transparent); overflow: hidden; transition: box-shadow 0.4s ease, border-color 0.4s ease; }
  .petri.resistant { border-color: color-mix(in srgb, var(--toxic) 70%, transparent); box-shadow: 0 0 36px color-mix(in srgb, var(--toxic) 30%, transparent); }
  .petri.cleared { border-color: color-mix(in srgb, var(--green) 65%, transparent); box-shadow: 0 0 30px color-mix(in srgb, var(--green) 22%, transparent); }
  .plabel { font-size: var(--fs-small); font-weight: 800; letter-spacing: 0.3px; color: var(--dim); text-align: center; }
  .plabel.warn { color: var(--toxic); text-shadow: 0 0 12px color-mix(in srgb, var(--toxic) 50%, transparent); }
  .plabel.good { color: var(--green); }

  .bug { position: absolute; width: 16px; height: 12px; border-radius: 50%; transform: translate(-50%, -50%) rotate(18deg); background: radial-gradient(circle at 35% 32%, #d6f5b0, #7fbf45 70%); box-shadow: 0 0 6px rgba(127, 191, 69, 0.5); transition: opacity 0.5s ease, transform 0.5s ease; }
  .bug::before, .bug::after { content: ''; position: absolute; width: 6px; height: 2px; border-radius: 2px; background: inherit; top: 50%; }
  .bug::before { left: -5px; transform: translateY(-50%) rotate(20deg); }
  .bug::after { right: -5px; transform: translateY(-50%) rotate(-20deg); }
  .bug.tough { background: radial-gradient(circle at 35% 32%, #ffe1a8, #e8a13c 70%); box-shadow: 0 0 8px rgba(232, 161, 60, 0.6); }
  .bug.resistant { width: 18px; height: 14px; background: radial-gradient(circle at 35% 32%, #ffc1c1, #e23b4f 70%); box-shadow: 0 0 12px rgba(226, 59, 79, 0.75); animation: throb 1.3s ease-in-out infinite, bloom 0.5s cubic-bezier(0.2, 1.5, 0.4, 1) both; animation-delay: calc(var(--i) * 0.06s), calc(var(--i) * 0.06s); }
  .bug.dead { opacity: 0; transform: translate(-50%, -50%) scale(0.2) rotate(18deg); }

  /* ── PK curve ── */
  .curve { width: 100%; max-width: 660px; height: auto; background: rgba(255, 255, 255, 0.03); border-radius: var(--r-card); }
  .cband { fill: color-mix(in srgb, var(--green) 20%, transparent); }
  .zhigh { fill: color-mix(in srgb, var(--toxic) 9%, transparent); }
  .zlow { fill: color-mix(in srgb, var(--grape) 9%, transparent); }
  .limit { stroke: color-mix(in srgb, var(--toxic) 65%, transparent); stroke-width: 1.5; stroke-dasharray: 6 5; }
  .killline { stroke: color-mix(in srgb, var(--grape) 70%, transparent); stroke-width: 1.5; stroke-dasharray: 6 5; }
  .axis { stroke: var(--border); stroke-width: 1.5; }
  .axislbl { fill: var(--dim); font-size: 12px; font-weight: 700; text-anchor: end; }
  .zlbl { font-size: 13px; font-weight: 800; }
  .zlbl.high { fill: color-mix(in srgb, var(--toxic) 85%, var(--text)); }
  .zlbl.band { fill: color-mix(in srgb, var(--green) 80%, var(--text)); }
  .zlbl.low { fill: color-mix(in srgb, var(--grape) 85%, var(--text)); }
  .cline { fill: none; stroke: var(--story, var(--spm-cyan)); stroke-width: 4; stroke-linejoin: round; stroke-linecap: round; }
  .cdot { fill: #fff; stroke: var(--story, var(--spm-cyan)); stroke-width: 3; }

  .optcol { display: flex; flex-direction: column; gap: var(--sp-2); width: 100%; max-width: 760px; }

  @keyframes beatin { from { opacity: 0; transform: translateY(18px); } }
  @keyframes throb { 50% { transform: translate(-50%, -50%) scale(1.12) rotate(18deg); } }
  @keyframes bloom { from { opacity: 0; transform: translate(-50%, -50%) scale(0.1) rotate(18deg); } }
  @media (prefers-reduced-motion: reduce) {
    .beat { animation: none; }
    .bug { transition: none; }
    .bug.resistant { animation: none; }
  }
</style>
