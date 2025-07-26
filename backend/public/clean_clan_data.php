<?php
try {
    $db = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    
    // Remove the banner URL since the file doesn't exist
    $stmt = $db->prepare("UPDATE clans SET banner_url = NULL WHERE id = 15");
    $stmt->execute();
    
    echo "Banner URL removed from database since file doesn't exist.\n";
    
    // Get updated clan data
    $stmt = $db->prepare("SELECT id, name, logo_url, banner_url FROM clans WHERE id = 15");
    $stmt->execute();
    $clan = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Updated clan data:\n";
    print_r($clan);
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
