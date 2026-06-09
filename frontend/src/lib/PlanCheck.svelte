<script lang="ts">
  // Tactile tap-to-find beat. Default = the detective (the morning's items: tap the
  // one that raised the level); reused for the Medikamenten-Check via props. Every
  // tap explains itself (per-item feedback). Wrong = explain + try again.
  import { t } from './locale.svelte'
  import { game, planCheckDone } from './game.svelte'
  import type { PlanCheck, PlanItem } from './events'

  let {
    data,
    onDone = planCheckDone,
  }: { data?: PlanCheck; onDone?: (firstTryCorrect: boolean) => void } = $props()

  let plan = $derived(data ?? game.events[game.idx].planCheck!)
  // items can be limited to one age register (e.g. the med-check decoys)
  let items = $derived(plan.items.filter((it) => !it.register || it.register === game.ageGroup))
  let wrongIds = $state<string[]>([])
  let solved = $state(false)
  let feedback = $state<string | null>(null)
  let feedbackBad = $state(false)

  function tap(item: PlanItem) {
    if (solved) return
    feedback = item.feedbackKey
    if (item.interacts) {
      solved = true
      feedbackBad = false
      const clean = wrongIds.length === 0
      setTimeout(() => onDone(clean), 1200)
    } else {
      feedbackBad = true
      if (!wrongIds.includes(item.id)) wrongIds = [...wrongIds, item.id]
    }
  }
</script>

<div class="plan">
  <h2>{t(plan.promptKey)}</h2>
  <div class="list">
    {#each items as it}
      <button
        class="item"
        class:bad={wrongIds.includes(it.id)}
        class:good={solved && it.interacts}
        class:dim={solved && !it.interacts}
        disabled={solved}
        onclick={() => tap(it)}
      >{t(it.labelKey)}</button>
    {/each}
  </div>
  {#if feedback}<p class="fb {feedbackBad ? 'bad' : 'good'}">{t(feedback)}</p>{/if}
</div>

<style>
  .plan {
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
    max-width: 700px;
  }
  h2 {
    font-size: 28px;
    font-weight: 800;
  }
  .list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .item {
    text-align: start;
    font-size: 20px;
    font-weight: 600;
    padding: 16px 20px;
    border-radius: 14px;
    background: var(--surface);
    border: 2px solid var(--border);
    color: var(--text);
    transition: transform 0.1s ease, border-color 0.2s ease, background 0.2s ease, opacity 0.2s ease;
  }
  .item:active {
    transform: scale(0.98);
  }
  .item.bad {
    border-color: var(--toxic);
    background: rgba(255, 107, 122, 0.12);
    animation: shake 0.3s ease;
  }
  .item.good {
    border-color: var(--green);
    background: rgba(56, 224, 160, 0.16);
    box-shadow: 0 0 16px rgba(56, 224, 160, 0.4);
  }
  .item.dim {
    opacity: 0.4;
  }
  .fb {
    font-size: 20px;
    font-weight: 800;
    line-height: 1.4;
  }
  .fb.good {
    color: var(--green);
  }
  .fb.bad {
    color: var(--toxic);
  }
  @keyframes shake {
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
</style>
