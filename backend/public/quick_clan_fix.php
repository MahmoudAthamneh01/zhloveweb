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
    
    // Simple JWT verification for development
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    
    $payload = json_decode(base64_decode($parts[1]), true);
    return $payload;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'create':
        // Handle clan creation
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Get token from Authorization header or request body
        $token = null;
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $token = str_replace('Bearer ', '', $headers['Authorization']);
        } elseif (isset($input['token'])) {
            $token = $input['token'];
        }
        
        $userData = verifyJWT($token);
        if (!$userData) {
            echo json_encode(['error' => 'غير مصرح لك بالوصول']);
            exit;
        }
        
        // Validate input - check for correct field names from frontend
        $clanName = $input['clanName'] ?? $input['name'] ?? '';
        $description = $input['description'] ?? '';
        
        if (!$clanName || !$description) {
            echo json_encode(['error' => 'اسم العشيرة والوصف مطلوبان']);
            exit;
        }
        
        try {
            // Check if user already has a clan application
            $stmt = $pdo->prepare("SELECT id FROM clan_applications WHERE organizer_id = ? AND status = 'pending'");
            $stmt->execute([$userData['user_id']]);
            if ($stmt->fetch()) {
                echo json_encode(['error' => 'لديك طلب انضمام معلق بالفعل']);
                exit;
            }
            
            // Create clan application using correct table structure
            $stmt = $pdo->prepare("
                INSERT INTO clan_applications (
                    clan_name, clan_tag, description, organizer_id, organizer_name, 
                    organizer_email, organizer_phone, organizer_country, organizer_experience,
                    region, language, clan_icon, membership_type, min_level, min_win_rate, 
                    max_members, rules, participation_requirements, status, submitted_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
            ");
            
            $stmt->execute([
                $clanName,
                $input['clanTag'] ?? strtoupper(substr($clanName, 0, 4)),
                $description,
                $userData['user_id'],
                $input['organizerName'] ?? $userData['username'],
                $input['organizerEmail'] ?? '',
                $input['organizerPhone'] ?? '',
                $input['organizerCountry'] ?? 'Saudi Arabia',
                $input['organizerExperience'] ?? 'intermediate',
                $input['region'] ?? 'المملكة العربية السعودية',
                $input['language'] ?? 'ar',
                $input['clanIcon'] ?? 'clan_shield',
                $input['membershipType'] ?? 'application',
                intval($input['minLevel'] ?? 1),
                intval($input['minWinRate'] ?? 50),
                intval($input['maxMembers'] ?? 50),
                $input['rules'] ?? '',
                json_encode($input['participationRequirements'] ?? [])
            ]);
            
            echo json_encode(['success' => true, 'message' => 'تم تقديم طلب إنشاء العشيرة بنجاح']);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()]);
        }
        break;
        
    case 'approve':
        // Handle clan approval (admin only)
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['application_id'])) {
            echo json_encode(['error' => 'معرف الطلب مطلوب']);
            exit;
        }
        
        try {
            // Get application details with correct column names
            $stmt = $pdo->prepare("
                SELECT ca.*, u.username 
                FROM clan_applications ca 
                JOIN users u ON ca.organizer_id = u.id 
                WHERE ca.id = ? AND ca.status = 'pending'
            ");
            $stmt->execute([$input['application_id']]);
            $application = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$application) {
                echo json_encode(['error' => 'الطلب غير موجود أو تمت معالجته بالفعل']);
                exit;
            }
            
            // Create the clan
            $stmt = $pdo->prepare("
                INSERT INTO clans (name, tag, description, owner_id, created_at, is_active, is_approved)
                VALUES (?, ?, ?, ?, NOW(), 1, 1)
            ");
            $stmt->execute([
                $application['clan_name'],
                $application['clan_tag'],
                $application['description'],
                $application['organizer_id']
            ]);
            
            $clanId = $pdo->lastInsertId();
            
            // Add creator as clan member
            $stmt = $pdo->prepare("
                INSERT INTO clan_members (clan_id, user_id, role, joined_at)
                VALUES (?, ?, 'leader', NOW())
            ");
            $stmt->execute([$clanId, $application['organizer_id']]);
            
            // Update application status
            $stmt = $pdo->prepare("UPDATE clan_applications SET status = 'approved', reviewed_at = NOW() WHERE id = ?");
            $stmt->execute([$input['application_id']]);
            
            echo json_encode([
                'success' => true, 
                'message' => 'تم قبول الطلب وإنشاء العشيرة بنجاح',
                'clan_id' => $clanId
            ]);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()]);
        }
        break;
        
    case 'reject':
        // Handle clan rejection
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['application_id'])) {
            echo json_encode(['error' => 'معرف الطلب مطلوب']);
            exit;
        }
        
        try {
            $stmt = $pdo->prepare("UPDATE clan_applications SET status = 'rejected' WHERE id = ? AND status = 'pending'");
            $stmt->execute([$input['application_id']]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'تم رفض الطلب']);
            } else {
                echo json_encode(['error' => 'الطلب غير موجود أو تمت معالجته بالفعل']);
            }
        } catch (PDOException $e) {
            echo json_encode(['error' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()]);
        }
        break;
        
    case 'list_applications':
        // List all pending applications (admin only)
        try {
            $stmt = $pdo->prepare("
                SELECT ca.*, u.username as organizer_username
                FROM clan_applications ca 
                JOIN users u ON ca.organizer_id = u.id 
                WHERE ca.status = 'pending'
                ORDER BY ca.submitted_at DESC
            ");
            $stmt->execute();
            $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'applications' => $applications]);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()]);
        }
        break;
        
    default:
        echo json_encode(['error' => 'Action غير صحيح']);
        break;
}
?> 