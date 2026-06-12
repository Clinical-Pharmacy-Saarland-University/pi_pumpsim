<script lang="ts">
  // Self-contained v2 story „Drei Körper, eine Pille" (DGI · Codein/CYP2D6) — overhaul v2.1.
  // Flow: OBSERVE → PUZZLE → REVEAL. Give the IDENTICAL pill to three distinct kids side-by-side
  // (no auto-pump on mount — the first move is the player's), freeze a marker per kid, work out
  // the puzzle ("same pill, different bodies"), ASSIGN the genotype machines (the INVERSION:
  // high Spiegel = fast machine), get the animated PK curves, then treat (Mara poor / Emil ultra)
  // and the medicine-cabinet finale. The physical pump is the readout; losses are owned here
  // (auto-trip is engine-gated to PLAY_PHASES, which play2 is not).
  import { t } from '../locale.svelte'
  import { game, driveTo, hold, backToStories } from '../game.svelte'
  import PlayShell from '../PlayShell.svelte'
  import WatchBody from '../WatchBody.svelte'
  import EndScreen from '../EndScreen.svelte'
  import {
    GENE_A_LOW, GENE_C_HIGH, GENE_FINALE_OK, GENE_FINALE_WARN,
    GENE_BODIES, GENE_MACHINES, GENE_PK_CURVES, GENE_OBSERVE,
    GENE_TREAT_A, GENE_TREAT_C, GENE_CABINET,
    geneAssignCorrect, geneCleverGrade, geneProGrade,
    type GeneBody, type GeneBin, type GeneMachineId, type GeneOption,
  } from '../stories/gene'
  import { stars, type Outcome } from '../flow'

  type Beat = 'briefing' | 'dose' | 'observe' | 'assign' | 'curves' | 'treatA' | 'treatC' | 'finale' | 'won' | 'outcome'
  let beat = $state<Beat>('briefing')
  let outcome = $state<Outcome>('win')
  let pumping = $state(false)

  // dose (three kids side by side)
  let dosed = $state<Record<string, boolean>>({})
  let doseRead = $state<GeneBody | null>(null)

  // observe
  let observeDone = $state(false)
  let observeStumbled = $state(false)
  let observeMsg = $state<string | null>(null)

  // assign (the inversion puzzle)
  let selectedMachine = $state<GeneMachineId | null>(null)
  let assigned = $state<Record<string, GeneMachineId | undefined>>({})
  let assignDone = $state(false)
  let assignStumbled = $state(false)
  let assignMsg = $state<string | null>(null)

  // treat A / C
  let aChosen = $state<GeneOption | null>(null)
  let aMsg = $state<string | null>(null)
  let treatAStumbled = $state(false)
  let cGiven = $state(false)
  let cChosen = $state<GeneOption | null>(null)
  let cMsg = $state<string | null>(null)
  let treatCStumbled = $state(false)

  // finale
  let selectedCard = $state<string | null>(null)
  let applied = $state<Record<string, string | undefined>>({})
  let finaleMsg = $state<string | null>(null)
  let finaleStumbled = $state(false)

  // kids referenced by id (GENE_BODIES display order is mixed, never index-based)
  const mara = GENE_BODIES.find((b) => b.id === 'A')!
  const emil = GENE_BODIES.find((b) => b.id === 'C')!
  const finalePatients: { pid: 'A' | 'C'; body: GeneBody }[] = [
    { pid: 'A', body: mara },
    { pid: 'C', body: emil },
  ]

  let aOptions = $derived(GENE_TREAT_A.filter((o) => game.ageGroup === 'adult' || !o.adultOnly))
  let cOptions = $derived(GENE_TREAT_C.filter((o) => game.ageGroup === 'adult' || !o.adultOnly))
  let cabinet = $derived(GENE_CABINET.filter((o) => game.ageGroup === 'adult' || !o.adultOnly))
  let allDosed = $derived(GENE_BODIES.every((b) => dosed[b.id]))
  let finaleDone = $derived(!!applied.A && !!applied.C)

  let cleverMisses = $derived((observeStumbled ? 1 : 0) + (assignStumbled ? 1 : 0))
  let proStumbles = $derived((treatAStumbled ? 1 : 0) + (treatCStumbled ? 1 : 0) + (finaleStumbled ? 1 : 0))
  let clever = $derived(geneCleverGrade(cleverMisses))
  let pro = $derived(geneProGrade(proStumbles))
  let starCount = $derived(stars(outcome === 'win', clever, pro))
  let stepNum = $derived(
    beat === 'briefing' ? 1
    : beat === 'dose' ? 2
    : beat === 'observe' ? 3
    : beat === 'assign' ? 4
    : beat === 'curves' ? 5
    : beat === 'treatA' ? 6
    : 7,
  )

  // ── pump wrapper (no auto-drive on mount; the player triggers the first move) ──
  function drive(target: number, rate: number, then: () => void = () => {}) {
    pumping = true
    driveTo(target, rate, () => { pumping = false; then() })
  }

  // ── level → mini-marker geometry (a small abstract result pip, NOT a mirrored vessel) ──
  const SCALE_LO = 20, SCALE_HI = 90
  const pct = (lvl: number) => Math.max(4, Math.min(96, ((lvl - SCALE_LO) / (SCALE_HI - SCALE_LO)) * 100))
  const bandLowPct = pct(55), bandHighPct = pct(70)
  const binTone = (bin: GeneBin): 'still' | 'good' | 'rising' => (bin === 'high' ? 'rising' : bin === 'mid' ? 'good' : 'still')

  // ── beat 0: briefing → dose (no pump; the first move is the player dosing a kid) ──
  function start() {
    beat = 'dose'
  }

  // ── beat 1: dose the three kids side by side — each pill drives the spiegel DIRECTLY to
  //    that kid's level (no baseline detour; the frozen marker keeps each result) ──
  function give(b: GeneBody) {
    if (pumping || dosed[b.id]) return
    doseRead = null
    drive(b.level, 4, () => { dosed = { ...dosed, [b.id]: true }; doseRead = b })
  }
  function doseNext() {
    if (pumping) return
    beat = 'observe'
  }

  // ── beat 2: observe ──
  function pickObserve(correct: boolean) {
    if (correct) { observeDone = true; observeMsg = 'gene.observe.fb.right' }
    else { observeStumbled = true; observeMsg = 'gene.observe.fb.wrong' }
  }

  // ── beat 3: assign genotype machines (the inversion) ──
  function pickMachine(id: GeneMachineId) {
    if (!pumping && !assignDone) selectedMachine = id
  }
  function assignTo(b: GeneBody) {
    if (pumping || assignDone || !selectedMachine) return
    assigned = { ...assigned, [b.id]: selectedMachine }
    selectedMachine = null
    if (!GENE_BODIES.every((x) => assigned[x.id])) return
    if (GENE_BODIES.every((x) => geneAssignCorrect(x, assigned[x.id]!))) {
      assignDone = true
      assignMsg = 'gene.assign.fb.right'
      return
    }
    assignStumbled = true
    // an extreme swap (fast→low or slow→high) gets the inversion hint
    const swap = GENE_BODIES.some((x) => {
      const m = GENE_MACHINES.find((mm) => mm.id === assigned[x.id])
      return !!m && ((m.bin === 'high' && x.truth === 'low') || (m.bin === 'low' && x.truth === 'high'))
    })
    assignMsg = swap ? 'gene.assign.fb.invert' : 'gene.assign.fb.wrong'
    // clear only the wrong placements; keep the correct ones
    const next = { ...assigned }
    for (const x of GENE_BODIES) if (!geneAssignCorrect(x, assigned[x.id]!)) next[x.id] = undefined
    assigned = next
  }

  // ── beat 4: curves → drive into Mara's „zu tief" start ──
  function curvesNext() {
    if (pumping) return
    drive(GENE_A_LOW, 8, () => (beat = 'treatA'))
  }

  // ── beat 5: treat A (Poor Metabolizer) ──
  function pickA(o: GeneOption) {
    if (pumping) return
    if (o.result === 'retry') { treatAStumbled = true; aMsg = o.feedbackKey; return }
    aChosen = o; aMsg = o.feedbackKey
    if (o.result === 'win') {
      drive(62, 4, () => { beat = 'treatC'; cGiven = false }) // Emil's pill drives up from here, no reset
    } else if (o.target !== undefined) {
      drive(o.target, 4, () => { outcome = 'under'; beat = 'outcome' }) // dead still at 46 → under
    } else {
      pumping = true
      hold(1400, () => { pumping = false; outcome = 'under'; beat = 'outcome' })
    }
  }

  // ── beat 6: treat C (Ultra-rapid, live) ──
  function giveC() {
    if (pumping || cGiven) return
    cGiven = true
    drive(GENE_C_HIGH, 4) // 40 → 76 live rise (the twist forms in front of the player)
  }
  function pickC(o: GeneOption) {
    if (pumping) return
    if (o.result === 'retry') { treatCStumbled = true; cMsg = o.feedbackKey; return }
    cChosen = o; cMsg = o.feedbackKey
    if (o.result === 'win') {
      drive(62, 4, () => (beat = 'finale'))
    } else {
      drive(o.target!, 4, () => { outcome = 'over'; beat = 'outcome' })
    }
  }

  // ── beat 7: finale cabinet ──
  function selectCard(id: string) { if (!pumping) selectedCard = id }
  function applyTo(patient: 'A' | 'C') {
    if (pumping || !selectedCard || applied[patient]) return
    const card = GENE_CABINET.find((c) => c.id === selectedCard)!
    if (card.safe) {
      applied = { ...applied, [patient]: selectedCard }
      finaleMsg = 'gene.finale.good'
      selectedCard = null
    } else {
      finaleStumbled = true
      finaleMsg = patient === 'C' ? 'gene.finale.warn' : 'gene.finale.bad'
      selectedCard = null
      if (patient === 'C') drive(GENE_FINALE_WARN, 6, () => drive(GENE_FINALE_OK, 4))
    }
  }
