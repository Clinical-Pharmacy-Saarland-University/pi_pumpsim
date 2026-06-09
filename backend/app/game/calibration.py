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

# Until the wizard has run on the real torso we assume 40 ml/s at 100% duty and a
# ~1.8 L torso (keep these in sync with calibration.default.json). They make the
# mock/virtual torso physically plausible out of the box.
DEFAULT: dict = {
    "deadband_in": None,        # duty 0..1 where the IN rotor just starts turning
    "deadband_out": None,       # duty 0..1 where the OUT rotor just starts turning
    "rate_in": 40.0,            # ml/s at 100% duty, fill
    "rate_out": 40.0,           # ml/s at 100% duty, drain
    "torso_volume_ml": 1800.0,  # ml from level 0 to level 100 (capacity of the torso)
    "dead_space_ml": None,      # ml of tubing dead-volume (prime/residual)
    "empty_overpump_s": None,   # seconds to run OUT to guarantee empty (overpump -> pulls air)
    "prime_in_ml": None,        # ml to pump IN after empty to reach the game's start level
    "samples": [],              # [{"dir": "in"|"out", "duty": 0..1, "ml_per_s": float}]
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
