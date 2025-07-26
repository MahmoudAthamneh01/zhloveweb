<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

// Set content type
header('Content-Type: text/plain');

echo "=== PHP Debug Information ===\n";
echo "PHP Version: " . phpversion() . "\n";
echo "Date: " . date('Y-m-d H:i:s') . "\n";
echo "Server: " . $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown' . "\n";
echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown' . "\n";
echo "Script Name: " . $_SERVER['SCRIPT_NAME'] ?? 'Unknown' . "\n";
echo "Request URI: " . $_SERVER['REQUEST_URI'] ?? 'Unknown' . "\n";

echo "\n=== Test Basic Functions ===\n";
echo "JSON encode test: " . json_encode(['test' => 'success']) . "\n";
echo "Current directory: " . getcwd() . "\n";
echo "File exists (index.php): " . (file_exists('index.php') ? 'Yes' : 'No') . "\n";

echo "\n=== Environment Variables ===\n";
echo "HTTP_HOST: " . ($_SERVER['HTTP_HOST'] ?? 'Not set') . "\n";
echo "REQUEST_METHOD: " . ($_SERVER['REQUEST_METHOD'] ?? 'Not set') . "\n";

echo "\n=== Error Log ===\n";
echo "Error log location: " . ini_get('error_log') . "\n";

echo "\n=== Test Complete ===\n";
echo "If you can see this, basic PHP is working!\n";
?> 