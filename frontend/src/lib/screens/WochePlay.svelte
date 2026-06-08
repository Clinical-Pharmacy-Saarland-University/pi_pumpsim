<script lang="ts">
  // Self-contained v2 story „Der Wochen-Pillenplan" (Adhärenz · Lamotrigin). Unique
  // mechanic = author a 7-day plan, then watch the torso saw-tooth it back. Pure logic
  // in stories/adherence.ts. The play2 phase is outside PLAY_PHASES, so we drive the
  // playback ourselves and decide the outcome from the simulated trajectory.
  import { onMount } from 'svelte'
  import { t } from '../locale.svelte'
  import { game, driveTo, retry, backToStories } from '../game.svelte'
  import Backdrop from '../Backdrop.svelte'
  import Torso from '../Torso.svelte'
  import { ADH_DAYS, ADH_START, simulateWeek, isCleanPlan, ADH_QUIZ, type WeekSim, type AdhQuizOpt } from '../stories/adherence'
  import { stars as starsFor, type Outcome } from '../flow'

  type Beat = 'briefing' | 'steady' | 'reveal' | 'event' | 'build' | 'play' | 'quiz' | 'decided' | 'outcome'
  let beat = $state<Beat>('briefing')
  let plan = $state<number[]>([0, 0, 0, 0, 0, 0, 0])
  let week = $state<WeekSim | null>(null)
  let dayIdx = $state(-1)
  let planClean = $state(false)
  let quizCorrect = $state(false)
  let quizPick = $state<AdhQuizOpt | null>(null)

  let quizOpts = $derived(ADH_QUIZ.filter((q) => game.ageGroup === 'adult' || !q.adultOnly))
  let outcome = $derived<Outcome>(week?.outcome ?? 'win')
  let starCount = $derived(starsFor(outcome === 'win', planClean, quizCorrect))
  let outCls = $derived(outcome === 'win' ? 'good' : outcome === 'under' ? 'warn' : 'bad')

  onMount(() => driveTo(ADH_START, 8, () => {}))

  function cycle(d: number) {
    const p = plan.slice()
    p[d] = (p[d] + 1) % 3
    plan = p
  }
  function giveSteady() {
    beat = 'reveal'
    driveTo(64, 3, () => driveTo(62, 3, () => {})) // a small daily pulse
  }
  function startPlay() {
    week = simulateWeek(plan)
    planClean = isCleanPlan(plan)
    beat = 'play'
    playDay(0)
  }
  function playDay(d: number) {
    const last = week!.tripIndex >= 0 ? week!.tripIndex : ADH_DAYS.length - 1
    if (d > last) {
      beat = week!.outcome === 'win' ? 'quiz' : 'outcome'
      return
    }
    dayIdx = d
    driveTo(week!.levels[d], 9, () => setTimeout(() => playDay(d + 1), 480))
  }
  function pickQuiz(q: AdhQuizOpt) {
    quizPick = q
    quizCorrect = q.correct
    beat = 'decided'
  }
  const pills = (n: number) => (n === 0 ? '—' : '💊'.repeat(n))
</script>

