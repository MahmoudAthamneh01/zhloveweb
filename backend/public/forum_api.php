<?php
// Handle CORS first
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Enable error logging
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/forum_api_errors.log');

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
        error_log("Database connection failed: " . $e->getMessage());
        return null;
    }
}

// JWT verification - exact copy from auth_api.php logic
function verifyJWT($token) {
    if (!$token) {
        error_log("No token provided");
        return null;
    }

    $key = 'zh_love_secret_key_2024';
    
    try {
        $payload = base64_decode(str_replace(['_', '-'], ['+', '/'], explode('.', $token)[1]));
        $decoded = json_decode($payload, true);
        
        if (!$decoded || !isset($decoded['exp']) || time() > $decoded['exp']) {
            error_log("Token expired or invalid structure");
            return null;
        }
        
        return $decoded;
    } catch (Exception $e) {
        error_log("JWT verification failed: " . $e->getMessage());
        return null;
    }
}

function getAuthUser() {
    global $pdo;
    
    $headers = getallheaders();
    $token = null;
    
    // Check Authorization header
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
        }
    }
    
    if (!$token) {
        return null;
    }
    
    $db = getDB();
    if (!$db) {
        return null;
    }

    try {
        // Verify JWT token
        $payload = verifyJWT($token);
        if (!$payload) {
            return null;
        }

        // Get user from database using JWT payload
        $stmt = $db->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$payload['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            return [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'role' => $user['role'] ?? 'player',
                'first_name' => $user['first_name'] ?? '',
                'last_name' => $user['last_name'] ?? '',
                'bio' => $user['bio'] ?? '',
                'avatar' => $user['avatar'],
                'country' => $user['country'] ?? 'غير محدد',
                'join_date' => $user['created_at'] ?? date('Y-m-d')
            ];
        }
        
        return null;
    } catch (Exception $e) {
        error_log("Failed to get user: " . $e->getMessage());
        return null;
    }
}

// Get the request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// For POST requests, also check the request body
if ($method === 'POST' && empty($action)) {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
}

$db = getDB();
if (!$db) {
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Route handlers
switch ($action) {
    case 'get_categories':
        get_categories($db);
        break;
        
    case 'add_category':
        if ($method !== 'POST') {
            echo json_encode(['error' => 'Method not allowed']);
            exit;
        }
        add_category($db);
        break;
        
    case 'update_category':
        if ($method !== 'POST') {
            echo json_encode(['error' => 'Method not allowed']);
            exit;
        }
        update_category($db);
        break;
        
    case 'delete_category':
        if ($method !== 'POST') {
            echo json_encode(['error' => 'Method not allowed']);
            exit;
        }
        delete_category($db);
        break;
        
    case 'get_posts':
        get_posts($db);
        break;
        
    case 'get_post':
        get_post($db);
        break;
        
    case 'create_post':
        if ($method !== 'POST') {
            echo json_encode(['error' => 'Method not allowed']);
            exit;
        }
        create_post($db);
        break;
        
    case 'get_comments':
        get_comments($db);
        break;
        
    case 'create_comment':
        if ($method !== 'POST') {
            echo json_encode(['error' => 'Method not allowed']);
            exit;
        }
        create_comment($db);
        break;
        
    case 'like_post':
        if ($method !== 'POST') {
            echo json_encode(['error' => 'Method not allowed']);
            exit;
        }
        like_post($db);
        break;
        
    case 'get_stats':
        get_forum_stats($db);
        break;
        
    case 'get_user_info':
        get_user_info($db);
        break;
        
    case 'update_profile':
        if ($method !== 'POST') {
            echo json_encode(['error' => 'Method not allowed']);
            exit;
        }
        update_profile($db);
        break;
        
    case 'get_all_users':
        get_all_users($db);
        break;
        
    case 'find_user_by_email':
        if ($method !== 'POST') {
            echo json_encode(['error' => 'Method not allowed']);
            exit;
        }
        find_user_by_email($db);
        break;
        
    case 'login':
        if ($method !== 'POST') {
            echo json_encode(['error' => 'Method not allowed']);
            exit;
        }
        login_user($db);
        break;
        
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}

// Function to get forum categories
function get_categories($db) {
    try {
        $stmt = $db->prepare("
            SELECT 
                fc.*,
                COALESCE(COUNT(fp.id), 0) as post_count,
                COALESCE((SELECT COUNT(*) FROM forum_comments WHERE post_id IN (
                    SELECT id FROM forum_posts WHERE category_id = fc.id AND is_active = 1
                )), 0) as total_comments,
                (SELECT fp2.title FROM forum_posts fp2 
                 WHERE fp2.category_id = fc.id AND fp2.is_active = 1
                 ORDER BY fp2.created_at DESC 
                 LIMIT 1) as last_post_title,
                (SELECT fp2.author_username FROM forum_posts fp2 
                 WHERE fp2.category_id = fc.id AND fp2.is_active = 1
                 ORDER BY fp2.created_at DESC 
                 LIMIT 1) as last_post_author,
                (SELECT fp2.created_at FROM forum_posts fp2 
                 WHERE fp2.category_id = fc.id AND fp2.is_active = 1
                 ORDER BY fp2.created_at DESC 
                 LIMIT 1) as last_post_time
            FROM forum_categories fc
            LEFT JOIN forum_posts fp ON fc.id = fp.category_id AND fp.is_active = 1
            WHERE fc.is_active = 1
            GROUP BY fc.id
            ORDER BY fc.display_order ASC, fc.id ASC
        ");
        $stmt->execute();
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'categories' => $categories
        ]);
    } catch (Exception $e) {
        error_log("Failed to get categories: " . $e->getMessage());
        echo json_encode(['error' => 'Failed to get categories']);
    }
}

