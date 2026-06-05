# Starts the backend (uvicorn) and frontend (Vite) together for local dev.
# Open http://localhost:5173 in a browser. Ctrl+C stops both.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

$venvPy = Join-Path $root "backend\.venv\Scripts\python.exe"
if (Test-Path $venvPy) { $py = $venvPy } else { $py = "python" }

Write-Host "Starting backend  (http://localhost:8000)" -ForegroundColor Cyan
$backend = Start-Process -PassThru -NoNewWindow -FilePath $py `
  -ArgumentList "-m", "uvicorn", "app.main:app", "--reload", "--port", "8000" `
  -WorkingDirectory (Join-Path $root "backend")

Write-Host "Starting frontend (http://localhost:5173)  <-- open this" -ForegroundColor Cyan
$frontend = Start-Process -PassThru -NoNewWindow -FilePath "npm.cmd" `
  -ArgumentList "run", "dev" `
  -WorkingDirectory (Join-Path $root "frontend")

Write-Host "`nBoth running. Press Ctrl+C to stop." -ForegroundColor Yellow
try {
  Wait-Process -Id $backend.Id, $frontend.Id
} finally {
  foreach ($p in @($backend, $frontend)) {
    if ($p -and -not $p.HasExited) {
      Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
    }
  }
}
