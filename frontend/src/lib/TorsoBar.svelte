<script lang="ts">
  import { t } from './locale'
  import type { LevelState } from './types'

  let { s }: { s: LevelState } = $props()

  const pct = (v: number) => Math.max(0, Math.min(100, (v / s.capacity) * 100))
  let waterH = $derived(pct(s.level))
  let bandTop = $derived(100 - pct(s.band_high))
  let bandH = $derived(pct(s.band_high) - pct(s.band_low))
  let critHi = $derived(100 - pct(s.critical_high))
  // zone -> accent for the water + glow
  let accent = $derived(
    s.zone === 'in'
      ? 'var(--green)'
      : s.zone === 'under'
        ? 'var(--grape)'
        : 'var(--toxic)',
  )
</script>

<div class="wrap">
  <div class="title">{t('bar.title')}</div>
  <div class="bar" class:glow={s.in_band} style="--accent:{accent}">
    <!-- toxic zone marker (above the band) -->
    <div class="crit" style="height:{critHi}%"></div>
    <!-- therapeutic window (the taped band) -->
    <div class="band" style="top:{bandTop}%;height:{bandH}%"></div>
    <!-- water -->
    <div class="water" style="height:{waterH}%"></div>
    <div class="marker" style="bottom:{waterH}%"><span>{Math.round(s.level)}</span></div>
  </div>
</div>

<style>
  .wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    height: 100%;
  }
  .title {
    font-size: 14px;
    color: var(--dim);
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }
  .bar {
    position: relative;
    width: 150px;
    flex: 1;
    min-height: 0;
    border-radius: 60px;
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02));
    border: 2px solid var(--border);
    overflow: hidden;
    box-shadow: var(--shadow);
    transition: filter 0.4s ease;
  }
  .bar.glow {
    filter: drop-shadow(0 0 20px rgba(56, 224, 160, 0.6));
  }
  .crit {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    background: repeating-linear-gradient(
      45deg,
      rgba(255, 107, 122, 0.14),
      rgba(255, 107, 122, 0.14) 8px,
      rgba(255, 107, 122, 0.04) 8px,
      rgba(255, 107, 122, 0.04) 16px
    );
    border-bottom: 2px solid rgba(255, 107, 122, 0.5);
  }
  .band {
    position: absolute;
    left: 0;
    right: 0;
    background: var(--green-soft);
    border-top: 2px dashed var(--green-line);
    border-bottom: 2px dashed var(--green-line);
  }
  .water {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, color-mix(in srgb, var(--accent) 75%, #4cc9f0), var(--accent));
    transition: height 0.1s linear, background 0.4s ease;
  }
  .water::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 0;
    right: 0;
    height: 16px;
    border-radius: 50%;
    background: var(--accent);
    opacity: 0.7;
  }
  .marker {
    position: absolute;
    left: 0;
    right: 0;
    display: flex;
    justify-content: flex-end;
    transition: bottom 0.1s linear;
  }
  .marker span {
    transform: translateY(-50%);
    background: #fff;
    color: #0b1020;
    font-weight: 800;
    font-size: 14px;
    border-radius: 8px;
    padding: 2px 8px;
    margin-right: -4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }
</style>
