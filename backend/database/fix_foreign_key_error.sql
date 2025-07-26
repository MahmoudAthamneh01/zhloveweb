-- ================================================
-- إصلاح مشكلة Foreign Key Constraints
-- حل مشكلة #1451 Cannot delete or update a parent row
-- ================================================

USE zh_love_db;

-- إيقاف فحص المفاتيح الخارجية مؤقتاً
SET FOREIGN_KEY_CHECKS = 0;

-- حذف جميع الجداول المرتبطة بنظام البطولات
DROP TABLE IF EXISTS tournament_update_reads;
DROP TABLE IF EXISTS tournament_updates;
DROP TABLE IF EXISTS tournament_notifications;
DROP TABLE IF EXISTS tournament_invitations;
DROP TABLE IF EXISTS tournament_staff;
DROP TABLE IF EXISTS tournament_statistics;
DROP TABLE IF EXISTS tournament_brackets;
DROP TABLE IF EXISTS tournament_archives;
DROP TABLE IF EXISTS tournament_matches;
DROP TABLE IF EXISTS tournament_participants;
DROP TABLE IF EXISTS tournament_applications;
DROP TABLE IF EXISTS tournament_settings;
DROP TABLE IF EXISTS tournament_maps;
DROP TABLE IF EXISTS game_modes;
DROP TABLE IF EXISTS rule_templates;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS tournaments;

-- إعادة تشغيل فحص المفاتيح الخارجية
SET FOREIGN_KEY_CHECKS = 1;

-- ================================================
-- إنشاء جدول البطولات الجديد
-- ================================================

CREATE TABLE tournaments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- المعلومات الأساسية (ثنائية اللغة)
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) DEFAULT NULL,
    description TEXT,
    description_en TEXT,
    
    -- إعدادات البطولة
    type ENUM('single_elimination', 'double_elimination', 'round_robin', 'swiss', 'ladder') DEFAULT 'single_elimination',
    format ENUM('1v1', '2v2', '3v3', '4v4', 'clan_war', 'team') DEFAULT '1v1',
    resources ENUM('5k', '10k', '20k', '50k', 'unlimited') DEFAULT '10k',
    
    -- المشاركين
    max_participants INT NOT NULL DEFAULT 64,
    current_participants INT DEFAULT 0,
    min_participants INT DEFAULT 8,
    
    -- الجوائز والدفع
    prize_pool DECIMAL(10,2) DEFAULT 0.00,
    prize_currency ENUM('USD', 'SAR', 'AED', 'EGP', 'EUR') DEFAULT 'USD',
    entry_fee DECIMAL(10,2) DEFAULT 0.00,
    entry_currency ENUM('USD', 'SAR', 'AED', 'EGP', 'EUR') DEFAULT 'USD',
    payment_method ENUM('free', 'paypal', 'bank_transfer', 'crypto', 'mobile_payment') DEFAULT 'free',
    prize_distribution ENUM('winner_takes_all', 'default', 'top_3', 'top_5', 'custom') DEFAULT 'default',
    
    -- التواريخ (استخدام DATETIME بدلاً من TIMESTAMP)
    start_date DATETIME NOT NULL,
    end_date DATETIME DEFAULT NULL,
    registration_start DATETIME DEFAULT NULL,
    registration_deadline DATETIME NOT NULL,
    
    -- الحالة والإدارة
    status ENUM('draft', 'pending_approval', 'approved', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled', 'rejected') DEFAULT 'draft',
    organizer_id INT NOT NULL DEFAULT 1,
    approved_by INT DEFAULT NULL,
    approved_at DATETIME DEFAULT NULL,
    
    -- الإعدادات
    region ENUM('global', 'middle_east', 'north_africa', 'europe', 'asia', 'americas') DEFAULT 'middle_east',
    game_mode ENUM('classic', 'tournament', 'ranked', 'custom') DEFAULT 'classic',
    timezone VARCHAR(50) DEFAULT 'Asia/Riyadh',
    
    -- القوانين (ثنائية اللغة)
    rules TEXT,
    rules_en TEXT,
    requirements TEXT,
    requirements_en TEXT,
    
    -- إعدادات متقدمة
    is_featured BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT FALSE,
    require_approval BOOLEAN DEFAULT TRUE,
    allow_spectators BOOLEAN DEFAULT TRUE,
    enable_streaming BOOLEAN DEFAULT FALSE,
    auto_translate BOOLEAN DEFAULT TRUE,
    
    -- الوسائط والاتصال
    image VARCHAR(255) DEFAULT NULL,
    banner VARCHAR(255) DEFAULT NULL,
    contact_info JSON DEFAULT NULL,
    stream_url VARCHAR(255) DEFAULT NULL,
    allowed_maps JSON DEFAULT NULL,
    sponsors JSON DEFAULT NULL,
    
    -- الإحصائيات
    views INT DEFAULT 0,
    popularity_score INT DEFAULT 0,
    
    -- التوقيتات
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- الفهارس
    INDEX idx_status (status),
    INDEX idx_organizer (organizer_id),
    INDEX idx_start_date (start_date),
    INDEX idx_featured (is_featured),
    INDEX idx_type_format (type, format),
    INDEX idx_region (region)
);

