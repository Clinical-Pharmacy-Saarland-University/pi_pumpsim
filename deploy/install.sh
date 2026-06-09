#!/usr/bin/env bash
# One-time install on a Raspberry Pi (Pi OS Lite 64-bit, Bookworm or trixie).
# Run as your normal user from inside the cloned repo:  deploy/install.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
USER_NAME="$(id -un)"
APP_DIR="$ROOT"

if [ "$USER_NAME" = "root" ]; then
  echo "!! Run as your normal user (not root); it will sudo when needed." >&2
  exit 1
fi

echo "==> pi_pumpsim install"
echo "    app dir: $APP_DIR"
echo "    user:    $USER_NAME"

echo "==> apt packages (sway, chromium, python, node, emoji font)"
sudo apt update
# fonts-noto-color-emoji: Pi OS Lite ships no colour-emoji font, so Chromium
# renders the game's emoji (story icons, age icons, …) as blank/tofu without it.
sudo apt install -y sway python3-venv python3-pip curl nodejs npm fonts-noto-color-emoji
# chromium package name varies by release: 'chromium' (Debian/Pi OS trixie+), 'chromium-browser' (older Bookworm)
sudo apt install -y chromium || sudo apt install -y chromium-browser
# GPIO libs for the real pump — prebuilt apt packages (no compiler/swig needed).
# Only used when PUMP_BACKEND=real, so a failure here must not block the kiosk.
sudo apt install -y python3-gpiozero python3-lgpio || echo "  (GPIO libs not installed — fine until you wire the pump)"

echo "==> add $USER_NAME to gpio group"
sudo usermod -aG gpio "$USER_NAME" || true

echo "==> real pump: hardware-PWM overlay + sysfs permissions (IBT-2 on GPIO12/13)"
# GPIO12/13 are the Pi's hardware-PWM pins (RP1). Needed only for PUMP_BACKEND=real;
# harmless otherwise. The driver's VCC must be 3.3 V, not 5 V (see CLAUDE.md).
CONFIG_TXT=/boot/firmware/config.txt
[ -f "$CONFIG_TXT" ] || CONFIG_TXT=/boot/config.txt
if ! grep -q '^dtoverlay=pwm-2chan,pin=12' "$CONFIG_TXT" 2>/dev/null; then
  echo 'dtoverlay=pwm-2chan,pin=12,func=4,pin2=13,func2=4' | sudo tee -a "$CONFIG_TXT" >/dev/null
  echo "   added pwm-2chan overlay to $CONFIG_TXT (reboot required to take effect)"
fi
# udev rule: grant the 'gpio' group access to /sys/class/pwm so the backend
# (which runs as the normal user, Group=gpio) can drive hardware PWM without root.
sudo install -m 0644 "$APP_DIR/deploy/99-pwm.rules" /etc/udev/rules.d/99-pwm.rules
sudo udevadm control --reload-rules && sudo udevadm trigger --subsystem-match=pwm || true

echo "==> backend: venv + deps"
cd "$APP_DIR/backend"
# --system-site-packages lets the venv use the apt-provided gpiozero/lgpio above
# (avoids compiling lgpio from source). Recreated each install to ensure the flag.
rm -rf .venv
python3 -m venv --system-site-packages .venv
./.venv/bin/python -m pip install --upgrade pip
./.venv/bin/python -m pip install -r requirements.txt
[ -f .env ] || cp .env.example .env

echo "==> frontend: build the UI bundle"
cd "$APP_DIR/frontend"
npm ci
npm run build

echo "==> install systemd units"
TMP="$(mktemp -d)"
for unit in pumpsim-backend.service pumpsim-kiosk.service; do
  sed -e "s|__USER__|$USER_NAME|g" -e "s|__APP_DIR__|$APP_DIR|g" \
    "$APP_DIR/deploy/$unit" > "$TMP/$unit"
  sudo install -m 0644 "$TMP/$unit" "/etc/systemd/system/$unit"
done
rm -rf "$TMP"
chmod +x "$APP_DIR/deploy/kiosk.sh"

echo "==> install sway kiosk config (rotates the display to landscape)"
sudo mkdir -p /etc/pumpsim
sed "s|__APP_DIR__|$APP_DIR|g" "$APP_DIR/deploy/sway-kiosk.config" | sudo tee /etc/pumpsim/sway-kiosk.config >/dev/null

sudo systemctl daemon-reload
sudo systemctl enable pumpsim-backend.service pumpsim-kiosk.service

cat <<EOF

==> Done.

Next steps:
  1. (When the pump driver is wired) edit backend/.env:  PUMP_BACKEND=real
        IBT-2/BTS7960 on GPIO12/13 (hardware PWM), enables on GPIO23/24.
        IMPORTANT: the driver's VCC must be 3.3 V, NOT 5 V.
        Reboot once so the pwm-2chan overlay (added above) takes effect.
     Leave PUMP_BACKEND=mock to safely test the UI/admin on the screen first.
     The on-screen admin (long-press the top-left corner) jogs the pump + calibrates.

  2. The display + touch are rotated to landscape by sway
     (output * transform 90 in /etc/pumpsim/sway-kiosk.config).
     If the picture is upside-down, change 90 -> 270 there, then:
        sudo systemctl restart pumpsim-kiosk
     No /boot/firmware/config.txt rotation is needed (remove any you added).

  3. Start now (or just reboot — both services autostart):
        sudo systemctl start pumpsim-backend
        sudo systemctl start pumpsim-kiosk

Logs:
  journalctl -u pumpsim-backend -f
  journalctl -u pumpsim-kiosk -f
EOF
