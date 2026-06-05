import pytest

from app.config import Calibration
from app.sim.engine import PKEngine


def make_cal(**overrides) -> Calibration:
    base = dict(
        pump_rate_ml_s=2.0,
        dead_volume_ml=5.0,
        capacity_ml=100.0,
        target_low_ml=40.0,
        target_high_ml=60.0,
        clearance_k=0.0,
    )
    base.update(overrides)
    return Calibration(**base)


def test_dead_volume_primes_before_avatar_fills():
    eng = PKEngine(make_cal(dead_volume_ml=5.0, clearance_k=0.0))
    # pump 4 ml (< 5 ml dead volume): everything goes to priming, avatar stays empty
    for _ in range(40):
        eng.tick(0.1, pump_flow_ml_s=1.0)
    assert not eng.primed
    assert eng.state.primed_ml == pytest.approx(4.0, abs=1e-6)
    assert eng.state.level_ml == pytest.approx(0.0, abs=1e-9)


def test_overflow_after_prime_reaches_avatar():
    eng = PKEngine(make_cal(dead_volume_ml=5.0, clearance_k=0.0))
    for _ in range(100):  # 10 ml total at 1 ml/s
        eng.tick(0.1, pump_flow_ml_s=1.0)
    assert eng.primed
    assert eng.state.level_ml == pytest.approx(5.0, abs=1e-6)
    assert eng.state.delivered_ml == pytest.approx(5.0, abs=1e-6)


def test_first_order_elimination_decays_level():
    eng = PKEngine(make_cal(dead_volume_ml=0.0, clearance_k=0.1))
    eng.state.level_ml = 50.0
    eng.tick(1.0, pump_flow_ml_s=0.0)
    assert eng.state.level_ml < 50.0
    assert eng.state.level_ml == pytest.approx(45.0, abs=1e-9)  # 50 - 0.1*50*1


def test_in_target_window():
    eng = PKEngine(make_cal())
    eng.state.level_ml = 50.0
    assert eng.in_target
    eng.state.level_ml = 30.0
    assert not eng.in_target


def test_level_clamped_to_capacity():
    eng = PKEngine(
        make_cal(
            dead_volume_ml=0.0,
            capacity_ml=10.0,
            target_low_ml=4.0,
            target_high_ml=6.0,
            clearance_k=0.0,
        )
    )
    for _ in range(100):  # try to push 100 ml into a 10 ml vessel
        eng.tick(0.1, pump_flow_ml_s=10.0)
    assert eng.state.level_ml == pytest.approx(10.0)


def test_calibration_rejects_inverted_window():
    with pytest.raises(ValueError):
        make_cal(target_low_ml=60.0, target_high_ml=40.0)
