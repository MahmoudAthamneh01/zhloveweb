<?php
try {
    $db = new PDO('mysql:host=localhost', 'root', '');
    
    $stmt = $db->query('SHOW DATABASES');
    $databases = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Available databases:\n";
    foreach($databases as $db_name) {
        echo "- $db_name\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