-- ================================================
-- جدول المشاركين
-- ================================================

CREATE TABLE tournament_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    user_id INT DEFAULT NULL,
    
    -- معلومات الفريق
    team_name VARCHAR(100) DEFAULT NULL,
    team_name_en VARCHAR(100) DEFAULT NULL,
    team_members JSON DEFAULT NULL,
    captain_id INT DEFAULT NULL,
    
    -- الحالة والترتيب
    status ENUM('registered', 'approved', 'rejected', 'checked_in', 'eliminated', 'disqualified', 'winner') DEFAULT 'registered',
    placement INT DEFAULT NULL,
    seed_number INT DEFAULT NULL,
    
    -- الأداء
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    points INT DEFAULT 0,
    
    -- الجوائز
    prize_won DECIMAL(10,2) DEFAULT 0.00,
    
    -- معلومات التواصل
    contact_discord VARCHAR(100) DEFAULT NULL,
    contact_telegram VARCHAR(100) DEFAULT NULL,
    contact_email VARCHAR(100) DEFAULT NULL,
    contact_phone VARCHAR(20) DEFAULT NULL,
    
    -- ملاحظات
    notes TEXT DEFAULT NULL,
    admin_notes TEXT DEFAULT NULL,
    
    -- التوقيتات
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME DEFAULT NULL,
    
    -- المفاتيح الخارجية والفهارس
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    INDEX idx_tournament (tournament_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_placement (placement)
);

-- ================================================
-- جدول المباريات
-- ================================================

CREATE TABLE tournament_matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    
    -- تحديد المباراة
    round_number INT NOT NULL,
    match_number INT NOT NULL,
    bracket_type ENUM('main', 'losers', 'consolation', 'group') DEFAULT 'main',
    
    -- المشاركين
    participant1_id INT DEFAULT NULL,
    participant2_id INT DEFAULT NULL,
    winner_id INT DEFAULT NULL,
    
    -- النتائج
    score1 INT DEFAULT 0,
    score2 INT DEFAULT 0,
    best_of INT DEFAULT 1,
    
    -- الحالة والتوقيتات
    status ENUM('scheduled', 'ready', 'live', 'completed', 'disputed', 'walkover', 'cancelled') DEFAULT 'scheduled',
    scheduled_time DATETIME DEFAULT NULL,
    started_time DATETIME DEFAULT NULL,
    completed_time DATETIME DEFAULT NULL,
    
    -- تفاصيل إضافية
    map_played VARCHAR(100) DEFAULT NULL,
    replay_url VARCHAR(255) DEFAULT NULL,
    stream_url VARCHAR(255) DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    
    -- إدارة
    referee_id INT DEFAULT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- المفاتيح الخارجية والفهارس
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (participant1_id) REFERENCES tournament_participants(id) ON DELETE SET NULL,
    FOREIGN KEY (participant2_id) REFERENCES tournament_participants(id) ON DELETE SET NULL,
    FOREIGN KEY (winner_id) REFERENCES tournament_participants(id) ON DELETE SET NULL,
    
    INDEX idx_tournament (tournament_id),
    INDEX idx_round (round_number),
    INDEX idx_status (status),
    INDEX idx_scheduled (scheduled_time)
);

