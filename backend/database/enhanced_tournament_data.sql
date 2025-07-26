-- ================================================
-- ZH-Love Enhanced Tournament Data
-- Real tournament information with active participants and prizes
-- ================================================

USE zh_love_db;

-- Clear existing tournament data
DELETE FROM tournament_participants;
DELETE FROM matches;
DELETE FROM tournaments;

-- Insert realistic tournaments with current data
INSERT INTO tournaments (
    name, description, image, type, format, status, gameMode, 
    maxParticipants, currentParticipants, prizePool, currency, entryFee,
    startDate, endDate, registrationDeadline, organizer_id,
    rules, contactInfo, maps, featured, requireApproval,
    region, difficulty, streamUrl, discordServer
) VALUES
-- Active Tournament 1: Grand Championship
(
    'بطولة الجنرالات الكبرى 2024',
    'البطولة الأكبر والأهم في المجتمع العربي للجنرالات زيرو ساعة. تضم أقوى اللاعبين والكلانات من جميع أنحاء المنطقة في منافسة شرسة على لقب البطل والجوائز القيمة.',
    '/uploads/tournaments/grand-championship-2024.jpg',
    'single_elimination',
    '1v1',
    'registration',
    'tournament',
    128,
    89,
    2500.00,
    'USD',
    15.00,
    '2024-03-15 18:00:00',
    '2024-03-22 22:00:00',
    '2024-03-14 23:59:59',
    1,
    'قوانين البطولة الرسمية:
1. الحضور قبل 15 دقيقة من المباراة
2. عدم التأخير أكثر من 10 دقائق (انسحاب تلقائي)
3. الفصائل المسموحة: جميع الفصائل
4. مدة المباراة القصوى: 45 دقيقة
5. ممنوع استخدام الغش أو التلاعب
6. احترام جميع المشاركين والإدارة
7. استخدام الخرائط المحددة فقط
8. تسجيل المباريات مطلوب',
    JSON_OBJECT(
        'discord', 'https://discord.gg/zh-love-grand',
        'telegram', 'https://t.me/zh_love_grand',
        'email', 'grand@zh-love.com'
    ),
    JSON_ARRAY('Desert Fury', 'Tournament Desert', 'Scorched Earth', 'Winter Wolf', 'Green Pastures'),
    true,
    true,
    'MENA',
    'pro',
    'https://youtube.com/watch?v=zh-love-grand',
    'https://discord.gg/zh-love-grand'
),

-- Active Tournament 2: Clan Wars Weekly
(
    'تحدي الكلانات الأسبوعي',
    'مسابقة أسبوعية بين الكلانات العربية لتحديد الأقوى. كل كلان يرسل أفضل 5 لاعبين للتنافس في معارك ملحمية على مستوى عالي من التنسيق والاستراتيجية.',
    '/uploads/tournaments/weekly-clan-battle.jpg',
    'round_robin',
    'team',
    'in_progress',
    'clan_war',
    20,
    16,
    500.00,
    'USD',
    0.00,
    '2024-02-26 19:00:00',
    '2024-03-03 21:00:00',
    '2024-02-25 23:59:59',
    1,
    'قوانين حروب الكلانات:
1. كل كلان يرسل 5 لاعبين أساسيين + 2 احتياط
2. التنسيق بين أعضاء الكلان مسموح ومطلوب
3. لا يجوز تغيير تشكيلة الكلان أثناء البطولة
4. مدة المباراة: 60 دقيقة
5. استراتيجية الكلان حرة
6. احترام الكلانات المنافسة
7. استخدام Discord للتنسيق مطلوب',
    JSON_OBJECT(
        'discord', 'https://discord.gg/zh-love-clans',
        'telegram', 'https://t.me/zh_love_clans',
        'email', 'clans@zh-love.com'
    ),
    JSON_ARRAY('Desert Fury', 'Tournament Desert', 'Urban Combat', 'Industrial Zone'),
    true,
    false,
    'MENA',
    'advanced',
    'https://youtube.com/watch?v=zh-love-clans',
    'https://discord.gg/zh-love-clans'
),

