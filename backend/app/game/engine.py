"""GameEngine — pure, deterministic round simulation. No hardware, no UI.

Per tick: optionally dose (hold), apply first-order elimination with the current
(event-modulated) clearance, score time-in-green + well-being, end at duration.
Unit-tested in tests/test_game_engine.py.
"""
from __future__ import annotations

from .scenarios import Scenario

# --- global tuning (normalized 0–100 „Spiegel" scale) ---
CAPACITY = 100.0
DOSE_RATE = 10.0           # level units added per second while holding
WB_START = 60.0            # Wohlbefinden start
WB_UP = 6.0               # /s while in the green band
WB_LOW_DOWN = 4.0          # /s while below the band (sub-therapeutic)
WB_HIGH_DOWN = 8.0         # /s while above the band (toxic)
STAR_T3, STAR_T2, STAR_T1 = 0.80, 0.55, 0.30  # time-in-green fractions

Phase = str  # "idle" | "running" | "ended"


class GameEngine:
    def __init__(self) -> None:
        self.scenario: Scenario | None = None
        self.phase: Phase = "idle"
        self._reset()

    def _reset(self) -> None:
        self.t = 0.0
        self.level = 0.0
        self.k_mult = 1.0
        self.hold = False
        self.time_in_green = 0.0
        self.well_being = WB_START
        self._fired: set[int] = set()
        self.active_event: str | None = None
        self.stars = 0

    # --- control ---
    def start(self, scenario: Scenario) -> None:
        self.scenario = scenario
        self._reset()
        self.level = scenario.start_level
        self.phase = "running"

    def set_hold(self, on: bool) -> None:
        self.hold = bool(on)

    def stop(self) -> None:
        self.phase = "idle"
        self.hold = False

    # --- derived ---
    @property
    def k(self) -> float:
        return self.scenario.k_base * self.k_mult if self.scenario else 0.0

    @property
    def in_green(self) -> bool:
        s = self.scenario
        return bool(s and s.band_low <= self.level <= s.band_high)

    # --- step ---
    def tick(self, dt: float) -> None:
        if self.phase != "running" or not self.scenario:
            return
        s = self.scenario

        # fire due events (modulate clearance)
        for i, ev in enumerate(s.events):
            if i not in self._fired and self.t >= ev.t:
                self._fired.add(i)
                self.k_mult *= ev.k_mult
                self.active_event = ev.type

        # dose (hold) + first-order elimination
        if self.hold:
            self.level += DOSE_RATE * dt
        self.level -= self.k * self.level * dt
        self.level = min(max(self.level, 0.0), CAPACITY)

        # scoring + well-being
        if self.in_green:
            self.time_in_green += dt
            self.well_being += WB_UP * dt
        elif self.level < s.band_low:
            self.well_being -= WB_LOW_DOWN * dt
        else:
            self.well_being -= WB_HIGH_DOWN * dt
        self.well_being = min(max(self.well_being, 0.0), 100.0)

        self.t += dt
        if self.t >= s.duration:
            self.phase = "ended"
            self.stars = self._stars()

    def _stars(self) -> int:
        if not self.scenario:
            return 0
        f = self.time_in_green / self.scenario.duration
        if f >= STAR_T3:
            return 3
        if f >= STAR_T2:
            return 2
        if f >= STAR_T1:
            return 1
        return 0

    # --- telemetry ---
    def snapshot(self) -> dict:
        s = self.scenario
        return {
            "phase": self.phase,
            "scenario_id": s.id if s else None,
            "t": round(self.t, 2),
            "duration": s.duration if s else 0,
            "level": round(self.level, 2),
            "capacity": CAPACITY,
            "band_low": s.band_low if s else 0,
            "band_high": s.band_high if s else 0,
            "in_green": self.in_green,
            "well_being": round(self.well_being, 1),
            "time_in_green": round(self.time_in_green, 2),
            "green_pct": round(100 * self.time_in_green / s.duration) if s else 0,
            "hold": self.hold,
            "k_mult": round(self.k_mult, 3),
            "active_event": self.active_event,
            "stars": self.stars,
        }