-- ================================================
-- بيانات البطولات الحقيقية المحسنة
-- ================================================

INSERT INTO tournaments (
    name, name_en, description, description_en, 
    type, format, resources, max_participants, current_participants,
    prize_pool, prize_currency, entry_fee, entry_currency, payment_method, prize_distribution,
    start_date, end_date, registration_deadline,
    status, organizer_id, region, game_mode, timezone,
    rules, rules_en, requirements, requirements_en,
    is_featured, is_private, require_approval, allow_spectators, enable_streaming,
    image, contact_info, stream_url, allowed_maps, sponsors,
    views, popularity_score
) VALUES 

-- بطولة مميزة 1: البطولة الكبرى
(
    'بطولة الجنرالات الكبرى 2024', 
    'Grand Generals Championship 2024',
    'البطولة الأكبر والأهم في المجتمع العربي لجنرالز زيرو ساعة. تضم أقوى اللاعبين من جميع أنحاء المنطقة مع جوائز قيمة ومنافسة شرسة على مستوى عالي.',
    'The biggest and most important tournament in the Arabic C&C Generals Zero Hour community. Features the strongest players from across the region with valuable prizes and fierce high-level competition.',
    'single_elimination', '1v1', '10k', 128, 89,
    2500.00, 'USD', 15.00, 'USD', 'paypal', 'top_3',
    '2024-03-15 18:00:00', '2024-03-22 22:00:00', '2024-03-14 23:59:59',
    'registration_open', 1, 'middle_east', 'tournament', 'Asia/Riyadh',
    'قوانين البطولة الكبرى:\n1. مباريات Best of 3 في جميع الأدوار\n2. اختيار الخرائط عشوائي من القائمة المعتمدة\n3. ممنوع استخدام الغش أو الهاكس\n4. الحضور قبل 15 دقيقة من موعد المباراة\n5. عدم الحضور = خسارة تلقائية\n6. احترام الخصم واللعب النظيف مطلوب',
    'Grand Championship Rules:\n1. Best of 3 matches in all rounds\n2. Random map selection from approved list\n3. No cheating or hacks allowed\n4. Arrive 15 minutes before match time\n5. No-show = automatic forfeit\n6. Respect opponents and fair play required',
    'مطلوب مستوى 50+ وخبرة في البطولات', 'Level 50+ required with tournament experience',
    TRUE, FALSE, TRUE, TRUE, TRUE,
    '/images/tournaments/grand-championship-2024.jpg',
    JSON_OBJECT('discord', 'https://discord.gg/zh-love-grand', 'telegram', '@zh_love_grand', 'email', 'grand@zh-love.com'),
    'https://youtube.com/live/zh-love-grand',
    JSON_ARRAY('Tournament Desert', 'Desert Fury', 'Winter Wolf', 'Mountain Pass', 'Urban Combat', 'Industrial Zone'),
    JSON_ARRAY(JSON_OBJECT('name', 'ZH-Love Gaming', 'logo', '/images/sponsors/zh-love.png', 'url', 'https://zh-love.com')),
    2450, 95
),

-- بطولة مميزة 2: تحدي الكلانات
(
    'تحدي الكلانات الأسبوعي',
    'Weekly Clan Challenge',
    'مسابقة أسبوعية بين أقوى الكلانات العربية لتحديد الكلان الأقوى. منافسة شرسة بين الفرق المنظمة مع استراتيجيات متقدمة.',
    'Weekly competition between the strongest Arabic clans to determine the most powerful clan. Fierce competition between organized teams with advanced strategies.',
    'round_robin', 'clan_war', '20k', 20, 16,
    500.00, 'USD', 0.00, 'USD', 'free', 'top_3',
    '2024-03-08 19:00:00', '2024-03-10 21:00:00', '2024-03-07 23:59:59',
    'in_progress', 1, 'middle_east', 'classic', 'Asia/Riyadh',
    'قوانين تحدي الكلانات:\n1. كل كلان يرسل فريق من 5 لاعبين\n2. مباريات 3v3 و 2v2 و 1v1\n3. نظام النقاط التراكمية\n4. جميع الأعضاء يجب أن يكونوا من نفس الكلان\n5. القائد يختار التشكيلة لكل مباراة',
    'Clan Challenge Rules:\n1. Each clan sends a 5-player team\n2. Matches include 3v3, 2v2, and 1v1 formats\n3. Cumulative points system\n4. All members must be from same clan\n5. Captain chooses lineup for each match',
    'يجب أن يكون جميع الأعضاء من نفس الكلان', 'All members must be from the same clan',
    TRUE, FALSE, TRUE, TRUE, TRUE,
    '/images/tournaments/weekly-clan-battle.jpg',
    JSON_OBJECT('discord', 'https://discord.gg/zh-love-clans', 'telegram', '@zh_love_clans'),
    'https://youtube.com/live/zh-love-clans',
    JSON_ARRAY('Tournament Arena', 'Clan Battlefield', 'Strategic Plains', 'War Zone', 'Combat Valley'),
    NULL,
    1890, 88
),