-- Completed Tournament 1: Middle East Cup
(
    'كأس الشرق الأوسط',
    'بطولة إقليمية تجمع أفضل اللاعبين من الشرق الأوسط في منافسة قوية. تتميز بنظام الإقصاء المزدوج الذي يعطي فرصة ثانية للجميع والذي حقق نجاحاً كبيراً.',
    '/uploads/tournaments/middle-east-cup.jpg',
    'double_elimination',
    '1v1',
    'completed',
    'ranked',
    64,
    64,
    1200.00,
    'USD',
    8.00,
    '2024-02-01 20:00:00',
    '2024-02-15 22:00:00',
    '2024-01-31 23:59:59',
    6,
    'قوانين كأس الشرق الأوسط:
1. إقصاء مزدوج - فرصة ثانية لكل لاعب
2. 3 خرائط محظورة لكل لاعب
3. المباراة من 3 جولات (أفضل من 3)
4. مدة الجولة: 40 دقيقة
5. للاعبين من الشرق الأوسط فقط
6. تأكيد الهوية مطلوب',
    JSON_OBJECT(
        'discord', 'https://discord.gg/middle-east-cup',
        'telegram', 'https://t.me/middle_east_cup',
        'email', 'legend@zh-love.com'
    ),
    JSON_ARRAY('Desert Fury', 'Winter Wolf', 'Tournament Desert', 'Green Pastures', 'Scorched Earth'),
    false,
    true,
    'MENA',
    'pro',
    null,
    'https://discord.gg/middle-east-cup'
),

-- Completed Tournament 2: Beginners Monthly
(
    'بطولة المبتدئين الشهرية',
    'بطولة خاصة للاعبين الجدد في المجتمع. فرصة رائعة لتعلم الأساسيات وخوض تجربة البطولات الأولى مع لاعبين في نفس المستوى. تحظى بشعبية كبيرة.',
    '/uploads/tournaments/beginners-monthly.jpg',
    'single_elimination',
    '1v1',
    'completed',
    'casual',
    32,
    32,
    200.00,
    'USD',
    0.00,
    '2024-02-10 18:00:00',
    '2024-02-17 20:00:00',
    '2024-02-09 23:59:59',
    4,
    'قوانين بطولة المبتدئين:
1. للمبتدئين فقط - تحت مستوى 50
2. إعدادات اللعب المبسطة
3. خرائط سهلة ومناسبة للمبتدئين
4. مدة المباراة: 30 دقيقة
5. مساعدة المبتدئين مسموحة
6. روح رياضية عالية مطلوبة
7. تعلم وممارسة',
    JSON_OBJECT(
        'discord', 'https://discord.gg/beginners-tournament',
        'telegram', 'https://t.me/beginners_tournament',
        'email', 'tactical@zh-love.com'
    ),
    JSON_ARRAY('Green Pastures', 'Tournament Desert', 'Desert Fury'),
    false,
    false,
    'MENA',
    'beginner',
    null,
    'https://discord.gg/beginners-tournament'
),

-- Upcoming Tournament 1: 2v2 Challenge
(
    'تحدي الـ 2v2 الكبير',
    'أول بطولة 2v2 في المجتمع العربي. فرق من لاعبين يتنافسون في معارك تكتيكية مثيرة تتطلب التنسيق والعمل الجماعي على أعلى مستوى.',
    '/uploads/tournaments/2v2-challenge.jpg',
    'single_elimination',
    '2v2',
    'upcoming',
    'ranked',
    48,
    24,
    800.00,
    'USD',
    20.00,
    '2024-03-20 19:00:00',
    '2024-03-27 21:00:00',
    '2024-03-18 23:59:59',
    2,
    'قوانين بطولة 2v2:
1. فريق ثابت من لاعبين
2. لا يمكن تغيير الفريق أثناء البطولة
3. التنسيق بين أعضاء الفريق مطلوب
4. مدة المباراة: 50 دقيقة
5. جميع الفصائل مسموحة
6. استراتيجية الفريق حرة
7. احترام الفرق المنافسة',
    JSON_OBJECT(
        'discord', 'https://discord.gg/2v2-challenge',
        'telegram', 'https://t.me/2v2_challenge',
        'email', 'zhmaster@zh-love.com'
    ),
    JSON_ARRAY('Desert Fury', 'Tournament Desert', 'Urban Combat', 'Mountain Pass', 'Coastal Clash'),
    true,
    true,
    'MENA',
    'advanced',
    'https://youtube.com/watch?v=2v2-challenge',
    'https://discord.gg/2v2-challenge'
),

