<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:4321');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Database connection
function getDB() {
    try {
        $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        return null;
    }
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

// Get authorization header
function getAuthUser() {
    $headers = getallheaders();
    $token = null;
    
    if (isset($headers['Authorization'])) {
        $token = str_replace('Bearer ', '', $headers['Authorization']);
    }
    
    return verifyJWT($token);
}

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'submit':
            if ($method !== 'POST') {
                echo json_encode(['error' => 'Method not allowed']);
                exit;
            }
            
            $user = getAuthUser();
            if (!$user) {
                echo json_encode(['error' => 'Unauthorized']);
                exit;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            // Extract required fields
            $clanName = trim($input['clanName'] ?? '');
            $clanTag = strtoupper(trim($input['clanTag'] ?? ''));
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
                echo json_encode(['error' => 'جميع الحقول المطلوبة يجب ملؤها']);
                exit;
            }
            
            // Check if clan name or tag already exists
            $stmt = $db->prepare("
                SELECT id FROM clan_applications WHERE clan_name = ? OR clan_tag = ?
                UNION
                SELECT id FROM clans WHERE name = ? OR tag = ?
            ");
            $stmt->execute([$clanName, $clanTag, $clanName, $clanTag]);
            if ($stmt->fetch()) {
                echo json_encode(['error' => 'اسم العشيرة أو الرمز موجود مسبقاً']);
                exit;
            }
            
            // Check if user already has pending application
            $stmt = $db->prepare("SELECT id FROM clan_applications WHERE organizer_id = ? AND status = 'pending'");
            $stmt->execute([$user['user_id']]);
            if ($stmt->fetch()) {
                echo json_encode(['error' => 'لديك طلب إنشاء عشيرة قيد المراجعة بالفعل']);
                exit;
            }
            
            // Check if user is already in a clan
            $stmt = $db->prepare("
                SELECT id FROM clan_members WHERE user_id = ?
                UNION
                SELECT id FROM clans WHERE owner_id = ?
            ");
            $stmt->execute([$user['user_id'], $user['user_id']]);
            if ($stmt->fetch()) {
                echo json_encode(['error' => 'أنت عضو في عشيرة أخرى بالفعل']);
                exit;
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
                echo json_encode([
                    'success' => true,
                    'message' => 'تم تقديم طلب إنشاء العشيرة بنجاح'
                ]);
            } else {
                echo json_encode(['error' => 'فشل في تقديم الطلب']);
            }
            break;
            
        case 'approve':
            if ($method !== 'POST') {
                echo json_encode(['error' => 'Method not allowed']);
                exit;
            }
            
            $user = getAuthUser();
            if (!$user || $user['role'] !== 'admin') {
                echo json_encode(['error' => 'Unauthorized - Admin access required']);
                exit;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            $applicationId = intval($input['application_id'] ?? 0);
            
            if (!$applicationId) {
                echo json_encode(['error' => 'Application ID is required']);
                exit;
            }
            
            // Get application details
            $stmt = $db->prepare("SELECT * FROM clan_applications WHERE id = ? AND status = 'pending'");
            $stmt->execute([$applicationId]);
            $application = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$application) {
                echo json_encode(['error' => 'Application not found or already processed']);
                exit;
            }
            
            // Begin transaction
            $db->beginTransaction();
            
            try {
                // Create the clan
                $stmt = $db->prepare("
                    INSERT INTO clans (
                        name, tag, description, owner_id, total_members, total_points, 
                        level, max_members, is_recruiting, is_active, is_approved, 
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, 1, 0, 1, ?, 1, 1, 1, NOW(), NOW())
                ");
                
                $stmt->execute([
                    $application['clan_name'],
                    $application['clan_tag'], 
                    $application['description'],
                    $application['organizer_id'],
                    $application['max_members']
                ]);
                
                $clanId = $db->lastInsertId();
                
                // Add owner as clan member
                $stmt = $db->prepare("
                    INSERT INTO clan_members (clan_id, user_id, role, contribution_points, joined_at)
                    VALUES (?, ?, 'leader', 0, NOW())
                ");
                $stmt->execute([$clanId, $application['organizer_id']]);
                
                // Update application status
                $stmt = $db->prepare("
                    UPDATE clan_applications 
                    SET status = 'approved', reviewed_by = ?, reviewed_at = NOW()
                    WHERE id = ?
                ");
                $stmt->execute([$user['user_id'], $applicationId]);
                
                $db->commit();
                
                echo json_encode([
                    'success' => true,
                    'message' => 'تم اعتماد العشيرة بنجاح',
                    'clan_id' => $clanId
                ]);
                
            } catch (Exception $e) {
                $db->rollback();
                echo json_encode(['error' => 'فشل في إنشاء العشيرة: ' . $e->getMessage()]);
            }
            break;
            
        case 'reject':
            if ($method !== 'POST') {
                echo json_encode(['error' => 'Method not allowed']);
                exit;
            }
            
            $user = getAuthUser();
            if (!$user || $user['role'] !== 'admin') {
                echo json_encode(['error' => 'Unauthorized - Admin access required']);
                exit;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            $applicationId = intval($input['application_id'] ?? 0);
            $notes = trim($input['notes'] ?? '');
            
            if (!$applicationId) {
                echo json_encode(['error' => 'Application ID is required']);
                exit;
            }
            
            $stmt = $db->prepare("
                UPDATE clan_applications 
                SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW(), notes = ?
                WHERE id = ? AND status = 'pending'
            ");
            
            $result = $stmt->execute([$user['user_id'], $notes, $applicationId]);
            
            if ($result && $stmt->rowCount() > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'تم رفض الطلب'
                ]);
            } else {
                echo json_encode(['error' => 'Application not found or already processed']);
            }
            break;
            
        case 'list':
            $user = getAuthUser();
            if (!$user || $user['role'] !== 'admin') {
                echo json_encode(['error' => 'Unauthorized - Admin access required']);
                exit;
            }
            
            $status = $_GET['status'] ?? 'pending';
            
            $stmt = $db->prepare("
                SELECT ca.*, u.username as organizer_username
                FROM clan_applications ca
                JOIN users u ON ca.organizer_id = u.id
                WHERE ca.status = ?
                ORDER BY ca.submitted_at DESC
            ");
            $stmt->execute([$status]);
            $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'applications' => $applications
            ]);
            break;
            
        default:
            echo json_encode(['error' => 'Invalid action']);
            break;
    }
    
} catch (Exception $e) {
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?> 