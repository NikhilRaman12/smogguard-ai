@echo off
echo ========================================================
echo        SmogGuard AI - Standalone Launcher
echo ========================================================
echo.
echo Starting FastAPI Backend (Port 8000)...
start "SmogGuard Backend" cmd /k "python run_backend.py"

timeout /t 3 /nobreak >nul

echo Starting React Frontend (Port 3000)...
cd frontend
start "SmogGuard Frontend" cmd /k "npm run dev -- --host 127.0.0.1 --port 3000"

echo.
echo ========================================================
echo SmogGuard AI is running!
echo Access the UI:      http://127.0.0.1:3000
echo Access API Docs:    http://127.0.0.1:8000/docs
echo ========================================================
pause
