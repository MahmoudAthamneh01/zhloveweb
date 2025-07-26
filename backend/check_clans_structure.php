<?php
// Check current clans table structure
require_once 'config/settings.php';

function getDB() {
    $settings = require 'config/settings.php';
    $db = $settings['settings']['db'];
    
    $dsn = "mysql:host={$db['host']};dbname={$db['database']};charset=utf8mb4";
    return new PDO($dsn, $db['username'], $db['password']);
}

try {
    $db = getDB();
    
    echo "=== بنية جدول العشائر الحالي ===\n";
    $stmt = $db->query("DESCRIBE clans");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        echo "- {$column['Field']}: {$column['Type']} ({$column['Null']}, {$column['Key']}, {$column['Default']})\n";
    }
    
    echo "\n=== العشائر الموجودة ===\n";
    $stmt = $db->query("SELECT id, name, tag, leader_id, recruitment_open, logo_url, banner_url FROM clans LIMIT 5");
    $clans = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($clans as $clan) {
        echo "- ID: {$clan['id']}, Name: {$clan['name']}, Tag: {$clan['tag']}, Leader: {$clan['leader_id']}, Open: {$clan['recruitment_open']}\n";
        echo "  Logo: " . ($clan['logo_url'] ?: 'N/A') . "\n";
        echo "  Banner: " . ($clan['banner_url'] ?: 'N/A') . "\n\n";
    }
    
} catch (Exception $e) {
    echo "خطأ: " . $e->getMessage() . "\n";
}
?>
