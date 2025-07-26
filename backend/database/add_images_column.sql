-- إضافة عمود الصور لجدول المنشورات
ALTER TABLE forum_posts ADD COLUMN images TEXT NULL AFTER content;

-- إظهار البنية المحدثة للجدول
DESCRIBE forum_posts;
