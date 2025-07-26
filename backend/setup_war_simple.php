<?php
// إنشاء جداول نظام الحروب خطوة بخطوة
try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "بدء إنشاء جداول نظام الحروب...\n";
    
    // 1. جدول أنواع الحروب
    $sql1 = "CREATE TABLE IF NOT EXISTS war_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        winner_points INT DEFAULT 150,
        loser_points INT DEFAULT 50,
        duration_hours INT DEFAULT 48,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_is_active (is_active)
    )";
    $pdo->exec($sql1);
    echo "✅ جدول war_types\n";
    
    // 2. جدول خرائط الحروب
    $sql2 = "CREATE TABLE IF NOT EXISTS war_maps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        image_url VARCHAR(255),
        difficulty_level ENUM('easy', 'medium', 'hard', 'expert') DEFAULT 'medium',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_difficulty (difficulty_level),
        INDEX idx_is_active (is_active)
    )";
    $pdo->exec($sql2);
    echo "✅ جدول war_maps\n";
    
    // 3. إدراج أنواع الحروب
    $pdo->exec("DELETE FROM war_types"); // مسح البيانات القديمة
    $stmt = $pdo->prepare("INSERT INTO war_types (name, description, winner_points, loser_points, duration_hours) VALUES (?, ?, ?, ?, ?)");
    
    $war_types = [
        ['حرب عشائر كلاسيكية', 'مباراة تقليدية بين العشائر بقواعد اللعبة العادية', 200, 30, 48],
        ['حرب سريعة', 'مباراة سريعة لمدة ساعة واحدة فقط', 100, 10, 1],
        ['حرب ماراثون', 'حرب طويلة لمدة أسبوع كامل مع جوائز مضاعفة', 500, 100, 168],
        ['بطولة العشائر', 'مباراة بطولة رسمية مع نقاط مضاعفة', 750, 150, 72],
        ['تحدي الماسترز', 'للعشائر المتقدمة فقط - نقاط عالية جداً', 1000, 200, 96]
    ];
    
    foreach ($war_types as $type) {
        $stmt->execute($type);
    }
    echo "✅ بيانات أنواع الحروب\n";
    
    // 4. إدراج خرائط الحروب
    $pdo->exec("DELETE FROM war_maps"); // مسح البيانات القديمة
    $stmt = $pdo->prepare("INSERT INTO war_maps (name, description, difficulty_level) VALUES (?, ?, ?)");
    
    $maps = [
        ['صحراء العقارب', 'خريطة صحراوية بمناظر قاحلة ومعارك شرسة', 'medium'],
        ['جبال الثلج', 'خريطة جبلية مغطاة بالثلوج مع تحديات إضافية', 'hard'],
        ['غابة الأمازون', 'خريطة غابات كثيفة مع عوائق طبيعية', 'medium'],
        ['المدينة المدمرة', 'خريطة حضرية مدمرة مليئة بالأنقاض', 'expert'],
        ['السهول الخضراء', 'خريطة مفتوحة مناسبة للمبتدئين', 'easy'],
        ['جزيرة البراكين', 'خريطة خطيرة مع براكين نشطة', 'expert'],
        ['وادي الملوك', 'خريطة تاريخية بطابع ملكي', 'hard']
    ];
    
    foreach ($maps as $map) {
        $stmt->execute($map);
    }
    echo "✅ بيانات خرائط الحروب\n";
    
    // 5. جدول تاريخ النقاط
    $sql3 = "CREATE TABLE IF NOT EXISTS clan_points_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clan_id INT NOT NULL,
        war_id INT,
        points_change INT NOT NULL,
        points_before INT NOT NULL,
        points_after INT NOT NULL,
        reason ENUM('war_win', 'war_loss', 'bonus', 'penalty', 'adjustment') NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (clan_id) REFERENCES clans(id) ON DELETE CASCADE,
        INDEX idx_clan_id (clan_id),
        INDEX idx_created_at (created_at)
    )";
    $pdo->exec($sql3);
    echo "✅ جدول clan_points_history\n";
    
    // 6. جدول إحصائيات الحروب
    $sql4 = "CREATE TABLE IF NOT EXISTS clan_war_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clan_id INT NOT NULL UNIQUE,
        total_wars INT DEFAULT 0,
        wars_won INT DEFAULT 0,
        wars_lost INT DEFAULT 0,
        wars_drawn INT DEFAULT 0,
        win_rate DECIMAL(5,2) DEFAULT 0.00,
        current_streak INT DEFAULT 0,
        best_streak INT DEFAULT 0,
        last_war_date TIMESTAMP NULL,
        ranking_position INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (clan_id) REFERENCES clans(id) ON DELETE CASCADE,
        INDEX idx_win_rate (win_rate),
        INDEX idx_ranking_position (ranking_position)
    )";
    $pdo->exec($sql4);
    echo "✅ جدول clan_war_stats\n";
    
    // عرض أنواع الحروب المتاحة
    echo "\nأنواع الحروب المتاحة:\n";
    $stmt = $pdo->query("SELECT name, winner_points, loser_points, duration_hours FROM war_types");
    while ($row = $stmt->fetch()) {
        echo "- {$row['name']}: فائز +{$row['winner_points']} نقطة، خاسر -{$row['loser_points']} نقطة ({$row['duration_hours']} ساعة)\n";
    }
    
    // عرض الخرائط المتاحة
    echo "\nالخرائط المتاحة:\n";
    $stmt = $pdo->query("SELECT name, difficulty_level FROM war_maps");
    while ($row = $stmt->fetch()) {
        echo "- {$row['name']} ({$row['difficulty_level']})\n";
    }
    
    echo "\n🎉 تم إعداد نظام الحروب بنجاح!\n";
    
} catch (PDOException $e) {
    echo "خطأ في قاعدة البيانات: " . $e->getMessage() . "\n";
}
?>
