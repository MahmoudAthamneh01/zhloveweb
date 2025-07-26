<?php
// Script to add encrypted passwords to database users

// Load environment variables
if (file_exists(__DIR__ . '/.env')) {
    $env = parse_ini_file(__DIR__ . '/.env');
    foreach ($env as $key => $value) {
        $_ENV[$key] = $value;
    }
}

// Database connection
try {
    $host = $_ENV['DB_HOST'] ?? 'localhost';
    $dbname = $_ENV['DB_NAME'] ?? 'zh_love_db';
    $username = $_ENV['DB_USER'] ?? 'root';
    $password = $_ENV['DB_PASS'] ?? '';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Connected to database successfully!\n";
    
    // Default password for all users
    $defaultPassword = 'password';
    $hashedPassword = password_hash($defaultPassword, PASSWORD_DEFAULT);
    
    // Update all users with the hashed password
    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE password_hash LIKE '$2y$10$%'");
    $stmt->execute([$hashedPassword]);
    
    echo "✅ Updated " . $stmt->rowCount() . " users with encrypted passwords\n";
    
    // Show users
    $stmt = $pdo->prepare("SELECT id, username, email, role FROM users ORDER BY id");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\n📋 Available users:\n";
    echo "-------------------\n";
    foreach ($users as $user) {
        echo "👤 " . $user['username'] . " (" . $user['role'] . ") - " . $user['email'] . "\n";
    }
    
    echo "\n🔐 Default password for all users: " . $defaultPassword . "\n";
    echo "\n🎯 You can now login with:\n";
    echo "   - Username: admin, Password: password (Admin)\n";
    echo "   - Username: zh_master, Password: password (Player)\n";
    echo "   - Username: tactical_gamer, Password: password (Moderator)\n";
    
} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
    echo "\n💡 Make sure to:\n";
    echo "   1. Setup your database first\n";
    echo "   2. Check your .env file settings\n";
    echo "   3. Ensure MySQL is running\n";
} 