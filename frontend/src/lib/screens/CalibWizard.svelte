<script lang="ts">
  // Guided calibration. ENGLISH ONLY (service screen, not player-facing).
  // Loads the current calibration on open, pre-fills every step, and lets you
  // SKIP any step that's already calibrated (the stored value is kept).
  import { onMount } from 'svelte'
  import { api } from '../api'
  import { mlPerSec, round1, FLOW_TARGETS, type CalibSample, type Dir } from '../calib'
  import NumPad from '../NumPad.svelte'

  let { onclose }: { onclose: () => void } = $props()

  let pad = $state<null | { label: string; unit: string; set: (v: number) => void }>(null)
  const openPad = (label: string, unit: string, set: (v: number) => void) =>
    (pad = { label, unit, set })

  type Phase = 'intro' | 'deadbandIn' | 'deadbandOut' | 'flow' | 'params' | 'review' | 'done'
  let phase = $state<Phase>('intro')

  // values (pre-filled from the stored calibration on mount)
  let deadbandIn = $state<number | null>(null)
  let deadbandOut = $state<number | null>(null)
  let samples = $state<CalibSample[]>([])
  let storedRateIn = $state<number | null>(null)
  let storedRateOut = $state<number | null>(null)
  let volumeMl = $state(0) // 0 = keep stored
  let deadMl = $state(0) // tube dead-space (ml); 0 = keep stored
  let emptyS = $state(0) // override (s); 0 = auto-derive from volume ÷ drain rate
  let primeMl = $state(0) // override (ml); 0 = auto-derive from baseline volume
  let loaded = $state(false)

  // deadband — manual finder (no auto-ramp): adjust duty, hold to test, capture
  let dbDuty = $state(15) // 0..100
  let dbHeld = $state(false)

  // flow measurement
  let flowIdx = $state(0)
  let runSecs = $state(10)
  let running = $state(false)
  let countdown = $state(0)
  let grams = $state(0)

  let timer: ReturnType<typeof setInterval> | null = null
  const clearTimer = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }
  const stopPump = () => api.admin.stop().catch(() => {})
  const holdPump = (dir: Dir, speed: number) => api.admin.pump(dir, speed).catch(() => {})

  function cleanup() {
    clearTimer()
    dbHeld = false
    running = false
    stopPump()
  }
  function close() {
    cleanup()
    onclose()
  }

  onMount(() => {
    api.admin
      .getCalibration()
      .then((c) => {
        deadbandIn = c.deadband_in ?? null
        deadbandOut = c.deadband_out ?? null
        storedRateIn = c.rate_in ?? null
        storedRateOut = c.rate_out ?? null
        volumeMl = c.torso_volume_ml ?? 0
        deadMl = c.dead_space_ml ?? 0
        emptyS = c.empty_overpump_s ?? 0
        primeMl = c.prime_in_ml ?? 0
        // seed measured samples so skipped flow steps keep their stored rate
        samples = Array.isArray(c.samples) ? [...c.samples] : []
        loaded = true
      })
      .catch(() => (loaded = true))
    return cleanup // run on unmount (covers any close path)
  })

  let target = $derived(FLOW_TARGETS[flowIdx])
  let liveRate = $derived(mlPerSec(grams, runSecs))
  const clamp = (v: number) => Math.max(0, Math.min(100, v))
  const sampleAt = (dir: Dir, duty: number) =>
    samples.find((s) => s.dir === dir && Math.abs(s.duty - duty) < 0.001)
  let storedHere = $derived(sampleAt(target.dir, target.duty))

  // --- deadband (manual) ---
  const curDir = (): Dir => (phase === 'deadbandIn' ? 'in' : 'out')
  function enterDeadband(p: 'deadbandIn' | 'deadbandOut') {
    const stored = p === 'deadbandIn' ? deadbandIn : deadbandOut
    dbDuty = stored != null ? Math.round(stored * 100) : 15
    phase = p
  }
  function adjust(d: number) {
    dbDuty = clamp(dbDuty + d)
    if (dbHeld) api.admin.pump(curDir(), dbDuty / 100).catch(() => {}) // live if testing
  }
  function testHold() {
    dbHeld = true
    api.admin.pump(curDir(), dbDuty / 100).catch(() => {})
  }
  function testRelease() {
    dbHeld = false
    stopPump()
  }
  function captureDeadband() {
    const dir = curDir()
    testRelease()
    const v = dbDuty / 100
    if (dir === 'in') {
      deadbandIn = v
      enterDeadband('deadbandOut')
    } else {
      deadbandOut = v
      phase = 'flow'
    }
  }
  function skipDeadband() {
    // keep the stored value untouched, just move on
    testRelease()
    if (curDir() === 'in') enterDeadband('deadbandOut')
    else phase = 'flow'
  }

  // --- flow ---
  function startRun() {
    clearTimer()
    running = true
    countdown = runSecs
    api.admin.run(target.dir, target.duty, runSecs).catch(() => {})
    timer = setInterval(() => {
      countdown = Math.max(0, countdown - 1)
      if (countdown <= 0) {
        clearTimer()
        running = false
      }
    }, 1000)
  }
  function nextFlow() {
    grams = 0
    if (flowIdx + 1 >= FLOW_TARGETS.length) phase = 'params'
    else flowIdx += 1
  }
  function applyFlow() {
    if (liveRate <= 0) return
    // replace any stored sample at this exact dir+duty, then advance
    samples = [
      ...samples.filter((s) => !(s.dir === target.dir && Math.abs(s.duty - target.duty) < 0.001)),
      { dir: target.dir, duty: target.duty, ml_per_s: round1(liveRate) },
    ]
    nextFlow()
  }
  function skipFlow() {
    nextFlow() // keep the stored sample (if any)
  }

  function save() {
    // send only what we want to persist — backend merges (exclude_unset), so
    // unrelated keys survive. Preserve existing rates if no fresh 100% sample.
    const out: Record<string, unknown> = {
      deadband_in: deadbandIn,
      deadband_out: deadbandOut,
      rate_in: rateOf('in') ?? storedRateIn,
      rate_out: rateOf('out') ?? storedRateOut,
      samples,
    }
    // 0 = "keep stored" (never write null over the committed volume default);
    // empty/prime are optional overrides — 0 leaves them auto-derived
    if (volumeMl > 0) out.torso_volume_ml = volumeMl
    if (deadMl > 0) out.dead_space_ml = deadMl
    if (emptyS > 0) out.empty_overpump_s = emptyS
    if (primeMl > 0) out.prime_in_ml = primeMl
    api.admin.saveCalibration(out).catch(() => {})
    phase = 'done'
  }

  const pctOf = (v: number | null) => (v == null ? '–' : Math.round(v * 100) + ' %')
  const rateOf = (d: Dir) => sampleAt(d, 1.0)?.ml_per_s ?? null
  const dirLabel = (d: Dir) => (d === 'in' ? '▲ IN' : '▼ OUT')
  const valOr = (v: number, unit: string) => (v > 0 ? `${v} ${unit}` : 'keep stored')
  const overrideLabel = (v: number, unit: string) => (v > 0 ? `${v} ${unit}` : 'auto (derived)')