-- بطولة مكتملة: كأس الشرق الأوسط  
(
    'كأس الشرق الأوسط',
    'Middle East Cup',
    'بطولة إقليمية مميزة جمعت أفضل اللاعبين من منطقة الشرق الأوسط في منافسة ملحمية امتدت لأسبوعين كاملين.',
    'Distinguished regional tournament that brought together the best players from the Middle East region in an epic competition spanning two full weeks.',
    'double_elimination', '1v1', '10k', 64, 64,
    1200.00, 'USD', 8.00, 'USD', 'paypal', 'top_5',
    '2024-02-15 20:00:00', '2024-02-29 22:00:00', '2024-02-14 23:59:59',
    'completed', 1, 'middle_east', 'ranked', 'Asia/Riyadh',
    'قوانين كأس الشرق الأوسط:\n1. إقصاء مزدوج - فرصة ثانية\n2. مباريات Best of 3\n3. مخصص للاعبين من الشرق الأوسط\n4. استخدام خوادم المنطقة فقط\n5. التحكيم المباشر في النهائيات',
    'Middle East Cup Rules:\n1. Double elimination - second chance\n2. Best of 3 matches\n3. Exclusive to Middle East players\n4. Middle East servers only\n5. Live refereeing in finals',
    'لاعبي الشرق الأوسط فقط', 'Middle East players only',
    TRUE, FALSE, TRUE, TRUE, TRUE,
    '/images/tournaments/middle-east-cup.jpg',
    JSON_OBJECT('discord', 'https://discord.gg/middle-east-cup', 'telegram', '@mena_cup'),
    'https://youtube.com/live/mena-cup',
    JSON_ARRAY('Desert Fury', 'Tournament Desert', 'Valley of Death', 'Scorched Earth', 'Green Pastures'),
    JSON_ARRAY(JSON_OBJECT('name', 'MENA Gaming', 'logo', '/images/sponsors/mena.png')),
    3200, 92
),

-- بطولة جارية: بطولة الأساطير
(
    'بطولة الأساطير',
    'Legends Tournament',
    'بطولة حصرية لأفضل 32 لاعب في المجتمع. مستوى احترافي عالي جداً مع بث مباشر وتحليل فني من الخبراء.',
    'Exclusive tournament for the top 32 players in the community. Very high professional level with live streaming and expert technical analysis.',
    'single_elimination', '1v1', '20k', 32, 32,
    5000.00, 'USD', 25.00, 'USD', 'crypto', 'default',
    '2024-03-01 20:00:00', '2024-03-08 22:00:00', '2024-02-28 23:59:59',
    'in_progress', 1, 'global', 'tournament', 'UTC',
    'قوانين بطولة الأساطير:\n1. للمحترفين فقط - مستوى 80+\n2. جميع المباريات Best of 5\n3. حكام محترفين لكل مباراة\n4. بث مباشر إجباري\n5. تحليل فني متخصص\n6. قوانين صارمة جداً',
    'Legends Tournament Rules:\n1. Pros only - Level 80+\n2. All matches Best of 5\n3. Professional referees for every match\n4. Mandatory live streaming\n5. Specialized technical analysis\n6. Very strict rules',
    'مستوى 80+ فقط مع سجل بطولات', 'Level 80+ only with tournament record',
    TRUE, TRUE, TRUE, TRUE, TRUE,
    '/images/tournaments/legends-tournament.jpg',
    JSON_OBJECT('discord', 'https://discord.gg/zh-legends', 'telegram', '@zh_legends', 'email', 'legends@zh-love.com'),
    'https://twitch.tv/zh-legends',
    JSON_ARRAY('Pro Arena', 'Championship Field', 'Elite Battlefield', 'Masters Ground', 'Legends Stadium'),
    JSON_ARRAY(JSON_OBJECT('name', 'Pro Gaming Inc', 'logo', '/images/sponsors/pro-gaming.png')),
    4100, 98
),

