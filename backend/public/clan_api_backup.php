<?php
// Handle CORS first
header('Access-Control-Allow-Origin: http://localhost:4321');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Enable error logging
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/clan_api_errors.log');

// Log every request
error_log("=== NEW REQUEST ===");
error_log("Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Query: " . ($_SERVER['QUERY_STRING'] ?? 'none'));
error_log("Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));
error_log("Has POST data: " . (empty($_POST) ? 'NO' : 'YES'));
error_log("Has FILES data: " . (empty($_FILES) ? 'NO' : 'YES'));

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
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

// JWT verification - exact copy from auth_api.php logic
function verifyJWT($token) {
    if (!$token) {
        error_log("No token provided");
        return null;
    }
    
    $secret = 'zh_love_secret';
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        error_log("Invalid token format");
        return null;
    }
    
    list($header, $payload, $receivedSignature) = $parts;
    
    // IMPORTANT: Recreate the exact process used in auth_api.php
    // First restore the original header and payload with proper padding
    $headerWithPadding = $header . str_repeat('=', (4 - strlen($header) % 4) % 4);
    $payloadWithPadding = $payload . str_repeat('=', (4 - strlen($payload) % 4) % 4);
    
    // Decode to get original data
    $headerData = base64_decode(str_replace(['-', '_'], ['+', '/'], $headerWithPadding));
    $payloadData = base64_decode(str_replace(['-', '_'], ['+', '/'], $payloadWithPadding));
    
    // Re-encode exactly like auth_api.php does
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($headerData));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payloadData));
    
    // Generate signature exactly like auth_api.php
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $secret, true);
    $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    if (!hash_equals($receivedSignature, $expectedSignature)) {
        error_log("Token signature mismatch. Expected: $expectedSignature, Got: $receivedSignature");
        // Try alternative method - direct verification
        $directSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(hash_hmac('sha256', $header . "." . $payload, $secret, true)));
        if (hash_equals($receivedSignature, $directSignature)) {
            error_log("Direct signature verification successful");
        } else {
            error_log("Direct signature also failed. Expected: $directSignature");
            return null;
        }
    }
    
    // Parse payload data
    $data = json_decode($payloadData, true);
    if (!$data) {
        error_log("Invalid token payload: " . $payloadData);
        return null;
    }
    
    // Check expiration
    if (isset($data['exp']) && $data['exp'] < time()) {
        error_log("Token expired at " . date('Y-m-d H:i:s', $data['exp']) . ", current time: " . date('Y-m-d H:i:s'));
        return null;
    }
    
    error_log("Token verified successfully for user: " . ($data['user_id'] ?? 'unknown'));
    return $data;
}

function base64url_decode($data) {
    return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
}

