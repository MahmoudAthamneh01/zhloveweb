<?php
try {
    $db = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    
    // Test the exact query used in API
    $stmt = $db->prepare("
        SELECT c.*, cm.role, cm.joined_at,
               COUNT(DISTINCT members.id) as total_members,
               u.first_name as leader_first_name, u.last_name as leader_last_name
        FROM clan_members cm
        JOIN clans c ON cm.clan_id = c.id
        LEFT JOIN clan_members members ON c.id = members.clan_id AND members.status = 'active'
        LEFT JOIN clan_members leader_cm ON c.id = leader_cm.clan_id AND leader_cm.role = 'leader'
        LEFT JOIN users u ON leader_cm.user_id = u.id
        WHERE c.id = 15
        GROUP BY c.id, cm.id, u.id
        LIMIT 1
    ");
    $stmt->execute();
    $clan = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Clan data from API query:\n";
    print_r($clan);
    
    // Check specific columns
    echo "\nSpecific logo/banner data:\n";
    echo "logo_url: " . ($clan['logo_url'] ?? 'NULL') . "\n";
    echo "banner_url: " . ($clan['banner_url'] ?? 'NULL') . "\n";
    
    // Check if columns exist in table
    $stmt = $db->prepare("DESCRIBE clans");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\nClans table columns:\n";
    foreach($columns as $column) {
        echo "- {$column['Field']} ({$column['Type']})\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
