<script lang="ts">
  // Self-contained v2 story „Die Blut-Balance" (DDI · Phenprocoumon). Built on <PlayShell/>
  // + the .pl-* kit. Signature mechanic: THE ENZYME IS A THROTTLE — a body „Helfer" clears
  // the blood thinner at a steady rate (level holds green); a drug can JAM it (Bremse →
  // level rises → bleeding) or REV it (Turbo → level falls → clot). Two acts, both real on
  // the pump: Act 1 the new antibiotic is a Bremse (climb → manage down); Act 2 carbamazepin
  // is a Turbo (drop → manage up). Capstone: a „Bremse oder Turbo?" sort. No on-screen vessel
  // — the real pump is the readout (the Werkstatt SVG only teaches the mechanism). Losses are
  // rebuilt manually (auto-trip is engine-gated to the legacy path) via the moving $effect.
  import { onMount } from 'svelte'
  import { t } from '../locale.svelte'
  import { game, driveTo, hold, testHypothesis, backToStories } from '../game.svelte'
  import PlayShell from '../PlayShell.svelte'
  import WatchBody from '../WatchBody.svelte'
  import DdiWerkstatt from './DdiWerkstatt.svelte'
  import EndScreen from '../EndScreen.svelte'
  import {
    DDI_DETEKTIV_PILLS, DDI_DECISION1, DDI_DECISION2, DDI_SORT, DDI_FACTS,
    ddiSortGrade, ddiStars, DDI_BASELINE, DDI_START, DDI_SURGE, DDI_DRIFT_LOW,
    DDI_LINE_HIGH, DDI_LINE_LOW, type DdiOption, type DdiPill, type Throttle, type SortCat,
  } from '../stories/ddi'
  import { LEVELS, type Outcome } from '../flow'

  type Beat =
    | 'briefing' | 'filling' | 'briefReveal' | 'lines'      // 1 · setup
    | 'werkstatt'                                            // 2 · the instrument
    | 'auftrag1' | 'detektiv' | 'detfound' | 'entscheid1' | 'moving1' // 3 · Act 1 (Bremse)
    | 'auftrag2' | 'turbo' | 'entscheid2' | 'moving2'        // 4 · Act 2 (Turbo)
    | 'sort' | 'outcome'                                     // 5 · capstone
  let beat = $state<Beat>('briefing')
  let outcome = $state<Outcome>('win')
  let pumping = $state(false) // true while the pump moves → action buttons blocked

  // 1 · dose-fill „Wusstest du?" rotation (the slow baseline rise 20→62)
  let factIdx = $state(0)
  let fillDone = $state(false)
  let factShownAt = 0
  const FACT_MS = 4500
  const FACT_MIN_MS = 3800

  // 1 · meaning teach (what too high / too low looks like on the body)
  let linesRunning = $state(false)
  let linesShown = $state(false)
  let lineCue = $state('ddi.lines.high')
  let lineTone = $state<'rising' | 'falling' | 'good'>('rising')

  // 2 · Werkstatt — try both levers before moving on
  let werkMode = $state<Throttle>('normal')
  let werkTried = $state(new Set<Throttle>())
  let werkDone = $derived(werkTried.has('bremse') && werkTried.has('turbo'))

  // 3 · Enzym-Detektiv — find the Bremse among his drugs
  const newAb = DDI_DETEKTIV_PILLS.find((p) => p.bremse)!
  const planOthers = DDI_DETEKTIV_PILLS.filter((p) => !p.bremse)
  let detTested = $state<string[]>([])
  let detActive = $state<string | null>(null)
  let wrongGuesses = $state(0)
  let surged = $state(false)
  let detCue = $state('ddi.det.watch')
  let detTone = $state<'watch' | 'still' | 'rising'>('watch')

  // 3/4 · the two decisions (the pick itself moves the body)
  let chosen1 = $state<DdiOption | null>(null)
  let resolved1 = $state(false)
  let chosen2 = $state<DdiOption | null>(null)
  let resolved2 = $state(false)
  let moveCue = $state('ddi.move.win')
  let moveTone = $state<'rising' | 'falling' | 'good'>('falling')

  // 4 · Act 2 Turbo reveal
  let turboRun = $state(false)
  let turboDone = $state(false)

  // 5 · the sort
  let assign = $state<Record<string, SortCat | undefined>>({})
  let sortConfirmed = $state(false)
  let sortGrade = $state(0)

  let options1 = $derived(DDI_DECISION1.filter((o) => game.ageGroup === 'adult' || !o.adultOnly))
  let options2 = $derived(DDI_DECISION2.filter((o) => game.ageGroup === 'adult' || !o.adultOnly))
  let allAssigned = $derived(DDI_SORT.every((i) => assign[i.id] !== undefined))
  let starCount = $derived(ddiStars(outcome === 'win', wrongGuesses, sortGrade))
  let stepNum = $derived(
    ['briefing', 'filling', 'briefReveal', 'lines'].includes(beat) ? 1
    : beat === 'werkstatt' ? 2
    : ['auftrag1', 'detektiv', 'detfound', 'entscheid1', 'moving1'].includes(beat) ? 3
    : ['auftrag2', 'turbo', 'entscheid2', 'moving2'].includes(beat) ? 4
    : 5,
  )

  onMount(() => drive(DDI_BASELINE, 8)) // sit at the empty baseline (the reset already homed here)

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

  // manual auto-trip: a dangerous decision ends the run the instant the water crosses a red
  // tape mid-travel (engine auto-trip does not fire on the play2 path). Covers both decisions.
  $effect(() => {
    if (beat !== 'moving1' && beat !== 'moving2') return
    const chosen = beat === 'moving1' ? chosen1 : chosen2
    const resolved = beat === 'moving1' ? resolved1 : resolved2
    if (!chosen || chosen.result === 'win' || resolved) return
    const lv = game.level?.level
    if (lv === undefined) return
    if (lv >= LEVELS.critHigh || lv <= LEVELS.critLow) {
      if (beat === 'moving1') resolved1 = true
      else resolved2 = true
      outcome = lv >= LEVELS.critHigh ? 'over' : 'under'
      beat = 'outcome'
    }
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

  function tryThrottle(m: Throttle) {
    werkMode = m
    if (m !== 'normal') werkTried = new Set(werkTried).add(m)
  }

  // detektiv: tap a drug to test it on the helper. The antibiotic jams it (body climbs →
  // found); a neutral holds the body dead still and counts as a wrong guess.
  function testPill(p: DdiPill) {
    if (pumping || surged) return
    if (p.bremse) {
      detActive = p.id; detCue = 'ddi.det.watch'; detTone = 'watch'; pumping = true
      driveTo(DDI_SURGE, 2.5, () => {
        surged = true; detActive = null; pumping = false
        detCue = 'ddi.det.found'; detTone = 'rising'
        beat = 'detfound'
      })
      return
    }
    if (detTested.includes(p.id)) return
    wrongGuesses += 1
    detActive = p.id; detCue = 'ddi.det.watch'; detTone = 'watch'; pumping = true
    testHypothesis({ real: false, holdMs: 1200 }, () => {
      detCue = 'ddi.det.still'; detTone = 'still'
      detTested = [...detTested, p.id]
      detActive = null; pumping = false
    })
  }

  function pickDecision(o: DdiOption, slot: 1 | 2) {
    if (pumping) return
    if (slot === 1) { chosen1 = o; resolved1 = false; beat = 'moving1' }
    else { chosen2 = o; resolved2 = false; beat = 'moving2' }
    if (o.result === 'win') { moveCue = `ddi.move.win.${slot}`; moveTone = slot === 1 ? 'falling' : 'good' }
    else if (o.result === 'over') { moveCue = 'ddi.move.over'; moveTone = 'rising' }
    else { moveCue = 'ddi.move.under'; moveTone = 'falling' }
    drive(o.target, o.result === 'under' ? 6 : 5, () => {
      const resolved = slot === 1 ? resolved1 : resolved2
      if (resolved) return
      if (slot === 1) resolved1 = true
      else resolved2 = true
      if (o.result === 'win') beat = slot === 1 ? 'auftrag2' : 'sort'
      else { outcome = o.result; beat = 'outcome' }
    })
  }

  function runTurbo() {
    if (pumping || turboRun) return
    turboRun = true
    drive(DDI_DRIFT_LOW, 3, () => (turboDone = true)) // 62 → 46, the helper races
  }

  function setSort(id: string, cat: SortCat) {
    if (sortConfirmed) return
    assign = { ...assign, [id]: cat }
  }
  function confirmSort() {
    if (!allAssigned || sortConfirmed) return
    sortGrade = ddiSortGrade(assign)
    sortConfirmed = true
  }

  const SORT_BINS: { cat: SortCat; emoji: string; key: string }[] = [
    { cat: 'bremse', emoji: '🛑', key: 'ddi.sort.bin.bremse' },
    { cat: 'turbo', emoji: '⚡', key: 'ddi.sort.bin.turbo' },
    { cat: 'neutral', emoji: '⚪', key: 'ddi.sort.bin.neutral' },
  ]
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
        ? ['ddi.out.dyk.bremse', 'ddi.out.dyk.turbo']
        : outcome === 'over'
          ? ['ddi.out.dyk.over', 'ddi.out.dyk.bremse']
          : ['ddi.out.dyk.under', 'ddi.out.dyk.turbo']}
    />
  {:else}
    <PlayShell
      color={game.story?.color ?? '#4cc9f0'}
      kicker={t('story.ddi.title')}
      caseLine={t('ddi.case')}
      step={stepNum}
      total={5}
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
                <button class="pl-action" disabled={pumping} onclick={startFill}>{t('common.next')}</button>
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
                  <button class="pl-action" onclick={() => (beat = 'werkstatt')}>{t('common.next')}</button>
                </div>
              {/if}
            </div>

          {:else if beat === 'werkstatt'}
            <div class="scene wide">
              <h2 class="pl-h2">{t('ddi.werk.prompt')}</h2>
              <DdiWerkstatt mode={werkMode} />
              <div class="throttles">
                <button class="thr" class:on={werkMode === 'normal'} onclick={() => tryThrottle('normal')}>⚖️ {t('ddi.werk.normal')}</button>
                <button class="thr brake" class:on={werkMode === 'bremse'} onclick={() => tryThrottle('bremse')}>🛑 {t('ddi.werk.bremse')}</button>
                <button class="thr turbo" class:on={werkMode === 'turbo'} onclick={() => tryThrottle('turbo')}>⚡ {t('ddi.werk.turbo')}</button>
              </div>
              <p class="cap pl-lead">{t(`ddi.werk.cap.${werkMode}`)}</p>
              <div class="actions">
                <button class="pl-action" disabled={!werkDone} onclick={() => (beat = 'auftrag1')}>
                  {werkDone ? t('common.next') : t('ddi.werk.tryboth')}
                </button>
              </div>
            </div>

          {:else if beat === 'auftrag1'}
            <div class="scene wide">
              <span class="pl-emoji">🤒</span>
              <h2 class="pl-h2">{t('ddi.auftrag1.title')}</h2>
              <p class="pl-lead">{t('ddi.auftrag1.body')}</p>
              <div class="planrow">
                <div class="medchip anchor"><b>{t('ddi.card.phenprocoumon')}</b><span>{t('ddi.role.phenprocoumon')}</span></div>
                {#each planOthers as p}
                  <div class="medchip"><b>{t(p.nameKey)}</b><span>{t(p.roleKey)}</span></div>
                {/each}
                <div class="medchip new"><em>{t('ddi.new')}</em><b>{t(newAb.nameKey)}</b><span>{t(newAb.roleKey)}</span></div>
              </div>
              <div class="actions">
                <button class="pl-action" onclick={() => (beat = 'detektiv')}>{t('ddi.auftrag1.next')}</button>
              </div>
            </div>

          {:else if beat === 'detektiv'}
            <div class="task">
              <h2 class="pl-h2 center">{t('ddi.det.prompt')}</h2>
              <div class="detgrid">
                {#each DDI_DETEKTIV_PILLS as p}
                  {@const still = detTested.includes(p.id)}
                  <button
                    class="dettile"
                    class:still={still}
                    class:isnew={p.bremse}
                    disabled={pumping || still || surged}
                    onclick={() => testPill(p)}
                  >
                    {#if p.bremse}<em>{t('ddi.new')}</em>{/if}
                    <b>{t(p.nameKey)}</b>
                    <span>{t(p.roleKey)}</span>
                    <small>
                      {#if detActive === p.id}…
                      {:else if still}{t('ddi.det.tag.still')}{/if}
                    </small>
                  </button>
                {/each}
              </div>
              <WatchBody text={t(detCue)} tone={detTone} />
            </div>

          {:else if beat === 'detfound'}
            <div class="scene">
              <div class="foundcard">
                <span class="ficon">🛑</span>
                <b>{t(newAb.nameKey)}</b>
                <span class="ftag">{t('ddi.det.bremse')}</span>
              </div>
              <p class="pl-lead">{t('ddi.det.foundbody')}</p>
              <div class="actions">
                <button class="pl-action" onclick={() => (beat = 'entscheid1')}>{t('common.next')}</button>
              </div>
            </div>

          {:else if beat === 'entscheid1'}
            <div class="task">
              <h2 class="pl-h2 center">{t('ddi.d1.prompt')}</h2>
              <div class="optcol">
                {#each options1 as o}
                  <button class="pl-opt" disabled={pumping} onclick={() => pickDecision(o, 1)}>{t(o.labelKey)}</button>
                {/each}
              </div>
            </div>

          {:else if beat === 'moving1' || beat === 'moving2'}
            {@const chosen = beat === 'moving1' ? chosen1 : chosen2}
            <div class="scene">
              <WatchBody text={t(moveCue)} tone={moveTone} />
              {#if chosen && chosen.result !== 'win'}<p class="fb pl-bad">{t(chosen.feedbackKey)}</p>{/if}
            </div>

          {:else if beat === 'auftrag2'}
            <div class="scene wide">
              <span class="pl-emoji">😣</span>
              <h2 class="pl-h2">{t('ddi.auftrag2.title')}</h2>
              <p class="pl-lead">{t('ddi.auftrag2.body')}</p>
              <div class="planrow">
                <div class="medchip anchor"><b>{t('ddi.card.phenprocoumon')}</b><span>{t('ddi.role.phenprocoumon')}</span></div>
                <div class="medchip new"><em>{t('ddi.new')}</em><b>{t('ddi.card.carbamazepin')}</b><span>{t('ddi.role.carbamazepin')}</span></div>
              </div>
              <div class="actions">
                <button class="pl-action" onclick={() => (beat = 'turbo')}>{t('ddi.auftrag2.next')}</button>
              </div>
            </div>

          {:else if beat === 'turbo'}
            <div class="scene wide">
              <h2 class="pl-h2">{t('ddi.turbo.prompt')}</h2>
              <DdiWerkstatt mode={turboRun ? 'turbo' : 'normal'} />
              {#if !turboDone}
                {#if turboRun}
                  <WatchBody text={t('ddi.turbo.running')} tone="falling" />
                {:else}
                  <div class="actions">
                    <button class="pl-action" disabled={pumping} onclick={runTurbo}>{t('ddi.turbo.btn')}</button>
                  </div>
                {/if}
              {:else}
                <WatchBody text={t('ddi.turbo.done')} tone="falling" />
                <div class="actions">
                  <button class="pl-action" onclick={() => (beat = 'entscheid2')}>{t('common.next')}</button>
                </div>
              {/if}
            </div>

          {:else if beat === 'entscheid2'}
            <div class="task">
              <h2 class="pl-h2 center">{t('ddi.d2.prompt')}</h2>
              <div class="optcol">
                {#each options2 as o}
                  <button class="pl-opt" disabled={pumping} onclick={() => pickDecision(o, 2)}>{t(o.labelKey)}</button>
                {/each}
              </div>
            </div>

          {:else if beat === 'sort'}
            <div class="task">
              <h2 class="pl-h2 center">{t('ddi.sort.prompt')}</h2>
              <div class="sortlist">
                {#each DDI_SORT as item}
                  {@const right = sortConfirmed && assign[item.id] === item.cat}
                  {@const wrong = sortConfirmed && assign[item.id] !== item.cat}
                  <div class="sortrow" class:right={right} class:wrong={wrong}>
                    <span class="sname">{t(item.labelKey)}{#if sortConfirmed}<i class="mk">{right ? '✓' : '✗'}</i>{/if}</span>
                    <div class="sortbtns">
                      {#each SORT_BINS as bin}
                        <button
                          class="sortbtn"
                          class:sel={assign[item.id] === bin.cat}
                          disabled={sortConfirmed}
                          onclick={() => setSort(item.id, bin.cat)}
                        >{bin.emoji} {t(bin.key)}</button>
                      {/each}
                    </div>
                  </div>
                {/each}
              </div>
              {#if !sortConfirmed}
                <div class="actions">
                  <button class="pl-action" disabled={!allAssigned} onclick={confirmSort}>{t('ddi.sort.confirm')}</button>
                </div>
              {:else}
                <p class="fb center {sortGrade >= 1 ? 'pl-good' : sortGrade > 0 ? 'pl-warn' : 'pl-bad'}">
                  {sortGrade >= 1 ? t('ddi.sort.allright') : sortGrade > 0 ? t('ddi.sort.close') : t('ddi.sort.poor')}
                </p>
                <div class="actions">
                  <button class="pl-action" onclick={() => (beat = 'outcome')}>{t('common.next')}</button>
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

  .scene { display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); max-width: 860px; text-align: center; }
  .scene.wide { max-width: 980px; width: 100%; }
  .task { display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); width: 100%; }
  .center { text-align: center; }
  .actions { display: flex; gap: var(--sp-2); justify-content: center; flex-wrap: wrap; }

  .reveal { font-size: var(--fs-display); font-weight: 900; line-height: 1.05; text-shadow: 0 0 26px color-mix(in srgb, var(--green) 35%, transparent); }
  .fb { font-size: var(--fs-h2); font-weight: 800; line-height: 1.3; max-width: 900px; text-align: center; }
  .cap { max-width: 760px; min-height: 3.2em; }

  /* dose-fill fact card */
  .factcard { max-width: 680px; text-align: center; animation: factin 0.4s ease both; }
  .factcard .factkick { display: inline-block; font-size: var(--fs-micro); font-weight: 900; letter-spacing: 1px; text-transform: uppercase; color: var(--spm-cyan-bright); margin-bottom: var(--sp-1); }
  .factcard p { font-size: var(--fs-lead); line-height: 1.45; }

  /* throttle buttons (Werkstatt) */
  .throttles { display: flex; gap: var(--sp-2); flex-wrap: wrap; justify-content: center; }
  .thr {
    padding: 12px 20px; border: 1.5px solid var(--border); border-radius: var(--r-card);
    background: var(--surface); color: var(--text); font-size: 16px; font-weight: 800;
    transition: transform 0.1s ease, border-color 0.2s ease, background 0.2s ease;
  }
  .thr:active { transform: scale(0.96); }
  .thr.on { border-color: var(--spm-cyan); background: rgba(0, 190, 202, 0.14); }
  .thr.brake.on { border-color: var(--toxic); background: color-mix(in srgb, var(--toxic) 16%, var(--surface)); }
  .thr.turbo.on { border-color: var(--grape); background: color-mix(in srgb, var(--grape) 16%, var(--surface)); }

  /* plan chips (auftrag) + glowing new card */
  .planrow { display: flex; flex-wrap: wrap; gap: 10px; width: 100%; justify-content: center; }
  .medchip {
    display: flex; flex-direction: column; gap: 2px; padding: 12px 16px;
    border: 1.5px solid var(--border); border-radius: var(--r-card); background: var(--surface); text-align: start; color: var(--text);
  }
  .medchip b { font-size: 17px; font-weight: 800; }
  .medchip span { font-size: 13px; color: var(--dim); }
  .medchip.anchor { border-color: color-mix(in srgb, var(--spm-cyan) 50%, var(--border)); }
  .medchip.new { border-color: var(--spm-cyan); background: rgba(0, 190, 202, 0.12); animation: glow 1.6s ease-in-out infinite; }
  .medchip.new em { font-style: normal; font-size: 11px; font-weight: 900; letter-spacing: 1px; color: var(--spm-cyan-bright); }

  /* detektiv grid */
  .detgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; width: 100%; max-width: 1000px; }
  .dettile {
    position: relative; text-align: start; display: flex; flex-direction: column; gap: 3px; min-height: 104px;
    padding: 14px 16px; border: 1.5px solid var(--border); border-radius: var(--r-card); background: var(--surface); color: var(--text);
    transition: transform 0.1s ease, border-color 0.2s ease, background 0.2s ease, opacity 0.2s ease;
  }
  .dettile:active:not(:disabled) { transform: scale(0.97); border-color: var(--spm-cyan); }
  .dettile.isnew { border-color: var(--spm-cyan); }
  .dettile em { font-style: normal; font-size: 11px; font-weight: 900; letter-spacing: 1px; color: var(--spm-cyan-bright); }
  .dettile b { font-size: 17px; font-weight: 800; }
  .dettile span { font-size: 13px; color: var(--dim); }
  .dettile small { margin-top: auto; font-size: 13px; font-weight: 800; color: var(--dim); }
  .dettile.still { opacity: 0.5; }
  .dettile.still small { color: var(--green); }
  .dettile:disabled { cursor: default; }

  /* found card */
  .foundcard {
    display: flex; flex-direction: column; align-items: center; gap: var(--sp-1);
    padding: var(--sp-3) var(--sp-6); border: 2px solid color-mix(in srgb, var(--toxic) 60%, transparent);
    border-radius: var(--r-card); background: color-mix(in srgb, var(--toxic) 12%, var(--surface));
  }
  .foundcard .ficon { font-size: 56px; }
  .foundcard b { font-size: var(--fs-h2); font-weight: 900; }
  .foundcard .ftag { font-size: var(--fs-small); font-weight: 800; color: var(--toxic); text-transform: uppercase; letter-spacing: 0.5px; }

  .optcol { display: flex; flex-direction: column; gap: var(--sp-2); width: 100%; max-width: 760px; }

  /* the sort */
  .sortlist { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 940px; }
  .sortrow { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 14px; border: 1.5px solid var(--border); border-radius: 12px; background: var(--surface); }
  .sortrow.right { border-color: var(--green); }
  .sortrow.wrong { border-color: var(--toxic); }
  .sname { font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
  .sname .mk { font-style: normal; font-weight: 900; }
  .sortrow.right .mk { color: var(--green); }
  .sortrow.wrong .mk { color: var(--toxic); }
  .sortbtns { display: flex; gap: 6px; flex: none; }
  .sortbtn { border: 1.5px solid var(--border); background: var(--surface2); border-radius: 10px; padding: 9px 12px; font-size: 13px; font-weight: 700; white-space: nowrap; color: var(--text); }
  .sortbtn.sel { border-color: var(--spm-cyan); background: rgba(0, 190, 202, 0.18); color: var(--spm-cyan-bright); }
  .sortbtn:disabled { cursor: default; }

  @keyframes beatin { from { opacity: 0; transform: translateY(18px); } }
  @keyframes factin { from { opacity: 0; transform: translateY(8px); } }
  @keyframes glow { 50% { box-shadow: 0 0 22px rgba(0, 190, 202, 0.4); } }
  @media (prefers-reduced-motion: reduce) { .beat, .factcard, .medchip.new { animation: none; } }
</style>
