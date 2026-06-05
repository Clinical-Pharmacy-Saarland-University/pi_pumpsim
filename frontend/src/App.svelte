<script lang="ts">
  import { onMount } from 'svelte'
  import Avatar from './lib/Avatar.svelte'
  import AdminPanel from './lib/AdminPanel.svelte'
  import { api, connectTelemetry } from './lib/api'
  import type { Telemetry } from './lib/types'

  let tel = $state<Telemetry | null>(null)
  let connected = $state(false)
  let showAdmin = $state(false)
  let doseAmount = $state(10)
  const presets = [5, 10, 25, 50]

  onMount(() =>
    connectTelemetry(
      (t) => (tel = t),
      (c) => (connected = c),
    ),
  )

  // safe view helpers (fall back to sane values before first telemetry frame)
  let cap = $derived(tel?.calibration.capacity_ml ?? 100)
  let level = $derived(tel?.level_ml ?? 0)
  let pctFull = $derived(Math.round((level / cap) * 100))

  const fire = (fn: () => Promise<unknown>) => () => fn().catch(() => {})
  const prime = fire(api.prime)
  const stop = fire(api.stop)
  const reset = fire(api.reset)
  const empty = fire(api.empty)
  const dose = () => api.dose(doseAmount).catch(() => {})

  function onKey(e: KeyboardEvent) {
    const target = e.target as HTMLElement
    const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')

    if (e.key === 'Escape') {
      showAdmin = false
      return
    }
    if (typing) return // don't hijack keys while editing admin fields

    switch (e.key.toLowerCase()) {
      case 'a':
        showAdmin = !showAdmin
        break
      case ' ':
        e.preventDefault()
        stop()
        break
      case 'p':
        prime()
        break
      case 'd':
        dose()
        break
      case 'r':
        reset()
        break
      case 'e':
        empty()
        break
    }
  }
</script>

<svelte:window on:keydown={onKey} />

