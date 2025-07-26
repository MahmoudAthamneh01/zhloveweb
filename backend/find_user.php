<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db;charset=utf8mb4', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "البحث عن المستخدم: mah.athamnh@gmail.com" . PHP_EOL;
    
    // Find the user by email
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute(['mah.athamnh@gmail.com']);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "المستخدم موجود:" . PHP_EOL;
        echo "- ID: " . $user['id'] . PHP_EOL;
        echo "- اسم المستخدم: " . ($user['username'] ?? 'غير محدد') . PHP_EOL;
        echo "- البريد: " . $user['email'] . PHP_EOL;
        echo "- الدور: " . ($user['role'] ?? 'user') . PHP_EOL;
        echo "- الاسم الأول: " . ($user['first_name'] ?? 'غير محدد') . PHP_EOL;
        echo "- الاسم الأخير: " . ($user['last_name'] ?? 'غير محدد') . PHP_EOL;
        echo "- البلد: " . ($user['country'] ?? 'غير محدد') . PHP_EOL;
        echo "- النبذة: " . ($user['bio'] ?? 'غير محدد') . PHP_EOL;
        echo "- تاريخ الانشاء: " . ($user['created_at'] ?? 'غير محدد') . PHP_EOL;
        
        // Check posts and comments for this user
        $stmt = $pdo->prepare('SELECT COUNT(*) as count FROM forum_posts WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        $postCount = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "- عدد المنشورات: " . $postCount['count'] . PHP_EOL;
        
        $stmt = $pdo->prepare('SELECT COUNT(*) as count FROM forum_comments WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        $commentCount = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "- عدد التعليقات: " . $commentCount['count'] . PHP_EOL;
        
    } else {
        echo "المستخدم غير موجود في قاعدة البيانات!" . PHP_EOL;
        
        // Show all users
        echo PHP_EOL . "جميع المستخدمين في قاعدة البيانات:" . PHP_EOL;
        $stmt = $pdo->query('SELECT id, username, email FROM users');
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach($users as $u) {
            echo "- ID: " . $u['id'] . ", المستخدم: " . $u['username'] . ", البريد: " . $u['email'] . PHP_EOL;
        }
    }
    
} catch(Exception $e) {
    echo "خطأ: " . $e->getMessage() . PHP_EOL;
}
?>
