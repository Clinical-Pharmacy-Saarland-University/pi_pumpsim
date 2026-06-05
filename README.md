# pi_pumpsim

A touchscreen "game" for demonstrating **pharmacokinetics (PK)** concepts to kids.
A peristaltic pump (driven by a Raspberry Pi 4) fills a water "avatar" of a person;
the goal is to reach an **optimal dose** (a target window of water level).

## Hardware (target)
- Raspberry Pi 4
- 7" touchscreen
- Peristaltic pump driven via GPIO pins
- Tubing: water reservoir → pump → "person" avatar vessel

## Goals & constraints
- **a)** Develop UI + logic *without* the Pi for the first iteration (run on a dev PC).
- **b)** Modern, "cool" touch-first UI.
- **c)** Pump is **mocked** for the first prototype.
- **d)** Later: debug/test on real hardware.
- **e)** Keyboard interface for debug/admin tasks.
- **f)** Calibration: pump rate, dead volume, target window, accuracy.

## Status
🚧 Bootstrapping — choosing the framework/stack. See discussion in the repo history.

## Layout (planned)
_TBD once the stack is chosen._