-- Live Tournament: Legends Championship
(
    'بطولة الأساطير',
    'البطولة الأسطورية التي تجمع أعظم اللاعبين في تاريخ الجنرالات العرب. منافسة ملحمية بين الأبطال القدامى والجدد على الجوائز الأعلى في المجتمع.',
    '/uploads/tournaments/legends-tournament.jpg',
    'double_elimination',
    '1v1',
    'in_progress',
    'tournament',
    32,
    32,
    5000.00,
    'USD',
    50.00,
    '2024-02-28 20:00:00',
    '2024-03-10 22:00:00',
    '2024-02-27 23:59:59',
    1,
    'قوانين بطولة الأساطير:
1. للأساطير فقط - تقييم 1800+
2. إعدادات الأساطير - أقصى صعوبة
3. جميع الفصائل والجنرالات مسموحة
4. مدة المباراة: 60 دقيقة
5. خرائط متقدمة ومتنوعة
6. البث المباشر إجباري
7. لعب احترافي على أعلى مستوى',
    JSON_OBJECT(
        'discord', 'https://discord.gg/legends-tournament',
        'telegram', 'https://t.me/legends_tournament',
        'email', 'legends@zh-love.com'
    ),
    JSON_ARRAY('Desert Fury', 'Tournament Desert', 'Winter Wolf', 'Scorched Earth', 'Green Pastures', 'Urban Combat'),
    true,
    true,
    'MENA',
    'pro',
    'https://twitch.tv/legends-tournament',
    'https://discord.gg/legends-tournament'
);

-- Insert tournament participants with realistic data
INSERT INTO tournament_participants (tournament_id, user_id, team_name, status, registered_at) VALUES
-- Grand Championship participants
(1, 2, 'ZH Master', 'confirmed', '2024-02-16 09:00:00'),
(1, 3, 'Generals Pro', 'confirmed', '2024-02-16 10:30:00'),
(1, 4, 'Tactical Gamer', 'confirmed', '2024-02-16 11:15:00'),
(1, 5, 'Desert Storm', 'confirmed', '2024-02-16 12:00:00'),
(1, 6, 'ZH Legend', 'confirmed', '2024-02-16 13:30:00'),
(1, 7, 'Air Commander', 'confirmed', '2024-02-16 14:00:00'),
(1, 8, 'Tank Master', 'confirmed', '2024-02-16 14:30:00'),

-- Clan Wars participants (clans)
(2, NULL, 'الذئاب المحاربة', 'confirmed', '2024-02-19 10:00:00'),
(2, NULL, 'أسياد الحرب', 'confirmed', '2024-02-19 11:00:00'),
(2, NULL, 'عاصفة الصحراء', 'confirmed', '2024-02-19 12:00:00'),
(2, NULL, 'فرسان الشرق', 'confirmed', '2024-02-19 13:00:00'),

-- Middle East Cup completed participants with placements
(3, 6, 'ZH Legend', 'winner', '2024-01-16 10:00:00'),
(3, 7, 'Air Commander', 'confirmed', '2024-01-16 11:00:00'),
(3, 8, 'Tank Master', 'confirmed', '2024-01-16 12:00:00'),
(3, 3, 'Generals Pro', 'confirmed', '2024-01-16 13:00:00'),

-- Beginners Tournament completed participants
(4, 15, 'New Player 01', 'winner', '2024-02-02 09:00:00'),
(4, 16, 'Beginner Pro', 'confirmed', '2024-02-02 10:00:00'),
(4, 17, 'Learning Fast', 'confirmed', '2024-02-02 11:00:00'),

-- 2v2 Challenge upcoming participants
(5, 2, 'Golden Eagles (ZH Master)', 'confirmed', '2024-02-21 10:00:00'),
(5, 6, 'Red Hawks (ZH Legend)', 'confirmed', '2024-02-21 11:00:00'),

-- Legends Tournament live participants
(6, 2, 'ZH Master', 'confirmed', '2024-02-11 09:00:00'),
(6, 3, 'Generals Pro', 'confirmed', '2024-02-11 10:00:00'),
(6, 6, 'ZH Legend', 'confirmed', '2024-02-11 11:00:00'),
(6, 4, 'Tactical Gamer', 'confirmed', '2024-02-11 12:00:00');

-- Update tournament participant counts
UPDATE tournaments SET currentParticipants = (
    SELECT COUNT(*) FROM tournament_participants 
    WHERE tournament_id = tournaments.id
);

