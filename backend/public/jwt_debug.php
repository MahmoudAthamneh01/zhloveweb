<?php
// Test JWT signature compatibility between auth_api.php and clan_api.php

error_reporting(E_ALL);
ini_set('display_errors', 1);

$secret = 'zh_love_secret';

// Simulate the token creation process from auth_api.php
$user = [
    'id' => 23,
    'username' => 'mah.athamnh@gmail.com',
    'role' => 'player'
];

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

function verifyJWT($token) {
    $secret = 'zh_love_secret';
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    
    list($header, $payload, $signature) = $parts;
    
    // Test method 1: Direct signature verification
    $expectedSignature1 = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(hash_hmac('sha256', $header . "." . $payload, $secret, true)));
    
    echo "Token parts:\n";
    echo "Header: $header\n";
    echo "Payload: $payload\n"; 
    echo "Original signature: $signature\n";
    echo "Expected signature: $expectedSignature1\n";
    echo "Signatures match: " . ($signature === $expectedSignature1 ? 'YES' : 'NO') . "\n\n";
    
    // Decode payload to check content
    $paddedPayload = $payload . str_repeat('=', (4 - strlen($payload) % 4) % 4);
    $payloadData = base64_decode(str_replace(['-', '_'], ['+', '/'], $paddedPayload));
    echo "Decoded payload: $payloadData\n\n";
    
    return $signature === $expectedSignature1;
}

echo "=== JWT Signature Test ===\n\n";

// Create a test token
$testToken = generateJWT($user);
echo "Generated token: $testToken\n\n";

// Test verification
$isValid = verifyJWT($testToken);
echo "Token is valid: " . ($isValid ? 'YES' : 'NO') . "\n\n";

// Test with your actual token from the logs
$actualToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyMywidXNlcm5hbWUiOiJtYWguYXRoYW1uaEBnbWFpbC5jb20iLCJyb2xlIjoicGxheWVyIiwiZXhwIjoxNzUyODA3ODAwfQ.Oio-UnEtQuLhCGm4eO5VLIx9tfi0GKtbUPF14SbZHHc";

echo "=== Testing Actual Token ===\n\n";
echo "Actual token: $actualToken\n\n";
$isActualValid = verifyJWT($actualToken);
echo "Actual token is valid: " . ($isActualValid ? 'YES' : 'NO') . "\n";
?>