-- بطولة مفتوحة: تحدي الثنائيات
(
    'تحدي الثنائيات الكبير',
    'Grand 2v2 Challenge',
    'أول بطولة 2v2 كبيرة في المجتمع العربي. فرق من لاعبين تتنافس في معارك تكتيكية مثيرة تتطلب التنسيق والعمل الجماعي.',
    'First major 2v2 tournament in the Arabic community. Two-player teams compete in exciting tactical battles requiring coordination and teamwork.',
    'single_elimination', '2v2', '10k', 48, 24,
    800.00, 'USD', 10.00, 'USD', 'bank_transfer', 'top_3',
    '2024-03-20 19:00:00', '2024-03-27 21:00:00', '2024-03-18 23:59:59',
    'registration_open', 1, 'global', 'classic', 'Asia/Riyadh',
    'قوانين بطولة الثنائيات:\n1. فرق من لاعبين اثنين بالضبط\n2. التسجيل كفريق واحد\n3. التواصل الصوتي مسموح\n4. استراتيجيات التنسيق مهمة\n5. منع تغيير الشريك بعد التسجيل',
    '2v2 Tournament Rules:\n1. Teams of exactly two players\n2. Register as one team\n3. Voice communication allowed\n4. Coordination strategies important\n5. Partner changes not allowed after registration',
    'فريق من لاعبين ثابت', 'Fixed two-player team',
    FALSE, FALSE, TRUE, TRUE, FALSE,
    '/images/tournaments/2v2-challenge.jpg',
    JSON_OBJECT('discord', 'https://discord.gg/zh-2v2', 'telegram', '@zh_2v2'),
    'https://youtube.com/live/zh-2v2',
    JSON_ARRAY('Team Arena', 'Dual Combat', 'Partnership Field', 'Cooperation Zone', 'Alliance Battlefield'),
    NULL,
    1567, 82
),

-- بطولة مكتملة: بطولة المبتدئين
(
    'بطولة المبتدئين الشهرية',
    'Monthly Beginners Tournament',
    'بطولة شهرية مخصصة للاعبين الجدد والمبتدئين. بيئة تعليمية ودودة مع مدربين متطوعين ونصائح مفيدة.',
    'Monthly tournament dedicated to new and beginner players. Friendly educational environment with volunteer coaches and helpful tips.',
    'single_elimination', '1v1', '5k', 32, 32,
    200.00, 'USD', 0.00, 'USD', 'free', 'top_3',
    '2024-02-10 17:00:00', '2024-02-17 20:00:00', '2024-02-09 23:59:59',
    'completed', 1, 'global', 'classic', 'Asia/Riyadh',
    'قوانين بطولة المبتدئين:\n1. للمبتدئين فقط - مستوى أقل من 50\n2. مدربين متطوعين للمساعدة\n3. شرح القوانين قبل كل مباراة\n4. بيئة ودودة وتشجيعية\n5. التركيز على التعلم',
    'Beginners Tournament Rules:\n1. Beginners only - Level below 50\n2. Volunteer coaches for help\n3. Rules explanation before each match\n4. Friendly and encouraging environment\n5. Focus on learning',
    'مستوى أقل من 50', 'Level below 50',
    FALSE, FALSE, FALSE, TRUE, FALSE,
    '/images/tournaments/beginners-monthly.jpg',
    JSON_OBJECT('discord', 'https://discord.gg/zh-beginners', 'email', 'beginners@zh-love.com'),
    NULL,
    JSON_ARRAY('Training Ground', 'Basic Arena', 'Learning Field', 'Starter Map', 'Practice Zone'),
    NULL,
    1234, 65
);

-- ================================================
-- إدراج المشاركين
-- ================================================