-- Insert realistic matches for completed tournaments
INSERT INTO matches (
    tournament_id, round_number, match_number, 
    participant1_id, participant2_id, winner_id, 
    status, completed_at, score_p1, score_p2, notes
) VALUES
-- Middle East Cup final matches
(3, 1, 1, 
 (SELECT id FROM tournament_participants WHERE tournament_id = 3 AND user_id = 6),
 (SELECT id FROM tournament_participants WHERE tournament_id = 3 AND user_id = 7),
 (SELECT id FROM tournament_participants WHERE tournament_id = 3 AND user_id = 6),
 'completed', '2024-02-16 20:30:00', 2, 0, 'مباراة نهائية مثيرة'),

(3, 2, 1, 
 (SELECT id FROM tournament_participants WHERE tournament_id = 3 AND user_id = 6),
 (SELECT id FROM tournament_participants WHERE tournament_id = 3 AND user_id = 8),
 (SELECT id FROM tournament_participants WHERE tournament_id = 3 AND user_id = 6),
 'completed', '2024-02-18 21:00:00', 2, 1, 'معركة شرسة حتى النهاية'),

-- Beginners Tournament matches
(4, 1, 1,
 (SELECT id FROM tournament_participants WHERE tournament_id = 4 AND user_id = 15),
 (SELECT id FROM tournament_participants WHERE tournament_id = 4 AND user_id = 16),
 (SELECT id FROM tournament_participants WHERE tournament_id = 4 AND user_id = 15),
 'completed', '2024-02-12 19:15:00', 2, 0, 'أداء ممتاز للمبتدئين'),

(4, 2, 1,
 (SELECT id FROM tournament_participants WHERE tournament_id = 4 AND user_id = 15),
 (SELECT id FROM tournament_participants WHERE tournament_id = 4 AND user_id = 17),
 (SELECT id FROM tournament_participants WHERE tournament_id = 4 AND user_id = 15),
 'completed', '2024-02-15 20:30:00', 2, 1, 'تحسن ملحوظ في الأداء');

-- Set placements for completed tournaments
UPDATE tournament_participants SET placement = 1, prize_won = 600.00 
WHERE tournament_id = 3 AND user_id = 6;

UPDATE tournament_participants SET placement = 2, prize_won = 300.00 
WHERE tournament_id = 3 AND user_id = 7;

UPDATE tournament_participants SET placement = 3, prize_won = 200.00 
WHERE tournament_id = 3 AND user_id = 8;

UPDATE tournament_participants SET placement = 4, prize_won = 100.00 
WHERE tournament_id = 3 AND user_id = 3;

UPDATE tournament_participants SET placement = 1, prize_won = 100.00 
WHERE tournament_id = 4 AND user_id = 15;

UPDATE tournament_participants SET placement = 2, prize_won = 60.00 
WHERE tournament_id = 4 AND user_id = 16;

UPDATE tournament_participants SET placement = 3, prize_won = 40.00 
WHERE tournament_id = 4 AND user_id = 17;

-- Insert tournament settings (admin-controlled)
CREATE TABLE IF NOT EXISTS tournament_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('boolean', 'string', 'number', 'json') DEFAULT 'string',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key),
    INDEX idx_is_active (is_active)
);

INSERT INTO tournament_settings (setting_key, setting_value, setting_type, description) VALUES
('allow_user_tournaments', 'true', 'boolean', 'السماح للمستخدمين بإنشاء بطولات'),
('require_admin_approval', 'true', 'boolean', 'موافقة إدارية مطلوبة للبطولات الجديدة'),
('allow_private_tournaments', 'true', 'boolean', 'السماح بالبطولات الخاصة'),
('min_prize_pool', '0', 'number', 'الحد الأدنى لمجموع الجوائز'),
('max_prize_pool', '10000', 'number', 'الحد الأقصى لمجموع الجوائز'),
('allowed_currencies', '["USD", "SAR", "AED", "EGP"]', 'json', 'العملات المسموحة'),
('allowed_payment_methods', '["free", "paypal", "bank_transfer"]', 'json', 'طرق الدفع المسموحة'),
('notify_new_tournament', 'true', 'boolean', 'إشعار عند إنشاء بطولة جديدة'),
('notify_approval', 'true', 'boolean', 'إشعار عام عند الموافقة'),
('notify_featured', 'true', 'boolean', 'إشعار البطولات المميزة'),
('max_participants_limit', '1024', 'number', 'الحد الأقصى للمشاركين'),
('default_tournament_duration', '7', 'number', 'مدة البطولة الافتراضية بالأيام');

