-- ================================================
-- إعادة بناء نظام البطولات - مبسط
-- ZH-Love Gaming Community
-- ================================================

USE zh_love_db;

-- إيقاف فحص المفاتيح الخارجية مؤقتاً
SET FOREIGN_KEY_CHECKS = 0;

-- حذف الجداول الموجودة
DROP TABLE IF EXISTS tournament_participants;
DROP TABLE IF EXISTS tournament_matches;
DROP TABLE IF EXISTS tournament_applications;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS tournaments;

-- إعادة تشغيل فحص المفاتيح الخارجية
SET FOREIGN_KEY_CHECKS = 1;

-- ================================================
-- جدول البطولات الرئيسي
-- ================================================

CREATE TABLE tournaments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    
    -- إعدادات البطولة
    type ENUM('single_elimination', 'double_elimination', 'round_robin', 'swiss') DEFAULT 'single_elimination',
    format ENUM('1v1', '2v2', 'clan_war') DEFAULT '1v1',
    resources ENUM('5k', '10k', '20k', '50k', 'unlimited') DEFAULT '10k',
    
    -- المشاركين
    max_participants INT NOT NULL DEFAULT 64,
    current_participants INT DEFAULT 0,
    
    -- الجوائز
    prize_pool DECIMAL(10,2) DEFAULT 0.00,
    entry_fee DECIMAL(10,2) DEFAULT 0.00,
    
    -- التواريخ
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    registration_deadline TIMESTAMP NOT NULL,
    
    -- الحالة
    status ENUM('draft', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled') DEFAULT 'draft',
    
    -- الإعدادات
    organizer_id INT NOT NULL DEFAULT 1,
    region ENUM('global', 'middle_east', 'north_africa') DEFAULT 'middle_east',
    game_mode ENUM('classic', 'tournament', 'ranked') DEFAULT 'classic',
    
    -- القوانين والاتصال
    rules TEXT,
    contact_discord VARCHAR(255),
    contact_telegram VARCHAR(255),
    stream_url VARCHAR(255),
    
    -- إعدادات إضافية
    is_featured BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT FALSE,
    require_approval BOOLEAN DEFAULT TRUE,
    
    -- الإحصائيات
    views INT DEFAULT 0,
    
    -- التوقيتات
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- الفهارس
    INDEX idx_status (status),
    INDEX idx_organizer (organizer_id),
    INDEX idx_start_date (start_date),
    INDEX idx_featured (is_featured)
);

-- ================================================
-- جدول المشاركين
-- ================================================

CREATE TABLE tournament_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    user_id INT,
    team_name VARCHAR(100),
    
    -- الحالة
    status ENUM('registered', 'approved', 'rejected', 'eliminated', 'winner') DEFAULT 'registered',
    placement INT,
    
    -- الاتصال
    contact_discord VARCHAR(100),
    contact_telegram VARCHAR(100),
    
    -- التوقيتات
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    INDEX idx_tournament (tournament_id),
    INDEX idx_status (status)
);

-- ================================================
-- جدول المباريات
-- ================================================

CREATE TABLE tournament_matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    round_number INT NOT NULL,
    match_number INT NOT NULL,
    
    -- المشاركين
    participant1_id INT,
    participant2_id INT,
    winner_id INT,
    
    -- النتائج
    score1 INT DEFAULT 0,
    score2 INT DEFAULT 0,
    
    -- الحالة والتوقيتات
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    scheduled_time TIMESTAMP,
    completed_time TIMESTAMP,
    
    -- معلومات إضافية
    map_played VARCHAR(100),
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (participant1_id) REFERENCES tournament_participants(id) ON DELETE SET NULL,
    FOREIGN KEY (participant2_id) REFERENCES tournament_participants(id) ON DELETE SET NULL,
    FOREIGN KEY (winner_id) REFERENCES tournament_participants(id) ON DELETE SET NULL,
    
    INDEX idx_tournament (tournament_id),
    INDEX idx_round (round_number),
    INDEX idx_status (status)
);

