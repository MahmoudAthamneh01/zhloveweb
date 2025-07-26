<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Ramsey\Uuid\Uuid;
use PDO;

class AuthService
{
    private PDO $pdo;
    private UserService $userService;
    private string $jwtSecret;
    private string $jwtAlgorithm;
    private int $jwtExpires;

    public function __construct(PDO $pdo, UserService $userService)
    {
        $this->pdo = $pdo;
        $this->userService = $userService;
        $this->jwtSecret = $_ENV['JWT_SECRET'] ?? 'your-secret-key';
        $this->jwtAlgorithm = 'HS256';
        $this->jwtExpires = 3600; // 1 hour
    }

    /**
     * Register a new user
     */
    public function register(array $data): array
    {
        // Validate required fields
        $this->validateRegistrationData($data);

        // Check if username or email already exists
        if ($this->userExists($data['username'], $data['email'])) {
            throw new \Exception('Username or email already exists');
        }

        // Hash password
        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);

        // Create user
        $uuid = Uuid::uuid4()->toString();
        
        $stmt = $this->pdo->prepare('
            INSERT INTO users (
                uuid, username, email, password_hash, first_name, last_name,
                is_active, is_verified, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, 1, 0, NOW(), NOW())
        ');

        $stmt->execute([
            $uuid,
            $data['username'],
            $data['email'],
            $passwordHash,
            $data['first_name'] ?? null,
            $data['last_name'] ?? null,
        ]);

        $userId = $this->pdo->lastInsertId();
        $user = $this->userService->findById((int) $userId);

        // Generate JWT token
        $token = $this->generateToken($user);

        // Create session
        $this->createSession($user['id'], $data['ip_address'] ?? '', $data['user_agent'] ?? '');

        return [
            'user' => $this->sanitizeUser($user),
            'token' => $token,
            'expires_in' => $this->jwtExpires,
        ];
    }

    /**
     * Authenticate user login
     */
    public function login(string $username, string $password, string $ipAddress = '', string $userAgent = ''): array
    {
        // Find user by username or email
        $user = $this->userService->findByUsernameOrEmail($username);

        if (!$user) {
            throw new \Exception('Invalid credentials');
        }

        // Check if user is banned
        if ($user['is_banned']) {
            throw new \Exception('Account has been banned');
        }

        // Check if user is active
        if (!$user['is_active']) {
            throw new \Exception('Account is not active');
        }

        // Verify password
        if (!password_verify($password, $user['password_hash'])) {
            // Log failed login attempt
            $this->logFailedLoginAttempt($user['id'], $ipAddress);
            throw new \Exception('Invalid credentials');
        }

        // Update last login
        $this->updateLastLogin($user['id']);

        // Generate JWT token
        $token = $this->generateToken($user);

        // Create session
        $this->createSession($user['id'], $ipAddress, $userAgent);

        return [
            'user' => $this->sanitizeUser($user),
            'token' => $token,
            'expires_in' => $this->jwtExpires,
        ];
    }

