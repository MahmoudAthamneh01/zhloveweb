-- ================================================
-- ZH-Love Development Data
-- User accounts and clans for testing
-- ================================================

USE zh_love_db;

-- Clear existing test data
DELETE FROM clan_wars;
DELETE FROM clan_join_applications; 
DELETE FROM clan_applications;
DELETE FROM clan_members;
DELETE FROM clans;
DELETE FROM users WHERE id > 1;

-- Reset auto increment
ALTER TABLE users AUTO_INCREMENT = 2;
ALTER TABLE clans AUTO_INCREMENT = 1;

-- ================================================
-- DEVELOPMENT USERS
-- ================================================

-- Insert clan leaders and members (password: 123456)
INSERT INTO users (username, email, password_hash, first_name, last_name, bio, country, avatar, role, level, xp, total_matches, wins, losses, win_rate, rank_points, is_verified) VALUES
-- Main test users that will persist in localStorage
('test_user', 'test@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'مستخدم', 'تجريبي', 'المستخدم الرئيسي للاختبار', 'Saudi Arabia', '/uploads/avatars/test_user.jpg', 'player', 50, 25000, 80, 64, 16, 80.00, 1800, 1),

-- Clan leaders
('zh_master', 'master@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'أحمد', 'المحترف', 'قائد كلان الذئاب المحاربة منذ 2020', 'Egypt', '/uploads/avatars/zh_master.jpg', 'player', 85, 42000, 150, 135, 15, 90.00, 2200, 1),
('generals_pro', 'pro@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'محمد', 'البطل', 'قائد كلان أسياد الحرب', 'Saudi Arabia', '/uploads/avatars/generals_pro.jpg', 'player', 92, 47500, 180, 162, 18, 90.00, 2350, 1),
('desert_storm', 'desert@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'خالد', 'العاصفة', 'قائد كلان عاصفة الصحراء', 'Morocco', '/uploads/avatars/desert_storm.jpg', 'player', 65, 28000, 100, 75, 25, 75.00, 1800, 1),
('zh_legend', 'legend@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'عمر', 'الأسطورة', 'قائد كلان فرسان الشرق', 'Iraq', '/uploads/avatars/zh_legend.jpg', 'player', 88, 44000, 160, 144, 16, 90.00, 2100, 1),
('golden_eagle', 'eagle@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'سامي', 'النسر', 'قائد كلان النسور الذهبية', 'Algeria', '/uploads/avatars/golden_eagle.jpg', 'player', 75, 32000, 95, 76, 19, 80.00, 1900, 1),

-- Clan officers and members
('tactical_gamer', 'tactical@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'علي', 'التكتيكي', 'ضابط في كلان الذئاب المحاربة', 'UAE', '/uploads/avatars/tactical_gamer.jpg', 'player', 78, 35000, 120, 96, 24, 80.00, 1950, 1),
('air_commander', 'air@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'سامي', 'الطيار', 'ضابط في كلان عاصفة الصحراء', 'Lebanon', '/uploads/avatars/air_commander.jpg', 'player', 72, 31000, 110, 88, 22, 80.00, 1850, 1),
('tank_master', 'tank@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'يوسف', 'الدبابة', 'عضو في كلان الذئاب المحاربة', 'Palestine', '/uploads/avatars/tank_master.jpg', 'player', 69, 29500, 105, 84, 21, 80.00, 1750, 1),

-- Users with pending clan applications
('fire_eagle', 'fire@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'حسام', 'النسر', 'يريد إنشاء كلان جنود البرق', 'Tunisia', '/uploads/avatars/fire_eagle.jpg', 'player', 62, 26000, 80, 56, 24, 70.00, 1650, 1),
('storm_rider', 'storm@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'نادر', 'العاصفة', 'يريد إنشاء كلان أشباح الليل', 'Syria', '/uploads/avatars/storm_rider.jpg', 'player', 58, 23000, 70, 49, 21, 70.00, 1550, 1),
('shadow_knight', 'shadow@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'أمين', 'الفارس', 'يريد إنشاء كلان فرسان الظلام', 'Morocco', '/uploads/avatars/shadow_knight.jpg', 'player', 54, 21000, 65, 45, 20, 69.23, 1450, 1);

-- ================================================
-- APPROVED CLANS
-- ================================================

INSERT INTO clans (name, tag, description, logo, owner_id, total_members, total_points, level, is_recruiting, is_approved) VALUES
('نسور الشرق', 'EAST', 'عشيرة نخبة للاعبين المحترفين في الشرق الأوسط', '/uploads/clans/east-eagles.jpg', 2, 1, 25000, 5, 1, 1),
('الذئاب المحاربة', 'WAR', 'كلان محترف متخصص في المعارك الاستراتيجية والبطولات الكبرى', '/uploads/clans/war-wolves.jpg', 3, 3, 15420, 8, 1, 1),
('أسياد الحرب', 'LORDS', 'كلان النخبة للاعبين المحترفين فقط', '/uploads/clans/war-lords.jpg', 4, 1, 12800, 7, 0, 1),
('عاصفة الصحراء', 'STORM', 'كلان سريع ومتميز في المعارك السريعة', '/uploads/clans/desert-storm.jpg', 5, 2, 11200, 6, 1, 1),
('فرسان الشرق', 'KNIGHTS', 'كلان تقليدي يركز على الشرف والروح الرياضية', '/uploads/clans/eastern-knights.jpg', 6, 1, 13500, 5, 1, 1),
('النسور الذهبية', 'GOLD', 'كلان جديد طموح يسعى للوصول للقمة', '/uploads/clans/golden-eagles.jpg', 7, 1, 8900, 4, 1, 1);

-- ================================================
-- NON-APPROVED CLANS (for testing admin approval)
-- ================================================

INSERT INTO clans (name, tag, description, logo, owner_id, total_members, total_points, level, is_recruiting, is_approved) VALUES
('جنود البرق', 'LIGHT', 'كلان جديد يبحث عن الموافقة من الإدارة', '/uploads/clans/lightning-soldiers.jpg', 10, 1, 2500, 1, 1, 0),
('أشباح الليل', 'GHOST', 'كلان متخصص في التكتيكات الليلية', '/uploads/clans/night-ghosts.jpg', 11, 1, 1800, 1, 1, 0);

-- ================================================
-- CLAN MEMBERS
-- ================================================

INSERT INTO clan_members (clan_id, user_id, role, contribution_points) VALUES
-- East Eagles (test_user's clan)
(1, 2, 'leader', 5000),
-- War Wolves members
(2, 3, 'leader', 5000),
(2, 8, 'officer', 3500),
(2, 10, 'member', 2800),
-- War Lords members
(3, 4, 'leader', 4800),
-- Desert Storm members
(4, 5, 'leader', 3200),
(4, 9, 'officer', 2900),
-- Eastern Knights members
(5, 6, 'leader', 3800),
-- Golden Eagles members
(6, 7, 'leader', 2100),
-- Non-approved clans
(7, 10, 'leader', 500),
(8, 11, 'leader', 300);

-- ================================================
-- CLAN APPLICATIONS
-- ================================================

INSERT INTO clan_applications (clan_name, clan_tag, description, organizer_id, organizer_name, organizer_email, organizer_country, organizer_experience, region, language, membership_type, min_level, min_win_rate, max_members, status, reviewed_by, reviewed_at) VALUES
-- Approved applications (for reference)
('نسور الشرق', 'EAST', 'عشيرة نخبة للاعبين المحترفين', 2, 'مستخدم تجريبي', 'test@zh-love.com', 'Saudi Arabia', 'intermediate', 'middle-east', 'ar', 'application', 40, 70, 50, 'approved', 1, '2024-02-01 10:00:00'),
('الذئاب المحاربة', 'WAR', 'كلان محترف متخصص في المعارك الاستراتيجية', 3, 'أحمد المحترف', 'master@zh-love.com', 'Egypt', 'expert', 'middle-east', 'ar', 'application', 50, 75, 30, 'approved', 1, '2024-01-15 10:00:00'),

-- Pending applications (for admin to review)
('محاربو الصحراء', 'DESERT', 'كلان جديد يركز على استراتيجيات الصحراء المتقدمة', 10, 'حسام النسر', 'fire@zh-love.com', 'Tunisia', 'advanced', 'north-africa', 'ar', 'application', 40, 65, 35, 'pending', NULL, NULL),
('فرسان الظلام', 'DARK', 'كلان متخصص في التكتيكات الليلية والهجمات الخاطفة', 12, 'أمين الفارس', 'shadow@zh-love.com', 'Morocco', 'intermediate', 'north-africa', 'ar', 'application', 35, 60, 40, 'pending', NULL, NULL),
('ملوك الاستراتيجية', 'KINGS', 'كلان للاعبين المتقدمين في التخطيط الاستراتيجي', 11, 'نادر العاصفة', 'storm@zh-love.com', 'Syria', 'expert', 'levant', 'ar', 'invite-only', 60, 80, 25, 'pending', NULL, NULL);

-- ================================================
-- CLAN JOIN APPLICATIONS
-- ================================================

INSERT INTO clan_join_applications (clan_id, user_id, player_name, player_level, win_rate, motivation, status) VALUES
-- Pending applications to join existing clans
(2, 10, 'حسام النسر', 62, 70.00, 'أريد الانضمام لكلان محترف لتطوير مهاراتي في المعارك الاستراتيجية', 'pending'),
(2, 11, 'نادر العاصفة', 58, 70.00, 'لدي خبرة جيدة في التكتيكات المتقدمة وأريد المساهمة', 'pending'),
(3, 9, 'سامي الطيار', 72, 80.00, 'متخصص في القوات الجوية وأريد الانضمام للنخبة', 'pending'),
(4, 12, 'أمين الفارس', 54, 69.23, 'خبير في وحدات المدرعات والتكتيكات الصحراوية', 'pending'),

-- Some approved/rejected for testing
(1, 8, 'علي التكتيكي', 78, 80.00, 'ضابط سابق يريد الانضمام', 'approved'),
(4, 10, 'حسام النسر', 62, 70.00, 'طلب سابق', 'rejected');

-- ================================================
-- CLAN WARS
-- ================================================

INSERT INTO clan_wars (challenger_clan_id, challenged_clan_id, scheduled_at, duration, rules, challenge_message, status, created_by, challenger_score, challenged_score, winner_id, completed_at) VALUES
-- Completed wars (for history)
(2, 6, '2024-02-01 20:00:00', 48, 'حرب عادية بدون قيود خاصة', 'تحدي ودي للتدريب', 'completed', 3, 15, 8, 2, '2024-02-03 22:00:00'),
(5, 4, '2024-02-05 19:00:00', 72, 'حرب صحراوية فقط', 'معركة الشرف والكرامة', 'completed', 6, 12, 18, 4, '2024-02-08 21:00:00'),

-- Pending war requests (what the user will see)
(4, 1, '2024-02-25 20:00:00', 48, 'حرب كاملة بجميع الوحدات المتاحة', 'تحدي من عاصفة الصحراء لنسور الشرق', 'pending', 5),
(3, 1, '2024-02-28 19:00:00', 72, 'حرب نخبة للمحترفين فقط - بدون قيود', 'معركة الأساطير بين النخبة', 'pending', 4),

-- Active war
(2, 5, '2024-02-20 20:00:00', 48, 'حرب متقدمة بجميع الاستراتيجيات', 'معركة فاصلة بين المحاربين', 'active', 3);

-- ================================================
-- SUMMARY REPORT
-- ================================================

SELECT 'Development data inserted successfully!' as message;
SELECT 
    (SELECT COUNT(*) FROM users WHERE id > 1) as total_test_users,
    (SELECT COUNT(*) FROM clans WHERE is_approved = 1) as approved_clans,
    (SELECT COUNT(*) FROM clans WHERE is_approved = 0) as pending_clans,
    (SELECT COUNT(*) FROM clan_applications WHERE status = 'pending') as pending_applications,
    (SELECT COUNT(*) FROM clan_join_applications WHERE status = 'pending') as pending_join_requests,
    (SELECT COUNT(*) FROM clan_wars WHERE status = 'pending') as pending_wars,
    (SELECT COUNT(*) FROM clan_wars WHERE status = 'active') as active_wars; 