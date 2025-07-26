<?php
try {
    $db = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    
    // Get current clan data
    $stmt = $db->prepare("SELECT id, name, logo_url, banner_url FROM clans WHERE id = 15");
    $stmt->execute();
    $clan = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Current clan data:\n";
    print_r($clan);
    
    // Check what files actually exist
    $uploadDir = '../../uploads/clans/';
    $files = scandir($uploadDir);
    
    echo "\nFiles in uploads directory:\n";
    foreach($files as $file) {
        if ($file != '.' && $file != '..' && strpos($file, 'clan_15') !== false) {
            echo "- $file\n";
        }
    }
    
    // Find the latest logo and update database
    $logoFiles = array_filter($files, function($file) {
        return strpos($file, 'clan_15_logo_') === 0;
    });
    
    if (!empty($logoFiles)) {
        // Sort by modification time (newest first)
        usort($logoFiles, function($a, $b) use ($uploadDir) {
            return filemtime($uploadDir . $b) - filemtime($uploadDir . $a);
        });
        
        $latestLogo = $logoFiles[0];
        $logoUrl = '/uploads/clans/' . $latestLogo;
        
        echo "\nUpdating logo to: $logoUrl\n";
        
        // Update database
        $stmt = $db->prepare("UPDATE clans SET logo_url = ? WHERE id = 15");
        $stmt->execute([$logoUrl]);
        
        echo "Database updated!\n";
    }
    
    // Verify files exist
    echo "\nVerifying file existence:\n";
    $logoPath = '../../uploads/clans/' . str_replace('/uploads/clans/', '', $logoUrl ?? '');
    $bannerPath = '../../uploads/clans/banner_15_1752808143.png';
    
    echo "Logo file exists: " . (file_exists($logoPath) ? 'YES' : 'NO') . " ($logoPath)\n";
    echo "Banner file exists: " . (file_exists($bannerPath) ? 'YES' : 'NO') . " ($bannerPath)\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
