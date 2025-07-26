<?php

namespace App\Controllers;

use PDO;
use PDOException;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ClanController
{
    private PDO $db;
    
    public function __construct(PDO $db)
    {
        $this->db = $db;
    }
    
    /**
     * Get all approved clans
     */
    public function getAllClans(Request $request, Response $response): Response
    {
        try {
            $stmt = $this->db->prepare("
                SELECT c.*, u.username as owner_username, u.first_name as owner_name,
                       COUNT(cm.id) as member_count
                FROM clans c 
                LEFT JOIN users u ON c.owner_id = u.id
                LEFT JOIN clan_members cm ON c.id = cm.clan_id
                WHERE c.is_approved = 1 AND c.is_active = 1
                GROUP BY c.id
                ORDER BY c.total_points DESC
            ");
            $stmt->execute();
            $clans = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $clans
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (PDOException $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()
            ]));
            
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
    
    /**
     * Get clan by ID
     */
    public function getClan(Request $request, Response $response, array $args): Response
    {
        $clanId = (int) $args['id'];
        
        try {
            $stmt = $this->db->prepare("
                SELECT c.*, u.username as owner_username, u.first_name as owner_name
                FROM clans c 
                LEFT JOIN users u ON c.owner_id = u.id
                WHERE c.id = ? AND c.is_approved = 1 AND c.is_active = 1
            ");
            $stmt->execute([$clanId]);
            $clan = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$clan) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'العشيرة غير موجودة'
                ]));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }
            
            // Get clan members
            $stmt = $this->db->prepare("
                SELECT cm.*, u.username, u.first_name, u.level, u.rank_points
                FROM clan_members cm
                JOIN users u ON cm.user_id = u.id
                WHERE cm.clan_id = ?
                ORDER BY 
                    CASE cm.role 
                        WHEN 'leader' THEN 1 
                        WHEN 'officer' THEN 2 
                        WHEN 'member' THEN 3 
                    END,
                    cm.contribution_points DESC
            ");
            $stmt->execute([$clanId]);
            $clan['members'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $clan
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (PDOException $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()
            ]));
            
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
    
    /**
     * Get user's clan
     */
    public function getUserClan(Request $request, Response $response, array $args): Response
    {
        $userId = (int) $args['userId'];
        
        try {
            // Check if user owns a clan
            $stmt = $this->db->prepare("
                SELECT c.*, 'leader' as user_role
                FROM clans c 
                WHERE c.owner_id = ? AND c.is_approved = 1 AND c.is_active = 1
            ");
            $stmt->execute([$userId]);
            $clan = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // If not owner, check if member
            if (!$clan) {
                $stmt = $this->db->prepare("
                    SELECT c.*, cm.role as user_role, cm.contribution_points, cm.joined_at
                    FROM clans c 
                    JOIN clan_members cm ON c.id = cm.clan_id
                    WHERE cm.user_id = ? AND c.is_approved = 1 AND c.is_active = 1
                ");
                $stmt->execute([$userId]);
                $clan = $stmt->fetch(PDO::FETCH_ASSOC);
            }
            
            if (!$clan) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'المستخدم ليس عضواً في أي عشيرة'
                ]));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }
            
            // Get clan members
            $stmt = $this->db->prepare("
                SELECT cm.*, u.username, u.first_name, u.level, u.rank_points
                FROM clan_members cm
                JOIN users u ON cm.user_id = u.id
                WHERE cm.clan_id = ?
                ORDER BY 
                    CASE cm.role 
                        WHEN 'leader' THEN 1 
                        WHEN 'officer' THEN 2 
                        WHEN 'member' THEN 3 
                    END,
                    cm.contribution_points DESC
            ");
            $stmt->execute([$clan['id']]);
            $clan['members'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $clan
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (PDOException $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()
            ]));
            
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
    
    /**
     * Get clan wars
     */
    public function getClanWars(Request $request, Response $response, array $args): Response
    {
        $clanId = (int) $args['clanId'];
        
        try {
            $stmt = $this->db->prepare("
                SELECT cw.*, 
                       c1.name as challenger_name, c1.tag as challenger_tag,
                       c2.name as challenged_name, c2.tag as challenged_tag,
                       u.username as created_by_username
                FROM clan_wars cw
                LEFT JOIN clans c1 ON cw.challenger_clan_id = c1.id
                LEFT JOIN clans c2 ON cw.challenged_clan_id = c2.id
                LEFT JOIN users u ON cw.created_by = u.id
                WHERE cw.challenger_clan_id = ? OR cw.challenged_clan_id = ?
                ORDER BY cw.created_at DESC
            ");
            $stmt->execute([$clanId, $clanId]);
            $wars = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'data' => $wars
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (PDOException $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()
            ]));
            
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
    
    /**
     * Create war challenge
     */
    public function createWar(Request $request, Response $response): Response
    {
        $data = json_decode($request->getBody()->getContents(), true);
        
        // Validate required fields
        $required = ['challenger_clan_id', 'challenged_clan_id', 'scheduled_at', 'created_by'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => "الحقل {$field} مطلوب"
                ]));
                return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
            }
        }
        
        try {
            $stmt = $this->db->prepare("
                INSERT INTO clan_wars (
                    challenger_clan_id, challenged_clan_id, scheduled_at, 
                    duration, rules, challenge_message, status, created_by
                ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
            ");
            
            $stmt->execute([
                $data['challenger_clan_id'],
                $data['challenged_clan_id'],
                $data['scheduled_at'],
                $data['duration'] ?? 48,
                $data['rules'] ?? '',
                $data['challenge_message'] ?? '',
                $data['created_by']
            ]);
            
            $warId = $this->db->lastInsertId();
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => 'تم إرسال تحدي الحرب بنجاح',
                'data' => ['id' => $warId]
            ]));
            
            return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
            
        } catch (PDOException $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()
            ]));
            
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
    
    /**
     * Respond to war challenge
     */
    public function respondToWar(Request $request, Response $response, array $args): Response
    {
        $warId = (int) $args['warId'];
        $data = json_decode($request->getBody()->getContents(), true);
        
        if (!isset($data['action']) || !in_array($data['action'], ['accept', 'reject'])) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'الإجراء غير صحيح'
            ]));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        try {
            $status = $data['action'] === 'accept' ? 'accepted' : 'rejected';
            $acceptedAt = $data['action'] === 'accept' ? date('Y-m-d H:i:s') : null;
            
            $stmt = $this->db->prepare("
                UPDATE clan_wars 
                SET status = ?, accepted_at = ?
                WHERE id = ? AND status = 'pending'
            ");
            
            $stmt->execute([$status, $acceptedAt, $warId]);
            
            if ($stmt->rowCount() === 0) {
                $response->getBody()->write(json_encode([
                    'success' => false,
                    'message' => 'الحرب غير موجودة أو تم الرد عليها مسبقاً'
                ]));
                return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
            }
            
            $message = $data['action'] === 'accept' ? 'تم قبول التحدي' : 'تم رفض التحدي';
            
            $response->getBody()->write(json_encode([
                'success' => true,
                'message' => $message
            ]));
            
            return $response->withHeader('Content-Type', 'application/json');
            
        } catch (PDOException $e) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'خطأ في قاعدة البيانات: ' . $e->getMessage()
            ]));
            
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }
    }
} 