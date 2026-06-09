<script lang="ts">
  // Self-contained v2 story „Der Funken-Plan" (DDI). Owns its own beat flow; shares
  // the level/torso via driveTo() + game.level. Pure logic lives in stories/ddi.ts.
  import { onMount } from 'svelte'
  import { t } from '../locale.svelte'
  import { game, driveTo, retry, backToStories } from '../game.svelte'
  import Backdrop from '../Backdrop.svelte'
  import StarRating from '../StarRating.svelte'
  import PairLink from '../PairLink.svelte'
  import {
    DDI_CARDS, DDI_OPTIONS, DDI_FINALE, DDI_START, ddiFinaleCorrect, type DdiOption,
  } from '../stories/ddi'
  import { stars as starsFor, type Outcome } from '../flow'

  type Beat = 'briefing' | 'plan' | 'newrx' | 'pair' | 'mechanism' | 'decision' | 'decided' | 'moving' | 'finale' | 'outcome'
  let beat = $state<Beat>('briefing')
  let chosen = $state<DdiOption | null>(null)
  let pairFirstTry = $state(false)
  let finalePerfect = $state(false)

  // finale bin-sort state
  let assign = $state<Record<string, boolean | undefined>>({})
  let finaleConfirmed = $state(false)

  let options = $derived(DDI_OPTIONS.filter((o) => game.ageGroup === 'adult' || !o.adultOnly))
  let outcome = $derived<Outcome>(chosen?.result ?? 'win')
  // clever: full if paired first try, half if it took a retry. pro: the finale sort.
  let starCount = $derived(starsFor(outcome === 'win', pairFirstTry ? 1 : 0.5, finalePerfect ? 1 : 0))
  let outCls = $derived(outcome === 'win' ? 'good' : outcome === 'under' ? 'warn' : 'bad')
  let decidedCls = $derived(chosen?.result === 'win' ? 'good' : 'bad')

  onMount(() => {
    driveTo(DDI_START, 6, () => {}) // settle into the band quickly on entry
  })

  function chooseOption(o: DdiOption) {
    chosen = o
    beat = 'decided'
  }
  function afterDecided() {
    if (!chosen) return
    beat = 'moving'
    driveTo(chosen.target, 4, () => {
      beat = chosen!.result === 'win' ? 'finale' : 'outcome'
    })
  }
  function setBin(id: string, pruefen: boolean) {
    if (finaleConfirmed) return
    assign = { ...assign, [id]: pruefen }
  }
  let allAssigned = $derived(DDI_FINALE.every((it) => assign[it.id] !== undefined))
  function confirmFinale() {
    if (!allAssigned) return
    finalePerfect = ddiFinaleCorrect(assign as Record<string, boolean>)
    finaleConfirmed = true
  }
</script>