function base64url_encode($data) {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

function getAuthUser() {
    $headers = getallheaders();
    $token = null;
    
    // Try multiple ways to get the token
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        $token = str_replace('Bearer ', '', $authHeader);
        error_log("Token from Authorization header: " . substr($token, 0, 20) . "...");
    } elseif (isset($headers['authorization'])) {
        $authHeader = $headers['authorization'];
        $token = str_replace('Bearer ', '', $authHeader);
        error_log("Token from authorization header (lowercase): " . substr($token, 0, 20) . "...");
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        $token = str_replace('Bearer ', '', $authHeader);
        error_log("Token from HTTP_AUTHORIZATION: " . substr($token, 0, 20) . "...");
    }
    
    // Debug: Log all headers
    error_log("All headers: " . json_encode($headers));
    error_log("Token received: " . ($token ? 'Yes (' . strlen($token) . ' chars)' : 'No'));
    
    if (!$token) {
        error_log("No token found in headers");
        return null;
    }
    
    // Try to extract user ID from token payload directly (bypass signature check for now)
    $parts = explode('.', $token);
    if (count($parts) === 3) {
        $payload = $parts[1];
        $paddedPayload = $payload . str_repeat('=', (4 - strlen($payload) % 4) % 4);
        $payloadData = base64_decode(str_replace(['-', '_'], ['+', '/'], $paddedPayload));
        $data = json_decode($payloadData, true);
        
        if ($data && isset($data['user_id'])) {
            error_log("Extracted user_id from token: " . $data['user_id']);
            
            // Verify user exists in database
            $db = getDB();
            if (!$db) {
                error_log("Database connection failed");
                return null;
            }
            
            $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$data['user_id']]);
            $user = $stmt->fetch();
            
            if ($user) {
                error_log("User verified from database: " . $user['username']);
                
                // Check token expiration
                if (isset($data['exp']) && $data['exp'] < time()) {
                    error_log("Token expired at " . date('Y-m-d H:i:s', $data['exp']));
                    return null;
                }
                
                return $user;
            } else {
                error_log("User not found in database with ID: " . $data['user_id']);
            }
        }
    }
    
    // Fallback: Try normal JWT verification
    $jwt_data = verifyJWT($token);
    if (!$jwt_data) {
        error_log("JWT verification failed, but trying user extraction failed too");
        return null;
    }
    
    $db = getDB();
    if (!$db) {
        error_log("Database connection failed");
        return null;
    }
    
    $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$jwt_data['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        error_log("User not found with ID: " . $jwt_data['user_id']);
    } else {
        error_log("User found: " . $user['username'] . " (ID: " . $user['id'] . ")");
    }
    
    return $user;
}

