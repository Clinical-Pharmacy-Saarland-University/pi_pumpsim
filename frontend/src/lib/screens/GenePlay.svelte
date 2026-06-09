<script lang="ts">
  // Self-contained v2 story „Drei Zwillinge, eine Pille" (DGI · Codein/CYP2D6).
  // Unique mechanic = same-dose triptych: predict each genotype's outcome (sort into
  // zu wenig / genau richtig / zu viel), then reveal all three side by side.
  import { onMount } from 'svelte'
  import { t } from '../locale.svelte'
  import { game, driveTo, retry, backToStories } from '../game.svelte'
  import Backdrop from '../Backdrop.svelte'
  import StarRating from '../StarRating.svelte'
  import { GENE_TWINS, GENE_BINS, genePredictCorrect, GENE_OPTIONS, GENE_ULTRA_LEVEL, type GeneOption } from '../stories/gene'
  import { stars as starsFor, DEFAULT_CFG, type Outcome } from '../flow'

  type Beat = 'briefing' | 'predict' | 'reveal' | 'mechanism' | 'strategy' | 'decided' | 'moving' | 'outcome'
  let beat = $state<Beat>('briefing')
  let assign = $state<Record<string, string | undefined>>({})
  let predictPerfect = $state(false)
  let chosen = $state<GeneOption | null>(null)
  let tramadolTapped = $state(false)
  let stratFb = $state<string | null>(null)

  let allAssigned = $derived(GENE_TWINS.every((tw) => assign[tw.id] !== undefined))
  let options = $derived(GENE_OPTIONS.filter((o) => game.ageGroup === 'adult' || !o.adultOnly))
  let outcome = $derived<Outcome>((chosen?.result === 'over' ? 'over' : chosen?.result === 'under' ? 'under' : 'win'))
  // clever: full for a perfect prediction, half otherwise. pro: lost if the tramadol trap was tapped.
  let starCount = $derived(starsFor(outcome === 'win', predictPerfect ? 1 : 0.5, !tramadolTapped ? 1 : 0))
  let outCls = $derived(outcome === 'win' ? 'good' : 'bad')
  let decidedCls = $derived(chosen?.result === 'win' ? 'good' : 'bad')

  const pct = (v: number) => (v / 100) * 100
  const bandTop = (100 - DEFAULT_CFG.band_high) + '%'
  const bandH = (DEFAULT_CFG.band_high - DEFAULT_CFG.band_low) + '%'
  const twinCls = (lvl: number) => (lvl >= DEFAULT_CFG.band_low && lvl <= DEFAULT_CFG.band_high ? 'in' : lvl > DEFAULT_CFG.band_high ? 'over' : 'under')

  onMount(() => driveTo(62, 8, () => {}))

  function setBin(id: string, b: string) {
    assign = { ...assign, [id]: b }
  }
  function confirmPredict() {
    if (!allAssigned) return
    predictPerfect = genePredictCorrect(assign as Record<string, string>)
    beat = 'reveal'
    driveTo(GENE_ULTRA_LEVEL, 4, () => {}) // the ultra-rapid twin is the danger
  }
  function pick(o: GeneOption) {
    if (o.result === 'retry') {
      tramadolTapped = true
      stratFb = o.feedbackKey
      return
    }
    chosen = o
    beat = 'decided'
  }
  function afterDecided() {
    if (!chosen) return
    beat = 'moving'
    driveTo(chosen.target, 4, () => (beat = 'outcome'))
  }
</script>

