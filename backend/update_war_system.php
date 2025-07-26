<?php
// تحديث جداول نظام الحروب لتدعم النقاط
try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "تحديث جداول نظام الحروب...\n";
    
    // تحديث جدول war_types
    echo "تحديث جدول war_types...\n";
    
    // إضافة الأعمدة المطلوبة للنقاط
    $columns_to_add = [
        "ADD COLUMN winner_points INT DEFAULT 150 AFTER description",
        "ADD COLUMN loser_points INT DEFAULT 50 AFTER winner_points", 
        "ADD COLUMN duration_hours INT DEFAULT 48 AFTER loser_points"
    ];
    
    foreach ($columns_to_add as $column_sql) {
        try {
            $pdo->exec("ALTER TABLE war_types $column_sql");
            echo "✅ تم إضافة عمود: $column_sql\n";
        } catch (PDOException $e) {
            // العمود موجود بالفعل، تجاهل الخطأ
            if (strpos($e->getMessage(), 'Duplicate column name') === false) {
                echo "⚠️  خطأ في إضافة العمود: " . $e->getMessage() . "\n";
            }
        }
    }
    
    // مسح البيانات القديمة وإدراج بيانات جديدة
    $pdo->exec("DELETE FROM war_types");
    
    $stmt = $pdo->prepare("INSERT INTO war_types (name, description, winner_points, loser_points, duration_hours, max_participants, default_duration, points_multiplier, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)");
    
    $war_types = [
        ['حرب عشائر كلاسيكية', 'مباراة تقليدية بين العشائر بقواعد اللعبة العادية', 200, 30, 48, 10, 120, 1.0],
        ['حرب سريعة', 'مباراة سريعة لمدة ساعة واحدة فقط', 100, 10, 1, 6, 60, 0.8],
        ['حرب ماراثون', 'حرب طويلة لمدة أسبوع كامل مع جوائز مضاعفة', 500, 100, 168, 20, 300, 2.0],
        ['بطولة العشائر', 'مباراة بطولة رسمية مع نقاط مضاعفة', 750, 150, 72, 16, 180, 1.5],
        ['تحدي الماسترز', 'للعشائر المتقدمة فقط - نقاط عالية جداً', 1000, 200, 96, 12, 240, 2.5]
    ];
    
    foreach ($war_types as $type) {
        $stmt->execute($type);
    }
    echo "✅ تم تحديث بيانات أنواع الحروب\n";
    
    // تحديث جدول war_maps
    echo "تحديث جدول war_maps...\n";
    
    // إضافة عمود صعوبة إذا لم يكن موجوداً
    try {
        $pdo->exec("ALTER TABLE war_maps ADD COLUMN difficulty_level ENUM('easy', 'medium', 'hard', 'expert') DEFAULT 'medium' AFTER description");
        echo "✅ تم إضافة عمود difficulty_level\n";
    } catch (PDOException $e) {
        // العمود موجود بالفعل أو خطأ آخر
    }
    
    // تحديث الخرائط الموجودة
    $pdo->exec("DELETE FROM war_maps");
    
    $stmt = $pdo->prepare("INSERT INTO war_maps (name, description, difficulty_level, image_url, game_mode, is_active) VALUES (?, ?, ?, ?, ?, 1)");
    
    $maps = [
        ['صحراء العقارب', 'خريطة صحراوية بمناظر قاحلة ومعارك شرسة', 'medium', '/images/maps/desert.jpg', 'classic'],
        ['جبال الثلج', 'خريطة جبلية مغطاة بالثلوج مع تحديات إضافية', 'hard', '/images/maps/snow.jpg', 'survival'],
        ['غابة الأمازون', 'خريطة غابات كثيفة مع عوائق طبيعية', 'medium', '/images/maps/forest.jpg', 'classic'],
        ['المدينة المدمرة', 'خريطة حضرية مدمرة مليئة بالأنقاض', 'expert', '/images/maps/city.jpg', 'urban'],
        ['السهول الخضراء', 'خريطة مفتوحة مناسبة للمبتدئين', 'easy', '/images/maps/plains.jpg', 'beginner'],
        ['جزيرة البراكين', 'خريطة خطيرة مع براكين نشطة', 'expert', '/images/maps/volcano.jpg', 'extreme'],
        ['وادي الملوك', 'خريطة تاريخية بطابع ملكي', 'hard', '/images/maps/valley.jpg', 'historical']
    ];
    
    foreach ($maps as $map) {
        $stmt->execute($map);
    }
    echo "✅ تم تحديث بيانات خرائط الحروب\n";
    
    // التحقق من النتائج
    echo "\nأنواع الحروب المحدثة:\n";
    $stmt = $pdo->query("SELECT name, winner_points, loser_points, duration_hours FROM war_types WHERE is_active = 1");
    while ($row = $stmt->fetch()) {
        echo "- {$row['name']}: فائز +{$row['winner_points']} نقطة، خاسر -{$row['loser_points']} نقطة ({$row['duration_hours']} ساعة)\n";
    }
    
    echo "\nالخرائط المحدثة:\n";
    $stmt = $pdo->query("SELECT name, difficulty_level FROM war_maps WHERE is_active = 1");
    while ($row = $stmt->fetch()) {
        echo "- {$row['name']} ({$row['difficulty_level']})\n";
    }
    
    echo "\n🎉 تم تحديث نظام الحروب بنجاح!\n";
    
} catch (PDOException $e) {
    echo "خطأ: " . $e->getMessage() . "\n";
}
?>
