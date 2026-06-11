<script lang="ts">
  // Self-contained v2 story „Die Blut-Balance" (DDI · Clarithromycin × Phenprocoumon).
  // Blueprint screen on <PlayShell/> + the .pl-* kit. Signature mechanic: SCAN-A-PAIRING —
  // lock the new antibiotic as ONE fixed probe and scan it against each pill already in the
  // plan; four pairings hold der Spiegel DEAD STILL (vertragen sich), the blood-thinner
  // pairing makes it SURGE on its own. No on-screen vessel — the physical pump is the
  // readout; every move sends the eyes to the body via <WatchBody/>. Losses are rebuilt
  // manually (auto-trip is engine-gated to PLAY_PHASES, which play2 is not) via an $effect.
  import { onMount } from 'svelte'
  import { t } from '../locale.svelte'
  import { game, driveTo, hold, testHypothesis, backToStories } from '../game.svelte'
  import PlayShell from '../PlayShell.svelte'
  import WatchBody from '../WatchBody.svelte'
  import EndScreen from '../EndScreen.svelte'
  import {
    DDI_PROBE, DDI_SCAN_PILLS, DDI_OPTIONS, DDI_PLAN_CARDS, DDI_FACTS, ddiPlanCorrect, ddiStars,
    DDI_START, DDI_SURGE, DDI_WARN, DDI_LINE_HIGH, DDI_LINE_LOW, type DdiOption, type DdiScanPill,
  } from '../stories/ddi'
  import { LEVELS, type Outcome } from '../flow'

  type Beat =
    | 'briefing' | 'filling' | 'briefReveal' | 'lines' | 'newcard' | 'scan'
    | 'demo' | 'demoCheck' | 'strategy' | 'moving' | 'finale' | 'outcome'
  let beat = $state<Beat>('briefing')
  let outcome = $state<Outcome>('win')
  let pumping = $state(false) // true while the pump moves → action buttons blocked

  // dose-fill „Wusstest du?" rotation (the slow baseline rise 20→62)
  let factIdx = $state(0)
  let fillDone = $state(false)
  let factShownAt = 0
  const FACT_MS = 4500
  const FACT_MIN_MS = 3800

  // 1 · meaning teach
  let linesRunning = $state(false)
  let linesShown = $state(false)
  let lineCue = $state('ddi.lines.high')
  let lineTone = $state<'rising' | 'falling' | 'good'>('rising')

  // 2 · seed stillness
  let cardDropped = $state(false)

  // 3 · scanner
  let scannedIds = $state<string[]>([])
  let scanActive = $state<string | null>(null)
  let scanNudged = $state(false)
  let surged = $state(false)
  let scanCue = $state('ddi.scan.watch')
  let scanTone = $state<'watch' | 'still' | 'rising'>('watch')

  // 4 · twist demo
  let demoRunning = $state(false)
  let twistRead = $state(false)
  let twistWrongOnce = $state(false)
  let demoFb = $state<string | null>(null)

  // 5 · strategy + move
  let chosen = $state<DdiOption | null>(null)
  let resolved = $state(false)
  let moveCue = $state('ddi.move.win')
  let moveTone = $state<'rising' | 'falling' | 'good'>('falling')

  // 6 · safe-plan sort
  let assign = $state<Record<string, boolean | undefined>>({})
  let planConfirmed = $state(false)
  let sortDirty = $state(false)
  let planRetry = $state(false)

  let options = $derived(DDI_OPTIONS.filter((o) => game.ageGroup === 'adult' || !o.adultOnly))
  let harmlessScanned = $derived(DDI_SCAN_PILLS.filter((p) => !p.danger && scannedIds.includes(p.id)).length)
  let dangerUnlocked = $derived(harmlessScanned >= 4)
  let allAssigned = $derived(DDI_PLAN_CARDS.every((c) => assign[c.id] !== undefined))
  let starCount = $derived(ddiStars(outcome === 'win', { scanClean: !scanNudged, twistRead, sortClean: !sortDirty }))
  let stepNum = $derived(
    ['briefing', 'filling', 'briefReveal', 'lines'].includes(beat) ? 1
    : beat === 'newcard' ? 2
    : beat === 'scan' ? 3
    : ['demo', 'demoCheck'].includes(beat) ? 4
    : ['strategy', 'moving'].includes(beat) ? 5
    : 6,
  )

  onMount(() => drive(LEVELS.start, 8)) // sit at the empty baseline (the reset already homed here)

  // pump wrapper: blocks buttons while the water moves, frees them on settle
  function drive(target: number, rate: number, then: () => void = () => {}) {
    pumping = true
    driveTo(target, rate, () => { pumping = false; then() })
  }

  // rotate the dose-fill facts while the slow baseline pumps in; freeze on settle
  $effect(() => {
    if (beat !== 'filling') return
    factIdx = 0
    factShownAt = performance.now()
    const id = setInterval(() => {
      if (fillDone) return
      factIdx = (factIdx + 1) % DDI_FACTS.length
      factShownAt = performance.now()
    }, FACT_MS)
    return () => clearInterval(id)
  })
  $effect(() => {
    if (beat !== 'filling' || !fillDone) return
    const wait = Math.max(700, FACT_MIN_MS - (performance.now() - factShownAt))
    const id = setTimeout(() => (beat = 'briefReveal'), wait)
    return () => clearTimeout(id)
  })

  // manual auto-trip: a dangerous strategy move ends the run the instant the water
  // crosses a red tape mid-travel (engine auto-trip does not fire on the play2 path)
  $effect(() => {
    if (beat !== 'moving' || !chosen || chosen.result === 'win' || resolved) return
    const lv = game.level?.level
    if (lv === undefined) return
    if (lv >= 80) { resolved = true; outcome = 'over'; beat = 'outcome' }
    else if (lv <= 35) { resolved = true; outcome = 'under'; beat = 'outcome' }
  })

  function startFill() {
    if (pumping) return
    fillDone = false
    beat = 'filling'
    drive(DDI_START, 7, () => (fillDone = true)) // 20 → 62 baseline rise
  }

  function runLines() {
    if (linesRunning || pumping) return
    linesRunning = true
    pumping = true
    lineCue = 'ddi.lines.high'; lineTone = 'rising'
    driveTo(DDI_LINE_HIGH, 6, () => hold(800, () => {
      lineCue = 'ddi.lines.low'; lineTone = 'falling'
      driveTo(DDI_LINE_LOW, 6, () => hold(800, () => {
        lineCue = 'ddi.lines.mid'; lineTone = 'good'
        driveTo(DDI_START, 6, () => { linesShown = true; pumping = false })
      }))
    }))
  }

  function dropNewCard() {
    if (cardDropped) return
    cardDropped = true // stillness: the pill alone changes nothing (no pump move)
  }

  function scanPill(p: DdiScanPill) {
    if (pumping || scanActive || surged) return
    if (p.danger) {
      if (!dangerUnlocked) { scanNudged = true; scanCue = 'ddi.scan.locked'; scanTone = 'still'; return }
      scanActive = p.id; scanCue = 'ddi.scan.watch'; scanTone = 'watch'; pumping = true
      driveTo(DDI_SURGE, 2.5, () => {
        surged = true; scanActive = null; pumping = false
        scanCue = 'ddi.scan.surge'; scanTone = 'rising'
        scannedIds = [...scannedIds, p.id]
      })
      return
    }
    if (scannedIds.includes(p.id)) return
    scanActive = p.id; scanCue = 'ddi.scan.watch'; scanTone = 'watch'; pumping = true
    testHypothesis({ real: false, holdMs: 1300 }, () => {
      scanCue = 'ddi.scan.still'; scanTone = 'still'
      scannedIds = [...scannedIds, p.id]
      scanActive = null; pumping = false
    })
  }

  function runDemo() {
    if (demoRunning || pumping) return
    demoRunning = true; pumping = true
    driveTo(DDI_WARN, 3, () => { pumping = false; beat = 'demoCheck' })
  }
  function answerDemo(up: boolean) {
    if (up) {
      if (!twistWrongOnce) twistRead = true
      beat = 'strategy'
    } else {
      twistWrongOnce = true
      demoFb = 'ddi.demo.wrong'
    }
  }

  function pick(o: DdiOption) {
    if (pumping) return
    chosen = o; resolved = false; beat = 'moving'
    if (o.result === 'win') { moveCue = 'ddi.move.win'; moveTone = 'falling' }
    else if (o.result === 'over') { moveCue = 'ddi.move.over'; moveTone = 'rising' }
    else { moveCue = 'ddi.move.under'; moveTone = 'falling' }
    drive(o.target, o.result === 'under' ? 6 : 5, () => {
      if (resolved) return
      resolved = true
      if (o.result === 'win') beat = 'finale'
      else { outcome = o.result; beat = 'outcome' }
    })
  }

  function setBin(id: string, safe: boolean) {
    if (planConfirmed) return
    assign = { ...assign, [id]: safe }
  }
  function confirmPlan() {
    if (!allAssigned || planConfirmed) return
    if (ddiPlanCorrect(assign as Record<string, boolean>)) {
      planConfirmed = true
    } else {
      sortDirty = true; planRetry = true
      const fixed = { ...assign }
      for (const c of DDI_PLAN_CARDS) if (fixed[c.id] !== c.safe) fixed[c.id] = undefined
      assign = fixed
    }
  }
