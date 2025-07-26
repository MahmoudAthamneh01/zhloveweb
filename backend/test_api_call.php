<?php
// Test API call to check what's happening

$userId = 23;
$userData = ['user_id' => $userId, 'username' => 'testuser', 'exp' => time() + 3600];
$secret = 'zh_love_secret_key_2024_super_secure_random_string_xyz';
$token = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256'])) . '.' . 
         base64_encode(json_encode($userData)) . '.' . 
         'signature_placeholder';

echo "Testing API with user ID: $userId\n";
echo "Generated token: $token\n\n";

// Test the API call
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8080/clan_api.php?action=user_clan');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";

// Decode and format response
if ($response) {
    $data = json_decode($response, true);
    if ($data) {
        echo "\nFormatted Response:\n";
        print_r($data);
    }
}
?>
