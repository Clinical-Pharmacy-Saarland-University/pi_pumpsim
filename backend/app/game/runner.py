"""Async runner: ticks the LevelController, drives the pump toward the target,
and broadcasts level state to WebSocket clients.

Two modes:
  * auto   — the level moves toward the game's target; the pump follows.
  * manual — the admin jogs the pump directly (in/out/stop + speed + timed runs)
             for calibration; the level just mirrors the motion for feedback.
"""
from __future__ import annotations

import asyncio

from ..hardware.pump import Pump
from .calibration import DEFAULT as CAL_DEFAULT
from .controller import LevelController


def _interp_y(curve: list[tuple[float, float]], x: float) -> float:
    """y at x on a sorted (x, y) polyline, clamped to the endpoints."""
    if x <= curve[0][0]:
        return curve[0][1]
    if x >= curve[-1][0]:
        return curve[-1][1]
    for (x0, y0), (x1, y1) in zip(curve, curve[1:]):
        if x0 <= x <= x1:
            return y0 if x1 == x0 else y0 + (y1 - y0) * (x - x0) / (x1 - x0)
    return curve[-1][1]


def _interp_x(curve: list[tuple[float, float]], y: float) -> float:
    """x at y on a sorted (x, y) polyline whose y is non-decreasing, clamped. Inverts
    the flow curve: given a desired flow, find the duty that delivers it."""
    if y <= curve[0][1]:
        return curve[0][0]
    if y >= curve[-1][1]:
        return curve[-1][0]
    for (x0, y0), (x1, y1) in zip(curve, curve[1:]):
        if y0 <= y <= y1:
            return x0 if y1 == y0 else x0 + (x1 - x0) * (y - y0) / (y1 - y0)
    return curve[-1][0]


