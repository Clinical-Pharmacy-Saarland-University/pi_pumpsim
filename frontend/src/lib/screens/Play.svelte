<script lang="ts">
  import { t } from '../locale'
  import Gauge from '../Gauge.svelte'
  import PatientFace from '../PatientFace.svelte'
  import Mascot from '../Mascot.svelte'
  import HoldButton from '../HoldButton.svelte'
  import type { GameState, ScenarioMeta } from '../types'

  let {
    state,
    scenario,
    index,
    total,
    onhold,
  }: {
    state: GameState
    scenario: ScenarioMeta
    index: number
    total: number
    onhold: (on: boolean) => void
  } = $props()

  let name = $derived(t('p.' + scenario.patient_id + '.name'))
  let line = $derived(t('p.' + scenario.patient_id + '.line'))
  let remaining = $derived(Math.max(0, state.duration - state.t))
  let mood = $derived<'happy' | 'low' | 'high'>(
    state.in_green ? 'happy' : state.level < state.band_low ? 'low' : 'high',
  )
  let statusText = $derived(
    state.in_green ? t('status.in') : state.level < state.band_low ? t('status.low') : t('status.high'),
  )

  function fmt(s: number) {
    const x = Math.ceil(s)
    return `${Math.floor(x / 60)}:${String(x % 60).padStart(2, '0')}`
  }
</script>

<div class="play">
  <div class="top">
    <div class="who">
      <span class="pill">{t('intro.patientOf', { n: index + 1, total })}</span>
      <h1>{line}</h1>
    </div>
    <div class="timer">{fmt(remaining)}</div>
  </div>

  {#if state.active_event}
    <div class="banner">
      {t('ev.' + state.active_event, { name })}
      <span class="sub">{t('ev.' + state.active_event + '.sub')}</span>
    </div>
  {/if}

  <div class="stage">
    <div class="patient" class:good={state.in_green}>
      <div class="facebox"><PatientFace {mood} /></div>
      <div class="pname">{name}</div>
      <Mascot drugId={scenario.drug_id} size={54} />
      <div class="wb">
        <div class="lbl">{t('play.wellbeing')}</div>
        <div class="bar"><div class="fill" style="width:{state.well_being}%"></div></div>
      </div>
      <div class="status {mood}">
        {statusText} <span>· {t('play.inGreenFor', { s: Math.floor(state.time_in_green) })}</span>
      </div>
    </div>

    <div class="gaugecol">
      <Gauge
        level={state.level}
        capacity={state.capacity}
        bandLow={state.band_low}
        bandHigh={state.band_high}
        inGreen={state.in_green}
      />
    </div>
  </div>

  <div class="holdwrap"><HoldButton {onhold} /></div>
</div>

<style>
  .play {
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 22px clamp(20px, 3vw, 40px);
    gap: 14px;
  }
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .who {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .pill {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 7px 14px;
    font-size: 14px;
    color: var(--dim);
  }
  h1 {
    font-size: 24px;
    font-weight: 700;
  }
  .timer {
    font-variant-numeric: tabular-nums;
    font-size: 22px;
    font-weight: 700;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 6px 14px;
  }
  .banner {
    align-self: center;
    display: flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(90deg, rgba(255, 183, 3, 0.22), rgba(255, 183, 3, 0.08));
    border: 1px solid rgba(255, 183, 3, 0.5);
    border-radius: 16px;
    padding: 11px 22px;
    font-size: 20px;
    font-weight: 700;
  }
  .banner .sub {
    font-size: 15px;
    font-weight: 500;
    color: var(--dim);
  }
  .stage {
    flex: 1;
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    gap: clamp(20px, 4vw, 48px);
    align-items: center;
    min-height: 0;
  }
  .patient {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 22px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    box-shadow: var(--shadow);
    transition: border-color 0.3s ease, background 0.3s ease;
  }
  .patient.good {
    border-color: rgba(56, 224, 160, 0.5);
    background: rgba(56, 224, 160, 0.06);
  }
  .facebox {
    width: 120px;
    height: 120px;
  }
  .pname {
    font-size: 24px;
    font-weight: 800;
  }
  .wb {
    width: 100%;
  }
  .wb .lbl {
    font-size: 12px;
    color: var(--dim);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    margin-bottom: 6px;
  }
  .wb .bar {
    height: 14px;
    border-radius: 999px;
    background: var(--surface2);
    overflow: hidden;
    border: 1px solid var(--border);
  }
  .wb .fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--green), #8be0c0);
    transition: width 0.12s linear;
  }
  .status {
    font-size: 18px;
    font-weight: 700;
  }
  .status span {
    color: var(--dim);
    font-weight: 500;
    font-size: 15px;
  }
  .status.happy {
    color: var(--green);
  }
  .status.low {
    color: var(--grape);
  }
  .status.high {
    color: var(--toxic);
  }
  .gaugecol {
    display: flex;
    justify-content: center;
  }
  .holdwrap {
    display: flex;
    justify-content: center;
    padding-top: 4px;
  }
</style>
