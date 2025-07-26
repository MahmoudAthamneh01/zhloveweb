<?php

namespace App\Controllers;

use PDO;
use PDOException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AuthController
{
    private PDO $db;
    private string $jwtSecret;
    
    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->jwtSecret = $_ENV['JWT_SECRET'] ?? 'zh_love_secret_key_2024';
    }
    
    /**
     * Register new user
     */
    public function register(Request $request, Response $response): Response
    {
        $data = json_decode($request->getBody()->getContents(), true);
        
        // Validate required fields
        $required = ['username', 'email', 'password', 'first_name'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                return $this->errorResponse($response, "الحقل {$field} مطلوب", 400);
            }
        }
        
        // Validate email format
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return $this->errorResponse($response, 'البريد الإلكتروني غير صحيح', 400);
        }
        
        // Validate password strength
        if (strlen($data['password']) < 6) {
            return $this->errorResponse($response, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', 400);
        }
        
        try {
            // Check if username exists
            $stmt = $this->db->prepare("SELECT id FROM users WHERE username = ?");
            $stmt->execute([$data['username']]);
            if ($stmt->fetch()) {
                return $this->errorResponse($response, 'اسم المستخدم موجود مسبقاً', 400);
            }
            
            // Check if email exists
            $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$data['email']]);
            if ($stmt->fetch()) {
                return $this->errorResponse($response, 'البريد الإلكتروني موجود مسبقاً', 400);
            }
            
            // Hash password
            $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);
            
            // Insert user
            $stmt = $this->db->prepare("
                INSERT INTO users (
                    username, email, password_hash, first_name, last_name, 
                    bio, country, level, rank_points, is_verified
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $data['username'],
                $data['email'],
                $passwordHash,
                $data['first_name'],
                $data['last_name'] ?? '',
                $data['bio'] ?? '',
                $data['country'] ?? 'Saudi Arabia',
                1, // Starting level
                1000, // Starting rank points
                0 // Not verified by default
            ]);
            
            $userId = $this->db->lastInsertId();
            
            // Get user data
            $stmt = $this->db->prepare("
                SELECT id, username, email, first_name, last_name, bio, country, 
                       level, rank_points, total_matches, wins, losses, win_rate, 
                       is_verified, created_at
                FROM users WHERE id = ?
            ");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Generate JWT token
            $payload = [
                'user_id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'iat' => time(),
                'exp' => time() + (24 * 60 * 60) // 24 hours
            ];
            
            $token = JWT::encode($payload, $this->jwtSecret, 'HS256');
            
            // Create session
            $sessionToken = bin2hex(random_bytes(32));
            $stmt = $this->db->prepare("
                INSERT INTO user_sessions (user_id, session_token, jwt_token, expires_at)
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([
                $userId,
                $sessionToken,
                $token,
                date('Y-m-d H:i:s', time() + (24 * 60 * 60))
            ]);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'تم التسجيل بنجاح',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                    'session_token' => $sessionToken
                ]
            ]));
            
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
            
        } catch (PDOException $e) {
            return $this->errorResponse($response, 'خطأ في قاعدة البيانات: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Login user
     */
    public function login(Request $request, Response $response): Response
    {
        $data = json_decode($request->getBody()->getContents(), true);
        
        if (empty($data['username']) || empty($data['password'])) {
            return $this->errorResponse($response, 'اسم المستخدم وكلمة المرور مطلوبان', 400);
        }
        
        try {
            // Get user by username or email
            $stmt = $this->db->prepare("
                SELECT id, username, email, password_hash, first_name, last_name, 
                       bio, country, level, rank_points, total_matches, wins, losses, 
                       win_rate, is_verified, is_active, created_at
                FROM users 
                WHERE (username = ? OR email = ?) AND is_active = 1
            ");
            $stmt->execute([$data['username'], $data['username']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                return $this->errorResponse($response, 'اسم المستخدم أو كلمة المرور غير صحيحة', 401);
            }
            
            // Verify password
            if (!password_verify($data['password'], $user['password_hash'])) {
                return $this->errorResponse($response, 'اسم المستخدم أو كلمة المرور غير صحيحة', 401);
            }
            
            // Update last login
            $stmt = $this->db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            $stmt->execute([$user['id']]);
            
            // Generate JWT token
            $payload = [
                'user_id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'iat' => time(),
                'exp' => time() + (24 * 60 * 60) // 24 hours
            ];
            
            $token = JWT::encode($payload, $this->jwtSecret, 'HS256');
            
            // Create/update session
            $sessionToken = bin2hex(random_bytes(32));
            
            // Deactivate old sessions
            $stmt = $this->db->prepare("UPDATE user_sessions SET is_active = 0 WHERE user_id = ?");
            $stmt->execute([$user['id']]);
            
            // Create new session
            $stmt = $this->db->prepare("
                INSERT INTO user_sessions (user_id, session_token, jwt_token, expires_at)
                VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([
                $user['id'],
                $sessionToken,
                $token,
                date('Y-m-d H:i:s', time() + (24 * 60 * 60))
            ]);
            
            // Remove password hash from response
            unset($user['password_hash']);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'تم تسجيل الدخول بنجاح',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                    'session_token' => $sessionToken
                ]
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (PDOException $e) {
            return $this->errorResponse($response, 'خطأ في قاعدة البيانات: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Logout user
     */
    public function logout(Request $request, Response $response): Response
    {
        $data = json_decode($request->getBody()->getContents(), true);
        $sessionToken = $data['session_token'] ?? '';
        
        if ($sessionToken) {
            try {
                $stmt = $this->db->prepare("UPDATE user_sessions SET is_active = 0 WHERE session_token = ?");
                $stmt->execute([$sessionToken]);
            } catch (PDOException $e) {
                // Log error but continue
            }
        }
        
        $response->getBody()->write(json_encode([
            'success' => true,
            'message' => 'تم تسجيل الخروج بنجاح'
        ]));
        
        return $response->withHeader('Content-Type', 'application/json');
    }
    
    /**
     * Get current user info
     */
    public function me(Request $request, Response $response): Response
    {
        $headers = $request->getHeaders();
        $authHeader = $headers['Authorization'][0] ?? '';
        
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return $this->errorResponse($response, 'رمز المصادقة مطلوب', 401);
        }
        
        $token = substr($authHeader, 7);
        
        try {
            $decoded = JWT::decode($token, new Key($this->jwtSecret, 'HS256'));
            $userId = $decoded->user_id;
            
            $stmt = $this->db->prepare("
                SELECT id, username, email, first_name, last_name, bio, country, 
                       avatar, level, rank_points, total_matches, wins, losses, 
                       win_rate, is_verified, created_at, last_login
                FROM users WHERE id = ? AND is_active = 1
            ");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                return $this->errorResponse($response, 'المستخدم غير موجود', 404);
            }
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $user
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (\Exception $e) {
            return $this->errorResponse($response, 'رمز المصادقة غير صحيح', 401);
        }
    }
    
    /**
     * Verify session token
     */
    public function verifySession(Request $request, Response $response): Response
    {
        $data = json_decode($request->getBody()->getContents(), true);
        $sessionToken = $data['session_token'] ?? '';
        
        if (!$sessionToken) {
            return $this->errorResponse($response, 'رمز الجلسة مطلوب', 400);
        }
        
        try {
            $stmt = $this->db->prepare("
                SELECT us.*, u.id, u.username, u.email, u.first_name, u.last_name, 
                       u.level, u.rank_points, u.is_verified
                FROM user_sessions us
                JOIN users u ON us.user_id = u.id
                WHERE us.session_token = ? AND us.is_active = 1 AND us.expires_at > NOW()
            ");
            $stmt->execute([$sessionToken]);
            $session = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$session) {
                return $this->errorResponse($response, 'الجلسة منتهية الصلاحية', 401);
            }
            
            $user = [
                'id' => $session['id'],
                'username' => $session['username'],
                'email' => $session['email'],
                'first_name' => $session['first_name'],
                'last_name' => $session['last_name'],
                'level' => $session['level'],
                'rank_points' => $session['rank_points'],
                'is_verified' => $session['is_verified']
            ];
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $user
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (PDOException $e) {
            return $this->errorResponse($response, 'خطأ في قاعدة البيانات: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Helper method to return error response
     */
    private function errorResponse(Response $response, string $message, int $status = 400): Response
    {
        $response->getBody()->write(json_encode([
            'success' => false,
            'message' => $message
        ]));
        
        return $response->withStatus($status)->withHeader('Content-Type', 'application/json');
    }
} 