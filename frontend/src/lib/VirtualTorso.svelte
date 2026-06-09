<script lang="ts">
  // Dev-only "virtual twin" of the PHYSICAL torso. Shows the backend level in
  // real units (ml, via the calibrated torso volume) with an ml ruler, the taped
  // band, target marker and live pump flow — so you can watch the pump fill and
  // drain the tank without hardware. Rendered OUTSIDE the 1280×720 Pi frame
  // (dev browser only; on the real Pi the frame fills the screen and the real
  // torso stands next to it).
  import { t } from './locale.svelte'
  import type { LevelState } from './types'

  let { s, connected }: { s: LevelState | null; connected: boolean } = $props()

  let cap = $derived(s?.capacity ?? 100)
  const pct = (v: number) => Math.max(0, Math.min(100, (v / cap) * 100))

  let volume = $derived(s?.torso_volume_ml ?? 1800)
  let levelMl = $derived(s?.level_ml ?? 0)
  let targetMl = $derived(s?.target_ml ?? 0)
  let waterH = $derived(pct(s?.level ?? 0))
  let targetPct = $derived(pct(s?.target ?? 0))
  let bandTop = $derived(100 - pct(s?.band_high ?? 70))
  let bandH = $derived(pct(s?.band_high ?? 70) - pct(s?.band_low ?? 55))
  let critHigh = $derived(pct(s?.critical_high ?? 80))
  let critLow = $derived(pct(s?.critical_low ?? 35))

  // ml ruler: the smallest "nice" step that keeps it to ~9 ticks
  let tickStep = $derived([100, 200, 250, 500, 1000].find((st) => volume / st <= 9) ?? 1000)
  let ticks = $derived(
    Array.from({ length: Math.floor(volume / tickStep) + 1 }, (_, i) => i * tickStep),
  )

  let pumping = $derived(!!s && s.pump_running && s.pump_direction !== 'stop')
  let showTarget = $derived(!!s && Math.abs(s.target - s.level) > 0.5)
  let accent = $derived(
    !s || s.zone === 'in'
      ? 'var(--green)'
      : s.zone === 'under' || s.zone === 'critical_low'
        ? 'var(--grape)'
        : 'var(--toxic)',
  )
</script>