</script>

<div class="root">
  {#if beat === 'outcome'}
    <EndScreen
      {outcome}
      titleKey={`ddi.out.${outcome}.title`}
      subKey={`ddi.out.${outcome}.sub`}
      storyTitleKey="story.ddi.title"
      score={starCount}
      factKeys={outcome === 'win'
        ? ['ddi.out.dyk1', 'ddi.out.dyk2']
        : outcome === 'over'
          ? ['ddi.out.dyk.over', 'ddi.out.dyk1']
          : ['ddi.out.dyk.under', 'ddi.out.dyk1']}
    />
  {:else}
    <PlayShell
      color={game.story?.color ?? '#4cc9f0'}
      kicker={t('story.ddi.title')}
      caseLine={t('ddi.case')}
      step={stepNum}
      total={6}
      onCancel={backToStories}
    >
      {#key beat}
        <div class="beat">
          {#if beat === 'briefing'}
            <div class="scene">
              <span class="pl-emoji">🫀</span>
              <h1 class="pl-h1">{t('ddi.brief.patient')}</h1>
              <p class="pl-lead">{t('ddi.brief.goal')}</p>
              <div class="actions">
                <button class="pl-action" disabled={pumping} onclick={startFill}>{t('ddi.brief.next')}</button>
              </div>
            </div>

          {:else if beat === 'filling'}
            <div class="scene wide">
              <WatchBody text={t(fillDone ? 'ddi.cue.filled' : 'ddi.cue.fill')} tone="good" />
              {#key factIdx}
                <div class="factcard pl-card">
                  <span class="factkick">{t('ddi.fact.kicker')}</span>
                  <p>{t(DDI_FACTS[factIdx])}</p>
                </div>
              {/key}
            </div>

          {:else if beat === 'briefReveal'}
            <div class="scene">
              <div class="reveal pl-good">{t('ddi.cue.filled')}</div>
              <div class="actions">
                <button class="pl-action" onclick={() => (beat = 'lines')}>{t('common.next')}</button>
              </div>
            </div>

          {:else if beat === 'lines'}
            <div class="scene">
              <h2 class="pl-h2">{t('ddi.lines.prompt')}</h2>
              {#if !linesShown}
                {#if linesRunning}
                  <WatchBody text={t(lineCue)} tone={lineTone} />
                {:else}
                  <div class="actions">
                    <button class="pl-action" disabled={pumping} onclick={runLines}>{t('ddi.lines.btn')}</button>
                  </div>
                {/if}
              {:else}
                <WatchBody text={t('ddi.lines.mid')} tone="good" />
                <div class="actions">
                  <button class="pl-action" onclick={() => (beat = 'newcard')}>{t('ddi.lines.next')}</button>
                </div>
              {/if}
            </div>

          {:else if beat === 'newcard'}
            <div class="scene wide">
              <h2 class="pl-h2">{t('ddi.newcard.prompt')}</h2>
              <div class="planrow">
                {#each DDI_SCAN_PILLS as p}
                  <div class="medchip"><b>{t(p.nameKey)}</b><span>{t(p.roleKey)}</span></div>
                {/each}
                <button class="medchip new" class:dropped={cardDropped} disabled={cardDropped} onclick={dropNewCard}>
                  <em>{t('ddi.new')}</em><b>{t(DDI_PROBE.nameKey)}</b><span>{t(DDI_PROBE.roleKey)}</span>
                </button>
              </div>
              {#if cardDropped}
                <WatchBody text={t('ddi.newcard.still')} tone="still" />
                <div class="actions">
                  <button class="pl-action" onclick={() => (beat = 'scan')}>{t('ddi.newcard.next')}</button>
                </div>
              {:else}
                <div class="actions">
                  <button class="pl-action" onclick={dropNewCard}>{t('ddi.newcard.btn')}</button>
                </div>
              {/if}
            </div>

          {:else if beat === 'scan'}
            <div class="task">
              <h2 class="pl-h2 center">{t('ddi.scan.prompt')}</h2>
              <div class="probe"><em>{t('ddi.scan.probe')}</em><b>{t(DDI_PROBE.nameKey)}</b></div>
              <div class="scangrid">
                {#each DDI_SCAN_PILLS as p}
                  {@const done = scannedIds.includes(p.id)}
                  {@const locked = p.danger && !dangerUnlocked}
                  <button
                    class="scantile"
                    class:done={done && !p.danger}
                    class:alarm={p.danger && surged}
                    class:locked
                    disabled={pumping || (done && !p.danger) || surged}
                    onclick={() => scanPill(p)}
                  >
                    <b>{t(p.nameKey)}</b>
                    <span>{t(p.roleKey)}</span>
                    <small>
                      {#if scanActive === p.id}…
                      {:else if done && !p.danger}{t('ddi.scan.tag.still')}
                      {:else if p.danger && surged}{t('ddi.scan.tag.alarm')}
                      {:else if locked}🔒{/if}
                    </small>
                  </button>
                {/each}
              </div>
              <WatchBody text={t(scanCue)} tone={scanTone} />
              {#if surged}
                <div class="actions">
                  <button class="pl-action" onclick={() => (beat = 'demo')}>{t('ddi.scan.next')}</button>
                </div>
              {/if}
            </div>

          {:else if beat === 'demo'}
            <div class="scene">
              <h2 class="pl-h2">{t('ddi.demo.prompt')}</h2>
              {#if demoRunning}
                <WatchBody text={t('ddi.demo.rising')} tone="rising" />
              {:else}
                <div class="actions">
                  <button class="pl-action" disabled={pumping} onclick={runDemo}>{t('ddi.demo.btn')}</button>
                </div>
              {/if}
            </div>

          {:else if beat === 'demoCheck'}
            <div class="task">
              <h2 class="pl-h2 center">{t('ddi.demo.q')}</h2>
              <div class="optrow">
                <button class="pl-opt" onclick={() => answerDemo(true)}>{t('ddi.demo.up')}</button>
                <button class="pl-opt" onclick={() => answerDemo(false)}>{t('ddi.demo.down')}</button>
              </div>
              {#if demoFb}<p class="fb pl-bad">{t(demoFb)}</p>{/if}
            </div>

          {:else if beat === 'strategy'}
            <div class="task">
              <h2 class="pl-h2 center">{t('ddi.strat.prompt')}</h2>
              <div class="optcol">
                {#each options as o}
                  <button class="pl-opt" disabled={pumping} onclick={() => pick(o)}>{t(o.labelKey)}</button>
                {/each}
              </div>
            </div>

          {:else if beat === 'moving'}
            <div class="scene">
              <WatchBody text={t(moveCue)} tone={moveTone} />
              {#if chosen && chosen.result !== 'win'}<p class="fb pl-bad">{t(chosen.feedbackKey)}</p>{/if}
            </div>

          {:else if beat === 'finale'}
            <div class="task">
              <h2 class="pl-h2 center">{t('ddi.plan.prompt')}</h2>
              <div class="bins">
                {#each DDI_PLAN_CARDS as c}
                  <div class="binrow" class:right={planConfirmed && assign[c.id] === c.safe}>
                    <span class="combo">{t(c.labelKey)}</span>
                    <div class="binbtns">
                      <button class="binbtn" class:sel={assign[c.id] === true} disabled={planConfirmed} onclick={() => setBin(c.id, true)}>{t('ddi.plan.safebin')}</button>
                      <button class="binbtn" class:sel={assign[c.id] === false} disabled={planConfirmed} onclick={() => setBin(c.id, false)}>{t('ddi.plan.unsafebin')}</button>
                    </div>
                  </div>
                {/each}
              </div>
              {#if !planConfirmed}
                {#if planRetry}<p class="fb pl-bad">{t('ddi.plan.retry')}</p>{/if}
                <div class="actions">
                  <button class="pl-action" onclick={confirmPlan} disabled={!allAssigned}>{t('ddi.plan.confirm')}</button>
                </div>
              {:else}
                <p class="fb pl-good">{t('ddi.plan.correct')}</p>
                <div class="actions">
                  <button class="pl-action" onclick={() => (beat = 'outcome')}>{t('ddi.plan.next')}</button>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/key}
    </PlayShell>
  {/if}
</div>

<style>
  .root { position: relative; height: 100%; }

  .beat {
    height: 100%;
    display: grid;
    align-content: center;
    justify-items: center;
    gap: var(--sp-4);
    animation: beatin 0.4s cubic-bezier(0.2, 0.9, 0.3, 1) both;
  }

  .scene {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--sp-4);
    max-width: 860px;
    text-align: center;
  }
  .scene.wide { max-width: 980px; width: 100%; }
  .task { display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); width: 100%; }
  .center { text-align: center; }
  .actions { display: flex; gap: var(--sp-2); justify-content: center; flex-wrap: wrap; }

  .reveal { font-size: var(--fs-display); font-weight: 900; line-height: 1.05; text-shadow: 0 0 26px color-mix(in srgb, var(--green) 35%, transparent); }
  .fb { font-size: var(--fs-h2); font-weight: 800; line-height: 1.3; max-width: 900px; text-align: center; }

  /* dose-fill fact card */
  .factcard { max-width: 680px; text-align: center; animation: factin 0.4s ease both; }
  .factcard .factkick { display: inline-block; font-size: var(--fs-micro); font-weight: 900; letter-spacing: 1px; text-transform: uppercase; color: var(--spm-cyan-bright); margin-bottom: var(--sp-1); }
  .factcard p { font-size: var(--fs-lead); line-height: 1.45; }

  /* plan row + glowing new-probe chip (seed-stillness beat) */
  .planrow { display: flex; flex-wrap: wrap; gap: 10px; width: 100%; justify-content: center; }
  .medchip {
    display: flex; flex-direction: column; gap: 2px; padding: 12px 16px;
    border: 1.5px solid var(--border); border-radius: var(--r-card); background: var(--surface); text-align: start; color: var(--text);
  }
  .medchip b { font-size: 17px; font-weight: 800; }
  .medchip span { font-size: 13px; color: var(--dim); }
  .medchip.new { border-color: var(--spm-cyan); background: rgba(0, 190, 202, 0.12); position: relative; animation: glow 1.6s ease-in-out infinite; }
  .medchip.new em { font-style: normal; font-size: 11px; font-weight: 900; letter-spacing: 1px; color: var(--spm-cyan-bright); }
  .medchip.new.dropped { animation: none; opacity: 0.85; }

  /* pinned-probe scanner */
  .probe { display: flex; align-items: baseline; gap: 12px; padding: 12px 18px; border: 1.5px solid var(--spm-cyan); border-radius: var(--r-card); background: rgba(0, 190, 202, 0.12); }
  .probe em { font-style: normal; font-size: 12px; font-weight: 900; letter-spacing: 1px; color: var(--spm-cyan-bright); text-transform: uppercase; }
  .probe b { font-size: 20px; font-weight: 900; }
  .scangrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; width: 100%; max-width: 1000px; }
  .scantile {
    text-align: start; display: flex; flex-direction: column; gap: 3px; min-height: 100px;
    padding: 14px 16px; border: 1.5px solid var(--border); border-radius: var(--r-card); background: var(--surface); color: var(--text);
    transition: transform 0.1s ease, border-color 0.2s ease, background 0.2s ease;
  }
  .scantile:active:not(:disabled) { transform: scale(0.97); border-color: var(--spm-cyan); }
  .scantile b { font-size: 17px; font-weight: 800; }
  .scantile span { font-size: 13px; color: var(--dim); }
  .scantile small { margin-top: auto; font-size: 13px; font-weight: 800; color: var(--dim); }
  .scantile.done { border-color: var(--green); background: rgba(56, 224, 160, 0.1); }
  .scantile.done small { color: var(--green); }
  .scantile.alarm { border-color: var(--toxic); background: rgba(255, 107, 122, 0.12); }
  .scantile.alarm small { color: var(--toxic); }
  .scantile.locked { opacity: 0.55; }
  .scantile:disabled { cursor: default; }

  .optcol { display: flex; flex-direction: column; gap: var(--sp-2); width: 100%; max-width: 720px; }
  .optrow { display: flex; gap: var(--sp-2); width: 100%; max-width: 620px; }
  .optrow .pl-opt { flex: 1; text-align: center; }

  /* safe-plan sort */
  .bins { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 920px; }
  .binrow { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 12px; background: var(--surface); }
  .binrow.right { border-color: var(--green); }
  .combo { font-size: 16px; font-weight: 700; }
  .binbtns { display: flex; gap: 6px; flex: none; }
  .binbtn { border: 1.5px solid var(--border); background: var(--surface2); border-radius: 10px; padding: 9px 14px; font-size: 13px; font-weight: 700; white-space: nowrap; color: var(--text); }
  .binbtn.sel { border-color: var(--spm-cyan); background: rgba(0, 190, 202, 0.18); color: var(--spm-cyan-bright); }

  @keyframes beatin { from { opacity: 0; transform: translateY(18px); } }
  @keyframes factin { from { opacity: 0; transform: translateY(8px); } }
  @keyframes glow { 50% { box-shadow: 0 0 22px rgba(0, 190, 202, 0.4); } }
  @media (prefers-reduced-motion: reduce) { .beat, .factcard, .medchip.new { animation: none; } }
</style>
