<?php
// Debug auth process
header('Access-Control-Allow-Origin: http://localhost:4321');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';
        
        echo json_encode([
            'debug' => true,
            'received_email' => $email,
            'received_password' => $password,
            'step' => 'input_received'
        ]);
        
        // Check user exists
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND is_active = 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            echo json_encode([
                'debug' => true,
                'error' => 'User not found',
                'email_searched' => $email
            ]);
            exit;
        }
        
        // Check password
        $passwordMatch = password_verify($password, $user['password_hash']);
        
        if (!$passwordMatch) {
            echo json_encode([
                'debug' => true,
                'error' => 'Password mismatch',
                'user_found' => $user['username'],
                'password_hash_length' => strlen($user['password_hash'])
            ]);
            exit;
        }
        
        // Generate token
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'user_id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role'],
            'exp' => time() + 86400
        ]);
        
        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, 'zh_love_secret', true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        $token = $base64Header . "." . $base64Payload . "." . $base64Signature;
        
        echo json_encode([
            'success' => true,
            'debug' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email']
            ],
            'token' => $token,
            'token_length' => strlen($token)
        ]);
        
    } else {
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'debug' => true,
        'error' => 'Exception: ' . $e->getMessage()
    ]);
}
?>
