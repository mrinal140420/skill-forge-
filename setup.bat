@echo off
rem SkillForge Portal - Quick Start Script for Windows

echo.
echo 🚀 SkillForge Portal - Quick Start
echo ====================================
echo.

rem Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+
    exit /b 1
)

rem Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python is not installed. Please install Python 3.9+
    exit /b 1
)

echo ✓ Node.js: %NODE_VERSION%
for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo ✓ Python: %PYTHON_VERSION%
echo.

rem Setup Backend
echo 📦 Setting up Backend...
cd backend
call npm install
echo ✓ Backend dependencies installed
cd..
echo.

rem Setup Frontend
echo 📦 Setting up Frontend...
cd frontend
call npm install
echo ✓ Frontend dependencies installed
cd..
echo.

rem Setup ML Service
echo 📦 Setting up ML Service...
cd ml-service
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
echo ✓ ML Service dependencies installed
cd..
echo.

echo ✅ Setup Complete!
echo.
echo Next steps:
echo 1. Create .env files in backend/ and ml-service/ (see .env.example)
echo 2. Set up MongoDB Atlas and add connection string to backend/.env
echo 3. Run services in separate terminals:
echo    - Backend:    cd backend && npm run dev
echo    - ML Service: cd ml-service && python -m uvicorn main:app --reload
echo    - Frontend:   cd frontend && npm run dev
echo.
echo 4. Seed the database: cd backend && npm run seed
echo 5. Access the portal at http://localhost:5173
echo.
