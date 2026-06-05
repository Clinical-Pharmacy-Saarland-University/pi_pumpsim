#!/usr/bin/env bash
# Launched *inside* the cage Wayland kiosk compositor (see pumpsim-kiosk.service).
# Starts Chromium full-screen, pointing at the local backend, with the touch/kiosk
# gestures that would confuse kids (pinch-zoom, swipe-back) disabled.
set -euo pipefail

URL="${PUMPSIM_URL:-http://127.0.0.1:8000}"

if command -v chromium-browser >/dev/null 2>&1; then
  CHROME=chromium-browser
elif command -v chromium >/dev/null 2>&1; then
  CHROME=chromium
else
  echo "kiosk.sh: no chromium binary found" >&2
  exit 1
fi

exec "$CHROME" \
  --kiosk \
  --ozone-platform=wayland \
  --enable-features=UseOzonePlatform \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-features=Translate \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --check-for-update-interval=31536000 \
  --autoplay-policy=no-user-gesture-required \
  --no-first-run \
  --incognito \
  "$URL"
