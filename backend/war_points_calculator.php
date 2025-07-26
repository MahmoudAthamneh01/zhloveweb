<?php
// نظام حساب النقاط للحروب
// War Points Calculation System

class WarPointsCalculator {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    /**
     * حساب النقاط بناءً على نتيجة الحرب
     * @param int $war_id معرف الحرب
     * @param int $winner_clan_id معرف العشيرة الفائزة
     * @param int $loser_clan_id معرف العشيرة الخاسرة
     * @param string $war_type نوع الحرب
     * @return array نتائج حساب النقاط
     */
    public function calculateWarPoints($war_id, $winner_clan_id, $loser_clan_id, $war_type_id) {
        try {
            // الحصول على تفاصيل نوع الحرب
            $stmt = $this->db->prepare("SELECT * FROM war_types WHERE id = ?");
            $stmt->execute([$war_type_id]);
            $warType = $stmt->fetch();
            
            if (!$warType) {
                throw new Exception("نوع الحرب غير موجود");
            }
            
            // الحصول على تفاصيل العشائر
            $stmt = $this->db->prepare("SELECT id, name, total_points, level FROM clans WHERE id IN (?, ?)");
            $stmt->execute([$winner_clan_id, $loser_clan_id]);
            $clans = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $winner_clan = null;
            $loser_clan = null;
            
            foreach ($clans as $clan) {
                if ($clan['id'] == $winner_clan_id) {
                    $winner_clan = $clan;
                } else {
                    $loser_clan = $clan;
                }
            }
            
            if (!$winner_clan || !$loser_clan) {
                throw new Exception("العشائر غير موجودة");
            }
            
            // حساب النقاط بناءً على عوامل مختلفة
            $base_winner_points = $warType['winner_points'];
            $base_loser_points = $warType['loser_points'];
            
            // عامل الفرق في المستوى
            $level_difference = $loser_clan['level'] - $winner_clan['level'];
            $level_multiplier = 1.0;
            
            if ($level_difference > 0) {
                // الفوز على عشيرة أقوى يعطي نقاط إضافية
                $level_multiplier = 1.0 + ($level_difference * 0.1);
            } elseif ($level_difference < 0) {
                // الفوز على عشيرة أضعف يعطي نقاط أقل
                $level_multiplier = max(0.5, 1.0 + ($level_difference * 0.05));
            }
            
            // عامل الفرق في النقاط
            $points_difference = $loser_clan['total_points'] - $winner_clan['total_points'];
            $points_multiplier = 1.0;
            
            if ($points_difference > 0) {
                // الفوز على عشيرة لديها نقاط أكثر
                $points_multiplier = 1.0 + min(($points_difference / 1000) * 0.1, 0.5);
            }
            
            // حساب النقاط النهائية
            $final_winner_points = round($base_winner_points * $level_multiplier * $points_multiplier);
            $final_loser_points = round($base_loser_points * 0.8); // الخاسر يفقد نقاط أقل
            
            // عامل الحد الأدنى والأقصى
            $final_winner_points = max(50, min($final_winner_points, 2000));
            $final_loser_points = max(10, min($final_loser_points, 200));
            
            return [
                'winner_points' => $final_winner_points,
                'loser_points' => -$final_loser_points, // سالبة للخاسر
                'level_multiplier' => $level_multiplier,
                'points_multiplier' => $points_multiplier,
                'details' => [
                    'war_type' => $warType['name'],
                    'winner_clan' => $winner_clan['name'],
                    'loser_clan' => $loser_clan['name'],
                    'level_difference' => $level_difference,
                    'points_difference' => $points_difference
                ]
            ];
            
        } catch (Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }
    
    /**
     * تطبيق النقاط على العشائر وتحديث الإحصائيات
     */
    public function applyWarResults($war_id, $winner_clan_id, $loser_clan_id, $war_type_id) {
        try {
            $this->db->beginTransaction();
            
            // حساب النقاط
            $points_result = $this->calculateWarPoints($war_id, $winner_clan_id, $loser_clan_id, $war_type_id);
            
            if (isset($points_result['error'])) {
                throw new Exception($points_result['error']);
            }
            
            // تحديث نقاط العشيرة الفائزة
            $stmt = $this->db->prepare("UPDATE clans SET total_points = total_points + ? WHERE id = ?");
            $stmt->execute([$points_result['winner_points'], $winner_clan_id]);
            
            // تحديث نقاط العشيرة الخاسرة
            $stmt = $this->db->prepare("UPDATE clans SET total_points = GREATEST(0, total_points + ?) WHERE id = ?");
            $stmt->execute([$points_result['loser_points'], $loser_clan_id]);
            
            // الحصول على النقاط الجديدة
            $stmt = $this->db->prepare("SELECT total_points FROM clans WHERE id IN (?, ?)");
            $stmt->execute([$winner_clan_id, $loser_clan_id]);
            $new_points = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // تسجيل تاريخ النقاط للعشيرة الفائزة
            $stmt = $this->db->prepare("
                INSERT INTO clan_points_history 
                (clan_id, war_id, points_change, points_before, points_after, reason, description) 
                VALUES (?, ?, ?, ?, ?, 'war_win', ?)
            ");
            $winner_points_before = $new_points[0]['total_points'] - $points_result['winner_points'];
            $stmt->execute([
                $winner_clan_id, 
                $war_id, 
                $points_result['winner_points'], 
                $winner_points_before,
                $new_points[0]['total_points'],
                'فوز في الحرب: ' . $points_result['details']['war_type']
            ]);
            
            // تسجيل تاريخ النقاط للعشيرة الخاسرة
            $stmt = $this->db->prepare("
                INSERT INTO clan_points_history 
                (clan_id, war_id, points_change, points_before, points_after, reason, description) 
                VALUES (?, ?, ?, ?, ?, 'war_loss', ?)
            ");
            $loser_points_before = $new_points[1]['total_points'] - $points_result['loser_points'];
            $stmt->execute([
                $loser_clan_id, 
                $war_id, 
                $points_result['loser_points'], 
                $loser_points_before,
                $new_points[1]['total_points'],
                'خسارة في الحرب: ' . $points_result['details']['war_type']
            ]);
            
            // تحديث إحصائيات الحروب
            $this->updateWarStats($winner_clan_id, $loser_clan_id);
            
            // تحديث مستويات العشائر
            $this->updateClanLevels([$winner_clan_id, $loser_clan_id]);
            
            $this->db->commit();
            
            return [
                'success' => true,
                'points_awarded' => $points_result,
                'message' => 'تم تطبيق نتائج الحرب بنجاح'
            ];
            
        } catch (Exception $e) {
            $this->db->rollBack();
            return ['error' => $e->getMessage()];
        }
    }
    
    /**
     * تحديث إحصائيات الحروب للعشائر
     */
    private function updateWarStats($winner_clan_id, $loser_clan_id) {
        // تحديث إحصائيات العشيرة الفائزة
        $stmt = $this->db->prepare("
            INSERT INTO clan_war_stats (clan_id, total_wars, wars_won, win_rate, current_streak, best_streak, last_war_date)
            VALUES (?, 1, 1, 100.00, 1, 1, NOW())
            ON DUPLICATE KEY UPDATE
                total_wars = total_wars + 1,
                wars_won = wars_won + 1,
                win_rate = (wars_won * 100.0) / total_wars,
                current_streak = current_streak + 1,
                best_streak = GREATEST(best_streak, current_streak + 1),
                last_war_date = NOW()
        ");
        $stmt->execute([$winner_clan_id]);
        
        // تحديث إحصائيات العشيرة الخاسرة
        $stmt = $this->db->prepare("
            INSERT INTO clan_war_stats (clan_id, total_wars, wars_lost, win_rate, current_streak, last_war_date)
            VALUES (?, 1, 1, 0.00, 0, NOW())
            ON DUPLICATE KEY UPDATE
                total_wars = total_wars + 1,
                wars_lost = wars_lost + 1,
                win_rate = (wars_won * 100.0) / total_wars,
                current_streak = 0,
                last_war_date = NOW()
        ");
        $stmt->execute([$loser_clan_id]);
    }
    
    /**
     * تحديث مستويات العشائر بناءً على النقاط
     */
    private function updateClanLevels($clan_ids) {
        foreach ($clan_ids as $clan_id) {
            $stmt = $this->db->prepare("SELECT total_points FROM clans WHERE id = ?");
            $stmt->execute([$clan_id]);
            $clan = $stmt->fetch();
            
            if ($clan) {
                $new_level = $this->calculateClanLevel($clan['total_points']);
                
                $stmt = $this->db->prepare("UPDATE clans SET level = ? WHERE id = ?");
                $stmt->execute([$new_level, $clan_id]);
            }
        }
    }
    
    /**
     * حساب مستوى العشيرة بناءً على النقاط
     */
    private function calculateClanLevel($points) {
        if ($points >= 10000) return 10;
        if ($points >= 8000) return 9;
        if ($points >= 6000) return 8;
        if ($points >= 4500) return 7;
        if ($points >= 3000) return 6;
        if ($points >= 2000) return 5;
        if ($points >= 1200) return 4;
        if ($points >= 600) return 3;
        if ($points >= 200) return 2;
        return 1;
    }
    
    /**
     * الحصول على تصنيف العشائر حسب النقاط
     */
    public function getClanRankings($limit = 50) {
        $stmt = $this->db->prepare("
            SELECT c.id, c.name, c.tag, c.total_points, c.level, c.total_members,
                   cws.total_wars, cws.wars_won, cws.wars_lost, cws.win_rate,
                   cws.current_streak, cws.best_streak
            FROM clans c
            LEFT JOIN clan_war_stats cws ON c.id = cws.clan_id
            WHERE c.is_active = 1 AND c.is_approved = 1
            ORDER BY c.total_points DESC, cws.win_rate DESC
            LIMIT ?
        ");
        $stmt->execute([$limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

// مثال على الاستخدام:
/*
$calculator = new WarPointsCalculator($db);
$result = $calculator->applyWarResults($war_id, $winner_clan_id, $loser_clan_id, $war_type_id);

if ($result['success']) {
    echo "تم تطبيق النقاط بنجاح!";
    echo "النقاط الممنوحة: " . $result['points_awarded']['winner_points'];
} else {
    echo "خطأ: " . $result['error'];
}
*/
?>
