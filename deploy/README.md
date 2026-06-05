# Deploying pi_pumpsim on a Raspberry Pi (kiosk)

Target: **Raspberry Pi OS Bookworm Lite (64-bit)** on a Pi 4, booting straight
into the app full-screen via [`cage`](https://github.com/cage-kiosk/cage) (a
single-app Wayland kiosk compositor). Code arrives via **GitHub** (`git clone` /
`git pull`).

```
systemd ─ pumpsim-backend.service ─ uvicorn :8000 (serves the built UI + API/WS + GPIO)
systemd ─ pumpsim-kiosk.service   ─ cage → Chromium --kiosk → http://127.0.0.1:8000
```

The backend serves the pre-built `frontend/dist`, so in production there is **no
Vite dev server** — just two systemd services.

## First install
```bash
# on the Pi
git clone <your-github-url> pi_pumpsim
cd pi_pumpsim
deploy/install.sh          # apt deps, venv, builds UI, installs + enables both services
sudo reboot                # comes up in kiosk mode
```
`install.sh` is idempotent-ish; safe to re-run. It defaults `PUMP_BACKEND=mock`
so the very first boot drives nothing on the GPIO until you opt in.

## Updating (after pushing to GitHub)
```bash
cd pi_pumpsim && deploy/update.sh    # git pull → rebuild UI → restart services
```

## Configuration (`backend/.env`)
Copied from `backend/.env.example` on install. Key fields:
| Key | Meaning |
|---|---|
| `PUMP_BACKEND` | `mock` (no hardware) or `real` (drive GPIO) |
| `PUMP_GPIO_PIN` | BCM pin to the pump driver input |
| `PUMP_RATE_ML_S`, `DEAD_VOLUME_ML` | calibrate against the real pump + tubing |
| `TARGET_LOW_ML`, `TARGET_HIGH_ML`, `CAPACITY_ML`, `CLEARANCE_K` | game/PK tuning |

After editing: `sudo systemctl restart pumpsim-backend`.
(Calibration is also live-editable from the on-screen admin panel — press `A`.)

## ⚠️ Pump wiring (don't skip)
A GPIO pin **cannot** drive the pump motor directly. Put a driver in between:

```
GPIO PWM pin ──► MOSFET gate / motor-driver IN / relay
pump motor   ──► driver output, on its own 5–12 V supply
             ──► flyback diode across the motor
GND          ──► common between Pi and the driver supply
```
`RealPump` already outputs **PWM** on `PUMP_GPIO_PIN`, so duty cycle = pump speed.
Test with `PUMP_BACKEND=mock` on the real screen first, then switch to `real`.

## Display rotation (portrait panel → landscape 1280×720)
The panel is **720×1280 native**; rotate the framebuffer **and** the touch input
90°. The exact lines depend on your panel/driver, so this is the one step that
needs your specific hardware. General approach on Bookworm KMS:

1. **Framebuffer** — `/boot/firmware/cmdline.txt`, append to the single line:
   ```
   video=DSI-1:720x1280@60,rotate=90
   ```
   (Use the real connector name from `wlr-randr` / the boot log; could be `DSI-1`,
   `DSI-2`, or `HDMI-A-1`.)

2. **Touch** — rotate the touchscreen at the libinput level (compositor-agnostic,
   works under cage) via a udev rule, e.g. `/etc/udev/rules.d/99-pumpsim-touch.rules`:
   ```
   ATTRS{name}=="<your touch device>", ENV{LIBINPUT_CALIBRATION_MATRIX}="0 1 0 -1 0 1"
   ```
   Find `<your touch device>` with `libinput list-devices`. The matrix above is for
   one 90° direction; use `0 -1 1 1 0 0` for the other.

> Many 720×1280 DSI panels also support rotation directly in their device-tree
> overlay (`dtoverlay=...,rotate=90`), which rotates display **and** touch together
> — the cleanest option if your panel offers it.

**Tell me the exact panel model + `libinput list-devices` output and I'll give you
the precise rotate/matrix lines.**

## Operating
```bash
systemctl status  pumpsim-backend pumpsim-kiosk
journalctl -u pumpsim-backend -f         # backend logs
journalctl -u pumpsim-kiosk   -f         # cage/Chromium logs
sudo systemctl restart pumpsim-kiosk     # reload the UI
```

## Notes
- **Bind address:** the backend listens on `127.0.0.1` (local only). To reach the
  UI/API from your PC on the LAN while debugging, change `--host` to `0.0.0.0` in
  `pumpsim-backend.service` (then re-run `install.sh` or edit the installed unit).
- **Mock on the Pi:** set `PUMP_BACKEND=mock` to exercise the UI on the real screen
  with no pump — handy for display/rotation work before the hardware is ready.
- **GPIO perms:** the backend runs as your user in the `gpio` group (no root);
  `gpiozero` uses the `lgpio` backend (set via the service's environment).
