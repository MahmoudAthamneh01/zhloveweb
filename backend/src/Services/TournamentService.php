<?php

namespace App\Services;

use PDO;

class TournamentService
{
    private $db;
    private $notificationService;

    public function __construct(PDO $db, NotificationService $notificationService)
    {
        $this->db = $db;
        $this->notificationService = $notificationService;
    }

    public function createTournament($organizerId, $data)
    {
        try {
            $this->db->beginTransaction();

            // Insert tournament
            $sql = "INSERT INTO tournaments (
                name, description, format, max_participants, prize_pool, entry_fee,
                start_date, registration_deadline, rules, requirements, region,
                game_mode, allowed_maps, contact_info, stream_url, image_url,
                is_private, require_approval, allow_spectators, min_rank, max_rank,
                organizer_id, status, use_custom_rules
            ) VALUES (
                :name, :description, :format, :max_participants, :prize_pool, :entry_fee,
                :start_date, :registration_deadline, :rules, :requirements, :region,
                :game_mode, :allowed_maps, :contact_info, :stream_url, :image_url,
                :is_private, :require_approval, :allow_spectators, :min_rank, :max_rank,
                :organizer_id, :status, :use_custom_rules
            )";

            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([
                'name' => $data['name'],
                'description' => $data['description'],
                'format' => $data['format'],
                'max_participants' => $data['maxParticipants'],
                'prize_pool' => $data['prizePool'] ?? 0,
                'entry_fee' => $data['entryFee'] ?? 0,
                'start_date' => $data['startDate'],
                'registration_deadline' => $data['registrationDeadline'],
                'rules' => $data['rules'],
                'requirements' => $data['requirements'] ?? '',
                'region' => $data['region'],
                'game_mode' => $data['gameMode'],
                'allowed_maps' => json_encode($data['maps'] ?? []),
                'contact_info' => json_encode($data['contactInfo'] ?? []),
                'stream_url' => $data['streamUrl'] ?? '',
                'image_url' => $data['imageUrl'] ?? '',
                'is_private' => $data['isPrivate'] ? 1 : 0,
                'require_approval' => $data['requireApproval'] ? 1 : 0,
                'allow_spectators' => $data['allowSpectators'] ? 1 : 0,
                'min_rank' => $data['minRank'] ?? '',
                'max_rank' => $data['maxRank'] ?? '',
                'organizer_id' => $organizerId,
                'status' => $data['requireApproval'] ? 'pending_approval' : 'open',
                'use_custom_rules' => $data['useCustomRules'] ? 1 : 0
            ]);

            $tournamentId = $this->db->lastInsertId();

            // Handle invitations for private tournaments
            if ($data['isPrivate'] && !empty($data['invitedUsers'])) {
                $this->sendTournamentInvitations($tournamentId, $data['invitedUsers']);
            }

            // Add organizer as staff
            $this->addTournamentStaff($tournamentId, $organizerId, 'organizer', $organizerId);

            $this->db->commit();

            return $this->getTournamentById($tournamentId);

        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function getAllTournaments($params = [])
    {
        $page = $params['page'] ?? 1;
        $limit = $params['limit'] ?? 12;
        $filter = $params['filter'] ?? 'all';
        $sort = $params['sort'] ?? 'newest';
        $featured = $params['featured'] ?? null;
        $userId = $params['user_id'] ?? null;

        $offset = ($page - 1) * $limit;
        
        // Build WHERE clause
        $whereConditions = [];
        $bindings = [];

        if ($filter !== 'all') {
            switch ($filter) {
                case 'open':
                    $whereConditions[] = "t.status = 'open'";
                    break;
                case 'live':
                    $whereConditions[] = "t.status = 'live'";
                    break;
                case 'upcoming':
                    $whereConditions[] = "t.status = 'upcoming'";
                    break;
                case 'completed':
                    $whereConditions[] = "t.status = 'completed'";
                    break;
                case 'my':
                    if ($userId) {
                        $whereConditions[] = "(t.organizer_id = :user_id OR tp.user_id = :user_id)";
                        $bindings['user_id'] = $userId;
                    }
                    break;
            }
        }

        if ($featured !== null) {
            $whereConditions[] = "t.is_featured = :featured";
            $bindings['featured'] = $featured ? 1 : 0;
        }

        // Only show approved tournaments to public
        $whereConditions[] = "t.status != 'pending_approval'";

        $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

        // Build ORDER BY clause
        $orderBy = match($sort) {
            'newest' => 'ORDER BY t.created_at DESC',
            'oldest' => 'ORDER BY t.created_at ASC',
            'prize' => 'ORDER BY t.prize_pool DESC',
            'participants' => 'ORDER BY t.current_participants DESC',
            'start_date' => 'ORDER BY t.start_date ASC',
            default => 'ORDER BY t.created_at DESC'
        };

        $sql = "
            SELECT DISTINCT
                t.*,
                u.username as organizer_name,
                u.avatar as organizer_avatar,
                CASE WHEN tp.user_id IS NOT NULL THEN 1 ELSE 0 END as is_participant
            FROM tournaments t
            LEFT JOIN users u ON t.organizer_id = u.id
            LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id AND tp.user_id = :current_user
            {$whereClause}
            {$orderBy}
            LIMIT :limit OFFSET :offset
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':current_user', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        
        foreach ($bindings as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }
        
        $stmt->execute();
        $tournaments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get total count
        $countSql = "
            SELECT COUNT(DISTINCT t.id)
            FROM tournaments t
            LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id AND tp.user_id = :current_user
            {$whereClause}
        ";
        
        $countStmt = $this->db->prepare($countSql);
        $countStmt->bindValue(':current_user', $userId, PDO::PARAM_INT);
        foreach ($bindings as $key => $value) {
            $countStmt->bindValue(":$key", $value);
        }
        $countStmt->execute();
        $total = $countStmt->fetchColumn();

        return [
            'tournaments' => $this->processTournaments($tournaments),
            'total' => $total,
            'totalPages' => ceil($total / $limit),
            'hasMore' => ($page * $limit) < $total
        ];
    }

    public function getTournamentById($tournamentId, $userId = null)
    {
        $sql = "
            SELECT 
                t.*,
                u.username as organizer_name,
                u.avatar as organizer_avatar,
                CASE WHEN tp.user_id IS NOT NULL THEN 1 ELSE 0 END as is_participant
            FROM tournaments t
            LEFT JOIN users u ON t.organizer_id = u.id
            LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id AND tp.user_id = :user_id
            WHERE t.id = :tournament_id
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'tournament_id' => $tournamentId,
            'user_id' => $userId
        ]);

