<?php
echo '<h2>ZH-Love API Test</h2>';

try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    echo '<p style="color: green;">✓ Database: Connected</p>';
    
    $stmt = $pdo->query('SELECT COUNT(*) as count FROM users');
    $userCount = $stmt->fetch()['count'];
    echo '<p>Users: ' . $userCount . '</p>';
    
    $stmt = $pdo->query('SELECT COUNT(*) as count FROM clans WHERE is_approved = 1');
    $clanCount = $stmt->fetch()['count'];
    echo '<p>Approved clans: ' . $clanCount . '</p>';
    
    echo '<h3>Test Users:</h3>';
    $stmt = $pdo->query('SELECT id, username, email, first_name FROM users LIMIT 3');
    while ($user = $stmt->fetch()) {
        echo '<li>ID: ' . $user['id'] . ' - ' . $user['username'] . ' (' . $user['first_name'] . ')</li>';
    }
    
} catch (Exception $e) {
    echo '<p style="color: red;">✗ Database error: ' . $e->getMessage() . '</p>';
}

echo '<h3>Test Links:</h3>';
echo '<a href="/">API Root</a> | ';
echo '<a href="/api/health">Health</a> | ';
echo '<a href="/api/clans">Clans</a> | ';
echo '<a href="clan_api.php?action=all_clans">Clan API</a>';
?> 