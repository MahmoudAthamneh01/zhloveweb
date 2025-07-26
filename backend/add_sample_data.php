<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db;charset=utf8mb4', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "إضافة منشورات تجريبية..." . PHP_EOL;
    
    // Sample posts for different users
    $samplePosts = [
        [
            'user_id' => 1, // admin
            'title' => 'مرحباً بكم في منتدى زد اتش لوف',
            'content' => 'أهلاً وسهلاً بكم جميعاً في منتدانا الجديد! هنا يمكنكم مناقشة كل ما يتعلق بلعبة Command & Conquer ومشاركة التجارب والاستراتيجيات.',
            'category_id' => 1
        ],
        [
            'user_id' => 2, // zh_master
            'title' => 'أفضل استراتيجيات الجنرالز',
            'content' => 'بعد سنوات من اللعب، جمعت لكم أهم الاستراتيجيات للفوز في معارك الجنرالز. أولاً، التركيز على الاقتصاد...',
            'category_id' => 2
        ],
        [
            'user_id' => 3, // generals_pro
            'title' => 'نصائح للمبتدئين في Zero Hour',
            'content' => 'للاعبين الجدد في Zero Hour، إليكم بعض النصائح المهمة: ابدأوا بالتدريب ضد الكمبيوتر، تعلموا خصائص كل جنرال...',
            'category_id' => 3
        ],
        [
            'user_id' => 4, // tactical_gamer
            'title' => 'تحدي الأسبوع - معركة جماعية',
            'content' => 'نظم كلانا تحدي هذا الأسبوع! معركة 4 ضد 4 في خريطة الصحراء الكبيرة. الجوائز مميزة والمشاركة مفتوحة للجميع.',
            'category_id' => 4
        ],
        [
            'user_id' => 2, // zh_master (second post)
            'title' => 'مراجعة آخر تحديثات الموقع',
            'content' => 'التحديثات الجديدة رائعة! المنتدى أصبح أكثر تنظيماً وسهولة في الاستخدام. شكراً للإدارة على الجهود المبذولة.',
            'category_id' => 1
        ]
    ];
    
    foreach($samplePosts as $post) {
        $stmt = $pdo->prepare("
            INSERT INTO forum_posts (user_id, title, content, category_id, created_at) 
            VALUES (?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $post['user_id'], 
            $post['title'], 
            $post['content'], 
            $post['category_id']
        ]);
        echo "تم إضافة منشور: " . $post['title'] . PHP_EOL;
    }
    
    // Add some comments
    $sampleComments = [
        [
            'post_id' => 1,
            'user_id' => 3,
            'content' => 'مرحباً بك أيضاً! متحمس لاستخدام المنتدى الجديد.'
        ],
        [
            'post_id' => 2,
            'user_id' => 1,
            'content' => 'استراتيجيات ممتازة! هل يمكنك مشاركة المزيد عن التكتيكات الدفاعية؟'
        ],
        [
            'post_id' => 3,
            'user_id' => 2,
            'content' => 'نصائح مفيدة جداً، خاصة للاعبين الجدد.'
        ]
    ];
    
    foreach($sampleComments as $comment) {
        $stmt = $pdo->prepare("
            INSERT INTO forum_comments (post_id, user_id, content, created_at) 
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([
            $comment['post_id'], 
            $comment['user_id'], 
            $comment['content']
        ]);
        echo "تم إضافة تعليق على منشور " . $comment['post_id'] . PHP_EOL;
    }
    
    echo "تم الانتهاء من إضافة البيانات التجريبية!" . PHP_EOL;
    
    // Show updated statistics
    echo PHP_EOL . "الإحصائيات الجديدة:" . PHP_EOL;
    $stmt = $pdo->query('
        SELECT u.username, 
               COUNT(DISTINCT fp.id) as post_count,
               COUNT(DISTINCT fc.id) as comment_count
        FROM users u 
        LEFT JOIN forum_posts fp ON u.id = fp.user_id 
        LEFT JOIN forum_comments fc ON u.id = fc.user_id 
        WHERE u.id IN (1,2,3,4)
        GROUP BY u.id, u.username
    ');
    $userStats = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach($userStats as $stat) {
        echo "- " . $stat['username'] . ": " . $stat['post_count'] . " منشور، " . $stat['comment_count'] . " تعليق" . PHP_EOL;
    }
    
} catch(Exception $e) {
    echo "خطأ: " . $e->getMessage() . PHP_EOL;
}
?>
