<script lang="ts">
  import { t, i18n, setLocale, LOCALES } from '../locale.svelte'
  import { game, setAge, begin } from '../game.svelte'

  let { onadmin }: { onadmin: () => void } = $props()

  // secret admin: long-press (1.2 s) the top-left hotspot
  let pressT: ReturnType<typeof setTimeout> | null = null
  function hotDown() {
    pressT = setTimeout(onadmin, 1200)
  }
  function hotUp() {
    if (pressT) {
      clearTimeout(pressT)
      pressT = null
    }
  }
</script>

<div class="start">
  <button
    class="hotspot"
    onpointerdown={hotDown}
    onpointerup={hotUp}
    onpointerleave={hotUp}
    onpointercancel={hotUp}
    aria-label="admin"
  ></button>

  <div class="logo">💊</div>
  <h1>{t('app.title')}</h1>
  <p class="tag">{t('app.subtitle')}</p>

  <div class="group">
    <div class="glabel">{t('start.lang')}</div>
    <div class="row">
      {#each LOCALES as l}
        <button class="chip" class:sel={i18n.locale === l.id} onclick={() => setLocale(l.id)}>
          <span class="flag">{l.flag}</span>
          {l.name}
        </button>
      {/each}
    </div>
  </div>

  <div class="group">
    <div class="glabel">{t('start.age')}</div>
    <div class="row">
      <button class="chip" class:sel={game.ageGroup === 'young'} onclick={() => setAge('young')}>
        🧒 {t('age.young')}
      </button>
      <button class="chip" class:sel={game.ageGroup === 'adult'} onclick={() => setAge('adult')}>
        🧑 {t('age.adult')}
      </button>
    </div>
  </div>

  <button class="btn primary go" onclick={begin}>{t('start.go')} →</button>
</div>

<style>
  .start {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 24px;
  }
  .hotspot {
    position: absolute;
    top: 0;
    left: 0;
    width: 70px;
    height: 70px;
    background: transparent;
    opacity: 0;
  }
  .logo {
    font-size: 64px;
    animation: float 3s ease-in-out infinite;
  }
  h1 {
    font-size: 52px;
    font-weight: 800;
  }
  .tag {
    font-size: 20px;
    color: var(--green);
    font-weight: 700;
    margin-bottom: 6px;
  }
  .group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .glabel {
    font-size: 12px;
    color: var(--dim);
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }
  .row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .chip {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 12px 18px;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .chip.sel {
    background: linear-gradient(135deg, var(--water-top), var(--water-bot));
    border-color: transparent;
  }
  .flag {
    font-size: 20px;
  }
  .go {
    margin-top: 16px;
    font-size: 22px;
  }
  @keyframes float {
    50% {
      transform: translateY(-10px);
    }
  }
</style>