-- Insert available maps with categories
CREATE TABLE IF NOT EXISTS tournament_maps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    map_name VARCHAR(100) NOT NULL,
    map_category ENUM('official', 'tournament', 'custom') DEFAULT 'official',
    description TEXT,
    image_url VARCHAR(255),
    is_enabled BOOLEAN DEFAULT TRUE,
    difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    player_count ENUM('1v1', '2v2', '3v3', '4v4', 'all') DEFAULT 'all',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (map_category),
    INDEX idx_enabled (is_enabled)
);

INSERT INTO tournament_maps (map_name, map_category, description, image_url, difficulty_level, player_count) VALUES
('Desert Fury', 'official', 'خريطة رسمية كلاسيكية في الصحراء', '/maps/desert_fury.jpg', 'medium', 'all'),
('Winter Wolf', 'official', 'خريطة الذئب الشتوي الثلجية', '/maps/winter_wolf.jpg', 'medium', 'all'),
('Tournament Desert', 'tournament', 'خريطة خاصة بالبطولات الرسمية', '/maps/tournament_desert.jpg', 'hard', '1v1'),
('Green Pastures', 'official', 'المراعي الخضراء الجميلة', '/maps/green_pastures.jpg', 'easy', 'all'),
('Scorched Earth', 'official', 'الأرض المحروقة الصعبة', '/maps/scorched_earth.jpg', 'hard', 'all'),
('Urban Combat', 'tournament', 'القتال الحضري المتقدم', '/maps/urban_combat.jpg', 'hard', '2v2'),
('Mountain Pass', 'custom', 'ممر الجبل التكتيكي', '/maps/mountain_pass.jpg', 'medium', 'all'),
('Coastal Clash', 'custom', 'صدام الساحل البحري', '/maps/coastal_clash.jpg', 'medium', '2v2'),
('Industrial Zone', 'custom', 'المنطقة الصناعية الحديثة', '/maps/industrial_zone.jpg', 'hard', 'all');

-- Insert game modes with auto-rules
CREATE TABLE IF NOT EXISTS game_modes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mode_id VARCHAR(50) NOT NULL UNIQUE,
    mode_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_emoji VARCHAR(10),
    is_enabled BOOLEAN DEFAULT TRUE,
    auto_rules TEXT,
    max_team_size INT DEFAULT 1,
    requires_team BOOLEAN DEFAULT FALSE,
    INDEX idx_mode_id (mode_id),
    INDEX idx_enabled (is_enabled)
);

INSERT INTO game_modes (mode_id, mode_name, description, icon_emoji, auto_rules, max_team_size, requires_team) VALUES
('1v1', 'فردي (1v1)', 'مباراة فردية بين لاعبين', '⚔️', 
'قوانين المباريات الفردية:\n1. مدة المباراة: 45 دقيقة\n2. جميع الفصائل مسموحة\n3. ممنوع استخدام الغش\n4. احترام الخصم', 1, false),

('2v2', 'ثنائي (2v2)', 'فريق من لاعبين ضد آخر', '👥', 
'قوانين الفرق الثنائية:\n1. مدة المباراة: 60 دقيقة\n2. التنسيق بين أعضاء الفريق مسموح\n3. لا يجوز تغيير الفريق أثناء البطولة\n4. احترام الفريق المنافس', 2, true),

('3v3', 'ثلاثي (3v3)', 'فريق من 3 لاعبين', '👫', 
'قوانين الفرق الثلاثية:\n1. مدة المباراة: 75 دقيقة\n2. استراتيجية الفريق حرة\n3. التواصل بين أعضاء الفريق مطلوب\n4. لعب عادل ونظيف', 3, true),

('4v4', 'رباعي (4v4)', 'فريق من 4 لاعبين', '👨‍👩‍👧‍👦', 
'قوانين الفرق الرباعية:\n1. مدة المباراة: 90 دقيقة\n2. تنسيق متقدم مطلوب\n3. قائد فريق محدد\n4. استراتيجية جماعية', 4, true),

('team', 'فريق مخصص', 'حجم فريق مخصص', '🏘️', 
'قوانين الفرق المخصصة:\n1. مدة المباراة حسب حجم الفريق\n2. قوانين مرنة\n3. تحديد قائد الفريق\n4. اتفاق مسبق على القوانين', 0, true);

-- Insert rule templates
CREATE TABLE IF NOT EXISTS rule_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_name VARCHAR(200) NOT NULL,
    game_mode VARCHAR(50),
    rule_content TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_game_mode (game_mode),
    INDEX idx_enabled (is_enabled)
);

