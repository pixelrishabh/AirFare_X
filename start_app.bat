@echo off
echo ========================================================
echo         AirFareX - Starting Backend & Frontend
echo ========================================================
echo.

start "AirFareX Backend (F4stAPI)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --port 8000"
timeout /t 3 >nul
start "AirFareX Frontend (Vite + React)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Servers launched successfully!
echo - Backend API:  http://localhost:8000
echo - Frontend UI:  http://localhost:5173
echo.