<div class="play">
  <Backdrop />
  <button class="cancel" onclick={backToStories} aria-label={t('common.back')}>✕</button>

  <div class="stage">
    <main class="content">
      {#key beat + (finaleConfirmed ? 'c' : '')}
        <div class="beat">
          {#if beat === 'briefing'}
            <div class="pill">{t('story.ddi.title')}</div>
            <h1>{t('ddi.brief.patient')}</h1>
            <p class="lead">{t('ddi.brief.goal')}</p>
            <button class="btn primary big" onclick={() => (beat = 'plan')}>{t('common.next')}</button>
          {:else if beat === 'plan'}
            <h2>{t('ddi.plan.prompt')}</h2>
            <div class="planlist">
              {#each DDI_CARDS.filter((c) => !c.isNew) as c}
                <div class="med">💊 <b>{t(c.nameKey)}</b> · <span>{t(c.roleKey)}</span></div>
              {/each}
            </div>
            <p class="ok">{t('ddi.plan.reveal')}</p>
            <button class="btn primary big" onclick={() => (beat = 'newrx')}>{t('common.next')}</button>
          {:else if beat === 'newrx'}
            <div class="emoji">🩺</div>
            <p class="lead">{t('ddi.newrx.story')}</p>
            <p class="warn">{t('ddi.newrx.reveal')}</p>
            <button class="btn primary big" onclick={() => (beat = 'pair')}>{t('common.next')}</button>
          {:else if beat === 'pair'}
            <PairLink cards={DDI_CARDS} onPaired={(first) => { pairFirstTry = first; beat = 'mechanism' }} />
          {:else if beat === 'mechanism'}
            <div class="emoji">💡</div>
            <p class="lead">{t('ddi.mech')}</p>
            <button class="btn primary big" onclick={() => (beat = 'decision')}>{t('common.next')}</button>
          {:else if beat === 'decision'}
            <h2>{t('ddi.dec.prompt')}</h2>
            <div class="opts">
              {#each options as o}
                <button class="opt" onclick={() => chooseOption(o)}>{t(o.labelKey)}</button>
              {/each}
            </div>
          {:else if beat === 'decided' && chosen}
            <div class="fb {decidedCls}">{t(chosen.feedbackKey)}</div>
            <button class="btn primary big" onclick={afterDecided}>{t('common.next')}</button>
          {:else if beat === 'moving'}
            <div class="emoji float">🩸</div>
            <div class="dots">…</div>
          {:else if beat === 'finale'}
            <h2>{t('ddi.fin.prompt')}</h2>
            <div class="bins">
              {#each DDI_FINALE as it}
                <div class="binrow" class:right={finaleConfirmed && assign[it.id] === it.check} class:wrong={finaleConfirmed && assign[it.id] !== it.check}>
                  <span class="combo">⚡ {t(it.labelKey)}</span>
                  <div class="binbtns">
                    <button class="binbtn" class:sel={assign[it.id] === false} disabled={finaleConfirmed} onclick={() => setBin(it.id, false)}>{t('ddi.fin.safe')}</button>
                    <button class="binbtn" class:sel={assign[it.id] === true} disabled={finaleConfirmed} onclick={() => setBin(it.id, true)}>{t('ddi.fin.check')}</button>
                  </div>
                </div>
              {/each}
            </div>
            {#if !finaleConfirmed}
              <button class="btn primary big" onclick={confirmFinale} disabled={!allAssigned}>{t('ddi.fin.confirm')}</button>
            {:else}
              <div class="fb {finalePerfect ? 'good' : 'bad'}">{finalePerfect ? t('ddi.fin.correct') : t('ddi.fin.wrong')}</div>
              <p class="lesson">{t('ddi.fin.lesson')}</p>
              <button class="btn primary big" onclick={() => (beat = 'outcome')}>{t('common.next')}</button>
            {/if}
          {:else if beat === 'outcome'}
            <h1 class={outCls}>{t(`ddi.out.${outcome}.title`)}</h1>
            <p class="lead">{t(`ddi.out.${outcome}.sub`)}</p>
            {#if outcome === 'win'}
              <StarRating score={starCount} />
            {/if}
            <div class="dyk">
              <span class="dlbl">{t('out.dyk')}</span>
              <p>{t('ddi.out.dyk1')}</p>
              {#if outcome === 'win'}<p class="second">{t('ddi.out.dyk2')}</p>{/if}
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
  .cancel {
    position: absolute; top: 16px; inset-inline-start: 16px; z-index: 3;
    width: 46px; height: 46px; border-radius: 50%;
    background: var(--surface); border: 1px solid var(--border); color: var(--dim);
    font-size: 18px; font-weight: 700;
  }
  .cancel:active { transform: scale(0.94); }
  .stage {
    position: relative; z-index: 1; height: 100%;
    display: grid; grid-template-columns: 1fr; align-items: center;
    padding: 28px clamp(36px, 5vw, 80px);
  }
  .content { display: flex; align-items: center; justify-content: center; min-width: 0; height: 100%; }
  .beat {
    display: flex; flex-direction: column; align-items: flex-start; gap: 18px;
    width: 100%; max-width: 760px;
    animation: beatin 0.4s cubic-bezier(0.2, 0.9, 0.3, 1) both;
  }
  .pill {
    background: var(--surface); border: 1px solid var(--border); border-radius: 999px;
    padding: 7px 18px; font-size: 14px; font-weight: 700; color: var(--spm-cyan-bright);
  }
  h1 { font-size: clamp(30px, 3.6vw, 46px); font-weight: 900; line-height: 1.1; }
  h1.good { color: var(--green); text-shadow: 0 0 24px rgba(56, 224, 160, 0.4); }
  h1.warn { color: var(--grape); }
  h1.bad { color: var(--toxic); text-shadow: 0 0 24px rgba(255, 107, 122, 0.4); }
  h2 { font-size: clamp(24px, 2.6vw, 32px); font-weight: 800; line-height: 1.2; }
  .lead { font-size: clamp(19px, 2.1vw, 26px); line-height: 1.5; }
  .ok { color: var(--green); font-size: 18px; font-weight: 700; }
  .warn { color: var(--grape); font-size: 18px; font-weight: 700; }
  .emoji { font-size: 76px; line-height: 1; }
  .emoji.float { animation: float 2s ease-in-out infinite; }
  .planlist { display: flex; flex-direction: column; gap: 8px; }
  .med { font-size: 19px; }
  .med span { color: var(--dim); }
  .opts { display: flex; flex-direction: column; gap: 12px; width: 100%; }
  .opt {
    text-align: start; background: var(--surface); border: 1.5px solid var(--border);
    border-radius: 16px; padding: 20px 26px; font-size: clamp(17px, 1.8vw, 22px); font-weight: 700;
    transition: transform 0.1s ease, border-color 0.2s ease, background 0.2s ease;
  }
  .opt:active { transform: scale(0.98); border-color: var(--spm-cyan); background: var(--surface2); }
  .fb { font-size: clamp(20px, 2.2vw, 28px); font-weight: 800; line-height: 1.4; }
  .fb.good { color: var(--green); }
  .fb.bad { color: var(--toxic); }
  .lesson { font-size: 18px; line-height: 1.5; color: var(--text); }
  .bins { display: flex; flex-direction: column; gap: 8px; width: 100%; }
  .binrow {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 10px 14px; border: 1.5px solid var(--border); border-radius: 12px; background: var(--surface);
  }
  .binrow.right { border-color: var(--green); }
  .binrow.wrong { border-color: var(--toxic); }
  .combo { font-size: 16px; font-weight: 600; }
  .binbtns { display: flex; gap: 6px; flex: none; }
  .binbtn {
    border: 1.5px solid var(--border); background: var(--surface2); border-radius: 10px;
    padding: 8px 12px; font-size: 14px; font-weight: 700; white-space: nowrap;
  }
  .binbtn.sel { border-color: var(--spm-cyan); background: rgba(0, 190, 202, 0.18); color: var(--spm-cyan-bright); }
  .dots { font-size: 56px; color: var(--dim); animation: pulsedots 1s ease-in-out infinite; }
  .dyk { max-width: 680px; background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 14px 22px; }
  .dlbl { font-size: 13px; color: var(--grape); font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; }
  .dyk p { margin-top: 6px; font-size: 17px; line-height: 1.5; }
  .dyk .second { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); color: var(--dim); }
  .actions { display: flex; gap: 12px; margin-top: 6px; }
  .btn.big { padding: 18px 44px; font-size: 22px; border-radius: 18px; }
  @keyframes beatin { from { opacity: 0; transform: translateY(20px); } }
  @keyframes float { 50% { transform: translateY(-9px); } }
  @keyframes pulsedots { 50% { opacity: 0.3; } }
  @media (prefers-reduced-motion: reduce) { .beat, .emoji.float { animation: none; } }
</style>
