<script lang="ts">
  // Self-contained v2 story „Die Frühstücks-Falle" (FDI · Grapefruit × Simvastatin).
  // Blueprint screen: built on the shared <PlayShell/> (per-story background + case
  // header + progress) and the global .pl-* element kit, so it sets the base style
  // for every story. Signature mechanic: LIFT-TO-TEST — remove breakfast items one at
  // a time and read „den Spiegel" (the drug's blood level, embodied by the physical
  // pump); a wrong item leaves the pump DEAD STILL (innocent), only removing the
  // grapefruit makes the Spiegel fall back into the green band. No on-screen torso.
  import { onMount } from 'svelte'
  import { t } from '../locale.svelte'
  import { game, driveTo, backToStories } from '../game.svelte'
  import PlayShell from '../PlayShell.svelte'
  import WatchBody from '../WatchBody.svelte'
  import EndScreen from '../EndScreen.svelte'
  import {
    FR_TRAY, FR_OPTIONS, FR_FRUITS, FR_FACTS, frAssayGrade, FR_LOWER_WOBBLE,
    FR_BASELINE, FR_DOSE, FR_DRIFT, FR_DEMO_HIGH, FR_ASSAY,
    type FrOption, type FrTrayItem, type FrFruit,
  } from '../stories/fruehstueck'
  import { stars, type Outcome } from '../flow'

  type Beat = 'briefing' | 'dose' | 'dosing' | 'doseReveal' | 'breakfast' | 'drifting'
    | 'detective' | 'detmoving' | 'detfound' | 'mechanism' | 'strategy' | 'moving' | 'won' | 'assay' | 'outcome'
  let beat = $state<Beat>('briefing')
  let outcome = $state<Outcome>('win')
  let pumping = $state(false) // true while the pump moves → action buttons are blocked

  // detective
  let removed = $state<string[]>([])
  let wrongLifts = $state(0)
  let detectFb = $state<string | null>(null)

  // mechanism demo
  let mechStacked = $state(false)

  // strategy + move
  let chosen = $state<FrOption | null>(null)
  let resolved = $state(false)
  let stratStill = $state<string | null>(null)
  let moveCue = $state('fr.move.win')
  let moveTone = $state<'rising' | 'falling' | 'good'>('good')

  // assay
  let selected = $state(new Set<string>())
  let assayConfirmed = $state(false)
  let assayGrade = $state(0)

  // dose-fill „Wusstest du?" rotation
  let factIdx = $state(0)
  let fillDone = $state(false) // pump settled at the dose target → hold the last fact, then reveal
  let factShownAt = 0 // performance.now() when the current fact appeared
  const FACT_MS = 4500 // fact rotation interval
  const FACT_MIN_MS = 3800 // a fact stays readable at least this long (so the last isn't cut)

  let options = $derived(FR_OPTIONS.filter((o) => game.ageGroup === 'adult' || !o.adultOnly))
  let clever = $derived(wrongLifts === 0 ? 1 : wrongLifts === 1 ? 0.5 : 0)
  let starCount = $derived(stars(outcome === 'win', clever, assayGrade))
  let stepNum = $derived(
    ['briefing', 'dose', 'dosing', 'doseReveal'].includes(beat) ? 1
    : ['breakfast', 'drifting'].includes(beat) ? 2
    : ['detective', 'detmoving', 'detfound'].includes(beat) ? 3
    : beat === 'mechanism' ? 4
    : ['strategy', 'moving', 'won'].includes(beat) ? 5
    : 6,
  )

  onMount(() => drive(FR_BASELINE, 8)) // sit below the band, ungeschützt

  // pump wrapper: blocks buttons while the water moves, frees them on settle
  function drive(target: number, rate: number, then: () => void = () => {}) {
    pumping = true
    driveTo(target, rate, () => { pumping = false; then() })
  }

  // rotate the dose-fill facts while the (slow) dose pumps in; freeze on the current
  // fact once the fill completes so it can't be cut off mid-read
  $effect(() => {
    if (beat !== 'dosing') return
    factIdx = 0
    factShownAt = performance.now()
    const id = setInterval(() => {
      if (fillDone) return // hold the current fact once filled
      factIdx = (factIdx + 1) % FR_FACTS.length
      factShownAt = performance.now()
    }, FACT_MS)
    return () => clearInterval(id)
  })

  // once filled, keep the last fact up for a minimum readable time, then reveal
  $effect(() => {
    if (beat !== 'dosing' || !fillDone) return
    const wait = Math.max(700, FACT_MIN_MS - (performance.now() - factShownAt))
    const id = setTimeout(() => (beat = 'doseReveal'), wait)
    return () => clearTimeout(id)
  })

  // manual auto-trip: „Dosis erhöhen" drives the Spiegel over the red high tape mid-travel
  $effect(() => {
    if (beat !== 'moving' || chosen?.result !== 'over' || resolved) return
    const lv = game.level?.level
    if (lv !== undefined && lv >= 80) { resolved = true; outcome = 'over'; beat = 'outcome' }
  })

  function giveDose() {
    if (pumping) return
    fillDone = false
    beat = 'dosing'
    drive(FR_DOSE, 5, () => (fillDone = true)) // 20 -> 62; on settle hold the last fact, then reveal
  }
  function startDrift() {
    beat = 'drifting'
    drive(FR_DRIFT, 4, () => (beat = 'detective')) // 62 -> 76 creeps toward the red tape
  }

  function liftItem(item: FrTrayItem) {
    if (pumping || removed.includes(item.id) || beat !== 'detective') return
    removed = [...removed, item.id]
    if (item.culprit) {
      detectFb = null
      beat = 'detmoving'
      drive(FR_DOSE, 4, () => (beat = 'detfound')) // 76 -> 62 the Spiegel falls back
    } else {
      wrongLifts += 1
      detectFb = 'fr.detective.still' // STILL: no pump move → stillness is the answer
    }
  }

  function stackUp() {
    if (pumping) return
    mechStacked = true
    drive(FR_DEMO_HIGH, 4) // grapefruit back → 62 -> 72
  }
  function mechNext() {
    if (pumping) return
    // leave the Spiegel HIGH (grapefruit is in his daily breakfast) so the strategy
    // matches the torso („zu hoch") and the win is a real, watchable fall 78 -> 62
    beat = 'strategy'
  }

  function driveChain(targets: number[], done: () => void) {
    let i = 0
    const step = () => {
      if (i >= targets.length) { done(); return }
      drive(targets[i++], 4, step)
    }
    step()
  }

  function pick(o: FrOption) {
    if (pumping) return
    if (o.result === 'retry') { stratStill = o.feedbackKey; return } // STILL, stay in strategy
    chosen = o
    resolved = false
    stratStill = null
    beat = 'moving'
    if (o.result === 'win') { moveCue = 'fr.move.win'; moveTone = 'good' }
    else if (o.result === 'over') { moveCue = 'fr.move.over'; moveTone = 'rising' }
    else { moveCue = 'fr.move.under'; moveTone = 'falling' }

    if (o.result === 'win') {
      drive(o.target!, 4, () => { if (!resolved) { resolved = true; beat = 'won' } })
    } else if (o.result === 'over') {
      drive(o.target!, 4, () => { if (!resolved) { resolved = true; outcome = 'over'; beat = 'outcome' } })
    } else {
      driveChain(FR_LOWER_WOBBLE, () => { if (!resolved) { resolved = true; outcome = 'under'; beat = 'outcome' } })
    }
  }

  function toggleFruit(id: string) {
    if (pumping || assayConfirmed) return
    const s = new Set(selected)
    s.has(id) ? s.delete(id) : s.add(id)
    selected = s
  }
  function proveAssay() {
    if (pumping || assayConfirmed || selected.size === 0) return
    drive(FR_ASSAY, 4, () => { assayGrade = frAssayGrade(selected); assayConfirmed = true })
  }
  const fruitRight = (f: FrFruit) => f.inhibits === selected.has(f.id)
