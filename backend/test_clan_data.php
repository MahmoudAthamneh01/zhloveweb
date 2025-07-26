<?php
// Test script to add basic clan data for testing the system

try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to database successfully!\n";
    
    // Check if we have any users
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $userCount = $stmt->fetch()['count'];
    echo "Users in database: $userCount\n";
    
    // Check if we have any clans
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM clans");
    $clanCount = $stmt->fetch()['count'];
    echo "Clans in database: $clanCount\n";
    
    // Check if we have any clan applications
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM clan_applications");
    $appCount = $stmt->fetch()['count'];
    echo "Clan applications: $appCount\n";
    
    // Check if we have any clan members
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM clan_members");
    $memberCount = $stmt->fetch()['count'];
    echo "Clan members: $memberCount\n";
    
    // List clan applications
    $stmt = $pdo->query("SELECT id, clan_name, status, organizer_id FROM clan_applications ORDER BY submitted_at DESC LIMIT 5");
    $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\nRecent clan applications:\n";
    foreach ($applications as $app) {
        echo "- ID: {$app['id']}, Name: {$app['clan_name']}, Status: {$app['status']}, Organizer: {$app['organizer_id']}\n";
    }
    
    // List clans
    $stmt = $pdo->query("SELECT id, name, tag, owner_id, is_active, is_approved FROM clans ORDER BY created_at DESC LIMIT 5");
    $clans = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\nExisting clans:\n";
    foreach ($clans as $clan) {
        $active = $clan['is_active'] ? 'Active' : 'Inactive';
        $approved = $clan['is_approved'] ? 'Approved' : 'Pending';
        echo "- ID: {$clan['id']}, Name: {$clan['name']}, Tag: {$clan['tag']}, Owner: {$clan['owner_id']}, Status: $active, $approved\n";
    }
    
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
}
?> 