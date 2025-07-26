<?php

declare(strict_types=1);

namespace App\Services;

use PDO;
use Ramsey\Uuid\Uuid;

class UserService
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Find user by ID
     */
    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->execute([$id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result ?: null;
    }

    /**
     * Find user by UUID
     */
    public function findByUuid(string $uuid): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE uuid = ?');
        $stmt->execute([$uuid]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result ?: null;
    }

    /**
     * Find user by username
     */
    public function findByUsername(string $username): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE username = ?');
        $stmt->execute([$username]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result ?: null;
    }

    /**
     * Find user by email
     */
    public function findByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result ?: null;
    }

    /**
     * Find user by username or email
     */
    public function findByUsernameOrEmail(string $identifier): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM users WHERE username = ? OR email = ?');
        $stmt->execute([$identifier, $identifier]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result ?: null;
    }

    /**
     * Get all users with pagination
     */
    public function getAll(int $page = 1, int $limit = 20, array $filters = []): array
    {
        $offset = ($page - 1) * $limit;
        
        $where = ['1=1'];
        $params = [];

        if (!empty($filters['search'])) {
            $where[] = '(username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
            $searchTerm = '%' . $filters['search'] . '%';
            $params = array_merge($params, [$searchTerm, $searchTerm, $searchTerm, $searchTerm]);
        }

        if (isset($filters['is_active'])) {
            $where[] = 'is_active = ?';
            $params[] = $filters['is_active'] ? 1 : 0;
        }

        if (isset($filters['is_verified'])) {
            $where[] = 'is_verified = ?';
            $params[] = $filters['is_verified'] ? 1 : 0;
        }

        if (isset($filters['is_banned'])) {
            $where[] = 'is_banned = ?';
            $params[] = $filters['is_banned'] ? 1 : 0;
        }

        $whereClause = implode(' AND ', $where);
        
        // Get total count
        $countStmt = $this->pdo->prepare("SELECT COUNT(*) FROM users WHERE $whereClause");
        $countStmt->execute($params);
        $total = $countStmt->fetchColumn();

        // Get users
        $orderBy = $filters['sort'] ?? 'created_at';
        $direction = $filters['direction'] ?? 'DESC';
        
        $stmt = $this->pdo->prepare("
            SELECT id, uuid, username, email, first_name, last_name, avatar, bio, location, 
                   website, discord_id, youtube_channel, experience_points, level, rank_points,
                   wins, losses, draws, is_active, is_verified, is_banned, is_admin, is_moderator,
                   last_login, last_activity, email_verified_at, created_at, updated_at
            FROM users 
            WHERE $whereClause 
            ORDER BY $orderBy $direction 
            LIMIT ? OFFSET ?
        ");
        
        $stmt->execute(array_merge($params, [$limit, $offset]));
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'users' => $users,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit),
            ],
        ];
    }

    /**
     * Get user rankings
     */
    public function getRankings(int $limit = 50): array
    {
        $stmt = $this->pdo->prepare('
            SELECT id, uuid, username, avatar, rank_points, wins, losses, draws, level,
                   experience_points, is_verified, last_activity, created_at
            FROM users 
            WHERE is_active = 1 AND is_banned = 0
            ORDER BY rank_points DESC, wins DESC, created_at ASC 
            LIMIT ?
        ');
        
        $stmt->execute([$limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Update user profile
     */
    public function updateProfile(int $userId, array $data): bool
    {
        $allowedFields = [
            'first_name', 'last_name', 'bio', 'location', 'website', 
            'discord_id', 'youtube_channel', 'avatar'
        ];

        $updateFields = [];
        $params = [];

        foreach ($data as $field => $value) {
            if (in_array($field, $allowedFields)) {
                $updateFields[] = "$field = ?";
                $params[] = $value;
            }
        }

        if (empty($updateFields)) {
            return false;
        }

        $params[] = $userId;
        $sql = 'UPDATE users SET ' . implode(', ', $updateFields) . ', updated_at = NOW() WHERE id = ?';
        
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute($params);
    }

    /**
     * Update user stats after match
     */
    public function updateStats(int $userId, array $stats): bool
    {
        $stmt = $this->pdo->prepare('
            UPDATE users SET 
                wins = wins + ?,
                losses = losses + ?,
                draws = draws + ?,
                rank_points = rank_points + ?,
                experience_points = experience_points + ?,
                updated_at = NOW()
            WHERE id = ?
        ');

        return $stmt->execute([
            $stats['wins'] ?? 0,
            $stats['losses'] ?? 0,
            $stats['draws'] ?? 0,
            $stats['rank_points'] ?? 0,
            $stats['experience_points'] ?? 0,
            $userId,
        ]);
    }

    /**
     * Ban user
     */
    public function banUser(int $userId, int $bannedBy, string $reason = ''): bool
    {
        $stmt = $this->pdo->prepare('
            UPDATE users SET 
                is_banned = 1,
                is_active = 0,
                updated_at = NOW()
            WHERE id = ?
        ');

        $result = $stmt->execute([$userId]);

        if ($result) {
            // Log ban action
            $this->logUserAction($userId, 'banned', $bannedBy, $reason);
        }

        return $result;
    }

    /**
     * Unban user
     */
    public function unbanUser(int $userId, int $unbannedBy): bool
    {
        $stmt = $this->pdo->prepare('
            UPDATE users SET 
                is_banned = 0,
                is_active = 1,
                updated_at = NOW()
            WHERE id = ?
        ');

        $result = $stmt->execute([$userId]);

        if ($result) {
            // Log unban action
            $this->logUserAction($userId, 'unbanned', $unbannedBy);
        }

        return $result;
    }

    /**
     * Get user badges
     */
    public function getUserBadges(int $userId): array
    {
        $stmt = $this->pdo->prepare('
            SELECT b.*, ub.awarded_at, ub.is_displayed
            FROM badges b
            INNER JOIN user_badges ub ON b.id = ub.badge_id
            WHERE ub.user_id = ?
            ORDER BY ub.awarded_at DESC
        ');
        
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Award badge to user
     */
    public function awardBadge(int $userId, int $badgeId, int $awardedBy = null): bool
    {
        $stmt = $this->pdo->prepare('
            INSERT IGNORE INTO user_badges (user_id, badge_id, awarded_by, awarded_at)
            VALUES (?, ?, ?, NOW())
        ');

        return $stmt->execute([$userId, $badgeId, $awardedBy]);
    }

    /**
     * Get user statistics
     */
    public function getUserStats(int $userId): array
    {
        $user = $this->findById($userId);
        if (!$user) {
            return [];
        }

        // Get additional stats
        $stmt = $this->pdo->prepare('
            SELECT 
                (SELECT COUNT(*) FROM forum_posts WHERE user_id = ?) as forum_posts,
                (SELECT COUNT(*) FROM forum_comments WHERE user_id = ?) as forum_comments,
                (SELECT COUNT(*) FROM tournaments t 
                 INNER JOIN tournament_participants tp ON t.id = tp.tournament_id 
                 WHERE tp.user_id = ?) as tournaments_participated,
                (SELECT COUNT(*) FROM challenges WHERE challenger_id = ? OR challenged_id = ?) as challenges,
                (SELECT COUNT(*) FROM replays WHERE uploader_id = ?) as replays_uploaded
        ');
        
        $stmt->execute([$userId, $userId, $userId, $userId, $userId, $userId]);
        $additionalStats = $stmt->fetch(PDO::FETCH_ASSOC);

        return array_merge([
            'wins' => $user['wins'],
            'losses' => $user['losses'],
            'draws' => $user['draws'],
            'total_matches' => $user['wins'] + $user['losses'] + $user['draws'],
            'win_rate' => $this->calculateWinRate($user['wins'], $user['losses'], $user['draws']),
            'rank_points' => $user['rank_points'],
            'level' => $user['level'],
            'experience_points' => $user['experience_points'],
        ], $additionalStats);
    }

    /**
     * Calculate win rate
     */
    private function calculateWinRate(int $wins, int $losses, int $draws): float
    {
        $total = $wins + $losses + $draws;
        return $total > 0 ? round(($wins / $total) * 100, 2) : 0.0;
    }

    /**
     * Log user action
     */
    private function logUserAction(int $userId, string $action, int $actionBy, string $reason = ''): void
    {
        // TODO: Implement user action logging table
        error_log("User action: $action for user $userId by $actionBy. Reason: $reason");
    }

    /**
     * Delete user (soft delete by deactivating)
     */
    public function deleteUser(int $userId): bool
    {
        $stmt = $this->pdo->prepare('
            UPDATE users SET 
                is_active = 0,
                email = CONCAT(email, "_deleted_", UNIX_TIMESTAMP()),
                username = CONCAT(username, "_deleted_", UNIX_TIMESTAMP()),
                updated_at = NOW()
            WHERE id = ?
        ');

        return $stmt->execute([$userId]);
    }
} 