</script>

<div class="root">
  {#if beat === 'outcome'}
    <EndScreen
      {outcome}
      titleKey={`fr.out.${outcome}.title`}
      subKey={`fr.out.${outcome}.sub`}
      storyTitleKey="story.grapefruit.title"
      score={starCount}
      factKeys={outcome === 'win'
        ? ['fr.out.dyk1', 'fr.out.dyk2']
        : outcome === 'over'
          ? ['fr.out.dyk.over', 'fr.out.dyk1']
          : ['fr.out.dyk.under', 'fr.out.dyk1']}
    />
  {:else}
    <PlayShell
      color={game.story?.color ?? 'var(--grape)'}
      kicker={t('story.grapefruit.title')}
      caseLine={t('fr.case')}
      step={stepNum}
      total={6}
      onCancel={backToStories}
    >
      {#key beat}
        <div class="beat">
          {#if beat === 'briefing'}
            <div class="scene">
              <span class="pl-emoji">🧑‍⚕️</span>
              <h1 class="pl-h1">{t('fr.brief.patient')}</h1>
              <p class="pl-lead">{t('fr.brief.goal')}</p>
              <div class="actions">
                <button class="pl-action" onclick={() => (beat = 'dose')}>{t('common.next')}</button>
              </div>
            </div>

          {:else if beat === 'dose'}
            <div class="scene">
              <span class="pl-emoji">💊</span>
              <h2 class="pl-h2">{t('fr.dose.prompt')}</h2>
              <div class="actions">
                <button class="pl-action" disabled={pumping} onclick={giveDose}>{t('fr.dose.btn')}</button>
              </div>
            </div>

          {:else if beat === 'dosing'}
            <div class="scene wide">
              <WatchBody text={t(fillDone ? 'fr.cue.filled' : 'fr.cue.fill')} tone="good" />
              {#key factIdx}
                <div class="factcard pl-card">
                  <span class="factkick">{t('fr.fact.kicker')}</span>
                  <p>{t(FR_FACTS[factIdx])}</p>
                </div>
              {/key}
            </div>

          {:else if beat === 'doseReveal'}
            <div class="scene">
              <div class="reveal pl-good">{t('fr.dose.reveal')}</div>
              <div class="actions">
                <button class="pl-action" onclick={() => (beat = 'breakfast')}>{t('common.next')}</button>
              </div>
            </div>

          {:else if beat === 'breakfast'}
            <div class="scene wide">
              <p class="pl-lead">{t('fr.breakfast.story')}</p>
              <div class="spreadwrap">
                <span class="spreadlabel">{t('fr.morning.label')}</span>
                <div class="spread">
                  {#each FR_TRAY as item}
                    <div class="spreaditem"><span>{item.icon}</span><b>{t(item.labelKey)}</b></div>
                  {/each}
                </div>
              </div>
              <div class="actions">
                <button class="pl-action" onclick={startDrift}>{t('common.next')}</button>
              </div>
            </div>

          {:else if beat === 'drifting'}
            <div class="scene wide">
              <div class="spreadwrap dim">
                <span class="spreadlabel">{t('fr.morning.drift')}</span>
                <div class="spread">
                  {#each FR_TRAY as item}
                    <div class="spreaditem"><span>{item.icon}</span><b>{t(item.labelKey)}</b></div>
                  {/each}
                </div>
              </div>
              <WatchBody text={t('fr.drift.cue')} tone="rising" />
            </div>

          {:else if beat === 'detective'}
            <div class="task">
              <h2 class="pl-h2 center">{t('fr.detective.prompt')}</h2>
              <div class="tray">
                {#each FR_TRAY as item}
                  <button class="trayitem" class:gone={removed.includes(item.id)} disabled={pumping || removed.includes(item.id)} onclick={() => liftItem(item)}>
                    <span class="ticon">{item.icon}</span>
                    <b>{t(item.labelKey)}</b>
                    <small>{removed.includes(item.id) ? t('fr.item.removed') : t('fr.item.tap')}</small>
                  </button>
                {/each}
              </div>
              <WatchBody text={t(detectFb ?? 'fr.detective.watch')} tone={detectFb ? 'still' : 'watch'} />
            </div>

          {:else if beat === 'detmoving'}
            <div class="scene"><WatchBody text={t('fr.detective.found')} tone="falling" /></div>

          {:else if beat === 'detfound'}
            <div class="scene">
              <div class="culpritcard">
                <span class="cicon">🥤</span>
                <b>{t('fr.item.grapefruit')}</b>
              </div>
              <div class="reveal pl-good small">{t('fr.detective.found')}</div>
              <p class="pl-lead">{t('fr.detective.foundPeek')}</p>
              <div class="actions">
                <button class="pl-action" onclick={() => (beat = 'mechanism')}>{t('common.next')}</button>
              </div>
            </div>

          {:else if beat === 'mechanism'}
            <div class="scene wide">
              <h2 class="pl-h2">{t('fr.mech.prompt')}</h2>
              {#if !mechStacked}
                <div class="actions">
                  <button class="pl-action" disabled={pumping} onclick={stackUp}>{t('fr.mech.btn')}</button>
                </div>
              {:else}
                <WatchBody text={t('fr.mech.stack')} tone="rising" />
                <div class="actions">
                  <button class="pl-action" disabled={pumping} onclick={mechNext}>{t('fr.mech.next')}</button>
                </div>
              {/if}
            </div>

          {:else if beat === 'strategy'}
            <div class="task">
              <h2 class="pl-h2 center">{t('fr.strat.prompt')}</h2>
              <div class="optcol">
                {#each options as o}
                  <button class="pl-opt" disabled={pumping} onclick={() => pick(o)}>{t(o.labelKey)}</button>
                {/each}
              </div>
              {#if stratStill}<WatchBody text={t(stratStill)} tone="still" />{/if}
            </div>

          {:else if beat === 'moving'}
            <div class="scene">
              <WatchBody text={t(moveCue)} tone={moveTone} />
              {#if chosen && chosen.result !== 'win'}<p class="fb pl-bad">{t(chosen.feedbackKey)}</p>{/if}
            </div>

          {:else if beat === 'won'}
            <div class="scene">
              <h2 class="pl-h2 pl-good">{t('fr.won.title')}</h2>
              <p class="pl-lead">{t('fr.fb.drop')}</p>
              <p class="pl-body">{t('fr.won.peek')}</p>
              <div class="actions">
                <button class="pl-action" onclick={() => (beat = 'assay')}>{t('common.next')}</button>
              </div>
            </div>

          {:else if beat === 'assay'}
            <div class="task">
              {#if !assayConfirmed}
                <h2 class="pl-h2 center">{t('fr.assay.prompt')}</h2>
              {:else}
                <div class="fb center {assayGrade >= 1 ? 'pl-good' : assayGrade > 0 ? 'pl-warn' : 'pl-bad'}">
                  {assayGrade >= 1 ? t('fr.assay.correct') : assayGrade > 0 ? t('fr.assay.close') : t('fr.assay.wrong')}
                </div>
              {/if}
              <div class="grid">
                {#each FR_FRUITS as f}
                  <button
                    class="tile"
                    class:sel={selected.has(f.id) && !assayConfirmed}
                    class:culprit={assayConfirmed && f.inhibits}
                    class:safe={assayConfirmed && !f.inhibits}
                    disabled={pumping || assayConfirmed}
                    onclick={() => toggleFruit(f.id)}
                  >
                    <img src={f.img} alt={t(f.labelKey)} />
                    <span class="name">{t(f.labelKey)}</span>
                    {#if selected.has(f.id) && !assayConfirmed}<span class="pick">✓</span>{/if}
                    {#if assayConfirmed}<span class="mark {fruitRight(f) ? 'ok' : 'no'}">{fruitRight(f) ? '✓' : '✗'}</span>{/if}
                  </button>
                {/each}
              </div>
              {#if pumping}
                <WatchBody text={t('fr.assay.cue')} tone="rising" />
              {:else if !assayConfirmed}
                <div class="actions">
                  <button class="pl-action" disabled={selected.size === 0} onclick={proveAssay}>{t('fr.assay.btn')}</button>
                </div>
                <p class="credit">{t('fruits.credit')}</p>
              {:else}
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

  /* centered narrative column (briefing, dose, reveals, cues) */
  .scene {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--sp-4);
    max-width: 820px;
    text-align: center;
  }
  .scene.wide { max-width: 940px; width: 100%; }
  /* full-width task column (grids + prompt + cue) */
  .task {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--sp-4);
    width: 100%;
  }
  .center { text-align: center; }
  .actions { display: flex; gap: var(--sp-2); justify-content: center; flex-wrap: wrap; }

  .reveal { font-size: var(--fs-display); font-weight: 900; line-height: 1.05; text-shadow: 0 0 26px color-mix(in srgb, var(--green) 35%, transparent); }
  .fb { font-size: var(--fs-h2); font-weight: 800; line-height: 1.3; max-width: 900px; }

  /* dose-fill fact card */
  .factcard {
    max-width: 660px;
    text-align: center;
    animation: factin 0.4s ease both;
  }
  .factcard .factkick {
    display: inline-block;
    font-size: var(--fs-micro);
    font-weight: 900;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--spm-cyan-bright);
    margin-bottom: var(--sp-1);
  }
  .factcard p { font-size: var(--fs-lead); line-height: 1.45; }

  /* lift-to-test tray — five items across, using the width */
  .tray { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--sp-2); width: 100%; max-width: 1000px; }
  .trayitem {
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
    min-height: 150px; padding: var(--sp-3);
    border: 1.5px solid var(--border); border-radius: var(--r-card); background: var(--surface); color: var(--text);
    transition: transform 0.1s ease, opacity 0.25s ease, border-color 0.2s ease;
  }
  .trayitem:active:not(:disabled) { transform: scale(0.96); border-color: var(--spm-cyan); }
  .trayitem .ticon { font-size: 46px; }
  .trayitem b { font-size: var(--fs-body); font-weight: 800; }
  .trayitem small { font-size: var(--fs-micro); font-weight: 800; color: var(--dim); text-transform: uppercase; letter-spacing: 0.5px; }
  .trayitem.gone { opacity: 0.32; }
  .trayitem.gone .ticon { filter: grayscale(1); }
  .trayitem:disabled { cursor: default; }

  /* morning spread — breakfast intro + drift cause, the through-line into the detective */
  .spreadwrap { display: flex; flex-direction: column; align-items: center; gap: var(--sp-2); width: 100%; }
  .spreadwrap.dim { opacity: 0.8; }
  .spreadlabel { font-size: var(--fs-micro); font-weight: 900; letter-spacing: 1px; text-transform: uppercase; color: var(--dim); }
  .spread { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--sp-2); width: 100%; max-width: 920px; }
  .spreaditem { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: var(--sp-3) var(--sp-2); border: 1px solid var(--border); border-radius: var(--r-card); background: var(--surface); }
  .spreaditem span { font-size: 40px; }
  .spreaditem b { font-size: var(--fs-small); font-weight: 700; color: var(--text); }

  /* found-culprit highlight (story-tinted) */
  .culpritcard {
    display: flex; flex-direction: column; align-items: center; gap: var(--sp-1);
    padding: var(--sp-3) var(--sp-6);
    border: 2px solid color-mix(in srgb, var(--story) 60%, transparent);
    border-radius: var(--r-card);
    background: color-mix(in srgb, var(--story) 14%, var(--surface));
    box-shadow: 0 0 30px color-mix(in srgb, var(--story) 22%, transparent);
  }
  .culpritcard .cicon { font-size: 66px; }
  .culpritcard b { font-size: var(--fs-h2); font-weight: 800; }
  .reveal.small { font-size: var(--fs-h1); }

  .optcol { display: flex; flex-direction: column; gap: var(--sp-2); width: 100%; max-width: 680px; }

  /* assay fruit grid (the bundled photos) */
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-2); width: 100%; max-width: 760px; }
  .tile {
    position: relative; padding: 0; border: 3px solid var(--border); border-radius: var(--r-card); overflow: hidden; background: var(--surface);
    transition: transform 0.1s ease, border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  }
  .tile img { display: block; width: 100%; height: 116px; object-fit: cover; }
  .tile .name { display: block; padding: 9px 6px; font-size: var(--fs-body); font-weight: 700; text-align: center; }
  .tile:active:not(:disabled) { transform: scale(0.97); }
  .tile.sel { border-color: var(--spm-cyan); box-shadow: 0 0 0 2px var(--spm-cyan), 0 8px 22px rgba(0, 190, 202, 0.3); }
  .tile.culprit { border-color: var(--toxic); box-shadow: 0 0 16px rgba(255, 107, 122, 0.45); }
  .tile.safe { opacity: 0.5; }
  .tile:disabled { cursor: default; }
  .pick { position: absolute; top: 7px; inset-inline-end: 7px; width: 28px; height: 28px; border-radius: 50%; background: var(--spm-cyan); color: #04222a; font-weight: 900; display: grid; place-items: center; }
  .mark { position: absolute; top: 7px; inset-inline-start: 7px; width: 28px; height: 28px; border-radius: 50%; font-weight: 900; display: grid; place-items: center; color: #fff; }
  .mark.ok { background: var(--green); color: #04221a; }
  .mark.no { background: var(--toxic); }
  .credit { font-size: var(--fs-micro); color: var(--dim); }

  @keyframes beatin { from { opacity: 0; transform: translateY(18px); } }
  @keyframes factin { from { opacity: 0; transform: translateY(8px); } }
  @media (prefers-reduced-motion: reduce) { .beat, .factcard { animation: none; } }
</style>
