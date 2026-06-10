#!/usr/bin/env bash
# Pull the latest code and redeploy on the Pi:  deploy/update.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Refuse to update while the read-only overlay is active — git pull + rebuild would
# land in the RAM layer and silently vanish on the next reboot. Unlock first.
if command -v raspi-config >/dev/null 2>&1 \
  && [ "$(raspi-config nonint get_overlay_now 2>/dev/null || echo 1)" = "0" ]; then
  echo "!! Read-only overlay is ON — updates would NOT persist past a reboot." >&2
  echo "   1) deploy/overlay.sh off && sudo reboot" >&2
  echo "   2) (after reboot) re-run: deploy/update.sh" >&2
  echo "   3) deploy/overlay.sh on  && sudo reboot" >&2
  exit 1
fi

echo "==> git pull"
git pull --ff-only

echo "==> backend deps (in case requirements changed)"
./backend/.venv/bin/python -m pip install -r backend/requirements.txt

echo "==> rebuild UI"
( cd frontend && npm ci && npm run build )

echo "==> restart services"
sudo systemctl restart pumpsim-backend.service
sudo systemctl restart pumpsim-kiosk.service

echo "==> done"
