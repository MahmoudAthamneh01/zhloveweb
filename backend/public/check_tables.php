<?php
try {
        $db = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    
    $stmt = $db->query('SHOW TABLES');
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Available tables in zhlove database:\n";
    foreach($tables as $table) {
        echo "- $table\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