        $tournament = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$tournament) {
            return null;
        }

        return $this->processTournament($tournament);
    }

    public function joinTournament($tournamentId, $userId)
    {
        try {
            $this->db->beginTransaction();

            // Check if tournament exists and is joinable
            $tournament = $this->getTournamentById($tournamentId);
            if (!$tournament) {
                throw new \Exception('Tournament not found');
            }

            if ($tournament['status'] !== 'open') {
                throw new \Exception('Tournament is not open for registration');
            }

            if ($tournament['current_participants'] >= $tournament['max_participants']) {
                throw new \Exception('Tournament is full');
            }

            // Check if already joined
            $checkSql = "SELECT id FROM tournament_participants WHERE tournament_id = ? AND user_id = ?";
            $checkStmt = $this->db->prepare($checkSql);
            $checkStmt->execute([$tournamentId, $userId]);
            
            if ($checkStmt->fetch()) {
                throw new \Exception('Already joined this tournament');
            }

            // Join tournament
            $joinSql = "INSERT INTO tournament_participants (tournament_id, user_id, status) VALUES (?, ?, ?)";
            $joinStmt = $this->db->prepare($joinSql);
            $joinStmt->execute([$tournamentId, $userId, 'registered']);

            // Update participant count
            $updateSql = "UPDATE tournaments SET current_participants = current_participants + 1 WHERE id = ?";
            $updateStmt = $this->db->prepare($updateSql);
            $updateStmt->execute([$tournamentId]);

            // Send notification to organizer
            $this->notificationService->create([
                'user_id' => $tournament['organizer_id'],
                'type' => 'tournament_join',
                'title' => 'مشارك جديد في البطولة',
                'message' => "انضم مشارك جديد إلى بطولة {$tournament['name']}",
                'metadata' => json_encode(['tournament_id' => $tournamentId, 'user_id' => $userId])
            ]);

            $this->db->commit();
            return ['success' => true];

        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function leaveTournament($tournamentId, $userId)
    {
        try {
            $this->db->beginTransaction();

            // Remove participant
            $deleteSql = "DELETE FROM tournament_participants WHERE tournament_id = ? AND user_id = ?";
            $deleteStmt = $this->db->prepare($deleteSql);
            $deleteStmt->execute([$tournamentId, $userId]);

            if ($deleteStmt->rowCount() === 0) {
                throw new \Exception('Not participating in this tournament');
            }

            // Update participant count
            $updateSql = "UPDATE tournaments SET current_participants = current_participants - 1 WHERE id = ?";
            $updateStmt = $this->db->prepare($updateSql);
            $updateStmt->execute([$tournamentId]);

            $this->db->commit();
            return ['success' => true];

        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function approveTournament($tournamentId, $adminId, $featured = false)
    {
        try {
            $this->db->beginTransaction();

            $updateSql = "UPDATE tournaments SET 
                status = 'open', 
                approved_at = NOW(), 
                approved_by = ?,
                is_featured = ?
                WHERE id = ? AND status = 'pending_approval'";
            
            $stmt = $this->db->prepare($updateSql);
            $result = $stmt->execute([$adminId, $featured ? 1 : 0, $tournamentId]);

            if ($stmt->rowCount() === 0) {
                throw new \Exception('Tournament not found or already processed');
            }

            $tournament = $this->getTournamentById($tournamentId);

            // Send notification to organizer
            $this->notificationService->create([
                'user_id' => $tournament['organizer_id'],
                'type' => 'tournament_approved',
                'title' => $featured ? 'تم الموافقة وتمييز البطولة!' : 'تم الموافقة على البطولة!',
                'message' => $featured 
                    ? "تم الموافقة على بطولة {$tournament['name']} وتمييزها كبطولة مميزة!"
                    : "تم الموافقة على بطولة {$tournament['name']} ونشرها للجمهور",
                'metadata' => json_encode(['tournament_id' => $tournamentId])
            ]);

            $this->db->commit();
            return $tournament;

        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function rejectTournament($tournamentId, $adminId, $reason = '')
    {
        try {
            $this->db->beginTransaction();

            $updateSql = "UPDATE tournaments SET 
                status = 'rejected', 
                rejected_at = NOW(), 
                rejected_by = ?,
                rejection_reason = ?
                WHERE id = ? AND status = 'pending_approval'";
            
            $stmt = $this->db->prepare($updateSql);
            $result = $stmt->execute([$adminId, $reason, $tournamentId]);

            if ($stmt->rowCount() === 0) {
                throw new \Exception('Tournament not found or already processed');
            }

            $tournament = $this->getTournamentById($tournamentId);

            // Send notification to organizer
            $message = "تم رفض بطولة {$tournament['name']}";
            if ($reason) {
                $message .= "\nالسبب: $reason";
            }

            $this->notificationService->create([
                'user_id' => $tournament['organizer_id'],
                'type' => 'tournament_rejected',
                'title' => 'تم رفض البطولة',
                'message' => $message,
                'metadata' => json_encode(['tournament_id' => $tournamentId, 'reason' => $reason])
            ]);

            $this->db->commit();
            return ['success' => true];

        } catch (\Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function toggleFeatured($tournamentId)
    {
        $sql = "UPDATE tournaments SET is_featured = NOT is_featured WHERE id = ? AND status = 'open'";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$tournamentId]);

        if ($stmt->rowCount() === 0) {
            throw new \Exception('Tournament not found or cannot be featured');
        }

        $tournament = $this->getTournamentById($tournamentId);
        return ['featured' => (bool)$tournament['is_featured']];
    }

    public function sendInvites($tournamentId, $organizerId, $userIds)
    {
        // Verify organizer permission
        $checkSql = "SELECT id FROM tournaments WHERE id = ? AND organizer_id = ? AND is_private = 1";
        $checkStmt = $this->db->prepare($checkSql);
        $checkStmt->execute([$tournamentId, $organizerId]);
        
        if (!$checkStmt->fetch()) {
            throw new \Exception('Tournament not found or not authorized');
        }

        $invites = [];
        foreach ($userIds as $userId) {
            // Create invitation record
            $inviteSql = "INSERT INTO tournament_invitations (tournament_id, user_id, invited_by, status) 
                          VALUES (?, ?, ?, 'pending') ON DUPLICATE KEY UPDATE invited_at = NOW()";
            $inviteStmt = $this->db->prepare($inviteSql);
            $inviteStmt->execute([$tournamentId, $userId, $organizerId]);

            // Send notification
            $tournament = $this->getTournamentById($tournamentId);
            $this->notificationService->create([
                'user_id' => $userId,
                'type' => 'tournament_invitation',
                'title' => 'دعوة للمشاركة في بطولة',
                'message' => "تم دعوتك للمشاركة في بطولة {$tournament['name']}",
                'metadata' => json_encode(['tournament_id' => $tournamentId])
            ]);

            $invites[] = ['user_id' => $userId, 'status' => 'sent'];
        }

        return $invites;
    }

    public function getTournamentStats()
    {
        $sql = "
            SELECT 
                COUNT(CASE WHEN status IN ('open', 'live') THEN 1 END) as active,
                SUM(current_participants) as participants,
                SUM(prize_pool) as prizes,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                COUNT(CASE WHEN status = 'live' THEN 1 END) as live,
                SUM(prize_pool) as totalPrizePool,
                SUM(current_participants) as totalParticipants,
                ROUND(
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / 
                    NULLIF(COUNT(CASE WHEN status IN ('completed', 'cancelled') THEN 1 END), 0),
                    1
                ) as completionRate
            FROM tournaments 
            WHERE status != 'pending_approval'
        ";

        $stmt = $this->db->query($sql);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getTournamentSettings()
    {
        // This would normally come from a settings table
        // For now, return default settings
        return [
            'formats' => [
                ['id' => 'single_elimination', 'name' => 'إقصاء مباشر', 'description' => 'الخاسر يخرج نهائياً', 'active' => true],
                ['id' => 'double_elimination', 'name' => 'إقصاء مزدوج', 'description' => 'فرصة ثانية للخاسرين', 'active' => true],
                ['id' => 'round_robin', 'name' => 'دوري', 'description' => 'الكل يلعب ضد الكل', 'active' => true],
                ['id' => 'swiss', 'name' => 'نظام سويسري', 'description' => 'مباريات متوازنة', 'active' => false]
            ],
            'gameModes' => [
                ['id' => 'classic', 'name' => 'كلاسيكي', 'icon' => '🎮', 'description' => 'نمط اللعب التقليدي', 'active' => true],
                ['id' => 'tournament', 'name' => 'بطولة', 'icon' => '🏆', 'description' => 'نمط البطولات الرسمية', 'active' => true],
                ['id' => 'ranked', 'name' => 'مرتب', 'icon' => '⭐', 'description' => 'مباريات مرتبة حسب المستوى', 'active' => true],
                ['id' => 'custom', 'name' => 'مخصص', 'icon' => '⚙️', 'description' => 'إعدادات مخصصة', 'active' => false]
            ],
            'maps' => [
                'classic' => ['Desert Fury', 'Winter Wolf', 'Green Pastures', 'Scorched Earth'],
                'tournament' => ['Tournament Desert', 'Desert Fury', 'Winter Wolf', 'Mountain Pass'],
                'ranked' => ['Desert Fury', 'Winter Wolf', 'Tournament Desert', 'Green Pastures', 'Scorched Earth'],
                'custom' => ['Urban Combat', 'Industrial Zone', 'Coastal Clash']
            ],
            'rules' => [
                'classic' => "قوانين نمط اللعب الكلاسيكي:\n1. استخدام الوحدات الافتراضية فقط\n2. ممنوع استخدام الغش أو البرامج المساعدة\n3. اللعب النظيف والاحترام المتبادل\n4. في حالة الانقطاع، إعادة المباراة من البداية",
                'tournament' => "قوانين البطولات الرسمية:\n1. جميع المباريات best of 3\n2. اختيار الخرائط حسب النظام المحدد\n3. ممنوع التوقف المؤقت إلا في حالات الطوارئ\n4. الحضور قبل 15 دقيقة من المباراة\n5. في حالة عدم الحضور، walkover للخصم",
                'ranked' => "قوانين المباريات المرتبة:\n1. المباريات حسب تصنيف اللاعبين\n2. استخدام نقاط ELO للترتيب\n3. اختيار عشوائي للخرائط من القائمة المحددة\n4. ممنوع اللعب مع نفس الخصم أكثر من 3 مرات يومياً",
                'custom' => "قوانين النمط المخصص:\n1. القوانين حسب إعدادات منظم البطولة\n2. يمكن تعديل قائمة الخرائط\n3. إعدادات مرونة أكثر للمنظمين\n4. يجب الإعلان عن القوانين قبل البطولة"
            ],
            'regions' => [
                ['id' => 'global', 'name' => 'عالمي', 'active' => true],
                ['id' => 'mena', 'name' => 'الشرق الأوسط وشمال أفريقيا', 'active' => true],
                ['id' => 'europe', 'name' => 'أوروبا', 'active' => true],
                ['id' => 'asia', 'name' => 'آسيا', 'active' => true],
                ['id' => 'americas', 'name' => 'الأمريكتين', 'active' => false]
            ]
        ];
    }

    public function updateTournamentSettings($settings)
    {
        // This would normally update a settings table
        // For now, just return the settings as confirmation
        return $settings;
    }

    public function postTournamentUpdate($tournamentId, $authorId, $data)
    {
        // Verify permission
        $checkSql = "SELECT t.*, ts.role FROM tournaments t 
                     LEFT JOIN tournament_staff ts ON t.id = ts.tournament_id AND ts.user_id = ?
                     WHERE t.id = ? AND (t.organizer_id = ? OR ts.role IN ('organizer', 'co_organizer') OR ? IN (SELECT id FROM users WHERE role = 'admin'))";
        
        $checkStmt = $this->db->prepare($checkSql);
        $checkStmt->execute([$authorId, $tournamentId, $authorId, $authorId]);
        
        if (!$checkStmt->fetch()) {
            throw new \Exception('Not authorized to post updates for this tournament');
        }

        // Insert update
        $sql = "INSERT INTO tournament_updates (tournament_id, author_id, title, content, type, notify_participants) 
                VALUES (?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            $tournamentId,
            $authorId,
            $data['title'],
            $data['content'],
            $data['type'] ?? 'general',
            $data['notifyParticipants'] ?? true
        ]);

        $updateId = $this->db->lastInsertId();

        // Send notifications if requested
        if ($data['notifyParticipants'] ?? true) {
            $this->notifyTournamentParticipants($tournamentId, $data['title'], $data['content']);
        }

        return ['id' => $updateId, 'success' => true];
    }

    public function getTournamentUpdates($tournamentId)
    {
        $sql = "
            SELECT 
                tu.*,
                u.username as author_name,
                u.avatar as author_avatar
            FROM tournament_updates tu
            LEFT JOIN users u ON tu.author_id = u.id
            WHERE tu.tournament_id = ?
            ORDER BY tu.created_at DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$tournamentId]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getTournamentBracket($tournamentId)
    {
        // This would return the bracket structure
        // For now, return empty structure
        return [
            'matches' => [],
            'format' => 'single_elimination',
            'rounds' => 0
        ];
    }

    public function getTournamentParticipants($tournamentId)
    {
        $sql = "
            SELECT 
                tp.*,
                u.username,
                u.avatar,
                u.rank,
                c.name as clan
            FROM tournament_participants tp
            LEFT JOIN users u ON tp.user_id = u.id
            LEFT JOIN clan_members cm ON u.id = cm.user_id
            LEFT JOIN clans c ON cm.clan_id = c.id
            WHERE tp.tournament_id = ?
            ORDER BY tp.registration_date ASC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$tournamentId]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Helper methods
    private function processTournaments($tournaments)
    {
        return array_map([$this, 'processTournament'], $tournaments);
    }

    private function processTournament($tournament)
    {
        if (isset($tournament['allowed_maps'])) {
            $tournament['allowed_maps'] = json_decode($tournament['allowed_maps'], true) ?? [];
        }
        
        if (isset($tournament['contact_info'])) {
            $tournament['contact_info'] = json_decode($tournament['contact_info'], true) ?? [];
        }

        // Convert boolean fields
        $booleanFields = ['is_private', 'require_approval', 'allow_spectators', 'is_featured', 'is_participant'];
        foreach ($booleanFields as $field) {
            if (isset($tournament[$field])) {
                $tournament[$field] = (bool)$tournament[$field];
            }
        }

        return $tournament;
    }

    private function sendTournamentInvitations($tournamentId, $invitedUsers)
    {
        foreach ($invitedUsers as $user) {
            $sql = "INSERT INTO tournament_invitations (tournament_id, user_id, status) VALUES (?, ?, 'pending')";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$tournamentId, $user['id']]);

            // Send notification
            $this->notificationService->create([
                'user_id' => $user['id'],
                'type' => 'tournament_invitation',
                'title' => 'دعوة للمشاركة في بطولة خاصة',
                'message' => 'تم دعوتك للمشاركة في بطولة خاصة',
                'metadata' => json_encode(['tournament_id' => $tournamentId])
            ]);
        }
    }

    private function addTournamentStaff($tournamentId, $userId, $role, $appointedBy)
    {
        $sql = "INSERT INTO tournament_staff (tournament_id, user_id, role, appointed_by) VALUES (?, ?, ?, ?)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$tournamentId, $userId, $role, $appointedBy]);
    }

    private function notifyTournamentParticipants($tournamentId, $title, $content)
    {
        $sql = "SELECT DISTINCT user_id FROM tournament_participants WHERE tournament_id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$tournamentId]);
        $participants = $stmt->fetchAll(PDO::FETCH_COLUMN);

        foreach ($participants as $userId) {
            $this->notificationService->create([
                'user_id' => $userId,
                'type' => 'tournament_update',
                'title' => $title,
                'message' => $content,
                'metadata' => json_encode(['tournament_id' => $tournamentId])
            ]);
        }
    }
} 