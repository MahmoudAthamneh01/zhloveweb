@echo off
title ZH-Love Quick Start
color 0A

echo.
echo ========================================
echo   ZH-Love Gaming Community
echo   Quick Start Guide
echo ========================================
echo.

echo What would you like to do?
echo.
echo [1] First time setup (install dependencies + database)
echo [2] Start development servers (frontend + backend)
echo [3] Setup database only
echo [4] Start backend API only
echo [5] Build for production
echo [6] Exit
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto firsttime
if "%choice%"=="2" goto startdev
if "%choice%"=="3" goto setupdb
if "%choice%"=="4" goto startapi
if "%choice%"=="5" goto buildprod
if "%choice%"=="6" goto end

echo Invalid choice. Please try again.
pause
goto start

:firsttime
echo.
echo ========================================
echo   First Time Setup
echo ========================================
echo.

echo [1/4] Installing Node.js dependencies...
call npm install

echo [2/4] Installing PHP dependencies...
cd backend
call composer install
cd ..

echo [3/4] Setting up environment...
if not exist "backend/.env" (
    copy "backend\env.example" "backend\.env"
    echo.
    echo IMPORTANT: Please edit backend/.env with your database settings
    echo Default database name: zh_love_db
    echo.
    pause
)

echo [4/4] Setting up database...
call setup-database.bat

echo.
echo Setup complete! You can now start the development servers.
pause
goto start

:startdev
echo.
echo ========================================
echo   Starting Development Servers
echo ========================================
echo.

echo Starting PHP API server...
start "PHP API Server" cmd /k "cd backend && php -S localhost:8080 -t public"

timeout /t 2 /nobreak >nul

echo Starting Astro frontend server...
start "Astro Frontend Server" cmd /k "npm run dev"

echo.
echo Servers are starting...
echo Frontend: http://localhost:4321
echo Backend API: http://localhost:8080
echo Admin Panel: http://localhost:4321/ar/admin
echo.
echo Default Admin Login:
echo Username: admin
echo Password: Admin@123456
echo.
pause
goto start

:setupdb
call setup-database.bat
pause
goto start

:startapi
cd backend
call start-backend.bat
pause
goto start

:buildprod
call deploy-production.bat
pause
goto start

:end
echo.
echo Thank you for using ZH-Love Gaming Community!
echo.
pause 