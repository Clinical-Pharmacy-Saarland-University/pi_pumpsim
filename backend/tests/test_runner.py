"""Manual-mode (admin) behaviour of the runner + controller (no hardware, no HTTP)."""
from app.game.controller import LevelController
from app.game.runner import LevelRunner
from app.hardware.mock_pump import MockPump


def _runner(rate=4.0):
    return LevelRunner(MockPump(rate_ml_s=rate), tick_hz=20, backend="mock")


def test_manual_drive_sets_pump_and_telemetry():
    r = _runner()
    r.manual_drive("out", 0.5)
    assert r.manual is True
    assert r.pump.direction == "out"
    assert r.pump.speed == 0.5
    snap = r.snapshot()
    assert snap["manual"] is True
    assert snap["pump_direction"] == "out"
    assert snap["pump_speed"] == 0.5
    assert snap["pump_running"] is True
    assert snap["backend"] == "mock"


def test_manual_stop_halts_pump():
    r = _runner()
    r.manual_drive("in", 1.0)
    r.manual_stop()
    assert r.pump.direction == "stop"
    assert r.snapshot()["pump_running"] is False


def test_set_manual_off_does_not_snap_target():
    r = _runner()
    r.set_manual(True)
    r.ctrl.level = 60.0
    r.set_manual(False)
    assert r.manual is False
    assert r.ctrl.target == 60.0  # auto won't yank the level back to baseline


def test_snapshot_reports_version():
    r = LevelRunner(MockPump(rate_ml_s=2.0), tick_hz=20, backend="mock", version="9.9.9-test")
    assert r.snapshot()["version"] == "9.9.9-test"


def test_run_sequence_drives_then_advances():
    r = _runner()
    r.run_sequence(
        [
            {"dir": "out", "speed": 1.0, "seconds": 2},
            {"dir": "in", "speed": 0.5, "seconds": 3},
        ]
    )
    assert r.manual is True
    assert r.pump.direction == "out" and r.pump.speed == 1.0
    r._advance_seq()  # next step
    assert r.pump.direction == "in" and r.pump.speed == 0.5
    r._advance_seq()  # past the end -> stop
    assert r.pump.direction == "stop"


def test_manual_drive_clears_a_pending_sequence():
    r = _runner()
    r.run_sequence([{"dir": "out", "speed": 1.0, "seconds": 5}, {"dir": "in", "speed": 1.0, "seconds": 5}])
    r.manual_drive("in", 0.3)
    assert r._seq == []
    assert r.pump.direction == "in" and r.pump.speed == 0.3


def test_controller_manual_step_moves_level_and_pins_target():
    c = LevelController()  # rate 4.0, baseline 42
    start = c.level
    c.manual_step("in", 1.0, 1.0)   # +4.0
    assert c.level == start + 4.0
    assert c.target == c.level
    c.manual_step("out", 0.5, 1.0)  # -2.0
    assert c.level == start + 2.0


def test_controller_manual_step_rate_override():
    c = LevelController()
    start = c.level
    c.manual_step("in", 0.5, 1.0, rate=2.0)  # 2.0 units/s × 50% duty × 1 s
    assert c.level == start + 1.0


CAL = {"rate_in": 40.0, "rate_out": 20.0, "torso_volume_ml": 2000.0}


def test_apply_calibration_sets_volume_and_pump_rate():
    r = _runner(rate=2.0)
    r.apply_calibration(CAL)
    assert r.volume_ml == 2000.0
    snap = r.snapshot()
    assert snap["torso_volume_ml"] == 2000.0
    assert snap["pump_rate_ml_s"] == 40.0  # rate_in pushed to the pump
    assert snap["level_ml"] == round(snap["level"] / 100 * 2000.0, 1)


