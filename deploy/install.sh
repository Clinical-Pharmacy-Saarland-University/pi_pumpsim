#!/usr/bin/env bash
# One-time install on a Raspberry Pi (Pi OS Bookworm Lite, 64-bit).
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

echo "==> apt packages (cage, chromium, python, node)"
sudo apt update
sudo apt install -y cage chromium-browser python3-venv python3-pip curl nodejs npm

echo "==> add $USER_NAME to gpio group"
sudo usermod -aG gpio "$USER_NAME" || true

echo "==> backend: venv + deps (+ Pi GPIO libs)"
cd "$APP_DIR/backend"
python3 -m venv .venv
./.venv/bin/python -m pip install --upgrade pip
./.venv/bin/python -m pip install -r requirements.txt
./.venv/bin/python -m pip install gpiozero lgpio
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

sudo systemctl daemon-reload
sudo systemctl enable pumpsim-backend.service pumpsim-kiosk.service

cat <<EOF

==> Done.

Next steps:
  1. (When the pump driver is wired) edit backend/.env:
        PUMP_BACKEND=real
        PUMP_GPIO_PIN=<bcm pin to the driver>
     Leave PUMP_BACKEND=mock to safely test the UI on the screen first.

  2. Display rotation (portrait panel -> landscape 1280x720):
     panel-specific — see deploy/README.md  (do this before relying on touch).

  3. Start now (or just reboot — both services autostart):
        sudo systemctl start pumpsim-backend
        sudo systemctl start pumpsim-kiosk

Logs:
  journalctl -u pumpsim-backend -f
  journalctl -u pumpsim-kiosk -f
EOF
