<?php
// إنشاء جداول نظام الحروب
// Setup War System Database Tables

try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "بدء إنشاء جداول نظام الحروب...\n";
    
    // قراءة ملف SQL
    $sql_content = file_get_contents('database/war_system_complete.sql');
    
    // تنفيذ الاستعلامات
    $pdo->exec($sql_content);
    
    echo "تم إنشاء جداول نظام الحروب بنجاح!\n";
    
    // التحقق من وجود الجداول
    $tables = [
        'war_types',
        'war_maps', 
        'war_matches',
        'war_chat',
        'clan_points_history',
        'clan_war_stats'
    ];
    
    echo "\nالتحقق من الجداول المنشأة:\n";
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            echo "✅ $table\n";
        } else {
            echo "❌ $table\n";
        }
    }
    
    // عرض أنواع الحروب المتاحة
    echo "\nأنواع الحروب المتاحة:\n";
    $stmt = $pdo->query("SELECT name, winner_points, loser_points, duration_hours FROM war_types");
    while ($row = $stmt->fetch()) {
        echo "- {$row['name']}: فائز +{$row['winner_points']} نقطة، خاسر -{$row['loser_points']} نقطة\n";
    }
    
    // عرض الخرائط المتاحة
    echo "\nالخرائط المتاحة:\n";
    $stmt = $pdo->query("SELECT name, difficulty_level FROM war_maps");
    while ($row = $stmt->fetch()) {
        echo "- {$row['name']} ({$row['difficulty_level']})\n";
    }
    
} catch (PDOException $e) {
    echo "خطأ في قاعدة البيانات: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "خطأ: " . $e->getMessage() . "\n";
}
?>