</script>

<aside class="wiz">
  <header>
    <h2>Guided calibration</h2>
    {#if phase === 'flow'}<span class="step">Step {flowIdx + 1}/{FLOW_TARGETS.length}</span>{/if}
    <div class="sp"></div>
    <button class="x" onclick={close} aria-label="Close">✕</button>
  </header>

  {#if phase === 'intro'}
    <div class="body">
      <p class="lead">
        Walk through deadband, flow and the reset parameters. Current values are pre-filled — skip
        any step that's already calibrated. First, prime the tubes (hold a button until liquid
        flows).
      </p>
      <div class="primelabel">Prime the tubing — hold</div>
      <div class="prime">
        <button
          class="in"
          onpointerdown={() => holdPump('in', 1)}
          onpointerup={stopPump}
          onpointerleave={stopPump}
          onpointercancel={stopPump}>▲ Pump IN</button
        >
        <button
          class="out"
          onpointerdown={() => holdPump('out', 1)}
          onpointerup={stopPump}
          onpointerleave={stopPump}
          onpointercancel={stopPump}>▼ Pump OUT</button
        >
      </div>
      <button class="primary" onclick={() => enterDeadband('deadbandIn')}>Start</button>
    </div>
  {:else if phase === 'deadbandIn' || phase === 'deadbandOut'}
    <div class="body">
      <h3>Deadband · {dirLabel(curDir())}</h3>
      <p class="lead">
        Find the lowest duty where the rotor just starts turning. Hold to test, then capture.
      </p>
      <div class="current">
        stored: <b>{pctOf(curDir() === 'in' ? deadbandIn : deadbandOut)}</b>
      </div>
      <div class="gauge">{dbDuty}%</div>
      <div class="adjrow">
        <button onclick={() => adjust(-5)}>−5</button>
        <button onclick={() => adjust(-1)}>−1</button>
        <button onclick={() => adjust(1)}>+1</button>
        <button onclick={() => adjust(5)}>+5</button>
      </div>
      <button
        class="test"
        onpointerdown={testHold}
        onpointerup={testRelease}
        onpointerleave={testRelease}
        onpointercancel={testRelease}>Test (hold)</button
      >
      <button class="flows" onclick={captureDeadband}>Capture ({dbDuty}%)</button>
      <button class="ghost" onclick={skipDeadband}>Skip (keep stored)</button>
    </div>
  {:else if phase === 'flow'}
    <div class="body">
      <h3>Flow · {dirLabel(target.dir)} @ {Math.round(target.duty * 100)}%</h3>
      <p class="lead">Run for a fixed time, weigh the liquid (1 g ≈ 1 ml), enter the grams.</p>
      {#if running}
        <div class="gauge">{countdown}s</div>
        <div class="muted">measuring …</div>
      {:else}
        <div class="current">
          stored: <b>{storedHere ? storedHere.ml_per_s + ' ml/s' : '–'}</b>
        </div>
        <div class="secs">
          <span>duration:</span>
          <button class:sel={runSecs === 5} onclick={() => (runSecs = 5)}>5 s</button>
          <button class:sel={runSecs === 10} onclick={() => (runSecs = 10)}>10 s</button>
        </div>
        <button class="primary" onclick={startRun}>Start run ({runSecs} s)</button>
        <div class="glabel">measured amount (g ≈ ml)</div>
        <button class="numfield" onclick={() => openPad('Measured amount', 'g', (v) => (grams = v))}>
          {grams} g
        </button>
        <div class="muted">= <b>{liveRate.toFixed(1)}</b> ml/s</div>
        <button class="flows" onclick={applyFlow} disabled={liveRate <= 0}>Apply &amp; next</button>
        <button class="ghost" onclick={skipFlow}>Skip (keep stored)</button>
      {/if}
    </div>
  {:else if phase === 'params'}
    <div class="body">
      <h3>Reset parameters</h3>
      <p class="lead">
        Empty &amp; prime times <b>auto-derive</b> from the torso volume and flow rates — set an
        override only to force a value. Volume + dead-space feed the calculation.
      </p>
      <button class="numfield wide" onclick={() => openPad('Torso volume', 'ml', (v) => (volumeMl = v))}>
        <span>Torso volume (level 0→100)</span><b>{valOr(volumeMl, 'ml')}</b>
      </button>
      <button class="numfield wide" onclick={() => openPad('Tube dead-space', 'ml', (v) => (deadMl = v))}>
        <span>Tube dead-space</span><b>{valOr(deadMl, 'ml')}</b>
      </button>
      <button class="numfield wide" onclick={() => openPad('Empty time override', 's', (v) => (emptyS = v))}>
        <span>Empty time override</span><b>{overrideLabel(emptyS, 's')}</b>
      </button>
      <button class="numfield wide" onclick={() => openPad('Prime override', 'ml', (v) => (primeMl = v))}>
        <span>Prime override</span><b>{overrideLabel(primeMl, 'ml')}</b>
      </button>
      <button class="primary" onclick={() => (phase = 'review')}>Next</button>
    </div>
  {:else if phase === 'review'}
    <div class="body">
      <h3>Review &amp; save</h3>
      <div class="results">
        <div>Deadband {dirLabel('in')}: <b>{pctOf(deadbandIn)}</b></div>
        <div>Deadband {dirLabel('out')}: <b>{pctOf(deadbandOut)}</b></div>
        <div>Rate {dirLabel('in')} @100%: <b>{rateOf('in') ?? storedRateIn ?? '–'}</b> ml/s</div>
        <div>Rate {dirLabel('out')} @100%: <b>{rateOf('out') ?? storedRateOut ?? '–'}</b> ml/s</div>
        <div>Torso volume: <b>{volumeMl > 0 ? volumeMl + ' ml' : 'kept'}</b></div>
        <div>Dead-space: <b>{deadMl > 0 ? deadMl + ' ml' : 'kept'}</b></div>
        <div>Empty time: <b>{emptyS > 0 ? emptyS + ' s (override)' : 'auto'}</b></div>
        <div>Prime: <b>{primeMl > 0 ? primeMl + ' ml (override)' : 'auto'}</b></div>
      </div>
      <table class="samples">
        <thead><tr><th>Dir</th><th>Duty</th><th>ml/s</th></tr></thead>
        <tbody>
          {#each samples as s}
            <tr><td>{s.dir}</td><td>{Math.round(s.duty * 100)}%</td><td>{s.ml_per_s}</td></tr>
          {/each}
        </tbody>
      </table>
      <button class="primary" onclick={save}>Save calibration</button>
      <button class="ghost" onclick={close}>Discard</button>
    </div>
  {:else if phase === 'done'}
    <div class="body">
      <p class="lead ok">Calibration saved ✓</p>
      <p class="lead">Stored in backend/calibration.json (survives reboots, loaded on boot).</p>
      <button class="primary" onclick={close}>Close</button>
    </div>
  {/if}

  {#if pad}
    <NumPad
      label={pad.label}
      unit={pad.unit}
      onsubmit={(v) => {
        pad?.set(v)
        pad = null
      }}
      oncancel={() => (pad = null)}
    />
  {/if}
</aside>

<style>
  .wiz {
    position: absolute;
    inset: 0;
    background: #080b16;
    padding: 14px 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 60;
    overflow-y: auto;
    scrollbar-width: none; /* hide scrollbar on the kiosk */
  }
  .wiz::-webkit-scrollbar {
    display: none;
  }
  header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  h2 {
    font-size: 20px;
  }
  .step {
    font-size: 12px;
    font-weight: 800;
    color: var(--dim);
  }
  .sp {
    flex: 1;
  }
  .x {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    width: 44px;
    height: 44px;
    font-size: 18px;
  }
  .body {
    flex: 1;
    max-width: 560px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    justify-content: center;
  }
  h3 {
    font-size: 22px;
    text-align: center;
  }
  .lead {
    font-size: 16px;
    line-height: 1.5;
    color: var(--dim);
    text-align: center;
    margin: 0;
  }
  .lead.ok {
    color: var(--green, #1f9d6b);
    font-size: 22px;
    font-weight: 800;
  }
  .current {
    text-align: center;
    font-size: 14px;
    color: var(--dim);
  }
  .current b {
    color: #e8edff;
  }
  .gauge {
    font-size: 52px;
    font-weight: 900;
    text-align: center;
    color: var(--spm-cyan, #00beca);
  }
  .muted {
    text-align: center;
    color: var(--dim);
    font-size: 18px;
  }
  .muted b {
    color: var(--spm-cyan, #00beca);
    font-size: 22px;
  }
  button {
    border: none;
    border-radius: 14px;
    padding: 15px;
    font-size: 18px;
    font-weight: 800;
    touch-action: manipulation;
  }
  .primary {
    background: var(--spm-cyan, #00beca);
    color: #04222a;
  }
  .primelabel {
    font-size: 14px;
    color: var(--dim);
    text-align: center;
  }
  .prime {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .prime .in {
    background: #1f9d6b;
    color: #fff;
    touch-action: none;
  }
  .prime .out {
    background: #3b7bd6;
    color: #fff;
    touch-action: none;
  }
  .prime button:active {
    transform: scale(0.97);
  }
  .flows {
    background: #1f9d6b;
    color: #fff;
  }
  .flows:disabled {
    opacity: 0.4;
  }
  .test {
    background: #3b7bd6;
    color: #fff;
    touch-action: none;
  }
  .test:active {
    transform: scale(0.98);
  }
  .ghost {
    background: var(--surface);
    border: 1px solid var(--border);
    color: #e8edff;
    font-weight: 600;
    font-size: 15px;
    padding: 12px;
  }
  .adjrow {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  .adjrow button {
    background: #1b2440;
    border: 1px solid var(--border);
    color: #e8edff;
    padding: 16px 0;
  }
  .secs {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
    color: var(--dim);
    font-size: 14px;
  }
  .secs button {
    padding: 10px 16px;
    font-size: 15px;
    background: #1b2440;
    border: 1px solid var(--border);
    color: #e8edff;
  }
  .secs button.sel {
    background: var(--spm-cyan, #00beca);
    color: #04222a;
    border-color: var(--spm-cyan, #00beca);
  }
  .glabel {
    font-size: 14px;
    color: var(--dim);
    text-align: center;
  }
  .numfield {
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid var(--border);
    color: #e8edff;
    font-size: 26px;
    font-weight: 800;
  }
  .numfield.wide {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 20px;
    padding: 16px 18px;
  }
  .numfield.wide span {
    font-size: 14px;
    color: var(--dim);
    font-weight: 600;
  }
  .results {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 14px 16px;
    font-size: 15px;
    line-height: 1.8;
  }
  .samples {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  .samples th,
  .samples td {
    border: 1px solid var(--border);
    padding: 6px 10px;
    text-align: center;
  }
  .samples th {
    color: var(--dim);
    font-weight: 700;
  }
</style>
