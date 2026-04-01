# start-all.ps1
# Starts frontend, backend, and an ML API (uvicorn) in separate PowerShell windows.
# Usage: Run this from PowerShell in the repo root: .\start-all.ps1

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$frontend = Join-Path $root "frontend"
$backend = Join-Path $root "solar-efficiency-backend"
$ml = Join-Path $root "machine-learning"
$mlVenv = Join-Path $ml ".venv"

Write-Output "Repo root: $root"

# Create Python venv for ML if missing
if (-Not (Test-Path $mlVenv)) {
    Write-Output "Creating Python venv in $mlVenv"
    python -m venv $mlVenv
}

Write-Output "Starting frontend (vite)..."
Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command","Set-Location -Path '$frontend'; npm run dev" -WorkingDirectory $frontend

Write-Output "Starting backend (nodemon)..."
Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command","Set-Location -Path '$backend'; npm run dev" -WorkingDirectory $backend

Write-Output "Starting ML API (uvicorn) in venv on port 8000..."
$activate = ". '$mlVenv\Scripts\Activate.ps1'"
$cmd = "$activate; Set-Location -Path '$root'; uvicorn ml_api:app --reload --port 8000"
Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command",$cmd -WorkingDirectory $root

Write-Output "All services started. Frontend: http://localhost:5173, Backend: see backend logs, ML API: http://127.0.0.1:8000/predict"
