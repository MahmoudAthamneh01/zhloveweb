<?php
// Check user passwords
header('Content-Type: text/plain');

try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== Password Check ===\n\n";
    
    // Get user password hashes
    $stmt = $pdo->query("SELECT id, username, email, password_hash FROM users LIMIT 5");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Users and their password status:\n";
    foreach ($users as $user) {
        $hasHash = !empty($user['password_hash']);
        $hashType = $hasHash ? (strlen($user['password_hash']) > 50 ? 'Hashed' : 'Plain') : 'Empty';
        echo "ID: {$user['id']}, Username: {$user['username']}, Email: {$user['email']}, Password: $hashType\n";
        
        // Test common passwords
        if ($hasHash) {
            $testPasswords = ['password123', 'password', '123456', 'admin'];
            foreach ($testPasswords as $testPwd) {
                if (password_verify($testPwd, $user['password_hash'])) {
                    echo "  -> Password is: $testPwd\n";
                    break;
                }
            }
        }
    }
    
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage();
}
?>
