# Deploying pi_pumpsim on a Raspberry Pi (kiosk)

Target: **Raspberry Pi OS Lite (64-bit, Bookworm or trixie)** on a Pi 4, booting
straight into the app full-screen via [`sway`](https://swaywm.org/) (a Wayland
compositor — it rotates the output to landscape, which `cage` cannot). Code arrives
via **GitHub** (`git clone` / `git pull`).

```
systemd ─ pumpsim-backend.service ─ uvicorn :8000 (serves the built UI + API/WS + GPIO)
systemd ─ pumpsim-kiosk.service   ─ sway (rotate→landscape) → Chromium --kiosk → :8000
```

The backend serves the pre-built `frontend/dist`, so in production there is **no
Vite dev server** — just two systemd services.

## First install
```bash
# on the Pi
git clone https://github.com/Clinical-Pharmacy-Saarland-University/pi_pumpsim.git
cd pi_pumpsim
deploy/install.sh          # apt deps, venv, builds UI, installs + enables both services
sudo reboot                # comes up in kiosk mode, landscape (sway rotates it)
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

## ⚠️ Pump wiring — IBT-2 (BTS7960) H-bridge (don't skip)
The pump is a reversible DC motor driven by an **IBT-2** H-bridge. The Pi provides
**logic signals only** — the motor runs off its **own external supply**. Direction is
set by *which* PWM input you drive (RPWM vs LPWM); both enables are held high.

**Signal side — IBT-2 → Raspberry Pi** (with our cable colours):

| IBT-2 pin | wire colour | Raspberry Pi (BCM / physical) |
|---|---|---|
| VCC  | 🔴 red    | **5V**  (pin 2)   |
| GND  | ⚫ black  | **GND** (pin 14) — common ground |
| RPWM | 🟢 green  | **GPIO12** (pin 32, PWM0) |
| LPWM | ⚪ white  | **GPIO13** (pin 33, PWM1) |
| R_EN | 🔵 blue   | **GPIO23** (pin 16) |
| L_EN | 🟡 yellow | **GPIO24** (pin 18) |
| R_IS / L_IS | — | leave unconnected |

**Power side — IBT-2:**

| IBT-2 terminal | connect to |
|---|---|
| B+ | external pump supply **+** |
| B− | external pump supply **−** |
| M+ / M− | the two **pump motor** wires |

Notes:
- On the IBT-2, logic `GND` and power `B−` are tied on the board, so Pi GND + supply−
  give a shared reference. Common ground is essential.
- 3.3 V GPIO into a 5 V-VCC IBT-2 normally works; if it's flaky, move VCC to **3.3 V** (pin 1).
- These pins are the defaults in `tools/pump_test.py` and (will be) `RealPump`'s
  `PUMP_RPWM_PIN` / `PUMP_LPWM_PIN` / `PUMP_REN_PIN` / `PUMP_LEN_PIN`.

**Bench-test it first** (independent of the game):
```bash
python3 tools/pump_test.py     # → open http://pumpsim.local:8001, drive IN/OUT + speed
```
Then run the game with `PUMP_BACKEND=mock` on the real screen before switching to `real`.

## Display + touch rotation — handled by sway (Touch Display 2, 720×1280 → landscape)
The Touch Display 2's native KMS mode is **720×1280 portrait**. We rotate in the
compositor: **`sway` rotates the Wayland output, and the touch input follows the
transform automatically** — so **no `/boot/firmware/config.txt` rotation is needed**
(the `dtoverlay=…,rotation=…` approach only rotates the *console*, not the Wayland
output, which is why `cage` showed the app sideways).

`deploy/install.sh` writes `/etc/pumpsim/sway-kiosk.config` containing:
```
output * transform 90      # left landscape; use 270 for the other orientation
```
**If the picture is upside-down**, change `90` → `270` and restart the kiosk:
```bash
sudo sed -i 's/transform 90/transform 270/' /etc/pumpsim/sway-kiosk.config
sudo systemctl restart pumpsim-kiosk
```
Touch always follows the picture (no separate touch calibration needed). If you ever
added kernel rotation to `config.txt`, remove it so it doesn't fight sway:
```bash
sudo sed -i 's/,rotation=90,swapxy,invx//; s/,rotation=270,swapxy,invy//' /boot/firmware/config.txt
```

## Operating
```bash
systemctl status  pumpsim-backend pumpsim-kiosk
journalctl -u pumpsim-backend -f         # backend logs
journalctl -u pumpsim-kiosk   -f         # sway/Chromium logs
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
