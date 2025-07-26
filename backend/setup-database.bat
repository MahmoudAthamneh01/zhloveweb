@echo off
chcp 65001 > nul
echo.
echo ================================================
echo  ZH-Love Database Setup
echo ================================================
echo.

:menu
echo اختر طريقة إعداد قاعدة البيانات:
echo.
echo 1. إعداد قاعدة البيانات مع XAMPP
echo 2. إعداد قاعدة البيانات مع MySQL مباشرة
echo 3. إعداد قاعدة البيانات مع phpMyAdmin
echo 4. إنشاء ملف SQL للتشغيل اليدوي
echo 5. الخروج
echo.
set /p choice=اختر رقم الخيار: 

if "%choice%"=="1" goto xampp
if "%choice%"=="2" goto mysql
if "%choice%"=="3" goto phpmyadmin
if "%choice%"=="4" goto manual
if "%choice%"=="5" goto exit
echo خيار غير صحيح!
pause
goto menu

:xampp
echo.
echo ================================================
echo  إعداد قاعدة البيانات مع XAMPP
echo ================================================
echo.
echo 1. تأكد من تشغيل XAMPP Control Panel
echo 2. تأكد من تشغيل Apache و MySQL
echo 3. افتح المتصفح واذهب إلى: http://localhost/phpmyadmin
echo 4. اضغط على "New" لإنشاء قاعدة بيانات جديدة
echo 5. أدخل اسم قاعدة البيانات: zh_love_db
echo 6. اختر Collation: utf8mb4_unicode_ci
echo 7. اضغط Create
echo 8. اضغط على قاعدة البيانات الجديدة
echo 9. اضغط على Import
echo 10. اختر الملف: backend/database/complete_setup.sql
echo 11. اضغط Go
echo.
echo بعد الانتهاء، قم بتحديث إعدادات قاعدة البيانات في الملف:
echo backend/.env
echo.
echo DB_HOST=localhost
echo DB_PORT=3306
echo DB_NAME=zh_love_db
echo DB_USER=root
echo DB_PASS=
echo.
pause
goto menu

:mysql
echo.
echo ================================================
echo  إعداد قاعدة البيانات مع MySQL مباشرة
echo ================================================
echo.
echo سيتم محاولة إنشاء قاعدة البيانات...
echo.

mysql -u root -p < "database/complete_setup.sql"

if %errorlevel%==0 (
    echo.
    echo ✅ تم إنشاء قاعدة البيانات بنجاح!
    echo.
    echo تأكد من تحديث إعدادات قاعدة البيانات في الملف:
    echo backend/.env
    echo.
    echo DB_HOST=localhost
    echo DB_PORT=3306
    echo DB_NAME=zh_love_db
    echo DB_USER=root
    echo DB_PASS=كلمة_مرور_MySQL
    echo.
) else (
    echo.
    echo ❌ فشل في إنشاء قاعدة البيانات
    echo.
    echo الحلول المحتملة:
    echo 1. تأكد من تثبيت MySQL
    echo 2. تأكد من تشغيل خدمة MySQL
    echo 3. تأكد من صحة بيانات تسجيل الدخول
    echo 4. جرب الطريقة اليدوية (خيار 3)
    echo.
)
pause
goto menu

:phpmyadmin
echo.
echo ================================================
echo  إعداد قاعدة البيانات مع phpMyAdmin
echo ================================================
echo.
echo اتبع الخطوات التالية:
echo.
echo 1. افتح المتصفح واذهب إلى: http://localhost/phpmyadmin
echo 2. قم بتسجيل الدخول (عادة: root بدون كلمة مرور)
echo 3. اضغط على "New" لإنشاء قاعدة بيانات جديدة
echo 4. أدخل اسم قاعدة البيانات: zh_love_db
echo 5. اختر Collation: utf8mb4_unicode_ci
echo 6. اضغط Create
echo 7. اضغط على قاعدة البيانات الجديدة
echo 8. اضغط على Import
echo 9. اختر الملف: backend/database/complete_setup.sql
echo 10. اضغط Go
echo.
echo انتظر حتى يكتمل التحميل...
echo.
echo بعد الانتهاء، قم بتحديث إعدادات قاعدة البيانات في الملف:
echo backend/.env
echo.
start http://localhost/phpmyadmin
pause
goto menu

:manual
echo.
echo ================================================
echo  إنشاء ملف SQL للتشغيل اليدوي
echo ================================================
echo.
echo تم إنشاء ملف SQL شامل في:
echo backend/database/complete_setup.sql
echo.
echo يمكنك تشغيله بالطرق التالية:
echo.
echo 1. MySQL Command Line:
echo    mysql -u root -p ^< backend/database/complete_setup.sql
echo.
echo 2. phpMyAdmin:
echo    - افتح phpMyAdmin
echo    - اضغط Import
echo    - اختر الملف complete_setup.sql
echo.
echo 3. MySQL Workbench:
echo    - افتح MySQL Workbench
echo    - اتصل بقاعدة البيانات
echo    - افتح الملف complete_setup.sql
echo    - اضغط Execute
echo.
echo 4. HeidiSQL:
echo    - افتح HeidiSQL
echo    - اتصل بقاعدة البيانات
echo    - اضغط File ^> Load SQL file
echo    - اختر الملف complete_setup.sql
echo    - اضغط Execute
echo.
pause
goto menu

:exit
echo.
echo شكراً لاستخدام أداة إعداد قاعدة البيانات!
echo.
echo للمساعدة:
echo - تأكد من تحديث ملف .env بعد إنشاء قاعدة البيانات
echo - تأكد من تشغيل MySQL قبل تشغيل الباك إند
echo - للدعم الفني، راجع الملف README.md
echo.
pause
exit 