<div class="play">
  <Backdrop />
  <button class="cancel" onclick={backToStories} aria-label={t('common.back')}>✕</button>
  <div class="stage">
    <main class="content">
      {#key beat}
        <div class="beat">
          {#if beat === 'briefing'}
            <div class="pill">{t('story.gene.title')}</div>
            <h1>{t('gene.brief.patient')}</h1>
            <p class="lead">{t('gene.brief.goal')}</p>
            <button class="btn primary big" onclick={() => (beat = 'predict')}>{t('common.next')}</button>
          {:else if beat === 'predict'}
            <h2>{t('gene.predict.prompt')}</h2>
            <div class="twins">
              {#each GENE_TWINS as tw}
                <div class="twin">
                  <div class="face">{tw.badge}</div>
                  <div class="tname">{t(tw.nameKey)}</div>
                  <div class="binbtns">
                    {#each GENE_BINS as b}
                      <button class="binbtn" class:sel={assign[tw.id] === b} onclick={() => setBin(tw.id, b)}>{t('gene.bin.' + b)}</button>
                    {/each}
                  </div>
                </div>
              {/each}
            </div>
            <button class="btn primary big" onclick={confirmPredict} disabled={!allAssigned}>{t('gene.predict.confirm')}</button>
          {:else if beat === 'reveal'}
            <h2>{t('gene.reveal.title')}</h2>
            <div class="bars">
              {#each GENE_TWINS as tw}
                <div class="minibar {twinCls(tw.level)}">
                  <div class="bar">
                    <div class="band" style="top:{bandTop};height:{bandH}"></div>
                    <div class="fill" style="height:{pct(tw.level)}%"></div>
                  </div>
                  <div class="bface">{tw.badge}</div>
                  <div class="blabel">{t('gene.bin.' + tw.bin)}</div>
                </div>
              {/each}
            </div>
            <p class="lead">{t('gene.reveal.sub')}</p>
            <button class="btn primary big" onclick={() => (beat = 'mechanism')}>{t('common.next')}</button>
          {:else if beat === 'mechanism'}
            <div class="emoji">💡</div>
            <p class="lead">{t('gene.mech')}</p>
            <button class="btn primary big" onclick={() => (beat = 'strategy')}>{t('common.next')}</button>
          {:else if beat === 'strategy'}
            <h2>{t('gene.strat.prompt')}</h2>
            <div class="opts">
              {#each options as o}
                <button class="opt" onclick={() => pick(o)}>{t(o.labelKey)}</button>
              {/each}
            </div>
            {#if stratFb}<p class="fb bad">{t(stratFb)}</p>{/if}
          {:else if beat === 'decided' && chosen}
            <div class="fb {decidedCls}">{t(chosen.feedbackKey)}</div>
            <button class="btn primary big" onclick={afterDecided}>{t('common.next')}</button>
          {:else if beat === 'moving'}
            <div class="dots">…</div>
          {:else if beat === 'outcome'}
            <h1 class={outCls}>{t('gene.out.' + outcome + '.title')}</h1>
            <p class="lead">{t('gene.out.' + outcome + '.sub')}</p>
            {#if outcome === 'win'}<StarRating score={starCount} />{/if}
            <div class="dyk">
              <span class="dlbl">{t('out.dyk')}</span>
              <p>{t('gene.out.dyk1')}</p>
              {#if outcome === 'win'}<p class="second">{t('gene.out.dyk2')}</p>{/if}
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
  h1.good { color: var(--green); } h1.bad { color: var(--toxic); }
  h2 { font-size: clamp(23px, 2.5vw, 31px); font-weight: 800; line-height: 1.2; }
  .lead { font-size: clamp(18px, 2vw, 25px); line-height: 1.5; }
  .emoji { font-size: 72px; }
  .twins { display: flex; gap: 14px; width: 100%; }
  .twin { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 14px 10px; border: 1.5px solid var(--border); border-radius: 16px; background: var(--surface); }
  .face { font-size: 44px; }
  .tname { font-size: 14px; font-weight: 700; color: var(--dim); text-align: center; min-height: 2.6em; }
  .binbtns { display: flex; flex-direction: column; gap: 6px; width: 100%; }
  .binbtn { border: 1.5px solid var(--border); background: var(--surface2); border-radius: 10px; padding: 9px 6px; font-size: 13px; font-weight: 700; }
  .binbtn.sel { border-color: var(--spm-cyan); background: rgba(0, 190, 202, 0.18); color: var(--spm-cyan-bright); }
  .bars { display: flex; gap: 24px; width: 100%; justify-content: center; }
  .minibar { display: flex; flex-direction: column; align-items: center; gap: 6px; --c: var(--green); }
  .minibar.in { --c: var(--green); } .minibar.over { --c: var(--toxic); } .minibar.under { --c: var(--grape); }
  .bar { position: relative; width: 54px; height: 170px; border-radius: 27px; border: 2px solid var(--border); overflow: hidden; background: rgba(255,255,255,0.04); box-shadow: 0 0 18px color-mix(in srgb, var(--c) 40%, transparent); }
  .band { position: absolute; left: 0; right: 0; background: var(--green-soft); border-top: 1px dashed var(--green-line); border-bottom: 1px dashed var(--green-line); }
  .fill { position: absolute; left: 0; right: 0; bottom: 0; background: var(--c); transition: height 0.4s ease; }
  .bface { font-size: 30px; }
  .blabel { font-size: 13px; font-weight: 800; color: var(--c); }
  .opts { display: flex; flex-direction: column; gap: 10px; width: 100%; }
  .opt { text-align: start; background: var(--surface); border: 1.5px solid var(--border); border-radius: 14px; padding: 16px 22px; font-size: clamp(16px, 1.7vw, 21px); font-weight: 700; }
  .opt:active { transform: scale(0.98); border-color: var(--spm-cyan); background: var(--surface2); }
  .fb { font-size: clamp(18px, 2vw, 26px); font-weight: 800; line-height: 1.4; }
  .fb.good { color: var(--green); } .fb.bad { color: var(--toxic); }
  .dots { font-size: 56px; color: var(--dim); animation: pulsedots 1s ease-in-out infinite; }
  .dyk { max-width: 680px; background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 14px 22px; }
  .dlbl { font-size: 13px; color: var(--grape); font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; }
  .dyk p { margin-top: 6px; font-size: 17px; line-height: 1.5; }
  .dyk .second { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); color: var(--dim); }
  .actions { display: flex; gap: 12px; margin-top: 6px; }
  .btn.big { padding: 18px 44px; font-size: 22px; border-radius: 18px; }
  @keyframes beatin { from { opacity: 0; transform: translateY(20px); } }
  @keyframes pulsedots { 50% { opacity: 0.3; } }
  @media (prefers-reduced-motion: reduce) { .beat { animation: none; } }
</style>
