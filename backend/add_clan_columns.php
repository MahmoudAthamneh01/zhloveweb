<?php
// Add missing columns to clans table
try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Adding missing columns to clans table...\n";
    
    // Add website column
    $pdo->exec("ALTER TABLE clans ADD COLUMN website VARCHAR(255) NULL AFTER banner_url");
    echo "Added website column\n";
    
    // Add discord_url column
    $pdo->exec("ALTER TABLE clans ADD COLUMN discord_url VARCHAR(255) NULL AFTER website");
    echo "Added discord_url column\n";
    
    // Add recruitment_open column (alternative to is_recruiting)
    $pdo->exec("ALTER TABLE clans ADD COLUMN recruitment_open BOOLEAN DEFAULT TRUE AFTER discord_url");
    echo "Added recruitment_open column\n";
    
    echo "All columns added successfully!\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
