<?php
// اختبار نظام دعوة الأعضاء
try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== اختبار نظام دعوة الأعضاء ===\n\n";
    
    // عرض المستخدمين المتاحين
    echo "المستخدمون المتاحون للدعوة:\n";
    $stmt = $pdo->query("SELECT id, username, email, first_name, last_name FROM users ORDER BY id LIMIT 10");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($users as $user) {
        echo "- ID: {$user['id']}, Username: {$user['username']}, Email: {$user['email']}, Name: {$user['first_name']} {$user['last_name']}\n";
    }
    
    echo "\n=== اختبار API الدعوة ===\n";
    
    // إنشاء JWT token للمستخدم ID 23 (مالك العشيرة)
    function generateJWT($userId) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'user_id' => $userId,
            'username' => 'test_user',
            'role' => 'player',
            'exp' => time() + 86400
        ]);
        
        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, 'zh_love_secret', true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }
    
    $token = generateJWT(23);
    
    // اختبار دعوة المستخدم الأول من القائمة (غير مالك العشيرة)
    $targetUser = null;
    foreach ($users as $user) {
        if ($user['id'] != 23) {
            $targetUser = $user;
            break;
        }
    }
    
    if ($targetUser) {
        echo "محاولة دعوة المستخدم: {$targetUser['username']} (ID: {$targetUser['id']})\n";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'http://localhost:8080/clan_api.php?action=invite_member');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'user_identifier' => $targetUser['username'],
            'message' => 'مرحباً! ندعوك للانضمام إلى عشيرتنا'
        ]));

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        echo "HTTP Code: $httpCode\n";
        echo "Response: $response\n\n";
        
        // فحص الدعوات في قاعدة البيانات
        echo "الدعوات الموجودة في قاعدة البيانات:\n";
        $stmt = $pdo->query("
            SELECT ci.*, c.name as clan_name, u1.username as invited_user, u2.username as invited_by
            FROM clan_invitations ci
            JOIN clans c ON ci.clan_id = c.id
            JOIN users u1 ON ci.invited_user_id = u1.id
            JOIN users u2 ON ci.invited_by_user_id = u2.id
            ORDER BY ci.created_at DESC
            LIMIT 5
        ");
        $invitations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($invitations as $inv) {
            echo "- {$inv['clan_name']} دعا {$inv['invited_user']} بواسطة {$inv['invited_by']} في {$inv['created_at']} (حالة: {$inv['status']})\n";
        }
    }
    
} catch (Exception $e) {
    echo "خطأ: " . $e->getMessage() . "\n";
}
?>