<div class="play">
  <Backdrop />
  <button class="cancel" onclick={backToStories} aria-label={t('common.back')}>✕</button>
  <div class="stage">
    <aside class="torso-pane">{#if game.level}<Torso s={game.level} />{/if}</aside>
    <main class="content">
      {#key beat}
        <div class="beat">
          {#if beat === 'briefing'}
            <div class="pill">{t('story.adherence.title')}</div>
            <h1>{t('adh.brief.patient')}</h1>
            <p class="lead">{t('adh.brief.goal')}</p>
            <button class="btn primary big" onclick={() => (beat = 'steady')}>{t('common.next')}</button>
          {:else if beat === 'steady'}
            <div class="emoji">💊</div>
            <h2>{t('adh.steady.prompt')}</h2>
            <button class="btn primary big" onclick={giveSteady}>{t('adh.steady.btn')}</button>
          {:else if beat === 'reveal'}
            <div class="big good">{t('reveal.in')}</div>
            <p class="lead">{t('adh.steady.reveal')}</p>
            <button class="btn primary big" onclick={() => (beat = 'event')}>{t('common.next')}</button>
          {:else if beat === 'event'}
            <div class="emoji">📚</div>
            <p class="lead">{t('adh.event.story')}</p>
            <p class="warn">{t('adh.event.reveal')}</p>
            <button class="btn primary big" onclick={() => (beat = 'build')}>{t('common.next')}</button>
          {:else if beat === 'build'}
            <h2>{t('adh.build.prompt')}</h2>
            <div class="week">
              {#each ADH_DAYS as day, d}
                <button class="day" class:miss={plan[d] === 0} class:dbl={plan[d] === 2} onclick={() => cycle(d)}>
                  <span class="dname">{day}</span>
                  <span class="pills">{pills(plan[d])}</span>
                </button>
              {/each}
            </div>
            <p class="hint">{t('adh.build.hint')}</p>
            <button class="btn primary big" onclick={startPlay}>{t('adh.build.play')}</button>
          {:else if beat === 'play'}
            <div class="emoji">🎬</div>
            <h2>{ADH_DAYS[dayIdx] ?? ''}</h2>
            <p class="lead dim">{t('adh.play.watch')}</p>
          {:else if beat === 'quiz'}
            <h2>{t('adh.quiz.prompt')}</h2>
            <div class="opts">
              {#each quizOpts as q}
                <button class="opt" onclick={() => pickQuiz(q)}>{t(q.labelKey)}</button>
              {/each}
            </div>
          {:else if beat === 'decided' && quizPick}
            <div class="fb {quizPick.correct ? 'good' : 'bad'}">{t(quizPick.feedbackKey)}</div>
            <button class="btn primary big" onclick={() => (beat = 'outcome')}>{t('common.next')}</button>
          {:else if beat === 'outcome'}
            <h1 class={outCls}>{t('adh.out.' + outcome + '.title')}</h1>
            <p class="lead">{t('adh.out.' + outcome + '.sub')}</p>
            {#if outcome === 'win'}<div class="stars">{#each [0, 1, 2] as i}<span class:on={i < starCount}>★</span>{/each}</div>{/if}
            <div class="dyk">
              <span class="dlbl">{t('out.dyk')}</span>
              <p>{t('adh.out.dyk1')}</p>
              {#if outcome === 'win'}<p class="second">{t('adh.out.dyk2')}</p>{/if}
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
  .stage { position: relative; z-index: 1; height: 100%; display: grid; grid-template-columns: 360px 1fr; align-items: center; gap: clamp(20px, 3vw, 56px); padding: 28px clamp(36px, 5vw, 80px) 28px clamp(24px, 3vw, 48px); }
  .torso-pane { display: flex; align-items: center; justify-content: center; height: 100%; }
  .content { display: flex; align-items: center; min-width: 0; height: 100%; }
  .beat { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; width: 100%; max-width: 760px; animation: beatin 0.4s cubic-bezier(0.2, 0.9, 0.3, 1) both; }
  .pill { background: var(--surface); border: 1px solid var(--border); border-radius: 999px; padding: 7px 18px; font-size: 14px; font-weight: 700; color: var(--spm-cyan-bright); }
  h1 { font-size: clamp(30px, 3.6vw, 46px); font-weight: 900; line-height: 1.1; }
  h1.good { color: var(--green); } h1.warn { color: var(--grape); } h1.bad { color: var(--toxic); }
  h2 { font-size: clamp(23px, 2.5vw, 31px); font-weight: 800; line-height: 1.2; }
  .lead { font-size: clamp(18px, 2vw, 25px); line-height: 1.5; }
  .lead.dim { color: var(--dim); }
  .warn { color: var(--grape); font-size: 18px; font-weight: 700; }
  .big { font-size: clamp(30px, 3.4vw, 44px); font-weight: 900; }
  .big.good { color: var(--green); }
  .emoji { font-size: 72px; }
  .week { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; width: 100%; }
  .day { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 14px 4px; border: 2px solid var(--border); border-radius: 14px; background: var(--surface); min-height: 96px; }
  .day:active { transform: scale(0.96); border-color: var(--spm-cyan); }
  .day.miss { border-color: color-mix(in srgb, var(--grape) 50%, var(--border)); }
  .day.dbl { border-color: color-mix(in srgb, var(--toxic) 60%, var(--border)); background: rgba(255,107,122,0.1); }
  .dname { font-size: 14px; font-weight: 800; color: var(--dim); }
  .pills { font-size: 18px; min-height: 24px; }
  .hint { font-size: 14px; color: var(--dim); }
  .opts { display: flex; flex-direction: column; gap: 10px; width: 100%; }
  .opt { text-align: start; background: var(--surface); border: 1.5px solid var(--border); border-radius: 14px; padding: 16px 22px; font-size: clamp(16px, 1.7vw, 21px); font-weight: 700; }
  .opt:active { transform: scale(0.98); border-color: var(--spm-cyan); background: var(--surface2); }
  .fb { font-size: clamp(18px, 2vw, 26px); font-weight: 800; line-height: 1.4; }
  .fb.good { color: var(--green); } .fb.bad { color: var(--toxic); }
  .stars { display: flex; gap: 10px; font-size: 52px; }
  .stars span { color: var(--surface2); } .stars span.on { color: var(--grape); text-shadow: 0 0 18px rgba(255, 183, 3, 0.55); }
  .dyk { max-width: 680px; background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 14px 22px; }
  .dlbl { font-size: 13px; color: var(--grape); font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; }
  .dyk p { margin-top: 6px; font-size: 17px; line-height: 1.5; }
  .dyk .second { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); color: var(--dim); }
  .actions { display: flex; gap: 12px; margin-top: 6px; }
  .btn.big { padding: 18px 44px; font-size: 22px; border-radius: 18px; }
  @keyframes beatin { from { opacity: 0; transform: translateY(20px); } }
  @media (prefers-reduced-motion: reduce) { .beat { animation: none; } }
</style>
