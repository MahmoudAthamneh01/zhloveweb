<?php
// Test war APIs

echo "=== اختبار APIs نظام الحروب ===\n\n";

// Database connection
function getDB() {
    try {
        $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        echo "فشل الاتصال بقاعدة البيانات: " . $e->getMessage() . "\n";
        return null;
    }
}

$db = getDB();
if (!$db) {
    exit("فشل الاتصال بقاعدة البيانات\n");
}

// Test 1: Check war_types table
echo "1. فحص جدول أنواع الحروب:\n";
try {
    $stmt = $db->query("SELECT * FROM war_types WHERE is_active = 1 ORDER BY name");
    $warTypes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($warTypes) > 0) {
        echo "✅ تم العثور على " . count($warTypes) . " أنواع حروب:\n";
        foreach ($warTypes as $type) {
            echo "   - {$type['name']} (مدة: {$type['default_duration']} دقيقة)\n";
        }
    } else {
        echo "❌ لا توجد أنواع حروب\n";
    }
} catch (Exception $e) {
    echo "❌ خطأ في جدول war_types: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 2: Check war_maps table
echo "2. فحص جدول خرائط الحروب:\n";
try {
    $stmt = $db->query("SELECT * FROM war_maps WHERE is_active = 1 ORDER BY name");
    $maps = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($maps) > 0) {
        echo "✅ تم العثور على " . count($maps) . " خرائط:\n";
        foreach ($maps as $map) {
            echo "   - {$map['name']}\n";
        }
    } else {
        echo "❌ لا توجد خرائط\n";
    }
} catch (Exception $e) {
    echo "❌ خطأ في جدول war_maps: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 3: Check streamers table
echo "3. فحص جدول المذيعين:\n";
try {
    $stmt = $db->query("SELECT * FROM streamers WHERE is_active = 1 ORDER BY channel_name");
    $streamers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($streamers) > 0) {
        echo "✅ تم العثور على " . count($streamers) . " مذيعين:\n";
        foreach ($streamers as $streamer) {
            echo "   - {$streamer['channel_name']} ({$streamer['platform']})\n";
        }
    } else {
        echo "❌ لا يوجد مذيعين\n";
    }
} catch (Exception $e) {
    echo "❌ خطأ في جدول streamers: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 4: Check available clans for war
echo "4. فحص العشائر المتاحة للحرب:\n";
try {
    $stmt = $db->query("
        SELECT c.id, c.name, c.tag, c.total_points, c.level,
               COUNT(cm.id) as member_count
        FROM clans c
        LEFT JOIN clan_members cm ON c.id = cm.clan_id AND cm.status = 'active'
        WHERE c.is_active = 1 AND c.is_approved = 1
        GROUP BY c.id
        ORDER BY c.total_points DESC
        LIMIT 5
    ");
    $clans = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($clans) > 0) {
        echo "✅ تم العثور على " . count($clans) . " عشائر متاحة للحرب:\n";
        foreach ($clans as $clan) {
            echo "   - [{$clan['tag']}] {$clan['name']} (مستوى: {$clan['level']}, نقاط: {$clan['total_points']}, أعضاء: {$clan['member_count']})\n";
        }
    } else {
        echo "❌ لا توجد عشائر متاحة\n";
    }
} catch (Exception $e) {
    echo "❌ خطأ في فحص العشائر: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 5: Check existing wars
echo "5. فحص الحروب الموجودة:\n";
try {
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
    
    if (count($wars) > 0) {
        echo "✅ تم العثور على " . count($wars) . " حروب:\n";
        foreach ($wars as $war) {
            echo "   - [{$war['challenger_tag']}] vs [{$war['challenged_tag']}] - الحالة: {$war['status']}\n";
        }
    } else {
        echo "ℹ️ لا توجد حروب مسجلة حالياً\n";
    }
} catch (Exception $e) {
    echo "❌ خطأ في فحص الحروب: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 6: Check war_details table exists
echo "6. فحص جدول تفاصيل الحروب:\n";
try {
    $stmt = $db->query("SHOW TABLES LIKE 'war_details'");
    $tableExists = $stmt->fetch();
    
    if ($tableExists) {
        echo "✅ جدول war_details موجود\n";
        
        // Check structure
        $stmt = $db->query("DESCRIBE war_details");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "   الأعمدة: " . implode(", ", array_column($columns, 'Field')) . "\n";
    } else {
        echo "ℹ️ جدول war_details سيتم إنشاؤه عند الحاجة\n";
    }
} catch (Exception $e) {
    echo "❌ خطأ في فحص جدول war_details: " . $e->getMessage() . "\n";
}

echo "\n=== انتهى الاختبار ===\n";
?>
