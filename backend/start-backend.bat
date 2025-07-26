@echo off
title ZH-Love Backend API Server
color 0E

echo.
echo ========================================
echo   ZH-Love Backend API Server
echo ========================================
echo.

echo Checking dependencies...
if not exist "vendor" (
    echo Installing Composer dependencies...
    call composer install
)

echo.
echo Copying environment file...
if not exist ".env" (
    copy "env.example" ".env"
    echo Please edit .env with your database configuration
    echo.
    pause
)

echo.
echo Starting PHP development server...
echo Server URL: http://localhost:8080
echo API Base URL: http://localhost:8080/api
echo.
echo Press Ctrl+C to stop the server
echo.

php -S localhost:8080 -t public 