<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    
    echo "Creating remaining tables...\n";
    
    $pdo->exec("CREATE TABLE forum_posts (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        category_id INT UNSIGNED,
        title VARCHAR(200) NOT NULL,
        content LONGTEXT NOT NULL,
        is_pinned TINYINT(1) DEFAULT 0,
        is_featured TINYINT(1) DEFAULT 0,
        like_count INT DEFAULT 0,
        comment_count INT DEFAULT 0,
        view_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    echo "✓ Posts table created\n";
    
    $pdo->exec("CREATE TABLE forum_comments (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        post_id INT UNSIGNED NOT NULL,
        user_id INT UNSIGNED NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    echo "✓ Comments table created\n";
    
    $pdo->exec("CREATE TABLE forum_likes (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        post_id INT UNSIGNED NOT NULL,
        user_id INT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY post_user_unique (post_id, user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    echo "✓ Likes table created\n";
    
    echo "✅ All tables created successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
