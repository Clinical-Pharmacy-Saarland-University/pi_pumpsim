# pi_pumpsim — dev task runner.  Run `just` to list recipes.
# Windows-first (uses PowerShell). Install just:  scoop install just
#
# Typical loop:  just setup   (once)  →  just dev   →  Ctrl+C  /  just down

set windows-shell := ["powershell.exe", "-NoProfile", "-Command"]

# list all recipes
default:
    @just --list

# one-time setup: venv + backend deps + frontend packages
setup:
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts/setup.ps1

# start backend (:8000) + frontend (:5173) together — Ctrl+C stops both
dev:
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-dev.ps1

# start only the backend (uvicorn, autoreload) on :8000
backend:
    cd backend; ./.venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8000

# start only the frontend (Vite dev server) on :5173
frontend:
    cd frontend; npm run dev

# stop any stray dev servers (ports 8000 + 5173)
down:
    foreach ($p in 8000,5173) { Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Write-Host "stopping PID $_ (port $p)"; Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } }

# backend unit tests
test:
    cd backend; ./.venv/Scripts/python.exe -m pytest -q

# type-check the frontend
check:
    cd frontend; npm run check

# build the production UI bundle (the backend serves it at :8000)
build:
    cd frontend; npm run build

# build, then serve the bundled UI from the backend only (prod-like, no Vite) on :8000
serve: build
    cd backend; ./.venv/Scripts/python.exe -m uvicorn app.main:app --port 8000

# remove build artifacts + python caches
clean:
    if (Test-Path frontend/dist) { Remove-Item -Recurse -Force frontend/dist }
    Get-ChildItem backend/app, backend/tests -Recurse -Directory -Filter __pycache__ -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
    if (Test-Path backend/.pytest_cache) { Remove-Item -Recurse -Force backend/.pytest_cache }

# set the app version + cut a release: write VERSION, commit, annotated tag, push.  usage:  just tag 0.0.1-alpha
tag VERSION:
    [IO.File]::WriteAllText((Join-Path $PWD 'VERSION'), "{{VERSION}}`n")
    if (git status --porcelain -- VERSION) { git add VERSION; git commit -m "chore(release): v{{VERSION}}" } else { Write-Host "VERSION already v{{VERSION}} — tagging current HEAD." -ForegroundColor Cyan }
    git tag -a v{{VERSION}} -m "Release v{{VERSION}}"
    if (git remote | Select-String -Quiet origin) { git push origin HEAD; git push origin v{{VERSION}} } else { Write-Host "No 'origin' remote yet — committed + tagged v{{VERSION}} locally. After `git remote add origin <url>`:  git push origin HEAD; git push origin v{{VERSION}}" -ForegroundColor Yellow }
