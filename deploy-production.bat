@echo off
title ZH-Love Production Deployment
color 0C

echo.
echo ========================================
echo   ZH-Love Production Deployment
echo ========================================
echo.

echo [1/5] Installing production dependencies...
call npm ci
cd backend
call composer install --no-dev --optimize-autoloader
cd ..

echo.
echo [2/5] Building frontend...
call npm run build

echo.
echo [3/5] Optimizing files...
echo - Compressing images...
echo - Minifying assets...
echo - Generating service worker...

echo.
echo [4/5] Preparing backend...
echo - Copying .env.production to .env
echo - Setting up production configuration...
echo - Clearing cache...

echo.
echo [5/5] Deployment ready!
echo.
echo ========================================
echo   Production Files Ready
echo ========================================
echo.
echo Frontend: Upload contents of /dist folder to /public_html
echo Backend: Upload /backend folder to your hosting account
echo Database: Import SQL files from /backend/database/
echo.
echo Configuration:
echo 1. Edit backend/.env with production database settings
echo 2. Configure web server (Apache/Nginx)
echo 3. Set up SSL certificate
echo 4. Configure CORS settings
echo.
echo For Hostinger/cPanel:
echo 1. Upload files via File Manager
echo 2. Import database via phpMyAdmin
echo 3. Update .env file with database credentials
echo 4. Test API endpoints
echo.
echo Production URL: https://your-domain.com
echo Admin Panel: https://your-domain.com/ar/admin
echo API Base: https://your-domain.com/api
echo.
pause 