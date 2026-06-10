from app.game.calibration import DEFAULT, load_calibration, save_calibration


def test_round_trip(tmp_path):
    p = tmp_path / "calibration.json"
    data = {
        "deadband_in": 0.2,
        "deadband_out": 0.3,
        "rate_in": 8.5,
        "rate_out": 6.0,
        "samples": [{"dir": "in", "duty": 1.0, "ml_per_s": 8.5}],
    }
    save_calibration(data, p)
    loaded = load_calibration(p)
    assert loaded["deadband_in"] == 0.2
    assert loaded["rate_in"] == 8.5
    assert loaded["samples"][0]["dir"] == "in"


def test_missing_file_returns_defaults(tmp_path):
    loaded = load_calibration(tmp_path / "nope.json")
    assert loaded == DEFAULT
    # sensible physical assumptions even with no calibration at all
    assert loaded["rate_in"] == 40.0
    assert loaded["torso_volume_ml"] == 1800.0
    # returned object is a copy — mutating it must not corrupt the module default
    loaded["rate_in"] = 5.0
    loaded["samples"].append({"x": 1})
    assert DEFAULT["rate_in"] == 40.0
    assert {"x": 1} not in DEFAULT["samples"]


def test_partial_file_filled_with_defaults(tmp_path):
    p = tmp_path / "c.json"
    p.write_text('{"rate_in": 7.0}', encoding="utf-8")
    loaded = load_calibration(p)
    assert loaded["rate_in"] == 7.0
    assert loaded["deadband_in"] == 0.15  # missing keys filled from the default calibration
    assert loaded["torso_volume_ml"] == 1800.0  # older files gain the new field
    assert len(loaded["samples"]) == 6


def test_torso_volume_round_trip(tmp_path):
    p = tmp_path / "c.json"
    save_calibration({"torso_volume_ml": 2200.0}, p)
    loaded = load_calibration(p)
    assert loaded["torso_volume_ml"] == 2200.0


def test_corrupt_file_returns_defaults(tmp_path):
    p = tmp_path / "c.json"
    p.write_text("not json {", encoding="utf-8")
    assert load_calibration(p) == DEFAULT


def test_save_ignores_extra_keys(tmp_path):
    p = tmp_path / "c.json"
    save_calibration({"rate_in": 9.0, "bogus": 123}, p)
    loaded = load_calibration(p)
    assert loaded["rate_in"] == 9.0
    assert "bogus" not in loaded


def test_reset_params_round_trip(tmp_path):
    p = tmp_path / "c.json"
    save_calibration({"empty_overpump_s": 90, "prime_in_ml": 50}, p)
    loaded = load_calibration(p)
    assert loaded["empty_overpump_s"] == 90
    assert loaded["prime_in_ml"] == 50
    assert loaded["deadband_in"] == 0.15  # other keys take the default calibration
