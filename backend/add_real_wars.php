<?php
// Add wars with correct column structure
try {
    $db = new PDO('mysql:host=localhost;dbname=zh_love_db;charset=utf8mb4', 'root', '');
    
    echo "=== إضافة حروب تجريبية بالبنية الصحيحة ===\n";
    
    $sampleWars = [
        [
            'challenger_clan_id' => 1,
            'challenged_clan_id' => 2,
            'scheduled_at' => date('Y-m-d H:i:s', strtotime('+2 days')),
            'challenge_message' => 'تحدي ودي بين الذئاب المحاربة وأسياد الحرب - معركة الشرف',
            'rules' => 'حرب ودية، مدة 48 ساعة، أفضل من 10 مباريات',
            'status' => 'pending',
            'duration' => 48,
            'created_by' => 2
        ],
        [
            'challenger_clan_id' => 3,
            'challenged_clan_id' => 1,
            'scheduled_at' => date('Y-m-d H:i:s', strtotime('+1 day')),
            'challenge_message' => 'تحدي رسمي من عاصفة الصحراء - تحدي العاصفة',
            'rules' => 'حرب رسمية، مدة 72 ساعة، أفضل من 15 مباراة',
            'status' => 'accepted',
            'duration' => 72,
            'created_by' => 5
        ]
    ];
    
    $stmt = $db->prepare("
        INSERT INTO clan_wars 
        (challenger_clan_id, challenged_clan_id, scheduled_at, challenge_message, rules, status, duration, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    foreach ($sampleWars as $war) {
        $stmt->execute([
            $war['challenger_clan_id'],
            $war['challenged_clan_id'],
            $war['scheduled_at'],
            $war['challenge_message'],
            $war['rules'],
            $war['status'],
            $war['duration'],
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
        LIMIT 5
    ");
    $wars = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($wars as $war) {
        echo "- {$war['challenger_name']} [{$war['challenger_tag']}] ضد {$war['challenged_name']} [{$war['challenged_tag']}]\n";
        echo "  الحالة: {$war['status']}, الموعد: {$war['scheduled_at']}\n";
        echo "  الرسالة: {$war['challenge_message']}\n";
        echo "  القوانين: {$war['rules']}\n\n";
    }
    
} catch (Exception $e) {
    echo "خطأ: " . $e->getMessage() . "\n";
}
?>
