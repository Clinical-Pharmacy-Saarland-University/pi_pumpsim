<script lang="ts">
  import { t } from '../locale.svelte'
  import { game } from '../game.svelte'
  import Backdrop from '../Backdrop.svelte'
</script>

<div class="reset">
  <Backdrop />
  <div class="stage">
    <main class="content">
      <div class="spinner"></div>
      <h1>{t('reset.title')}</h1>
      <p>{t('reset.sub')}</p>
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
