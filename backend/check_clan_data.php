<?php
// Check current clan data
try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== Clan Data ===\n";
    $stmt = $pdo->query("SELECT id, name, tag, logo_url, banner_url, website, discord_url FROM clans");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "ID: {$row['id']}\n";
        echo "Name: {$row['name']}\n";
        echo "Tag: {$row['tag']}\n";
        echo "Logo URL: {$row['logo_url']}\n";
        echo "Banner URL: {$row['banner_url']}\n";
        echo "Website: {$row['website']}\n";
        echo "Discord: {$row['discord_url']}\n";
        echo "---\n";
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
