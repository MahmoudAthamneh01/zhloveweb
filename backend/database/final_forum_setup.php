<?php
// Final forum database setup without foreign key constraints

$host = 'localhost';
$username = 'root';
$password = '';
$database = 'zh_love_db';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$database;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to database successfully.\n";
    
    // Drop existing forum tables if they exist
    $dropTables = [
        'DROP TABLE IF EXISTS forum_likes',
        'DROP TABLE IF EXISTS forum_comments', 
        'DROP TABLE IF EXISTS forum_posts',
        'DROP TABLE IF EXISTS forum_categories'
    ];
    
    foreach ($dropTables as $sql) {
        $pdo->exec($sql);
        echo "Executed: $sql\n";
    }
    
    // Create forum_categories table
    $createCategories = "
    CREATE TABLE forum_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        color VARCHAR(7) DEFAULT '#4F9CF9',
        topic_count INT DEFAULT 0,
        comment_count INT DEFAULT 0,
        last_post_title VARCHAR(255),
        last_post_author VARCHAR(255),
        last_post_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    $pdo->exec($createCategories);
    echo "Created forum_categories table\n";
    
    // Create forum_posts table (without foreign key constraints)
    $createPosts = "
    CREATE TABLE forum_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author_id INT DEFAULT 1,
        author_username VARCHAR(255) DEFAULT 'مجهول',
        category_id INT DEFAULT 1,
        category_name VARCHAR(255) DEFAULT 'عام',
        category_color VARCHAR(7) DEFAULT '#4F9CF9',
        view_count INT DEFAULT 0,
        like_count INT DEFAULT 0,
        comment_count INT DEFAULT 0,
        is_pinned BOOLEAN DEFAULT FALSE,
        is_featured BOOLEAN DEFAULT FALSE,
        status ENUM('published', 'draft', 'archived') DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    $pdo->exec($createPosts);
    echo "Created forum_posts table\n";
    
    // Create forum_comments table (without foreign key constraints)
    $createComments = "
    CREATE TABLE forum_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        content TEXT NOT NULL,
        author_id INT DEFAULT 1,
        author_username VARCHAR(255) DEFAULT 'مجهول',
        like_count INT DEFAULT 0,
        parent_id INT NULL,
        status ENUM('published', 'hidden') DEFAULT 'published',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    $pdo->exec($createComments);
    echo "Created forum_comments table\n";
    
    // Create forum_likes table (without foreign key constraints)
    $createLikes = "
    CREATE TABLE forum_likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        post_id INT NULL,
        comment_id INT NULL,
        type ENUM('post', 'comment') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_like (user_id, post_id, comment_id, type)
    )";
    
    $pdo->exec($createLikes);
    echo "Created forum_likes table\n";
    
    // Insert sample categories
    $categories = [
        ['النقاشات العامة', 'نقاشات عامة حول اللعبة والمجتمع', '💬', '#4F9CF9'],
        ['الاستراتيجيات والتكتيكات', 'شارك استراتيجياتك وتعلم من الخبراء', '🎯', '#06D6A0'],
        ['البطولات والتحديات', 'أخبار البطولات والمنافسات', '🏆', '#FFD166'],
        ['المودز والخرائط', 'تحميل ومشاركة المودز والخرائط', '🗺️', '#F72585'],
        ['الدعم التقني', 'مساعدة في حل المشاكل التقنية', '🔧', '#FF6B6B'],
        ['العشائر والفرق', 'تنسيق العشائر والانضمام للفرق', '👥', '#9B59B6']
    ];
    
    $insertCat = $pdo->prepare("
        INSERT INTO forum_categories (name, description, icon, color, topic_count, comment_count) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    
    foreach ($categories as $cat) {
        $topicCount = rand(15, 95);
        $commentCount = rand(100, 600);
        $insertCat->execute([$cat[0], $cat[1], $cat[2], $cat[3], $topicCount, $commentCount]);
    }
    echo "Inserted sample categories\n";
    
    // Insert sample posts
    $posts = [
        [
            'الدليل الشامل للعب مع الولايات المتحدة في 2024',
            'دليل متكامل يغطي جميع استراتيجيات الولايات المتحدة مع أحدث التحديثات والتكتيكات المتقدمة للوصول لأعلى المستويات التنافسية. سنتحدث عن بناء القاعدة، اختيار الجنرالات، التكتيكات المختلفة في كل مرحلة من مراحل اللعب.\n\nسنغطي المواضيع التالية:\n1. إعداد القاعدة الأمثل\n2. ترتيبات الوحدات الهجومية\n3. الدفاع ضد الهجمات الجوية\n4. تكتيكات الحرب الاقتصادية\n\nهذا الدليل مناسب للاعبين من المستوى المتوسط إلى المتقدم.',
            1, 'سيد أمريكا', 2, 'الاستراتيجيات والتكتيكات', '#06D6A0', 1250, 45, 23, 1, 1
        ],
        [
            'بطولة الشرق الأوسط الكبرى - جوائز 5000$ 💰',
            'إعلان رسمي عن بطولة الشرق الأوسط الكبرى 2024 مع جوائز تصل إلى 5000 دولار والتسجيل مفتوح الآن لجميع اللاعبين من المنطقة. البطولة ستكون على مدار شهر كامل مع مباريات يومية.\n\nتفاصيل البطولة:\n- تاريخ البدء: 1 مارس 2024\n- المدة: شهر كامل\n- عدد المشاركين: 256 لاعب\n- نظام الإقصاء: مرحلة واحدة\n\nالتسجيل مجاني والمشاركة مفتوحة للجميع!',
            1, 'إدارة البطولات', 3, 'البطولات والتحديات', '#FFD166', 890, 67, 34, 1, 1
        ],
        [
            'أفضل الخرائط للعب الجماعي 2024',
            'مجموعة منتقاة من أفضل الخرائط للعب الجماعي مع الأصدقاء، تم اختبارها وتقييمها من قبل المجتمع. تشمل خرائط كلاسيكية ومعدلة جديدة.\n\nقائمة الخرائط المرشحة:\n1. Desert Storm Enhanced\n2. Urban Warfare 2024\n3. Mountain Strike\n4. Coastal Defense\n5. Industrial Complex\n\nكل خريطة تأتي مع وصف مفصل وإرشادات اللعب.',
            1, 'محبي الخرائط', 4, 'المودز والخرائط', '#F72585', 456, 32, 18, 0, 1
        ],
        [
            'حل مشكلة توقف اللعبة في ويندوز 11',
            'دليل شامل لحل جميع مشاكل التوافق مع ويندوز 11 وطرق تشغيل اللعبة بدون مشاكل. يتضمن إعدادات التوافق والباتشات المطلوبة.\n\nالخطوات:\n1. تحميل باتش التوافق\n2. تغيير إعدادات التوافق\n3. تشغيل اللعبة كمدير\n4. تعديل إعدادات الرسوميات\n\nالحل مضمون 100% للمشكلة.',
            1, 'الخبير التقني', 5, 'الدعم التقني', '#FF6B6B', 678, 28, 15, 0, 0
        ],
        [
            'تشكيل فريق جديد للبطولات - ابحث عن أعضاء',
            'أبحث عن لاعبين محترفين للانضمام لفريق جديد سيشارك في البطولات الدولية. المطلوب خبرة لا تقل عن 3 سنوات ومستوى عالي.\n\nالمتطلبات:\n- خبرة لا تقل عن 3 سنوات\n- مستوى تنافسي عالي\n- القدرة على اللعب في أوقات محددة\n- التواصل عبر Discord\n\nللتواصل: Discord أو رسالة خاصة',
            1, 'قائد الفريق', 6, 'العشائر والفرق', '#9B59B6', 234, 19, 12, 0, 0
        ],
        [
            'نصائح للمبتدئين في عالم الجنرالات',
            'مجموعة نصائح مهمة للاعبين الجدد تساعدهم على البدء بشكل صحيح وتجنب الأخطاء الشائعة. تشمل أساسيات اللعب واختيار الاستراتيجية المناسبة.\n\nالنصائح الأساسية:\n1. تعلم أساسيات بناء القاعدة\n2. اختر جنرال واحد وتخصص فيه\n3. تدرب على الخرائط الكلاسيكية\n4. شاهد المباريات التنافسية\n5. انضم لمجتمع اللاعبين\n\nالصبر والتمرين هما مفتاح النجاح!',
            1, 'معلم المبتدئين', 1, 'النقاشات العامة', '#4F9CF9', 523, 41, 27, 0, 0
        ],
        [
            'تحديث جديد: إضافات رائعة للعبة!',
            'إعلان عن التحديث الجديد للعبة مع إضافات مثيرة ووحدات جديدة وتحسينات في التوازن. التحديث متاح الآن للتحميل.\n\nما الجديد:\n- 3 وحدات جديدة\n- تحسينات في التوازن\n- خرائط إضافية\n- إصلاح الأخطاء\n\nحجم التحديث: 2.5 GB',
            1, 'أخبار اللعبة', 1, 'النقاشات العامة', '#4F9CF9', 789, 52, 31, 1, 0
        ],
        [
            'استراتيجية الصين المتقدمة - تكتيكات الهجوم السريع',
            'دليل متخصص للعب بالصين مع التركيز على تكتيكات الهجوم السريع والهجمات المفاجئة. مناسب للاعبين المتقدمين.\n\nالتكتيكات المغطاة:\n- الهجوم بالدبابات السريعة\n- تكتيكات الطيران\n- الحرب النووية\n- السيطرة على الموارد\n\nمع أمثلة عملية ومقاطع فيديو توضيحية.',
            1, 'خبير الصين', 2, 'الاستراتيجيات والتكتيكات', '#06D6A0', 345, 29, 16, 0, 1
        ]
    ];
    
    $insertPost = $pdo->prepare("
        INSERT INTO forum_posts (title, content, author_id, author_username, category_id, category_name, category_color, view_count, like_count, comment_count, is_pinned, is_featured) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    foreach ($posts as $post) {
        $insertPost->execute($post);
    }
    echo "Inserted sample posts\n";
    
    // Insert sample comments
    $comments = [
        [1, 'شكراً لك على هذا الدليل الرائع! مفيد جداً للاعبين الجدد مع أمريكا', 1, 'لاعب متحمس', 3],
        [1, 'هل يمكنك إضافة قسم عن التعامل مع الهجمات الجوية؟', 1, 'طيار ماهر', 1],
        [1, 'جربت الاستراتيجية وهي فعالة جداً! شكراً', 1, 'مجرب الاستراتيجيات', 5],
        [2, 'متى سيبدأ التسجيل؟ ومتى الموعد النهائي؟', 1, 'مشارك محتمل', 2],
        [2, 'الجوائز ممتازة! سأشارك بالتأكيد', 1, 'بطل سابق', 5],
        [2, 'هل هناك قيود على المشاركة؟', 1, 'سائل', 1],
        [3, 'جربت الخريطة الأولى وهي رائعة للعب 4v4', 1, 'محبي الجماعي', 4],
        [3, 'هل هناك خرائط للعب الفردي أيضاً؟', 1, 'لاعب منفرد', 2],
        [4, 'طريقة ممتازة، حلت المشكلة عندي فوراً!', 1, 'مستخدم مشكور', 8],
        [4, 'جربت الحل ولم يعمل معي، هل هناك طريقة أخرى؟', 1, 'محتاج مساعدة', 0],
        [5, 'أنا مهتم! كيف يمكنني التواصل معك؟', 1, 'لاعب طموح', 3],
        [6, 'نصائح مفيدة جداً، شكراً لك!', 1, 'مبتدئ شاكر', 6],
        [7, 'متحمس للتحديث الجديد! متى سيكون متاحاً؟', 1, 'منتظر التحديث', 4],
        [8, 'استراتيجية رائعة! هل تعمل ضد جميع الجنرالات؟', 1, 'محلل تكتيكي', 2]
    ];
    
    $insertComment = $pdo->prepare("
        INSERT INTO forum_comments (post_id, content, author_id, author_username, like_count) 
        VALUES (?, ?, ?, ?, ?)
    ");
    
    foreach ($comments as $comment) {
        $insertComment->execute($comment);
    }
    echo "Inserted sample comments\n";
    
    echo "\n✅ Forum database setup completed successfully!\n";
    echo "Tables created:\n";
    echo "- forum_categories (6 sample categories)\n";
    echo "- forum_posts (8 sample posts)\n"; 
    echo "- forum_comments (14 sample comments)\n";
    echo "- forum_likes (structure ready)\n";
    
    echo "\n🔗 Forum API endpoints:\n";
    echo "- GET categories: http://localhost:8080/forum_api.php?action=get_categories\n";
    echo "- GET posts: http://localhost:8080/forum_api.php?action=get_posts\n";
    echo "- GET stats: http://localhost:8080/forum_api.php?action=get_stats\n";
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
