<?php
// Fix streamers data
try {
    $db = new PDO('mysql:host=localhost;dbname=zh_love_db;charset=utf8mb4', 'root', '');
    
    echo "=== فحص وإصلاح جدول streamers ===\n";
    
    // Check table structure
    $stmt = $db->query("DESCRIBE streamers");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "أعمدة الجدول:\n";
    foreach ($columns as $column) {
        echo "- {$column['Field']}: {$column['Type']}\n";
    }
    
    // Insert sample streamers with correct column names
    echo "\n=== إضافة ستريمرز تجريبيين ===\n";
    
    // Clear existing data first
    $db->exec("DELETE FROM streamers");
    
    $streamers = [
        [null, 'ZH_StreamMaster', 'twitch', 'https://twitch.tv/zh_streammaster', 1, 1, 4.8],
        [null, 'Gaming_Legend_AR', 'youtube', 'https://youtube.com/gaming_legend_ar', 1, 1, 4.5],
        [null, 'Pro_Caster_ME', 'twitch', 'https://twitch.tv/pro_caster_me', 0, 1, 4.2],
        [null, 'Arabic_Esports', 'facebook', 'https://facebook.com/arabic_esports', 1, 1, 4.7]
    ];
    
    // Get actual column name (might be 'name' instead of 'streamer_name')
    $nameColumn = 'name';
    foreach ($columns as $column) {
        if (in_array($column['Field'], ['streamer_name', 'name', 'username'])) {
            $nameColumn = $column['Field'];
            break;
        }
    }
    
    $stmt = $db->prepare("INSERT INTO streamers (user_id, $nameColumn, platform, channel_url, is_verified, is_available, rating) VALUES (?, ?, ?, ?, ?, ?, ?)");
    foreach ($streamers as $streamer) {
        $stmt->execute($streamer);
    }
    echo "✓ تم إضافة " . count($streamers) . " ستريمرز\n";
    
    // Check inserted data
    echo "\n=== الستريمرز المضافون ===\n";
    $stmt = $db->query("SELECT * FROM streamers");
    $streamers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($streamers as $streamer) {
        echo "- {$streamer[$nameColumn]} ({$streamer['platform']}) - التقييم: {$streamer['rating']}\n";
    }
    
} catch (Exception $e) {
    echo "خطأ: " . $e->getMessage() . "\n";
}
?>
