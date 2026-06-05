<script lang="ts">
  import { t } from '../locale'
  let { onstart }: { onstart: () => void } = $props()
</script>

<button class="attract" onclick={onstart}>
  <div class="logo">💧</div>
  <h1>{t('app.title')}</h1>
  <p class="tag">{t('attract.tagline')}</p>
  <p class="fam">{t('attract.family')}</p>
  <div class="start">▶ {t('attract.start')}</div>
</button>

<style>
  .attract {
    width: 100vw;
    height: 100vh;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .logo {
    font-size: 84px;
    animation: float 3s ease-in-out infinite;
  }
  h1 {
    font-size: 64px;
    font-weight: 800;
    letter-spacing: 0.5px;
  }
  .tag {
    font-size: 26px;
    color: var(--green);
    font-weight: 700;
  }
  .fam {
    font-size: 18px;
    color: var(--dim);
    margin-top: 2px;
  }
  .start {
    margin-top: 34px;
    font-size: 22px;
    font-weight: 700;
    padding: 16px 32px;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--surface);
    animation: pulse 1.6s ease-in-out infinite;
  }
  @keyframes float {
    50% {
      transform: translateY(-12px);
    }
  }
  @keyframes pulse {
    50% {
      opacity: 0.55;
      transform: scale(0.98);
    }
  }
</style>