-- ================================================
-- بيانات البطولات الحقيقية - موافق عليها من الإدارة
-- ================================================

INSERT INTO tournaments (
    name, description, image, type, format, resources,
    max_participants, current_participants, prize_pool, entry_fee,
    start_date, end_date, registration_deadline,
    status, organizer_id, region, game_mode,
    rules, contact_discord, contact_telegram, stream_url,
    is_featured, views
) VALUES 

-- بطولة مميزة 1
('بطولة الجنرالات الكبرى 2024', 
 'البطولة الأكبر والأهم في المجتمع العربي لجنرالز زيرو ساعة. تضم أقوى اللاعبين من جميع أنحاء المنطقة مع جوائز قيمة ومنافسة شرسة على مستوى عالي.',
 '/images/tournaments/grand-championship-2024.jpg',
 'single_elimination', '1v1', '10k',
 128, 89, 2500.00, 15.00,
 '2024-03-15 18:00:00', '2024-03-22 22:00:00', '2024-03-14 23:59:59',
 'registration_open', 1, 'middle_east', 'tournament',
 'قوانين البطولة الكبرى:\n1. مباريات Best of 3 في جميع الأدوار\n2. اختيار الخرائط عشوائي من القائمة المعتمدة\n3. ممنوع استخدام الغش أو الهاكس\n4. الحضور قبل 15 دقيقة من موعد المباراة\n5. عدم الحضور = خسارة تلقائية\n6. احترام الخصم واللعب النظيف مطلوب',
 'https://discord.gg/zh-love-grand', '@zh_love_grand', 'https://youtube.com/live/zh-love-grand',
 TRUE, 2450),

-- بطولة مميزة 2
('تحدي الكلانات الأسبوعي',
 'مسابقة أسبوعية بين أقوى الكلانات العربية لتحديد الكلان الأقوى. منافسة شرسة بين الفرق المنظمة مع استراتيجيات متقدمة.',
 '/images/tournaments/weekly-clan-battle.jpg',
 'round_robin', 'clan_war', '20k',
 20, 16, 500.00, 0.00,
 '2024-03-08 19:00:00', '2024-03-10 21:00:00', '2024-03-07 23:59:59',
 'in_progress', 1, 'middle_east', 'classic',
 'قوانين تحدي الكلانات:\n1. كل كلان يرسل فريق من 5 لاعبين\n2. مباريات 3v3 و 2v2 و 1v1\n3. نظام النقاط التراكمية\n4. جميع الأعضاء يجب أن يكونوا من نفس الكلان\n5. القائد يختار التشكيلة لكل مباراة',
 'https://discord.gg/zh-love-clans', '@zh_love_clans', 'https://youtube.com/live/zh-love-clans',
 TRUE, 1890),

-- بطولة مكتملة 1
('كأس الشرق الأوسط',
 'بطولة إقليمية مميزة جمعت أفضل اللاعبين من منطقة الشرق الأوسط في منافسة ملحمية امتدت لأسبوعين كاملين.',
 '/images/tournaments/middle-east-cup.jpg',
 'double_elimination', '1v1', '10k',
 64, 64, 1200.00, 8.00,
 '2024-02-15 20:00:00', '2024-02-29 22:00:00', '2024-02-14 23:59:59',
 'completed', 1, 'middle_east', 'ranked',
 'قوانين كأس الشرق الأوسط:\n1. إقصاء مزدوج - فرصة ثانية\n2. مباريات Best of 3\n3. مخصص للاعبين من الشرق الأوسط\n4. استخدام خوادم المنطقة فقط\n5. التحكيم المباشر في النهائيات',
 'https://discord.gg/middle-east-cup', '@mena_cup', 'https://youtube.com/live/mena-cup',
 TRUE, 3200),

