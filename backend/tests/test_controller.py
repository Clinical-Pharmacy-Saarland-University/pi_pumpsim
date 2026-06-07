from app.game.controller import LevelConfig, LevelController


def drive(c: LevelController, seconds: float, dt: float = 0.05) -> None:
    for _ in range(int(seconds / dt)):
        c.tick(dt)


def test_starts_at_baseline():
    c = LevelController()
    assert c.level == c.cfg.baseline
    assert not c.moving
    assert c.zone == "under"  # baseline 42 is below band 55


def test_moves_toward_target_at_rate():
    c = LevelController(LevelConfig(rate=4.0))
    c.set_target(62)
    drive(c, 0.5)  # 0.5s * 4 = 2 units
    assert 43.5 < c.level < 45  # moved up ~2 from baseline 42
    assert c.moving and c.direction == "in"


def test_reaches_target_and_stops_in_band():
    c = LevelController()
    c.set_target(62)
    drive(c, 20)  # plenty of time
    assert c.level == 62
    assert not c.moving
    assert c.in_band and c.zone == "in"


def test_drains_when_target_below():
    c = LevelController()
    c.level = 62
    c.set_target(50)
    drive(c, 1.0)
    assert c.level < 62 and c.direction == "out"


def test_zones():
    c = LevelController()
    for lvl, z in [(30, "critical_low"), (45, "under"), (62, "in"), (75, "over"), (85, "critical_high")]:
        c.level = lvl
        assert c.zone == z, (lvl, c.zone)


def test_target_clamped():
    c = LevelController()
    c.set_target(999)
    assert c.target == c.cfg.capacity
    c.set_target(-5)
    assert c.target == 0


def test_reset_to_baseline():
    c = LevelController()
    c.level = 78
    c.reset()
    assert c.level == c.cfg.baseline and c.target == c.cfg.baseline
