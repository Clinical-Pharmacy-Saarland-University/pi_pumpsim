<script lang="ts">
  // Self-contained v2 story „Der müde Filter" (Organ/DOI · renale Clearance × Metformin).
  // v3 rework: THE TWO-EXITS IDEA. The body clears medicine two ways — the LEBER breaks it
  // down, the NIERE washes it out. Metformin is special: the liver doesn't touch it, so it
  // leaves ONLY via the kidney. A tired kidney → the SAME dose now piles up. The player gives
  // the usual dose (and watches it climb on the torso — the cold-start twist), discovers the
  // single renal exit on the kidney ANIMATION, adjusts the dose to the tired kidney (the live
  // torso move), then sorts which drugs lean on the kidney. The physical pump is the readout;
  // OrganExits is the teaching animation, not a level mirror.
  import { t } from '../locale.svelte'
  import { game, driveTo, backToStories } from '../game.svelte'
  import PlayShell from '../PlayShell.svelte'
  import WatchBody from '../WatchBody.svelte'
  import EndScreen from '../EndScreen.svelte'
  import OrganExits from '../OrganExits.svelte'
  import {
    ORGAN_DOSE, ORGAN_DRIFT, ORGAN_CONFIRM, ORGAN_OVER, ORGAN_UNDER,
    ORGAN_FACTS, ORGAN_EXITS, ORGAN_TAPS, ORGAN_DRUGS, organClever, organSortGrade,
    type OrganExit, type OrganTap, type OrganDrug,
  } from '../stories/organ'
  import { stars, type Outcome } from '../flow'

  type Beat =
    | 'briefing' | 'dose' | 'dosing' | 'question'
    | 'exits' | 'exitsReveal'
    | 'decide' | 'deciding' | 'won'
    | 'sort' | 'outcome'
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

  // exits discovery
  let exitMode = $state<'both' | 'kidney' | 'tired'>('both')
  let wrongGuesses = $state(0)
  let exitFb = $state<string | null>(null)

  // decision (live dose cut)
  let chosen = $state<OrganTap | null>(null)
  let resolved = $state(false)
  let baitFb = $state(false)
  let moveCue = $state('organ.move.reduce')
  let moveTone = $state<'rising' | 'falling'>('falling')

  // drug sort (finale)
  let selected = $state(new Set<string>())
  let sortConfirmed = $state(false)
  let sortGrade = $state(0)

  let taps = $derived(ORGAN_TAPS.filter((tp) => game.ageGroup === 'adult' || !tp.adultOnly))
  let clever = $derived(organClever(wrongGuesses))
  let starCount = $derived(stars(outcome === 'win', clever, sortGrade))
  let stepNum = $derived(
    ['briefing', 'dose', 'dosing'].includes(beat) ? 1
    : beat === 'question' ? 2
    : ['exits', 'exitsReveal'].includes(beat) ? 3
    : ['decide', 'deciding', 'won'].includes(beat) ? 4
    : 5,
  )

  // NO auto-pump on mount — the torso sits at its homed baseline (≈42); the first dose tap is
  // the first movement (story-design rule: prime on the first action, never on mount).

  function drive(target: number, rate: number, then: () => void = () => {}) {
    pumping = true
    driveTo(target, rate, () => { pumping = false; then() })
  }

  // rotate the dose-fill facts while the cold-start hub pumps (42→62→76)
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
    // ONE uninterrupted rise: 42→62 (normal, mid-green) then, unchanged, 62→76 (over the window)
    drive(ORGAN_DOSE, 5, () => { creep = true; drive(ORGAN_DRIFT, 3, () => (fillDone = true)) })
  }

  function pickExit(e: OrganExit) {
    if (pumping) return
    if (e.correct) {
      exitFb = null
      exitMode = 'tired'
      beat = 'exitsReveal'
      drive(ORGAN_CONFIRM, 2) // the only exit is tired → the stau backs up a last step (76→78)
    } else {
      wrongGuesses += 1
      exitFb = e.feedbackKey
      exitMode = 'kidney' // show the liver door shut — the visual proof Metformin can't use it
    }
  }

  function pickTap(tap: OrganTap) {
    if (pumping) return
    chosen = tap; resolved = false
    beat = 'deciding'
    if (tap.result === 'win') { moveCue = 'organ.move.reduce'; moveTone = 'falling' }
    else if (tap.result === 'over') { moveCue = 'organ.move.over'; moveTone = 'rising' }
    else { moveCue = 'organ.move.under'; moveTone = 'falling' }
    drive(tap.target, 4, () => {
      if (resolved) return
      resolved = true
      if (tap.result === 'win') beat = 'won'
      else { outcome = tap.result; beat = 'outcome' } // settle-only over/under
    })
  }
  function tapBait() {
    if (pumping) return
    baitFb = true // no pump move — the still water over green is the answer „hilft nicht"
  }

  function toggleDrug(id: string) {
    if (pumping || sortConfirmed) return
    const s = new Set(selected)
    s.has(id) ? s.delete(id) : s.add(id)
    selected = s
  }
  function proveSort() {
    if (pumping || sortConfirmed || selected.size === 0) return
    sortGrade = organSortGrade(selected)
    sortConfirmed = true
  }
  const drugRight = (d: OrganDrug) => d.renal === selected.has(d.id)
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
      total={5}
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
                <button class="pl-action" onclick={() => (beat = 'exits')}>{t('organ.q.btn')}</button>
              </div>
            </div>

          {:else if beat === 'exits'}
            <div class="task">
              <p class="pl-lead center">{t('organ.exits.intro')}</p>
              <OrganExits
                mode={exitMode}
                liverLabel={t('organ.lbl.liver')}
                kidneyLabel={t('organ.lbl.kidney')}
                bloodLabel={t('organ.lbl.blood')}
              />
              <h2 class="pl-h2 center">{t('organ.exits.prompt')}</h2>
              <div class="optcol">
                {#each ORGAN_EXITS as e}
                  <button class="pl-opt" disabled={pumping} onclick={() => pickExit(e)}>{t(e.labelKey)}</button>
                {/each}
              </div>
              <WatchBody text={t(exitFb ?? 'organ.exits.watch')} tone={exitFb ? 'still' : 'watch'} />
            </div>

          {:else if beat === 'exitsReveal'}
            <div class="scene wide">
              <h2 class="pl-h2 pl-good">{t('organ.reveal.title')}</h2>
              <OrganExits
                mode="tired"
                liverLabel={t('organ.lbl.liver')}
                kidneyLabel={t('organ.lbl.kidney')}
                bloodLabel={t('organ.lbl.blood')}
                tiredNote={game.ageGroup === 'adult' ? 'eGFR ↓' : 'müde'}
              />
              <p class="pl-lead">{t('organ.reveal.body')}</p>
              <WatchBody text={t('organ.reveal.stau')} tone="rising" />
              <div class="actions">
                <button class="pl-action" disabled={pumping} onclick={() => (beat = 'decide')}>{t('common.next')}</button>
              </div>
            </div>

          {:else if beat === 'decide'}
            <div class="task">
              <h2 class="pl-h2 center">{t('organ.decide.prompt')}</h2>
              <WatchBody text={t('organ.decide.watch')} tone="rising" />
              <div class="optcol">
                {#each taps as tap}
                  <button class="pl-opt" disabled={pumping} onclick={() => pickTap(tap)}>{t(tap.labelKey)}</button>
                {/each}
                <button class="pl-opt ghost" disabled={pumping} onclick={tapBait}>{t('organ.tap.bait')}</button>
              </div>
              {#if baitFb}<p class="fb pl-warn">{t('organ.tfb.bait')}</p>{/if}
            </div>

          {:else if beat === 'deciding'}
            <div class="scene">
              <WatchBody text={t(moveCue)} tone={moveTone} />
              {#if chosen && chosen.result !== 'win'}<p class="fb pl-bad">{t(chosen.feedbackKey)}</p>{/if}
            </div>

          {:else if beat === 'won'}
            <div class="scene">
              <h2 class="pl-h2 pl-good">{t('organ.won.title')}</h2>
              <p class="pl-lead">{t('organ.won.body')}</p>
              <p class="pl-body">{t('organ.won.peek')}</p>
              <div class="actions">
                <button class="pl-action" onclick={() => (beat = 'sort')}>{t('common.next')}</button>
              </div>
            </div>

          {:else if beat === 'sort'}
            <div class="task">
              {#if !sortConfirmed}
                <h2 class="pl-h2 center">{t('organ.sort.prompt')}</h2>
              {:else}
                <div class="fb center {sortGrade >= 1 ? 'pl-good' : sortGrade > 0 ? 'pl-warn' : 'pl-bad'}">
                  {sortGrade >= 1 ? t('organ.sort.correct') : sortGrade > 0 ? t('organ.sort.close') : t('organ.sort.wrong')}
                </div>
              {/if}
              <div class="druggrid">
                {#each ORGAN_DRUGS as d}
                  <button
                    class="dtile"
                    class:sel={selected.has(d.id) && !sortConfirmed}
                    class:renal={sortConfirmed && d.renal}
                    class:liver={sortConfirmed && !d.renal}
                    disabled={pumping || sortConfirmed}
                    onclick={() => toggleDrug(d.id)}
                  >
                    <b>{t(d.labelKey)}</b>
                    {#if selected.has(d.id) && !sortConfirmed}<span class="pick">🫘</span>{/if}
                    {#if sortConfirmed}
                      <span class="tag">{t(d.tagKey)}</span>
                      <span class="mark {drugRight(d) ? 'ok' : 'no'}">{drugRight(d) ? '✓' : '✗'}</span>
                    {/if}
                  </button>
                {/each}
              </div>
              {#if !sortConfirmed}
                <div class="actions">
                  <button class="pl-action" disabled={selected.size === 0} onclick={proveSort}>{t('organ.sort.btn')}</button>
                </div>
              {:else}
                <p class="pl-lead center lesson">{t('organ.sort.lesson')}</p>
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
  .beat { height: 100%; display: grid; align-content: center; justify-items: center; gap: var(--sp-4); animation: beatin 0.4s cubic-bezier(0.2, 0.9, 0.3, 1) both; }
  .scene { display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); max-width: 880px; text-align: center; }
  .scene.wide { max-width: 980px; width: 100%; }
  .task { display: flex; flex-direction: column; align-items: center; gap: var(--sp-3); width: 100%; }
  .center { text-align: center; }
  .actions { display: flex; gap: var(--sp-2); justify-content: center; flex-wrap: wrap; }
  .fb { font-size: var(--fs-h2); font-weight: 800; line-height: 1.3; max-width: 900px; text-align: center; }

  .factcard { max-width: 680px; text-align: center; animation: factin 0.4s ease both; }
  .factcard .factkick { display: inline-block; font-size: var(--fs-micro); font-weight: 900; letter-spacing: 1px; text-transform: uppercase; color: var(--spm-cyan-bright); margin-bottom: var(--sp-1); }
  .factcard p { font-size: var(--fs-lead); line-height: 1.45; }

  .optcol { display: flex; flex-direction: column; gap: var(--sp-2); width: 100%; max-width: 720px; }
  .pl-opt.ghost { opacity: 0.75; border-style: dashed; }

  /* drug sort grid (text tiles, no photos) */
  .druggrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--sp-2); width: 100%; max-width: 820px; }
  .dtile {
    position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px;
    min-height: 96px; padding: var(--sp-3) var(--sp-4);
    border: 2.5px solid var(--border); border-radius: var(--r-card); background: var(--surface); color: var(--text);
    transition: transform 0.1s ease, border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  }
  .dtile b { font-size: var(--fs-body); font-weight: 800; line-height: 1.2; text-align: center; }
  .dtile:active:not(:disabled) { transform: scale(0.97); }
  .dtile.sel { border-color: var(--spm-cyan); box-shadow: 0 0 0 2px var(--spm-cyan), 0 8px 22px rgba(0, 190, 202, 0.3); }
  .dtile.renal { border-color: var(--green); box-shadow: 0 0 16px color-mix(in srgb, var(--green) 30%, transparent); }
  .dtile.liver { opacity: 0.7; border-color: color-mix(in srgb, #c98a4e 60%, var(--border)); }
  .dtile:disabled { cursor: default; }
  .dtile .tag { font-size: var(--fs-micro); font-weight: 900; letter-spacing: 0.4px; text-transform: uppercase; color: var(--dim); }
  .dtile.renal .tag { color: var(--green); }
  .dtile .pick { position: absolute; top: 7px; inset-inline-end: 9px; font-size: 18px; }
  .dtile .mark { position: absolute; top: 6px; inset-inline-start: 9px; width: 26px; height: 26px; border-radius: 50%; font-weight: 900; display: grid; place-items: center; color: #fff; font-size: 15px; }
  .dtile .mark.ok { background: var(--green); color: #04221a; }
  .dtile .mark.no { background: var(--toxic); }
  .lesson { max-width: 880px; font-size: var(--fs-body); }

  @keyframes beatin { from { opacity: 0; transform: translateY(18px); } }
  @keyframes factin { from { opacity: 0; transform: translateY(8px); } }
  @media (prefers-reduced-motion: reduce) { .beat, .factcard { animation: none; } }
</style>
