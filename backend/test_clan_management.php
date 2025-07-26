<?php
// Test clan management features
try {
    $db = new PDO('mysql:host=localhost;dbname=zh_love_db;charset=utf8mb4', 'root', '');
    
    echo "=== اختبار ميزات إدارة العشيرة ===\n\n";
    
    // Test current clan structure
    echo "1. بنية جدول العشائر الحديثة:\n";
    $stmt = $db->query("DESCRIBE clans");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        if (in_array($column['Field'], ['recruitment_type', 'logo_url', 'banner_url'])) {
            echo "✓ {$column['Field']}: {$column['Type']}\n";
        }
    }
    
    echo "\n2. الجداول الجديدة:\n";
    
    // Check clan_leadership_history
    $stmt = $db->query("SHOW TABLES LIKE 'clan_leadership_history'");
    if ($stmt->rowCount() > 0) {
        echo "✓ جدول clan_leadership_history موجود\n";
        $stmt = $db->query("SELECT COUNT(*) as count FROM clan_leadership_history");
        $count = $stmt->fetch()['count'];
        echo "  - السجلات: $count\n";
    }
    
    // Check clan_modifications
    $stmt = $db->query("SHOW TABLES LIKE 'clan_modifications'");
    if ($stmt->rowCount() > 0) {
        echo "✓ جدول clan_modifications موجود\n";
        $stmt = $db->query("SELECT COUNT(*) as count FROM clan_modifications");
        $count = $stmt->fetch()['count'];
        echo "  - السجلات: $count\n";
    }
    
    echo "\n3. العشائر الحالية مع الحقول الجديدة:\n";
    $stmt = $db->query("
        SELECT id, name, tag, owner_id, recruitment_type, logo_url, banner_url, is_active 
        FROM clans 
        WHERE is_active = 1 
        LIMIT 3
    ");
    $clans = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($clans as $clan) {
        echo "- العشيرة: {$clan['name']} [{$clan['tag']}]\n";
        echo "  المالك: {$clan['owner_id']}\n";
        echo "  نوع التجنيد: " . ($clan['recruitment_type'] ?: 'open') . "\n";
        echo "  الشعار: " . ($clan['logo_url'] ?: 'غير موجود') . "\n";
        echo "  الخلفية: " . ($clan['banner_url'] ?: 'غير موجود') . "\n\n";
    }
    
    echo "4. أعضاء العشيرة للاختبار:\n";
    if (!empty($clans)) {
        $clanId = $clans[0]['id'];
        $stmt = $db->prepare("
            SELECT cm.*, u.username, u.first_name, u.last_name 
            FROM clan_members cm 
            JOIN users u ON cm.user_id = u.id 
            WHERE cm.clan_id = ? AND cm.status = 'active'
            ORDER BY cm.role DESC
        ");
        $stmt->execute([$clanId]);
        $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($members as $member) {
            echo "- {$member['username']} ({$member['first_name']} {$member['last_name']}) - {$member['role']}\n";
        }
    }
    
    echo "\n=== الاختبار مكتمل ===\n";
    
} catch (Exception $e) {
    echo "خطأ: " . $e->getMessage() . "\n";
}
?>
