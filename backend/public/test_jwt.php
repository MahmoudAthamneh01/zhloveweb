<?php
// Test JWT generation and verification
header('Content-Type: text/plain');

// Functions from auth_api.php
function generateJWT($user) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'user_id' => $user['id'],
        'username' => $user['username'],
        'role' => $user['role'],
        'exp' => time() + 86400 // 24 hours
    ]);
    
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, 'zh_love_secret', true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

// Functions from clan_api.php
function base64url_decode($data) {
    return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
}

function base64url_encode($data) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

function verifyJWT($token) {
    if (!$token) {
        echo "No token provided\n";
        return null;
    }
    
    $secret = 'zh_love_secret';
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        echo "Invalid token format\n";
        return null;
    }
    
    list($header, $payload, $signature) = $parts;
    
    $expectedSignature = base64url_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
    if (!hash_equals($signature, $expectedSignature)) {
        echo "Invalid token signature\n";
        echo "Expected: $expectedSignature\n";
        echo "Received: $signature\n";
        return null;
    }
    
    $data = json_decode(base64url_decode($payload), true);
    if (!$data) {
        echo "Invalid token payload\n";
        return null;
    }
    
    if (isset($data['exp']) && $data['exp'] < time()) {
        echo "Token expired\n";
        return null;
    }
    
    echo "Token verified successfully\n";
    return $data;
}

// Test
echo "=== JWT Test ===\n\n";

$testUser = [
    'id' => 1,
    'username' => 'testuser',
    'role' => 'user'
];

echo "1. Generating JWT...\n";
$token = generateJWT($testUser);
echo "Token: $token\n\n";

echo "2. Verifying JWT...\n";
$result = verifyJWT($token);

if ($result) {
    echo "Success! User ID: " . $result['user_id'] . "\n";
} else {
    echo "Failed!\n";
}

echo "\n=== End Test ===\n";
?>
