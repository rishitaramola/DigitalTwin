@echo off
TITLE Digital Twin of You — Setup | Bit Rebels
echo ============================================================
echo   Digital Twin of You — Setup Script
echo   Team: Bit Rebels ^| Hack-o-Holic 4.0
echo ============================================================
echo.

:: Check Python
python --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo [ERROR] Python not found! Please install Python 3.9+ from python.org
    pause
    exit /b 1
)

echo [1/4] Installing Python backend dependencies...
cd backend
pip install -r requirements.txt
IF ERRORLEVEL 1 (
    echo [ERROR] Failed to install Python packages!
    pause
    exit /b 1
)

echo.
echo [2/4] Training the Decision Tree model...
python ml/train.py
IF ERRORLEVEL 1 (
    echo [WARN] Model training failed, app will run in demo mode.
)

cd ..

:: Check Node
node --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo [ERROR] Node.js not found! Please install Node.js from nodejs.org
    pause
    exit /b 1
)

echo.
echo [3/4] Installing frontend dependencies...
cd frontend
npm install
IF ERRORLEVEL 1 (
    echo [ERROR] npm install failed!
    pause
    exit /b 1
)

cd ..

echo.
echo ============================================================
echo  [✓] Setup complete!
echo  Run start.bat to launch the application.
echo ============================================================
echo.
pause
