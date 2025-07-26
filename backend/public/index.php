<?php
// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type
header('Content-Type: application/json');

// Handle CORS for both development ports
$allowed_origins = ['http://localhost:4321', 'http://localhost:4322'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load environment variables with better parsing
function loadEnv($file) {
    if (!file_exists($file)) {
        return;
    }
    
    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue; // Skip comments
        }
        
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            
            // Remove quotes if present
            if (preg_match('/^"(.*)"$/', $value, $matches)) {
                $value = $matches[1];
            }
            
            $_ENV[$name] = $value;
        }
    }
}

// Load environment variables
loadEnv(__DIR__ . '/../.env');

// Database connection
function getDatabase() {
    try {
        $host = $_ENV['DB_HOST'] ?? 'localhost';
        $dbname = $_ENV['DB_NAME'] ?? 'zh_love_db';
        $username = $_ENV['DB_USER'] ?? 'root';
        $password = $_ENV['DB_PASS'] ?? '';
        
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
        'exp' => time() + 3600 // Expires in 1 hour
    ]);
    
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $_ENV['JWT_SECRET'] ?? 'your_secret_key', true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

function verifyJWT($token) {
    if (!$token) return false;
    
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    
    $header = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[0])), true);
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
    
    if (!$payload || $payload['exp'] < time()) return false;
    
    return $payload;
}

// Authentication middleware
function requireAuth() {
    $headers = getallheaders();
    $token = null;
    
    if (isset($headers['Authorization'])) {
        $token = str_replace('Bearer ', '', $headers['Authorization']);
    }
    
    $user = verifyJWT($token);
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit();
    }
    
    return $user;
}

// Simple routing
$request_uri = $_SERVER['REQUEST_URI'] ?? '/';
$request_method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Remove query parameters
$path = parse_url($request_uri, PHP_URL_PATH);

// API responses
$response = null;
$db = getDatabase();

