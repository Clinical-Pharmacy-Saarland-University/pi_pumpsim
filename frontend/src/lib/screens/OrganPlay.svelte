<script lang="ts">
  // Self-contained v2 story „Der müde Filter" (Organ/DOI · eGFR↓ × Metformin).
  // Blueprint screen on <PlayShell/> + the .pl-* kit. Signature mechanic: CALIBRATE-A-LIVE-
  // INFLOW vs an invisible weakened drain — the kidney clears Metformin (the drain); a weak
  // kidney clears less → the SAME dose accumulates → der Spiegel rises live over the window;
  // the player taps „reduzieren" mid-rise to redirect the pump back into green. The cold-start
  // twist: one unchanged dose runs 42→62 (normal) then keeps creeping 62→78 (over). No on-screen
  // vessel/gauge — the physical pump is the readout. Over-loss resolves on settle (no auto-trip
  // on the play2 path; settle-only per spec §4/§12).
  import { onMount } from 'svelte'
  import { t } from '../locale.svelte'
  import { game, driveTo, backToStories } from '../game.svelte'
  import PlayShell from '../PlayShell.svelte'
  import WatchBody from '../WatchBody.svelte'
  import EndScreen from '../EndScreen.svelte'
  import {
    ORGAN_BASE, ORGAN_DOSE, ORGAN_DRIFT, ORGAN_CONFIRM, ORGAN_LIVE_START, ORGAN_TRAP_WARN,
    ORGAN_FACTS, ORGAN_DETECT, ORGAN_TAPS, ORGAN_PLAN, organClever, organPro,
    type OrganDetectItem, type OrganTap, type OrganPlanCard,
  } from '../stories/organ'
  import { stars, type Outcome } from '../flow'

  type Beat =
    | 'briefing' | 'dose' | 'dosing' | 'question'
    | 'detective' | 'detmoving' | 'detfound' | 'mechanism'
    | 'live' | 'livemoving' | 'won' | 'plan' | 'outcome'
  let beat = $state<Beat>('briefing')
  let outcome = $state<Outcome>('win')
  let pumping = $state(false) // a resolution move is running → action buttons blocked

  // dose-fill rotation + cold-start creep
  let factIdx = $state(0)
  let fillDone = $state(false)
  let factShownAt = 0
  let creep = $state(false)
  const FACT_MS = 4500
  const FACT_MIN_MS = 3800

  // detective
  let wrongGuesses = $state(0)
  let detectFb = $state<string | null>(null)

  // live cut
  let liveRising = $state(false) // the untouched auto-rise (buttons stay enabled to catch it)
  let liveChosen = $state<OrganTap | null>(null)
  let resolved = $state(false)
  let baited = $state(false)
  let baitFb = $state(false)
  let moveCue = $state('organ.live.reduce')
  let moveTone = $state<'rising' | 'falling'>('falling')

  // finale plan
  let planDone = $state<Set<string>>(new Set())
  let planTrapTapped = $state(false)
  let trapActive = $state(false)
  let planFb = $state<string | null>(null)

  let taps = $derived(ORGAN_TAPS.filter((t) => game.ageGroup === 'adult' || !t.adultOnly))
  let safeCount = $derived(ORGAN_PLAN.filter((c) => !c.trap && planDone.has(c.id)).length)
  let planComplete = $derived(safeCount === 2 && !trapActive)
  let clever = $derived(organClever(wrongGuesses))
  let timelyReduce = $derived(outcome === 'win' && !baited)
  let pro = $derived(organPro(timelyReduce, !planTrapTapped))
  let starCount = $derived(stars(outcome === 'win', clever, pro))
  let stepNum = $derived(
    ['briefing', 'dose', 'dosing'].includes(beat) ? 1
    : beat === 'question' ? 2
    : ['detective', 'detmoving', 'detfound'].includes(beat) ? 3
    : beat === 'mechanism' ? 4
    : ['live', 'livemoving', 'won'].includes(beat) ? 5
    : 6,
  )

  onMount(() => drive(ORGAN_BASE, 8)) // hold at ≈42 — empty starting body, no medicine yet

  function drive(target: number, rate: number, then: () => void = () => {}) {
    pumping = true
    driveTo(target, rate, () => { pumping = false; then() })
  }

  // rotate the dose-fill facts while the cold-start hub pumps (42→62→78)
  $effect(() => {
    if (beat !== 'dosing') return
    factIdx = 0
    factShownAt = performance.now()
    const id = setInterval(() => {
      if (fillDone) return
      factIdx = (factIdx + 1) % ORGAN_FACTS.length
      factShownAt = performance.now()
    }, FACT_MS)
    return () => clearInterval(id)
  })
  $effect(() => {
    if (beat !== 'dosing' || !fillDone) return
    const wait = Math.max(700, FACT_MIN_MS - (performance.now() - factShownAt))
    const id = setTimeout(() => (beat = 'question'), wait)
    return () => clearTimeout(id)
  })

  function giveDose() {
    if (pumping) return
    fillDone = false; creep = false
    beat = 'dosing'
    // ONE uninterrupted rise: 42→62 (normal) then, unchanged, 62→78 (over the window)
    drive(ORGAN_DOSE, 5, () => { creep = true; drive(ORGAN_DRIFT, 3, () => (fillDone = true)) })
  }

  function pickDetect(d: OrganDetectItem) {
    if (pumping) return
    if (d.correct) {
      detectFb = null
      beat = 'detmoving'
      drive(ORGAN_CONFIRM, 2, () => (beat = 'detfound')) // staut UP a last step, clings to the edge
    } else {
      wrongGuesses += 1
      detectFb = d.feedbackKey // DEAD STILL — no pump move
    }
  }

  function mechNext() {
    if (pumping) return
    drive(ORGAN_LIVE_START, 4, () => { beat = 'live'; startRise() }) // engage the tap at 76
  }
  function startRise() {
    liveRising = true
    driveTo(ORGAN_DRIFT, 3, () => (liveRising = false)) // 76→78 untouched cap; buttons stay enabled to catch it
  }
  function pickTap(tap: OrganTap) {
    if (pumping) return
    liveRising = false
    liveChosen = tap; resolved = false
    beat = 'livemoving'
    if (tap.result === 'win') { moveCue = 'organ.live.reduce'; moveTone = 'falling' }
    else if (tap.result === 'over') { moveCue = 'organ.live.over'; moveTone = 'rising' }
    else { moveCue = 'organ.live.under'; moveTone = 'falling' }
    drive(tap.target, 4, () => {
      if (resolved) return
      resolved = true
      if (tap.result === 'win') beat = 'won'
      else { outcome = tap.result; beat = 'outcome' } // settle-only over/under (no engine auto-trip on play2)
    })
  }
  function tapBait() {
    if (pumping) return
    baited = true
    baitFb = true // no pump move — the still rising/edge water is the answer „hilft nicht"
  }

  function pickPlan(card: OrganPlanCard) {
    if (pumping) return
    if (card.trap) {
      planTrapTapped = true; trapActive = true; planFb = 'organ.plan.trapWarn'
      drive(ORGAN_TRAP_WARN, 3) // 62→72 warning creep over green
    } else {
      const s = new Set(planDone); s.add(card.id); planDone = s; planFb = 'organ.plan.safe'
    }
  }
  function takeback() {
    if (pumping) return
    drive(ORGAN_DOSE, 3, () => (trapActive = false)) // 72→62 back into green
  }
