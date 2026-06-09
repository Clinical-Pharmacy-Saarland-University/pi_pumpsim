"""Persisted pump calibration: deadbands + flow samples (duty -> ml/s).

Machine-specific data, stored as backend/calibration.json (gitignored) and loaded
on boot. The frontend wizard builds the object and POSTs it; the backend just
persists it and applies rate_in to the pump. Pure-ish (file I/O), unit-tested.
"""
from __future__ import annotations

import json
from pathlib import Path

CALIB_PATH = Path(__file__).resolve().parents[2] / "calibration.json"

DEFAULT: dict = {
    "deadband_in": None,    # duty 0..1 where the IN rotor just starts turning
    "deadband_out": None,   # duty 0..1 where the OUT rotor just starts turning
    "rate_in": None,        # ml/s at 100% duty, fill
    "rate_out": None,       # ml/s at 100% duty, drain
    "dead_space_ml": None,  # ml of tubing dead-volume (prime/residual); measured later
    "samples": [],          # [{"dir": "in"|"out", "duty": 0..1, "ml_per_s": float}]
}


def load_calibration(path: Path = CALIB_PATH) -> dict:
    """Load calibration, filling any missing keys with defaults. Never raises."""
    out = {k: (list(v) if isinstance(v, list) else v) for k, v in DEFAULT.items()}
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, ValueError):
        return out
    if isinstance(data, dict):
        for k in DEFAULT:
            if k in data:
                out[k] = data[k]
    return out


def save_calibration(data: dict, path: Path = CALIB_PATH) -> None:
    """Persist only the known calibration keys (ignores extras)."""
    clean = {k: data.get(k, DEFAULT[k]) for k in DEFAULT}
    with open(path, "w", encoding="utf-8") as f:
        json.dump(clean, f, indent=2)
