<?php
try {
    $db = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    
    // Get the actual files in the directory
    $uploadsDir = '../../uploads/clans/';
    $files = scandir($uploadsDir);
    
    echo "Files in uploads directory:\n";
    foreach($files as $file) {
        if ($file != '.' && $file != '..') {
            echo "- $file\n";
        }
    }
    
    // Get the latest logo file for clan 15
    $logoFiles = array_filter($files, function($file) {
        return strpos($file, 'clan_15_logo_') === 0;
    });
    
    if (!empty($logoFiles)) {
        // Sort by modification time (newest first)
        usort($logoFiles, function($a, $b) use ($uploadsDir) {
            return filemtime($uploadsDir . $b) - filemtime($uploadsDir . $a);
        });
        
        $latestLogo = $logoFiles[0];
        $logoUrl = '/uploads/clans/' . $latestLogo;
        
        echo "\nLatest logo file: $latestLogo\n";
        echo "Updating database with: $logoUrl\n";
        
        // Update database
        $stmt = $db->prepare("UPDATE clans SET logo_url = ? WHERE id = 15");
        $stmt->execute([$logoUrl]);
        
        echo "Database updated successfully!\n";
        
        // Verify the update
        $stmt = $db->prepare("SELECT logo_url, banner_url FROM clans WHERE id = 15");
        $stmt->execute();
        $clan = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "Current clan URLs:\n";
        echo "Logo: " . ($clan['logo_url'] ?? 'NULL') . "\n";
        echo "Banner: " . ($clan['banner_url'] ?? 'NULL') . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
