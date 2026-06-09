<script lang="ts">
  // Self-contained v2 story „Die Nieren-Skala" (DOI). Unique mechanic = read the
  // eGFR gauge → set the 3-notch dose dial. Pure logic in stories/organ.ts.
  import { onMount } from 'svelte'
  import { t } from '../locale.svelte'
  import { game, driveTo, retry, backToStories } from '../game.svelte'
  import Backdrop from '../Backdrop.svelte'
  import StarRating from '../StarRating.svelte'
  import {
    ORGAN_START, ORGAN_DOSE, ORGAN_EVENT_TARGET, ORGAN_DETECT, ORGAN_NOTCHES, ORGAN_TRAP_FEEDBACK,
    ORGAN_FINALE, ORGAN_MEASURES, organFinaleCorrect, EGFR, type DialNotch, type OrganDetectItem,
  } from '../stories/organ'
  import { stars as starsFor, type Outcome } from '../flow'

  type Beat = 'briefing' | 'dose' | 'dosereveal' | 'event' | 'eventreveal' | 'detective'
    | 'mechanism' | 'dial' | 'decided' | 'moving' | 'finale' | 'outcome'
  let beat = $state<Beat>('briefing')
  let chosen = $state<DialNotch | null>(null)
  let detectiveFirstTry = $state(true)
  let trapTapped = $state(false)
  let finalePerfect = $state(false)
  let detectFb = $state<{ key: string; bad: boolean } | null>(null)
  let trapFb = $state(false)

  let notches = $derived(ORGAN_NOTCHES.filter((n) => game.ageGroup === 'adult' || !n.adultOnly))
  let outcome = $derived<Outcome>(chosen?.result ?? 'win')
  // clever: full if the cause was found first try, else half. pro: full only if no
  // trap AND a perfect finale; half if one of the two slipped; none if both did.
  let proQ = $derived((!trapTapped && finalePerfect) ? 1 : (!trapTapped || finalePerfect) ? 0.5 : 0)
  let starCount = $derived(starsFor(outcome === 'win', detectiveFirstTry ? 1 : 0.5, proQ))
  let outCls = $derived(outcome === 'win' ? 'good' : outcome === 'under' ? 'warn' : 'bad')
  let decidedCls = $derived(chosen?.result === 'win' ? 'good' : 'bad')

  // finale assignment
  let assign = $state<Record<string, string | undefined>>({})
  let finaleConfirmed = $state(false)
  let allAssigned = $derived(ORGAN_FINALE.every((r) => assign[r.id] !== undefined))

  onMount(() => driveTo(ORGAN_START, 8, () => {}))

  function giveDose() {
    beat = 'moving'
    driveTo(ORGAN_DOSE, 5, () => (beat = 'dosereveal'))
  }
  function toEventDrift() {
    beat = 'moving'
    driveTo(ORGAN_EVENT_TARGET, 4, () => (beat = 'eventreveal'))
  }
  function tapDetect(it: OrganDetectItem) {
    detectFb = { key: it.feedbackKey, bad: !it.correct }
    if (it.correct) setTimeout(() => (beat = 'mechanism'), 1100)
    else detectiveFirstTry = false
  }
  function tapNotch(n: DialNotch) {
    chosen = n
    beat = 'decided'
  }
  function tapTrap() {
    trapTapped = true
    trapFb = true
  }
  function afterDecided() {
    if (!chosen) return
    beat = 'moving'
    driveTo(chosen.target, 4, () => (beat = chosen!.result === 'win' ? 'finale' : 'outcome'))
  }
  function setMeasure(rowId: string, m: string) {
    if (finaleConfirmed) return
    assign = { ...assign, [rowId]: m }
  }
  function confirmFinale() {
    if (!allAssigned) return
    finalePerfect = organFinaleCorrect(assign as Record<string, string>)
    finaleConfirmed = true
  }
</script>

