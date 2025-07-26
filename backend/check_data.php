<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db;charset=utf8mb4', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "قاعدة البيانات متصلة بنجاح!" . PHP_EOL;
    
    // Check users table
    $stmt = $pdo->query('SELECT COUNT(*) as count FROM users');
    $userCount = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "عدد المستخدمين: " . $userCount['count'] . PHP_EOL;
    
    // Show some users with all fields
    $stmt = $pdo->query('SELECT * FROM users LIMIT 3');
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "المستخدمون:" . PHP_EOL;
    foreach($users as $user) {
        echo "- ID: " . $user['id'] . PHP_EOL;
        echo "  اسم المستخدم: " . ($user['username'] ?? 'غير محدد') . PHP_EOL;
        echo "  البريد: " . ($user['email'] ?? 'غير محدد') . PHP_EOL;
        echo "  الدور: " . ($user['role'] ?? 'user') . PHP_EOL;
        echo "  الاسم الأول: " . ($user['first_name'] ?? 'غير محدد') . PHP_EOL;
        echo "  الاسم الأخير: " . ($user['last_name'] ?? 'غير محدد') . PHP_EOL;
        echo "  البلد: " . ($user['country'] ?? 'غير محدد') . PHP_EOL;
        echo "  النبذة: " . ($user['bio'] ?? 'غير محدد') . PHP_EOL;
        echo "  تاريخ الانشاء: " . ($user['created_at'] ?? 'غير محدد') . PHP_EOL;
        echo "---" . PHP_EOL;
    }
    
    // Check forum_posts table
    $stmt = $pdo->query('SELECT COUNT(*) as count FROM forum_posts');
    $postCount = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "عدد المنشورات: " . $postCount['count'] . PHP_EOL;
    
    // Check forum_comments table
    try {
        $stmt = $pdo->query('SELECT COUNT(*) as count FROM forum_comments');
        $commentCount = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "عدد التعليقات: " . $commentCount['count'] . PHP_EOL;
    } catch (Exception $e) {
        echo "جدول forum_comments غير موجود" . PHP_EOL;
    }
    
    // Show posts per user
    echo "منشورات كل مستخدم:" . PHP_EOL;
    $stmt = $pdo->query('
        SELECT u.username, COUNT(fp.id) as post_count 
        FROM users u 
        LEFT JOIN forum_posts fp ON u.id = fp.user_id 
        GROUP BY u.id, u.username
    ');
    $userPosts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach($userPosts as $userPost) {
        echo "- " . $userPost['username'] . ": " . $userPost['post_count'] . " منشور" . PHP_EOL;
    }
    
} catch(Exception $e) {
    echo "خطأ: " . $e->getMessage() . PHP_EOL;
}
?>
