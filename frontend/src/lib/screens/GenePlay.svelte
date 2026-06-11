<script lang="ts">
  // Self-contained v2 story „Drei Körper, eine Pille" (DGI · Codein/CYP2D6).
  // Blueprint screen on <PlayShell/> + the .pl-* kit. Signature mechanic: PREDICT-THEN-POUR —
  // bet first (zu wenig/genau richtig/zu viel), then pour the IDENTICAL pill into ONE tank, ×3,
  // with a body-swap reset between. The input is constant; the hidden variable is the body
  // (the CYP2D6 gene). No on-screen vessel — the physical pump is the readout. The scanner beat
  // draws the three PK morphine curves (same dose → three curves). Losses rebuilt via a manual
  // $effect (auto-trip is engine-gated to PLAY_PHASES, which play2 is not).
  import { onMount } from 'svelte'
  import { t } from '../locale.svelte'
  import { game, driveTo, hold, backToStories } from '../game.svelte'
  import PlayShell from '../PlayShell.svelte'
  import WatchBody from '../WatchBody.svelte'
  import EndScreen from '../EndScreen.svelte'
  import {
    GENE_BASELINE, GENE_A_LOW, GENE_C_HIGH, GENE_FINALE_OK, GENE_FINALE_WARN,
    GENE_BODIES, GENE_BINS, GENE_PK_CURVES, GENE_TREAT_A, GENE_TREAT_C, GENE_CABINET,
    genePredictGrade, geneProGrade, type GeneBin, type GeneOption,
  } from '../stories/gene'
  import { stars, type Outcome } from '../flow'

  type Beat = 'briefing' | 'pour' | 'scanner' | 'mechanism' | 'treatA' | 'treatC' | 'finale' | 'won' | 'outcome'
  type PourSub = 'bet' | 'ready' | 'pouring' | 'read' | 'swap'
  let beat = $state<Beat>('briefing')
  let outcome = $state<Outcome>('win')
  let pumping = $state(false)

  // predict-then-pour
  let pourIdx = $state(0)
  let pourSub = $state<PourSub>('bet')
  let bets = $state<Record<string, GeneBin | undefined>>({})
  let showFact = $state(false) // dykC during C's long pour

  // scanner
  let revealed = $state(false)

  // treat A / C
  let aChosen = $state<GeneOption | null>(null)
  let aMsg = $state<string | null>(null)
  let cGiven = $state(false)
  let cChosen = $state<GeneOption | null>(null)
  let cMsg = $state<string | null>(null)
  let resolved = $state(false)

  // finale
  let selectedCard = $state<string | null>(null)
  let applied = $state<Record<string, string | undefined>>({})
  let finaleMsg = $state<string | null>(null)

  let stumbles = $state(0)

  let body = $derived(GENE_BODIES[pourIdx])
  let aOptions = $derived(GENE_TREAT_A.filter((o) => game.ageGroup === 'adult' || !o.adultOnly))
  let cOptions = $derived(GENE_TREAT_C.filter((o) => game.ageGroup === 'adult' || !o.adultOnly))
  let cabinet = $derived(GENE_CABINET.filter((o) => game.ageGroup === 'adult' || !o.adultOnly))
  let betMisses = $derived(GENE_BODIES.filter((b) => bets[b.id] && bets[b.id] !== b.truth).length)
  let clever = $derived(genePredictGrade(betMisses))
  let pro = $derived(geneProGrade(stumbles))
  let starCount = $derived(stars(outcome === 'win', clever, pro))
  let finaleDone = $derived(!!applied.A && !!applied.C)
  let stepNum = $derived(
    beat === 'briefing' ? 1
    : beat === 'pour' ? pourIdx + 2
    : beat === 'scanner' ? 5
    : ['mechanism', 'treatA'].includes(beat) ? 6
    : 7,
  )

  onMount(() => drive(GENE_BASELINE, 8)) // guaranteed low rest before the first bet

  function drive(target: number, rate: number, then: () => void = () => {}) {
    pumping = true
    driveTo(target, rate, () => { pumping = false; then() })
  }

  // manual over-trip during treatC (the live too-much-morphine moves cross 80)
  $effect(() => {
    if (beat !== 'treatC' || !cChosen || cChosen.result !== 'over' || resolved) return
    const lv = game.level?.level
    if (lv !== undefined && lv >= 80) { resolved = true; outcome = 'over'; beat = 'outcome' }
  })

  // ── predict-then-pour ──
  function placeBet(bin: GeneBin) {
    if (pumping) return
    bets = { ...bets, [body.id]: bin }
    pourSub = 'ready'
  }
  function pourPill() {
    if (pumping) return
    showFact = pourIdx === 2
    pourSub = 'pouring'
    drive(body.pour, 4, () => (pourSub = 'read'))
  }
  function pourNext() {
    if (pumping) return
    if (pourIdx < 2) {
      pourSub = 'swap'
      drive(GENE_BASELINE, 8, () => { pourIdx += 1; pourSub = 'bet' })
    } else {
      drive(GENE_BASELINE, 8, () => (beat = 'scanner'))
    }
  }

  // ── mechanism → treat A (drive into the „zu tief" start) ──
  function mechNext() {
    if (pumping) return
    drive(GENE_A_LOW, 8, () => (beat = 'treatA'))
  }

  // ── treat A (Poor Metabolizer) ──
  function pickA(o: GeneOption) {
    if (pumping) return
    if (o.result === 'retry') { stumbles += 1; aMsg = o.feedbackKey; return }
    aChosen = o; aMsg = o.feedbackKey
    if (o.result === 'win') {
      drive(62, 4, () => { beat = 'treatC'; cGiven = false; drive(GENE_BASELINE, 8) })
    } else if (o.target !== undefined) {
      drive(o.target, 4, () => { outcome = 'under'; beat = 'outcome' }) // dead still at 46 → under
    } else {
      pumping = true
      hold(1400, () => { pumping = false; outcome = 'under'; beat = 'outcome' })
    }
  }

  // ── treat C (Ultra-rapid, live) ──
  function giveC() {
    if (pumping || cGiven) return
    cGiven = true
    drive(GENE_C_HIGH, 4) // 40 → 78 live rise (the twist forms in front of the player)
  }
  function pickC(o: GeneOption) {
    if (pumping) return
    if (o.result === 'retry') { stumbles += 1; cMsg = o.feedbackKey; return }
    cChosen = o; cMsg = o.feedbackKey; resolved = false
    if (o.result === 'win') {
      drive(62, 4, () => { if (!resolved) { resolved = true; beat = 'finale' } })
    } else {
      drive(o.target!, 4, () => { if (!resolved) { resolved = true; outcome = 'over'; beat = 'outcome' } })
    }
  }

  // ── finale cabinet ──
  function selectCard(id: string) { if (!pumping) selectedCard = id }
  function applyTo(patient: 'A' | 'C') {
    if (pumping || !selectedCard || applied[patient]) return
    const card = GENE_CABINET.find((c) => c.id === selectedCard)!
    if (card.safe) {
      applied = { ...applied, [patient]: selectedCard }
      finaleMsg = 'gene.finale.good'
      selectedCard = null
    } else {
      stumbles += 1
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
      {#key beat + pourIdx + pourSub}
        <div class="beat">
          {#if beat === 'briefing'}
            <div class="scene">
              <span class="pl-emoji">🦷</span>
              <div class="kids">😀 😀 😀</div>
              <h1 class="pl-h1">{t('gene.brief.patient')}</h1>
              <p class="pl-lead">{t('gene.brief.goal')}</p>
              <div class="actions">
                <button class="pl-action" disabled={pumping} onclick={() => { beat = 'pour'; pourIdx = 0; pourSub = 'bet' }}>{t('gene.brief.go')}</button>
              </div>
            </div>

          {:else if beat === 'pour'}
            <div class="scene wide">
              <div class="bodycard"><span class="bigemoji">🧒</span><b>{t(body.nameKey)}</b><span class="badge q">?</span></div>
              {#if pourSub === 'bet'}
                <h2 class="pl-h2">{t('gene.pour.bet')}</h2>
                <div class="binrow">
                  {#each GENE_BINS as bin}
                    <button class="pl-opt bin" disabled={pumping} onclick={() => placeBet(bin)}>{t(`gene.bin.${bin}`)}</button>
                  {/each}
                </div>
              {:else if pourSub === 'ready'}
                <p class="pl-body">{t('gene.bin.' + bets[body.id])} — {t('gene.pour.bet')}</p>
                <div class="actions">
                  <button class="pl-action" disabled={pumping} onclick={pourPill}>{t('gene.pour.drop')}</button>
                </div>
              {:else if pourSub === 'pouring'}
                <WatchBody text={t('gene.pour.watch')} tone="watch" />
                {#if showFact}
                  <div class="factcard pl-card"><span class="factkick">{t('gene.pour.dykC').startsWith('Wusstest') ? '' : ''}</span><p>{t('gene.pour.dykC')}</p></div>
                {/if}
              {:else if pourSub === 'read'}
                <WatchBody text={t(body.pourReadKey)} tone={body.truth === 'high' ? 'rising' : body.truth === 'mid' ? 'good' : 'still'} />
                <p class="chip {bets[body.id] === body.truth ? 'pl-good' : 'pl-warn'}">{bets[body.id] === body.truth ? t('gene.pour.hit') : t('gene.pour.miss')}</p>
                <div class="actions">
                  <button class="pl-action" disabled={pumping} onclick={pourNext}>{t('gene.pour.next')}</button>
                </div>
              {:else if pourSub === 'swap'}
                <WatchBody text={t('gene.pour.swap')} tone="falling" />
              {/if}
            </div>

          {:else if beat === 'scanner'}
            <div class="task">
              <h2 class="pl-h2 center">{t('gene.scan.prompt')}</h2>
              <div class="bodies">
                {#each GENE_BODIES as b}
                  <div class="bodycard small"><span class="bigemoji">🧒</span><b>{t(b.nameKey)}</b>
                    <span class="badge" class:on={revealed}>{revealed ? t(b.badgeKey) : '?'}</span>
                  </div>
                {/each}
              </div>
              {#if revealed}
                <div class="curvewrap pl-card">
                  <div class="curvehead"><b>{t('gene.scan.curveTitle')}</b><span>{t('gene.scan.curveSub')}</span></div>
                  <svg class="pkchart" viewBox="0 0 360 180" aria-hidden="true">
                    <rect x="8" y="56" width="344" height="40" class="pkband" />
                    <text x="13" y="50" class="pklabel">grüner Bereich</text>
                    {#each GENE_PK_CURVES as cv}
                      <path d={cv.d} class="pkcurve c{cv.id}" />
                    {/each}
                  </svg>
                  <div class="legend">
                    <span class="lg cA">🐢 {t('gene.scan.A').split(':')[0]}</span>
                    <span class="lg cB">✅ {t('gene.scan.B').split(':')[0]}</span>
                    <span class="lg cC">🚀 {t('gene.scan.C').split(':')[0]}</span>
                  </div>
                </div>
                <div class="actions">
                  <button class="pl-action" onclick={() => (beat = 'mechanism')}>{t('gene.scan.next')}</button>
                </div>
              {:else}
                <div class="actions">
                  <button class="pl-action" onclick={() => (revealed = true)}>{t('gene.scan.all')}</button>
                </div>
              {/if}
            </div>

          {:else if beat === 'mechanism'}
            <div class="scene wide">
              <h2 class="pl-h2">{t('gene.mech.prompt')}</h2>
              <div class="mechcards">
                <div class="mechcard turbo"><b>🚀 {t('gene.body.C')}</b><p>{t('gene.mech.C')}</p></div>
                <div class="mechcard"><b>🐢 {t('gene.body.A')}</b><p>{t('gene.mech.A')}</p></div>
                <div class="mechcard"><b>✅ {t('gene.body.B')}</b><p>{t('gene.mech.B')}</p></div>
              </div>
              <div class="actions">
                <button class="pl-action" disabled={pumping} onclick={mechNext}>{t('gene.mech.next')}</button>
              </div>
            </div>

          {:else if beat === 'treatA'}
            <div class="task">
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
              {#if !cGiven}
                <h2 class="pl-h2 center">{t('gene.treatC.intro')}</h2>
                <div class="actions">
                  <button class="pl-action" disabled={pumping} onclick={giveC}>{t('gene.treatC.give')}</button>
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
                <WatchBody text={t(cMsg ?? 'gene.treatC.fb.switch')} tone={cChosen.result === 'win' ? 'falling' : 'rising'} />
                {#if cChosen.result !== 'win'}<p class="fb pl-bad">{t(cChosen.feedbackKey)}</p>{/if}
              {/if}
            </div>

          {:else if beat === 'finale'}
            <div class="task">
              <h2 class="pl-h2 center">{t('gene.finale.prompt')}</h2>
              <div class="slots">
                {#each [['A', 'gene.body.A'], ['C', 'gene.body.C']] as [pid, nameKey]}
                  <button class="slot" class:done={applied[pid]} disabled={pumping || !!applied[pid]} onclick={() => applyTo(pid as 'A' | 'C')}>
                    <span class="bigemoji">🧒</span><b>{t(nameKey)}</b>
                    <small>{applied[pid] ? t('gene.finale.applied') : t('gene.finale.pickFor')}</small>
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
                  <button class="pl-action" disabled={pumping} onclick={() => (beat = 'won')}>{t('gene.finale.next')}</button>
                </div>
              {/if}
            </div>

          {:else if beat === 'won'}
            <div class="scene">
              <h2 class="pl-h2 pl-good">{t('gene.won.title')}</h2>
              <p class="pl-lead">{t('gene.won.peek')}</p>
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
  .kids { font-size: 40px; letter-spacing: 8px; }

  .factcard { max-width: 680px; text-align: center; animation: factin 0.4s ease both; }
  .factcard p { font-size: var(--fs-lead); line-height: 1.45; }

  .bodycard { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: var(--sp-3) var(--sp-5); border: 2px solid color-mix(in srgb, var(--story) 50%, transparent); border-radius: var(--r-card); background: color-mix(in srgb, var(--story) 12%, var(--surface)); }
  .bodycard.small { padding: var(--sp-2) var(--sp-3); }
  .bigemoji { font-size: 54px; line-height: 1; }
  .bodycard b { font-size: var(--fs-h2); font-weight: 800; }
  .badge { font-size: var(--fs-small); font-weight: 800; color: var(--dim); padding: 4px 12px; border-radius: var(--r-pill); border: 1px solid var(--border); }
  .badge.q { font-size: var(--fs-h2); }
  .badge.on { color: var(--text); border-color: color-mix(in srgb, var(--story) 60%, transparent); }

  .binrow { display: flex; gap: var(--sp-2); flex-wrap: wrap; justify-content: center; }
  .bin { min-width: 200px; text-align: center; font-size: var(--fs-lead); }
  .optcol { display: flex; flex-direction: column; gap: var(--sp-2); width: 100%; max-width: 720px; }
  .chip { font-size: var(--fs-lead); font-weight: 800; }

  .bodies { display: flex; gap: var(--sp-3); flex-wrap: wrap; justify-content: center; }

  .curvewrap { width: 100%; max-width: 640px; display: flex; flex-direction: column; gap: var(--sp-2); }
  .curvehead { text-align: center; }
  .curvehead b { font-size: var(--fs-lead); font-weight: 800; display: block; }
  .curvehead span { font-size: var(--fs-small); color: var(--dim); }
  .pkchart { width: 100%; height: auto; background: rgba(255, 255, 255, 0.03); border-radius: var(--r-card); }
  .pkband { fill: color-mix(in srgb, var(--green) 22%, transparent); }
  .pklabel { fill: var(--green); font-size: 11px; font-weight: 800; }
  .pkcurve { fill: none; stroke-width: 3; }
  .pkcurve.cA { stroke: var(--grape); }
  .pkcurve.cB { stroke: var(--green); }
  .pkcurve.cC { stroke: var(--toxic); }
  .legend { display: flex; gap: var(--sp-3); justify-content: center; flex-wrap: wrap; font-size: var(--fs-micro); font-weight: 800; }
  .lg.cA { color: var(--grape); }
  .lg.cB { color: var(--green); }
  .lg.cC { color: var(--toxic); }

  .mechcards { display: flex; flex-direction: column; gap: var(--sp-2); width: 100%; max-width: 860px; }
  .mechcard { display: flex; flex-direction: column; gap: 4px; padding: var(--sp-3); border: 1.5px solid var(--border); border-radius: var(--r-card); background: var(--surface); text-align: start; }
  .mechcard.turbo { border-color: color-mix(in srgb, var(--toxic) 55%, transparent); background: color-mix(in srgb, var(--toxic) 10%, var(--surface)); }
  .mechcard b { font-size: var(--fs-lead); font-weight: 800; }
  .mechcard p { font-size: var(--fs-body); color: var(--text); line-height: 1.35; }

  .slots { display: flex; gap: var(--sp-3); justify-content: center; }
  .slot { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 180px; min-height: 130px; padding: var(--sp-3); border: 2px dashed var(--border); border-radius: var(--r-card); background: var(--surface); color: var(--text); }
  .slot.done { border-style: solid; border-color: var(--green); background: color-mix(in srgb, var(--green) 12%, var(--surface)); }
  .slot b { font-size: var(--fs-body); font-weight: 800; }
  .slot small { font-size: var(--fs-micro); font-weight: 800; color: var(--dim); text-transform: uppercase; letter-spacing: 0.5px; }
  .cabinet { display: flex; gap: var(--sp-2); flex-wrap: wrap; justify-content: center; max-width: 860px; }
  .card { padding: 14px 22px; border: 1.5px solid var(--border); border-radius: var(--r-pill); background: var(--surface); color: var(--text); font-size: var(--fs-body); font-weight: 800; }
  .card.sel { border-color: var(--spm-cyan); box-shadow: 0 0 0 2px var(--spm-cyan); }
  .card:active:not(:disabled) { transform: scale(0.97); }

  @keyframes beatin { from { opacity: 0; transform: translateY(18px); } }
  @keyframes factin { from { opacity: 0; transform: translateY(8px); } }
  @media (prefers-reduced-motion: reduce) { .beat, .factcard { animation: none; } }
</style>
