<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit(0);

$input = json_decode(file_get_contents('php://input'), true);

$username = $input['username'] ?? '';
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';
$name = $input['first_name'] ?? $input['name'] ?? '';

if (!$username || !$email || !$password || !$name) {
    echo json_encode(['error' => 'البيانات ناقصة']);
    exit;
}

try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO users (username, email, password_hash, first_name) VALUES (?, ?, ?, ?)');
    $stmt->execute([$username, $email, $hash, $name]);
    echo json_encode(['success' => true, 'message' => 'تم التسجيل بنجاح']);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?> 