class LevelRunner:
    def __init__(
        self,
        pump: Pump,
        tick_hz: int,
        backend: str = "mock",
        version: str = "0.0.0",
        calibration: dict | None = None,
    ) -> None:
        self.pump = pump
        self.backend = backend
        self.version = version
        self.ctrl = LevelController()
        self.dt = 1.0 / max(1, tick_hz)
        self.manual = False
        # physical mapping (from calibration): level 0..100 <-> 0..volume_ml of water
        self.volume_ml: float = float(CAL_DEFAULT["torso_volume_ml"])
        self.rate_in_ml_s: float | None = None   # ml/s at 100% duty, fill
        self.rate_out_ml_s: float | None = None  # ml/s at 100% duty, drain
        self.deadband_in: float = 0.0            # duty below which the IN rotor won't turn
        self.deadband_out: float = 0.0           # duty below which the OUT rotor won't turn
        self.dead_space_ml: float = 0.0          # tubing dead-volume (prime/residual)
        # measured duty -> flow curves (ml/s), per direction, from the calibration
        # samples. Used to interpolate the real (possibly non-linear) pump response;
        # empty -> fall back to the linear deadband+full-rate model.
        self._samples_in: list[tuple[float, float]] = []
        self._samples_out: list[tuple[float, float]] = []
        self._manual_remaining: float | None = None  # seconds left on the current step
        self._seq: list[dict] = []  # queued timed steps (empty / prepare / mark goto)
        self._sync_level_after: float | None = None  # snap twin to this level when the seq ends
        self.homed = False  # is the twin anchored to a known physical level?
        # has a full Initialize run since this process booted? The first one drains the
        # unpumpable torso dead-space (a cold torso can be physically full); later ones
        # don't. NOT cleared by reset() — a frontend reload must not re-arm it.
        self.initialized_once = False
        # DEV physics sim (mock only): a hidden TRUE physical level the system doesn't
        # know — lets us play the init/home workflow against a torso that already has
        # water. Integrated from the actual pump commands at the calibrated rate.
        self.sim_active = False
        self.sim_level = 0.0                     # 0..100, the real water (hidden from the twin)
        self.sim_tube_units = 0.0                # tube fill (level-units 0..dead-space); air below
        self.sim_time_scale = 6.0                # sim runs this much faster than wall-clock
        self._listeners: set[asyncio.Queue] = set()
        self._task: asyncio.Task | None = None
        if calibration:
            self.apply_calibration(calibration)

    async def start(self) -> None:
        self._task = asyncio.create_task(self._loop())

    async def shutdown(self) -> None:
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        self.pump.stop()
        self.pump.close()

    # --- game (auto) commands ---------------------------------------------
    def set_target(self, level: float, rate: float | None = None) -> None:
        self.manual = False
        self.ctrl.set_target(level, rate)

    def reset(self) -> None:
        self.manual = False
        self._manual_remaining = None
        self._seq = []
        self._sync_level_after = None
        self.homed = False  # a software snap is not a known physical state
        self.ctrl.reset(immediate=True)
        self.pump.drive("stop")

    # --- DEV physics sim (mock only) --------------------------------------
    def simulate_start(self, fill_level: float) -> None:
        """DEV: pretend the system just powered on with an UNKNOWN amount of water
        already in the torso. Sets the hidden TRUE level and re-boots the belief
        (twin → baseline, homed False). Real pump commands then move the real water,
        so Home/Initialize can be played through against it. Mock only."""
        if self.backend == "real":
            return
        self.sim_active = True
        self.sim_level = max(0.0, min(100.0, fill_level))
        # leftover water means the line was wet — start the tube primed (full)
        cap = self.ctrl.cfg.capacity or 100.0
        self.sim_tube_units = self.dead_space_ml / self.volume_ml * cap if self.volume_ml > 0 else 0.0
        self.reset()  # belief goes back to a fresh, untrusted boot
        self.initialized_once = False  # a simulated power-on re-arms the first-init dead-space drain

    def clear_sim(self) -> None:
        self.sim_active = False
        self.sim_level = 0.0
        self.sim_tube_units = 0.0

    def _sim_step(self, dt: float) -> None:
        """Advance the hidden true state by what the pump actually moved this tick,
        through a 2-compartment model: a tube (dead-space) between the pump and the
        torso. Filling tops up the tube FIRST, then the torso; draining empties the
        torso first, then the tube (pulling air). Flow honours the deadband — so Home
        ends at a true 0 and a calibrated prime lands exactly on baseline."""
        if not self.sim_active or not self.pump.is_running:
            return
        flow = self._flow_units(self.pump.direction, self.pump.speed) * dt
        if flow <= 0:
            return
        cap = self.ctrl.cfg.capacity or 100.0
        dead_units = self.dead_space_ml / self.volume_ml * cap if self.volume_ml > 0 else 0.0
        if self.pump.direction == "in":
            fill_tube = min(flow, max(0.0, dead_units - self.sim_tube_units))
            self.sim_tube_units += fill_tube
            self.sim_level = min(cap, self.sim_level + (flow - fill_tube))
        elif self.pump.direction == "out":
            drain_torso = min(flow, self.sim_level)
            self.sim_level = max(0.0, self.sim_level - drain_torso)
            self.sim_tube_units = max(0.0, self.sim_tube_units - (flow - drain_torso))

    # --- admin (manual) commands ------------------------------------------
    def set_manual(self, on: bool) -> None:
        self.manual = on
        self._manual_remaining = None
        self._seq = []
        self._sync_level_after = None
        self.pump.drive("stop")
        if not on:
            self.ctrl.target = self.ctrl.level  # don't snap when auto resumes

    def manual_drive(self, direction: str, speed: float) -> None:
        self.manual = True
        self._manual_remaining = None
        self._seq = []
        self._sync_level_after = None
        self.homed = False  # a freehand jog can't be trusted to land anywhere known
        self.pump.drive(direction, speed)

    def manual_run(self, direction: str, speed: float, seconds: float) -> None:
        self.manual = True
        self._seq = []
        self._sync_level_after = None
        self.homed = False
        self.pump.drive(direction, speed)
        self._manual_remaining = max(0.1, min(120.0, seconds))

    def manual_set_speed(self, speed: float) -> None:
        """Live-adjust the pump speed WITHOUT disturbing an active timed run or
        sequence. Re-actuates the pump at the new duty if it's currently moving;
        leaves the countdown (`_manual_remaining`) and queue (`_seq`) untouched.

        Only takes effect in manual mode so it can never perturb an auto game.
        """
        if not self.manual:
            return
        self.pump.set_speed(speed)

    def manual_stop(self) -> None:
        self._manual_remaining = None
        self._seq = []
        self._sync_level_after = None
        self.pump.drive("stop")

    def run_sequence(self, steps: list[dict], sync_level: float | None = None) -> None:
        """Run a list of timed pump steps: [{dir, speed, seconds}, ...].

        Used for empty/overpump, prepare and the marking gotos. Drives in manual
        mode and auto-advances. `sync_level` (if given) snaps the twin to that level
        once the sequence finishes — the "we now physically know where the water is"
        assertion that powers `homed`. A bare sequence (None) leaves the twin
        un-anchored, so `homed` stays False.
        """
        self.manual = True
        self.homed = False
        self._sync_level_after = sync_level
        self._seq = [dict(s) for s in steps]
        self._advance_seq()

    def _sync_twin(self, level: float) -> None:
        """Anchor the twin to a now-known physical level and resume auto."""
        level = max(0.0, min(self.ctrl.cfg.capacity, level))
        self.ctrl.level = level
        self.ctrl.target = level
        self.ctrl.rate = self.ctrl.cfg.rate
        self.manual = False
        self.homed = True

    def prepare(self, empty_s: float, prime_s: float, prime_duty: float = 1.0) -> None:
        """Re-home to a known start. On REAL hardware: overpump empty, then prime to
        baseline at `prime_duty` (a gentle duty so the inflow doesn't splash — the
        caller sizes prime_s to the flow at that duty), then snap the twin to baseline.
        On mock the twin IS ground truth (no real water, no drift), so just settle it at
        baseline — keeps dev fast. With the DEV sim on, mock runs the REAL sequence."""
        if self.backend != "real" and not self.sim_active:
            self.set_target(self.ctrl.cfg.baseline)
            self.homed = True
            return
        steps: list[dict] = [{"dir": "out", "speed": 1.0, "seconds": empty_s}]
        if prime_s > 0:
            steps.append({"dir": "in", "speed": prime_duty, "seconds": prime_s})
        self.run_sequence(steps, sync_level=self.ctrl.cfg.baseline)

    def prime_to_baseline(self, prime_s: float, prime_duty: float = 1.0) -> None:
        """Prime-only init for a torso that's ALREADY empty (drained by hand): pump
        IN to baseline at `prime_duty` (gentle, no-splash) and anchor the twin — the
        no-overpump variant of prepare(). Use when the operator has emptied the torso
        themselves. Mock shortcut: settle at baseline + homed; real/sim: pump IN only
        (prime_s covers tube + baseline), then snap. An assumption, not a measurement —
        if the torso wasn't empty it overfills, so this is operator-asserted."""
        if self.backend != "real" and not self.sim_active:
            self.set_target(self.ctrl.cfg.baseline)
            self.homed = True
            return
        steps: list[dict] = []
        if prime_s > 0:
            steps.append({"dir": "in", "speed": prime_duty, "seconds": prime_s})
        self.run_sequence(steps, sync_level=self.ctrl.cfg.baseline)

    def home_empty(self, empty_s: float, tube_prime_s: float = 0.0) -> None:
        """Overpump empty, re-prime the tube (pump IN the dead-space so the line is
        full to the torso entry while the torso stays at 0), then anchor the twin at
        level 0 — the physical 'home'. With the tube primed, every later fill (goto /
        prepare) is a clean torso-volume number. Mock just declares zero — unless the
        DEV sim is on, when it actually pumps the real water out."""
        if self.backend != "real" and not self.sim_active:
            self.set_target(0.0)
            self.homed = True
            return
        steps: list[dict] = [{"dir": "out", "speed": 1.0, "seconds": empty_s}]
        if tube_prime_s > 0:
            steps.append({"dir": "in", "speed": 1.0, "seconds": tube_prime_s})
        self.run_sequence(steps, sync_level=0.0)

    def goto_level(self, level: float) -> None:
        """Drive to an exact level (to mark the torso). REAL: pump the precise volume
        delta from the current (homed) level at the calibrated rate, then snap. Mock:
        jump the twin straight there (or pump it, when the DEV sim is on)."""
        level = max(0.0, min(self.ctrl.cfg.capacity, level))
        if self.backend != "real" and not self.sim_active:
            self.set_target(level)
            self.homed = True
            return
        cap = self.ctrl.cfg.capacity or 100.0
        delta_ml = abs(level - self.ctrl.level) / cap * self.volume_ml
        direction = "in" if level >= self.ctrl.level else "out"
        rate = self._dir_rate_ml_s(direction) or 0.0
        seconds = delta_ml / rate if rate > 0 else 0.0
        if seconds <= 0:
            self._sync_twin(level)
            return
        self.run_sequence([{"dir": direction, "speed": 1.0, "seconds": seconds}], sync_level=level)

    def _advance_seq(self) -> None:
        if self._seq:
            step = self._seq.pop(0)
            self.pump.drive(str(step.get("dir", "stop")), float(step.get("speed", 1.0)))
            self._manual_remaining = max(0.1, min(600.0, float(step.get("seconds", 0))))
        else:
            self._manual_remaining = None
            self.pump.drive("stop")
            if self._sync_level_after is not None:
                lvl = self._sync_level_after
                self._sync_level_after = None
                self._sync_twin(lvl)  # twin is now physically at this level

    # --- calibration ---------------------------------------------------------
    def apply_calibration(self, cal: dict) -> None:
        """Adopt the persisted calibration: per-direction flow + torso volume.

        Explicit null/0 falls back to the committed defaults, so a cleared value
        behaves the same live as after a restart. rate_in is also pushed to the
        pump so its flow telemetry is calibrated.
        """
        rate_in = cal.get("rate_in") or CAL_DEFAULT["rate_in"]
        rate_out = cal.get("rate_out") or CAL_DEFAULT["rate_out"]
        self.rate_in_ml_s = float(rate_in) if rate_in else None
        self.rate_out_ml_s = float(rate_out) if rate_out else None
        self.deadband_in = float(cal.get("deadband_in") or 0.0)
        self.deadband_out = float(cal.get("deadband_out") or 0.0)
        self.dead_space_ml = float(cal.get("dead_space_ml") or 0.0)
        self.volume_ml = float(cal.get("torso_volume_ml") or CAL_DEFAULT["torso_volume_ml"])
        self._samples_in = self._parse_samples(cal.get("samples"), "in")
        self._samples_out = self._parse_samples(cal.get("samples"), "out")
        if self.rate_in_ml_s:
            self.pump.set_rate(self.rate_in_ml_s)

    @staticmethod
    def _parse_samples(raw: object, direction: str) -> list[tuple[float, float]]:
        """Extract a sorted (duty, ml/s) flow curve for one direction from the
        calibration samples. Tolerant: skips malformed / out-of-range points."""
        pts: list[tuple[float, float]] = []
        for s in raw if isinstance(raw, list) else []:
            if not isinstance(s, dict) or s.get("dir") != direction:
                continue
            try:
                duty, ml_s = float(s["duty"]), float(s["ml_per_s"])
            except (KeyError, TypeError, ValueError):
                continue
            if 0.0 <= duty <= 1.0 and ml_s >= 0.0:
                pts.append((duty, ml_s))
        pts.sort()
        return pts

    def _dir_rate_ml_s(self, direction: str) -> float | None:
        """Calibrated full-duty flow for a direction (drain is often slower)."""
        return self.rate_out_ml_s if direction == "out" else self.rate_in_ml_s

    def flow_ml_s(self, direction: str, duty: float) -> float:
        """Calibrated flow (ml/s) at a given duty — sample-interpolated. Used to size a
        timed run at a non-full duty, e.g. the gentle no-splash prime to baseline."""
        return self._flow_units(direction, duty) * self.volume_ml / 100.0

    def _rate_units(self, direction: str) -> float | None:
        """Calibrated full-duty rate as level-units/s (ml/s mapped over the torso)."""
        r = self._dir_rate_ml_s(direction)
        if not r or self.volume_ml <= 0:
            return None
        return r / self.volume_ml * 100.0

    def _deadband(self, direction: str) -> float:
        return self.deadband_out if direction == "out" else self.deadband_in

    def _flow_curve(self, direction: str) -> list[tuple[float, float]] | None:
        """The measured duty -> flow curve as sorted (duty, level-units/s) points,
        anchored at (deadband, 0). None when no samples sit above the deadband — the
        caller then falls back to the linear (deadband + full-rate) model."""
        if self.volume_ml <= 0:
            return None
        db = self._deadband(direction)
        pts = self._samples_out if direction == "out" else self._samples_in
        above = [(d, ml / self.volume_ml * 100.0) for (d, ml) in pts if d > db]
        if not above:
            return None
        return sorted([(db, 0.0)] + above)

    def _flow_units(self, direction: str, duty: float) -> float:
        """Actual flow (level-units/s) at a given duty. Below the deadband: zero. Above:
        piecewise-linear interpolation of the measured calibration samples; with no
        samples, a linear ramp from the deadband to the calibrated full-duty rate."""
        db = self._deadband(direction)
        if duty <= db:
            return 0.0
        curve = self._flow_curve(direction)
        if curve is not None:
            return _interp_y(curve, duty)
        r = self._rate_units(direction)
        if not r:
            return 0.0
        span = 1.0 - db
        return r * (duty - db) / span if span > 0 else 0.0

    def _duty_for_flow(self, direction: str, flow_u: float) -> float:
        """Inverse of _flow_units: the pump duty (0..1) that delivers `flow_u`
        level-units/s. Interpolates the measured sample curve when present (so the duty
        commanded to the hardware reflects its real, possibly non-linear response), else
        the linear deadband model. Clamped to [0, 1]."""
        if flow_u <= 0.0:
            return 0.0
        curve = self._flow_curve(direction)
        if curve is not None:
            return _interp_x(curve, flow_u)
        db = self._deadband(direction)
        r = self._rate_units(direction)
        if not r:
            return 0.0
        return min(1.0, db + (1.0 - db) * (flow_u / r))

    # --- loop -------------------------------------------------------------
    def _substeps(self) -> int:
        """How many fine physics sub-steps to run this wall-tick. During a DEV-sim
        timed sequence (init / home / goto) we fast-forward by running several fine
        sub-steps — kept fine so the fast-forward stays numerically accurate (the
        tube/torso fills land on exact volumes). Everything else is one real-time
        step, so a game played with the sim on isn't sped up."""
        seq = self.manual and (self._manual_remaining is not None or bool(self._seq))
        return int(self.sim_time_scale) if (self.sim_active and seq) else 1

    def _tick(self) -> None:
        """One wall-clock step (sync, so tests can drive it without the loop)."""
        for _ in range(self._substeps()):
            self._step(self.dt)

    def _step(self, dt: float) -> None:
        # keep the pump's telemetry rate in sync with the calibrated per-direction flow
        rate_ml = self._dir_rate_ml_s(self.pump.direction)
        if rate_ml and rate_ml != self.pump.rate_ml_s:
            self.pump.set_rate(rate_ml)
        if self.manual:
            if self._manual_remaining is not None:
                self._manual_remaining -= dt
                if self._manual_remaining <= 0:
                    # advance to the next step, OR (if this was the last) stop and run
                    # the end-of-sequence sync. _advance_seq handles both — calling it
                    # only when `_seq` is non-empty would skip the final sync/homed.
                    self._advance_seq()
            # Manual motion is raw motor control and is deliberately NOT tracked:
            # there's no level sensor, so the twin stays put until a home/goto/prepare
            # snaps it to a known level. (Stops us fooling ourselves about the level.)
        else:
            self._auto_follow(dt)
        self._sim_step(dt)  # advance the hidden true level from the actual pump command

    def _auto_follow(self, dt: float) -> None:
        """Auto (in-game) mode: move the level toward target using the CALIBRATED pump
        rate, modulating the pump duty so the displayed level always equals the water
        the pump actually moves. `ctrl.rate` is the desired pace — honoured when it's
        slower than the pump (gentle drift at low duty), capped at the pump rate when
        faster (water can't move quicker than the pump). Falls back to the legacy
        full-duty pacing only when the pump rate isn't calibrated."""
        c = self.ctrl
        diff = c.target - c.level
        if abs(diff) < 1e-6:
            self.pump.drive("stop", 0.0)
            return
        direction = "in" if diff > 0 else "out"
        pump_rate_u = self._rate_units(direction)
        if not pump_rate_u:
            c.tick(dt)  # uncalibrated: legacy game-rate pacing
            self.pump.drive(direction if abs(c.target - c.level) > 1e-6 else "stop", 1.0)
            return
        full_step = pump_rate_u * dt              # units the pump moves at full duty
        want_step = min(c.rate * dt, abs(diff))   # game-paced desire, capped at remaining
        delivered = min(want_step, full_step, abs(diff))  # can't outrun the pump or overshoot
        c.level = max(0.0, min(c.cfg.capacity, c.level + (delivered if direction == "in" else -delivered)))
        moving = delivered > 1e-9
        # command the duty the calibrated flow model says delivers this rate — from the
        # interpolated sample curve when present, else the linear deadband model
        duty = self._duty_for_flow(direction, delivered / dt) if (moving and dt > 0) else 0.0
        self.pump.drive(direction if moving else "stop", duty)

    async def _loop(self) -> None:
        while True:
            self._tick()
            self._broadcast()
            await asyncio.sleep(self.dt)

    # --- telemetry --------------------------------------------------------
    def snapshot(self) -> dict:
        snap = self.ctrl.snapshot()
        # physical mapping for the virtual torso (level% -> ml of water)
        cap = self.ctrl.cfg.capacity or 100.0
        snap["torso_volume_ml"] = round(self.volume_ml, 1)
        snap["level_ml"] = round(self.ctrl.level / cap * self.volume_ml, 1)
        snap["target_ml"] = round(self.ctrl.target / cap * self.volume_ml, 1)
        snap["pump_running"] = self.pump.is_running
        # a timed run / sequence is in progress (used by the UI to wait for prepare)
        snap["pump_busy"] = bool(
            self.manual and (self._manual_remaining is not None or self._seq)
        )
        snap["homed"] = self.homed  # twin anchored to a known physical level?
        # DEV physics sim: the hidden TRUE water level (what the torso really holds)
        snap["sim_active"] = self.sim_active
        snap["sim_level"] = round(self.sim_level, 2)
        snap["sim_level_ml"] = round(self.sim_level / cap * self.volume_ml, 1)
        snap["pump_direction"] = self.pump.direction
        snap["pump_speed"] = round(self.pump.speed, 3)
        snap["pump_flow_ml_s"] = round(self.pump.flow_ml_s, 3)
        snap["pump_rate_ml_s"] = round(self.pump.rate_ml_s, 3)
        snap["manual"] = self.manual
        snap["backend"] = self.backend
        snap["version"] = self.version
        return snap

    def _broadcast(self) -> None:
        snap = self.snapshot()
        for q in list(self._listeners):
            if q.full():
                try:
                    q.get_nowait()
                except asyncio.QueueEmpty:
                    pass
            try:
                q.put_nowait(snap)
            except asyncio.QueueFull:
                pass

    def subscribe(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue(maxsize=2)
        self._listeners.add(q)
        return q

    def unsubscribe(self, q: asyncio.Queue) -> None:
        self._listeners.discard(q)