<div class="screen">
  <header class="topbar">
    <div class="brand">
      <span class="logo">💧</span>
      <div>
        <h1>PumpSim</h1>
        <p>Pharmacokinetics demo</p>
      </div>
    </div>
    <div class="status">
      <span class="dot" class:on={connected}></span>
      <span>{connected ? 'live' : 'connecting…'}</span>
      <button class="admin-btn" onclick={() => (showAdmin = !showAdmin)}>
        Admin <kbd>A</kbd>
      </button>
    </div>
  </header>

  <main class="stage">
    <section class="avatar-wrap">
      <Avatar
        {level}
        capacity={cap}
        targetLow={tel?.calibration.target_low_ml ?? 40}
        targetHigh={tel?.calibration.target_high_ml ?? 60}
        inTarget={tel?.in_target ?? false}
      />
      <div class="readout">
        <span class="big" class:good={tel?.in_target}>{level.toFixed(1)}</span>
        <span class="unit">ml · {pctFull}%</span>
      </div>
    </section>

    <section class="panel">
      <div class="cards">
        <div class="card" class:good={tel?.in_target}>
          <span class="k">Status</span>
          <span class="v">{tel?.in_target ? 'IN TARGET' : 'off target'}</span>
        </div>
        <div class="card">
          <span class="k">Target window</span>
          <span class="v">
            {(tel?.calibration.target_low_ml ?? 40).toFixed(0)}–{(
              tel?.calibration.target_high_ml ?? 60
            ).toFixed(0)} ml
          </span>
        </div>
        <div class="card">
          <span class="k">Pump</span>
          <span class="v">
            <span class="pump-dot" class:running={tel?.pump_running}></span>
            {tel?.mode ?? 'idle'}
          </span>
        </div>
        <div class="card">
          <span class="k">Tubing</span>
          <span class="v">{tel?.primed ? 'primed' : 'not primed'}</span>
        </div>
      </div>

      <div class="dose">
        <span class="dose-label">Dose</span>
        <div class="chips">
          {#each presets as p}
            <button class="chip" class:sel={doseAmount === p} onclick={() => (doseAmount = p)}>
              {p}
            </button>
          {/each}
        </div>
      </div>

      <div class="controls">
        <button class="btn primary" onclick={dose}>Deliver {doseAmount} ml</button>
        <button class="btn" onclick={prime}>Prime</button>
        <button class="btn stop" onclick={stop}>Stop</button>
        <button class="btn ghost" onclick={empty}>Empty</button>
        <button class="btn ghost" onclick={reset}>Reset</button>
      </div>
    </section>
  </main>
</div>

{#if showAdmin && tel}
  <AdminPanel cal={tel.calibration} telemetry={tel} onClose={() => (showAdmin = false)} />
{/if}

<style>
  .screen {
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 16px clamp(16px, 3vw, 40px);
    gap: 14px;
  }

  /* top bar */
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .logo {
    font-size: 30px;
  }
  h1 {
    margin: 0;
    font-size: 22px;
    letter-spacing: 0.5px;
  }
  .brand p {
    margin: 0;
    font-size: 12px;
    color: var(--text-dim);
  }
  .status {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--text-dim);
  }
  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--bad);
    box-shadow: 0 0 10px var(--bad);
  }
  .dot.on {
    background: var(--good);
    box-shadow: 0 0 10px var(--good);
  }
  .admin-btn {
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 10px;
    padding: 8px 12px;
    color: var(--text);
  }

  /* stage */
  .stage {
    flex: 1;
    display: grid;
    grid-template-columns: minmax(220px, 1fr) minmax(300px, 1.2fr);
    gap: clamp(16px, 3vw, 40px);
    align-items: center;
    min-height: 0;
  }
  .avatar-wrap {
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .readout {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: baseline;
    gap: 8px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  }
  .big {
    font-size: clamp(36px, 7vw, 64px);
    font-weight: 700;
    color: var(--accent);
  }
  .big.good {
    color: var(--good);
  }
  .unit {
    font-size: 14px;
    color: var(--text-dim);
  }

  /* right panel */
  .panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .card {
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 14px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .card.good {
    border-color: rgba(56, 224, 160, 0.6);
    background: rgba(56, 224, 160, 0.08);
  }
  .k {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: var(--text-dim);
  }
  .v {
    font-size: 17px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pump-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--text-dim);
  }
  .pump-dot.running {
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent);
    animation: pulse 0.9s ease-in-out infinite;
  }
  @keyframes pulse {
    50% {
      opacity: 0.35;
    }
  }

  /* dose */
  .dose {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .dose-label {
    font-size: 13px;
    color: var(--text-dim);
  }
  .chips {
    display: flex;
    gap: 8px;
  }
  .chip {
    background: var(--panel);
    border: 1px solid var(--panel-border);
    border-radius: 999px;
    padding: 8px 16px;
    font-weight: 600;
  }
  .chip.sel {
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    border-color: transparent;
  }

  /* controls */
  .controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .btn {
    border: 1px solid var(--panel-border);
    background: var(--panel);
    border-radius: 14px;
    padding: 18px;
    font-size: 16px;
    font-weight: 600;
    transition: transform 0.06s ease, filter 0.2s ease;
  }
  .btn:active {
    transform: scale(0.97);
  }
  .btn.primary {
    grid-column: 1 / -1;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    border: none;
    font-size: 19px;
  }
  .btn.stop {
    border-color: rgba(255, 107, 122, 0.5);
    color: var(--bad);
  }
  .btn.ghost {
    color: var(--text-dim);
  }

  kbd {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid var(--panel-border);
    border-radius: 6px;
    padding: 0 5px;
    font-size: 11px;
  }

  /* portrait / small screens: stack */
  @media (max-aspect-ratio: 1/1) {
    .stage {
      grid-template-columns: 1fr;
    }
  }
</style>
