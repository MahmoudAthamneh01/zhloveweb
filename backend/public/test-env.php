<?php
// Test environment variables
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$env_vars = [
    'MYSQLHOST' => $_ENV['MYSQLHOST'] ?? 'NOT_SET',
    'MYSQLPORT' => $_ENV['MYSQLPORT'] ?? 'NOT_SET',
    'MYSQLDATABASE' => $_ENV['MYSQLDATABASE'] ?? 'NOT_SET',
    'MYSQLUSER' => $_ENV['MYSQLUSER'] ?? 'NOT_SET',
    'MYSQLPASSWORD' => isset($_ENV['MYSQLPASSWORD']) ? '***SET***' : 'NOT_SET',
    
    'DB_HOST' => $_ENV['DB_HOST'] ?? 'NOT_SET',
    'DB_PORT' => $_ENV['DB_PORT'] ?? 'NOT_SET',
    'DB_NAME' => $_ENV['DB_NAME'] ?? 'NOT_SET',
    'DB_USER' => $_ENV['DB_USER'] ?? 'NOT_SET',
    'DB_PASS' => isset($_ENV['DB_PASS']) ? '***SET***' : 'NOT_SET',
];

echo json_encode($env_vars, JSON_PRETTY_PRINT);
