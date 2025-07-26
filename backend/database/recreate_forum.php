<?php
// Fix forum database structure properly

try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Fixing forum database structure...\n";
    
    // Disable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    
    // Drop all forum tables
    $tables = ['forum_likes', 'forum_comments', 'forum_posts', 'forum_categories'];
    foreach ($tables as $table) {
        try {
            $pdo->exec("DROP TABLE IF EXISTS $table");
            echo "✓ Dropped $table\n";
        } catch (Exception $e) {
            echo "⚠ Could not drop $table: " . $e->getMessage() . "\n";
        }
    }
    
    // Re-enable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    
    // Create forum_categories table
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
    
    // Create forum_posts table
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
    
    // Create forum_comments table
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
    
    // Create forum_likes table
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
    
    echo "\n🎉 Forum database structure created successfully!\n";
    echo "Now run insert_forum_data.php to add sample data.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
