<?php
// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// API endpoint for authentication
header('Content-Type: application/json');

// Handle CORS for both development ports
$allowed_origins = ['http://localhost:4321', 'http://localhost:4322'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit(0);

// Database connection
function getDatabase() {
    try {
        $host = 'localhost';
        $dbname = 'zh_love_db';
        $username = 'root';
        $password = '';
        
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        return null;
    }
}

// Simple JWT functions
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

// Get request path
$path = $_SERVER['REQUEST_URI'] ?? '/';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Remove query parameters and get clean path
$path = parse_url($path, PHP_URL_PATH);

// Get database connection
$db = getDatabase();

if (!$db) {
    http_response_code(500);
    echo json_encode(['error' => 'فشل في الاتصال بقاعدة البيانات']);
    exit();
}

try {
    // Register endpoint
    if ($path === '/api/auth/register' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $username = trim($input['username'] ?? '');
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        $firstName = trim($input['first_name'] ?? $input['name'] ?? '');
        
        if (!$username || !$email || !$password || !$firstName) {
            http_response_code(400);
            echo json_encode(['error' => 'اسم المستخدم والبريد الإلكتروني وكلمة المرور والاسم مطلوبة']);
            exit();
        }
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'البريد الإلكتروني غير صحيح']);
            exit();
        }
        
        // Check password length
        if (strlen($password) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل']);
            exit();
        }
        
        // Check if username exists
        $stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'اسم المستخدم موجود مسبقاً']);
            exit();
        }
        
        // Check if email exists
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'البريد الإلكتروني موجود مسبقاً']);
            exit();
        }
        
        // Hash password
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        
        // Insert user
        $stmt = $db->prepare("
            INSERT INTO users (
                username, email, password_hash, first_name, last_name, 
                bio, country, role, level, xp, rank_points, is_verified
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'player', 1, 0, 1000, 0)
        ");
        
        $stmt->execute([
            $username,
            $email,
            $passwordHash,
            $firstName,
            $input['last_name'] ?? '',
            $input['bio'] ?? '',
            $input['country'] ?? 'Saudi Arabia'
        ]);
        
        $userId = $db->lastInsertId();
        
        // Get user data
        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Generate JWT token
        $token = generateJWT($user);
        
        echo json_encode([
            'success' => true,
            'message' => 'تم التسجيل بنجاح',
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
    
    // Login endpoint
    if ($path === '/api/auth/login' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $usernameOrEmail = trim($input['username'] ?? $input['email'] ?? '');
        $password = $input['password'] ?? '';
        
        if (!$usernameOrEmail || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'اسم المستخدم وكلمة المرور مطلوبان']);
            exit();
        }
        
        // Check if input is email or username
        if (filter_var($usernameOrEmail, FILTER_VALIDATE_EMAIL)) {
            $stmt = $db->prepare("SELECT * FROM users WHERE email = ? AND is_active = 1");
        } else {
            $stmt = $db->prepare("SELECT * FROM users WHERE username = ? AND is_active = 1");
        }
        
        $stmt->execute([$usernameOrEmail]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user || !password_verify($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'اسم المستخدم أو كلمة المرور غير صحيحة']);
            exit();
        }
        
        // Update last login
        $stmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);
        
        // Generate JWT token
        $token = generateJWT($user);
        
        echo json_encode([
            'success' => true,
            'message' => 'تم تسجيل الدخول بنجاح',
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
    
    // Debug login endpoint for testing (POST to root with action=debug_login)
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (isset($input['action']) && $input['action'] === 'debug_login' && isset($input['user_id'])) {
            $userId = (int)$input['user_id'];
            
            $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                echo json_encode(['success' => false, 'message' => 'المستخدم غير موجود']);
                exit();
            }
            
            // Update last login
            $stmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
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

    // Debug login endpoint for testing
    if ($data['action'] === 'debug_login' && isset($data['user_id'])) {
        $userId = (int)$data['user_id'];
        
        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'المستخدم غير موجود']);
            exit();
        }
        
        // Update last login
        $stmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
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

    // Default response for other endpoints
    http_response_code(404);
    echo json_encode([
        'error' => 'Endpoint not found',
        'available_endpoints' => [
            'POST /api/auth/register' => 'تسجيل مستخدم جديد',
            'POST /api/auth/login' => 'تسجيل الدخول'
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'خطأ في الخادم: ' . $e->getMessage()]);
}
?> 