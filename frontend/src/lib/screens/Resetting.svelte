<script lang="ts">
  import { t } from '../locale.svelte'
  import { game } from '../game.svelte'
  import Backdrop from '../Backdrop.svelte'

  // Real-hardware reset takes a while (drain → prime), so count down from the backend's
  // estimated total (empty + prime). On the mock pump it settles instantly, so we show
  // no countdown — the $effect only arms on the real backend with a meaningful ETA.
  let remaining = $state<number | null>(null)
  $effect(() => {
    const eta = game.prepareEtaS
    if (game.level?.backend !== 'real' || eta < 1.5) {
      remaining = null
      return
    }
    const start = performance.now()
    remaining = eta
    const id = setInterval(() => {
      const left = eta - (performance.now() - start) / 1000
      remaining = left > 0 ? left : 0
    }, 250)
    return () => clearInterval(id)
  })
</script>

<div class="reset">
  <Backdrop />
  <div class="stage">
    <main class="content">
      <div class="spinner"></div>
      <h1>{t('reset.title')}</h1>
      <p>{t('reset.sub')}</p>
      {#if remaining !== null}
        <p class="eta">{t('reset.eta', { s: Math.ceil(remaining) })}</p>
      {/if}
    </main>
  </div>
</div>

<style>
  .reset {
    position: relative;
    height: 100%;
    overflow: hidden;
  }
  .stage {
    position: relative;
    z-index: 1;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr;
    align-items: center;
    padding: 28px clamp(36px, 5vw, 80px);
  }
  .content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    justify-self: center;
  }
  .spinner {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: 5px solid var(--surface2);
    border-top-color: var(--spm-cyan);
    animation: spin 0.9s linear infinite;
  }
  h1 {
    font-size: clamp(28px, 3vw, 38px);
    font-weight: 900;
    line-height: 1.1;
    background: linear-gradient(90deg, var(--green), var(--spm-cyan-bright));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  p {
    font-size: 18px;
    color: var(--dim);
  }
  .eta {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    color: var(--spm-cyan-bright);
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation: none;
    }
  }
</style>
