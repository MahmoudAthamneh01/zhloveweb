# 🎮 ZH-Love Gaming Community - دليل التثبيت والتشغيل

## 🎯 مرحباً بك في منصة ZH-Love!

تم إنشاء موقع مجتمع ألعاب Command & Conquer: Generals Zero Hour كاملاً مع نظام مصادقة حقيقي، بيانات حقيقية، وباك إند PHP متكامل.

## ✅ المتطلبات الأساسية

تأكد من وجود:
- **Node.js** 18+ 
- **PHP** 8.2+
- **MySQL** 8.0+
- **Composer** 2.0+
- **Apache/Nginx** (للإنتاج)

## 🚀 التثبيت السريع (Windows)

### الطريقة الأولى: التثبيت الآلي (موصى به)

```bash
# 1. تشغيل الإعداد التلقائي
double-click على quick-start.bat

# 2. اختر الخيار رقم 1 للإعداد الأولي
# 3. اتبع التعليمات لإعداد قاعدة البيانات
# 4. اختر الخيار رقم 2 لبدء الخوادم
```

### الطريقة الثانية: التثبيت اليدوي

```bash
# 1. تثبيت تبعيات Node.js
npm install

# 2. تثبيت تبعيات PHP
cd backend
composer install
cd ..

# 3. إعداد ملف البيئة
copy env.example .env
copy backend\env.example backend\.env

# 4. تحرير backend\.env مع إعدادات قاعدة البيانات
# 5. إعداد قاعدة البيانات
mysql -u root -p -e "CREATE DATABASE zh_love_db;"
mysql -u root -p zh_love_db < backend/database/schema.sql
mysql -u root -p zh_love_db < backend/database/initial_data.sql

# 6. تشغيل الخوادم
# Terminal 1: Backend
cd backend
php -S localhost:8080 -t public

# Terminal 2: Frontend
npm run dev
```

## 🔧 إعدادات قاعدة البيانات

### MySQL Configuration
```sql
-- إعداد قاعدة البيانات
CREATE DATABASE zh_love_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON zh_love_db.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

### Backend .env Settings
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=zh_love_db
DB_USER=root
DB_PASS=your_password

# JWT
JWT_SECRET=your_super_secure_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRE_TIME=3600

# CORS
CORS_ORIGIN=http://localhost:4321
```

## 🌐 الوصول إلى الموقع

بعد تشغيل الخوادم:

- **الواجهة الأمامية**: http://localhost:4321
- **واجهة الإدارة**: http://localhost:4321/ar/admin
- **API الخلفية**: http://localhost:8080/api

## 🔐 حسابات المستخدمين الافتراضية

### حساب المدير
- **اسم المستخدم**: admin
- **البريد الإلكتروني**: admin@zh-love.com
- **كلمة المرور**: Admin@123456

### حساب المستخدم العادي
- **اسم المستخدم**: ZH_Legend
- **البريد الإلكتروني**: legend@zh-love.com
- **كلمة المرور**: Admin@123456

## 📊 البيانات المتاحة

### تم إنشاء البيانات التالية:
- ✅ **8 مستخدمين** مع أدوار مختلفة
- ✅ **5 عشائر نشطة** مع أعضاء
- ✅ **5 بطولات** في مراحل مختلفة
- ✅ **منتدى كامل** مع فئات ومنشورات
- ✅ **ملفات ريبلاي** مع تقييمات
- ✅ **قنوات يوتيوب** للستريمرز
- ✅ **نظام تصنيف** مع درجات

## 🛠️ الميزات المتاحة

### ✅ الميزات المكتملة
- **نظام المصادقة** (تسجيل دخول/خروج/إنشاء حساب)
- **نظام البطولات** مع إدارة المشاركين
- **نظام العشائر** مع أدوار الأعضاء
- **نظام المنتدى** مع المنشورات والردود
- **مشاركة الريبلايز** مع التقييمات
- **تكامل اليوتيوب** للستريمرز
- **نظام التصنيف** مع المستويات
- **لوحة الإدارة** الكاملة
- **الدعم العربي** RTL
- **التصميم المتجاوب**

## 🎨 إضافة الصور

### إنشاء الصور الأساسية:
1. افتح `create-images.html` في المتصفح
2. انقر على "Generate" لكل نوع صورة
3. احفظ الصور في المجلدات المناسبة

### المجلدات المطلوبة:
```
public/images/
├── avatars/       # صور المستخدمين
├── clans/         # شعارات العشائر
├── tournaments/   # بانرات البطولات
├── replays/       # صور الريبلايز
└── streamers/     # صور الستريمرز
```