<div class="play">
  <Backdrop />
  <button class="cancel" onclick={backToStories} aria-label={t('common.back')}>✕</button>
  <div class="stage">
    <main class="content">
      {#key beat + (finaleConfirmed ? 'c' : '') + (detectFb?.key ?? '')}
        <div class="beat">
          {#if beat === 'briefing'}
            <div class="pill">{t('story.organ.title')}</div>
            <h1>{t('organ.brief.patient')}</h1>
            <p class="lead">{t('organ.brief.goal')}</p>
            <button class="btn primary big" onclick={() => (beat = 'dose')}>{t('common.next')}</button>
          {:else if beat === 'dose'}
            <div class="emoji">💊</div>
            <h2>{t('organ.dose.prompt')}</h2>
            <button class="btn primary big" onclick={giveDose}>{t('dose.give')}</button>
          {:else if beat === 'moving'}
            <div class="dots">…</div>
          {:else if beat === 'dosereveal'}
            <div class="big good">{t('reveal.in')}</div>
            <p class="lead">{t('organ.dose.reveal')}</p>
            <button class="btn primary big" onclick={() => (beat = 'event')}>{t('common.next')}</button>
          {:else if beat === 'event'}
            <div class="emoji">🧪</div>
            <p class="lead">{t('organ.event.story')}</p>
            <button class="btn primary big" onclick={toEventDrift}>{t('common.next')}</button>
          {:else if beat === 'eventreveal'}
            <div class="big bad">{t('reveal.high')}</div>
            <p class="lead">{t('organ.event.reveal')}</p>
            <button class="btn primary big" onclick={() => (beat = 'detective')}>{t('common.next')}</button>
          {:else if beat === 'detective'}
            <h2>{t('organ.det.prompt')}</h2>
            <div class="opts">
              {#each ORGAN_DETECT as it}
                <button class="opt" onclick={() => tapDetect(it)}>{t(it.labelKey)}</button>
              {/each}
            </div>
            {#if detectFb}<p class="fb {detectFb.bad ? 'bad' : 'good'}">{t(detectFb.key)}</p>{/if}
          {:else if beat === 'mechanism'}
            <div class="emoji">💡</div>
            <p class="lead">{t('organ.mech')}</p>
            <button class="btn primary big" onclick={() => (beat = 'dial')}>{t('common.next')}</button>
          {:else if beat === 'dial'}
            <h2>{t('organ.dial.prompt')}</h2>
            <div class="gauge">
              <div class="track">
                <div class="zone red"></div><div class="zone yellow"></div><div class="zone green"></div>
                <div class="needle" style="left:{(EGFR / 90) * 100}%"></div>
              </div>
              <div class="gval">eGFR {EGFR} ml/min</div>
            </div>
            <div class="dial">
              {#each notches as n}
                <button class="notch" class:hint={game.ageGroup === 'young' && n.id === 'reduced'} onclick={() => tapNotch(n)}>
                  <span class="nlabel">{t(n.labelKey)}</span>
                  <span class="nmg">{t(n.mgKey)}</span>
                </button>
              {/each}
            </div>
            <button class="trap" onclick={tapTrap}>{t('organ.trap')}</button>
            {#if trapFb}<p class="fb bad">{t(ORGAN_TRAP_FEEDBACK)}</p>{/if}
          {:else if beat === 'decided' && chosen}
            <div class="fb {decidedCls}">{t(chosen.feedbackKey)}</div>
            <button class="btn primary big" onclick={afterDecided}>{t('common.next')}</button>
          {:else if beat === 'finale'}
            <h2>{t('organ.fin.prompt')}</h2>
            <div class="bins">
              {#each ORGAN_FINALE as r}
                <div class="binrow" class:right={finaleConfirmed && assign[r.id] === r.correct} class:wrong={finaleConfirmed && assign[r.id] !== r.correct}>
                  <span class="combo">{t(r.egfrKey)}</span>
                  <div class="binbtns">
                    {#each ORGAN_MEASURES as m}
                      <button class="binbtn" class:sel={assign[r.id] === m} disabled={finaleConfirmed} onclick={() => setMeasure(r.id, m)}>{t('organ.measure.' + m)}</button>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
            {#if !finaleConfirmed}
              <button class="btn primary big" onclick={confirmFinale} disabled={!allAssigned}>{t('ddi.fin.confirm')}</button>
            {:else}
              <div class="fb {finalePerfect ? 'good' : 'bad'}">{finalePerfect ? t('organ.fin.correct') : t('organ.fin.wrong')}</div>
              <p class="lesson">{t('organ.fin.lesson')}</p>
              <button class="btn primary big" onclick={() => (beat = 'outcome')}>{t('common.next')}</button>
            {/if}
          {:else if beat === 'outcome'}
            <h1 class={outCls}>{t('organ.out.' + outcome + '.title')}</h1>
            <p class="lead">{t('organ.out.' + outcome + '.sub')}</p>
            {#if outcome === 'win'}<StarRating score={starCount} />{/if}
            <div class="dyk">
              <span class="dlbl">{t('out.dyk')}</span>
              <p>{t('organ.out.dyk1')}</p>
              {#if outcome === 'win'}<p class="second">{t('organ.out.dyk2')}</p>{/if}
            </div>
            <div class="actions">
              <button class="btn" onclick={backToStories}>← {t('stories.title')}</button>
              <button class="btn primary" onclick={retry}>{t('common.retry')}</button>
            </div>
          {/if}
        </div>
      {/key}
    </main>
  </div>
</div>

<style>
  .play { position: relative; height: 100%; overflow: hidden; }
  .cancel { position: absolute; top: 16px; inset-inline-start: 16px; z-index: 3; width: 46px; height: 46px; border-radius: 50%; background: var(--surface); border: 1px solid var(--border); color: var(--dim); font-size: 18px; font-weight: 700; }
  .stage { position: relative; z-index: 1; height: 100%; display: grid; grid-template-columns: 1fr; align-items: center; padding: 28px clamp(36px, 5vw, 80px); }
  .content { display: flex; align-items: center; justify-content: center; min-width: 0; height: 100%; }
  .beat { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; width: 100%; max-width: 760px; animation: beatin 0.4s cubic-bezier(0.2, 0.9, 0.3, 1) both; }
  .pill { background: var(--surface); border: 1px solid var(--border); border-radius: 999px; padding: 7px 18px; font-size: 14px; font-weight: 700; color: var(--spm-cyan-bright); }
  h1 { font-size: clamp(30px, 3.6vw, 46px); font-weight: 900; line-height: 1.1; }
  h1.good { color: var(--green); } h1.warn { color: var(--grape); } h1.bad { color: var(--toxic); }
  h2 { font-size: clamp(23px, 2.5vw, 31px); font-weight: 800; line-height: 1.2; }
  .lead { font-size: clamp(18px, 2vw, 25px); line-height: 1.5; }
  .big { font-size: clamp(30px, 3.4vw, 44px); font-weight: 900; }
  .big.good { color: var(--green); } .big.bad { color: var(--toxic); }
  .emoji { font-size: 72px; }
  .opts { display: flex; flex-direction: column; gap: 10px; width: 100%; }
  .opt { text-align: start; background: var(--surface); border: 1.5px solid var(--border); border-radius: 14px; padding: 16px 22px; font-size: clamp(16px, 1.7vw, 21px); font-weight: 700; }
  .opt:active { transform: scale(0.98); border-color: var(--spm-cyan); background: var(--surface2); }
  .fb { font-size: clamp(18px, 2vw, 26px); font-weight: 800; line-height: 1.4; }
  .fb.good { color: var(--green); } .fb.bad { color: var(--toxic); }
  .lesson { font-size: 18px; line-height: 1.5; }
  /* eGFR gauge */
  .gauge { width: 100%; max-width: 560px; }
  .track { position: relative; height: 26px; border-radius: 13px; overflow: hidden; display: flex; border: 1px solid var(--border); }
  .zone { height: 100%; }
  .zone.red { width: 33.33%; background: rgba(255, 107, 122, 0.55); }
  .zone.yellow { width: 16.66%; background: rgba(255, 183, 3, 0.6); }
  .zone.green { width: 50%; background: rgba(56, 224, 160, 0.5); }
  .needle { position: absolute; top: -6px; bottom: -6px; width: 4px; background: #fff; box-shadow: 0 0 8px #fff; transform: translateX(-50%); }
  .gval { margin-top: 6px; font-size: 16px; font-weight: 800; color: var(--grape); }
  /* dose dial */
  .dial { display: flex; gap: 12px; width: 100%; }
  .notch { flex: 1; display: flex; flex-direction: column; gap: 4px; padding: 16px 12px; border: 2px solid var(--border); border-radius: 16px; background: var(--surface); }
  .notch:active { transform: scale(0.97); border-color: var(--spm-cyan); }
  .notch.hint { border-color: var(--green); box-shadow: 0 0 16px rgba(56, 224, 160, 0.4); animation: pulse 1.8s ease-in-out infinite; }
  .nlabel { font-size: 18px; font-weight: 800; }
  .nmg { font-size: 13px; color: var(--dim); }
  .trap { align-self: flex-start; background: var(--surface); border: 1px dashed var(--border); border-radius: 12px; padding: 10px 16px; font-size: 15px; color: var(--dim); }
  .dots { font-size: 56px; color: var(--dim); animation: pulsedots 1s ease-in-out infinite; }
  .bins { display: flex; flex-direction: column; gap: 8px; width: 100%; }
  .binrow { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 12px; background: var(--surface); }
  .binrow.right { border-color: var(--green); } .binrow.wrong { border-color: var(--toxic); }
  .combo { font-size: 16px; font-weight: 700; }
  .binbtns { display: flex; gap: 6px; flex: none; }
  .binbtn { border: 1.5px solid var(--border); background: var(--surface2); border-radius: 10px; padding: 8px 10px; font-size: 13px; font-weight: 700; }
  .binbtn.sel { border-color: var(--spm-cyan); background: rgba(0, 190, 202, 0.18); color: var(--spm-cyan-bright); }
  .dyk { max-width: 680px; background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 14px 22px; }
  .dlbl { font-size: 13px; color: var(--grape); font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; }
  .dyk p { margin-top: 6px; font-size: 17px; line-height: 1.5; }
  .dyk .second { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); color: var(--dim); }
  .actions { display: flex; gap: 12px; margin-top: 6px; }
  .btn.big { padding: 18px 44px; font-size: 22px; border-radius: 18px; }
  @keyframes beatin { from { opacity: 0; transform: translateY(20px); } }
  @keyframes pulse { 50% { box-shadow: 0 0 26px rgba(56, 224, 160, 0.6); } }
  @keyframes pulsedots { 50% { opacity: 0.3; } }
  @media (prefers-reduced-motion: reduce) { .beat, .notch.hint { animation: none; } }
</style>
