<?php
require_once 'vendor/autoload.php';

try {
    // Test autoloading
    echo "✓ Autoloader works\n";
    
    // Test Slim Framework
    $app = \Slim\Factory\AppFactory::create();
    echo "✓ Slim Framework loaded\n";
    
    // Test environment variables
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
    echo "✓ Environment variables loaded\n";
    
    // Test database connection
    $host = $_ENV['DB_HOST'] ?? 'localhost';
    $dbname = $_ENV['DB_NAME'] ?? 'zh_love_db';
    $username = $_ENV['DB_USER'] ?? 'root';
    $password = $_ENV['DB_PASS'] ?? '';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    echo "✓ Database connection works\n";
    
    echo "\nAll tests passed! The backend should work properly.\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
} 