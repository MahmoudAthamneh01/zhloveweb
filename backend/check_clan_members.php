<?php
// Check clan_members table structure
try {
    $db = new PDO('mysql:host=localhost;dbname=zh_love_db;charset=utf8mb4', 'root', '');
    
    echo "=== بنية جدول clan_members ===\n";
    $stmt = $db->query("DESCRIBE clan_members");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        echo "- {$column['Field']}: {$column['Type']} ({$column['Null']}, {$column['Default']})\n";
    }
    
    echo "\n=== إضافة حقل status إذا لم يكن موجوداً ===\n";
    
    // Check if status column exists
    $hasStatus = false;
    foreach ($columns as $column) {
        if ($column['Field'] === 'status') {
            $hasStatus = true;
            break;
        }
    }
    
    if (!$hasStatus) {
        $db->exec("ALTER TABLE clan_members ADD COLUMN status ENUM('active', 'inactive', 'kicked') DEFAULT 'active'");
        echo "✓ تمت إضافة حقل status\n";
    } else {
        echo "✓ حقل status موجود مسبقاً\n";
    }
    
    echo "\n=== اختبار الأعضاء ===\n";
    $stmt = $db->query("
        SELECT cm.*, u.username, u.first_name, u.last_name 
        FROM clan_members cm 
        JOIN users u ON cm.user_id = u.id 
        WHERE cm.clan_id = 1
        LIMIT 5
    ");
    $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($members as $member) {
        echo "- {$member['username']} ({$member['first_name']} {$member['last_name']}) - {$member['role']}\n";
    }
    
} catch (Exception $e) {
    echo "خطأ: " . $e->getMessage() . "\n";
}
?>
