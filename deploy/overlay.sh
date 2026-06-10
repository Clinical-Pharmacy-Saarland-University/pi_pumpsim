#!/usr/bin/env bash
# Read-only overlay (power-cut protection) for the kiosk.
#
#   deploy/overlay.sh status   — is the root filesystem currently read-only?
#   deploy/overlay.sh off      — make it WRITABLE on next boot (do this BEFORE updating)
#   deploy/overlay.sh on       — re-enable READ-ONLY on next boot (do this AFTER updating)
#
# Toggling needs a reboot to take effect. While the overlay is ON, every write to the
# SD card lands in a RAM layer that is discarded on reboot — that's the point: an
# unexpected power cut cannot corrupt the card (this is what wiped the WiFi profile).
# It also means calibration / .env / WiFi changes only stick while the overlay is OFF.
set -euo pipefail

now() { raspi-config nonint get_overlay_now; }  # echoes 0 = ON (read-only), 1 = OFF

case "${1:-status}" in
  status)
    if [ "$(now)" = "0" ]; then
      echo "overlay: ON  — root filesystem is READ-ONLY (power-cut safe)"
    else
      echo "overlay: OFF — root filesystem is WRITABLE (changes persist)"
    fi
    ;;
  off | unlock | rw)
    sudo raspi-config nonint disable_overlayfs
    echo "Overlay OFF after reboot. Next:"
    echo "  sudo reboot"
    echo "  # then:  git pull && deploy/update.sh"
    echo "  # then:  deploy/overlay.sh on && sudo reboot"
    ;;
  on | lock | ro)
    sudo raspi-config nonint enable_overlayfs
    echo "Overlay ON after reboot. Next:  sudo reboot"
    ;;
  *)
    echo "usage: deploy/overlay.sh [status|on|off]" >&2
    exit 1
    ;;
esac
