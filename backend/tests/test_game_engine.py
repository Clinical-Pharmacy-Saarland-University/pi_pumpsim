import pytest

from app.game import engine as eng
from app.game.engine import GameEngine
from app.game.scenarios import SCENARIO_BY_ID, GameEvent, Scenario


def run(engine: GameEngine, seconds: float, hold: bool, dt: float = 0.05) -> None:
    engine.set_hold(hold)
    for _ in range(int(seconds / dt)):
        engine.tick(dt)


def test_idle_engine_does_nothing():
    e = GameEngine()
    e.tick(0.1)
    assert e.phase == "idle"
    assert e.level == 0.0


def test_start_sets_level_and_running():
    e = GameEngine()
    e.start(SCENARIO_BY_ID["p2"])  # start_level 50
    assert e.phase == "running"
    assert e.level == 50.0


def test_hold_raises_level():
    e = GameEngine()
    e.start(SCENARIO_BY_ID["p1"])  # starts empty
    run(e, seconds=2.0, hold=True)
    assert e.level > 10.0  # ~ DOSE_RATE * 2 minus a little decay


def test_decay_lowers_level_when_not_holding():
    e = GameEngine()
    e.start(SCENARIO_BY_ID["p2"])  # start 50, k_base 0.03
    run(e, seconds=5.0, hold=False)
    assert e.level < 50.0


def test_time_in_green_and_stars():
    e = GameEngine()
    e.start(SCENARIO_BY_ID["p1"])  # band 35-65, dur 45
    # hold ~5s to enter the band, then ride it out
    run(e, seconds=5.0, hold=True)
    assert e.in_green
    run(e, seconds=45.0, hold=False)  # finish the round
    assert e.phase == "ended"
    assert e.time_in_green > 0
    assert 0 <= e.stars <= 3


def test_grapefruit_event_reduces_clearance():
    e = GameEngine()
    e.start(SCENARIO_BY_ID["p2"])  # grapefruit at t=25 -> k_mult 0.4
    assert e.k_mult == 1.0
    run(e, seconds=26.0, hold=False)
    assert e.k_mult == pytest.approx(0.4)
    assert e.active_event == "grapefruit"


def test_level_clamped_to_capacity():
    e = GameEngine()
    e.start(SCENARIO_BY_ID["p1"])
    run(e, seconds=60.0, hold=True)  # hold forever
    assert e.level <= eng.CAPACITY


def test_perfect_play_scores_three_stars():
    # synthetic scenario: already in-band, no decay -> 100% time in green
    s = Scenario(id="x", patient_id="x", drug_id="x",
                 band_low=40, band_high=60, k_base=0.0, start_level=50, duration=5)
    e = GameEngine()
    e.start(s)
    run(e, seconds=6.0, hold=False)  # run just past the 5 s duration
    assert e.phase == "ended"
    assert e.stars == 3
