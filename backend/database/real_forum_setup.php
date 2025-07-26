<?php
/**
 * Real Forum Database Setup - Clean Real Data Only
 * إعداد قاعدة بيانات المنتدى - بيانات حقيقية فقط
 */

// Database connection
$host = 'localhost';
$dbname = 'zh_love_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Connected to database successfully\n";
} catch(PDOException $e) {
    die("❌ Connection failed: " . $e->getMessage());
}

// Drop existing tables to start fresh
echo "🗑️ Removing old forum tables...\n";
$tables = ['forum_likes', 'forum_comments', 'forum_posts', 'forum_categories'];
foreach ($tables as $table) {
    try {
        // First, disable foreign key checks
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
        $pdo->exec("DROP TABLE IF EXISTS $table");
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
        echo "  ✅ Dropped $table\n";
    } catch(PDOException $e) {
        echo "  ⚠️ Could not drop $table: " . $e->getMessage() . "\n";
    }
}

// Create forum_categories table
echo "📁 Creating forum_categories table...\n";
$sql = "CREATE TABLE forum_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#4F9CF9',
    icon VARCHAR(100),
    post_count INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";
$pdo->exec($sql);
echo "  ✅ forum_categories table created\n";

// Create forum_posts table
echo "📝 Creating forum_posts table...\n";
$sql = "CREATE TABLE forum_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT DEFAULT 1,
    user_id INT DEFAULT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_username VARCHAR(100) DEFAULT 'مجهول',
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    is_pinned TINYINT(1) DEFAULT 0,
    is_featured TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category_id),
    INDEX idx_user (user_id),
    INDEX idx_created (created_at),
    INDEX idx_active (is_active)
)";
$pdo->exec($sql);
echo "  ✅ forum_posts table created\n";

// Create forum_comments table
echo "💬 Creating forum_comments table...\n";
$sql = "CREATE TABLE forum_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT DEFAULT NULL,
    content TEXT NOT NULL,
    author_username VARCHAR(100) DEFAULT 'مجهول',
    parent_id INT DEFAULT NULL,
    like_count INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_post (post_id),
    INDEX idx_user (user_id),
    INDEX idx_parent (parent_id),
    INDEX idx_created (created_at)
)";
$pdo->exec($sql);
echo "  ✅ forum_comments table created\n";

// Create forum_likes table
echo "❤️ Creating forum_likes table...\n";
$sql = "CREATE TABLE forum_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT DEFAULT NULL,
    comment_id INT DEFAULT NULL,
    user_id INT DEFAULT NULL,
    user_ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_post (post_id),
    INDEX idx_comment (comment_id),
    INDEX idx_user (user_id),
    INDEX idx_ip (user_ip),
    UNIQUE KEY unique_post_user (post_id, user_id),
    UNIQUE KEY unique_comment_user (comment_id, user_id),
    UNIQUE KEY unique_post_ip (post_id, user_ip),
    UNIQUE KEY unique_comment_ip (comment_id, user_ip)
)";
$pdo->exec($sql);
echo "  ✅ forum_likes table created\n";

// Insert real categories only
echo "📂 Creating real forum categories...\n";
$categories = [
    [
        'name' => 'النقاش العام',
        'description' => 'مناقشات عامة حول اللعبة والمجتمع',
        'color' => '#4F9CF9',
        'icon' => '💬',
        'display_order' => 1
    ],
    [
        'name' => 'استراتيجيات اللعب',
        'description' => 'شارك وناقش استراتيجيات وتكتيكات اللعبة',
        'color' => '#10B981',
        'icon' => '🎯',
        'display_order' => 2
    ],
    [
        'name' => 'البطولات والمسابقات',
        'description' => 'آخر أخبار البطولات والمسابقات',
        'color' => '#F59E0B',
        'icon' => '🏆',
        'display_order' => 3
    ],
    [
        'name' => 'الدعم الفني',
        'description' => 'طلب المساعدة والدعم الفني',
        'color' => '#EF4444',
        'icon' => '🔧',
        'display_order' => 4
    ],
    [
        'name' => 'اقتراحات وتطوير',
        'description' => 'اقتراحاتك لتطوير اللعبة',
        'color' => '#8B5CF6',
        'icon' => '💡',
        'display_order' => 5
    ]
];

$stmt = $pdo->prepare("INSERT INTO forum_categories (name, description, color, icon, display_order) VALUES (?, ?, ?, ?, ?)");
foreach ($categories as $category) {
    $stmt->execute([
        $category['name'],
        $category['description'],
        $category['color'],
        $category['icon'],
        $category['display_order']
    ]);
    echo "  ✅ Added category: {$category['name']}\n";
}

// Create welcome post only
echo "👋 Creating welcome post...\n";
$stmt = $pdo->prepare("INSERT INTO forum_posts (category_id, title, content, author_username, is_pinned, is_featured) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->execute([
    1, // General Discussion
    'مرحباً بكم في منتدى ZH Love',
    'أهلاً وسهلاً بجميع اللاعبين في منتدى ZH Love الرسمي!

هذا المكان المثالي للتواصل مع المجتمع، مشاركة الاستراتيجيات، ومناقشة كل ما يخص اللعبة.

📋 قوانين المنتدى:
• احترام جميع الأعضاء
• عدم استخدام لغة غير لائقة
• عدم النشر المتكرر (السبام)
• مشاركة المحتوى في القسم المناسب

🎮 استمتعوا بوقتكم وشاركوا معرفتكم!',
    'المدير العام',
    1, // pinned
    1  // featured
]);
echo "  ✅ Welcome post created\n";

// Update category post counts
echo "📊 Updating category post counts...\n";
$pdo->exec("UPDATE forum_categories c SET post_count = (SELECT COUNT(*) FROM forum_posts p WHERE p.category_id = c.id AND p.is_active = 1)");
echo "  ✅ Category counts updated\n";

echo "\n🎉 Real forum database setup completed successfully!\n";
echo "📈 Database Statistics:\n";

// Show final statistics
$stats = $pdo->query("SELECT 
    (SELECT COUNT(*) FROM forum_categories WHERE is_active = 1) as categories,
    (SELECT COUNT(*) FROM forum_posts WHERE is_active = 1) as posts,
    (SELECT COUNT(*) FROM forum_comments WHERE is_active = 1) as comments,
    (SELECT COUNT(*) FROM forum_likes) as likes
")->fetch(PDO::FETCH_ASSOC);

echo "  📁 Categories: {$stats['categories']}\n";
echo "  📝 Posts: {$stats['posts']}\n";
echo "  💬 Comments: {$stats['comments']}\n";
echo "  ❤️ Likes: {$stats['likes']}\n";

echo "\n✨ Ready to use! Visit: http://localhost:4321/ar/forum\n";
?>
