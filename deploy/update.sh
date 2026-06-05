#!/usr/bin/env bash
# Pull the latest code and redeploy on the Pi:  deploy/update.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

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
