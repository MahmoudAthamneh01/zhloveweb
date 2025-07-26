<?php
// Simple registration endpoint
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:4321');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

try {
    // Database connection
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    $username = trim($input['username'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $firstName = trim($input['first_name'] ?? $input['name'] ?? '');
    
    // Validate required fields
    if (!$username || !$email || !$password || !$firstName) {
        http_response_code(400);
        echo json_encode(['error' => 'اسم المستخدم والبريد الإلكتروني وكلمة المرور والاسم مطلوبة']);
        exit;
    }
    
    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'البريد الإلكتروني غير صحيح']);
        exit;
    }
    
    // Check if user exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? OR email = ?');
    $stmt->execute([$username, $email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'اسم المستخدم أو البريد الإلكتروني موجود مسبقاً']);
        exit;
    }
    
    // Hash password and insert user
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('
        INSERT INTO users (username, email, password_hash, first_name, role, level, xp, rank_points, is_verified) 
        VALUES (?, ?, ?, ?, "player", 1, 0, 1000, 0)
    ');
    
    $success = $stmt->execute([$username, $email, $passwordHash, $firstName]);
    
    if ($success) {
        $userId = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'تم التسجيل بنجاح! مرحباً بك في مجتمع زد اتش لوف',
            'user' => [
                'id' => $userId,
                'username' => $username,
                'email' => $email,
                'first_name' => $firstName,
                'level' => 1,
                'rank_points' => 1000
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'فشل في إنشاء الحساب']);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'خطأ في الخادم: ' . $e->getMessage()]);
}
?> 