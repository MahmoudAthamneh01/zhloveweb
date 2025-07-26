@echo off
title ZH-Love Database Setup
color 0B

echo.
echo ========================================
echo   ZH-Love Database Setup
echo ========================================
echo.

set /p mysql_user="Enter MySQL username (default: root): "
if "%mysql_user%"=="" set mysql_user=root

set /p mysql_pass="Enter MySQL password: "

set /p mysql_host="Enter MySQL host (default: localhost): "
if "%mysql_host%"=="" set mysql_host=localhost

echo.
echo Creating database and importing data...
echo.

echo [1/4] Creating database...
mysql -h %mysql_host% -u %mysql_user% -p%mysql_pass% -e "CREATE DATABASE IF NOT EXISTS zh_love_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo [2/4] Importing main schema...
mysql -h %mysql_host% -u %mysql_user% -p%mysql_pass% zh_love_db < backend/database/schema.sql

echo [3/4] Importing initial data...
mysql -h %mysql_host% -u %mysql_user% -p%mysql_pass% zh_love_db < backend/database/initial_data.sql

echo [4/4] Database setup complete!
echo.
echo Database: zh_love_db
echo Host: %mysql_host%
echo User: %mysql_user%
echo.
echo Default Admin Account:
echo Username: admin
echo Email: admin@zh-love.com
echo Password: Admin@123456
echo.
echo You can now start the development server.
echo.
pause 