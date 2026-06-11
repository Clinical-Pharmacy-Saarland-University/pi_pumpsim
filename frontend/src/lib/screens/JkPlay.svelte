<script lang="ts">
  // Self-contained v2 story „Das pflanzliche Leck" (Induktion · Johanniskraut × Ciclosporin).
  // Blueprint screen on <PlayShell/> + the .pl-* kit. Signature mechanic: READ-A-DELAYED-LEAK &
  // BACK-DATE — investigate a FIXED week (history, not authored), read the delayed downward leak
  // on the body, and blame the QUIET day the tea started (Dienstag = a true no-move) rather than
  // the day the water visibly crashed; then stop the leak live before the Schutz-Spiegel falls
  // under the green window. DOWN ONLY — no overdose path. No on-screen meter/chart. The finale
  // loss is a component $effect (auto-trip is engine-gated to PLAY_PHASES, which play2 is not).
  import { onMount } from 'svelte'
  import { t } from '../locale.svelte'
  import { game, driveTo, backToStories } from '../game.svelte'
  import PlayShell from '../PlayShell.svelte'
  import WatchBody from '../WatchBody.svelte'
  import EndScreen from '../EndScreen.svelte'
  import {
    JK_BASELINE, JK_DOSE, JK_READ_LEVEL, JK_FINALE_START, JK_FLOOR, JK_DRAIN_TARGET,
    JK_TICK_DELAY, JK_TICK_PENALTY, JK_BAIT_BURST, JK_FACTS, JK_WEEK_DAYS, JK_FINALE_ACTIONS,
    JK_CAUSE_DAY, JK_MECH_CANDIDATES, jkArmsRescue, jkClever, jkPro,
    type JkWeekCard, type JkFinaleAction,
  } from '../stories/johanniskraut'
  import { stars } from '../flow'

  type Beat = 'briefing' | 'dosing' | 'doseReveal' | 'week' | 'label' | 'read' | 'mechanism' | 'finale' | 'outcome'
  let beat = $state<Beat>('briefing')
  let outcome = $state<'win' | 'under'>('win')
  let pumping = $state(false)

  // dose-fill rotation
  let factIdx = $state(0)
  let fillDone = $state(false)
  let factShownAt = 0
  const FACT_MS = 4500
  const FACT_MIN_MS = 3800

  // week investigation
  let dayIdx = $state(0)
  let akte = $state<Set<string>>(new Set())
  let herbTaken = $state(0)
  let falseFlags = $state(0)
  let leakActive = $state(false)
  let weekFb = $state('jk.week.watch')
  let weekTone = $state<'watch' | 'still' | 'falling'>('watch')

  // label magnifier
  let revealed = $state(false)

  // read-the-body + mechanism
  let readStumbled = $state(false)
  let mechStumbled = $state(false)
  let mechRight = $state(false)
  let mechFb = $state<string | null>(null)
  let readCost = $state(false)

  // finale
  let applied = $state<Set<string>>(new Set())
  let baitCount = $state(0)
  let monitorStopped = $state(false)
  let minLevel = $state(JK_FINALE_START)
  let resolved = $state(false)
  let rescuing = $state(false)
  let finaleFb = $state<string | null>(null)

  let day = $derived(JK_WEEK_DAYS[dayIdx])
  let isLastDay = $derived(dayIdx >= JK_WEEK_DAYS.length - 1)
  let mandatoryDone = $derived(JK_FINALE_ACTIONS.filter((a) => a.kind === 'mandatory' && applied.has(a.id)).length)
  let needBoth = $derived(mandatoryDone === 1 && !rescuing)
  let clever = $derived(jkClever(herbTaken, falseFlags, !readStumbled, !mechStumbled))
  let pro = $derived(jkPro(monitorStopped, baitCount, minLevel))
  let starCount = $derived(stars(outcome === 'win', clever, pro))
  let stepNum = $derived(
    ['briefing', 'dosing', 'doseReveal'].includes(beat) ? 1
    : beat === 'week' ? 2
    : beat === 'label' ? 3
    : beat === 'read' ? 4
    : beat === 'mechanism' ? 5
    : 6,
  )

  onMount(() => drive(JK_BASELINE, 8)) // prime ungeschützt, below the band

  function drive(target: number, rate: number, then: () => void = () => {}) {
    pumping = true
    driveTo(target, rate, () => { pumping = false; then() })
  }

  // rotate the dose-fill facts during the tutorial fill (40→62)
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

  // finale: the live leak — track minLevel + trip the under-loss at the floor
  $effect(() => {
    if (beat !== 'finale' || resolved || rescuing) return
    const lv = game.level?.level
    if (lv === undefined) return
    if (lv < minLevel) minLevel = lv
    if (lv <= JK_FLOOR) { resolved = true; outcome = 'under'; beat = 'outcome' }
  })

  function giveDose() {
    if (pumping) return
    fillDone = false
    beat = 'dosing'
    drive(JK_DOSE, 7, () => (fillDone = true)) // 40 → 62
  }

  // ── week ──
  function takeCard(card: JkWeekCard) {
    if (pumping || akte.has(card.id)) return
    akte = new Set(akte).add(card.id)
    if (card.kind === 'herb') {
      herbTaken += 1
      leakActive = true
      if (day.inducerTick === JK_TICK_DELAY) {
        weekFb = 'jk.week.delay'; weekTone = 'still' // Dienstag = the twist: in the Akte, no move
      } else {
        weekFb = 'jk.week.culprit'; weekTone = 'falling'
        drive(day.level, 2.5) // a visible downward tick — the Täter
      }
    } else if (card.kind === 'known') {
      weekFb = 'jk.week.known'; weekTone = 'still'
    } else {
      falseFlags += 1
      weekFb = 'jk.week.innocent'; weekTone = 'still'
    }
  }
  function nextDay() {
    if (pumping) return
    if (isLastDay) { beat = 'label'; return }
    const next = dayIdx + 1
    dayIdx = next
    weekFb = 'jk.week.watch'; weekTone = 'watch'
    const hasHerb = JK_WEEK_DAYS[next].cards.some((c) => c.kind === 'herb')
    if (leakActive && !hasHerb) drive(JK_WEEK_DAYS[next].level, 0.9) // accumulated drift between visits
  }

  // ── label → read ──
  function labelNext() {
    if (pumping) return
    drive(JK_READ_LEVEL, 2.5, () => (beat = 'read')) // settle at the now-subtherapeutic trough
  }

  function readObserve() {
    if (pumping) return
    readStumbled = true
    readCost = true
    const cur = game.level?.level ?? JK_READ_LEVEL
    drive(Math.max(JK_FLOOR + 1, cur - JK_TICK_PENALTY), 2.5) // waiting costs protection
  }
  function readAct() {
    if (pumping) return
    beat = 'mechanism'
  }

  function pickDay(id: string) {
    if (pumping || mechRight) return
    if (id === JK_CAUSE_DAY) {
      mechRight = true
      mechFb = 'jk.mech.right'
    } else {
      mechStumbled = true
      mechFb = 'jk.mech.late'
      const cur = game.level?.level ?? JK_READ_LEVEL
      drive(Math.max(JK_FLOOR + 1, cur - JK_TICK_PENALTY), 2.5)
    }
  }
  function toFinale() {
    if (pumping) return
    beat = 'finale'; resolved = false; minLevel = JK_FINALE_START
    driveTo(JK_DRAIN_TARGET, 0.7, () => {}) // raw — the slow live fall; action buttons stay enabled
  }

  // ── finale ──
  function applyAction(a: JkFinaleAction) {
    if (resolved || rescuing) return
    if (a.kind === 'bait') {
      baitCount += 1
      finaleFb = a.feedbackKey
      const cur = game.level?.level ?? JK_FINALE_START
      const burst = Math.max(JK_DRAIN_TARGET, cur - JK_BAIT_BURST)
      driveTo(burst, 4, () => { if (!resolved && !rescuing) driveTo(JK_DRAIN_TARGET, 0.7, () => {}) })
      return
    }
    if (applied.has(a.id)) return
    applied = new Set(applied).add(a.id)
    finaleFb = a.feedbackKey
    if (a.kind === 'bonus') monitorStopped = true
    if (jkArmsRescue([...applied])) {
      rescuing = true
      driveTo(JK_DOSE, 5, () => { if (!resolved) { resolved = true; outcome = 'win'; beat = 'outcome' } }) // rescue rise into green
    }
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
      total={6}
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
                <button class="pl-action" onclick={() => (beat = 'week')}>{t('jk.dose.next')}</button>
              </div>
            </div>

          {:else if beat === 'week'}
            <div class="task">
              <div class="daystrip">
                {#each JK_WEEK_DAYS as d, i}
                  <span class="daycell" class:now={i === dayIdx} class:past={i < dayIdx}>{t(d.shortKey)}</span>
                {/each}
              </div>
              <div class="today">
                <h2 class="pl-h2">{t(day.titleKey)}</h2>
                <p class="pl-body note">{t(day.noteKey)}</p>
                <div class="cards">
                  {#each day.cards as card}
                    <button class="weekcard" class:taken={akte.has(card.id)} disabled={pumping || akte.has(card.id)} onclick={() => takeCard(card)}>
                      <span class="wicon">{card.icon}</span>
                      <b>{t(card.labelKey)}</b>
                      <small>{akte.has(card.id) ? t('jk.week.taken') : t('jk.week.take')}</small>
                    </button>
                  {/each}
                </div>
              </div>
              <WatchBody text={t(weekFb)} tone={weekTone} />
              <div class="actions">
                <button class="pl-action" disabled={pumping} onclick={nextDay}>{t(isLastDay ? 'jk.week.last' : 'jk.week.next')}</button>
              </div>
            </div>

          {:else if beat === 'label'}
            <div class="scene">
              <h2 class="pl-h2">{t('jk.label.prompt')}</h2>
              <div class="bottle" class:revealed>
                <span class="bicon">🍵</span>
                <span class="front">{t('jk.label.front')}</span>
                <span class="back">{t('jk.label.back')}</span>
              </div>
              {#if !revealed}
                <div class="actions">
                  <button class="pl-action" onclick={() => (revealed = true)}>{t('jk.label.btn')}</button>
                </div>
              {:else}
                <WatchBody text={t('jk.label.wait')} tone="still" />
                <div class="actions">
                  <button class="pl-action" onclick={labelNext}>{t('jk.label.next')}</button>
                </div>
              {/if}
            </div>

          {:else if beat === 'read'}
            <div class="task">
              <h2 class="pl-h2 center">{t(readCost ? 'jk.read.cost' : 'jk.read.prompt')}</h2>
              <div class="optcol">
                <button class="pl-opt" disabled={pumping} onclick={readObserve}>{t('jk.read.observe')}</button>
                <button class="pl-opt" disabled={pumping} onclick={readAct}>{t('jk.read.act')}</button>
              </div>
              <WatchBody text={t('jk.read.watch')} tone={readCost ? 'falling' : 'watch'} />
            </div>

          {:else if beat === 'mechanism'}
            <div class="task">
              <h2 class="pl-h2 center">{t('jk.mech.prompt')}</h2>
              <p class="pl-body gloss">{t('jk.mech.gloss')}</p>
              <div class="daystrip pick">
                {#each JK_WEEK_DAYS as d}
                  {@const cand = JK_MECH_CANDIDATES.includes(d.id)}
                  <button
                    class="daycell btn"
                    class:inert={!cand}
                    class:picked={mechRight && d.id === JK_CAUSE_DAY}
                    disabled={pumping || !cand || mechRight}
                    onclick={() => pickDay(d.id)}
                  >{t(d.shortKey)}</button>
                {/each}
              </div>
              {#if mechFb}<p class="fb {mechRight ? 'pl-good' : 'pl-warn'}">{t(mechFb)}</p>{/if}
              {#if mechRight}
                <div class="actions">
                  <button class="pl-action" disabled={pumping} onclick={toFinale}>{t('jk.mech.next')}</button>
                </div>
              {/if}
            </div>

          {:else if beat === 'finale'}
            <div class="task">
              <h2 class="pl-h2 center">{t('jk.finale.prompt')}</h2>
              <WatchBody text={rescuing ? t('jk.finale.rescue') : t('jk.finale.sub')} tone={rescuing ? 'good' : 'falling'} />
              <div class="optcol">
                {#each JK_FINALE_ACTIONS as a}
                  <button class="pl-opt" class:done={applied.has(a.id)} disabled={resolved || rescuing || applied.has(a.id)} onclick={() => applyAction(a)}>{t(a.labelKey)}</button>
                {/each}
              </div>
              {#if needBoth}<p class="fb pl-warn">{t('jk.fb.needBoth')}</p>{:else if finaleFb}<p class="fb {applied.size && !baitCount ? 'pl-good' : 'pl-warn'}">{t(finaleFb)}</p>{/if}
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
  .note { color: var(--dim); text-align: center; }
  .gloss { color: var(--dim); max-width: 760px; text-align: center; }

  .factcard { max-width: 680px; text-align: center; animation: factin 0.4s ease both; }
  .factcard .factkick { display: inline-block; font-size: var(--fs-micro); font-weight: 900; letter-spacing: 1px; text-transform: uppercase; color: var(--spm-cyan-bright); margin-bottom: var(--sp-1); }
  .factcard p { font-size: var(--fs-lead); line-height: 1.45; }
  .reveal { font-size: var(--fs-display); font-weight: 900; line-height: 1.05; text-shadow: 0 0 26px color-mix(in srgb, var(--green) 35%, transparent); }

  /* flat week day strip — labels only, NO height/fill encoding (read-only history) */
  .daystrip { display: flex; gap: var(--sp-2); justify-content: center; flex-wrap: wrap; }
  .daycell { min-width: 56px; padding: 10px 14px; border-radius: var(--r-pill); border: 1.5px solid var(--border); background: var(--surface); font-size: var(--fs-body); font-weight: 800; color: var(--dim); text-align: center; }
  .daycell.now { color: var(--text); border-color: color-mix(in srgb, var(--story) 65%, transparent); box-shadow: 0 0 14px color-mix(in srgb, var(--story) 30%, transparent); }
  .daycell.past { opacity: 0.45; }
  .daystrip.pick .daycell.btn { color: var(--text); }
  .daycell.btn:active:not(:disabled) { transform: scale(0.95); }
  .daycell.inert { opacity: 0.3; }
  .daycell.picked { border-color: var(--green); background: color-mix(in srgb, var(--green) 16%, var(--surface)); color: var(--text); }

  .today { display: flex; flex-direction: column; align-items: center; gap: var(--sp-2); width: 100%; }
  .cards { display: flex; gap: var(--sp-2); justify-content: center; flex-wrap: wrap; }
  .weekcard { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 170px; min-height: 120px; padding: var(--sp-3); border: 1.5px solid var(--border); border-radius: var(--r-card); background: var(--surface); color: var(--text); transition: transform 0.1s ease, border-color 0.2s ease; }
  .weekcard:active:not(:disabled) { transform: scale(0.96); border-color: color-mix(in srgb, var(--story) 60%, transparent); }
  .weekcard .wicon { font-size: 40px; }
  .weekcard b { font-size: var(--fs-body); font-weight: 800; }
  .weekcard small { font-size: var(--fs-micro); font-weight: 800; color: var(--dim); text-transform: uppercase; letter-spacing: 0.5px; }
  .weekcard.taken { border-color: var(--story); opacity: 0.8; }

  .optcol { display: flex; flex-direction: column; gap: var(--sp-2); width: 100%; max-width: 720px; }
  .pl-opt.done { border-color: var(--green); background: color-mix(in srgb, var(--green) 12%, var(--surface)); }

  /* Etikett-Lupe — same Stimmungstee object, press to reveal the back label */
  .bottle { position: relative; display: flex; flex-direction: column; align-items: center; gap: var(--sp-1); padding: var(--sp-4) var(--sp-6); border: 2px solid color-mix(in srgb, var(--story) 55%, transparent); border-radius: var(--r-card); background: color-mix(in srgb, var(--story) 12%, var(--surface)); min-width: 320px; }
  .bottle .bicon { font-size: 60px; }
  .bottle .front { font-size: var(--fs-lead); font-weight: 700; color: var(--text); transition: opacity 0.3s ease; }
  .bottle .back { position: absolute; bottom: var(--sp-4); font-size: var(--fs-lead); font-weight: 900; color: var(--story); opacity: 0; transform: scale(0.9); transition: opacity 0.3s ease, transform 0.3s ease; }
  .bottle.revealed .front { opacity: 0.15; }
  .bottle.revealed .back { opacity: 1; transform: scale(1); }

  @keyframes beatin { from { opacity: 0; transform: translateY(18px); } }
  @keyframes factin { from { opacity: 0; transform: translateY(8px); } }
  @media (prefers-reduced-motion: reduce) { .beat, .factcard { animation: none; } }
</style>
