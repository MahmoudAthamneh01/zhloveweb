<?php
try {
    $db = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    
    $stmt = $db->prepare('SELECT id, name, logo_url, banner_url FROM clans WHERE logo_url IS NOT NULL OR banner_url IS NOT NULL');
    $stmt->execute();
    $clans = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Found " . count($clans) . " clans with images:\n\n";
    
    foreach($clans as $clan) {
        echo "Clan ID: {$clan['id']}, Name: {$clan['name']}\n";
        echo "Logo URL: {$clan['logo_url']}\n";
        echo "Banner URL: {$clan['banner_url']}\n";
        echo "---\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
