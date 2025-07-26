<?php
// Fix streamers data with correct column names
try {
    $db = new PDO('mysql:host=localhost;dbname=zh_love_db;charset=utf8mb4', 'root', '');
    
    echo "=== إضافة ستريمرز بالأعمدة الصحيحة ===\n";
    
    // Clear existing data first
    $db->exec("DELETE FROM streamers");
    
    $streamers = [
        [null, 'ZH_StreamMaster', 'twitch', 'https://twitch.tv/zh_streammaster', 1, 1],
        [null, 'Gaming_Legend_AR', 'youtube', 'https://youtube.com/gaming_legend_ar', 1, 1],
        [null, 'Pro_Caster_ME', 'twitch', 'https://twitch.tv/pro_caster_me', 0, 1],
        [null, 'Arabic_Esports', 'facebook', 'https://facebook.com/arabic_esports', 1, 1]
    ];
    
    $stmt = $db->prepare("
        INSERT INTO streamers 
        (user_id, channel_name, platform, channel_url, is_verified, is_active) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    
    foreach ($streamers as $streamer) {
        $stmt->execute($streamer);
    }
    echo "✓ تم إضافة " . count($streamers) . " ستريمرز\n";
    
    // Check inserted data
    echo "\n=== الستريمرز المضافون ===\n";
    $stmt = $db->query("SELECT * FROM streamers");
    $streamers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($streamers as $streamer) {
        echo "- {$streamer['channel_name']} ({$streamer['platform']}) - مفعل: " . ($streamer['is_verified'] ? 'نعم' : 'لا') . "\n";
    }
    
} catch (Exception $e) {
    echo "خطأ: " . $e->getMessage() . "\n";
}
?>
