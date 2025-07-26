@echo off
chcp 65001 > nul
title ZH-Love Project Launcher
color 0A

:main_menu
cls
echo.
echo ========================================
echo   🎮 ZH-Love Gaming Community
echo ========================================
echo.
echo اختر ما تريد فعله:
echo.
echo 1. 🚀 تشغيل المشروع كاملاً
echo 2. 🌐 تشغيل الواجهة الأمامية فقط
echo 3. ⚙️  تشغيل الباك إند فقط
echo 4. 🗄️  إعداد قاعدة البيانات
echo 5. 📋 عرض حالة المشروع
echo 6. 🔧 إعدادات متقدمة
echo 7. 📚 مساعدة
echo 8. ❌ خروج
echo.
set /p choice=اختر الرقم المطلوب: 

if "%choice%"=="1" goto start_all
if "%choice%"=="2" goto start_frontend
if "%choice%"=="3" goto start_backend
if "%choice%"=="4" goto setup_database
if "%choice%"=="5" goto show_status
if "%choice%"=="6" goto advanced_settings
if "%choice%"=="7" goto help
if "%choice%"=="8" goto exit

echo خيار غير صحيح!
pause
goto main_menu

:start_all
cls
echo.
echo ========================================
echo   🚀 تشغيل المشروع كاملاً
echo ========================================
echo.
echo سيتم تشغيل:
echo - الواجهة الأمامية على: http://localhost:4321
echo - الباك إند على: http://localhost:8080
echo.
echo اضغط أي مفتاح للمتابعة...
pause > nul

echo تشغيل الباك إند...
start "ZH-Love Backend" cmd /k "cd backend && php -S localhost:8080 -t public"

timeout /t 3 > nul

echo تشغيل الواجهة الأمامية...
start "ZH-Love Frontend" cmd /k "npm run dev"

echo.
echo ✅ تم تشغيل المشروع بنجاح!
echo.
echo 🌐 الواجهة الأمامية: http://localhost:4321
echo ⚙️ الباك إند: http://localhost:8080
echo.
echo اضغط أي مفتاح للعودة للقائمة الرئيسية...
pause > nul
goto main_menu

:start_frontend
cls
echo.
echo ========================================
echo   🌐 تشغيل الواجهة الأمامية
echo ========================================
echo.
echo سيتم تشغيل الواجهة الأمامية على: http://localhost:4321
echo.
echo اضغط أي مفتاح للمتابعة...
pause > nul

start "ZH-Love Frontend" cmd /k "npm run dev"

echo.
echo ✅ تم تشغيل الواجهة الأمامية!
echo 🌐 الرابط: http://localhost:4321
echo.
echo اضغط أي مفتاح للعودة للقائمة الرئيسية...
pause > nul
goto main_menu

:start_backend
cls
echo.
echo ========================================
echo   ⚙️ تشغيل الباك إند
echo ========================================
echo.
echo سيتم تشغيل الباك إند على: http://localhost:8080
echo.
echo اضغط أي مفتاح للمتابعة...
pause > nul

cd backend
start "ZH-Love Backend" cmd /k "php -S localhost:8080 -t public"
cd ..

echo.
echo ✅ تم تشغيل الباك إند!
echo ⚙️ الرابط: http://localhost:8080
echo.
echo اضغط أي مفتاح للعودة للقائمة الرئيسية...
pause > nul
goto main_menu

:setup_database
cls
echo.
echo ========================================
echo   🗄️ إعداد قاعدة البيانات
echo ========================================
echo.
cd backend
call setup-database.bat
cd ..
goto main_menu

:show_status
cls
echo.
echo ========================================
echo   📋 حالة المشروع
echo ========================================
echo.

echo تحقق من الملفات المطلوبة...
echo.

if exist "package.json" (
    echo ✅ package.json موجود
) else (
    echo ❌ package.json غير موجود
)

if exist "backend\composer.json" (
    echo ✅ backend\composer.json موجود
) else (
    echo ❌ backend\composer.json غير موجود
)

if exist "backend\.env" (
    echo ✅ backend\.env موجود
) else (
    echo ❌ backend\.env غير موجود - سيتم إنشاؤه
    if exist "backend\env.example" (
        copy "backend\env.example" "backend\.env" > nul
        echo ✅ تم إنشاء backend\.env من env.example
    )
)

if exist "node_modules" (
    echo ✅ node_modules موجود
) else (
    echo ❌ node_modules غير موجود - قم بتشغيل npm install
)

if exist "backend\vendor" (
    echo ✅ backend\vendor موجود
) else (
    echo ❌ backend\vendor غير موجود - قم بتشغيل composer install
)

echo.
echo تحقق من المنافذ...
echo.

netstat -an | findstr :4321 > nul
if %errorlevel%==0 (
    echo ✅ المنفذ 4321 مستخدم ^(الواجهة الأمامية^)
) else (
    echo ⚪ المنفذ 4321 متاح
)

netstat -an | findstr :8080 > nul
if %errorlevel%==0 (
    echo ✅ المنفذ 8080 مستخدم ^(الباك إند^)
) else (
    echo ⚪ المنفذ 8080 متاح
)

