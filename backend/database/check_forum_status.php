<?php
// Check forum database status

$host = 'localhost';
$username = 'root';
$password = '';
$database = 'zh_love_db';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to database successfully.\n\n";
    
    // Check if tables exist
    $tables = ['forum_categories', 'forum_posts', 'forum_comments', 'forum_likes'];
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            echo "✅ Table $table exists\n";
            
            // Get row count
            $countStmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
            $count = $countStmt->fetch(PDO::FETCH_ASSOC);
            echo "   Records: " . $count['count'] . "\n";
        } else {
            echo "❌ Table $table does not exist\n";
        }
    }
    
    echo "\n--- Categories Data ---\n";
    $categoriesStmt = $pdo->query("SELECT * FROM forum_categories LIMIT 3");
    while ($row = $categoriesStmt->fetch(PDO::FETCH_ASSOC)) {
        echo "ID: {$row['id']}, Name: {$row['name']}, Topics: {$row['topic_count']}\n";
    }
    
    echo "\n--- Posts Data ---\n";
    $postsStmt = $pdo->query("SELECT * FROM forum_posts LIMIT 3");
    while ($row = $postsStmt->fetch(PDO::FETCH_ASSOC)) {
        echo "ID: {$row['id']}, Title: " . substr($row['title'], 0, 50) . "...\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Database Error: " . $e->getMessage() . "\n";
}
?>
