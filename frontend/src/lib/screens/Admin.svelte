<script lang="ts">
  // Admin / service panel. ENGLISH ONLY — this screen is never shown to players,
  // so it deliberately bypasses i18n (no t() calls, no locale keys).
  import { onMount } from 'svelte'
  import { game } from '../game.svelte'
  import { api, type SystemHealth, type PreparePlan } from '../api'
  import CalibWizard from './CalibWizard.svelte'
  import NumPad from '../NumPad.svelte'

  let { onclose }: { onclose: () => void } = $props()

  type Tab = 'pump' | 'calibration' | 'setup' | 'system'
  let tab = $state<Tab>('setup')
  // the Calibration tab is split into two sub-tabs so neither view is cramped
  let calSub = $state<'values' | 'deadspace'>('values')

  let wizard = $state(false)
  let pad = $state<null | { label: string; unit: string; set: (v: number) => void }>(null)
  const openPad = (label: string, unit: string, set: (v: number) => void) =>
    (pad = { label, unit, set })

  type Dir = 'in' | 'out' | 'stop'

  let speed = $state(60) // 0..100 (%)
  let held = $state<Dir | null>(null)
  // a manual job is live (held jog OR a running timed run) -> the slider live-adjusts it
  let running = $state(false)
  let runDir = $state<Dir>('stop')
  let timedLeft = $state(0)
  let timedTimer: ReturnType<typeof setInterval> | null = null
  const clearTimed = () => {
    if (timedTimer) clearInterval(timedTimer)
    timedTimer = null
    timedLeft = 0
  }

  // full calibration, loaded for the read-only Calibration display
  let cal = $state<Record<string, any> | null>(null)
  const loadCal = () => api.admin.getCalibration().then((c) => (cal = c)).catch(() => {})

  // edit a single calibration field (via NumPad) and persist it (merge-save), then refresh
  async function saveCal(patch: Record<string, number | null>) {
    await api.admin.saveCalibration(patch).catch(() => {})
    await loadCal()
  }

  // --- dead-space measurement: two-run difference (flushed tube vs dry tube) -----
  // Pump the SAME timed IN run twice — once with the line FULL, once DRY. The torso
  // gets `dead_space` less on the dry run (the tube swallows its own volume first), so
  // the difference in torso fill (weigh each, 1 g ≈ 1 ml) IS the dead-space. No reliance
  // on absolute flow accuracy: the two identical runs cancel the rate.
  type DsStep = 'idle' | 'runA' | 'measA' | 'runB' | 'measB' | 'done'
  let ds = $state<{ step: DsStep; duty: number; secs: number; a: number | null; b: number | null; left: number }>(
    { step: 'idle', duty: 60, secs: 10, a: null, b: null, left: 0 },
  )
  let dsTimer: ReturnType<typeof setInterval> | null = null
  let dsResult = $derived(ds.a != null && ds.b != null ? Math.round((ds.a - ds.b) * 10) / 10 : null)

  const dsClearTimer = () => {
    if (dsTimer) clearInterval(dsTimer)
    dsTimer = null
    ds.left = 0
  }
  function dsStop() {
    dsClearTimer()
    api.admin.stop().catch(() => {})
  }
  function dsReset() {
    dsStop()
    ds = { step: 'idle', duty: ds.duty, secs: ds.secs, a: null, b: null, left: 0 }
  }
  // timed IN run; advance to `next` when it finishes (the backend auto-stops the pump)
  function dsRun(next: DsStep) {
    dsClearTimer()
    api.admin.run('in', ds.duty / 100, ds.secs).catch(() => {})
    ds.left = ds.secs
    dsTimer = setInterval(() => {
      ds.left = Math.max(0, ds.left - 1)
      if (ds.left <= 0) {
        dsClearTimer()
        ds.step = next
      }
    }, 1000)
  }
  // hold-to-pump for priming (IN) / drying (OUT) the line between runs
  const dsHold = (dir: Dir) => api.admin.pump(dir, ds.duty / 100).catch(() => {})
  const dsRelease = () => api.admin.stop().catch(() => {})
  const dsSetDuty = () =>
    openPad('Run duty %', ' %', (v) => (ds.duty = Math.max(1, Math.min(100, Math.round(v)))))
  const dsSetSecs = () =>
    openPad('Run seconds', ' s', (v) => (ds.secs = Math.max(1, Math.min(60, Math.round(v)))))
  const dsEnterA = () =>
    openPad('Torso fill A — flushed (ml)', ' ml', (v) => { ds.a = v; ds.step = 'runB' })
  const dsEnterB = () =>
    openPad('Torso fill B — dry (ml)', ' ml', (v) => { ds.b = v; ds.step = 'done' })

  // the re-home plan (derived empty/prime durations) for the Reset tab
  let plan = $state<PreparePlan | null>(null)
  const loadPlan = () => api.admin.preparePlan().then((p) => (plan = p)).catch(() => {})

  // system health (overlay lock + SoC temp/throttle), polled every 3 s
  let health = $state<SystemHealth | null>(null)
  let healthTimer: ReturnType<typeof setInterval> | null = null
  const pollHealth = () => api.admin.system().then((h) => (health = h)).catch(() => {})

  // clean power control (two-tap confirm)
  let powerPending = $state<null | 'shutdown' | 'reboot'>(null)
  let powerMsg = $state('')
  let powerTimer: ReturnType<typeof setTimeout> | null = null

  let cap = $derived(game.level?.capacity ?? 100)
  let isReal = $derived(game.level?.backend === 'real')
  let overlay = $derived(health?.overlay ?? 'unknown')

  // enter manual mode on open, leave (auto resumes + pump stops) on close
  onMount(() => {
    api.admin.manual(true).catch(() => {})
    loadCal()
    loadPlan()
    pollHealth()
    healthTimer = setInterval(pollHealth, 3000)
    return () => {
      clearTimed()
      dsClearTimer()
      if (healthTimer) clearInterval(healthTimer)
      if (powerTimer) clearTimeout(powerTimer)
      if (autoSim) api.dev.clearSim().catch(() => {})
      api.admin.manual(false).catch(() => {})
    }
  })

  // --- manual jog --------------------------------------------------------
  const go = (dir: Dir) => api.admin.pump(dir, speed / 100).catch(() => {})
  function stop() {
    clearTimed()
    held = null
    running = false
    runDir = 'stop'
    api.admin.stop().catch(() => {})
  }
  function hold(dir: Dir) {
    clearTimed()
    held = dir
    running = true
    runDir = dir
    go(dir)
  }
  function onSpeed() {
    // live-adjust whatever is currently running (held jog OR a timed run) — this is
    // the fix for "can't change speed during a 60 s run"
    if (running) api.admin.setSpeed(speed / 100).catch(() => {})
  }
  function timed(dir: Dir, seconds: number) {
    clearTimed()
    held = null
    running = true
    runDir = dir
    timedLeft = seconds
    api.admin.run(dir, speed / 100, seconds).catch(() => {})
    timedTimer = setInterval(() => {
      timedLeft = Math.max(0, timedLeft - 1)
      if (timedLeft <= 0) {
        clearTimed()
        running = false
        runDir = 'stop'
      }
    }, 1000)
  }

  // --- setup workflow: initialize (ready a game) + home/marks --------------
  // Initialize = the between-runs re-home, run by hand for the first game: empties,
  // fills to baseline, anchors. The blueprint for how every game prepares itself.
  //
  // On the dev mock, prepare/home normally shortcut straight to the end (fast). When
  // you press the admin buttons we instead seed the physics sim from the current
  // level so the VIRTUAL TORSO shows the *real* empty→refill, then auto-clear it once
  // it settles. The game's own between-runs re-home is untouched (stays instant).
  let autoSim = $state(false)
  async function devSeedThen(run: () => Promise<unknown>, seed?: number) {
    if (!isReal && !game.level?.sim_active) {
      autoSim = true
      await api.dev.simulateStart(seed ?? game.level?.level ?? 20).catch(() => {})
    }
    run().catch(() => {})
  }
  const doInit = () => devSeedThen(() => api.admin.prepare())
  const doHome = () => devSeedThen(() => api.admin.home())
  // prime-only assumes a hand-emptied torso → seed the dev sim from empty so the
  // virtual torso shows the genuine fill-from-empty (not an overfill from wherever)
  const doPrime = () => devSeedThen(() => api.admin.prime(), 0)
  const doGoto = (level: number) => api.admin.goto(level).catch(() => {})

  // once an auto-seeded init/home settles, return the mock to its fast shortcut mode
  $effect(() => {
    const s = game.level
    if (autoSim && s?.homed && !s.pump_busy && !s.moving) {
      autoSim = false
      api.dev.clearSim().catch(() => {})
    }
  })
  // DEV (mock only): rehearse the init against an unknown pre-filled torso
  const doSimStart = (fill: number) => api.dev.simulateStart(fill).catch(() => {})
  const doClearSim = () => api.dev.clearSim().catch(() => {})
  // a move is in flight (real: a timed sequence; mock: the twin still drifting)
  let driving = $derived(!!(game.level?.pump_busy || game.level?.moving))
  // the taped reference levels, straight from the controller config
  let marks = $derived.by<{ label: string; level: number; cls: string }[]>(() => {
    const l = game.level
    if (!l) return []
    return [
      { label: 'Baseline', level: Math.round(l.baseline), cls: 'base' },
      { label: 'Crit-low', level: Math.round(l.critical_low), cls: 'crit' },
      { label: 'Band low', level: Math.round(l.band_low), cls: 'band' },
      { label: 'Band high', level: Math.round(l.band_high), cls: 'band' },
      { label: 'Crit-high', level: Math.round(l.critical_high), cls: 'crit' },
    ]
  })

  // two-tap confirm: first tap arms (auto-disarms after 4 s), second tap fires
  function armPower(action: 'shutdown' | 'reboot') {
    if (powerPending === action) {
      if (powerTimer) clearTimeout(powerTimer)
      powerPending = null
      powerMsg =
        action === 'shutdown'
          ? 'Shutting down … unplug power only once the screen is off.'
          : 'Rebooting …'
      api.admin[action]().catch(() => {})
      return
    }
    powerPending = action
    if (powerTimer) clearTimeout(powerTimer)
    powerTimer = setTimeout(() => (powerPending = null), 4000)
  }

  // --- display helpers ---------------------------------------------------
  const pct = (f: number | undefined) => Math.round((f ?? 0) * 100)
  const dutyPct = (v: any) => (v == null ? '–' : Math.round(v * 100) + '%')
  const val = (v: any, suffix = '') => (v == null || v === '' ? '–' : `${v}${suffix}`)
  const dirArrow = (d: Dir) => (d === 'in' ? '▲ IN' : d === 'out' ? '▼ OUT' : '–')

  // temperature badge severity
  let tempLevel = $derived.by<'ok' | 'warn' | 'bad' | null>(() => {
    const c = health?.temp_c
    if (c == null) return null
    if (c >= 75) return 'bad'
    if (c >= 65) return 'warn'
    return 'ok'
  })

  // throttle badge: any "now" flag -> bad, any "ever" flag -> warn, else ok
  let throttle = $derived.by<{ level: 'ok' | 'warn' | 'bad'; label: string } | null>(() => {
    const h = health
    if (!h || h.throttled == null) return null
    const now: string[] = []
    if (h.under_voltage_now) now.push('Under-voltage')
    if (h.throttled_now) now.push('Throttled')
    if (h.freq_capped_now) now.push('Freq capped')
    if (h.soft_temp_now) now.push('Temp limit')
    if (now.length) return { level: 'bad', label: now.join(' · ') }
    const ever: string[] = []
    if (h.under_voltage_ever) ever.push('under-volt')
    if (h.throttled_ever) ever.push('throttle')
    if (h.freq_capped_ever) ever.push('freq-cap')
    if (h.soft_temp_ever) ever.push('temp-limit')
    if (ever.length) return { level: 'warn', label: 'Past: ' + ever.join(', ') }
    return { level: 'ok', label: 'Power OK' }
  })