INSERT INTO rule_templates (template_name, game_mode, rule_content, is_default) VALUES
('قوانين المباريات الفردية القياسية', '1v1', 
'قوانين المباريات الفردية:\n1. مدة المباراة: 45 دقيقة\n2. الفصائل المسموحة: جميع الفصائل\n3. ممنوع استخدام الغش\n4. احترام الخصم\n5. 3 خرائط محظورة لكل لاعب\n6. أفضل من 3 جولات', true),

('قوانين الفرق الثنائية', '2v2', 
'قوانين الفرق الثنائية:\n1. مدة المباراة: 60 دقيقة\n2. التنسيق بين أعضاء الفريق مسموح\n3. لا يجوز تغيير الفريق أثناء البطولة\n4. احترام الفريق المنافس\n5. استراتيجية جماعية مطلوبة', true),

('قوانين البطولات الرسمية', 'all', 
'قوانين البطولات الرسمية:\n1. الحضور قبل 15 دقيقة من المباراة\n2. عدم التأخير أكثر من 10 دقائق\n3. احترام جميع المشاركين\n4. اتباع تعليمات الإدارة\n5. البث أو التسجيل مطلوب\n6. لعب نظيف وعادل', true),

('قوانين المبتدئين', 'all', 
'قوانين خاصة بالمبتدئين:\n1. مساعدة المبتدئين مسموحة\n2. روح رياضية عالية\n3. تعلم وممارسة\n4. خرائط سهلة\n5. وقت إضافي للتفكير\n6. نصائح من الخبراء مسموحة', false);

-- Insert comprehensive tournament statistics
CREATE OR REPLACE VIEW tournament_stats AS
SELECT 
    COUNT(*) as total_tournaments,
    SUM(CASE WHEN status IN ('registration', 'in_progress') THEN 1 ELSE 0 END) as active_tournaments,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tournaments,
    SUM(CASE WHEN status = 'upcoming' THEN 1 ELSE 0 END) as upcoming_tournaments,
    SUM(currentParticipants) as total_participants,
    SUM(prizePool) as total_prize_money,
    COUNT(CASE WHEN featured = true THEN 1 END) as featured_tournaments,
    AVG(prizePool) as average_prize_pool,
    MAX(prizePool) as highest_prize_pool,
    AVG(currentParticipants) as average_participants
FROM tournaments;

-- Create indexes for better performance
CREATE INDEX idx_tournaments_status_featured ON tournaments(status, featured);
CREATE INDEX idx_tournaments_start_date ON tournaments(startDate);
CREATE INDEX idx_tournaments_prize_pool ON tournaments(prizePool DESC);
CREATE INDEX idx_participants_tournament_status ON tournament_participants(tournament_id, status);
CREATE INDEX idx_matches_tournament_round ON matches(tournament_id, round_number);

-- Update user stats based on tournament results
UPDATE users u SET 
    total_matches = (
        SELECT COUNT(*) 
        FROM tournament_participants tp 
        JOIN matches m ON (tp.id = m.participant1_id OR tp.id = m.participant2_id)
        WHERE tp.user_id = u.id AND m.status = 'completed'
    ),
    wins = (
        SELECT COUNT(*) 
        FROM tournament_participants tp 
        JOIN matches m ON tp.id = m.winner_id
        WHERE tp.user_id = u.id AND m.status = 'completed'
    )
WHERE u.id IN (SELECT DISTINCT user_id FROM tournament_participants WHERE user_id IS NOT NULL);

-- Update win rates
UPDATE users SET 
    losses = total_matches - wins,
    win_rate = CASE 
        WHEN total_matches > 0 THEN ROUND((wins / total_matches) * 100, 2)
        ELSE 0 
    END
WHERE total_matches > 0;

-- Final verification query
SELECT 
    'Tournament Data Summary' as summary,
    (SELECT COUNT(*) FROM tournaments) as total_tournaments,
    (SELECT COUNT(*) FROM tournament_participants) as total_participants,
    (SELECT COUNT(*) FROM matches) as total_matches,
    (SELECT SUM(prizePool) FROM tournaments) as total_prizes,
    (SELECT COUNT(*) FROM tournaments WHERE featured = true) as featured_tournaments,
    (SELECT COUNT(*) FROM tournaments WHERE status = 'in_progress') as live_tournaments;

COMMIT; 