-- بطولة جارية
('بطولة الأساطير',
 'بطولة حصرية لأفضل 32 لاعب في المجتمع. مستوى احترافي عالي جداً مع بث مباشر وتحليل فني من الخبراء.',
 '/images/tournaments/legends-tournament.jpg',
 'single_elimination', '1v1', '20k',
 32, 32, 5000.00, 25.00,
 '2024-03-01 20:00:00', '2024-03-08 22:00:00', '2024-02-28 23:59:59',
 'in_progress', 1, 'global', 'tournament',
 'قوانين بطولة الأساطير:\n1. للمحترفين فقط - مستوى 80+\n2. جميع المباريات Best of 5\n3. حكام محترفين لكل مباراة\n4. بث مباشر إجباري\n5. تحليل فني متخصص\n6. قوانين صارمة جداً',
 'https://discord.gg/zh-legends', '@zh_legends', 'https://twitch.tv/zh-legends',
 TRUE, 4100),

-- بطولة مفتوحة للتسجيل
('تحدي الثنائيات الكبير',
 'أول بطولة 2v2 كبيرة في المجتمع العربي. فرق من لاعبين تتنافس في معارك تكتيكية مثيرة تتطلب التنسيق والعمل الجماعي.',
 '/images/tournaments/2v2-challenge.jpg',
 'single_elimination', '2v2', '10k',
 48, 24, 800.00, 10.00,
 '2024-03-20 19:00:00', '2024-03-27 21:00:00', '2024-03-18 23:59:59',
 'registration_open', 1, 'global', 'classic',
 'قوانين بطولة الثنائيات:\n1. فرق من لاعبين اثنين بالضبط\n2. التسجيل كفريق واحد\n3. التواصل الصوتي مسموح\n4. استراتيجيات التنسيق مهمة\n5. منع تغيير الشريك بعد التسجيل',
 'https://discord.gg/zh-2v2', '@zh_2v2', 'https://youtube.com/live/zh-2v2',
 FALSE, 1567),

-- بطولة مكتملة 2
('بطولة المبتدئين الشهرية',
 'بطولة شهرية مخصصة للاعبين الجدد والمبتدئين. بيئة تعليمية ودودة مع مدربين متطوعين ونصائح مفيدة.',
 '/images/tournaments/beginners-monthly.jpg',
 'single_elimination', '1v1', '5k',
 32, 32, 200.00, 0.00,
 '2024-02-10 17:00:00', '2024-02-17 20:00:00', '2024-02-09 23:59:59',
 'completed', 1, 'global', 'classic',
 'قوانين بطولة المبتدئين:\n1. للمبتدئين فقط - مستوى أقل من 50\n2. مدربين متطوعين للمساعدة\n3. شرح القوانين قبل كل مباراة\n4. بيئة ودودة وتشجيعية\n5. التركيز على التعلم',
 'https://discord.gg/zh-beginners', '@zh_beginners', NULL,
 FALSE, 1234);

-- ================================================
-- بيانات المشاركين
-- ================================================

INSERT INTO tournament_participants (tournament_id, user_id, team_name, status, contact_discord, contact_telegram) VALUES
-- بطولة الجنرالات الكبرى
(1, 2, 'سيد الجنرالات', 'approved', 'zh_master#1234', '@zh_master'),
(1, 3, 'محترف الاستراتيجيات', 'approved', 'generals_pro#5678', '@generals_pro'),
(1, 4, 'التكتيكي الماهر', 'approved', 'tactical#9012', '@tactical_gamer'),
(1, 5, 'عاصفة الصحراء', 'approved', 'desert_storm#3456', '@desert_storm'),
(1, 6, 'أسطورة المعارك', 'approved', 'zh_legend#7890', '@zh_legend'),
(1, 7, 'قائد السماء', 'registered', 'air_commander#2345', '@air_commander'),
(1, 8, 'سيد الدبابات', 'registered', 'tank_master#6789', '@tank_master'),

-- تحدي الكلانات
(2, 2, 'الذئاب المحاربة', 'approved', 'war_wolves#1111', '@war_wolves'),
(2, 3, 'أسياد الحرب', 'approved', 'war_lords#2222', '@war_lords'),
(2, 5, 'عاصفة الصحراء', 'approved', 'storm_clan#3333', '@storm_clan'),
(2, 6, 'فرسان الشرق', 'approved', 'eastern_knights#4444', '@eastern_knights'),

