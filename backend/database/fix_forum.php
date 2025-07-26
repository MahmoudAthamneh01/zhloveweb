<?php
// Fix forum database structure

try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Fixing forum database structure...\n";
    
    // Drop existing tables if they exist (in correct order)
    $dropTables = [
        'DROP TABLE IF EXISTS forum_likes',
        'DROP TABLE IF EXISTS forum_comments', 
        'DROP TABLE IF EXISTS forum_posts',
        'DROP TABLE IF EXISTS forum_categories'
    ];
    
    foreach ($dropTables as $drop) {
        try {
            $pdo->exec($drop);
            echo "✓ " . $drop . "\n";
        } catch (Exception $e) {
            echo "⚠ " . $e->getMessage() . "\n";
        }
    }
    
    // Create tables in correct order
    
    // 1. Forum Categories
    $pdo->exec("
        CREATE TABLE `forum_categories` (
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
    
    // 2. Forum Posts
    $pdo->exec("
        CREATE TABLE `forum_posts` (
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
          KEY `category_id` (`category_id`),
          CONSTRAINT `forum_posts_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `forum_categories` (`id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✓ Created forum_posts table\n";
    
    // 3. Forum Comments
    $pdo->exec("
        CREATE TABLE `forum_comments` (
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
          KEY `user_id` (`user_id`),
          CONSTRAINT `forum_comments_post_id_foreign` FOREIGN KEY (`post_id`) REFERENCES `forum_posts` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✓ Created forum_comments table\n";
    
    // 4. Forum Likes
    $pdo->exec("
        CREATE TABLE `forum_likes` (
          `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
          `post_id` int(11) UNSIGNED NOT NULL,
          `user_id` int(11) UNSIGNED NOT NULL,
          `type` enum('like','dislike') NOT NULL DEFAULT 'like',
          `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          UNIQUE KEY `post_user_unique` (`post_id`, `user_id`),
          KEY `post_id` (`post_id`),
          KEY `user_id` (`user_id`),
          CONSTRAINT `forum_likes_post_id_foreign` FOREIGN KEY (`post_id`) REFERENCES `forum_posts` (`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✓ Created forum_likes table\n";
    
    // Insert sample data
    echo "\nInserting sample data...\n";
    
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
    
    // Posts
    $posts = [
        [1, 2, 'الدليل الشامل للعب مع الولايات المتحدة في 2024', 'دليل متكامل يغطي جميع استراتيجيات الولايات المتحدة...', 1, 1, 45, 1250, '2024-02-15 10:30:00'],
        [1, 3, 'بطولة الشرق الأوسط الكبرى - جوائز 5000$ 💰', 'إعلان رسمي عن بطولة الشرق الأوسط الكبرى 2024...', 1, 1, 67, 890, '2024-02-10 12:00:00'],
        [1, 2, 'تكتيكات متقدمة مع GLA: فن الحرب الغير تقليدية', 'جيش التحرير العالمي (GLA) يعتمد على الحرب غير التقليدية...', 0, 1, 32, 675, '2024-02-12 09:15:00'],
        [1, 5, 'حل مشكلة انقطاع الاتصال في الألعاب المتعددة', 'كثير من اللاعبين يواجهون مشكلة انقطاع الاتصال...', 0, 0, 28, 420, '2024-02-14 16:20:00']
    ];
    
    $stmt = $pdo->prepare("INSERT INTO forum_posts (user_id, category_id, title, content, is_pinned, is_featured, like_count, view_count, created_at, last_activity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($posts as $post) {
        $stmt->execute($post);
    }
    echo "✓ Inserted forum posts\n";
    
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
    
    echo "\n🎉 Forum database setup completed successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
