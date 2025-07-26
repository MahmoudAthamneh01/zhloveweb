<?php
// Quick fix for clan creation and approval system
header('Content-Type: application/json');

// Handle CORS for both development ports
$allowed_origins = ['http://localhost:4321', 'http://localhost:4322'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit(0);

try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// JWT verification
function verifyJWT($token) {
    if (!$token) return false;
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
    if (!$payload || $payload['exp'] < time()) return false;
    return $payload;
}

function getAuthUser() {
    $headers = getallheaders();
    $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
    return verifyJWT($token);
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

switch ($action) {
    case 'create_application':
        if ($method !== 'POST') {
            echo json_encode(['error' => 'Method not allowed']);
            exit;
        }
        
        $user = getAuthUser();
        if (!$user) {
            echo json_encode(['error' => 'يجب تسجيل الدخول أولاً']);
            exit;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Extract data
        $clanName = trim($input['clanName'] ?? '');
        $clanTag = strtoupper(trim($input['clanTag'] ?? ''));
        $description = trim($input['description'] ?? '');
        
        if (!$clanName || !$clanTag || !$description) {
            echo json_encode(['error' => 'جميع البيانات مطلوبة']);
            exit;
        }
        
        // Check if already exists
        $stmt = $pdo->prepare("SELECT id FROM clans WHERE name = ? OR tag = ?");
        $stmt->execute([$clanName, $clanTag]);
        if ($stmt->fetch()) {
            echo json_encode(['error' => 'اسم العشيرة أو الرمز موجود مسبقاً']);
            exit;
        }
        
        // Insert application
        $stmt = $pdo->prepare("INSERT INTO clan_applications (clan_name, clan_tag, description, organizer_id, organizer_name, organizer_email, status, submitted_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())");
        $result = $stmt->execute([$clanName, $clanTag, $description, $user['user_id'], $user['username'], $user['email'] ?? '']);
        
        if ($result) {
            echo json_encode(['success' => true, 'message' => 'تم تقديم الطلب بنجاح']);
        } else {
            echo json_encode(['error' => 'فشل في تقديم الطلب']);
        }
        break;
        
    case 'approve_clan':
        if ($method !== 'POST') {
            echo json_encode(['error' => 'Method not allowed']);
            exit;
        }
        
        $user = getAuthUser();
        if (!$user || $user['role'] !== 'admin') {
            echo json_encode(['error' => 'صلاحيات الأدمن مطلوبة']);
            exit;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $appId = intval($input['application_id'] ?? 0);
        
        if (!$appId) {
            echo json_encode(['error' => 'معرف الطلب مطلوب']);
            exit;
        }
        
        // Get application
        $stmt = $pdo->prepare("SELECT * FROM clan_applications WHERE id = ? AND status = 'pending'");
        $stmt->execute([$appId]);
        $app = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$app) {
            echo json_encode(['error' => 'الطلب غير موجود']);
            exit;
        }
        
        $pdo->beginTransaction();
        try {
            // Create clan
            $stmt = $pdo->prepare("INSERT INTO clans (name, tag, description, owner_id, total_members, level, is_active, is_approved, created_at) VALUES (?, ?, ?, ?, 1, 1, 1, 1, NOW())");
            $stmt->execute([$app['clan_name'], $app['clan_tag'], $app['description'], $app['organizer_id']]);
            $clanId = $pdo->lastInsertId();
            
            // Add owner as member
            $stmt = $pdo->prepare("INSERT INTO clan_members (clan_id, user_id, role, joined_at) VALUES (?, ?, 'leader', NOW())");
            $stmt->execute([$clanId, $app['organizer_id']]);
            
            // Update application
            $stmt = $pdo->prepare("UPDATE clan_applications SET status = 'approved', reviewed_by = ?, reviewed_at = NOW() WHERE id = ?");
            $stmt->execute([$user['user_id'], $appId]);
            
            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'تم اعتماد العشيرة بنجاح', 'clan_id' => $clanId]);
        } catch (Exception $e) {
            $pdo->rollback();
            echo json_encode(['error' => 'فشل في إنشاء العشيرة: ' . $e->getMessage()]);
        }
        break;
        
    case 'my_clan':
        $user = getAuthUser();
        if (!$user) {
            echo json_encode(['error' => 'غير مصرح']);
            exit;
        }
        
        // Check if user owns a clan
        $stmt = $pdo->prepare("SELECT c.*, 'leader' as user_role FROM clans c WHERE c.owner_id = ? AND c.is_active = 1");
        $stmt->execute([$user['user_id']]);
        $clan = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$clan) {
            // Check if user is a member
            $stmt = $pdo->prepare("SELECT c.*, cm.role as user_role FROM clans c JOIN clan_members cm ON c.id = cm.clan_id WHERE cm.user_id = ? AND c.is_active = 1");
            $stmt->execute([$user['user_id']]);
            $clan = $stmt->fetch(PDO::FETCH_ASSOC);
        }
        
        if ($clan) {
            // Get members
            $stmt = $pdo->prepare("SELECT cm.*, u.username, u.first_name FROM clan_members cm JOIN users u ON cm.user_id = u.id WHERE cm.clan_id = ?");
            $stmt->execute([$clan['id']]);
            $clan['members'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $clan['total_members'] = count($clan['members']);
            
            echo json_encode(['success' => true, 'clan' => $clan, 'user_role' => $clan['user_role']]);
        } else {
            echo json_encode(['success' => false, 'message' => 'لست عضواً في أي عشيرة']);
        }
        break;
        
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}
?> 