-- كأس الشرق الأوسط (مكتملة)
(3, 6, 'فارس العرب', 'winner', 'zh_legend#7890', '@zh_legend'),
(3, 7, 'نسر الشرق', 'eliminated', 'air_commander#2345', '@air_commander'),
(3, 8, 'أسد بابل', 'eliminated', 'tank_master#6789', '@tank_master'),
(3, 2, 'صقر الجزيرة', 'eliminated', 'zh_master#1234', '@zh_master'),

-- بطولة الأساطير (جارية)
(4, 2, 'الأسطورة الأولى', 'approved', 'zh_master#1234', '@zh_master'),
(4, 3, 'الجنرال الأعظم', 'approved', 'generals_pro#5678', '@generals_pro'),
(4, 6, 'ملك المعارك', 'approved', 'zh_legend#7890', '@zh_legend'),
(4, 4, 'عبقري التكتيك', 'approved', 'tactical#9012', '@tactical_gamer'),

-- تحدي الثنائيات
(5, 2, 'النسور الذهبية', 'approved', 'team_eagles#1111', '@team_eagles'),
(5, 6, 'الصقور الحمراء', 'approved', 'red_hawks#2222', '@red_hawks'),
(5, 4, 'المحاربون المتحدون', 'registered', 'united_warriors#3333', '@united_warriors'),

-- بطولة المبتدئين (مكتملة)
(6, 8, 'المحارب الجديد', 'winner', 'tank_master#6789', '@tank_master'),
(6, 7, 'النجم الصاعد', 'eliminated', 'air_commander#2345', '@air_commander');

-- ================================================
-- بيانات المباريات للبطولات المكتملة
-- ================================================

INSERT INTO tournament_matches (tournament_id, round_number, match_number, participant1_id, participant2_id, winner_id, score1, score2, status, completed_time, map_played, notes) VALUES
-- كأس الشرق الأوسط - النهائي
(3, 4, 1, 
 (SELECT id FROM tournament_participants WHERE tournament_id = 3 AND user_id = 6), 
 (SELECT id FROM tournament_participants WHERE tournament_id = 3 AND user_id = 7),
 (SELECT id FROM tournament_participants WHERE tournament_id = 3 AND user_id = 6),
 2, 0, 'completed', '2024-02-29 20:30:00', 'Tournament Desert', 'مباراة نهائية مثيرة'),

-- بطولة المبتدئين - النهائي
(6, 5, 1,
 (SELECT id FROM tournament_participants WHERE tournament_id = 6 AND user_id = 8),
 (SELECT id FROM tournament_participants WHERE tournament_id = 6 AND user_id = 7),
 (SELECT id FROM tournament_participants WHERE tournament_id = 6 AND user_id = 8),
 2, 1, 'completed', '2024-02-17 19:15:00', 'Green Pastures', 'أداء ممتاز للمبتدئين');

-- تحديث المراكز النهائية للبطولات المكتملة
UPDATE tournament_participants SET placement = 1 WHERE tournament_id = 3 AND user_id = 6;
UPDATE tournament_participants SET placement = 2 WHERE tournament_id = 3 AND user_id = 7;
UPDATE tournament_participants SET placement = 3 WHERE tournament_id = 3 AND user_id = 8;
UPDATE tournament_participants SET placement = 4 WHERE tournament_id = 3 AND user_id = 2;

UPDATE tournament_participants SET placement = 1 WHERE tournament_id = 6 AND user_id = 8;
UPDATE tournament_participants SET placement = 2 WHERE tournament_id = 6 AND user_id = 7;

-- ================================================
-- الرسالة النهائية
-- ================================================

SELECT 'تم إعادة بناء نظام البطولات بنجاح!' as message;
SELECT COUNT(*) as 'عدد البطولات' FROM tournaments;
SELECT COUNT(*) as 'عدد المشاركين' FROM tournament_participants;
SELECT COUNT(*) as 'عدد المباريات' FROM tournament_matches;
SELECT SUM(prize_pool) as 'إجمالي الجوائز ($)' FROM tournaments; 