<?php
// التحقق من هيكل قاعدة البيانات الحالية
try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "التحقق من الجداول الموجودة:\n";
    
    // عرض الجداول الموجودة
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($tables as $table) {
        echo "- $table\n";
    }
    
    // التحقق من وجود war_types
    if (in_array('war_types', $tables)) {
        echo "\nهيكل جدول war_types:\n";
        $stmt = $pdo->query("DESCRIBE war_types");
        while ($row = $stmt->fetch()) {
            echo "  {$row['Field']} - {$row['Type']}\n";
        }
        
        echo "\nعدد السجلات في war_types: ";
        $stmt = $pdo->query("SELECT COUNT(*) FROM war_types");
        echo $stmt->fetchColumn() . "\n";
    } else {
        echo "\n❌ جدول war_types غير موجود\n";
    }
    
    // التحقق من وجود war_maps
    if (in_array('war_maps', $tables)) {
        echo "\nهيكل جدول war_maps:\n";
        $stmt = $pdo->query("DESCRIBE war_maps");
        while ($row = $stmt->fetch()) {
            echo "  {$row['Field']} - {$row['Type']}\n";
        }
        
        echo "\nعدد السجلات في war_maps: ";
        $stmt = $pdo->query("SELECT COUNT(*) FROM war_maps");
        echo $stmt->fetchColumn() . "\n";
    } else {
        echo "\n❌ جدول war_maps غير موجود\n";
    }
    
} catch (PDOException $e) {
    echo "خطأ: " . $e->getMessage() . "\n";
}
?>