echo.
echo تحقق من قاعدة البيانات...
echo.

mysql -u root -e "USE zh_love_db; SELECT COUNT(*) FROM users;" 2>nul >nul
if %errorlevel%==0 (
    echo ✅ قاعدة البيانات zh_love_db موجودة ومتصلة
) else (
    echo ❌ قاعدة البيانات غير موجودة أو غير متصلة
)

echo.
echo اضغط أي مفتاح للعودة للقائمة الرئيسية...
pause > nul
goto main_menu

:advanced_settings
cls
echo.
echo ========================================
echo   🔧 إعدادات متقدمة
echo ========================================
echo.
echo 1. تثبيت التبعيات - Frontend
echo 2. تثبيت التبعيات - Backend
echo 3. تحديث التبعيات
echo 4. إعادة تعيين قاعدة البيانات
echo 5. تنظيف الملفات المؤقتة
echo 6. عرض ملف .env
echo 7. العودة للقائمة الرئيسية
echo.
set /p adv_choice=اختر الرقم المطلوب: 

if "%adv_choice%"=="1" goto install_frontend
if "%adv_choice%"=="2" goto install_backend
if "%adv_choice%"=="3" goto update_deps
if "%adv_choice%"=="4" goto reset_database
if "%adv_choice%"=="5" goto cleanup
if "%adv_choice%"=="6" goto show_env
if "%adv_choice%"=="7" goto main_menu

echo خيار غير صحيح!
pause
goto advanced_settings

:install_frontend
echo.
echo تثبيت تبعيات الواجهة الأمامية...
npm install
echo.
echo اضغط أي مفتاح للمتابعة...
pause > nul
goto advanced_settings

:install_backend
echo.
echo تثبيت تبعيات الباك إند...
cd backend
composer install
cd ..
echo.
echo اضغط أي مفتاح للمتابعة...
pause > nul
goto advanced_settings

:update_deps
echo.
echo تحديث التبعيات...
echo تحديث Frontend...
npm update
echo تحديث Backend...
cd backend
composer update
cd ..
echo.
echo اضغط أي مفتاح للمتابعة...
pause > nul
goto advanced_settings

:reset_database
echo.
echo ⚠️ تحذير: سيتم حذف جميع بيانات قاعدة البيانات!
echo.
set /p confirm=هل أنت متأكد؟ (y/N): 
if /i not "%confirm%"=="y" goto advanced_settings

echo.
echo إعادة تعيين قاعدة البيانات...
mysql -u root -p -e "DROP DATABASE IF EXISTS zh_love_db;"
mysql -u root -p < backend/database/complete_setup.sql
echo.
echo تم إعادة تعيين قاعدة البيانات!
echo.
pause
goto advanced_settings

:cleanup
echo.
echo تنظيف الملفات المؤقتة...
if exist "dist" rmdir /s /q "dist"
if exist ".astro" rmdir /s /q ".astro"
if exist "backend\logs\*.log" del /q "backend\logs\*.log"
echo.
echo تم تنظيف الملفات المؤقتة!
echo.
pause
goto advanced_settings

:show_env
cls
echo.
echo ========================================
echo   📄 محتوى ملف .env
echo ========================================
echo.
if exist "backend\.env" (
    type "backend\.env"
) else (
    echo ملف .env غير موجود!
)
echo.
echo اضغط أي مفتاح للمتابعة...
pause > nul
goto advanced_settings

:help
cls
echo.
echo ========================================
echo   📚 مساعدة
echo ========================================
echo.
echo 🔧 متطلبات النظام:
echo   - Node.js 18+ 
echo   - PHP 8.2+
echo   - MySQL 8.0+
echo   - Composer 2.0+
echo.
echo 📁 هيكل المشروع:
echo   - src/          : الواجهة الأمامية
echo   - backend/      : الباك إند
echo   - public/       : الملفات الثابتة
echo   - uploads/      : الملفات المرفوعة
echo.
echo 🌐 الروابط:
echo   - Frontend: http://localhost:4321
echo   - Backend:  http://localhost:8080
echo   - phpMyAdmin: http://localhost/phpmyadmin
echo.
echo 📋 خطوات التشغيل:
echo   1. تثبيت التبعيات
echo   2. إعداد قاعدة البيانات
echo   3. تشغيل الخوادم
echo   4. فتح المتصفح
echo.
echo 🔍 استكشاف الأخطاء:
echo   - تأكد من تشغيل MySQL
echo   - تأكد من إعدادات .env
echo   - تأكد من المنافذ المتاحة
echo   - راجع ملفات الـ logs
echo.
echo 📞 للدعم:
echo   - راجع الملف README.md
echo   - راجع الملف INSTALLATION.md
echo.
echo اضغط أي مفتاح للعودة للقائمة الرئيسية...
pause > nul
goto main_menu

:exit
cls
echo.
echo شكراً لاستخدام مشروع ZH-Love!
echo.
echo تأكد من إغلاق جميع الخوادم قبل إغلاق النوافذ.
echo.
echo للمساعدة في المستقبل، قم بتشغيل start-project.bat
echo.
pause
exit 