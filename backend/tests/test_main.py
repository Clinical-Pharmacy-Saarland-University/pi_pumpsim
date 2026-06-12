"""HTTP-level tests for the reset/prepare endpoints (FastAPI TestClient, mock pump).

The drain is an ABSOLUTE volume: empty_ml = water_ml + dead_space_ml + overpump_ml.
Between runs water = the KNOWN end-of-run level; first-boot / explicit-full = a whole torso.
"""
from fastapi.testclient import TestClient

import app.main as main
from app.main import app


def test_between_runs_prepare_drains_only_the_known_level():
    with TestClient(app) as client:  # context manager runs the lifespan → builds the runner
        r = main.runner
        assert r is not None and r.backend == "mock"
        # end of a run: the twin is homed and tracking a known level (no movement → stable read)
        r.homed = True
        r.ctrl.level = 70.0
        r.ctrl.target = 70.0
        short = client.post("/api/level/prepare").json()      # game between-runs (no body)
        full = client.post("/api/level/prepare", json={"full": True}).json()  # forced full

    # the reset only removes the known end-of-run water, the full re-zero removes a whole torso
    assert short["from_level"] == 70.0
    assert short["empty_src"] == "from_level"
    assert short["water_ml"] == round(70.0 / 100.0 * full["volume_ml"], 1)
    assert full["from_level"] == 100.0
    assert full["empty_src"] == "derived"
    assert full["water_ml"] == full["volume_ml"]  # a full torso

    # ABSOLUTE drain: water + tube dead-space + the fixed overpump margin (no ratio)
    assert short["overpump_ml"] == 100.0 and full["overpump_ml"] == 100.0
    # the between-runs reset is NOT an init → it leaves the unpumpable torso dead space
    assert short["init"] is False
    assert short["empty_ml"] == round(short["water_ml"] + short["dead_space_ml"] + 100.0, 1)
    # the forced-full path IS an Initialize → it also drains the torso dead space
    assert full["init"] is True and full["torso_dead_space_ml"] == 100.0
    assert full["empty_ml"] == round(
        full["water_ml"] + full["dead_space_ml"] + 100.0 + full["torso_dead_space_ml"], 1
    )

    assert short["empty_s"] < full["empty_s"]   # less water to remove → faster
    assert short["prime_s"] == full["prime_s"]  # prime to baseline is unchanged
    assert short["eta_s"] == round(short["empty_s"] + short["prime_s"], 1)


def test_unhomed_prepare_drains_a_full_torso():
    with TestClient(app) as client:
        r = main.runner
        r.homed = False        # fresh boot / untrusted — the level can't be believed
        r.ctrl.level = 30.0
        plan = client.post("/api/level/prepare").json()
    assert plan["from_level"] == 100.0          # drains as if the torso could be full
    assert plan["water_ml"] == plan["volume_ml"]
    assert plan["empty_src"] == "derived"
    assert plan["init"] is True                 # an untrusted full drain counts as an initialize
    assert plan["empty_ml"] == round(
        plan["water_ml"] + plan["dead_space_ml"] + plan["overpump_ml"] + plan["torso_dead_space_ml"], 1
    )


def test_initialize_drains_the_torso_dead_space_but_a_reset_does_not():
    with TestClient(app) as client:
        r = main.runner
        r.homed = True
        r.ctrl.level = 60.0
        r.ctrl.target = 60.0
        reset = client.post("/api/level/prepare").json()                      # between-runs (init=False)
        init = client.post("/api/level/prepare", json={"full": True}).json()  # Initialize (init=True)
    td = 100.0
    assert reset["torso_dead_space_ml"] == td and init["torso_dead_space_ml"] == td
    assert reset["init"] is False and init["init"] is True
    # the reset leaves the unpumpable residual; Initialize pumps the extra td out
    assert reset["empty_ml"] == round(reset["water_ml"] + reset["dead_space_ml"] + reset["overpump_ml"], 1)
    assert init["empty_ml"] == round(init["water_ml"] + init["dead_space_ml"] + init["overpump_ml"] + td, 1)


def test_only_the_first_initialize_after_boot_drains_the_torso_dead_space():
    with TestClient(app) as client:
        r = main.runner
        r.homed = False
        first = client.post("/api/level/prepare", json={"full": True}).json()   # 1st init after boot
        second = client.post("/api/level/prepare", json={"full": True}).json()  # 2nd init, same boot
    td = first["torso_dead_space_ml"]
    assert td == 100.0
    assert first["init"] is True and second["init"] is False
    assert first["from_level"] == 100.0 and second["from_level"] == 100.0  # both still full drains
    assert first["empty_ml"] == round(first["water_ml"] + first["dead_space_ml"] + first["overpump_ml"] + td, 1)
    assert second["empty_ml"] == round(second["water_ml"] + second["dead_space_ml"] + second["overpump_ml"], 1)
    assert round(first["empty_ml"] - second["empty_ml"], 1) == td  # the residual is drained once only


def test_home_and_prepare_plan_display_use_a_full_drain():
    # the GET plan (admin display) and Home are the robust full-torso variants
    with TestClient(app) as client:
        r = main.runner
        r.homed = True
        r.ctrl.level = 50.0
        plan = client.get("/api/level/prepare_plan").json()
    assert plan["from_level"] == 100.0
    assert plan["overpump_ml"] == 100.0


def test_prime_runs_at_a_gentle_duty_sized_to_that_flow():
    # the prime to baseline runs at a gentle duty (no splash); its DURATION is sized to
    # the slow flow at that duty, so it's much longer than a full-duty fill would be
    with TestClient(app) as client:
        r = main.runner
        r.homed = True
        r.ctrl.level = 20.0
        r.ctrl.target = 20.0
        plan = client.post("/api/level/prepare").json()
    assert plan["prime_duty"] == 0.35                      # default gentle duty
    full_duty_prime = plan["prime_ml"] / plan["rate_in"]   # if it ran at full rate
    assert plan["prime_s"] > full_duty_prime * 2           # 40 % flow → a much longer run
