<script lang="ts">
  // Unique mechanic for the DDI story: connect-the-clash. Tap one drug card, then
  // another — a drug interaction IS a pair. Correct pair locks in; a wrong pair
  // bounces back with a per-pair explanation and lets you retry. Tap-tap (kiosk-safe).
  import { t } from './locale.svelte'
  import { isDdiCorrectPair, ddiPairFeedback, type DdiCard } from './stories/ddi'

  let { cards, onPaired }: { cards: DdiCard[]; onPaired: (firstTry: boolean) => void } = $props()

  let armed = $state<string | null>(null)
  let feedback = $state<string | null>(null)
  let bad = $state(false)
  let solved = $state<string[] | null>(null)
  let attempts = 0

  function tap(id: string) {
    if (solved) return
    if (armed === null) {
      armed = id
      feedback = null
      return
    }
    if (armed === id) {
      armed = null
      return
    }
    const a = armed
    armed = null
    attempts++
    if (isDdiCorrectPair(a, id)) {
      solved = [a, id]
      feedback = 'ddi.pair.correct'
      bad = false
      setTimeout(() => onPaired(attempts === 1), 1200)
    } else {
      feedback = ddiPairFeedback(a, id)
      bad = true
    }
  }
  const isSolved = (id: string) => solved?.includes(id) ?? false
</script>

<div class="pair">
  <h2>{t('ddi.pair.prompt')}</h2>
  <div class="grid">
    {#each cards as c}
      <button
        class="card"
        class:armed={armed === c.id}
        class:solved={isSolved(c.id)}
        class:isnew={c.isNew}
        disabled={!!solved}
        onclick={() => tap(c.id)}
      >
        {#if c.isNew}<span class="new">{t('ddi.new')}</span>{/if}
        <span class="emoji">💊</span>
        <span class="name">{t(c.nameKey)}</span>
        <span class="role">{t(c.roleKey)}</span>
        {#if isSolved(c.id)}<span class="spark">⚡</span>{/if}
      </button>
    {/each}
  </div>
  {#if feedback}<p class="fb {bad ? 'bad' : 'good'}">{t(feedback)}</p>{/if}
</div>

<style>
  .pair {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
    max-width: 760px;
  }
  h2 {
    font-size: clamp(22px, 2.3vw, 28px);
    font-weight: 800;
    line-height: 1.25;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: 16px 16px 14px;
    min-height: 104px;
    border: 2px solid var(--border);
    border-radius: 16px;
    background: var(--surface);
    text-align: start;
    transition: transform 0.1s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }
  .card:active {
    transform: scale(0.97);
  }
  .card.isnew {
    border-color: color-mix(in srgb, var(--grape) 60%, var(--border));
    box-shadow: 0 0 0 1px var(--grape), 0 0 18px rgba(255, 183, 3, 0.28);
    animation: pulse 2s ease-in-out infinite;
  }
  .card.armed {
    border-color: var(--spm-cyan);
    background: var(--surface2);
    box-shadow: 0 0 0 2px var(--spm-cyan), 0 8px 24px rgba(0, 190, 202, 0.32);
  }
  .card.solved {
    border-color: var(--green);
    box-shadow: 0 0 20px rgba(56, 224, 160, 0.5);
  }
  .emoji {
    font-size: 26px;
  }
  .name {
    font-size: 18px;
    font-weight: 800;
  }
  .role {
    font-size: 13px;
    color: var(--dim);
  }
  .new {
    position: absolute;
    top: 8px;
    inset-inline-end: 8px;
    background: var(--grape);
    color: #3a2600;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.5px;
    padding: 2px 7px;
    border-radius: 999px;
  }
  .spark {
    position: absolute;
    top: 8px;
    inset-inline-end: 8px;
    font-size: 20px;
  }
  .fb {
    font-size: 19px;
    font-weight: 800;
    line-height: 1.4;
  }
  .fb.good {
    color: var(--green);
  }
  .fb.bad {
    color: var(--toxic);
  }
  @keyframes pulse {
    50% {
      box-shadow: 0 0 0 1px var(--grape), 0 0 28px rgba(255, 183, 3, 0.5);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .card.isnew {
      animation: none;
    }
  }
</style>
