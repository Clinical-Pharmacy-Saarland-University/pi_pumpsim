"""The „Dr. Dosis — Hilf der Familie!" scenario definitions.

PK parameters live here; the German copy lives in the frontend locale and is
linked by `patient_id` / `drug_id` / event `type`. See docs/game-design.md §16.
"""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class GameEvent:
    t: float        # seconds into the round when it fires
    type: str       # "grapefruit" | "inducer"  (frontend renders the German banner)
    k_mult: float   # multiplies the clearance rate from this point on


@dataclass(frozen=True)
class Scenario:
    id: str
    patient_id: str           # locale key for the patient
    drug_id: str              # locale key / mascot for the drug
    band_low: float
    band_high: float
    k_base: float             # baseline clearance (1/s)
    start_level: float
    duration: float           # round length (s)
    tutorial: bool = False
    events: tuple[GameEvent, ...] = field(default_factory=tuple)


SCENARIOS: tuple[Scenario, ...] = (
    # 1) Max, 8 — Fieber — Paracetamol „Para" (tutorial, no twist)
    Scenario(
        id="p1", patient_id="max", drug_id="para",
        band_low=35, band_high=65, k_base=0.025, start_level=0.0,
        duration=45, tutorial=True,
    ),
    # 2) Eva (Mama), 42 — Cholesterin — Simvastatin „Sim" + Grapefruit (FDI)
    Scenario(
        id="p2", patient_id="eva", drug_id="sim",
        band_low=40, band_high=60, k_base=0.030, start_level=50.0,
        duration=60,
        events=(GameEvent(t=25, type="grapefruit", k_mult=0.4),),
    ),
    # 3) Opa Karl, 70 — Blutdruck — Metoprolol „Meto", slow metaboliser (DGI)
    #    (optional 2nd-drug inducer event deferred: GameEvent(40, "inducer", 2.5))
    Scenario(
        id="p3", patient_id="opa", drug_id="meto",
        band_low=42, band_high=58, k_base=0.012, start_level=0.0,
        duration=70,
    ),
)

SCENARIO_BY_ID: dict[str, Scenario] = {s.id: s for s in SCENARIOS}