<div class="twin" class:offline={!connected || !s} style="--accent:{accent}">
  <header>
    <span class="title">{t('twin.title')}</span>
    {#if !connected || !s}
      <span class="badge off">{t('twin.offline')}</span>
    {:else}
      <span class="badge" class:real={s.backend === 'real'}>
        {s.backend === 'real' ? 'REAL' : 'MOCK'}
      </span>
    {/if}
  </header>

  <div class="big"><b>{Math.round(levelMl)}</b> ml</div>
  <div class="sub">{waterH.toFixed(1)} % · {t('twin.volume')}: {Math.round(volume)} ml</div>

  <div class="tank">
    <div class="ruler">
      {#each ticks as tk}
        <span class="tick" style="bottom:{(tk / volume) * 100}%"><i></i>{tk}</span>
      {/each}
    </div>

    <div class="vessel" class:pumping>
      <div class="band" style="top:{bandTop}%; height:{bandH}%"></div>
      <div class="crit hi" style="bottom:{critHigh}%"></div>
      <div class="crit lo" style="bottom:{critLow}%"></div>

      <div class="water" style="height:{waterH}%"><span class="meniscus"></span></div>

      {#if showTarget && s}
        <div class="goal" style="bottom:{targetPct}%">
          <em>{t('twin.target')} {Math.round(targetMl)} ml</em>
        </div>
      {/if}

      {#if pumping && s}
        <div class="flow" class:down={s.pump_direction === 'out'}>
          {#each [0, 1, 2] as i}
            <span style="--i:{i}">{s.pump_direction === 'in' ? '▲' : '▼'}</span>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="readout" class:active={pumping}>
    {#if pumping && s}
      {t('twin.flow')}:
      <b>{s.pump_direction === 'out' ? '−' : '+'}{s.pump_flow_ml_s.toFixed(1)} ml/s</b>
      · {Math.round(s.pump_speed * 100)} %
    {:else}
      {t('twin.idle')}
    {/if}
  </div>
</div>

<style>
  .twin {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 16px 18px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border);
    border-radius: 18px;
    transition: opacity 0.3s ease;
  }
  .twin.offline {
    opacity: 0.45;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .title {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--dim);
  }
  .badge {
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 1px;
    padding: 3px 8px;
    border-radius: 999px;
    background: #6b7794;
    color: #04222a;
  }
  .badge.real {
    background: var(--green);
  }
  .badge.off {
    background: var(--toxic);
    color: #2a0408;
  }

  .big {
    font-size: 30px;
    font-weight: 300;
    color: var(--text);
    font-variant-numeric: tabular-nums;
  }
  .big b {
    font-weight: 800;
  }
  .sub {
    font-size: 12px;
    color: var(--dim);
    font-variant-numeric: tabular-nums;
  }

  .tank {
    flex: 1;
    min-height: 0;
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }
  .ruler {
    position: relative;
    width: 44px;
    flex: none;
    font-size: 10px;
    color: var(--dim);
    font-variant-numeric: tabular-nums;
  }
  .tick {
    position: absolute;
    right: 0;
    transform: translateY(50%);
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .tick i {
    order: 2;
    width: 8px;
    height: 1px;
    background: var(--border);
  }

  .vessel {
    position: relative;
    flex: 1;
    border-radius: 26px 26px 34px 34px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
    border: 2px solid var(--border);
    box-shadow: inset 0 2px 14px rgba(0, 0, 0, 0.45);
    overflow: hidden;
  }
  .vessel.pumping {
    box-shadow:
      inset 0 2px 14px rgba(0, 0, 0, 0.45),
      0 0 26px color-mix(in srgb, var(--accent) 35%, transparent);
  }

  .band {
    position: absolute;
    left: 0;
    right: 0;
    background: var(--green-soft);
    border-top: 2px dashed var(--green-line);
    border-bottom: 2px dashed var(--green-line);
  }
  .crit {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    opacity: 0.5;
    background: repeating-linear-gradient(90deg, var(--toxic) 0 8px, transparent 8px 16px);
  }
  .crit.lo {
    background: repeating-linear-gradient(90deg, var(--grape) 0 8px, transparent 8px 16px);
  }

  .water {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, var(--water-top), var(--water-bot));
    transition: height 0.12s linear;
  }
  .meniscus {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: color-mix(in srgb, var(--water-top) 55%, #fff);
    opacity: 0.8;
  }

  .goal {
    position: absolute;
    left: 0;
    right: 0;
    border-top: 2px dotted var(--text);
    opacity: 0.75;
  }
  .goal em {
    position: absolute;
    top: 2px;
    right: 6px;
    font-style: normal;
    font-size: 10px;
    font-weight: 700;
    color: var(--text);
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  }

  .flow {
    position: absolute;
    inset-inline-end: 10px;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--accent);
    font-size: 15px;
    text-shadow: 0 0 8px var(--accent);
  }
  .flow.down {
    flex-direction: column-reverse;
  }
  .flow span {
    opacity: 0.25;
    animation: chev 1.1s ease-in-out infinite;
    animation-delay: calc(var(--i) * 0.18s);
  }

  .readout {
    margin-top: 8px;
    font-size: 12px;
    color: var(--dim);
    text-align: center;
    padding: 8px 6px;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--border);
    font-variant-numeric: tabular-nums;
  }
  .readout.active {
    color: var(--text);
  }
  .readout b {
    color: var(--accent);
  }

  @keyframes chev {
    50% {
      opacity: 1;
      transform: translateY(-4px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .flow span {
      animation: none;
    }
  }
</style>