## 🔄 واجهات API المتاحة

### المصادقة
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/register` - إنشاء حساب
- `POST /api/auth/logout` - تسجيل الخروج
- `GET /api/auth/me` - بيانات المستخدم الحالي

### البيانات الأساسية
- `GET /api/users` - قائمة المستخدمين
- `GET /api/clans` - قائمة العشائر
- `GET /api/tournaments` - قائمة البطولات
- `GET /api/forum/posts` - منشورات المنتدى
- `GET /api/replays` - ملفات الريبلاي
- `GET /api/streamers` - قائمة الستريمرز
- `GET /api/rankings` - التصنيفات

## 🎮 كيفية الاستخدام

### 1. تسجيل الدخول
- اذهب إلى الموقع
- انقر على "تسجيل الدخول"
- استخدم إما حساب المدير أو المستخدم العادي

### 2. استكشاف الميزات
- **البطولات**: عرض ومشاركة في البطولات
- **العشائر**: انضم إلى عشيرة أو أنشئ واحدة
- **المنتدى**: شارك في المناقشات
- **الريبلايز**: رفع ومشاهدة ملفات اللعب
- **التصنيفات**: تتبع تقدمك

### 3. لوحة الإدارة
- متاحة للمدير فقط
- إدارة المستخدمين والمحتوى
- عرض الإحصائيات والتقارير

## 📱 الدعم المتعدد المنصات

- ✅ **سطح المكتب** - تجربة كاملة
- ✅ **الهاتف المحمول** - متجاوب بالكامل
- ✅ **الأجهزة اللوحية** - محسن للمس

## 🌍 الدعم اللغوي

- 🇸🇦 **العربية** (RTL) - اللغة الأساسية
- 🇺🇸 **الإنجليزية** (LTR) - اللغة الثانوية

## 🚀 النشر للإنتاج

### للاستضافة العربية (Hostinger/cPanel):
```bash
# 1. بناء الموقع
npm run build

# 2. رفع الملفات
# رفع محتويات مجلد /dist إلى /public_html
# رفع مجلد /backend إلى حساب الاستضافة

# 3. إعداد قاعدة البيانات
# إنشاء قاعدة بيانات MySQL
# استيراد ملفات SQL من backend/database/

# 4. إعداد الإنتاج
# تحديث backend/.env بإعدادات الإنتاج
```

## 🔧 الأوامر المتاحة

```bash
# Frontend
npm run dev          # تشغيل خادم التطوير
npm run build        # بناء للإنتاج
npm run preview      # معاينة البناء

# Backend
cd backend
composer run start   # تشغيل خادم PHP
php -S localhost:8080 -t public

# Database
mysql -u root -p zh_love_db < backend/database/schema.sql
mysql -u root -p zh_love_db < backend/database/initial_data.sql
```

## 🆘 حل المشاكل الشائعة

### مشكلة الاتصال بقاعدة البيانات
```bash
# تأكد من تشغيل MySQL
# تحقق من إعدادات backend/.env
# تأكد من وجود قاعدة البيانات zh_love_db
```

### مشكلة API لا يعمل
```bash
# تحقق من إصدار PHP (8.2+ مطلوب)
# تأكد من تشغيل الخادم على المنفذ 8080
# تحقق من إعدادات CORS
```

### مشكلة الواجهة الأمامية
```bash
# تحقق من إصدار Node.js (18+ مطلوب)
# امسح cache المتصفح
# تأكد من تشغيل الخادم على المنفذ 4321
```

## 🎉 التحقق من نجاح التثبيت

إذا كنت تستطيع:
- ✅ الوصول إلى الموقع على http://localhost:4321
- ✅ تسجيل الدخول بحسابات المدير
- ✅ رؤية البطولات والعشائر
- ✅ الوصول إلى لوحة الإدارة
- ✅ استدعاء API على http://localhost:8080

فإن موقع ZH-Love Gaming Community جاهز للاستخدام! 🎮

---

## 📞 المساعدة والدعم

- راجع ملف `GETTING_STARTED.md` للمزيد من التفاصيل
- تأكد من تثبيت جميع المتطلبات
- اختبر مع البيانات التجريبية أولاً
- تحقق من سجلات الأخطاء في حالة وجود مشاكل

**تم إنشاؤه بـ ❤️ لمجتمع Command & Conquer: Generals Zero Hour** 