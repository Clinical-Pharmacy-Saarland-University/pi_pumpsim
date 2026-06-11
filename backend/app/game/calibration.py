"""Persisted pump calibration: deadbands + flow samples (duty -> ml/s).

Machine-specific data, stored as backend/calibration.json (gitignored) and loaded
on boot. The frontend wizard builds the object and POSTs it; the backend just
persists it and applies rate_in to the pump. Pure-ish (file I/O), unit-tested.
"""
from __future__ import annotations

import json
from pathlib import Path

CALIB_PATH = Path(__file__).resolve().parents[2] / "calibration.json"

# Out-of-the-box calibration: THE committed baseline (single source of truth — there is no
# calibration.default.json), used until a per-machine calibration.json is written by the
# wizard. These are the MEASURED numbers from the wizard on the real torso: ~41.9 ml/s in /
# 41.3 ml/s out at full duty, a 1.8 L torso, deadbands 16 %/17 %, and a non-linear duty→flow
# curve (samples). dead-space stays null (treated as 0); init/reset drain an ABSOLUTE amount =
# (water to remove) + dead_space + overpump_ml, so accuracy comes from the tracked volume, not a ratio.
DEFAULT: dict = {
    "deadband_in": 0.16,        # duty 0..1 where the IN rotor just starts turning
    "deadband_out": 0.17,       # duty 0..1 where the OUT rotor just starts turning
    "rate_in": 41.9,            # ml/s at 100% duty, fill
    "rate_out": 41.3,           # ml/s at 100% duty, drain
    "torso_volume_ml": 1800.0,  # ml from level 0 to level 100 (capacity of the torso)
    "dead_space_ml": None,      # ml of tubing dead-volume (null -> treated as 0 / auto)
    "overpump_ml": 100.0,       # ml to overpump PAST empty on init/reset — the absolute safety
                                # margin (covers tracking error); empty = water + dead_space + this
    "prime_duty": 0.4,          # duty 0..1 for the prime-to-baseline IN run — gentle so the
                                # inflow doesn't splash; the prime DURATION is sized to this flow
    "empty_overpump_s": None,   # legacy seconds override for the admin "Entleeren" button only
    "prime_in_ml": None,        # ml to pump IN after empty (else auto-derived to baseline)
    "samples": [                # [{"dir": "in"|"out", "duty": 0..1, "ml_per_s": float}]
        {"dir": "in", "duty": 1.0, "ml_per_s": 41.9},
        {"dir": "in", "duty": 0.7, "ml_per_s": 27.5},
        {"dir": "in", "duty": 0.6, "ml_per_s": 17.4},
        {"dir": "in", "duty": 0.4, "ml_per_s": 10.5},
        {"dir": "out", "duty": 1.0, "ml_per_s": 41.3},
        {"dir": "out", "duty": 0.7, "ml_per_s": 27.3},
        {"dir": "out", "duty": 0.6, "ml_per_s": 23.0},
        {"dir": "out", "duty": 0.4, "ml_per_s": 10.8},
    ],
}


def load_calibration(path: Path | None = None) -> dict:
    """Load calibration, filling missing keys with defaults. Never raises.

    Order: an explicit `path`, else the per-machine `calibration.json`, else the
    built-in `DEFAULT` (the committed baseline).
    """
    out = {k: (list(v) if isinstance(v, list) else v) for k, v in DEFAULT.items()}
    candidates = [path] if path is not None else [CALIB_PATH]
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
