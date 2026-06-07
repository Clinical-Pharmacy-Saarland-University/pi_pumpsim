<script lang="ts">
  // Small on-screen mock of the physical torso (a corner level indicator).
  // On the real installation the actual water in the torso shows the level;
  // this stays as a tiny readout. Driven by the backend (mock or real) — the
  // dev↔production switch is PUMP_BACKEND, no code change.
  import type { LevelState } from './types'

  let { s }: { s: LevelState } = $props()
  const pct = (v: number) => Math.max(0, Math.min(100, (v / s.capacity) * 100))
  let waterH = $derived(pct(s.level))
  let bandTop = $derived(100 - pct(s.band_high))
  let bandH = $derived(pct(s.band_high) - pct(s.band_low))
  let accent = $derived(
    s.zone === 'in' ? 'var(--green)' : s.zone === 'under' ? 'var(--grape)' : 'var(--toxic)',
  )
</script>

<div class="mini" title="Torso (Mock)">
  <div class="bar" class:glow={s.in_band} style="--accent:{accent}">
    <div class="band" style="top:{bandTop}%;height:{bandH}%"></div>
    <div class="water" style="height:{waterH}%"></div>
  </div>
  <div class="val">{Math.round(s.level)}</div>
  <div class="lbl">Torso</div>
</div>

<style>
  .mini {
    position: absolute;
    top: 16px;
    right: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    z-index: 20;
    pointer-events: none;
  }
  .bar {
    position: relative;
    width: 34px;
    height: 150px;
    border-radius: 17px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border);
    overflow: hidden;
  }
  .bar.glow {
    box-shadow: 0 0 14px rgba(56, 224, 160, 0.5);
  }
  .band {
    position: absolute;
    left: 0;
    right: 0;
    background: var(--green-soft);
    border-top: 1px dashed var(--green-line);
    border-bottom: 1px dashed var(--green-line);
  }
  .water {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--accent);
    transition: height 0.1s linear, background 0.3s ease;
  }
  .val {
    font-size: 13px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
  .lbl {
    font-size: 10px;
    color: var(--dim);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
</style>
