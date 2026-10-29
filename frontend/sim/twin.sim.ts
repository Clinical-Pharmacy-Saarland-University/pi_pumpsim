// Headless checks for the in-browser torso twin (web demo). Run: npx tsx sim/twin.sim.ts
// The LevelController cases mirror backend/tests/test_controller.py.
import { BrowserTwin, DEFAULT_PUMP, LevelController } from '../src/lib/twin'

let fails = 0
const ok = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`)
  if (!cond) fails++
}
const run = (tick: (dt: number) => void, seconds: number, dt = 0.05) => {
  for (let i = 0; i < Math.round(seconds / dt); i++) tick(dt)
}

// --- LevelController (port of the backend controller) -------------------------
let c = new LevelController()
ok('starts at baseline, still', c.level === c.cfg.baseline && !c.moving)
ok('baseline 20 sits below critical-low', c.zone === 'critical_low')

c = new LevelController()
c.setTarget(62)
run((dt) => c.tick(dt), 0.5) // 0.5 s * 4 = 2 units
ok('moves toward target at rate', c.level > 21.5 && c.level < 22.5 && c.direction === 'in')
run((dt) => c.tick(dt), 20)
ok('reaches target, stops in band', c.level === 62 && !c.moving && c.inBand && c.zone === 'in')

c = new LevelController()
c.level = 62
c.setTarget(50)
run((dt) => c.tick(dt), 1)
ok('drains when target below', c.level < 62 && c.direction === 'out')

c = new LevelController()
const zones: [number, string][] = [[30, 'critical_low'], [45, 'under'], [62, 'in'], [75, 'over'], [85, 'critical_high']]
ok('zones', zones.every(([lvl, z]) => ((c.level = lvl), c.zone === z)))

c = new LevelController()
c.setTarget(999)
const hi = c.target
c.setTarget(-5)
ok('target clamped to 0..capacity', hi === c.cfg.capacity && c.target === 0)

c = new LevelController()
c.level = 78
c.reset()
ok('reset snaps to baseline', c.level === c.cfg.baseline && c.target === c.cfg.baseline)

// --- BrowserTwin pacing (port of the runner's calibrated auto-follow) ---------
const pumpIn = (DEFAULT_PUMP.rate_in_ml_s / DEFAULT_PUMP.torso_volume_ml) * 100 // ≈2.33 u/s
let t = new BrowserTwin()
t.setTarget(62, 8) // a story asks for 8 u/s — the pump caps it
run((dt) => t.tick(dt), 1)
ok('fill capped at the calibrated pump rate', Math.abs(t.ctrl.level - (20 + pumpIn)) < 0.05)
const s = t.snapshot()
ok('snapshot reports pumping in', s.moving && s.direction === 'in' && s.pump_running && s.pump_direction === 'in')
ok('snapshot flow ≈ full pump flow', Math.abs(s.pump_flow_ml_s - DEFAULT_PUMP.rate_in_ml_s) < 0.1)
ok('snapshot homed, not busy, browser', s.homed && !s.pump_busy && s.backend === 'browser')

t = new BrowserTwin()
t.setTarget(62, 1) // a slow drift is honoured below the pump cap
run((dt) => t.tick(dt), 2)
ok('slow game rate honoured', Math.abs(t.ctrl.level - 22) < 0.05)

t = new BrowserTwin()
t.setTarget(62, 5)
run((dt) => t.tick(dt), 30)
ok('dose 20→62 settles in ~18 s at pump pace', t.ctrl.level === 62 && !t.snapshot().moving)
ok('settled snapshot: pump stopped', t.snapshot().pump_direction === 'stop' && t.snapshot().pump_flow_ml_s === 0)

// --- prepare / reset ---------------------------------------------------------
t.setTarget(80, 0.5) // leave a slow rate behind
run((dt) => t.tick(dt), 1000)
const plan = t.prepare()
ok('prepare plan ETA = 60 units at 20 u/s = 3 s', plan.eta_s === 3 && plan.empty_s + plan.prime_s === 3)
ok('prepare is moving (game waiter arms)', t.snapshot().moving && t.snapshot().direction === 'out')
run((dt) => t.tick(dt), 3.2)
ok('prepare settles at baseline in ~3 s', t.ctrl.level === 20 && !t.snapshot().moving)
ok('prepare restores the default pace', t.ctrl.rate === t.ctrl.cfg.rate)
t.setTarget(62)
run((dt) => t.tick(dt), 1)
ok('next fill is pump-paced again (not the prepare rate)', Math.abs(t.ctrl.level - (20 + pumpIn)) < 0.05)

t.reset()
ok('reset snaps to baseline', t.ctrl.level === 20 && !t.snapshot().moving)

console.log(fails ? `\n${fails} FAILED` : '\nall passed')
process.exit(fails ? 1 : 0)
