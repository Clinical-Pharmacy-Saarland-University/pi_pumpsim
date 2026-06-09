"""App version — single source of truth is the repo-root `VERSION` file.

`just tag <x>` writes that file, commits it, creates the `v<x>` git tag and
pushes. The backend reads it here and ships it in the WS state snapshot so the
on-screen admin can show the running version (see frontend `Admin.svelte`).
"""
from __future__ import annotations

from pathlib import Path

# backend/app/version.py -> parents[2] == repo root (same anchor main.py uses)
_VERSION_FILE = Path(__file__).resolve().parents[2] / "VERSION"


def _read_version() -> str:
    try:
        return _VERSION_FILE.read_text(encoding="utf-8").strip() or "0.0.0"
    except OSError:
        return "0.0.0"


APP_VERSION = _read_version()
