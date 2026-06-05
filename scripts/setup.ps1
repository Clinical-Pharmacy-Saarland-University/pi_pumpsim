# One-time setup for local development (Windows).
# Creates the Python venv, installs backend deps, and installs frontend packages.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

Write-Host "==> Backend: creating venv + installing deps" -ForegroundColor Cyan
Push-Location (Join-Path $root "backend")
if (-not (Test-Path ".venv")) { python -m venv .venv }
& ".\.venv\Scripts\python.exe" -m pip install --upgrade pip
& ".\.venv\Scripts\python.exe" -m pip install -r requirements-dev.txt
if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env" }
Pop-Location

Write-Host "==> Frontend: npm install" -ForegroundColor Cyan
Push-Location (Join-Path $root "frontend")
npm install
Pop-Location

Write-Host "==> Done. Start the app with: scripts\run-dev.ps1" -ForegroundColor Green
