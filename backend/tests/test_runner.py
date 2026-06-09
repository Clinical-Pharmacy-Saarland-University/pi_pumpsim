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


def test_set_rate_updates_calibration():
    r = _runner(rate=2.0)
    r.set_rate(3.5)
    assert r.snapshot()["pump_rate_ml_s"] == 3.5


def test_controller_manual_step_moves_level_and_pins_target():
    c = LevelController()  # rate 4.0, baseline 42
    start = c.level
    c.manual_step("in", 1.0, 1.0)   # +4.0
    assert c.level == start + 4.0
    assert c.target == c.level
    c.manual_step("out", 0.5, 1.0)  # -2.0
    assert c.level == start + 2.0
