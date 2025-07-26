<?php
// Fix streamers table constraints
$db = new PDO('mysql:host=localhost;dbname=zh_love_db;charset=utf8mb4', 'root', '');

try {
    $db->exec('ALTER TABLE streamers DROP FOREIGN KEY streamers_ibfk_1');
    echo "تم إزالة قيد foreign key\n";
} catch (Exception $e) {
    echo "تحذير: " . $e->getMessage() . "\n";
}

$db->exec('ALTER TABLE streamers MODIFY user_id INT NULL');

$db->exec('DELETE FROM streamers');
$stmt = $db->prepare('INSERT INTO streamers (channel_name, platform, channel_url, is_verified, is_active) VALUES (?, ?, ?, ?, ?)');
$streamers = [
    ['ZH_StreamMaster', 'twitch', 'https://twitch.tv/zh_streammaster', 1, 1],
    ['Gaming_Legend_AR', 'youtube', 'https://youtube.com/gaming_legend_ar', 1, 1],
    ['Pro_Caster_ME', 'twitch', 'https://twitch.tv/pro_caster_me', 0, 1],
    ['Arabic_Esports', 'facebook', 'https://facebook.com/arabic_esports', 1, 1]
];

foreach ($streamers as $s) {
    $stmt->execute($s);
}

echo "تم إضافة " . count($streamers) . " ستريمرز بنجاح\n";
?>
