<?php
// Test authentication endpoint
header('Access-Control-Allow-Origin: http://localhost:4321');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Include the functions from clan_api.php
require_once 'clan_api.php';

echo "=== Authentication Test ===\n";

// Get headers
$headers = getallheaders();
echo "Headers received:\n";
foreach ($headers as $key => $value) {
    if (strtolower($key) === 'authorization') {
        echo "$key: $value\n";
    }
}

// Test token extraction
$token = null;
if (isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);
} elseif (isset($headers['authorization'])) {
    $token = str_replace('Bearer ', '', $headers['authorization']);
} elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
}

echo "\nToken extracted: " . ($token ? "Yes (length: " . strlen($token) . ")" : "No") . "\n";

if ($token) {
    // Test JWT verification
    $jwt_data = verifyJWT($token);
    echo "JWT verification: " . ($jwt_data ? "Success" : "Failed") . "\n";
    
    if ($jwt_data) {
        echo "User ID from token: " . ($jwt_data['user_id'] ?? 'Not found') . "\n";
        
        // Test user lookup
        $user = getAuthUser();
        echo "User lookup: " . ($user ? "Success" : "Failed") . "\n";
        
        if ($user) {
            echo "User found: " . $user['username'] . " (ID: " . $user['id'] . ")\n";
        }
    }
}

echo "\n=== End Test ===\n";
?>