def test_manual_jog_is_not_tracked_but_telemetry_follows():
    # manual jog is raw motor control — the twin must NOT move (there's no level
    # sensor, so we never pretend to know where the water went)
    r = LevelRunner(MockPump(rate_ml_s=2.0), tick_hz=20, backend="mock", calibration=CAL)
    start = r.ctrl.level
    r.manual_drive("in", 1.0)
    r._tick()
    assert r.ctrl.level == start  # untracked
    r.manual_drive("out", 1.0)
    r._tick()
    assert r.ctrl.level == start  # still untracked
    assert r.snapshot()["pump_rate_ml_s"] == 20.0  # telemetry still follows direction


def test_manual_jog_does_not_move_the_twin_without_rates():
    r = LevelRunner(MockPump(rate_ml_s=2.0), tick_hz=20, backend="mock")
    start = r.ctrl.level
    r.manual_drive("in", 1.0)
    r._tick()
    assert r.ctrl.level == start  # no tracking in manual mode


def test_home_and_goto_anchor_the_twin_and_set_homed():
    r = _runner()
    assert r.homed is False  # unknown on boot
    r.ctrl.level = 55.0
    r.home_empty(empty_s=30)  # mock: declare zero
    assert r.homed is True and r.ctrl.target == 0.0
    r.goto_level(70.0)
    assert r.homed is True and r.ctrl.target == 70.0


def test_home_on_real_drains_then_primes_tube_then_anchors_zero():
    # on real hardware Home overpumps OUT, then pumps IN the tube dead-space, then
    # anchors at 0 — so the line is primed and later fills aren't short
    r = LevelRunner(MockPump(rate_ml_s=2.0), tick_hz=20, backend="real")
    r.ctrl.level = 60.0
    r.home_empty(empty_s=30, tube_prime_s=5)
    assert r.pump.direction == "out"             # draining first
    assert [s["dir"] for s in r._seq] == ["in"]  # tube-prime queued next
    assert r.homed is False                       # in transit
    r._advance_seq()                              # -> tube-prime (IN)
    assert r.pump.direction == "in"
    r._advance_seq()                              # -> done: anchor at 0
    assert r.ctrl.level == 0.0 and r.homed is True


def test_jog_breaks_homed_state():
    r = _runner()
    r.home_empty(empty_s=30)
    assert r.homed is True
    r.manual_drive("in", 1.0)  # any freehand jog invalidates the known state
    assert r.homed is False


def test_sequence_sync_level_anchors_and_homes():
    r = _runner()
    r.run_sequence([{"dir": "in", "speed": 1.0, "seconds": 1}], sync_level=33.0)
    assert r.homed is False  # in transit, not yet anchored
    r._advance_seq()  # sequence finished -> snap to the synced level
    assert r.ctrl.level == 33.0 and r.ctrl.target == 33.0
    assert r.homed is True


# --- model-follower: in-game moves always use the calibrated pump rate ----------
def test_auto_follow_moves_at_calibrated_rate_not_game_rate():
    # rate_in 40 ml/s into 2000 ml = 2 units/s; the twin tracks THAT, not the faster
    # game rate (4 u/s) — the displayed level == what the pump can physically deliver
    r = LevelRunner(MockPump(rate_ml_s=2.0), tick_hz=20, backend="mock", calibration=CAL)
    start = r.ctrl.level
    r.set_target(start + 40.0)  # a big IN move; game rate wants to outrun the pump
    r._tick()
    assert abs(r.ctrl.level - (start + 0.1)) < 1e-9  # 2 u/s * 0.05 s tick
    assert r.pump.direction == "in" and abs(r.pump.speed - 1.0) < 1e-9  # full duty


def test_auto_follow_modulates_duty_for_a_slow_drift():
    # game wants 1 u/s but the pump can do 2 u/s -> run at half duty, twin paces slow
    r = LevelRunner(MockPump(rate_ml_s=2.0), tick_hz=20, backend="mock", calibration=CAL)
    start = r.ctrl.level
    r.set_target(start + 40.0, rate=1.0)
    r._tick()
    assert abs(r.ctrl.level - (start + 0.05)) < 1e-9  # 1 u/s * 0.05 s
    assert abs(r.pump.speed - 0.5) < 1e-9             # duty = game/pump = 1/2