</script>

<div class="root">
  {#if beat === 'outcome'}
    <EndScreen
      {outcome}
      titleKey={`gene.out.${outcome}.title`}
      subKey={`gene.out.${outcome}.sub`}
      storyTitleKey="story.gene.title"
      score={starCount}
      factKeys={outcome === 'win'
        ? ['gene.out.dyk1', 'gene.out.dyk2']
        : outcome === 'over'
          ? ['gene.out.dyk.over', 'gene.out.dyk1']
          : ['gene.out.dyk.under', 'gene.out.dyk1']}
    />
  {:else}
    <PlayShell
      color={game.story?.color ?? '#b794ff'}
      kicker={t('story.gene.title')}
      caseLine={t('gene.case')}
      step={stepNum}
      total={7}
      onCancel={backToStories}
    >
      {#key beat}
        <div class="beat">
          {#if beat === 'briefing'}
            <div class="scene">
              <span class="pl-emoji">🦷</span>
              <div class="kids">{#each GENE_BODIES as b}<span>{b.emoji}</span>{/each}</div>
              <h1 class="pl-h1">{t('gene.brief.patient')}</h1>
              <p class="pl-lead">{t('gene.brief.goal')}</p>
              <div class="actions">
                <button class="pl-action" disabled={pumping} onclick={start}>{t('gene.brief.go')}</button>
              </div>
            </div>

          {:else if beat === 'dose'}
            <div class="task">
              <h2 class="pl-h2 center">{t('gene.dose.prompt')}</h2>
              <div class="kidrow">
                {#each GENE_BODIES as b}
                  <div class="kidcard" class:done={dosed[b.id]}>
                    <span class="avatar">{b.emoji}</span>
                    <b>{t(b.nameKey)}</b>
                    <div class="meter">
                      <span class="mband" style="bottom:{bandLowPct}%;height:{bandHighPct - bandLowPct}%"></span>
                      {#if dosed[b.id]}
                        <span class="mdot {b.truth}" style="bottom:{pct(b.level)}%"></span>
                      {/if}
                    </div>
                    {#if dosed[b.id]}
                      <span class="tag {b.truth}">{t(`gene.mark.${b.truth}`)}</span>
                    {:else}
                      <button class="pl-action small" disabled={pumping} onclick={() => give(b)}>💊 {t('gene.dose.give')}</button>
                    {/if}
                  </div>
                {/each}
              </div>
              {#if allDosed && !pumping}
                <p class="pl-lead reveal">{t('gene.dose.reveal')}</p>
                <div class="actions">
                  <button class="pl-action" onclick={doseNext}>{t('gene.next')}</button>
                </div>
              {:else if doseRead && !pumping}
                <WatchBody text={t(doseRead.readKey)} tone={binTone(doseRead.truth)} />
              {:else}
                <WatchBody text={t('gene.dose.watch')} tone="watch" />
              {/if}
            </div>

          {:else if beat === 'observe'}
            <div class="task">
              <h2 class="pl-h2 center">{t('gene.observe.prompt')}</h2>
              {#if observeDone}
                <p class="fb pl-good">{t('gene.observe.fb.right')}</p>
                <div class="actions">
                  <button class="pl-action" onclick={() => (beat = 'assign')}>{t('gene.next')}</button>
                </div>
              {:else}
                <div class="optcol">
                  {#each GENE_OBSERVE as o}
                    <button class="pl-opt" onclick={() => pickObserve(o.correct)}>{t(o.labelKey)}</button>
                  {/each}
                </div>
                {#if observeMsg}<p class="fb pl-warn">{t(observeMsg)}</p>{/if}
              {/if}
            </div>

          {:else if beat === 'assign'}
            <div class="task">
              {#if !assignDone}
                <p class="pl-body gloss">{t('gene.assign.intro')}</p>
                <h2 class="pl-h2 center">{t('gene.assign.prompt')}</h2>
              {/if}
              <div class="kidrow">
                {#each GENE_BODIES as b}
                  {@const am = GENE_MACHINES.find((m) => m.id === assigned[b.id])}
                  <button class="kidcard pick mini" class:armed={selectedMachine && !assigned[b.id]} disabled={pumping || assignDone || (!selectedMachine && !assigned[b.id])} onclick={() => assignTo(b)}>
                    <span class="avatar">{b.emoji}</span>
                    <b>{t(b.nameKey)}</b>
                    <div class="meter">
                      <span class="mband" style="bottom:{bandLowPct}%;height:{bandHighPct - bandLowPct}%"></span>
                      <span class="mdot {b.truth}" style="bottom:{pct(b.level)}%"></span>
                    </div>
                    <span class="slot" class:filled={am}>{am ? am.emoji : '?'}</span>
                  </button>
                {/each}
              </div>
              {#if assignDone}
                <p class="fb pl-good">{t('gene.assign.fb.right')}</p>
                <div class="actions">
                  <button class="pl-action" onclick={() => (beat = 'curves')}>{t('gene.next')}</button>
                </div>
              {:else}
                <div class="machines">
                  {#each GENE_MACHINES as m}
                    <button class="token" class:sel={selectedMachine === m.id} disabled={pumping} onclick={() => pickMachine(m.id)}>{t(m.labelKey)}</button>
                  {/each}
                </div>
                {#if assignMsg}<p class="fb pl-warn">{t(assignMsg)}</p>{:else}<p class="hint">{t('gene.assign.pick')}</p>{/if}
              {/if}
            </div>

          {:else if beat === 'curves'}
            <div class="scene wide">
              <div class="curvehead"><b class="pl-h2">{t('gene.curves.title')}</b><span>{t('gene.curves.sub')}</span></div>
              <svg class="pkchart" viewBox="0 0 360 180" aria-hidden="true">
                <rect x="8" y="56" width="344" height="40" class="pkband" />
                <text x="13" y="50" class="pklabel">{t('gene.curves.band')}</text>
                {#each GENE_PK_CURVES as cv}
                  <path d={cv.d} class="pkcurve c{cv.id}" />
                {/each}
                <text x="172" y="124" class="pkemoji cA">🐢</text>
                <text x="172" y="76" class="pkemoji cB">🚶</text>
                <text x="150" y="26" class="pkemoji cC">🚀</text>
              </svg>
              <div class="badges">
                {#each GENE_BODIES as b}
                  <span class="bdg b{b.id}"><b>{t(b.nameKey)}</b>{t(b.badgeKey)}</span>
                {/each}
              </div>
              <div class="actions">
                <button class="pl-action" disabled={pumping} onclick={curvesNext}>{t('gene.next')}</button>
              </div>
            </div>

          {:else if beat === 'treatA'}
            <div class="task">
              <div class="who"><span class="avatar">{mara.emoji}</span><b>{t('gene.body.A')}</b></div>
              <h2 class="pl-h2 center">{t('gene.treatA.prompt')}</h2>
              {#if aChosen?.result === 'win'}
                <WatchBody text={t(aChosen.feedbackKey)} tone="good" />
              {:else}
                <div class="optcol">
                  {#each aOptions as o}
                    <button class="pl-opt" disabled={pumping} onclick={() => pickA(o)}>{t(o.labelKey)}</button>
                  {/each}
                </div>
                {#if aMsg}<p class="fb pl-warn">{t(aMsg)}</p>{/if}
              {/if}
            </div>

          {:else if beat === 'treatC'}
            <div class="task">
              <div class="who"><span class="avatar">{emil.emoji}</span><b>{t('gene.body.C')}</b></div>
              {#if !cGiven}
                <h2 class="pl-h2 center">{t('gene.treatC.intro')}</h2>
                <div class="actions">
                  <button class="pl-action" disabled={pumping} onclick={giveC}>💊 {t('gene.treatC.give')}</button>
                </div>
              {:else if pumping && !cChosen}
                <WatchBody text={t('gene.treatC.rising')} tone="rising" />
              {:else if !cChosen}
                <h2 class="pl-h2 center">{t('gene.treatC.prompt')}</h2>
                <div class="optcol">
                  {#each cOptions as o}
                    <button class="pl-opt" disabled={pumping} onclick={() => pickC(o)}>{t(o.labelKey)}</button>
                  {/each}
                </div>
                {#if cMsg}<p class="fb pl-warn">{t(cMsg)}</p>{/if}
              {:else}
                <WatchBody text={t(cChosen.feedbackKey)} tone={cChosen.result === 'win' ? 'falling' : 'rising'} />
              {/if}
            </div>

          {:else if beat === 'finale'}
            <div class="task">
              <h2 class="pl-h2 center">{t('gene.finale.prompt')}</h2>
              <div class="slots">
                {#each finalePatients as fp}
                  <button class="kidcard slotcard" class:done={applied[fp.pid]} disabled={pumping || !!applied[fp.pid]} onclick={() => applyTo(fp.pid)}>
                    <span class="avatar">{fp.body.emoji}</span><b>{t(fp.body.nameKey)}</b>
                    <small>{applied[fp.pid] ? t('gene.finale.applied') : t('gene.finale.pickFor')}</small>
                  </button>
                {/each}
              </div>
              <div class="cabinet">
                {#each cabinet as c}
                  <button class="card" class:sel={selectedCard === c.id} class:safe={c.safe} disabled={pumping} onclick={() => selectCard(c.id)}>{t(c.labelKey)}</button>
                {/each}
              </div>
              {#if finaleMsg}<p class="fb {finaleMsg === 'gene.finale.good' ? 'pl-good' : 'pl-warn'}">{t(finaleMsg)}</p>{/if}
              {#if finaleDone}
                <div class="actions">
                  <button class="pl-action" disabled={pumping} onclick={() => (beat = 'won')}>{t('gene.next')}</button>
                </div>
              {/if}
            </div>

          {:else if beat === 'won'}
            <div class="scene">
              <h2 class="pl-h2 pl-good">{t('gene.won.title')}</h2>
              <p class="pl-lead">{t('gene.won.peek')}</p>
              <div class="actions">
                <button class="pl-action" onclick={() => (beat = 'outcome')}>{t('gene.next')}</button>
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
  /* safe center: stays centred when it fits, but falls back to top-align instead of clipping
     the bottom (the „Weiter button under the text" bug) when a beat is content-heavy. Beats are
     sized to fit the frame, so no scroll is needed (and no scrollbar is shown). */
  .beat { height: 100%; display: grid; align-content: safe center; justify-items: center; gap: var(--sp-3); animation: beatin 0.4s cubic-bezier(0.2, 0.9, 0.3, 1) both; }
  .scene { display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); max-width: 880px; text-align: center; }
  .scene.wide { max-width: 980px; width: 100%; }
  .task { display: flex; flex-direction: column; align-items: center; gap: var(--sp-4); width: 100%; }
  .center { text-align: center; }
  .actions { display: flex; gap: var(--sp-2); justify-content: center; flex-wrap: wrap; }
  .fb { font-size: var(--fs-lead); font-weight: 800; line-height: 1.3; max-width: 900px; text-align: center; }
  .gloss { color: var(--dim); max-width: 820px; text-align: center; }
  .hint { font-size: var(--fs-small); color: var(--dim); font-weight: 700; }
  .reveal { max-width: 820px; }
  .kids { font-size: 44px; letter-spacing: 10px; }

  /* kid cards + frozen marker */
  .kidrow { display: flex; gap: var(--sp-3); justify-content: center; flex-wrap: wrap; }
  .kidcard { display: flex; flex-direction: column; align-items: center; gap: var(--sp-2); min-width: 200px; padding: var(--sp-3) var(--sp-4); border: 2px solid var(--border); border-radius: var(--r-card); background: var(--surface); color: var(--text); }
  .kidcard.done { border-color: color-mix(in srgb, var(--story) 55%, transparent); }
  .kidcard .avatar { font-size: 56px; line-height: 1; }
  .kidcard b { font-size: var(--fs-lead); font-weight: 800; }
  .kidcard.pick { transition: transform 0.1s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
  .kidcard.pick:active:not(:disabled) { transform: scale(0.97); }
  .kidcard.pick.armed { border-color: var(--spm-cyan); box-shadow: 0 0 0 2px color-mix(in srgb, var(--spm-cyan) 60%, transparent); }
  /* compact variant for the assign beat (it has the most stacked content) */
  .kidcard.mini { gap: var(--sp-1); padding: var(--sp-2) var(--sp-3); min-width: 168px; }
  .kidcard.mini .avatar { font-size: 40px; }
  .kidcard.mini .meter { height: 50px; }
  .kidcard.mini .slot { width: 40px; height: 40px; font-size: 24px; }

  .meter { position: relative; width: 18px; height: 72px; border-radius: 9px; background: rgba(255, 255, 255, 0.06); border: 1px solid var(--border); overflow: hidden; }
  .mband { position: absolute; left: 0; right: 0; background: color-mix(in srgb, var(--green) 30%, transparent); border-top: 1px dashed color-mix(in srgb, var(--green) 70%, transparent); border-bottom: 1px dashed color-mix(in srgb, var(--green) 70%, transparent); }
  .mdot { position: absolute; left: 50%; width: 14px; height: 14px; border-radius: 50%; transform: translate(-50%, 50%); box-shadow: 0 0 10px currentColor; }
  .mdot.low { background: var(--spm-cyan); color: var(--spm-cyan); }
  .mdot.mid { background: var(--green); color: var(--green); }
  .mdot.high { background: var(--toxic); color: var(--toxic); }
  .tag { font-size: var(--fs-small); font-weight: 800; padding: 4px 12px; border-radius: var(--r-pill); border: 1px solid var(--border); }
  .tag.low { color: var(--spm-cyan); }
  .tag.mid { color: var(--green); }
  .tag.high { color: var(--toxic); }

  .pl-action.small { min-height: 48px; padding: 10px 18px; font-size: var(--fs-body); }

  /* assign slot */
  .slot { font-size: 30px; line-height: 1; width: 48px; height: 48px; display: grid; place-items: center; border: 1.5px dashed var(--border); border-radius: 12px; color: var(--dim); }
  .slot.filled { border-style: solid; border-color: color-mix(in srgb, var(--story) 60%, transparent); color: var(--text); }
  .machines { display: flex; gap: var(--sp-2); flex-wrap: wrap; justify-content: center; }
  .token { padding: 14px 22px; border: 1.5px solid var(--border); border-radius: var(--r-pill); background: var(--surface); color: var(--text); font-size: var(--fs-body); font-weight: 800; }
  .token.sel { border-color: var(--spm-cyan); box-shadow: 0 0 0 2px var(--spm-cyan); }
  .token:active:not(:disabled) { transform: scale(0.97); }

  .optcol { display: flex; flex-direction: column; gap: var(--sp-2); width: 100%; max-width: 720px; }
  .who { display: flex; align-items: center; gap: var(--sp-2); }
  .who .avatar { font-size: 40px; }
  .who b { font-size: var(--fs-lead); font-weight: 800; }

  /* PK curves */
  .curvehead { text-align: center; display: flex; flex-direction: column; gap: 4px; }
  .curvehead span { font-size: var(--fs-small); color: var(--dim); }
  .pkchart { width: 100%; max-width: 560px; height: auto; background: rgba(255, 255, 255, 0.03); border-radius: var(--r-card); }
  .pkband { fill: color-mix(in srgb, var(--green) 20%, transparent); }
  .pklabel { fill: var(--green); font-size: 11px; font-weight: 800; }
  .pkcurve { fill: none; stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 460; stroke-dashoffset: 460; animation: draw 1.2s ease forwards; }
  .pkcurve.cA { stroke: var(--spm-cyan); animation-delay: 0.1s; }
  .pkcurve.cB { stroke: var(--green); animation-delay: 0.55s; }
  .pkcurve.cC { stroke: var(--toxic); animation-delay: 1s; }
  .pkemoji { font-size: 20px; opacity: 0; animation: fadein 0.4s ease forwards; }
  .pkemoji.cA { animation-delay: 1.1s; }
  .pkemoji.cB { animation-delay: 1.55s; }
  .pkemoji.cC { animation-delay: 2s; }
  .badges { display: flex; gap: var(--sp-2); flex-wrap: wrap; justify-content: center; }
  .bdg { display: flex; flex-direction: column; gap: 2px; font-size: var(--fs-small); font-weight: 800; padding: 8px 16px; border-radius: var(--r-card); border: 1.5px solid var(--border); background: var(--surface); }
  .bdg b { font-size: var(--fs-body); }
  .bdg.bA { border-color: color-mix(in srgb, var(--spm-cyan) 50%, transparent); }
  .bdg.bB { border-color: color-mix(in srgb, var(--green) 50%, transparent); }
  .bdg.bC { border-color: color-mix(in srgb, var(--toxic) 50%, transparent); }

  /* finale */
  .slots { display: flex; gap: var(--sp-3); justify-content: center; }
  .slotcard { min-height: 150px; justify-content: center; }
  .slotcard small { font-size: var(--fs-micro); font-weight: 800; color: var(--dim); text-transform: uppercase; letter-spacing: 0.5px; }
  .slotcard.done { border-color: var(--green); background: color-mix(in srgb, var(--green) 12%, var(--surface)); }
  .cabinet { display: flex; gap: var(--sp-2); flex-wrap: wrap; justify-content: center; max-width: 860px; }
  .card { padding: 14px 22px; border: 1.5px solid var(--border); border-radius: var(--r-pill); background: var(--surface); color: var(--text); font-size: var(--fs-body); font-weight: 800; }
  .card.sel { border-color: var(--spm-cyan); box-shadow: 0 0 0 2px var(--spm-cyan); }
  .card:active:not(:disabled) { transform: scale(0.97); }

  @keyframes beatin { from { opacity: 0; transform: translateY(18px); } }
  @keyframes draw { to { stroke-dashoffset: 0; } }
  @keyframes fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) {
    .beat { animation: none; }
    .pkcurve { animation: none; stroke-dashoffset: 0; }
    .pkemoji { animation: none; opacity: 1; }
  }
</style>
