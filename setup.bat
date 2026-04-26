@echo off
REM Setup script for AI Virtual Assistant (Windows)
REM This script sets up the project for development

echo 🚀 Setting up AI Virtual Assistant for eOffice
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+
    exit /b 1
)

echo ✅ Node.js found

REM Backend setup
echo.
echo 📦 Setting up backend...
cd backend
call npm install
echo ✅ Backend dependencies installed

REM Copy .env file
if not exist .env (
    copy .env.example .env
    echo ⚠️  Created .env file. Please update with your credentials!
)

cd ..

REM Frontend setup
echo.
echo 📦 Setting up frontend...
cd frontend
call npm install
echo ✅ Frontend dependencies installed

REM Copy .env file
if not exist .env (
    copy .env.example .env
    echo ⚠️  Created .env file. Please update with your credentials!
)

cd ..

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Update .env files in backend/ and frontend/ folders
echo 2. Set up PostgreSQL database
echo 3. Run migrations: npm run migrate
echo 4. Start backend: cd backend ^&^& npm run dev
echo 5. Start frontend: cd frontend ^&^& npm start
echo.
echo Happy coding! 🎉