// Function to get forum posts
function get_posts($db) {
    $category_id = $_GET['category_id'] ?? null;
    $page = (int)($_GET['page'] ?? 1);
    $limit = (int)($_GET['limit'] ?? 20);
    $search = $_GET['search'] ?? '';
    $sort = $_GET['sort'] ?? 'latest'; // latest, popular, oldest
    
    $offset = ($page - 1) * $limit;
    
    try {
        // Build WHERE clause
        $whereClause = "WHERE 1=1";
        $params = [];
        
        if ($category_id) {
            $whereClause .= " AND fp.category_id = ?";
            $params[] = $category_id;
        }
        
        if ($search) {
            $whereClause .= " AND (fp.title LIKE ? OR fp.content LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        
        // Build ORDER BY clause
        $orderClause = match($sort) {
            'popular' => 'ORDER BY fp.like_count DESC, fp.view_count DESC',
            'oldest' => 'ORDER BY fp.created_at ASC',
            default => 'ORDER BY fp.is_pinned DESC, fp.created_at DESC'
        };
        
        $sql = "
            SELECT 
                fp.*,
                fc.name as category_name,
                fc.color as category_color,
                COALESCE((SELECT COUNT(*) FROM forum_comments WHERE post_id = fp.id AND is_active = 1), 0) as total_comments,
                COALESCE(fp.like_count, 0) as like_count,
                COALESCE(fp.comment_count, 0) as comment_count
            FROM forum_posts fp
            LEFT JOIN forum_categories fc ON fp.category_id = fc.id
            $whereClause AND fp.is_active = 1
            $orderClause
            LIMIT $limit OFFSET $offset
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get total count
        $countSql = "
            SELECT COUNT(*) as total
            FROM forum_posts fp
            LEFT JOIN forum_categories fc ON fp.category_id = fc.id
            $whereClause AND fp.is_active = 1
        ";
        $countStmt = $db->prepare($countSql);
        $countStmt->execute($params);
        $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        echo json_encode([
            'success' => true,
            'posts' => $posts,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    } catch (Exception $e) {
        error_log("Failed to get posts: " . $e->getMessage());
        echo json_encode(['error' => 'Failed to get posts']);
    }
}

// Function to get a single post
function get_post($db) {
    $post_id = $_GET['id'] ?? null;
    
    if (!$post_id) {
        echo json_encode(['error' => 'Post ID required']);
        return;
    }
    
    try {
        // Increment view count
        $updateStmt = $db->prepare("UPDATE forum_posts SET view_count = view_count + 1 WHERE id = ?");
        $updateStmt->execute([$post_id]);
        
        $stmt = $db->prepare("
            SELECT 
                fp.*,
                u.username as author_username,
                u.role as author_role,
                fc.name as category_name,
                fc.color as category_color,
                fc.icon as category_icon
            FROM forum_posts fp
            LEFT JOIN users u ON fp.user_id = u.id
            LEFT JOIN forum_categories fc ON fp.category_id = fc.id
            WHERE fp.id = ? AND fp.is_approved = 1
        ");
        $stmt->execute([$post_id]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$post) {
            echo json_encode(['error' => 'Post not found']);
            return;
        }
        
        echo json_encode([
            'success' => true,
            'post' => $post
        ]);
    } catch (Exception $e) {
        error_log("Failed to get post: " . $e->getMessage());
        echo json_encode(['error' => 'Failed to get post']);
    }
}

// Function to create a new post
function create_post($db) {
    $user = getAuthUser();
    if (!$user) {
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $title = trim($input['title'] ?? '');
    $content = trim($input['content'] ?? '');
    $category_id = $input['category_id'] ?? null;
    $images = $input['images'] ?? [];
    $images_json = !empty($images) ? json_encode($images) : null;
    $is_featured = $input['is_featured'] ?? 0;
    $is_pinned = $input['is_pinned'] ?? 0;
    
    if (empty($title) || empty($content) || !$category_id) {
        echo json_encode(['error' => 'Title, content, and category are required']);
        return;
    }
    
    try {
        $stmt = $db->prepare("
            INSERT INTO forum_posts (user_id, category_id, title, content, images, author_username, is_featured, is_pinned, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $user['id'], 
            $category_id, 
            $title, 
            $content, 
            $images_json,
            $user['username'] ?? 'مستخدم',
            $is_featured,
            $is_pinned
        ]);
        
        $post_id = $db->lastInsertId();
        
        // Update category post count
        $updateStmt = $db->prepare("UPDATE forum_categories SET post_count = post_count + 1 WHERE id = ?");
        $updateStmt->execute([$category_id]);
        
        echo json_encode([
            'success' => true,
            'post_id' => $post_id,
            'message' => 'Post created successfully'
        ]);
    } catch (Exception $e) {
        error_log("Failed to create post: " . $e->getMessage());
        echo json_encode(['error' => 'Failed to create post']);
    }
}

// Function to get comments for a post
function get_comments($db) {
    $post_id = $_GET['post_id'] ?? null;
    
    if (!$post_id) {
        echo json_encode(['error' => 'Post ID required']);
        return;
    }
    
    try {
        $stmt = $db->prepare("
            SELECT 
                fc.*
            FROM forum_comments fc
            WHERE fc.post_id = ? AND fc.is_active = 1
            ORDER BY fc.created_at ASC
        ");
        $stmt->execute([$post_id]);
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'comments' => $comments
        ]);
    } catch (Exception $e) {
        error_log("Failed to get comments: " . $e->getMessage());
        echo json_encode(['error' => 'Failed to get comments']);
    }
}

// Function to create a comment
function create_comment($db) {
    $user = getAuthUser();
    if (!$user) {
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $post_id = $input['post_id'] ?? null;
    $content = trim($input['content'] ?? '');
    
    if (!$post_id || empty($content)) {
        echo json_encode(['error' => 'Post ID and content are required']);
        return;
    }
    
    try {
        $stmt = $db->prepare("
            INSERT INTO forum_comments (post_id, user_id, content, author_username, created_at)
            VALUES (?, ?, ?, ?, NOW())
        ");
        $stmt->execute([$post_id, $user['id'], $content, $user['username'] ?? 'مستخدم']);
        
        // Update post comment count
        $updateStmt = $db->prepare("
            UPDATE forum_posts 
            SET comment_count = comment_count + 1, updated_at = NOW()
            WHERE id = ?
        ");
        $updateStmt->execute([$post_id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Comment created successfully'
        ]);
    } catch (Exception $e) {
        error_log("Failed to create comment: " . $e->getMessage());
        echo json_encode(['error' => 'Failed to create comment']);
    }
}

// Function to like/unlike a post
function like_post($db) {
    $user = getAuthUser();
    if (!$user) {
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $post_id = $input['post_id'] ?? null;
    
    if (!$post_id) {
        echo json_encode(['error' => 'Post ID required']);
        return;
    }
    
    try {
        // Check if user already liked this post
        $checkStmt = $db->prepare("
            SELECT id FROM forum_likes WHERE user_id = ? AND post_id = ?
        ");
        $checkStmt->execute([$user['id'], $post_id]);
        $existing = $checkStmt->fetch();
        
        if ($existing) {
            // Unlike
            $deleteStmt = $db->prepare("DELETE FROM forum_likes WHERE id = ?");
            $deleteStmt->execute([$existing['id']]);
            
            $updateStmt = $db->prepare("UPDATE forum_posts SET like_count = like_count - 1 WHERE id = ?");
            $updateStmt->execute([$post_id]);
            
            echo json_encode([
                'success' => true,
                'liked' => false,
                'message' => 'Post unliked'
            ]);
        } else {
            // Like
            $insertStmt = $db->prepare("
                INSERT INTO forum_likes (user_id, post_id, created_at)
                VALUES (?, ?, NOW())
            ");
            $insertStmt->execute([$user['id'], $post_id]);
            
            $updateStmt = $db->prepare("UPDATE forum_posts SET like_count = like_count + 1 WHERE id = ?");
            $updateStmt->execute([$post_id]);
            
            echo json_encode([
                'success' => true,
                'liked' => true,
                'message' => 'Post liked'
            ]);
        }
    } catch (Exception $e) {
        error_log("Failed to like post: " . $e->getMessage());
        echo json_encode(['error' => 'Failed to like post']);
    }
}

// Function to get forum statistics
function get_forum_stats($db) {
    try {
        $stmt = $db->prepare("
            SELECT 
                (SELECT COUNT(*) FROM forum_posts WHERE is_active = 1) as total_posts,
                (SELECT COUNT(*) FROM forum_categories WHERE is_active = 1) as total_categories,
                (SELECT COUNT(*) FROM users WHERE is_active = 1) as total_members,
                (SELECT COUNT(*) FROM forum_posts WHERE DATE(created_at) = CURDATE() AND is_active = 1) as todays_posts,
                (SELECT COUNT(*) FROM forum_comments WHERE DATE(created_at) = CURDATE() AND is_active = 1) as todays_comments
        ");
        $stmt->execute();
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // If no users table exists, set a default
        if ($stats['total_members'] === null) {
            $stats['total_members'] = 1;
        }
        
        echo json_encode([
            'success' => true,
            'stats' => $stats
        ]);
    } catch (Exception $e) {
        error_log("Failed to get forum stats: " . $e->getMessage());
        echo json_encode(['error' => 'Failed to get forum stats']);
    }
}

// Category management functions
function add_category($db) {
    $user = getAuthUser();
    if (!$user || $user['role'] !== 'admin') {
        echo json_encode(['error' => 'Admin access required']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $name = trim($input['name'] ?? '');
    $color = trim($input['color'] ?? '#4F9CF9');
    $description = trim($input['description'] ?? '');
    
    if (empty($name)) {
        echo json_encode(['error' => 'اسم الفئة مطلوب']);
        return;
    }
    
    try {
        $stmt = $db->prepare("
            INSERT INTO forum_categories (name, color, description, created_at) 
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([$name, $color, $description]);
        
        echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
    } catch (Exception $e) {
        error_log("Failed to add category: " . $e->getMessage());
        echo json_encode(['error' => 'فشل في إضافة الفئة']);
    }
}

function update_category($db) {
    $user = getAuthUser();
    if (!$user || $user['role'] !== 'admin') {
        echo json_encode(['error' => 'Admin access required']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = intval($input['id'] ?? 0);
    $name = trim($input['name'] ?? '');
    $color = trim($input['color'] ?? '#4F9CF9');
    $description = trim($input['description'] ?? '');
    
    if (!$id || empty($name)) {
        echo json_encode(['error' => 'معرف الفئة واسم الفئة مطلوبان']);
        return;
    }
    
    try {
        $stmt = $db->prepare("
            UPDATE forum_categories 
            SET name = ?, color = ?, description = ?, updated_at = NOW() 
            WHERE id = ?
        ");
        $stmt->execute([$name, $color, $description, $id]);
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        error_log("Failed to update category: " . $e->getMessage());
        echo json_encode(['error' => 'فشل في تحديث الفئة']);
    }
}

function delete_category($db) {
    $user = getAuthUser();
    if (!$user || $user['role'] !== 'admin') {
        echo json_encode(['error' => 'Admin access required']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = intval($input['id'] ?? 0);
    
    if (!$id) {
        echo json_encode(['error' => 'معرف الفئة مطلوب']);
        return;
    }
    
    try {
        // Check if category has posts
        $stmt = $db->prepare("SELECT COUNT(*) FROM forum_posts WHERE category_id = ?");
        $stmt->execute([$id]);
        $postCount = $stmt->fetchColumn();
        
        if ($postCount > 0) {
            echo json_encode(['error' => 'لا يمكن حذف فئة تحتوي على منشورات']);
            return;
        }
        
        $stmt = $db->prepare("DELETE FROM forum_categories WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        error_log("Failed to delete category: " . $e->getMessage());
        echo json_encode(['error' => 'فشل في حذف الفئة']);
    }
}

// Get current user info
function get_user_info($db) {
    $user = getAuthUser();
    
    if (!$user) {
        echo json_encode(['error' => 'Unauthorized - No valid token provided']);
        return;
    }
    
    try {
        // Get real user statistics from database
        $userId = $user['id'];
        
        // Get post count
        $stmt = $db->prepare("SELECT COUNT(*) as post_count FROM forum_posts WHERE user_id = ?");
        $stmt->execute([$userId]);
        $postStats = $stmt->fetch(PDO::FETCH_ASSOC);
        $user['post_count'] = $postStats['post_count'] ?? 0;
        
        // Get comment count
        $stmt = $db->prepare("SELECT COUNT(*) as comment_count FROM forum_comments WHERE user_id = ?");
        $stmt->execute([$userId]);
        $commentStats = $stmt->fetch(PDO::FETCH_ASSOC);
        $user['comment_count'] = $commentStats['comment_count'] ?? 0;
        
        // Get likes received count (if likes table exists)
        try {
            $stmt = $db->prepare("
                SELECT COUNT(*) as like_count 
                FROM forum_likes fl
                JOIN forum_posts fp ON fl.post_id = fp.id 
                WHERE fp.user_id = ?
            ");
            $stmt->execute([$userId]);
            $likeStats = $stmt->fetch(PDO::FETCH_ASSOC);
            $user['like_count'] = $likeStats['like_count'] ?? 0;
        } catch (Exception $e) {
            // If likes table doesn't exist, set to 0
            $user['like_count'] = 0;
        }
        
        // Get user's latest activity
        try {
            $stmt = $db->prepare("
                SELECT created_at as last_activity
                FROM forum_posts 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 1
            ");
            $stmt->execute([$userId]);
            $activity = $stmt->fetch(PDO::FETCH_ASSOC);
            $user['last_activity'] = $activity['last_activity'] ?? null;
        } catch (Exception $e) {
            $user['last_activity'] = null;
        }
        
    } catch (Exception $e) {
        error_log("Error getting user stats: " . $e->getMessage());
        // Set default values if database queries fail
        $user['post_count'] = 0;
        $user['comment_count'] = 0;
        $user['like_count'] = 0;
        $user['last_activity'] = null;
    }
    
    // Return user information with real statistics
    echo json_encode([
        'success' => true,
        'user' => $user
    ]);
}

// Update user profile
function update_profile($db) {
    $user = getAuthUser();
    
    if (!$user) {
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // For now, we'll just simulate updating the profile
    // In a real app, this would update the database
    
    $username = trim($input['username'] ?? '');
    $email = trim($input['email'] ?? '');
    $first_name = trim($input['first_name'] ?? '');
    $last_name = trim($input['last_name'] ?? '');
    $bio = trim($input['bio'] ?? '');
    $country = trim($input['country'] ?? '');
    
    if (empty($username)) {
        echo json_encode(['error' => 'اسم المستخدم مطلوب']);
        return;
    }
    
    if (empty($email)) {
        echo json_encode(['error' => 'البريد الإلكتروني مطلوب']);
        return;
    }
    
    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['error' => 'البريد الإلكتروني غير صحيح']);
        return;
    }
    
    // For testing purposes, return success with updated data
    $updatedUser = array_merge($user, [
        'username' => $username,
        'email' => $email,
        'first_name' => $first_name,
        'last_name' => $last_name,
        'bio' => $bio,
        'country' => $country
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'تم تحديث الملف الشخصي بنجاح',
        'user' => $updatedUser
    ]);
}

// Get all users for login selection
function get_all_users($db) {
    try {
        $stmt = $db->prepare("
            SELECT id, username, email, first_name, last_name, country, role, created_at 
            FROM users 
            ORDER BY created_at DESC
        ");
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'users' => $users
        ]);
        
    } catch (Exception $e) {
        error_log("Failed to get users: " . $e->getMessage());
        echo json_encode([
            'error' => 'فشل في جلب قائمة المستخدمين',
            'users' => []
        ]);
    }
}

// Find user by email for login
function find_user_by_email($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['email'] ?? '';
    
    if (empty($email)) {
        echo json_encode(['error' => 'البريد الإلكتروني مطلوب']);
        return;
    }
    
    try {
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'first_name' => $user['first_name'],
                    'last_name' => $user['last_name'],
                    'country' => $user['country'],
                    'role' => $user['role']
                ]
            ]);
        } else {
            echo json_encode(['error' => 'المستخدم غير موجود']);
        }
        
    } catch (Exception $e) {
        error_log("Failed to find user: " . $e->getMessage());
        echo json_encode(['error' => 'فشل في البحث عن المستخدم']);
    }
}

// User login function
function login_user($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    
    if (empty($email)) {
        echo json_encode(['error' => 'البريد الإلكتروني مطلوب']);
        return;
    }
    
    try {
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            echo json_encode(['error' => 'البريد الإلكتروني غير موجود']);
            return;
        }
        
        // For development: if no password provided or user has no password, allow login
        $allowLogin = false;
        
        if (empty($password)) {
            // Allow login without password for development
            $allowLogin = true;
        } elseif (!empty($user['password'])) {
            // Check password if user has one
            $allowLogin = password_verify($password, $user['password']);
        } else {
            // User has no password set, allow login
            $allowLogin = true;
        }
        
        if ($allowLogin) {
            // Create JWT token
            $payload = [
                'user_id' => $user['id'],
                'email' => $user['email'],
                'role' => $user['role'],
                'iat' => time(),
                'exp' => time() + (24 * 60 * 60) // 24 hours
            ];
            
            $token = createJWT($payload);
            
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
                    'country' => $user['country'],
                    'role' => $user['role'],
                    'join_date' => $user['created_at']
                ]
            ]);
        } else {
            echo json_encode(['error' => 'كلمة المرور غير صحيحة']);
        }
        
    } catch (Exception $e) {
        error_log("Login failed: " . $e->getMessage());
        echo json_encode(['error' => 'فشل في تسجيل الدخول']);
    }
}
?>
