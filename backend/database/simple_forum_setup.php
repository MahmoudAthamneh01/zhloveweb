<?php
// Create forum tables without foreign keys first

try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Creating forum database structure...\n";
    
    // Create forum_categories table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `forum_categories` (
          `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
          `name` varchar(100) NOT NULL,
          `description` text DEFAULT NULL,
          `icon` varchar(50) DEFAULT NULL,
          `color` varchar(7) DEFAULT NULL,
          `sort_order` int(11) DEFAULT 0,
          `is_active` tinyint(1) DEFAULT 1,
          `post_count` int(11) DEFAULT 0,
          `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
          `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✓ Created forum_categories table\n";
    
    // Create forum_posts table (no foreign keys)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `forum_posts` (
          `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
          `user_id` int(11) UNSIGNED NOT NULL,
          `category_id` int(11) UNSIGNED DEFAULT NULL,
          `title` varchar(200) NOT NULL,
          `content` longtext NOT NULL,
          `is_pinned` tinyint(1) DEFAULT 0,
          `is_locked` tinyint(1) DEFAULT 0,
          `is_featured` tinyint(1) DEFAULT 0,
          `is_approved` tinyint(1) DEFAULT 1,
          `like_count` int(11) DEFAULT 0,
          `dislike_count` int(11) DEFAULT 0,
          `comment_count` int(11) DEFAULT 0,
          `view_count` int(11) DEFAULT 0,
          `share_count` int(11) DEFAULT 0,
          `last_activity` timestamp DEFAULT CURRENT_TIMESTAMP,
          `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
          `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          KEY `user_id` (`user_id`),
          KEY `category_id` (`category_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✓ Created forum_posts table\n";
    
    // Create forum_comments table (no foreign keys)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `forum_comments` (
          `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
          `post_id` int(11) UNSIGNED NOT NULL,
          `user_id` int(11) UNSIGNED NOT NULL,
          `content` text NOT NULL,
          `like_count` int(11) DEFAULT 0,
          `dislike_count` int(11) DEFAULT 0,
          `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
          `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          KEY `post_id` (`post_id`),
          KEY `user_id` (`user_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✓ Created forum_comments table\n";
    
    // Create forum_likes table (no foreign keys)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `forum_likes` (
          `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
          `post_id` int(11) UNSIGNED NOT NULL,
          `user_id` int(11) UNSIGNED NOT NULL,
          `type` enum('like','dislike') NOT NULL DEFAULT 'like',
          `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          UNIQUE KEY `post_user_unique` (`post_id`, `user_id`),
          KEY `post_id` (`post_id`),
          KEY `user_id` (`user_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✓ Created forum_likes table\n";
    
    // Insert sample data
    echo "\nInserting sample data...\n";
    
    // Check if categories exist
    $stmt = $pdo->query("SELECT COUNT(*) FROM forum_categories");
    if ($stmt->fetchColumn() == 0) {
        // Categories
        $categories = [
            ['النقاشات العامة', 'نقاشات عامة حول اللعبة والمجتمع', '💬', '#4F9CF9', 1],
            ['الاستراتيجيات والتكتيكات', 'شارك استراتيجياتك وتعلم من الخبراء', '🎯', '#06D6A0', 2],
            ['البطولات والتحديات', 'أخبار البطولات والمنافسات', '🏆', '#FFD166', 3],
            ['المودز والخرائط', 'تحميل ومشاركة المودز والخرائط', '🗺️', '#F72585', 4],
            ['الدعم التقني', 'مساعدة في حل المشاكل التقنية', '🔧', '#FF6B6B', 5],
            ['مقاطع الفيديو والعروض', 'شارك مقاطع الفيديو والعروض الخاصة بك', '🎬', '#8B5CF6', 6]
        ];
        
        $stmt = $pdo->prepare("INSERT INTO forum_categories (name, description, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)");
        foreach ($categories as $cat) {
            $stmt->execute($cat);
        }
        echo "✓ Inserted forum categories\n";
    }
    
    // Check if posts exist
    $stmt = $pdo->query("SELECT COUNT(*) FROM forum_posts");
    if ($stmt->fetchColumn() == 0) {
        // Posts
        $posts = [
            [
                1, 2, 'الدليل الشامل للعب مع الولايات المتحدة في 2024', 
                '# الدليل الشامل للعب مع الولايات المتحدة 🇺🇸

## مقدمة
الولايات المتحدة من أقوى الفصائل في Command & Conquer: Generals Zero Hour، وتتميز بتقنياتها المتقدمة وقوتها الجوية الهائلة.

## الاستراتيجيات الأساسية

### 1. البناء السريع (Rush Build)
- ابدأ ببناء قاعدة طاقة إضافية فوراً
- اجمع الموارد بسرعة باستخدام الدوزر
- ركز على بناء مركز القيادة في أسرع وقت

### 2. السيطرة الجوية
- الطائرات الأمريكية من أقوى الأسلحة
- استخدم الكومانش للاستطلاع المبكر
- طائرات الرابتور للسيطرة الجوية', 
                1, 1, 45, 1250, '2024-02-15 10:30:00'
            ],
            [
                1, 3, 'بطولة الشرق الأوسط الكبرى - جوائز 5000$ 💰', 
                '# 🏆 بطولة الشرق الأوسط الكبرى 2024

## تفاصيل البطولة

**📅 التاريخ**: 15-17 مارس 2024  
**💰 إجمالي الجوائز**: 5000$ أمريكي  
**👥 عدد المشاركين**: 128 لاعب  
**🎮 نوع اللعب**: 1v1 فردي  

## توزيع الجوائز

- 🥇 **المركز الأول**: 2000$
- 🥈 **المركز الثاني**: 1200$
- 🥉 **المركز الثالث**: 800$', 
                1, 1, 67, 890, '2024-02-10 12:00:00'
            ],
            [
                1, 2, 'تكتيكات متقدمة مع GLA: فن الحرب الغير تقليدية', 
                '# 🏜️ تكتيكات GLA المتقدمة: فن الحرب الغير تقليدية

## مقدمة عن GLA

جيش التحرير العالمي (GLA) يعتمد على الحرب غير التقليدية والتكتيكات الخاطفة. رغم ضعف التقنيات، لكن المرونة والإبداع يمكن أن يحققا انتصارات مذهلة!', 
                0, 1, 32, 675, '2024-02-12 09:15:00'
            ],
            [
                1, 5, 'حل مشكلة انقطاع الاتصال في الألعاب المتعددة', 
                '# 🔧 حل مشكلة انقطاع الاتصال في الألعاب المتعددة

## وصف المشكلة

كثير من اللاعبين يواجهون مشكلة انقطاع الاتصال أثناء الألعاب المتعددة، خاصة في:
- المباريات الطويلة (+20 دقيقة)
- الألعاب مع أكثر من 4 لاعبين
- استخدام المودز الكبيرة', 
                0, 0, 28, 420, '2024-02-14 16:20:00'
            ]
        ];
        
        $stmt = $pdo->prepare("INSERT INTO forum_posts (user_id, category_id, title, content, is_pinned, is_featured, like_count, view_count, created_at, last_activity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($posts as $post) {
            $stmt->execute($post);
        }
        echo "✓ Inserted forum posts\n";
    }
    
    // Check if comments exist
    $stmt = $pdo->query("SELECT COUNT(*) FROM forum_comments");
    if ($stmt->fetchColumn() == 0) {
        // Comments
        $comments = [
            [1, 1, 'دليل ممتاز! خاصة الجزء عن السيطرة الجوية. ساعدني كثيراً في تحسين لعبي ضد الصين 🇨🇳'],
            [1, 1, 'هل يمكن إضافة جزء عن مواجهة GLA أيضاً؟ أواجه صعوبة مع شاحناتهم المفخخة 💣'],
            [2, 1, 'متى سيفتح التسجيل بالضبط؟ وهل هناك بطولات للفرق أيضاً؟ 🏆'],
            [3, 1, 'تكتيكات GLA المفضلة لدي! خاصة موضوع الأنفاق والخداع 🕳️'],
            [4, 1, 'جربت فتح المنافذ وحل المشكلة تماماً! شكراً لك 🔧']
        ];
        
        $stmt = $pdo->prepare("INSERT INTO forum_comments (post_id, user_id, content) VALUES (?, ?, ?)");
        foreach ($comments as $comment) {
            $stmt->execute($comment);
        }
        echo "✓ Inserted forum comments\n";
        
        // Update post comment counts
        $pdo->exec("UPDATE forum_posts SET comment_count = (SELECT COUNT(*) FROM forum_comments WHERE post_id = forum_posts.id)");
        echo "✓ Updated comment counts\n";
    }
    
    echo "\n🎉 Forum database setup completed successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