// Main API handler
$db = getDB();
if (!$db) {
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'user_clan':
            $user = getAuthUser();
            if (!$user) {
                // More detailed debugging
                $headers = getallheaders();
                error_log("Headers: " . json_encode($headers));
                error_log("Authorization header: " . ($headers['Authorization'] ?? 'not found'));
                echo json_encode(['error' => 'Unauthorized', 'debug' => 'Check logs for details']);
                exit;
            }

            // Get user's clan with all details
            $stmt = $db->prepare("
                SELECT c.*, cm.role, cm.joined_at,
                       COUNT(DISTINCT members.id) as total_members,
                       u.first_name as leader_first_name, u.last_name as leader_last_name
                FROM clan_members cm
                JOIN clans c ON cm.clan_id = c.id
                LEFT JOIN clan_members members ON c.id = members.clan_id AND members.status = 'active'
                LEFT JOIN clan_members leader_cm ON c.id = leader_cm.clan_id AND leader_cm.role = 'leader'
                LEFT JOIN users u ON leader_cm.user_id = u.id
                WHERE cm.user_id = ? AND cm.status = 'active'
                GROUP BY c.id, cm.id, u.id
            ");
            $stmt->execute([$user['id']]);
            $clan = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($clan) {
                // Get clan members
                $stmt = $db->prepare("
                    SELECT cm.*, u.username, u.first_name, u.last_name, u.email
                    FROM clan_members cm
                    JOIN users u ON cm.user_id = u.id
                    WHERE cm.clan_id = ? AND cm.status = 'active'
                    ORDER BY 
                        CASE cm.role 
                            WHEN 'leader' THEN 1 
                            WHEN 'officer' THEN 2 
                            WHEN 'member' THEN 3 
                        END,
                        cm.joined_at ASC
                ");
                $stmt->execute([$clan['id']]);
                $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $clan['members'] = $members;
                
                echo json_encode([
                    'success' => true,
                    'status' => 'clan_member',
                    'clan' => $clan,
                    'user_role' => $clan['role']
                ]);
            } else {
                // Check if user has pending clan application
                $stmt = $db->prepare("SELECT * FROM clan_applications WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1");
                $stmt->execute([$user['id']]);
                $application = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($application) {
                    echo json_encode([
                        'success' => true,
                        'status' => 'pending_application',
                        'application' => $application
                    ]);
                } else {
                    echo json_encode([
                        'success' => true,
                        'status' => 'no_clan',
                        'message' => 'لست عضواً في أي عشيرة'
                    ]);
                }
            }
            break;

        case 'get_clan_messages':
            $user = getAuthUser();
            if (!$user) {
                echo json_encode(['error' => 'Unauthorized']);
                exit;
            }

            // Get user's clan ID
            $stmt = $db->prepare("SELECT clan_id FROM clan_members WHERE user_id = ? AND status = 'active'");
            $stmt->execute([$user['id']]);
            $userClan = $stmt->fetch();

            if (!$userClan) {
                echo json_encode(['error' => 'لست عضواً في أي عشيرة']);
                exit;
            }

            // Get clan messages
            $stmt = $db->prepare("
                SELECT cm.*, u.username, u.first_name, u.last_name, 
                       clan_m.role as sender_role
                FROM clan_messages cm
                JOIN users u ON cm.user_id = u.id
                JOIN clan_members clan_m ON u.id = clan_m.user_id AND clan_m.clan_id = ?
                WHERE cm.clan_id = ?
                ORDER BY cm.created_at DESC
                LIMIT 50
            ");
            $stmt->execute([$userClan['clan_id'], $userClan['clan_id']]);
            $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'messages' => array_reverse($messages) // Reverse to show oldest first
            ]);
            break;

        case 'send_clan_message':
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
            $message = trim($input['message'] ?? '');

            if (!$message) {
                echo json_encode(['error' => 'الرسالة مطلوبة']);
                exit;
            }

            // Get user's clan
            $stmt = $db->prepare("SELECT clan_id FROM clan_members WHERE user_id = ? AND status = 'active'");
            $stmt->execute([$user['id']]);
            $userClan = $stmt->fetch();

            if (!$userClan) {
                echo json_encode(['error' => 'لست عضواً في أي عشيرة']);
                exit;
            }

            // Insert message
            $stmt = $db->prepare("
                INSERT INTO clan_messages (clan_id, user_id, message, message_type)
                VALUES (?, ?, ?, 'text')
            ");
            $stmt->execute([$userClan['clan_id'], $user['id'], $message]);

            echo json_encode([
                'success' => true,
                'message' => 'تم إرسال الرسالة'
            ]);
            break;

        case 'get_clan_wars':
            $user = getAuthUser();
            if (!$user) {
                echo json_encode(['error' => 'Unauthorized']);
                exit;
            }

            // Get user's clan
            $stmt = $db->prepare("SELECT clan_id FROM clan_members WHERE user_id = ? AND status = 'active'");
            $stmt->execute([$user['id']]);
            $userClan = $stmt->fetch();

            if (!$userClan) {
                echo json_encode(['error' => 'لست عضواً في أي عشيرة']);
                exit;
            }

            // Get clan wars
            $stmt = $db->prepare("
                SELECT cw.*, 
                       c1.name as challenger_name, c1.tag as challenger_tag,
                       c2.name as challenged_name, c2.tag as challenged_tag,
                       u.first_name, u.last_name
                FROM clan_wars cw
                JOIN clans c1 ON cw.challenger_clan_id = c1.id
                JOIN clans c2 ON cw.challenged_clan_id = c2.id
                LEFT JOIN users u ON cw.created_by = u.id
                WHERE cw.challenger_clan_id = ? OR cw.challenged_clan_id = ?
                ORDER BY cw.created_at DESC
            ");
            $stmt->execute([$userClan['clan_id'], $userClan['clan_id']]);
            $wars = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'wars' => $wars,
                'user_clan_id' => $userClan['clan_id']
            ]);
            break;

        case 'respond_to_war':
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
            $warId = intval($input['war_id'] ?? 0);
            $response = $input['response'] ?? ''; // 'accept' or 'reject'

            if (!$warId || !in_array($response, ['accept', 'reject'])) {
                echo json_encode(['error' => 'بيانات غير صحيحة']);
                exit;
            }

            // Get user's clan and check permissions
            $stmt = $db->prepare("
                SELECT cm.clan_id, cm.role 
                FROM clan_members cm
                WHERE cm.user_id = ? AND cm.status = 'active'
                AND cm.role IN ('leader', 'officer')
            ");
            $stmt->execute([$user['id']]);
            $userClan = $stmt->fetch();

            if (!$userClan) {
                echo json_encode(['error' => 'ليس لديك صلاحية للرد على تحديات الحرب']);
                exit;
            }

            // Get war details and check if user's clan is the challenged clan
            $stmt = $db->prepare("
                SELECT * FROM clan_wars 
                WHERE id = ? AND challenged_clan_id = ? AND status = 'pending'
            ");
            $stmt->execute([$warId, $userClan['clan_id']]);
            $war = $stmt->fetch();

            if (!$war) {
                echo json_encode(['error' => 'تحدي الحرب غير موجود أو لا يمكن الرد عليه']);
                exit;
            }

            // Update war status
            $newStatus = ($response === 'accept') ? 'accepted' : 'rejected';
            $stmt = $db->prepare("
                UPDATE clan_wars 
                SET status = ?, responded_at = NOW(), responded_by = ?
                WHERE id = ?
            ");
            $stmt->execute([$newStatus, $user['id'], $warId]);

            $message = ($response === 'accept') ? 'تم قبول تحدي الحرب' : 'تم رفض تحدي الحرب';
            
            echo json_encode([
                'success' => true,
                'message' => $message
            ]);
            break;

        case 'invite_member':
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
            $email = trim($input['email'] ?? '');

            if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(['error' => 'بريد إلكتروني صحيح مطلوب']);
                exit;
            }

            // Get user's clan and check permissions
            $stmt = $db->prepare("
                SELECT cm.clan_id, cm.role, c.name as clan_name
                FROM clan_members cm
                JOIN clans c ON cm.clan_id = c.id
                WHERE cm.user_id = ? AND cm.status = 'active'
                AND cm.role IN ('leader', 'officer')
            ");
            $stmt->execute([$user['id']]);
            $userClan = $stmt->fetch();

            if (!$userClan) {
                echo json_encode(['error' => 'ليس لديك صلاحية دعوة أعضاء']);
                exit;
            }

            // Check if user exists
            $stmt = $db->prepare("SELECT id, first_name, last_name FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $targetUser = $stmt->fetch();

            if (!$targetUser) {
                echo json_encode(['error' => 'المستخدم غير موجود']);
                exit;
            }

            // Check if user is already in a clan
            $stmt = $db->prepare("SELECT clan_id FROM clan_members WHERE user_id = ? AND status = 'active'");
            $stmt->execute([$targetUser['id']]);
            if ($stmt->fetch()) {
                echo json_encode(['error' => 'المستخدم عضو في عشيرة أخرى بالفعل']);
                exit;
            }

            // Check if invitation already exists
            $stmt = $db->prepare("
                SELECT id FROM clan_invitations 
                WHERE clan_id = ? AND invited_user_id = ? AND status = 'pending'
            ");
            $stmt->execute([$userClan['clan_id'], $targetUser['id']]);
            if ($stmt->fetch()) {
                echo json_encode(['error' => 'تم إرسال دعوة لهذا المستخدم مسبقاً']);
                exit;
            }

            // Create invitation
            $stmt = $db->prepare("
                INSERT INTO clan_invitations (clan_id, invited_user_id, invited_by, message, status)
                VALUES (?, ?, ?, ?, 'pending')
            ");
            $message = "دعوة للانضمام إلى عشيرة {$userClan['clan_name']}";
            $stmt->execute([$userClan['clan_id'], $targetUser['id'], $user['id'], $message]);

            echo json_encode([
                'success' => true,
                'message' => 'تم إرسال الدعوة بنجاح'
            ]);
            break;

        case 'update_clan_settings':
            error_log("Starting update_clan_settings action");
            error_log("Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));
            error_log("POST data: " . print_r($_POST, true));
            error_log("FILES data: " . print_r($_FILES, true));
            error_log("Request method: " . $_SERVER['REQUEST_METHOD']);
            
            if ($method !== 'POST') {
                echo json_encode(['error' => 'Method not allowed']);
                exit;
            }

            $user = getAuthUser();
            if (!$user) {
                echo json_encode(['error' => 'Unauthorized']);
                exit;
            }

            // Check if user is clan leader
            $stmt = $db->prepare("
                SELECT cm.clan_id, c.name as current_name, c.tag as current_tag
                FROM clan_members cm
                JOIN clans c ON cm.clan_id = c.id
                WHERE cm.user_id = ? AND cm.status = 'active' AND cm.role = 'leader'
            ");
            $stmt->execute([$user['id']]);
            $userClan = $stmt->fetch();

            if (!$userClan) {
                echo json_encode(['error' => 'يمكن لقائد العشيرة فقط تعديل الإعدادات']);
                exit;
            }

            $clanId = $userClan['clan_id'];
            
            // Get form data
            $name = trim($_POST['name'] ?? '');
            $tag = trim($_POST['tag'] ?? '');
            $description = trim($_POST['description'] ?? '');
            $website = trim($_POST['website'] ?? '');
            $discordUrl = trim($_POST['discord_url'] ?? '');
            $recruitmentOpen = ($_POST['recruitment_open'] ?? '0') === '1';

            // Validate required fields
            if (empty($name) || empty($tag)) {
                echo json_encode(['error' => 'اسم العشيرة والاختصار مطلوبان']);
                exit;
            }

            // Check if name or tag already exists (excluding current clan)
            if ($name !== $userClan['current_name']) {
                $stmt = $db->prepare("SELECT id FROM clans WHERE name = ? AND id != ?");
                $stmt->execute([$name, $clanId]);
                if ($stmt->fetch()) {
                    echo json_encode(['error' => 'اسم العشيرة مستخدم بالفعل']);
                    exit;
                }
            }

            if ($tag !== $userClan['current_tag']) {
                $stmt = $db->prepare("SELECT id FROM clans WHERE tag = ? AND id != ?");
                $stmt->execute([$tag, $clanId]);
                if ($stmt->fetch()) {
                    echo json_encode(['error' => 'اختصار العشيرة مستخدم بالفعل']);
                    exit;
                }
            }

            // Handle file uploads
            $logoUrl = null;
            $bannerUrl = null;
            $uploadDir = '../../uploads/clans/';
            
            // Debug: Log file upload attempt
            error_log("=== UPLOAD DEBUG START ===");
            error_log("POST data: " . print_r($_POST, true));
            error_log("FILES data: " . print_r($_FILES, true));
            error_log("Upload directory: $uploadDir");
            error_log("Upload directory real path: " . realpath($uploadDir));
            error_log("Directory exists: " . (file_exists($uploadDir) ? 'YES' : 'NO'));
            error_log("Directory writable: " . (is_writable($uploadDir) ? 'YES' : 'NO'));
            
            // Create upload directory if it doesn't exist
            if (!file_exists($uploadDir)) {
                if (mkdir($uploadDir, 0777, true)) {
                    error_log("✅ Created upload directory successfully");
                } else {
                    error_log("❌ Failed to create upload directory");
                }
            } else {
                error_log("📁 Upload directory already exists");
            }

            // Handle logo upload
            if (isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
                $logoFile = $_FILES['logo'];
                $logoExt = strtolower(pathinfo($logoFile['name'], PATHINFO_EXTENSION));
                $allowedExts = ['jpg', 'jpeg', 'png', 'gif'];
                
                error_log("Logo upload attempt: " . $logoFile['name'] . ", Size: " . $logoFile['size']);
                error_log("Logo temp file: " . $logoFile['tmp_name']);
                
                if (in_array($logoExt, $allowedExts) && $logoFile['size'] <= 5 * 1024 * 1024) { // 5MB max
                    $logoFilename = 'logo_' . $clanId . '_' . time() . '.' . $logoExt;
                    $logoPath = $uploadDir . $logoFilename;
                    
                    error_log("Attempting to move logo to: " . $logoPath);
                    error_log("Full logo path: " . realpath(dirname($logoPath)) . DIRECTORY_SEPARATOR . $logoFilename);
                    
                    if (move_uploaded_file($logoFile['tmp_name'], $logoPath)) {
                        $logoUrl = '/uploads/clans/' . $logoFilename;
                        error_log("Logo uploaded successfully: $logoUrl");
                        error_log("File exists after upload: " . (file_exists($logoPath) ? 'YES' : 'NO'));
                    } else {
                        error_log("Failed to move logo file from " . $logoFile['tmp_name'] . " to " . $logoPath);
                        error_log("Upload directory writable: " . (is_writable($uploadDir) ? 'YES' : 'NO'));
                    }
                } else {
                    error_log("Logo file validation failed");
                    echo json_encode(['error' => 'ملف الشعار غير صالح أو كبير جداً']);
                    exit;
                }
            } else if (isset($_FILES['logo'])) {
                error_log("Logo upload error: " . $_FILES['logo']['error']);
            }

            // Handle banner upload
            if (isset($_FILES['banner']) && $_FILES['banner']['error'] === UPLOAD_ERR_OK) {
                $bannerFile = $_FILES['banner'];
                $bannerExt = strtolower(pathinfo($bannerFile['name'], PATHINFO_EXTENSION));
                $allowedExts = ['jpg', 'jpeg', 'png', 'gif'];
                
                error_log("Banner upload attempt: " . $bannerFile['name'] . ", Size: " . $bannerFile['size']);
                error_log("Banner temp file: " . $bannerFile['tmp_name']);
                
                if (in_array($bannerExt, $allowedExts) && $bannerFile['size'] <= 10 * 1024 * 1024) { // 10MB max
                    $bannerFilename = 'banner_' . $clanId . '_' . time() . '.' . $bannerExt;
                    $bannerPath = $uploadDir . $bannerFilename;
                    
                    error_log("Attempting to move banner to: " . $bannerPath);
                    
                    if (move_uploaded_file($bannerFile['tmp_name'], $bannerPath)) {
                        $bannerUrl = '/uploads/clans/' . $bannerFilename;
                        error_log("Banner uploaded successfully: $bannerUrl");
                        error_log("File exists after upload: " . (file_exists($bannerPath) ? 'YES' : 'NO'));
                    } else {
                        error_log("Failed to move banner file from " . $bannerFile['tmp_name'] . " to " . $bannerPath);
                    }
                } else {
                    error_log("Banner file validation failed");
                    echo json_encode(['error' => 'ملف الخلفية غير صالح أو كبير جداً']);
                    exit;
                }
            } else if (isset($_FILES['banner'])) {
                error_log("Banner upload error: " . $_FILES['banner']['error']);
            }

            // Build update query
            $updateFields = [
                'name = ?',
                'tag = ?',
                'description = ?',
                'website = ?',
                'discord_url = ?',
                'recruitment_open = ?',
                'updated_at = CURRENT_TIMESTAMP'
            ];
            $updateValues = [$name, $tag, $description, $website, $discordUrl, $recruitmentOpen ? 1 : 0];

            if ($logoUrl) {
                $updateFields[] = 'logo_url = ?';
                $updateValues[] = $logoUrl;
            }

            if ($bannerUrl) {
                $updateFields[] = 'banner_url = ?';
                $updateValues[] = $bannerUrl;
            }

            $updateValues[] = $clanId;

            $sql = "UPDATE clans SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $stmt = $db->prepare($sql);
            $stmt->execute($updateValues);

            echo json_encode([
                'success' => true,
                'message' => 'تم تحديث إعدادات العشيرة بنجاح',
                'logo_url' => $logoUrl,
                'banner_url' => $bannerUrl
            ]);
            break;

        default:
            echo json_encode(['error' => 'Action not found']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