switch($path) {
    case '/':
        $response = [
            'message' => 'ZH-Love Gaming Community API',
            'version' => '1.0.0',
            'status' => 'active',
            'timestamp' => date('Y-m-d H:i:s'),
            'database' => $db ? 'connected' : 'disconnected',
            'endpoints' => [
                'GET /' => 'API Info',
                'GET /api/health' => 'Health Check',
                'POST /api/auth/login' => 'User Login',
                'POST /api/auth/register' => 'User Registration',
                'GET /api/auth/me' => 'Current User (Auth Required)',
                'GET /api/users' => 'List Users',
                'GET /api/clans' => 'List Clans',
                'GET /api/tournaments' => 'List Tournaments'
            ]
        ];
        break;
        
    case '/api/health':
        $response = [
            'status' => 'healthy',
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => '1.0.0',
            'database' => $db ? 'connected' : 'disconnected',
            'memory_usage' => memory_get_usage(true),
            'uptime' => 'active'
        ];
        break;
        
    case '/api/auth/register':
        if ($request_method === 'POST') {
            // Log the raw input for debugging
            $rawInput = file_get_contents('php://input');
            error_log("Raw input: " . $rawInput);
            
            $input = json_decode($rawInput, true);
            error_log("Decoded input: " . print_r($input, true));
            
            // Extract data with multiple possible field names
            $username = trim($input['username'] ?? '');
            $email = trim($input['email'] ?? '');
            $password = $input['password'] ?? '';
            
            // Try different possible field names for first name
            $firstName = trim($input['first_name'] ?? $input['firstName'] ?? $input['name'] ?? '');
            $lastName = trim($input['last_name'] ?? $input['lastName'] ?? '');
            $country = trim($input['country'] ?? 'Saudi Arabia');
            
            error_log("Extracted data - Username: $username, Email: $email, FirstName: $firstName");
            
            // Validate required fields
            if (!$username || !$email || !$password || !$firstName) {
                $response = [
                    'error' => 'جميع البيانات مطلوبة',
                    'missing_fields' => [
                        'username' => empty($username) ? 'مطلوب' : 'موجود',
                        'email' => empty($email) ? 'مطلوب' : 'موجود', 
                        'password' => empty($password) ? 'مطلوب' : 'موجود',
                        'first_name' => empty($firstName) ? 'مطلوب' : 'موجود'
                    ],
                    'received_data' => array_keys($input ?? [])
                ];
                http_response_code(400);
                break;
            }
            
            // Validate email format
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $response = ['error' => 'البريد الإلكتروني غير صحيح'];
                http_response_code(400);
                break;
            }
            
            // Check password length
            if (strlen($password) < 6) {
                $response = ['error' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'];
                http_response_code(400);
                break;
            }
            
            if (!$db) {
                $response = ['error' => 'فشل في الاتصال بقاعدة البيانات'];
                http_response_code(500);
                break;
            }
            
            try {
                // Check if username exists
                $stmt = $db->prepare('SELECT id FROM users WHERE username = ?');
                $stmt->execute([$username]);
                if ($stmt->fetch()) {
                    $response = ['error' => 'اسم المستخدم موجود مسبقاً'];
                    http_response_code(400);
                    break;
                }
                
                // Check if email exists
                $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
                $stmt->execute([$email]);
                if ($stmt->fetch()) {
                    $response = ['error' => 'البريد الإلكتروني موجود مسبقاً'];
                    http_response_code(400);
                    break;
                }
                
                // Hash password and insert user
                $passwordHash = password_hash($password, PASSWORD_DEFAULT);
                $stmt = $db->prepare('
                    INSERT INTO users (username, email, password_hash, first_name, last_name, country, role, level, xp, rank_points, is_verified) 
                    VALUES (?, ?, ?, ?, ?, ?, "player", 1, 0, 1000, 0)
                ');
                
                $result = $stmt->execute([$username, $email, $passwordHash, $firstName, $lastName, $country]);
                
                if ($result) {
                    $userId = $db->lastInsertId();
                    
                    // Get the created user
                    $stmt = $db->prepare('SELECT * FROM users WHERE id = ?');
                    $stmt->execute([$userId]);
                    $user = $stmt->fetch(PDO::FETCH_ASSOC);
                    
                    // Generate JWT token
                    $token = generateJWT($user);
                    
                    $response = [
                        'success' => true, 
                        'message' => 'تم التسجيل بنجاح! مرحباً بك في مجتمع زد اتش لوف',
                        'token' => $token,
                        'user' => [
                            'id' => $user['id'],
                            'username' => $user['username'],
                            'email' => $user['email'],
                            'first_name' => $user['first_name'],
                            'last_name' => $user['last_name'],
                            'country' => $user['country'],
                            'level' => $user['level'],
                            'rank_points' => $user['rank_points']
                        ]
                    ];
                } else {
                    $response = ['error' => 'فشل في إنشاء الحساب'];
                    http_response_code(500);
                }
                
            } catch (PDOException $e) {
                error_log("Database error: " . $e->getMessage());
                $response = ['error' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()];
                http_response_code(500);
            }
        } else {
            $response = ['error' => 'Method not allowed'];
            http_response_code(405);
        }
        break;
        
    case '/api/auth/login':
        if ($request_method === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $usernameOrEmail = $input['username'] ?? $input['email'] ?? '';
            $password = $input['password'] ?? '';
            
            if (!$db) {
                $response = ['error' => 'Database connection failed'];
                http_response_code(500);
                break;
            }
            
            try {
                // Check if input is email or username
                if (filter_var($usernameOrEmail, FILTER_VALIDATE_EMAIL)) {
                    // Login with email
                    $stmt = $db->prepare("SELECT * FROM users WHERE email = ? AND is_active = 1");
                } else {
                    // Login with username
                    $stmt = $db->prepare("SELECT * FROM users WHERE username = ? AND is_active = 1");
                }
                
                $stmt->execute([$usernameOrEmail]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($user && password_verify($password, $user['password_hash'])) {
                    // Update last login
                    $stmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
                    $stmt->execute([$user['id']]);
                    
                    $token = generateJWT($user);
                    
                    $response = [
                        'success' => true,
                        'message' => 'Login successful',
                        'token' => $token,
                        'user' => [
                            'id' => $user['id'],
                            'username' => $user['username'],
                            'email' => $user['email'],
                            'role' => $user['role'],
                            'level' => $user['level'],
                            'xp' => $user['xp'],
                            'avatar' => $user['avatar'],
                            'first_name' => $user['first_name'],
                            'last_name' => $user['last_name']
                        ]
                    ];
                } else {
                    $response = ['error' => 'Invalid credentials'];
                    http_response_code(401);
                }
            } catch (PDOException $e) {
                $response = ['error' => 'Database error: ' . $e->getMessage()];
                http_response_code(500);
            }
        } else {
            $response = ['error' => 'Method not allowed'];
            http_response_code(405);
        }
        break;
        
    case '/api/auth/me':
        $user = requireAuth();
        if (!$db) {
            $response = ['error' => 'Database connection failed'];
            http_response_code(500);
            break;
        }
        
        try {
            $stmt = $db->prepare("SELECT * FROM users WHERE id = ? AND is_active = 1");
            $stmt->execute([$user['user_id']]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($userData) {
                $response = [
                    'user' => [
                        'id' => $userData['id'],
                        'username' => $userData['username'],
                        'email' => $userData['email'],
                        'role' => $userData['role'],
                        'level' => $userData['level'],
                        'xp' => $userData['xp'],
                        'avatar' => $userData['avatar'],
                        'first_name' => $userData['first_name'],
                        'last_name' => $userData['last_name'],
                        'bio' => $userData['bio'],
                        'country' => $userData['country'],
                        'total_matches' => $userData['total_matches'],
                        'wins' => $userData['wins'],
                        'losses' => $userData['losses'],
                        'win_rate' => $userData['win_rate'],
                        'rank_points' => $userData['rank_points']
                    ]
                ];
            } else {
                $response = ['error' => 'User not found'];
                http_response_code(404);
            }
        } catch (PDOException $e) {
            $response = ['error' => 'Database error: ' . $e->getMessage()];
            http_response_code(500);
        }
        break;
        
    case '/api/users':
        if (!$db) {
            $response = ['error' => 'Database connection failed'];
            http_response_code(500);
            break;
        }
        
        try {
            $stmt = $db->prepare("SELECT id, username, email, role, level, xp, avatar, created_at FROM users WHERE is_active = 1 ORDER BY level DESC LIMIT 10");
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $response = [
                'users' => $users,
                'total' => count($users),
                'page' => 1,
                'per_page' => 10
            ];
        } catch (PDOException $e) {
            $response = ['error' => 'Database error: ' . $e->getMessage()];
            http_response_code(500);
        }
        break;
        
    case '/api/clans':
        if (!$db) {
            $response = ['error' => 'Database connection failed'];
            http_response_code(500);
            break;
        }
        
        try {
            $stmt = $db->prepare("SELECT * FROM clans WHERE is_active = 1 ORDER BY total_points DESC LIMIT 10");
            $stmt->execute();
            $clans = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $response = [
                'clans' => $clans,
                'total' => count($clans),
                'page' => 1,
                'per_page' => 10
            ];
        } catch (PDOException $e) {
            $response = ['error' => 'Database error: ' . $e->getMessage()];
            http_response_code(500);
        }
        break;
        
    case '/api/tournaments':
        if (!$db) {
            $response = ['error' => 'Database connection failed'];
            http_response_code(500);
            break;
        }
        
        try {
            $stmt = $db->prepare("SELECT * FROM tournaments ORDER BY start_date DESC LIMIT 10");
            $stmt->execute();
            $tournaments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $response = [
                'tournaments' => $tournaments,
                'total' => count($tournaments),
                'page' => 1,
                'per_page' => 10
            ];
        } catch (PDOException $e) {
            $response = ['error' => 'Database error: ' . $e->getMessage()];
            http_response_code(500);
        }
        break;
        
    case '/api/clans/user':
        // Get user's clan information
        $user = requireAuth();
        if (!$db) {
            $response = ['error' => 'Database connection failed'];
            http_response_code(500);
            break;
        }
        
        try {
            // Find user's clan by ownership
            $stmt = $db->prepare("SELECT c.*, 'leader' as user_role FROM clans c WHERE c.owner_id = ? AND c.is_active = 1");
            $stmt->execute([$user['user_id']]);
            $userClan = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$userClan) {
                // Find user's clan by membership
                $stmt = $db->prepare("
                    SELECT c.*, cm.role as user_role 
                    FROM clans c 
                    JOIN clan_members cm ON c.id = cm.clan_id 
                    WHERE cm.user_id = ? AND c.is_active = 1
                ");
                $stmt->execute([$user['user_id']]);
                $userClan = $stmt->fetch(PDO::FETCH_ASSOC);
            }
            
            if ($userClan) {
                // Get clan members
                $stmt = $db->prepare("
                    SELECT cm.*, u.username, u.first_name, u.last_name, u.level, u.avatar 
                    FROM clan_members cm 
                    JOIN users u ON cm.user_id = u.id 
                    WHERE cm.clan_id = ?
                ");
                $stmt->execute([$userClan['id']]);
                $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $userClan['members'] = $members;
                $userClan['total_members'] = count($members);
                
                $response = [
                    'success' => true,
                    'clan' => $userClan
                ];
            } else {
                $response = [
                    'success' => false,
                    'message' => 'User is not in any clan'
                ];
            }
        } catch (PDOException $e) {
            $response = ['error' => 'Database error: ' . $e->getMessage()];
            http_response_code(500);
        }
        break;
        
    case '/api/clans/join':
        if ($request_method === 'POST') {
            $user = requireAuth();
            $input = json_decode(file_get_contents('php://input'), true);
            $clanId = $input['clan_id'] ?? 0;
            $motivation = trim($input['motivation'] ?? '');
            
            if (!$clanId || !$motivation) {
                $response = ['error' => 'Clan ID and motivation are required'];
                http_response_code(400);
                break;
            }
            
            if (!$db) {
                $response = ['error' => 'Database connection failed'];
                http_response_code(500);
                break;
            }
            
            try {
                // Check if clan exists
                $stmt = $db->prepare("SELECT * FROM clans WHERE id = ? AND is_active = 1");
                $stmt->execute([$clanId]);
                $clan = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$clan) {
                    $response = ['error' => 'Clan not found'];
                    http_response_code(404);
                    break;
                }
                
                // Check if user already in a clan
                $stmt = $db->prepare("SELECT id FROM clan_members WHERE user_id = ?");
                $stmt->execute([$user['user_id']]);
                if ($stmt->fetch()) {
                    $response = ['error' => 'User already in a clan'];
                    http_response_code(400);
                    break;
                }
                
                // Get user info
                $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
                $stmt->execute([$user['user_id']]);
                $userData = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Create join application
                $stmt = $db->prepare("
                    INSERT INTO clan_join_applications 
                    (clan_id, user_id, player_name, player_level, win_rate, motivation) 
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $clanId,
                    $user['user_id'],
                    $userData['first_name'] . ' ' . ($userData['last_name'] ?? ''),
                    $userData['level'],
                    $userData['win_rate'],
                    $motivation
                ]);
                
                $response = [
                    'success' => true,
                    'message' => 'Join application submitted successfully'
                ];
                
            } catch (PDOException $e) {
                $response = ['error' => 'Database error: ' . $e->getMessage()];
                http_response_code(500);
            }
        } else {
            $response = ['error' => 'Method not allowed'];
            http_response_code(405);
        }
        break;
        
    case '/api/clans/create':
        if ($request_method === 'POST') {
            $user = requireAuth();
            if (!$db) {
                $response = ['error' => 'Database connection failed'];
                http_response_code(500);
                break;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Extract required fields
            $clanName = trim($input['clanName'] ?? '');
            $clanTag = trim($input['clanTag'] ?? '');
            $description = trim($input['description'] ?? '');
            $organizerName = trim($input['organizerName'] ?? '');
            $organizerEmail = trim($input['organizerEmail'] ?? '');
            $organizerCountry = trim($input['organizerCountry'] ?? '');
            $organizerExperience = trim($input['organizerExperience'] ?? '');
            $region = trim($input['region'] ?? '');
            $language = trim($input['language'] ?? 'ar');
            $membershipType = trim($input['membershipType'] ?? 'application');
            $minLevel = intval($input['minLevel'] ?? 1);
            $minWinRate = intval($input['minWinRate'] ?? 50);
            $maxMembers = intval($input['maxMembers'] ?? 50);
            $rules = trim($input['rules'] ?? '');
            $clanIcon = trim($input['clanIcon'] ?? '');
            
            // Validate required fields
            if (!$clanName || !$clanTag || !$description || !$organizerName || !$organizerEmail) {
                $response = ['error' => 'جميع الحقول المطلوبة يجب ملؤها'];
                http_response_code(400);
                break;
            }
            
            try {
                // Check if clan name or tag already exists
                $stmt = $db->prepare("
                    SELECT id FROM clan_applications WHERE clan_name = ? OR clan_tag = ?
                    UNION
                    SELECT id FROM clans WHERE name = ? OR tag = ?
                ");
                $stmt->execute([$clanName, $clanTag, $clanName, $clanTag]);
                if ($stmt->fetch()) {
                    $response = ['error' => 'اسم العشيرة أو الرمز موجود مسبقاً'];
                    http_response_code(400);
                    break;
                }
                
                // Check if user already has pending application
                $stmt = $db->prepare("SELECT id FROM clan_applications WHERE organizer_id = ? AND status = 'pending'");
                $stmt->execute([$user['user_id']]);
                if ($stmt->fetch()) {
                    $response = ['error' => 'لديك طلب إنشاء عشيرة قيد المراجعة بالفعل'];
                    http_response_code(400);
                    break;
                }
                
                // Check if user is already in a clan
                $stmt = $db->prepare("
                    SELECT id FROM clan_members WHERE user_id = ?
                    UNION
                    SELECT id FROM clans WHERE owner_id = ?
                ");
                $stmt->execute([$user['user_id'], $user['user_id']]);
                if ($stmt->fetch()) {
                    $response = ['error' => 'أنت عضو في عشيرة أخرى بالفعل'];
                    http_response_code(400);
                    break;
                }
                
                // Insert clan application
                $stmt = $db->prepare("
                    INSERT INTO clan_applications (
                        clan_name, clan_tag, description, organizer_id, organizer_name, 
                        organizer_email, organizer_country, organizer_experience, 
                        region, language, clan_icon, membership_type, min_level, 
                        min_win_rate, max_members, rules, status, submitted_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
                ");
                
                $result = $stmt->execute([
                    $clanName, $clanTag, $description, $user['user_id'], $organizerName,
                    $organizerEmail, $organizerCountry, $organizerExperience,
                    $region, $language, $clanIcon, $membershipType, $minLevel,
                    $minWinRate, $maxMembers, $rules
                ]);
                
                if ($result) {
                    $response = [
                        'success' => true,
                        'message' => 'تم تقديم طلب إنشاء العشيرة بنجاح'
                    ];
                } else {
                    $response = ['error' => 'فشل في تقديم الطلب'];
                    http_response_code(500);
                }
                
            } catch (PDOException $e) {
                $response = ['error' => 'Database error: ' . $e->getMessage()];
                http_response_code(500);
            }
        } else {
            $response = ['error' => 'Method not allowed'];
            http_response_code(405);
        }
        break;
        
    default:
        $response = [
            'error' => 'Endpoint not found',
            'path' => $path,
            'method' => $request_method,
            'available_endpoints' => [
                'GET /' => 'API Info',
                'GET /api/health' => 'Health Check',
                'POST /api/auth/login' => 'User Login',
                'GET /api/auth/me' => 'Current User (Auth Required)',
                'GET /api/users' => 'List Users',
                'GET /api/clans' => 'List Clans',
                'GET /api/tournaments' => 'List Tournaments'
            ]
        ];
        http_response_code(404);
        break;
}

// Output JSON response
echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?> 