def test_sim_level_integrates_pump_at_calibrated_rate():
    r = LevelRunner(MockPump(rate_ml_s=2.0), tick_hz=20, backend="mock", calibration=CAL)
    r.sim_active = True
    r.sim_level = 50.0
    r.sim_time_scale = 1.0  # no acceleration for a clean assertion
    r.manual_drive("out", 1.0)
    r._tick()
    # rate_out 20 ml/s / 2000 ml = 1 u/s -> 0.05 units drained this tick
    assert abs(r.sim_level - (50.0 - 0.05)) < 1e-9


def test_simulate_start_injects_unknown_water_and_reboots_belief():
    r = _runner()
    r.apply_calibration(CAL)
    r.simulate_start(45.0)
    assert r.sim_active is True
    assert r.sim_level == 45.0
    assert r.homed is False                       # belief is untrusted
    assert r.ctrl.level == r.ctrl.cfg.baseline    # twin back to a fresh boot baseline


def test_mock_sim_home_actually_drains_the_true_level():
    r = LevelRunner(MockPump(rate_ml_s=2.0), tick_hz=20, backend="mock", calibration=CAL)
    r.simulate_start(30.0)        # 30% unknown water, belief rebooted
    r.home_empty(empty_s=130.0)   # mock + sim -> runs the REAL out sequence
    for _ in range(600):
        r._tick()
    assert r.sim_level == 0.0      # the real water got pumped out
    assert r.homed is True         # and the twin is anchored at 0
    assert r.ctrl.level == 0.0


# --- deadband + tube dead-space (the real default-calibration shape) -------------
DBCAL = {
    "rate_in": 40.0, "rate_out": 40.0, "torso_volume_ml": 2000.0,
    "deadband_in": 0.2, "deadband_out": 0.2, "dead_space_ml": 50.0,
}


def test_auto_follow_maps_duty_above_the_deadband():
    # 40 ml/s / 2000 ml = 2 u/s; a slow drift (1 u/s) needs half the flow, but the
    # duty must sit ABOVE the 0.2 deadband (0.6), not naively at 0.5
    r = LevelRunner(MockPump(rate_ml_s=2.0), tick_hz=20, backend="mock", calibration=DBCAL)
    start = r.ctrl.level
    r.set_target(start + 40.0, rate=1.0)
    r._tick()
    assert abs(r.ctrl.level - (start + 0.05)) < 1e-9   # still the desired 1 u/s
    assert abs(r.pump.speed - 0.6) < 1e-9              # 0.2 + 0.8*0.5


def test_sim_home_with_dead_space_lands_at_true_zero():
    r = LevelRunner(MockPump(rate_ml_s=2.0), tick_hz=20, backend="mock", calibration=DBCAL)
    r.simulate_start(40.0)  # 40% water, tube primed
    r.home_empty(empty_s=200.0, tube_prime_s=DBCAL["dead_space_ml"] / DBCAL["rate_in"])
    for _ in range(800):
        r._tick()
    assert abs(r.sim_level) < 1e-6          # the torso is genuinely empty (tube absorbs the prime)
    assert r.homed is True and r.ctrl.level == 0.0


def test_sim_prepare_lands_exactly_on_baseline():
    r = LevelRunner(MockPump(rate_ml_s=2.0), tick_hz=20, backend="mock", calibration=DBCAL)
    r.simulate_start(80.0)
    baseline = r.ctrl.cfg.baseline
    prime_ml = baseline / 100.0 * DBCAL["torso_volume_ml"]
    prime_s = (prime_ml + DBCAL["dead_space_ml"]) / DBCAL["rate_in"]
    r.prepare(empty_s=200.0, prime_s=prime_s)
    for _ in range(900):
        r._tick()
    assert abs(r.sim_level - baseline) < 0.2  # torso fills to baseline, not baseline+dead-space
    assert r.homed is True
