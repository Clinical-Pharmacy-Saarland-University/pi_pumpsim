"""Pharmacokinetics simulation engine — pure logic, no hardware, no UI.

Model (one-compartment, deliberately simple for a kids' demo):

    pump  ──▶  [ dead volume / tubing ]  ──▶  [ avatar vessel ]
                                                   │
                                                   ▼  first-order elimination
                                              (the body clears the "drug")

* Volume pumped first primes the dead volume; only the overflow reaches the avatar.
* The avatar level then decays with first-order kinetics: dC/dt = -k * C
  (this is the core PK idea — the body continuously eliminates the dose).
* The target window [target_low, target_high] is the "therapeutic range".

Everything here is unit-testable on a dev PC without the Pi.
"""
from __future__ import annotations

from dataclasses import dataclass

from ..config import Calibration


@dataclass
class EngineState:
    t: float = 0.0            # elapsed sim time (s)
    primed_ml: float = 0.0    # how much of the dead volume is filled (0..dead_volume_ml)
    delivered_ml: float = 0.0 # cumulative volume that has reached the avatar
    level_ml: float = 0.0     # current level in the avatar (after elimination)


class PKEngine:
    def __init__(self, cal: Calibration) -> None:
        self.cal = cal
        self.state = EngineState()

    @property
    def primed(self) -> bool:
        return self.state.primed_ml >= self.cal.dead_volume_ml

    @property
    def in_target(self) -> bool:
        return self.cal.target_low_ml <= self.state.level_ml <= self.cal.target_high_ml

    def reset(self) -> None:
        """Full reset: empty avatar AND un-prime the tubing."""
        self.state = EngineState()

    def reset_avatar(self) -> None:
        """Empty the avatar but keep the tubing primed."""
        self.state.level_ml = 0.0
        self.state.delivered_ml = 0.0

    def tick(self, dt: float, pump_flow_ml_s: float) -> None:
        """Advance the simulation by `dt` seconds given the pump's current flow."""
        vol_in = max(0.0, pump_flow_ml_s) * dt

        # 1) prime the dead volume first
        if self.state.primed_ml < self.cal.dead_volume_ml:
            to_prime = min(self.cal.dead_volume_ml - self.state.primed_ml, vol_in)
            self.state.primed_ml += to_prime
            vol_in -= to_prime

        # 2) remaining volume reaches the avatar
        self.state.delivered_ml += vol_in
        self.state.level_ml += vol_in

        # 3) first-order elimination (the PK part)
        self.state.level_ml -= self.cal.clearance_k * self.state.level_ml * dt

        # 4) clamp to physical bounds
        self.state.level_ml = min(max(self.state.level_ml, 0.0), self.cal.capacity_ml)
        self.state.t += dt
