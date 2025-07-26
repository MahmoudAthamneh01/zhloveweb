<?php
// Test new chat and wars APIs
echo "=== اختبار APIs الجديدة ===\n\n";

// Test token generation first
$user_id = 2; // zh_master user
$secret = 'zh_love_secret_key_2024';

function generateJWT($user_id, $username, $secret) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'user_id' => $user_id,
        'username' => $username,
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ]);
    
    $headerEncoded = rtrim(strtr(base64_encode($header), '+/', '-_'), '=');
    $payloadEncoded = rtrim(strtr(base64_encode($payload), '+/', '-_'), '=');
    $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, $secret, true);
    $signatureEncoded = rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');
    
    return $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
}

// Get user info
try {
    $db = new PDO('mysql:host=localhost;dbname=zh_love_db;charset=utf8mb4', 'root', '');
    $stmt = $db->prepare("SELECT username FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();
    
    if (!$user) {
        echo "خطأ: المستخدم غير موجود\n";
        exit;
    }
    
    $token = generateJWT($user_id, $user['username'], $secret);
    echo "تم إنشاء JWT Token للمستخدم: {$user['username']}\n\n";
    
    // Test 1: Get Clan Messages
    echo "1. اختبار جلب رسائل العشيرة:\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://localhost:8080/clan_api.php?action=get_clan_messages');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "HTTP Code: $httpCode\n";
    $data = json_decode($response, true);
    if ($data && $data['success']) {
        echo "عدد الرسائل: " . count($data['messages']) . "\n";
        foreach ($data['messages'] as $msg) {
            echo "- {$msg['username']}: {$msg['message']} ({$msg['message_type']})\n";
        }
    } else {
        echo "Response: $response\n";
    }
    
    echo "\n2. اختبار جلب حروب العشيرة:\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://localhost:8080/clan_api.php?action=get_clan_wars');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "HTTP Code: $httpCode\n";
    $data = json_decode($response, true);
    if ($data && $data['success']) {
        echo "عدد الحروب: " . count($data['wars']) . "\n";
        foreach ($data['wars'] as $war) {
            echo "- {$war['challenger_name']} ضد {$war['challenged_name']}: {$war['status']}\n";
        }
    } else {
        echo "Response: $response\n";
    }
    
} catch (Exception $e) {
    echo "خطأ: " . $e->getMessage() . "\n";
}

echo "\n=== انتهى الاختبار ===\n";
?>