INSERT INTO tournament_participants (
    tournament_id, user_id, team_name, team_name_en, status, 
    contact_discord, contact_telegram, contact_email, wins, losses, points
) VALUES
-- بطولة الجنرالات الكبرى
(1, 2, 'سيد الجنرالات', 'Master of Generals', 'approved', 'zh_master#1234', '@zh_master', 'master@zh-love.com', 0, 0, 0),
(1, 3, 'محترف الاستراتيجيات', 'Strategy Professional', 'approved', 'generals_pro#5678', '@generals_pro', 'pro@zh-love.com', 0, 0, 0),
(1, 4, 'التكتيكي الماهر', 'Skilled Tactician', 'approved', 'tactical#9012', '@tactical_gamer', 'tactical@zh-love.com', 0, 0, 0),
(1, 5, 'عاصفة الصحراء', 'Desert Storm', 'approved', 'desert_storm#3456', '@desert_storm', 'desert@zh-love.com', 0, 0, 0),
(1, 6, 'أسطورة المعارك', 'Battle Legend', 'approved', 'zh_legend#7890', '@zh_legend', 'legend@zh-love.com', 0, 0, 0),

-- تحدي الكلانات
(2, 2, 'الذئاب المحاربة', 'War Wolves', 'approved', 'war_wolves#1111', '@war_wolves', 'wolves@zh-love.com', 0, 0, 0),
(2, 3, 'أسياد الحرب', 'War Lords', 'approved', 'war_lords#2222', '@war_lords', 'lords@zh-love.com', 0, 0, 0),
(2, 5, 'عاصفة الصحراء', 'Storm Clan', 'approved', 'storm_clan#3333', '@storm_clan', 'storm@zh-love.com', 0, 0, 0),

-- كأس الشرق الأوسط (مكتملة)
(3, 6, 'فارس العرب', 'Arab Knight', 'winner', 'zh_legend#7890', '@zh_legend', 'legend@zh-love.com', 12, 2, 1200),
(3, 7, 'نسر الشرق', 'Eagle of the East', 'eliminated', 'air_commander#2345', '@air_commander', 'air@zh-love.com', 8, 4, 800),
(3, 8, 'أسد بابل', 'Lion of Babylon', 'eliminated', 'tank_master#6789', '@tank_master', 'tank@zh-love.com', 6, 6, 600),

-- بطولة الأساطير (جارية)
(4, 2, 'الأسطورة الأولى', 'First Legend', 'approved', 'zh_master#1234', '@zh_master', 'master@zh-love.com', 0, 0, 0),
(4, 3, 'الجنرال الأعظم', 'Supreme General', 'approved', 'generals_pro#5678', '@generals_pro', 'pro@zh-love.com', 0, 0, 0),
(4, 6, 'ملك المعارك', 'Battle King', 'approved', 'zh_legend#7890', '@zh_legend', 'legend@zh-love.com', 0, 0, 0),

-- تحدي الثنائيات
(5, 2, 'النسور الذهبية', 'Golden Eagles', 'approved', 'team_eagles#1111', '@team_eagles', 'eagles@zh-love.com', 0, 0, 0),
(5, 6, 'الصقور الحمراء', 'Red Hawks', 'approved', 'red_hawks#2222', '@red_hawks', 'hawks@zh-love.com', 0, 0, 0),

-- بطولة المبتدئين (مكتملة)
(6, 8, 'المحارب الجديد', 'New Warrior', 'winner', 'tank_master#6789', '@tank_master', 'tank@zh-love.com', 5, 1, 500),
(6, 7, 'النجم الصاعد', 'Rising Star', 'eliminated', 'air_commander#2345', '@air_commander', 'air@zh-love.com', 3, 3, 300);

-- ================================================
-- تحديث عدد المشاركين
-- ================================================

UPDATE tournaments SET current_participants = (
    SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = tournaments.id
);

-- ================================================
-- الرسالة النهائية
-- ================================================

SELECT 'تم إعادة بناء نظام البطولات بنجاح بدون أخطاء!' as message;
SELECT COUNT(*) as 'عدد البطولات' FROM tournaments;
SELECT COUNT(*) as 'عدد المشاركين' FROM tournament_participants;
SELECT SUM(prize_pool) as 'إجمالي الجوائز ($)' FROM tournaments; 