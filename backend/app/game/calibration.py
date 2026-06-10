"""Persisted pump calibration: deadbands + flow samples (duty -> ml/s).

Machine-specific data, stored as backend/calibration.json (gitignored) and loaded
on boot. The frontend wizard builds the object and POSTs it; the backend just
persists it and applies rate_in to the pump. Pure-ish (file I/O), unit-tested.
"""
from __future__ import annotations

import json
from pathlib import Path

CALIB_PATH = Path(__file__).resolve().parents[2] / "calibration.json"
# committed baseline (in git); used when no per-machine calibration.json exists
DEFAULT_PATH = Path(__file__).resolve().parents[2] / "calibration.default.json"

# Sensible out-of-the-box calibration (keep in sync with calibration.default.json):
# 40 ml/s at full duty both ways, a ~1.8 L torso, deadbands 15 %/17 %, and a tube
# dead-volume for a 85 cm × 7 mm line (π·0.35²·85 ≈ 32.7 ml). empty/prime times stay
# null so they auto-derive from volume ÷ rate. Makes the mock physically plausible.
DEFAULT: dict = {
    "deadband_in": 0.15,        # duty 0..1 where the IN rotor just starts turning
    "deadband_out": 0.17,       # duty 0..1 where the OUT rotor just starts turning
    "rate_in": 40.0,            # ml/s at 100% duty, fill
    "rate_out": 40.0,           # ml/s at 100% duty, drain
    "torso_volume_ml": 1800.0,  # ml from level 0 to level 100 (capacity of the torso)
    "dead_space_ml": 32.7,      # ml of tubing dead-volume (85 cm × 7 mm line)
    "empty_overpump_s": None,   # seconds to run OUT to guarantee empty (else auto-derived)
    "prime_in_ml": None,        # ml to pump IN after empty (else auto-derived to baseline)
    "samples": [                # [{"dir": "in"|"out", "duty": 0..1, "ml_per_s": float}]
        {"dir": "in", "duty": 1.0, "ml_per_s": 40.0},
        {"dir": "in", "duty": 0.7, "ml_per_s": 25.9},
        {"dir": "in", "duty": 0.4, "ml_per_s": 11.8},
        {"dir": "out", "duty": 1.0, "ml_per_s": 40.0},
        {"dir": "out", "duty": 0.7, "ml_per_s": 25.5},
        {"dir": "out", "duty": 0.4, "ml_per_s": 11.1},
    ],
}


def load_calibration(path: Path | None = None) -> dict:
    """Load calibration, filling missing keys with defaults. Never raises.

    Order: an explicit `path`, else the per-machine `calibration.json`, else the
    committed `calibration.default.json`, else the built-in defaults.
    """
    out = {k: (list(v) if isinstance(v, list) else v) for k, v in DEFAULT.items()}
    candidates = [path] if path is not None else [CALIB_PATH, DEFAULT_PATH]
    for p in candidates:
        try:
            with open(p, encoding="utf-8") as f:
                data = json.load(f)
        except (OSError, ValueError):
            continue  # missing/corrupt -> try the next candidate
        if isinstance(data, dict):
            for k in DEFAULT:
                if k in data:
                    out[k] = data[k]
        return out
    return out


def save_calibration(data: dict, path: Path = CALIB_PATH) -> None:
    """Persist only the known calibration keys (ignores extras)."""
    clean = {k: data.get(k, DEFAULT[k]) for k in DEFAULT}
    with open(path, "w", encoding="utf-8") as f:
        json.dump(clean, f, indent=2)
