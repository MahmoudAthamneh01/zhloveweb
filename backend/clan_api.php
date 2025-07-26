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
$path = $_SERVER['REQUEST_URI'];

// Parse action from URL
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'user_clan':
            // Get current user's clan
            $user = getAuthUser();
            if (!$user) {
                echo json_encode(['error' => 'Unauthorized']);
                exit;
            }
            
            // Check if user owns a clan
            $stmt = $db->prepare("
                SELECT c.*, 'leader' as user_role, u.username as owner_username
                FROM clans c 
                JOIN users u ON c.owner_id = u.id
                WHERE c.owner_id = ? AND c.is_active = 1 AND c.is_approved = 1
            ");
            $stmt->execute([$user['user_id']]);
            $clan = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$clan) {
                // Check if user is a member
                $stmt = $db->prepare("
                    SELECT c.*, cm.role as user_role, u.username as owner_username
                    FROM clans c 
                    JOIN clan_members cm ON c.id = cm.clan_id 
                    JOIN users u ON c.owner_id = u.id
                    WHERE cm.user_id = ? AND c.is_active = 1 AND c.is_approved = 1
                ");
                $stmt->execute([$user['user_id']]);
                $clan = $stmt->fetch(PDO::FETCH_ASSOC);
            }
            
            if ($clan) {
                // Get clan members
                $stmt = $db->prepare("
                    SELECT cm.*, u.username, u.first_name, u.last_name, u.level, u.avatar
                    FROM clan_members cm 
                    JOIN users u ON cm.user_id = u.id 
                    WHERE cm.clan_id = ?
                    ORDER BY 
                        CASE cm.role 
                            WHEN 'leader' THEN 1 
                            WHEN 'officer' THEN 2 
                            ELSE 3 
                        END, cm.joined_at
                ");
                $stmt->execute([$clan['id']]);
                $members = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $clan['members'] = $members;
                $clan['total_members'] = count($members);
                
                echo json_encode([
                    'success' => true,
                    'clan' => $clan,
                    'user_role' => $clan['user_role']
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'لست عضواً في أي عشيرة'
                ]);
            }
            break;
            
        case 'all_clans':
            // Get all approved clans
            $stmt = $db->prepare("
                SELECT c.*, u.username as owner_username,
                    (SELECT COUNT(*) FROM clan_members WHERE clan_id = c.id) as total_members
                FROM clans c 
                JOIN users u ON c.owner_id = u.id
                WHERE c.is_active = 1 AND c.is_approved = 1
                ORDER BY c.total_points DESC, c.level DESC
            ");
            $stmt->execute();
            $clans = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'clans' => $clans
            ]);
            break;
            
        case 'clan_wars':
            // Get clan wars for user's clan
            $user = getAuthUser();
            if (!$user) {
                echo json_encode(['error' => 'Unauthorized']);
                exit;
            }
            
            // Get user's clan ID
            $stmt = $db->prepare("
                SELECT clan_id FROM clan_members WHERE user_id = ?
                UNION
                SELECT id as clan_id FROM clans WHERE owner_id = ?
            ");
            $stmt->execute([$user['user_id'], $user['user_id']]);
            $userClan = $stmt->fetch();
            
            if (!$userClan) {
                echo json_encode(['error' => 'User not in any clan']);
                exit;
            }
            
            $clanId = $userClan['clan_id'];
            
            // Get clan wars
            $stmt = $db->prepare("
                SELECT cw.*, 
                    c1.name as challenger_name, c1.tag as challenger_tag,
                    c2.name as challenged_name, c2.tag as challenged_tag
                FROM clan_wars cw
                JOIN clans c1 ON cw.challenger_clan_id = c1.id
                JOIN clans c2 ON cw.challenged_clan_id = c2.id
                WHERE cw.challenger_clan_id = ? OR cw.challenged_clan_id = ?
                ORDER BY cw.created_at DESC
            ");
            $stmt->execute([$clanId, $clanId]);
            $wars = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'wars' => $wars,
                'user_clan_id' => $clanId
            ]);
            break;
            
        case 'join_clan':
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
            $clanId = $input['clan_id'] ?? 0;
            $motivation = trim($input['motivation'] ?? '');
            
            if (!$clanId || !$motivation) {
                echo json_encode(['error' => 'معرف العشيرة والدافع مطلوبان']);
                exit;
            }
            
            // Check if user already in a clan
            $stmt = $db->prepare("
                SELECT c.name FROM clan_members cm 
                JOIN clans c ON cm.clan_id = c.id 
                WHERE cm.user_id = ?
                UNION
                SELECT name FROM clans WHERE owner_id = ?
            ");
            $stmt->execute([$user['user_id'], $user['user_id']]);
            if ($stmt->fetch()) {
                echo json_encode(['error' => 'أنت عضو في عشيرة أخرى بالفعل']);
                exit;
            }
            
            // Get user and clan info
            $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$user['user_id']]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $stmt = $db->prepare("SELECT * FROM clans WHERE id = ? AND is_active = 1 AND is_approved = 1");
            $stmt->execute([$clanId]);
            $clan = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$clan) {
                echo json_encode(['error' => 'العشيرة غير موجودة']);
                exit;
            }
            
            // Create join application
            $stmt = $db->prepare("
                INSERT INTO clan_join_applications 
                (clan_id, user_id, player_name, player_level, win_rate, motivation) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            
            $playerName = trim($userData['first_name'] . ' ' . ($userData['last_name'] ?? ''));
            
            $stmt->execute([
                $clanId,
                $user['user_id'],
                $playerName,
                $userData['level'] ?? 1,
                $userData['win_rate'] ?? 0,
                $motivation
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'تم إرسال طلب الانضمام بنجاح'
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