<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

try {
    // Database connection
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get input data
    $input = json_decode(file_get_contents('php://input'), true);
    $username = $input['username'] ?? '';
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $name = $input['first_name'] ?? $input['name'] ?? '';
    
    // Validate required fields
    if (!$username || !$email || !$password || !$name) {
        http_response_code(400);
        echo json_encode(['error' => 'جميع البيانات مطلوبة']);
        exit;
    }
    
    // Check if user exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? OR email = ?');
    $stmt->execute([$username, $email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'المستخدم موجود مسبقاً']);
        exit;
    }
    
    // Hash password and insert user
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('
        INSERT INTO users (username, email, password_hash, first_name, role, level, rank_points, is_verified) 
        VALUES (?, ?, ?, ?, "player", 1, 1000, 0)
    ');
    $stmt->execute([$username, $email, $hash, $name]);
    
    $userId = $pdo->lastInsertId();
    
    // Return success response
    echo json_encode([
        'success' => true, 
        'message' => 'تم التسجيل بنجاح',
        'user' => [
            'id' => $userId,
            'username' => $username,
            'email' => $email,
            'first_name' => $name,
            'level' => 1
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'خطأ في الخادم: ' . $e->getMessage()]);
}
?> 