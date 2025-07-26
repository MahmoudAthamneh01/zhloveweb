<?php
// Fix wars data insertion
try {
    $db = new PDO('mysql:host=localhost;dbname=zh_love_db;charset=utf8mb4', 'root', '');
    
    echo "=== فحص وإصلاح جدول clan_wars ===\n";
    
    // Check table structure
    $stmt = $db->query("DESCRIBE clan_wars");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "أعمدة الجدول:\n";
    foreach ($columns as $column) {
        echo "- {$column['Field']}: {$column['Type']}\n";
    }
    
    // Add sample wars with correct column names
    echo "\n=== إضافة حروب تجريبية ===\n";
    
    $sampleWars = [
        [
            'challenger_clan_id' => 1,
            'challenged_clan_id' => 2,
            'description' => 'حرب ودية بين الذئاب المحاربة وأسياد الحرب - معركة الشرف',
            'status' => 'pending',
            'start_time' => date('Y-m-d H:i:s', strtotime('+2 days')),
            'created_by' => 2
        ],
        [
            'challenger_clan_id' => 3,
            'challenged_clan_id' => 1,
            'description' => 'تحدي رسمي من عاصفة الصحراء - تحدي العاصفة',
            'status' => 'accepted',
            'start_time' => date('Y-m-d H:i:s', strtotime('+1 day')),
            'created_by' => 5
        ]
    ];
    
    $stmt = $db->prepare("
        INSERT INTO clan_wars 
        (challenger_clan_id, challenged_clan_id, description, status, start_time, created_by) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    
    foreach ($sampleWars as $war) {
        $stmt->execute([
            $war['challenger_clan_id'],
            $war['challenged_clan_id'],
            $war['description'],
            $war['status'],
            $war['start_time'],
            $war['created_by']
        ]);
    }
    echo "✓ تم إضافة " . count($sampleWars) . " حروب تجريبية\n";
    
    // Check inserted data
    echo "\n=== الحروب المضافة ===\n";
    $stmt = $db->query("
        SELECT cw.*, 
               c1.name as challenger_name, c1.tag as challenger_tag,
               c2.name as challenged_name, c2.tag as challenged_tag
        FROM clan_wars cw
        JOIN clans c1 ON cw.challenger_clan_id = c1.id
        JOIN clans c2 ON cw.challenged_clan_id = c2.id
        ORDER BY cw.created_at DESC
    ");
    $wars = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($wars as $war) {
        echo "- {$war['challenger_name']} [{$war['challenger_tag']}] ضد {$war['challenged_name']} [{$war['challenged_tag']}]\n";
        echo "  الحالة: {$war['status']}, البداية: {$war['start_time']}\n";
        echo "  الوصف: {$war['description']}\n\n";
    }
    
} catch (Exception $e) {
    echo "خطأ: " . $e->getMessage() . "\n";
}
?>