</script>

<aside class="admin">
  <header>
    <h2>Admin</h2>
    <span class="badge" class:real={isReal}>{isReal ? 'REAL' : 'MOCK'}</span>
    {#if game.level?.version}<span class="ver">v{game.level.version}</span>{/if}
    <div class="spacer"></div>
    {#if health?.temp_c != null && tempLevel}
      <span
        class="badge stat {tempLevel}"
        class:sim={health.simulated}
        title={health.simulated ? 'simulated (dev PC)' : 'SoC temperature'}
        >🌡 {health.temp_c.toFixed(1)}°C{#if health.simulated}<i> sim</i>{/if}</span
      >
    {/if}
    {#if throttle}
      <span
        class="badge stat {throttle.level}"
        title={health?.throttled ? `throttled=${health.throttled}` : ''}
        >{throttle.level === 'ok' ? '⚡' : throttle.level === 'warn' ? '⚠' : '🔥'}
        {throttle.label}</span
      >
    {/if}
    <button class="x" onclick={onclose} aria-label="Close">✕</button>
  </header>

  <nav class="tabs">
    <button class:on={tab === 'setup'} onclick={() => (tab = 'setup')}>Setup</button>
    <button class:on={tab === 'pump'} onclick={() => (tab = 'pump')}>Pump</button>
    <button class:on={tab === 'calibration'} onclick={() => (tab = 'calibration')}
      >Calibration</button
    >
    <button class:on={tab === 'system'} onclick={() => (tab = 'system')}>System</button>
  </nav>

  <div class="panel">
    {#if tab === 'pump'}
      <p class="pumpnote">
        Raw motor control — the level is <b>not tracked</b> here. To get to a known state, use
        <b>Setup → Home</b>.
      </p>
      <div class="speed">
        <label for="sp">Speed: <b>{speed}%</b></label>
        <input id="sp" type="range" min="0" max="100" bind:value={speed} oninput={onSpeed} />
      </div>

      <div class="pump">
        <button
          class="in"
          onpointerdown={() => hold('in')}
          onpointerup={stop}
          onpointerleave={stop}
          onpointercancel={stop}>▲ Pump IN</button
        >
        <button
          class="out"
          onpointerdown={() => hold('out')}
          onpointerup={stop}
          onpointerleave={stop}
          onpointercancel={stop}>▼ Pump OUT</button
        >
      </div>
      <div class="hint">hold to pump · the speed slider adjusts a running job live</div>

      <div class="runrow">
        {#if running}
          <div class="runinfo">
            Running {dirArrow(runDir)} @ {speed}%{#if timedLeft > 0} · {timedLeft}s left{/if}
          </div>
        {:else}
          <div class="runinfo idle">idle</div>
        {/if}
        <button class="stop" onclick={stop}>■ Stop</button>
      </div>

      <div class="block">
        <div class="bhead">Timed run (auto-stop)</div>
        <div class="timed">
          {#each [15, 30, 60] as s}
            <button onclick={() => timed('in', s)}>▲ {s}s</button>
          {/each}
        </div>
        <div class="timed">
          {#each [15, 30, 60] as s}
            <button onclick={() => timed('out', s)}>▼ {s}s</button>
          {/each}
        </div>
      </div>
    {:else if tab === 'calibration'}
      <div class="subtabs">
        <button class:on={calSub === 'values'} onclick={() => (calSub = 'values')}>Values</button>
        <button class:on={calSub === 'deadspace'} onclick={() => (calSub = 'deadspace')}>Dead space</button>
      </div>
      {#if calSub === 'values'}
      <button class="wizbtn" onclick={() => (wizard = true)}>▶ Start guided calibration</button>
      <p class="hint">
        All calibration values are set in the guided flow — it now pre-fills the current values
        and lets you skip any step that's already calibrated.
      </p>

      <div class="block">
        <div class="bhead">Current calibration <span class="dim">· tap a ✎ value to edit</span></div>
        <div class="vgrid">
          <div><span>Deadband IN</span><b>{dutyPct(cal?.deadband_in)}</b></div>
          <div><span>Deadband OUT</span><b>{dutyPct(cal?.deadband_out)}</b></div>
          <div><span>Rate IN</span><b>{val(cal?.rate_in, ' ml/s')}</b></div>
          <div><span>Rate OUT</span><b>{val(cal?.rate_out, ' ml/s')}</b></div>
          <button class="vedit" onclick={() => openPad('Torso volume', ' ml', (v) => saveCal({ torso_volume_ml: v }))}>
            <span>Torso volume ✎</span><b>{val(cal?.torso_volume_ml, ' ml')}</b>
          </button>
          <button class="vedit" onclick={() => openPad('Torso dead space', ' ml', (v) => saveCal({ torso_dead_space_ml: v }))}>
            <span>Torso dead ✎</span><b>{val(cal?.torso_dead_space_ml, ' ml')}</b>
          </button>
          <button class="vedit" onclick={() => openPad('Dead space', ' ml', (v) => saveCal({ dead_space_ml: v }))}>
            <span>Dead space ✎</span><b>{val(cal?.dead_space_ml, ' ml')}</b>
          </button>
          <button class="vedit" onclick={() => openPad('Overpump margin', ' ml', (v) => saveCal({ overpump_ml: v }))}>
            <span>Overpump ✎</span><b>{val(cal?.overpump_ml, ' ml')}</b>
          </button>
          <button class="vedit" onclick={() => openPad('Prime duty', ' %', (v) => saveCal({ prime_duty: Math.max(5, Math.min(100, v)) / 100 }))}>
            <span>Prime duty ✎</span><b>{dutyPct(cal?.prime_duty)}</b>
          </button>
          <div><span>Empty time</span><b>{val(cal?.empty_overpump_s, ' s')}</b></div>
          <div><span>Prime</span><b>{val(cal?.prime_in_ml, ' ml')}</b></div>
          <div><span>Flow samples</span><b>{cal?.samples?.length ?? 0}</b></div>
        </div>
      </div>
      {:else}
      <div class="block">
        <div class="bhead">Measure dead space <span class="dim">· two-run difference</span></div>
        <div class="dsrow">
          <button class="dscfg" onclick={dsSetDuty}>Duty <b>{ds.duty}%</b></button>
          <button class="dscfg" onclick={dsSetSecs}>Run <b>{ds.secs}s</b></button>
          {#if ds.step !== 'idle'}<button class="dsrestart" onclick={dsReset}>↺ Restart</button>{/if}
        </div>

        {#if ds.step === 'idle'}
          <p class="hint dsleft">
            Pumps the same {ds.secs}s IN run twice — once with the tube <b>full</b>, once <b>dry</b>.
            The tube swallows its own volume on the dry run, so the difference in torso fill (weigh
            each, 1 g ≈ 1 ml) is the dead-space. Start each run from an empty torso.
          </p>
          <button class="dsgo" onclick={() => (ds.step = 'runA')}>① Begin</button>
        {:else if ds.step === 'runA' || ds.step === 'runB'}
          {@const isA = ds.step === 'runA'}
          <p class="hint dsleft">
            {#if isA}
              <b>Run A — flushed:</b> make sure the line is <b>full of water</b> (hold ▲ to prime),
              torso empty, then run.
            {:else}
              <b>Run B — dry:</b> empty the torso and run the line <b>dry</b> (hold ▼ until it pulls
              air), then run.
            {/if}
          </p>
          <div class="dsprime">
            <button onpointerdown={() => dsHold('in')} onpointerup={dsRelease} onpointerleave={dsRelease} onpointercancel={dsRelease}>▲ Prime (IN)</button>
            <button onpointerdown={() => dsHold('out')} onpointerup={dsRelease} onpointerleave={dsRelease} onpointercancel={dsRelease}>▼ Dry (OUT)</button>
          </div>
          {#if ds.left > 0}
            <div class="runrow">
              <div class="runinfo">Running ▲ IN @ {ds.duty}% · {ds.left}s left</div>
              <button class="stop" onclick={dsStop}>■ Stop</button>
            </div>
          {:else}
            <button class="dsgo" onclick={() => dsRun(isA ? 'measA' : 'measB')}>
              ▶ Run {isA ? 'A' : 'B'} — IN {ds.secs}s @ {ds.duty}%
            </button>
          {/if}
        {:else if ds.step === 'measA' || ds.step === 'measB'}
          {@const isA = ds.step === 'measA'}
          <p class="hint dsleft">
            Drain the torso and weigh the water added on run {isA ? 'A' : 'B'} (1 g ≈ 1 ml), then enter it.
          </p>
          <button class="dsgo" onclick={isA ? dsEnterA : dsEnterB}>Enter fill {isA ? 'A (flushed)' : 'B (dry)'} …</button>
        {:else if ds.step === 'done'}
          <div class="vgrid dsvg">
            <div><span>Fill A · flushed</span><b>{val(ds.a, ' ml')}</b></div>
            <div><span>Fill B · dry</span><b>{val(ds.b, ' ml')}</b></div>
          </div>
          <p class="dsresult">Dead space = A − B = <b>{dsResult ?? '–'} ml</b></p>
          {#if dsResult != null && dsResult >= 0}
            <button class="dsgo save" onclick={() => { if (dsResult != null) saveCal({ dead_space_ml: dsResult }); dsReset() }}>✓ Save {dsResult} ml as dead space</button>
          {:else}
            <p class="hint">Fill A should exceed B (the dry run delivers less). Re-check and restart.</p>
          {/if}
        {/if}
      </div>
      {/if}
    {:else if tab === 'setup'}
      <div class="block trust" class:homed={game.level?.homed}>
        {#if game.level?.homed}
          <p class="tstate ok">✓ READY — torso known to be at level {Math.round(game.level?.level ?? 0)} / {cap}.</p>
        {:else}
          <p class="tstate bad">
            ⚠ NOT READY — the torso may hold water the system doesn't know about. Press
            <b>Initialize</b> before the first game.
          </p>
        {/if}
        {#if game.level?.sim_active}
          <p class="simline">
            🧪 DEV sim: real water is actually <b>{Math.round(game.level.sim_level)}%</b>
            ({Math.round(game.level.sim_level_ml)} ml) — watch the virtual torso.
          </p>
        {/if}
      </div>

      <div class="block">
        <div class="bhead">① Initialize — start of day / first game</div>
        <div class="op">
          <div class="opbtns">
            <button class="prepare big" onclick={doInit} disabled={driving}>▶ Initialize the system</button>
            <button class="prime-only" onclick={doPrime} disabled={driving}>↥ Prime only — already empty</button>
          </div>
          <div class="opdesc">
            <p>
              <b>Initialize</b> empties the torso, then fills to the baseline{#if plan} (~{Math.round(plan.empty_s + plan.prime_s)}s){/if}
              — a full re-home; the system then knows where the water is. Do this once on power-up.
            </p>
            <p>
              <b>Prime only</b> skips draining — assumes you've emptied the torso <b>by hand</b>, then
              just primes to baseline{#if plan} (~{Math.round(plan.prime_s)}s){/if}. Overfills if it wasn't empty.
            </p>
          </div>
        </div>
        {#if game.level?.pump_busy}<p class="powermsg">Initializing … keep hands clear of the pump.</p>{/if}
      </div>

      <div class="block">
        <div class="bhead">② Mark the torso (setup only)</div>
        <div class="op">
          <button class="empty-btn" onclick={doHome} disabled={driving}>⌂ Home (empty → 0)</button>
          <p>Drains to a known empty (level 0) so you can tape each waterline from the bottom up.</p>
        </div>
        <div class="marks">
          {#each marks as m}
            <button
              class="mark {m.cls}"
              disabled={!game.level?.homed || driving}
              onclick={() => doGoto(m.level)}
            >
              <span>{m.label}</span><b>{m.level}</b>
            </button>
          {/each}
        </div>
        <p class="hint">
          {#if !game.level?.homed}
            Initialize or Home first to unlock these.
          {:else if game.level?.pump_busy}
            Pumping … keep hands clear of the pump.
          {:else}
            Drives the exact volume to each level — wait until it settles, then tape the waterline.
            Green band = {marks[2]?.level ?? '–'}–{marks[3]?.level ?? '–'}.
          {/if}
        </p>
      </div>

      {#if !isReal}
        <div class="block dev">
          <div class="bhead">DEV · simulate a system start with unknown water</div>
          <div class="devrow">
            {#each [20, 50, 90] as f}
              <button onclick={() => doSimStart(f)}>Start @ {f}%</button>
            {/each}
            <button class="clear" onclick={doClearSim}>Clear sim</button>
          </div>
          <p class="hint">
            <b>Initialize</b> / <b>Home</b> already show the real drain→refill on the virtual torso
            here. Use these to start from a specific <i>unknown</i> fill (then Initialize). Sim runs
            ~6× speed; it auto-clears after a button-triggered init.
          </p>
        </div>
      {/if}
    {:else if tab === 'system'}
      <div class="block">
        <div class="bhead">
          Read-only overlay
          {#if overlay !== 'unknown'}
            <span class="lock" class:locked={overlay === 'on'}>
              {overlay === 'on' ? '🔒 LOCKED' : '🔓 WRITABLE'}
            </span>
          {/if}
        </div>
        <p class="hint">
          {#if overlay === 'on'}
            The root filesystem is read-only (power-cut safe). Changes won't survive a reboot.
          {:else if overlay === 'off'}
            The root filesystem is writable. Enable the overlay before exhibition use.
          {:else}
            Overlay status is only available on the Pi.
          {/if}
        </p>
      </div>

      <div class="block">
        <div class="bhead">Board health{#if health?.simulated}<i class="dim"> · simulated (dev)</i>{/if}</div>
        <div class="vgrid">
          <div><span>Temperature</span><b>{health?.temp_c != null ? health.temp_c.toFixed(1) + ' °C' : '–'}</b></div>
          <div><span>Throttle</span><b>{health?.throttled ?? '–'}</b></div>
          <div><span>Under-voltage now</span><b>{health?.under_voltage_now ? 'YES' : 'no'}</b></div>
          <div><span>Throttled now</span><b>{health?.throttled_now ? 'YES' : 'no'}</b></div>
          <div><span>Under-voltage ever</span><b>{health?.under_voltage_ever ? 'yes' : 'no'}</b></div>
          <div><span>Throttled ever</span><b>{health?.throttled_ever ? 'yes' : 'no'}</b></div>
        </div>
      </div>

      <div class="block">
        <div class="bhead">Power</div>
        {#if powerMsg}
          <p class="powermsg">{powerMsg}</p>
        {:else}
          <div class="powerrow">
            <button class="reboot" class:arm={powerPending === 'reboot'} onclick={() => armPower('reboot')}>
              {powerPending === 'reboot' ? 'Tap again to reboot' : '↻ Reboot'}
            </button>
            <button class="shutdown" class:arm={powerPending === 'shutdown'} onclick={() => armPower('shutdown')}>
              {powerPending === 'shutdown' ? 'Tap again to shut down' : '⏻ Shut down'}
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- always-visible live telemetry strip -->
  <div class="statusbar">
    {#if game.level}
      {#if game.level.homed}
        <span>Level <b>{Math.round(game.level.level)}</b>/{cap}</span>
        <span><b>{Math.round(game.level.level_ml ?? 0)}</b>/{Math.round(game.level.torso_volume_ml ?? 0)} ml</span>
        <span>Zone <b>{game.level.zone ?? '–'}</b></span>
      {:else}
        <span class="dim">Level <b>?</b> · not homed</span>
      {/if}
      <span>Pump <b>{dirArrow((game.level.pump_direction ?? 'stop') as Dir)}</b> {pct(game.level.pump_speed)}%</span>
      <span>Flow <b>{game.level.pump_flow_ml_s ?? 0}</b> ml/s</span>
      <span class="run" class:on={game.level.pump_running}>{game.level.pump_running ? 'RUNNING' : 'stopped'}</span>
    {:else}
      <span class="dim">waiting for telemetry …</span>
    {/if}
  </div>

  <footer>
    <kbd>A</kbd>/<kbd>Esc</kbd> closes · open: triple-tap the logo
    {#if !isReal}<span class="note"> · MOCK mode — no real pump, simulation only</span>{/if}
  </footer>

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

  {#if wizard}<CalibWizard onclose={() => { wizard = false; loadCal() }} />{/if}
</aside>

<style>
  .admin {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: #0a0e1c;
    padding: 14px 22px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 50;
    overflow: hidden; /* no scrolling — everything fits via tabs */
  }
  .admin button {
    touch-action: manipulation;
  }
  header {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  h2 {
    font-size: 20px;
  }
  .spacer {
    flex: 1;
  }
  .badge {
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 1px;
    padding: 4px 10px;
    border-radius: 999px;
    background: #6b7794;
    color: #04222a;
    white-space: nowrap;
  }
  .badge.real {
    background: var(--green, #1f9d6b);
    color: #fff;
  }
  .badge.stat {
    letter-spacing: 0.3px;
    font-weight: 800;
  }
  .badge.stat.ok {
    background: var(--green, #1f9d6b);
    color: #fff;
  }
  .badge.stat.warn {
    background: #e0a23a;
    color: #2a1c04;
  }
  .badge.stat.bad {
    background: #d6453b;
    color: #fff;
  }
  .badge.stat i {
    font-style: normal;
    opacity: 0.7;
    font-weight: 600;
  }
  .ver {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid var(--border);
    color: var(--dim);
    font-variant-numeric: tabular-nums;
  }
  .note {
    color: #ffb4ad;
  }
  .x {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    width: 44px;
    height: 44px;
    font-size: 18px;
  }

  /* tab bar */
  .tabs {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  .tabs button {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 0;
    font-size: 16px;
    font-weight: 800;
    color: var(--dim);
  }
  .tabs button.on {
    background: linear-gradient(120deg, var(--spm-cyan, #00beca), var(--green, #1f9d6b));
    color: #04222a;
    border-color: transparent;
  }

  /* secondary segmented control inside a tab (e.g. Calibration → Values / Dead space) */
  .subtabs {
    display: inline-flex;
    gap: 6px;
    align-self: start;
    padding: 4px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--border);
    border-radius: 12px;
  }
  .subtabs button {
    background: transparent;
    border: none;
    border-radius: 9px;
    padding: 9px 22px;
    font-size: 14px;
    font-weight: 700;
    color: var(--dim);
  }
  .subtabs button.on {
    background: var(--surface2);
    color: var(--spm-cyan-bright, #28e6e0);
  }

  /* tab content — fills the remaining height. Fits without scrolling on the real Pi
     (Setup has no dev block there); the dev-PC-only sim block can make Setup taller,
     so allow it to scroll instead of spilling onto the telemetry strip. */
  .panel {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
  }

  .speed label {
    font-size: 15px;
    color: var(--dim);
  }
  input[type='range'] {
    width: 100%;
    height: 46px;
  }
  .pump {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .pump button {
    padding: 30px 0;
    border-radius: 16px;
    font-size: 20px;
    font-weight: 800;
    color: #fff;
    touch-action: none;
  }
  .pump .in {
    background: #1f9d6b;
  }
  .pump .out {
    background: #3b7bd6;
  }
  .pump button:active {
    transform: scale(0.97);
  }
  .hint {
    font-size: 12px;
    color: var(--dim);
    line-height: 1.5;
    margin: 0;
    text-align: center;
  }
  .pumpnote {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: var(--dim);
    background: rgba(224, 162, 58, 0.12);
    border: 1px solid #e0a23a;
    border-radius: 10px;
    padding: 8px 12px;
  }
  .pumpnote b {
    color: #e8edff;
  }
  .runrow {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .runinfo {
    flex: 1;
    font-size: 15px;
    font-weight: 700;
    color: var(--spm-cyan, #00beca);
    font-variant-numeric: tabular-nums;
  }
  .runinfo.idle {
    color: var(--dim);
    font-weight: 600;
  }
  .stop {
    background: #d6453b;
    color: #fff;
    border: none;
    border-radius: 14px;
    padding: 16px 28px;
    font-size: 18px;
    font-weight: 800;
  }
  .stop:active {
    transform: scale(0.98);
  }
  .block {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 14px 16px;
  }
  .bhead {
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--dim);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* marks: trust banner + go-to-level grid */
  .trust {
    border-color: #d6453b;
  }
  .trust.homed {
    border-color: var(--green, #1f9d6b);
  }
  .tstate {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.4;
  }
  .tstate.ok {
    color: var(--green, #1f9d6b);
  }
  .tstate.bad {
    color: #ffb4ad;
  }
  .op button:disabled {
    opacity: 0.4;
  }
  .marks {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
  }
  .mark {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 6px;
    background: #1b2440;
    color: #e8edff;
    font-weight: 800;
  }
  .mark span {
    font-size: 12px;
    color: var(--dim);
    font-weight: 600;
  }
  .mark b {
    font-size: 22px;
  }
  .mark.band {
    border-color: var(--green, #1f9d6b);
  }
  .mark.crit {
    border-color: #d6453b;
  }
  .mark:disabled {
    opacity: 0.4;
  }
  .bhead .dim {
    text-transform: none;
    letter-spacing: 0;
    font-weight: 600;
    font-style: normal;
  }
  .timed {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
  }
  .timed + .timed {
    margin-top: 8px;
  }
  .timed button {
    background: #1b2440;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 16px 0;
    font-weight: 700;
    color: #e8edff;
  }
  .wizbtn {
    width: 100%;
    background: linear-gradient(120deg, var(--spm-cyan, #00beca), var(--green, #1f9d6b));
    color: #04222a;
    border: none;
    border-radius: 12px;
    padding: 16px;
    font-weight: 800;
    font-size: 17px;
  }

  /* read-only value grids */
  .vgrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 16px;
  }
  .vgrid div {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 8px 12px;
  }
  .vgrid span {
    font-size: 12px;
    color: var(--dim);
  }
  .vgrid b {
    font-size: 17px;
    font-variant-numeric: tabular-nums;
  }

  /* editable calibration cells (tap → NumPad) */
  .vgrid button.vedit {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    background: rgba(0, 190, 202, 0.1);
    border: 1px solid var(--spm-cyan, #00beca);
    border-radius: 10px;
    padding: 8px 12px;
    color: #e8edff;
    text-align: left;
  }
  .vgrid button.vedit:active {
    transform: scale(0.98);
  }
  .vgrid button.vedit span {
    font-size: 12px;
    color: var(--spm-cyan, #00beca);
  }
  .vgrid button.vedit b {
    font-size: 17px;
    font-variant-numeric: tabular-nums;
  }

  /* dead-space measurement tool */
  .dsrow {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
  }
  .dscfg {
    flex: 1;
    background: #1b2440;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 0;
    color: var(--dim);
    font-weight: 700;
    font-size: 14px;
  }
  .dscfg b {
    color: #e8edff;
    font-size: 16px;
    font-variant-numeric: tabular-nums;
  }
  .dsrestart {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 16px;
    color: var(--dim);
    font-weight: 700;
  }
  .dsleft {
    text-align: left;
  }
  .dsgo {
    width: 100%;
    background: linear-gradient(120deg, var(--spm-cyan, #00beca), var(--green, #1f9d6b));
    color: #04222a;
    border: none;
    border-radius: 12px;
    padding: 16px;
    font-weight: 800;
    font-size: 16px;
    margin-top: 10px;
  }
  .dsgo.save {
    background: var(--green, #1f9d6b);
    color: #fff;
  }
  .dsprime {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 10px;
  }
  .dsprime button {
    padding: 16px 0;
    border-radius: 12px;
    font-weight: 800;
    color: #fff;
    border: none;
    touch-action: none;
  }
  .dsprime button:first-child {
    background: #1f9d6b;
  }
  .dsprime button:last-child {
    background: #3b7bd6;
  }
  .dsprime button:active {
    transform: scale(0.97);
  }
  .dsvg {
    margin-bottom: 8px;
  }
  .dsresult {
    margin: 10px 0 0;
    font-size: 16px;
    font-weight: 700;
    text-align: center;
    color: #e8edff;
  }
  .dsresult b {
    color: var(--spm-cyan, #00beca);
    font-size: 20px;
    font-variant-numeric: tabular-nums;
  }

  .op {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 16px;
    align-items: center;
  }
  .op button {
    width: 100%;
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 18px 8px;
    font-weight: 800;
    font-size: 16px;
  }
  .op button.big {
    padding: 26px 8px;
    font-size: 19px;
  }
  .op p {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: var(--dim);
  }
  .prepare {
    background: linear-gradient(120deg, var(--spm-cyan, #00beca), var(--green, #1f9d6b));
    color: #04222a;
  }
  .opbtns {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .opbtns .big {
    padding: 18px 8px;
  }
  .opdesc {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .opdesc p {
    margin: 0;
    font-size: 13px;
    line-height: 1.45;
    color: var(--dim);
  }
  .opdesc b {
    color: #e8edff;
  }
  .prime-only {
    background: #1b2440;
    color: #e8edff;
    border: 1px solid var(--spm-cyan, #00beca) !important;
  }
  .empty-btn {
    background: #2a3556;
    color: #e8edff;
  }
  .simline {
    margin: 8px 0 0;
    font-size: 13px;
    color: #ffd27f;
  }
  .simline b {
    color: #fff;
  }
  .block.dev {
    border-style: dashed;
    padding: 10px 14px;
  }
  .devrow {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 6px;
  }
  .devrow button {
    flex: 1;
    min-width: 90px;
    background: #1b2440;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 11px 8px;
    font-weight: 700;
    color: #e8edff;
  }
  .devrow .clear {
    background: var(--surface);
    color: var(--dim);
    flex: 0 0 auto;
  }

  /* system: lock + power */
  .lock {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.5px;
    padding: 3px 9px;
    border-radius: 999px;
    background: #e0a23a;
    color: #2a1c04;
  }
  .lock.locked {
    background: var(--green, #1f9d6b);
    color: #fff;
  }
  .powerrow {
    display: flex;
    gap: 8px;
  }
  .powerrow button {
    flex: 1;
    border: none;
    border-radius: 10px;
    padding: 16px 8px;
    font-weight: 800;
    color: #fff;
    line-height: 1.3;
  }
  .powerrow .reboot {
    background: #3b7bd6;
  }
  .powerrow .shutdown {
    background: #d6453b;
  }
  .powerrow button.arm {
    animation: armpulse 0.8s ease-in-out infinite;
  }
  @keyframes armpulse {
    50% {
      filter: brightness(1.4);
    }
  }
  .powermsg {
    margin: 0;
    padding: 14px 8px;
    text-align: center;
    font-weight: 700;
    color: #ffd27f;
  }

  /* live telemetry strip */
  .statusbar {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 18px;
    align-items: center;
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 10px 16px;
    font-size: 14px;
    color: var(--dim);
  }
  .statusbar b {
    color: #e8edff;
    font-variant-numeric: tabular-nums;
  }
  .statusbar .run {
    margin-inline-start: auto;
    font-weight: 800;
    color: var(--dim);
  }
  .statusbar .run.on {
    color: var(--green, #1f9d6b);
  }
  .statusbar .dim {
    color: var(--dim);
  }
  footer {
    font-size: 11px;
    color: var(--dim);
    text-align: center;
  }
  kbd {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 1px 6px;
  }
</style>
