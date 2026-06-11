<script lang="ts">
  // Shared "the torso is the instrument" banner. On the Pi there is NO on-screen
  // vessel — the real pump beside the screen is the only level readout — so every
  // move/stillness beat renders this banner to send the player's eyes to the
  // hardware and to name what the water is doing (rising / falling / dead still).
  // Reusable across all six v2 stories. Touch-only, reduced-motion safe.
  type Tone = 'watch' | 'still' | 'rising' | 'falling' | 'good'
  let { text, tone = 'watch' }: { text: string; tone?: Tone } = $props()

  let glyphs = $derived(
    tone === 'rising' ? ['▲', '▲', '▲'] : tone === 'falling' ? ['▼', '▼', '▼'] : [],
  )
</script>

<div class="watch {tone}" role="status" aria-live="polite">
  <div class="icon" aria-hidden="true">
    {#if tone === 'rising' || tone === 'falling'}
      <div class="chev {tone}">
        {#each glyphs as g, i}<span style="--i:{i}">{g}</span>{/each}
      </div>
    {:else if tone === 'still'}
      <div class="flat"></div>
    {:else if tone === 'good'}
      <span class="mark">✓</span>
    {:else}
      <span class="eye">👁</span>
    {/if}
  </div>
  <p class="text">{text}</p>
</div>

<style>
  .watch {
    --c: var(--spm-cyan-bright);
    display: flex;
    align-items: center;
    gap: 18px;
    width: 100%;
    max-width: 820px;
    padding: 16px 22px;
    border: 1.5px solid color-mix(in srgb, var(--c) 45%, var(--border));
    border-radius: 18px;
    background: color-mix(in srgb, var(--c) 9%, var(--surface));
    box-shadow: 0 0 30px color-mix(in srgb, var(--c) 16%, transparent);
  }
  .watch.still {
    --c: var(--dim);
    box-shadow: none;
  }
  .watch.rising {
    --c: var(--toxic);
  }
  .watch.falling {
    --c: var(--grape);
  }
  .watch.good {
    --c: var(--green);
  }

  .icon {
    flex: none;
    width: 52px;
    height: 52px;
    display: grid;
    place-items: center;
  }
  .eye {
    font-size: 34px;
    animation: look 2.4s ease-in-out infinite;
  }
  .mark {
    font-size: 36px;
    font-weight: 950;
    color: var(--c);
  }
  .flat {
    width: 34px;
    height: 4px;
    border-radius: 4px;
    background: var(--c);
    opacity: 0.7;
  }
  .chev {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--c);
    font-size: 17px;
    line-height: 0.8;
    text-shadow: 0 0 10px var(--c);
  }
  .chev.falling {
    flex-direction: column-reverse;
  }
  .chev span {
    opacity: 0.25;
    animation: pump 1.1s ease-in-out infinite;
    animation-delay: calc(var(--i) * 0.16s);
  }

  .text {
    font-size: clamp(18px, 1.9vw, 24px);
    font-weight: 850;
    line-height: 1.25;
    color: var(--text);
  }

  @keyframes look {
    0%, 100% { transform: translateX(-3px); }
    50% { transform: translateX(3px); }
  }
  @keyframes pump {
    50% { opacity: 1; transform: translateY(-3px); }
  }
  @media (prefers-reduced-motion: reduce) {
    .eye, .chev span { animation: none; }
  }
</style>
