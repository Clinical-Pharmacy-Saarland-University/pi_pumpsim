<script lang="ts">
  // Self-contained v2 story „Das Teeküchen-Regal" (Induktion · Johanniskraut × Ciclosporin).
  // Unique mechanic = real-time leak-defense: the transplant's protection drains while the
  // player must find + tap the right fix („Johanniskraut absetzen") among decoys before the
  // level hits the rejection floor. play2 phase ⇒ we own the win/lose (an $effect watches level).
  import { onMount } from 'svelte'
  import { t } from '../locale.svelte'
  import { game, driveTo, retry, backToStories } from '../game.svelte'
  import Backdrop from '../Backdrop.svelte'
  import StarRating from '../StarRating.svelte'
  import { JK_START, JK_FLOOR, JK_DRAIN_TARGET, JK_ACTIONS, JK_HELP_IDS, type JkAction } from '../stories/johanniskraut'
  import { stars as starsFor, type Outcome } from '../flow'

  type Beat = 'briefing' | 'event' | 'leak' | 'sealing' | 'outcome'
  let beat = $state<Beat>('briefing')
  let resolved = $state(false)
  let outcome = $state<Outcome>('win')
  let helped = $state<string[]>([])
  let koederTapped = $state(false)
  let fb = $state<{ key: string; bad: boolean } | null>(null)

  // clever: full unless a decoy („Köder") was tapped → half. pro: how many of the
  // protective help actions were found (both = full, one = half, none = 0).
  let helpsFound = $derived(JK_HELP_IDS.filter((id) => helped.includes(id)).length)
  let proQ = $derived(helpsFound >= JK_HELP_IDS.length ? 1 : helpsFound >= 1 ? 0.5 : 0)
  let starCount = $derived(starsFor(outcome === 'win', !koederTapped ? 1 : 0.5, proQ))
  let outCls = $derived(outcome === 'win' ? 'good' : 'bad')

  onMount(() => driveTo(JK_START, 8, () => {}))

  // real-time floor watch: reaching JK_FLOOR while still leaking = rejection (lose)
  $effect(() => {
    if (beat === 'leak' && !resolved && game.level && game.level.level <= JK_FLOOR) {
      resolved = true
      outcome = 'under'
      beat = 'outcome'
    }
  })

  function startLeak() {
    beat = 'leak'
    driveTo(JK_DRAIN_TARGET, 2.2, () => {}) // slow drain toward rejection
  }
  function act(a: JkAction) {
    if (resolved) return
    fb = { key: a.feedbackKey, bad: a.kind !== 'fix' }
    if (a.kind === 'fix') {
      resolved = true
      outcome = 'win'
      beat = 'sealing'
      driveTo(JK_START, 6, () => (beat = 'outcome'))
    } else if (a.kind === 'koeder') {
      koederTapped = true
      driveTo(JK_DRAIN_TARGET, 4, () => {}) // worse — drain speeds up
    } else if (!helped.includes(a.id)) {
      helped = [...helped, a.id]
    }
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
            <div class="pill">{t('story.johanniskraut.title')}</div>
            <h1>{t('jk.brief.patient')}</h1>
            <p class="lead">{t('jk.brief.goal')}</p>
            <button class="btn primary big" onclick={() => (beat = 'event')}>{t('common.next')}</button>
          {:else if beat === 'event'}
            <div class="emoji">🌿</div>
            <p class="lead">{t('jk.event.story')}</p>
            <p class="warn">{t('jk.event.reveal')}</p>
            <button class="btn primary big" onclick={startLeak}>{t('jk.event.btn')}</button>
          {:else if beat === 'leak'}
            <div class="alarm">⚠️ {t('jk.leak.prompt')}</div>
            <div class="cards">
              {#each JK_ACTIONS as a}
                <button class="card" class:done={helped.includes(a.id)} onclick={() => act(a)}>{t(a.labelKey)}</button>
              {/each}
            </div>
            {#if fb}<p class="fb {fb.bad ? 'bad' : 'good'}">{t(fb.key)}</p>{/if}
          {:else if beat === 'sealing'}
            <div class="big good">{t('jk.sealing')}</div>
            <div class="dots">…</div>
          {:else if beat === 'outcome'}
            <h1 class={outCls}>{t('jk.out.' + outcome + '.title')}</h1>
            <p class="lead">{t('jk.out.' + outcome + '.sub')}</p>
            {#if outcome === 'win'}<StarRating score={starCount} />{/if}
            <div class="dyk">
              <span class="dlbl">{t('out.dyk')}</span>
              <p>{t('jk.out.dyk1')}</p>
              {#if outcome === 'win'}<p class="second">{t('jk.out.dyk2')}</p>{/if}
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
  .lead { font-size: clamp(18px, 2vw, 25px); line-height: 1.5; }
  .warn { color: var(--grape); font-size: 18px; font-weight: 700; }
  .big { font-size: clamp(30px, 3.4vw, 44px); font-weight: 900; }
  .big.good { color: var(--green); }
  .emoji { font-size: 72px; }
  .alarm { font-size: clamp(20px, 2.2vw, 27px); font-weight: 800; color: var(--toxic); animation: blink 1s ease-in-out infinite; }
  .cards { display: flex; flex-direction: column; gap: 10px; width: 100%; }
  .card { text-align: start; background: var(--surface); border: 1.5px solid var(--border); border-radius: 14px; padding: 16px 22px; font-size: clamp(16px, 1.7vw, 21px); font-weight: 700; }
  .card:active { transform: scale(0.98); border-color: var(--spm-cyan); background: var(--surface2); }
  .card.done { border-color: var(--green); opacity: 0.7; }
  .fb { font-size: clamp(17px, 1.9vw, 24px); font-weight: 800; line-height: 1.4; }
  .fb.good { color: var(--green); } .fb.bad { color: var(--toxic); }
  .dots { font-size: 56px; color: var(--dim); animation: pulsedots 1s ease-in-out infinite; }
  .dyk { max-width: 680px; background: var(--surface); border: 1px solid var(--border); border-radius: 18px; padding: 14px 22px; }
  .dlbl { font-size: 13px; color: var(--grape); font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; }
  .dyk p { margin-top: 6px; font-size: 17px; line-height: 1.5; }
  .dyk .second { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); color: var(--dim); }
  .actions { display: flex; gap: 12px; margin-top: 6px; }
  .btn.big { padding: 18px 44px; font-size: 22px; border-radius: 18px; }
  @keyframes beatin { from { opacity: 0; transform: translateY(20px); } }
  @keyframes blink { 50% { opacity: 0.5; } }
  @keyframes pulsedots { 50% { opacity: 0.3; } }
  @media (prefers-reduced-motion: reduce) { .beat, .alarm { animation: none; } }
</style>
