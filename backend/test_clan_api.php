<?php
// Test new clan management API endpoints
echo "=== اختبار API إدارة العشيرة ===\n\n";

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
    
    // Test 1: Update Clan Info
    echo "1. اختبار تحديث معلومات العشيرة:\n";
    
    $updateData = [
        'name' => 'الذئاب المحاربة المطورة',
        'description' => 'عشيرة محاربة قوية تسعى للتفوق في جميع المعارك',
        'recruitment_type' => 'invite_only'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://localhost:8080/clan_api.php?action=update_clan_info');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "HTTP Code: $httpCode\n";
    echo "Response: $response\n\n";
    
    // Test 2: Check modifications log
    echo "2. فحص سجل التعديلات:\n";
    $stmt = $db->query("
        SELECT cm.*, u.username 
        FROM clan_modifications cm 
        JOIN users u ON cm.modified_by = u.id 
        ORDER BY cm.modified_at DESC 
        LIMIT 3
    ");
    $modifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($modifications as $mod) {
        echo "- {$mod['username']} عدل {$mod['field_name']}: '{$mod['old_value']}' -> '{$mod['new_value']}' في {$mod['modified_at']}\n";
    }
    
    if (empty($modifications)) {
        echo "لا توجد تعديلات حتى الآن\n";
    }
    
    echo "\n3. عرض حالة العشيرة بعد التحديث:\n";
    $stmt = $db->prepare("
        SELECT name, description, recruitment_type, logo_url, banner_url 
        FROM clans 
        WHERE owner_id = ?
    ");
    $stmt->execute([$user_id]);
    $clan = $stmt->fetch();
    
    if ($clan) {
        echo "- الاسم: {$clan['name']}\n";
        echo "- الوصف: {$clan['description']}\n";
        echo "- نوع التجنيد: {$clan['recruitment_type']}\n";
        echo "- الشعار: " . ($clan['logo_url'] ?: 'غير موجود') . "\n";
        echo "- الخلفية: " . ($clan['banner_url'] ?: 'غير موجود') . "\n";
    }
    
} catch (Exception $e) {
    echo "خطأ: " . $e->getMessage() . "\n";
}

echo "\n=== انتهى الاختبار ===\n";
?>
