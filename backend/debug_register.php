<?php
// Debug registration endpoint
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:4321');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Get raw input
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

// Debug information
$debug = [
    'method' => $_SERVER['REQUEST_METHOD'],
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set',
    'raw_input' => $rawInput,
    'decoded_input' => $input,
    'post_data' => $_POST,
    'get_data' => $_GET,
    'all_headers' => getallheaders()
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Database connection
        $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Extract data with multiple possible field names
        $username = trim($input['username'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        $firstName = trim($input['first_name'] ?? $input['firstName'] ?? $input['name'] ?? '');
        $lastName = trim($input['last_name'] ?? $input['lastName'] ?? '');
        $country = trim($input['country'] ?? 'Saudi Arabia');
        
        $debug['extracted_fields'] = [
            'username' => $username,
            'email' => $email,
            'password' => !empty($password) ? '[PROVIDED]' : '[MISSING]',
            'first_name' => $firstName,
            'last_name' => $lastName,
            'country' => $country
        ];
        
        // Validate required fields
        $missing = [];
        if (!$username) $missing[] = 'username';
        if (!$email) $missing[] = 'email';
        if (!$password) $missing[] = 'password';
        if (!$firstName) $missing[] = 'first_name';
        
        if (!empty($missing)) {
            echo json_encode([
                'error' => 'جميع البيانات مطلوبة',
                'missing_fields' => $missing,
                'debug' => $debug
            ]);
            exit;
        }
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode([
                'error' => 'البريد الإلكتروني غير صحيح',
                'debug' => $debug
            ]);
            exit;
        }
        
        // Check if user exists
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? OR email = ?');
        $stmt->execute([$username, $email]);
        if ($stmt->fetch()) {
            echo json_encode([
                'error' => 'اسم المستخدم أو البريد موجود مسبقاً',
                'debug' => $debug
            ]);
            exit;
        }
        
        // Hash password and insert user
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('
            INSERT INTO users (username, email, password_hash, first_name, last_name, country, role, level, xp, rank_points, is_verified) 
            VALUES (?, ?, ?, ?, ?, ?, "player", 1, 0, 1000, 0)
        ');
        
        $result = $stmt->execute([$username, $email, $passwordHash, $firstName, $lastName, $country]);
        
        if ($result) {
            $userId = $pdo->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'تم التسجيل بنجاح!',
                'user_id' => $userId,
                'debug' => $debug
            ]);
        } else {
            echo json_encode([
                'error' => 'فشل في إنشاء الحساب',
                'debug' => $debug
            ]);
        }
        
    } catch (Exception $e) {
        echo json_encode([
            'error' => 'خطأ في الخادم: ' . $e->getMessage(),
            'debug' => $debug
        ]);
    }
} else {
    echo json_encode([
        'error' => 'Method not allowed',
        'debug' => $debug
    ]);
}
?> 