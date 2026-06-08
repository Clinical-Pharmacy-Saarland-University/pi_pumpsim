<script lang="ts">
  // The 5-band reveal — the "surprise" beat. The slow bar has just settled; we
  // name where it landed (viel zu wenig … genau richtig … viel zu viel).
  import { t } from './locale.svelte'
  import { game, revealNext } from './game.svelte'
  import type { LevelState } from './types'

  function band5(s: LevelState): 'way_low' | 'low' | 'in' | 'high' | 'way_high' {
    if (s.level >= s.critical_high) return 'way_high'
    if (s.level <= s.critical_low) return 'way_low'
    if (s.level > s.band_high) return 'high'
    if (s.level < s.band_low) return 'low'
    return 'in'
  }

  let b = $derived(game.level ? band5(game.level) : 'in')
  let cls = $derived(b === 'in' ? 'good' : b === 'low' || b === 'way_low' ? 'warn' : 'bad')
  let inBand = $derived(game.level?.in_band ?? false)
  let nextLabel = $derived(
    game.revealKind === 'dose' && !inBand ? t('reveal.redose') : t('common.next'),
  )
</script>

<div class="reveal {cls}">
  <div class="big">{t(`reveal.${b}`)}</div>
  <p class="sub">{t(`reveal.${b}.sub`, { name: t(game.patient.nameKey) })}</p>
  <button class="btn primary" onclick={revealNext}>{nextLabel}</button>
</div>

<style>
  .reveal {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    width: 100%;
    text-align: center;
    animation: pop 0.35s cubic-bezier(0.2, 1.3, 0.4, 1) both;
  }
  .big {
    font-size: 52px;
    font-weight: 900;
    letter-spacing: 0.3px;
  }
  .reveal.good .big {
    color: var(--green);
    text-shadow: 0 0 22px rgba(56, 224, 160, 0.45);
  }
  .reveal.warn .big {
    color: var(--grape);
  }
  .reveal.bad .big {
    color: var(--toxic);
    text-shadow: 0 0 22px rgba(255, 107, 122, 0.4);
  }
  .sub {
    font-size: 22px;
    line-height: 1.5;
    color: var(--text);
    max-width: 620px;
  }
  @keyframes pop {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(10px);
    }
  }
</style>
