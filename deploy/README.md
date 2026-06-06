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
git clone https://github.com/Clinical-Pharmacy-Saarland-University/pi_pumpsim.git
cd pi_pumpsim
deploy/install.sh          # apt deps, venv, builds UI, installs + enables both services
# rotate display + touch to landscape (Touch Display 2) — see "Display + touch rotation" below:
echo 'dtoverlay=vc4-kms-dsi-ili9881-7inch,rotation=90,swapxy,invx' | sudo tee -a /boot/firmware/config.txt
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

## Display + touch rotation — official Touch Display 2 (720×1280 → landscape)
This panel is the **Raspberry Pi Touch Display 2** (connector `DSI-1`, overlay
`vc4-kms-dsi-ili9881-7inch`). Its overlay rotates the **display *and* the touch
input together at the kernel level** — perfect for a `cage` kiosk, since there's no
desktop Screen Configuration tool involved.

Add **one line** to `/boot/firmware/config.txt`:
```ini
# left landscape (90° clockwise)
dtoverlay=vc4-kms-dsi-ili9881-7inch,rotation=90,swapxy,invx
```
…or, depending on which way you physically mount the panel:
```ini
# right landscape (270°)
dtoverlay=vc4-kms-dsi-ili9881-7inch,rotation=270,swapxy,invy
```
`rotation=` turns the picture; `swapxy` / `invx` / `invy` align touch to it.

**Reboot, then verify by tapping:**
- Picture landscape the right way up? If upside-down/mirrored, swap `90` ↔ `270`.
- Touch lands where you tap? If X is mirrored toggle `invx`; if Y, `invy`; if the
  axes feel transposed, toggle `swapxy`.

(`libinput list-devices` shows the touchscreen if you need to debug. The
`cmdline.txt` `video=DSI-1:720x1280@60,rotate=90` trick only rotates the **text
console** — it isn't needed for the kiosk; the overlay covers the Wayland session.)

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
