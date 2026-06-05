<script lang="ts">
  import { t } from './locale'

  interface Props {
    level: number
    capacity: number
    bandLow: number
    bandHigh: number
    inGreen: boolean
  }
  let { level, capacity, bandLow, bandHigh, inGreen }: Props = $props()

  const pct = (v: number) => Math.max(0, Math.min(100, (v / capacity) * 100))
  let waterH = $derived(pct(level))
  let bandTop = $derived(100 - pct(bandHigh))
  let bandH = $derived(pct(bandHigh) - pct(bandLow))
</script>

<div class="wrap">
  <div class="title">{t('play.gaugeTitle')}</div>
  <div class="gauge" class:glow={inGreen}>
    <div class="band" style="top:{bandTop}%;height:{bandH}%"></div>
    <div class="water" style="height:{waterH}%"></div>
    <div class="marker" style="bottom:{waterH}%"><span>{Math.round(level)}</span></div>
  </div>
</div>

<style>
  .wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .title {
    font-size: 14px;
    color: var(--dim);
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }
  .gauge {
    position: relative;
    width: 150px;
    height: 360px;
    border-radius: 60px;
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02));
    border: 2px solid var(--border);
    overflow: hidden;
    box-shadow: var(--shadow);
    transition: filter 0.4s ease;
  }
  .gauge.glow {
    filter: drop-shadow(0 0 18px rgba(56, 224, 160, 0.55));
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
    background: linear-gradient(180deg, var(--water-top), var(--water-bot));
    transition: height 0.08s linear;
  }
  .water::before {
    content: '';
    position: absolute;
    top: -9px;
    left: 0;
    right: 0;
    height: 18px;
    border-radius: 50%;
    background: var(--water-top);
    opacity: 0.85;
  }
  .marker {
    position: absolute;
    left: 0;
    right: 0;
    display: flex;
    justify-content: flex-end;
    transition: bottom 0.08s linear;
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