</script>

<div class="root">
  {#if beat === 'outcome'}
    <EndScreen
      {outcome}
      titleKey={`organ.out.${outcome}.title`}
      subKey={`organ.out.${outcome}.sub`}
      storyTitleKey="story.organ.title"
      score={starCount}
      factKeys={outcome === 'win'
        ? ['organ.out.dyk1', 'organ.out.dyk2']
        : outcome === 'over'
          ? ['organ.out.dyk.over', 'organ.out.dyk1']
          : ['organ.out.dyk.under', 'organ.out.dyk1']}
    />
  {:else}
    <PlayShell
      color={game.story?.color ?? '#ff6b7a'}
      kicker={t('story.organ.title')}
      caseLine={t('organ.case')}
      step={stepNum}
      total={6}
      onCancel={backToStories}
    >
      {#key beat}
        <div class="beat">
          {#if beat === 'briefing'}
            <div class="scene">
              <span class="pl-emoji">🧑‍⚕️</span>
              <h1 class="pl-h1">{t('organ.brief.patient')}</h1>
              <p class="pl-lead">{t('organ.brief.goal')}</p>
              <div class="actions">
                <button class="pl-action" disabled={pumping} onclick={() => (beat = 'dose')}>{t('organ.brief.go')}</button>
              </div>
            </div>

          {:else if beat === 'dose'}
            <div class="scene">
              <span class="pl-emoji">💊</span>
              <h2 class="pl-h2">{t('organ.dose.prompt')}</h2>
              <div class="actions">
                <button class="pl-action" disabled={pumping} onclick={giveDose}>{t('organ.dose.btn')}</button>
              </div>
            </div>

          {:else if beat === 'dosing'}
            <div class="scene wide">
              <WatchBody text={t(creep ? 'organ.cue.creep' : 'organ.cue.fill')} tone={creep ? 'rising' : 'good'} />
              {#key factIdx}
                <div class="factcard pl-card">
                  <span class="factkick">{t('organ.fact.kicker')}</span>
                  <p>{t(ORGAN_FACTS[factIdx])}</p>
                </div>
              {/key}
            </div>

          {:else if beat === 'question'}
            <div class="scene">
              <h2 class="pl-h2">{t('organ.q.prompt')}</h2>
              <WatchBody text={t('organ.q.watch')} tone="watch" />
              <div class="actions">
                <button class="pl-action" onclick={() => (beat = 'detective')}>{t('organ.q.btn')}</button>
              </div>
            </div>

          {:else if beat === 'detective'}
            <div class="task">
              <h2 class="pl-h2 center">{t('organ.det.prompt')}</h2>
              <div class="optcol">
                {#each ORGAN_DETECT as d}
                  <button class="pl-opt" disabled={pumping} onclick={() => pickDetect(d)}>{t(d.labelKey)}</button>
                {/each}
              </div>
              <WatchBody text={t(detectFb ?? 'organ.det.watch')} tone={detectFb ? 'still' : 'watch'} />
            </div>

          {:else if beat === 'detmoving'}
            <div class="scene"><WatchBody text={t('organ.det.confirm')} tone="rising" /></div>

          {:else if beat === 'detfound'}
            <div class="scene">
              <div class="causecard"><span class="cicon">🫘</span><b>{game.ageGroup === 'adult' ? t('organ.det.causeAdult') : t('organ.det.causeYoung')}</b></div>
              <div class="reveal pl-good small">{t('organ.det.found')}</div>
              <p class="pl-lead">{t('organ.det.foundPeek')}</p>
              <div class="actions">
                <button class="pl-action" onclick={() => (beat = 'mechanism')}>{t('common.next')}</button>
              </div>
            </div>

          {:else if beat === 'mechanism'}
            <div class="scene wide">
              <span class="pl-emoji">💡</span>
              <p class="pl-lead">{t('organ.mech')}</p>
              <WatchBody text={t('organ.mech.watch')} tone="still" />
              <div class="actions">
                <button class="pl-action" disabled={pumping} onclick={mechNext}>{t('organ.mech.btn')}</button>
              </div>
            </div>

          {:else if beat === 'live'}
            <div class="task">
              <h2 class="pl-h2 center">{t('organ.live.prompt')}</h2>
              <WatchBody text={t('organ.live.watch')} tone="rising" />
              <div class="optcol">
                {#each taps as tap}
                  <button class="pl-opt" disabled={pumping} onclick={() => pickTap(tap)}>{t(tap.labelKey)}</button>
                {/each}
                <button class="pl-opt ghost" disabled={pumping} onclick={tapBait}>{t('organ.tap.bait')}</button>
              </div>
              {#if baitFb}<p class="fb pl-warn">{t('organ.tfb.bait')}</p>{/if}
            </div>

          {:else if beat === 'livemoving'}
            <div class="scene">
              <WatchBody text={t(moveCue)} tone={moveTone} />
              {#if liveChosen && liveChosen.result !== 'win'}<p class="fb pl-bad">{t(liveChosen.feedbackKey)}</p>{/if}
            </div>

          {:else if beat === 'won'}
            <div class="scene">
              <h2 class="pl-h2 pl-good">{t('organ.won.title')}</h2>
              <p class="pl-lead">{t('organ.won.body')}</p>
              <p class="pl-body">{t('organ.won.peek')}</p>
              <div class="actions">
                <button class="pl-action" onclick={() => (beat = 'plan')}>{t('common.next')}</button>
              </div>
            </div>

          {:else if beat === 'plan'}
            <div class="task">
              <h2 class="pl-h2 center">{t('organ.plan.prompt')}</h2>
              <div class="optcol">
                {#each ORGAN_PLAN as card}
                  <button class="pl-opt" class:done={!card.trap && planDone.has(card.id)} disabled={pumping || (!card.trap && planDone.has(card.id))} onclick={() => pickPlan(card)}>{t(card.labelKey)}</button>
                {/each}
              </div>
              {#if trapActive}
                <WatchBody text={t('organ.plan.trapWarn')} tone="rising" />
                <div class="actions">
                  <button class="pl-action" disabled={pumping} onclick={takeback}>{t('organ.plan.takeback')}</button>
                </div>
              {:else}
                {#if planFb}<p class="fb pl-good">{t(planFb)}</p>{/if}
                {#if planComplete}
                  <div class="actions">
                    <button class="pl-action" onclick={() => (beat = 'outcome')}>{t('organ.plan.done')}</button>
                  </div>
                {/if}
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
  .beat { height: 100%; display: grid; align-content: center; justify-items: center; gap: var(--sp-4); animation: beatin 0.4s cubic-bezier(0.2, 0.9, 0.3, 1) both; }
  .scene { display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); max-width: 880px; text-align: center; }
  .scene.wide { max-width: 980px; width: 100%; }
  .task { display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); width: 100%; }
  .center { text-align: center; }
  .actions { display: flex; gap: var(--sp-2); justify-content: center; flex-wrap: wrap; }
  .fb { font-size: var(--fs-h2); font-weight: 800; line-height: 1.3; max-width: 900px; text-align: center; }

  .factcard { max-width: 680px; text-align: center; animation: factin 0.4s ease both; }
  .factcard .factkick { display: inline-block; font-size: var(--fs-micro); font-weight: 900; letter-spacing: 1px; text-transform: uppercase; color: var(--spm-cyan-bright); margin-bottom: var(--sp-1); }
  .factcard p { font-size: var(--fs-lead); line-height: 1.45; }

  .optcol { display: flex; flex-direction: column; gap: var(--sp-2); width: 100%; max-width: 720px; }
  .pl-opt.ghost { opacity: 0.75; border-style: dashed; }
  .pl-opt.done { border-color: var(--green); background: color-mix(in srgb, var(--green) 12%, var(--surface)); }

  .reveal { font-size: var(--fs-h1); font-weight: 900; line-height: 1.05; text-shadow: 0 0 26px color-mix(in srgb, var(--green) 35%, transparent); }
  .causecard { display: flex; flex-direction: column; align-items: center; gap: var(--sp-1); padding: var(--sp-3) var(--sp-6); border: 2px solid color-mix(in srgb, var(--story) 60%, transparent); border-radius: var(--r-card); background: color-mix(in srgb, var(--story) 14%, var(--surface)); box-shadow: 0 0 30px color-mix(in srgb, var(--story) 22%, transparent); }
  .causecard .cicon { font-size: 60px; }
  .causecard b { font-size: var(--fs-h2); font-weight: 800; }

  @keyframes beatin { from { opacity: 0; transform: translateY(18px); } }
  @keyframes factin { from { opacity: 0; transform: translateY(8px); } }
  @media (prefers-reduced-motion: reduce) { .beat, .factcard { animation: none; } }
</style>
