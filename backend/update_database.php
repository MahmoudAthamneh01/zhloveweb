<?php
// تحديث قاعدة البيانات لإضافة عمود الصور
try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // التحقق من وجود العمود أولاً
    $stmt = $pdo->query("SHOW COLUMNS FROM forum_posts LIKE 'images'");
    $column_exists = $stmt->rowCount() > 0;
    
    if (!$column_exists) {
        echo "إضافة عمود الصور...\n";
        $pdo->exec("ALTER TABLE forum_posts ADD COLUMN images TEXT NULL AFTER content");
        echo "تم إضافة عمود الصور بنجاح!\n";
    } else {
        echo "عمود الصور موجود بالفعل.\n";
    }
    
    // إظهار البنية الحالية للجدول
    echo "\nبنية جدول forum_posts:\n";
    $stmt = $pdo->query("DESCRIBE forum_posts");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- {$row['Field']}: {$row['Type']}\n";
    }
    
} catch (PDOException $e) {
    echo "خطأ في قاعدة البيانات: " . $e->getMessage() . "\n";
}
?>
