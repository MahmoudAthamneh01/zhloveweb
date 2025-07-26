<?php
// Debug login API for testing
header('Content-Type: application/json');

// Handle CORS
$allowed_origins = ['http://localhost:4321', 'http://localhost:4322', 'http://localhost:4323'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit(0);

try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Simple JWT function
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
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (isset($input['action']) && $input['action'] === 'debug_login' && isset($input['user_id'])) {
            $userId = (int)$input['user_id'];
            
            $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'المستخدم غير موجود']);
                exit();
            }
            
            // Update last login
            $stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            $stmt->execute([$user['id']]);
            
            // Generate JWT token
            $token = generateJWT($user);
            
            echo json_encode([
                'success' => true,
                'message' => 'تم تسجيل الدخول بنجاح (وضع الاختبار)',
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'first_name' => $user['first_name'],
                    'last_name' => $user['last_name'],
                    'role' => $user['role'],
                    'level' => $user['level'],
                    'xp' => $user['xp'],
                    'rank_points' => $user['rank_points'],
                    'avatar' => $user['avatar']
                ]
            ]);
            exit();
        }
    }
    
    // GET request: show available users
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->query("SELECT id, username, email, first_name, last_name FROM users ORDER BY id LIMIT 10");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'المستخدمون المتاحون للاختبار',
            'users' => $users
        ]);
        exit();
    }
    
    echo json_encode(['error' => 'طريقة غير مدعومة']);
    
} catch (PDOException $e) {
    echo json_encode(['error' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()]);
}
?>
