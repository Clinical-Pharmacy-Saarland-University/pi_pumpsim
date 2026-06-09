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
| `PUMP_BACKEND` | `mock` (no hardware) or `real` (drive the IBT-2) |
| `PUMP_RPWM_PIN` / `PUMP_LPWM_PIN` / `PUMP_REN_PIN` / `PUMP_LEN_PIN` | IBT-2 GPIO (BCM); defaults 12 / 13 / 23 / 24 |
| `PUMP_PWM_HZ`, `PUMP_PWM_CHIP`, `PUMP_IN_IS_RPWM` | hardware-PWM freq, sysfs chip (`auto`), swap IN/OUT |
| `PUMP_RATE_ML_S` | full-speed (100 % duty) flow, ml/s — set during calibration |

After editing: `sudo systemctl restart pumpsim-backend`.
(Calibration is also live-editable from the on-screen admin panel — **triple-tap the
SafePolyMed logo** on the Start screen, or press `A`.)

## Calibration
Run the **guided calibration wizard** from the admin (triple-tap the logo → „Geführte
Kalibrierung starten"): it finds the deadband and the duty→flow curve (you weigh the water,
1 g ≈ 1 ml) and saves to **`backend/calibration.json`** (per-machine, gitignored, loaded on
boot). The committed **`backend/calibration.default.json`** is the fallback baseline — to make
your numbers the default for every machine, `cp calibration.json calibration.default.json` and
commit. The admin's **Entleeren / Reset** panel sets the home-then-dose params
(`empty_overpump_s`, `prime_in_ml`). Full protocol: [`../docs/calibration.md`](../docs/calibration.md).

## ⚠️ Pump wiring — IBT-2 (BTS7960) H-bridge (don't skip)
The pump is a reversible DC motor driven by an **IBT-2** H-bridge. The Pi provides
**logic signals only** — the motor runs off its **own external supply**. Direction is
set by *which* PWM input you drive (RPWM vs LPWM); both enables are driven together
(high while pumping, low = a hard stop). Speed = hardware PWM duty (active-high).

**Signal side — IBT-2 → Raspberry Pi** (with our cable colours):

| IBT-2 pin | wire colour | Raspberry Pi (BCM / physical) |
|---|---|---|
| VCC  | 🔴 red    | **3.3V** (pin 1) ⚠️ **not 5V** |
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
- ⚠️ **VCC must be 3.3 V (pin 1), not 5 V.** At 5 V the BTS7960 input threshold sits
  above the Pi's 3.3 V GPIO HIGH → erratic / inverted speed. (This cost us a long debug.)
- These pins are the defaults in `tools/pump_test.py` and `RealPump`
  (`PUMP_RPWM_PIN` / `PUMP_LPWM_PIN` / `PUMP_REN_PIN` / `PUMP_LEN_PIN`). Speed uses
  **hardware PWM** via `rpi-hardware-pwm`; `deploy/install.sh` adds the `pwm-2chan`
  overlay + a udev rule so the backend can drive it without root.

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
