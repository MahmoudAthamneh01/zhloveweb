<?php
// Create advanced war system tables
try {
    $db = new PDO('mysql:host=localhost;dbname=zh_love_db;charset=utf8mb4', 'root', '');
    
    echo "=== إنشاء نظام الحروب المتقدم ===\n\n";
    
    // 1. War Types Table
    $createWarTypesTable = "
    CREATE TABLE IF NOT EXISTS war_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        max_participants INT DEFAULT 10,
        default_duration INT DEFAULT 48,
        points_multiplier DECIMAL(3,2) DEFAULT 1.00,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    $db->exec($createWarTypesTable);
    echo "✓ تم إنشاء جدول war_types\n";
    
    // 2. War Maps Table
    $createWarMapsTable = "
    CREATE TABLE IF NOT EXISTS war_maps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        game_mode VARCHAR(50),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    $db->exec($createWarMapsTable);
    echo "✓ تم إنشاء جدول war_maps\n";
    
    // 3. Streamers Table
    $createStreamersTable = "
    CREATE TABLE IF NOT EXISTS streamers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        streamer_name VARCHAR(100) NOT NULL,
        platform ENUM('twitch', 'youtube', 'facebook', 'other') DEFAULT 'twitch',
        channel_url VARCHAR(500),
        is_verified BOOLEAN DEFAULT FALSE,
        is_available BOOLEAN DEFAULT TRUE,
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_streams INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_platform (platform),
        INDEX idx_is_available (is_available)
    )";
    
    $db->exec($createStreamersTable);
    echo "✓ تم إنشاء جدول streamers\n";
    
    // 4. War Chat Table
    $createWarChatTable = "
    CREATE TABLE IF NOT EXISTS war_chat (
        id INT AUTO_INCREMENT PRIMARY KEY,
        war_id INT NOT NULL,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        message_type ENUM('text', 'system', 'result') DEFAULT 'text',
        is_private BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (war_id) REFERENCES clan_wars(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        
        INDEX idx_war_id (war_id),
        INDEX idx_created_at (created_at)
    )";
    
    $db->exec($createWarChatTable);
    echo "✓ تم إنشاء جدول war_chat\n";
    
    // 5. War Results Table
    $createWarResultsTable = "
    CREATE TABLE IF NOT EXISTS war_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        war_id INT NOT NULL,
        reported_by_clan_id INT NOT NULL,
        winner_clan_id INT,
        challenger_score INT DEFAULT 0,
        challenged_score INT DEFAULT 0,
        evidence_url VARCHAR(500),
        notes TEXT,
        status ENUM('pending', 'confirmed', 'disputed', 'admin_verified') DEFAULT 'pending',
        reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        confirmed_at TIMESTAMP NULL,
        confirmed_by INT NULL,
        
        FOREIGN KEY (war_id) REFERENCES clan_wars(id) ON DELETE CASCADE,
        FOREIGN KEY (reported_by_clan_id) REFERENCES clans(id) ON DELETE CASCADE,
        FOREIGN KEY (winner_clan_id) REFERENCES clans(id) ON DELETE SET NULL,
        FOREIGN KEY (confirmed_by) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_war_id (war_id),
        INDEX idx_status (status)
    )";
    
    $db->exec($createWarResultsTable);
    echo "✓ تم إنشاء جدول war_results\n";
    
    // 6. Clan Points History Table
    $createClanPointsHistoryTable = "
    CREATE TABLE IF NOT EXISTS clan_points_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clan_id INT NOT NULL,
        war_id INT,
        points_change INT NOT NULL,
        points_before INT NOT NULL,
        points_after INT NOT NULL,
        reason VARCHAR(200),
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (clan_id) REFERENCES clans(id) ON DELETE CASCADE,
        FOREIGN KEY (war_id) REFERENCES clan_wars(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_clan_id (clan_id),
        INDEX idx_war_id (war_id),
        INDEX idx_created_at (created_at)
    )";
    
    $db->exec($createClanPointsHistoryTable);
    echo "✓ تم إنشاء جدول clan_points_history\n";
    
    // 7. Admin Notifications Table
    $createAdminNotificationsTable = "
    CREATE TABLE IF NOT EXISTS admin_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('war_result_dispute', 'war_no_report', 'clan_issue', 'other') NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        related_war_id INT,
        related_clan_id INT,
        status ENUM('unread', 'read', 'handled') DEFAULT 'unread',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        handled_at TIMESTAMP NULL,
        handled_by INT NULL,
        
        FOREIGN KEY (related_war_id) REFERENCES clan_wars(id) ON DELETE SET NULL,
        FOREIGN KEY (related_clan_id) REFERENCES clans(id) ON DELETE SET NULL,
        FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_created_at (created_at)
    )";
    
    $db->exec($createAdminNotificationsTable);
    echo "✓ تم إنشاء جدول admin_notifications\n";
    
    echo "\n=== إضافة بيانات تجريبية ===\n";
    
    // Insert sample war types
    $warTypes = [
        ['1v1 Duel', 'مبارزة فردية بين لاعبين', 2, 24, 0.8],
        ['3v3 Team', 'مباراة فريق 3 ضد 3', 6, 48, 1.0],
        ['5v5 Classic', 'المباراة الكلاسيكية 5 ضد 5', 10, 72, 1.5],
        ['Tournament Style', 'نمط البطولة متعدد الجولات', 16, 168, 2.0]
    ];
    
    $stmt = $db->prepare("INSERT INTO war_types (name, description, max_participants, default_duration, points_multiplier) VALUES (?, ?, ?, ?, ?)");
    foreach ($warTypes as $type) {
        $stmt->execute($type);
    }
    echo "✓ تم إضافة أنواع الحروب\n";
    
    // Insert sample maps
    $maps = [
        ['الصحراء الكبرى', 'خريطة صحراوية واسعة مع تضاريس متنوعة', '/images/maps/desert.jpg', 'Conquest'],
        ['المدينة المدمرة', 'بيئة حضرية مدمرة مناسبة للقتال القريب', '/images/maps/city.jpg', 'Team Deathmatch'],
        ['الغابة الكثيفة', 'غابة كثيفة تتطلب تكتيكات التخفي', '/images/maps/forest.jpg', 'Search and Destroy'],
        ['القاعدة الجبلية', 'قاعدة عسكرية في الجبال', '/images/maps/mountain.jpg', 'Domination']
    ];
    
    $stmt = $db->prepare("INSERT INTO war_maps (name, description, image_url, game_mode) VALUES (?, ?, ?, ?)");
    foreach ($maps as $map) {
        $stmt->execute($map);
    }
    echo "✓ تم إضافة خرائط الحروب\n";
    
    // Insert sample streamers
    $streamers = [
        [null, 'ZH_StreamMaster', 'twitch', 'https://twitch.tv/zh_streammaster', true, true, 4.8],
        [null, 'Gaming_Legend_AR', 'youtube', 'https://youtube.com/gaming_legend_ar', true, true, 4.5],
        [null, 'Pro_Caster_ME', 'twitch', 'https://twitch.tv/pro_caster_me', false, true, 4.2],
        [null, 'Arabic_Esports', 'facebook', 'https://facebook.com/arabic_esports', true, true, 4.7]
    ];
    
    $stmt = $db->prepare("INSERT INTO streamers (user_id, streamer_name, platform, channel_url, is_verified, is_available, rating) VALUES (?, ?, ?, ?, ?, ?, ?)");
    foreach ($streamers as $streamer) {
        $stmt->execute($streamer);
    }
    echo "✓ تم إضافة ستريمرز تجريبيين\n";
    
    echo "\n=== تم الانتهاء من إنشاء النظام ===\n";
    
} catch (Exception $e) {
    echo "خطأ: " . $e->getMessage() . "\n";
}
?>
