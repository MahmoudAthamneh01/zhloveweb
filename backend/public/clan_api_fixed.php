<?php
// Handle CORS first
header('Access-Control-Allow-Origin: http://localhost:4321');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

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

// JWT verification
function verifyJWT($token) {
    if (!$token) return null;
    
    $secret = 'your_secret_key';
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    
    list($header, $payload, $signature) = $parts;
    
    $expectedSignature = base64url_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
    if (!hash_equals($signature, $expectedSignature)) return null;
    
    $data = json_decode(base64url_decode($payload), true);
    if (!$data || $data['exp'] < time()) return null;
    
    return $data;
}

function base64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function getAuthUser() {
    $headers = getallheaders();
    $token = null;
    
    if (isset($headers['Authorization'])) {
        $token = str_replace('Bearer ', '', $headers['Authorization']);
    }
    
    $jwt_data = verifyJWT($token);
    if (!$jwt_data) return null;
    
    $db = getDB();
    if (!$db) return null;
    
    $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$jwt_data['user_id']]);
    return $stmt->fetch();
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
                echo json_encode(['error' => 'Unauthorized']);
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
                    'clan' => $clan,
                    'user_role' => $clan['role']
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'لست عضواً في أي عشيرة'
                ]);
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

        default:
            echo json_encode(['error' => 'Action not found']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
