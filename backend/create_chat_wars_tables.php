<?php
// Create real data tables for chat and wars
try {
    $db = new PDO('mysql:host=localhost;dbname=zh_love_db;charset=utf8mb4', 'root', '');
    
    echo "=== إنشاء جداول الدردشة والحروب ===\n\n";
    
    // 1. Clan Messages Table
    $createClanMessagesTable = "
    CREATE TABLE IF NOT EXISTS clan_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clan_id INT NOT NULL,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        message_type ENUM('text', 'announcement', 'system', 'image') DEFAULT 'text',
        is_pinned BOOLEAN DEFAULT FALSE,
        replied_to_message_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (clan_id) REFERENCES clans(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (replied_to_message_id) REFERENCES clan_messages(id) ON DELETE SET NULL,
        
        INDEX idx_clan_id (clan_id),
        INDEX idx_created_at (created_at),
        INDEX idx_message_type (message_type)
    )";
    
    $db->exec($createClanMessagesTable);
    echo "✓ تم إنشاء جدول clan_messages\n";
    
    // 2. Clan Wars Table
    $createClanWarsTable = "
    CREATE TABLE IF NOT EXISTS clan_wars (
        id INT AUTO_INCREMENT PRIMARY KEY,
        challenger_clan_id INT NOT NULL,
        challenged_clan_id INT NOT NULL,
        war_name VARCHAR(200),
        description TEXT,
        war_type ENUM('friendly', 'ranked', 'tournament') DEFAULT 'friendly',
        status ENUM('pending', 'accepted', 'active', 'completed', 'cancelled') DEFAULT 'pending',
        start_time TIMESTAMP NULL,
        end_time TIMESTAMP NULL,
        duration_hours INT DEFAULT 48,
        max_participants INT DEFAULT 10,
        winner_clan_id INT NULL,
        challenger_score INT DEFAULT 0,
        challenged_score INT DEFAULT 0,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (challenger_clan_id) REFERENCES clans(id) ON DELETE CASCADE,
        FOREIGN KEY (challenged_clan_id) REFERENCES clans(id) ON DELETE CASCADE,
        FOREIGN KEY (winner_clan_id) REFERENCES clans(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
        
        INDEX idx_challenger_clan (challenger_clan_id),
        INDEX idx_challenged_clan (challenged_clan_id),
        INDEX idx_status (status),
        INDEX idx_start_time (start_time)
    )";
    
    $db->exec($createClanWarsTable);
    echo "✓ تم إنشاء جدول clan_wars\n";
    
    // 3. War Participants Table
    $createWarParticipantsTable = "
    CREATE TABLE IF NOT EXISTS war_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        war_id INT NOT NULL,
        clan_id INT NOT NULL,
        user_id INT NOT NULL,
        role ENUM('participant', 'captain', 'reserve') DEFAULT 'participant',
        kills INT DEFAULT 0,
        deaths INT DEFAULT 0,
        score INT DEFAULT 0,
        matches_played INT DEFAULT 0,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (war_id) REFERENCES clan_wars(id) ON DELETE CASCADE,
        FOREIGN KEY (clan_id) REFERENCES clans(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        
        UNIQUE KEY unique_war_participant (war_id, user_id),
        INDEX idx_war_id (war_id),
        INDEX idx_clan_id (clan_id)
    )";
    
    $db->exec($createWarParticipantsTable);
    echo "✓ تم إنشاء جدول war_participants\n";
    
    // 4. Insert sample data
    echo "\n=== إضافة بيانات تجريبية ===\n";
    
    // Sample clan messages
    $sampleMessages = [
        [1, 2, 'مرحباً بكم في عشيرة الذئاب المحاربة! 🐺', 'announcement'],
        [1, 2, 'اليوم لدينا تدريب جماعي في الساعة 8:00 مساءً', 'text'],
        [1, 4, 'هل يمكننا تنظيم مباراة ودية؟', 'text'],
        [1, 8, 'تهانينا لفوزنا في البطولة الأخيرة! 🏆', 'announcement'],
        [1, 2, 'لا تنسوا المشاركة في الحرب القادمة', 'text']
    ];
    
    $stmt = $db->prepare("
        INSERT INTO clan_messages (clan_id, user_id, message, message_type) 
        VALUES (?, ?, ?, ?)
    ");
    
    foreach ($sampleMessages as $msg) {
        $stmt->execute($msg);
    }
    echo "✓ تم إضافة " . count($sampleMessages) . " رسائل تجريبية\n";
    
    // Sample wars
    $sampleWars = [
        [
            'challenger_clan_id' => 1,
            'challenged_clan_id' => 2,
            'war_name' => 'معركة الشرف',
            'description' => 'حرب ودية بين الذئاب المحاربة وأسياد الحرب',
            'status' => 'pending',
            'start_time' => date('Y-m-d H:i:s', strtotime('+2 days')),
            'created_by' => 2
        ],
        [
            'challenger_clan_id' => 3,
            'challenged_clan_id' => 1,
            'war_name' => 'تحدي العاصفة',
            'description' => 'تحدي رسمي من عاصفة الصحراء',
            'status' => 'accepted',
            'start_time' => date('Y-m-d H:i:s', strtotime('+1 day')),
            'created_by' => 5
        ]
    ];
    
    $stmt = $db->prepare("
        INSERT INTO clan_wars 
        (challenger_clan_id, challenged_clan_id, war_name, description, status, start_time, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    foreach ($sampleWars as $war) {
        $stmt->execute([
            $war['challenger_clan_id'],
            $war['challenged_clan_id'],
            $war['war_name'],
            $war['description'],
            $war['status'],
            $war['start_time'],
            $war['created_by']
        ]);
    }
    echo "✓ تم إضافة " . count($sampleWars) . " حروب تجريبية\n";
    
    echo "\n=== تم الانتهاء بنجاح ===\n";
    
} catch (Exception $e) {
    echo "خطأ: " . $e->getMessage() . "\n";
}
?>