    /**
     * Logout user
     */
    public function logout(string $token): bool
    {
        try {
            $payload = $this->verifyToken($token);
            $this->destroySession($payload['user_id']);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Verify JWT token
     */
    public function verifyToken(string $token): array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->jwtSecret, $this->jwtAlgorithm));
            return (array) $decoded;
        } catch (\Exception $e) {
            throw new \Exception('Invalid token');
        }
    }

    /**
     * Refresh JWT token
     */
    public function refreshToken(string $token): array
    {
        $payload = $this->verifyToken($token);
        $user = $this->userService->findById($payload['user_id']);

        if (!$user || !$user['is_active'] || $user['is_banned']) {
            throw new \Exception('User not found or inactive');
        }

        $newToken = $this->generateToken($user);

        return [
            'token' => $newToken,
            'expires_in' => $this->jwtExpires,
        ];
    }

    /**
     * Get current authenticated user
     */
    public function getCurrentUser(string $token): array
    {
        $payload = $this->verifyToken($token);
        $user = $this->userService->findById($payload['user_id']);

        if (!$user) {
            throw new \Exception('User not found');
        }

        return $this->sanitizeUser($user);
    }

    /**
     * Send password reset email
     */
    public function forgotPassword(string $email): bool
    {
        $user = $this->userService->findByEmail($email);

        if (!$user) {
            // Don't reveal if email exists
            return true;
        }

        // Generate reset token
        $resetToken = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

        // Store reset token
        $stmt = $this->pdo->prepare('
            INSERT INTO password_resets (email, token, expires_at, created_at) 
            VALUES (?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
            token = VALUES(token), 
            expires_at = VALUES(expires_at), 
            created_at = NOW()
        ');

        $stmt->execute([$email, $resetToken, $expiresAt]);

        // TODO: Send email with reset link
        // $this->sendPasswordResetEmail($email, $resetToken);

        return true;
    }

    /**
     * Reset password using token
     */
    public function resetPassword(string $token, string $newPassword): bool
    {
        // Find valid reset token
        $stmt = $this->pdo->prepare('
            SELECT email FROM password_resets 
            WHERE token = ? AND expires_at > NOW()
        ');
        $stmt->execute([$token]);
        $reset = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$reset) {
            throw new \Exception('Invalid or expired reset token');
        }

        // Update user password
        $passwordHash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
        
        $stmt = $this->pdo->prepare('
            UPDATE users SET password_hash = ?, updated_at = NOW() 
            WHERE email = ?
        ');
        $stmt->execute([$passwordHash, $reset['email']]);

        // Delete used reset token
        $stmt = $this->pdo->prepare('DELETE FROM password_resets WHERE token = ?');
        $stmt->execute([$token]);

        return true;
    }

    /**
     * Verify email address
     */
    public function verifyEmail(string $token): bool
    {
        // Find user by verification token
        $stmt = $this->pdo->prepare('
            SELECT id FROM users WHERE remember_token = ? AND email_verified_at IS NULL
        ');
        $stmt->execute([$token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            throw new \Exception('Invalid verification token');
        }

        // Mark email as verified
        $stmt = $this->pdo->prepare('
            UPDATE users 
            SET is_verified = 1, email_verified_at = NOW(), remember_token = NULL, updated_at = NOW()
            WHERE id = ?
        ');
        $stmt->execute([$user['id']]);

        return true;
    }

    /**
     * Generate JWT token
     */
    private function generateToken(array $user): string
    {
        $payload = [
            'user_id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'is_admin' => $user['is_admin'],
            'is_moderator' => $user['is_moderator'],
            'iat' => time(),
            'exp' => time() + $this->jwtExpires,
        ];

        return JWT::encode($payload, $this->jwtSecret, $this->jwtAlgorithm);
    }

    /**
     * Create user session
     */
    private function createSession(int $userId, string $ipAddress, string $userAgent): void
    {
        $sessionId = bin2hex(random_bytes(32));
        
        $stmt = $this->pdo->prepare('
            INSERT INTO user_sessions (id, user_id, ip_address, user_agent, payload, created_at, last_activity)
            VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        ');

        $payload = json_encode([
            'login_time' => time(),
            'ip_address' => $ipAddress,
        ]);

        $stmt->execute([$sessionId, $userId, $ipAddress, $userAgent, $payload]);
    }

    /**
     * Destroy user session
     */
    private function destroySession(int $userId): void
    {
        $stmt = $this->pdo->prepare('DELETE FROM user_sessions WHERE user_id = ?');
        $stmt->execute([$userId]);
    }

    /**
     * Update last login timestamp
     */
    private function updateLastLogin(int $userId): void
    {
        $stmt = $this->pdo->prepare('
            UPDATE users 
            SET last_login = NOW(), last_activity = NOW(), updated_at = NOW()
            WHERE id = ?
        ');
        $stmt->execute([$userId]);
    }

    /**
     * Log failed login attempt
     */
    private function logFailedLoginAttempt(int $userId, string $ipAddress): void
    {
        // TODO: Implement rate limiting and account lockout
        // For now, just log the attempt
        error_log("Failed login attempt for user ID: $userId from IP: $ipAddress");
    }

    /**
     * Validate registration data
     */
    private function validateRegistrationData(array $data): void
    {
        if (empty($data['username'])) {
            throw new \Exception('Username is required');
        }

        if (empty($data['email'])) {
            throw new \Exception('Email is required');
        }

        if (empty($data['password'])) {
            throw new \Exception('Password is required');
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new \Exception('Invalid email format');
        }

        if (strlen($data['username']) < 3 || strlen($data['username']) > 50) {
            throw new \Exception('Username must be between 3 and 50 characters');
        }

        if (strlen($data['password']) < 8) {
            throw new \Exception('Password must be at least 8 characters');
        }

        // Username validation (alphanumeric and underscore only)
        if (!preg_match('/^[a-zA-Z0-9_]+$/', $data['username'])) {
            throw new \Exception('Username can only contain letters, numbers, and underscores');
        }
    }

    /**
     * Check if user exists
     */
    private function userExists(string $username, string $email): bool
    {
        $stmt = $this->pdo->prepare('
            SELECT COUNT(*) FROM users WHERE username = ? OR email = ?
        ');
        $stmt->execute([$username, $email]);
        
        return $stmt->fetchColumn() > 0;
    }

    /**
     * Remove sensitive data from user array
     */
    private function sanitizeUser(array $user): array
    {
        unset($user['password_hash']);
        unset($user['remember_token']);
        
        return $user;
    }
} 