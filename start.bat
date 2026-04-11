@echo off
TITLE "Digital Twin of You - Bit Rebels"
echo ============================================================
echo   Digital Twin of You — Starting...
echo   Team: Bit Rebels ^| Hack-o-Holic 4.0
echo ============================================================
echo.
echo [1/2] Starting FastAPI backend (http://localhost:8000)...
start "Digital Twin Backend" /D "%~dp0backend" cmd /k "py -3.13 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo Waiting for backend to initialize...
timeout /t 4 /nobreak >nul

echo [2/2] Starting React frontend (http://localhost:3000)...
start "Digital Twin Frontend" /D "%~dp0frontend" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ============================================================
echo  [✓] Digital Twin of You is running!
echo.
echo  Frontend : http://localhost:3000
echo  Backend  : http://localhost:8000
echo  API Docs : http://localhost:8000/docs
echo ============================================================
echo.
start http://localhost:3000
