-- ================================================
-- ZH-Love Gaming Community - Tournament System Rebuild
-- Complete tournament database with real approved data
-- ================================================

-- Use the main database
USE zh_love_db;

-- Drop existing tournament tables if they exist
DROP TABLE IF EXISTS tournament_participants;
DROP TABLE IF EXISTS tournament_matches;
DROP TABLE IF EXISTS tournament_settings;
DROP TABLE IF EXISTS tournament_maps;
DROP TABLE IF EXISTS tournament_applications;
DROP TABLE IF EXISTS tournament_brackets;
DROP TABLE IF EXISTS tournaments;

-- ================================================
-- TOURNAMENT MAIN TABLE
-- ================================================

CREATE TABLE tournaments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description TEXT,
    description_en TEXT,
    image VARCHAR(255),
    banner VARCHAR(255),
    
    -- Tournament Settings
    type ENUM('single_elimination', 'double_elimination', 'round_robin', 'swiss', 'ladder') DEFAULT 'single_elimination',
    format ENUM('1v1', '2v2', '3v3', '4v4', 'ffa', 'clan_war') DEFAULT '1v1',
    game_mode ENUM('classic', 'contra', 'generals_challenge', 'zero_hour', 'shockwave') DEFAULT 'classic',
    region ENUM('global', 'middle_east', 'north_africa', 'europe', 'asia') DEFAULT 'global',
    resources ENUM('5k', '10k', '20k', '50k', 'unlimited') DEFAULT '10k',
    
    -- Participants
    max_participants INT NOT NULL DEFAULT 64,
    min_participants INT NOT NULL DEFAULT 8,
    current_participants INT DEFAULT 0,
    
    -- Prize and Entry
    prize_pool DECIMAL(10,2) DEFAULT 0.00,
    prize_currency ENUM('USD', 'EUR', 'SAR', 'AED', 'EGP') DEFAULT 'USD',
    entry_fee DECIMAL(10,2) DEFAULT 0.00,
    entry_currency ENUM('USD', 'EUR', 'SAR', 'AED', 'EGP') DEFAULT 'USD',
    
    -- Dates
    registration_start TIMESTAMP NULL,
    registration_end TIMESTAMP NULL,
    tournament_start TIMESTAMP NULL,
    tournament_end TIMESTAMP NULL,
    
    -- Status and Visibility
    status ENUM('draft', 'pending_approval', 'approved', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled') DEFAULT 'draft',
    visibility ENUM('public', 'private', 'invite_only') DEFAULT 'public',
    is_featured BOOLEAN DEFAULT FALSE,
    featured_priority INT DEFAULT 0,
    
    -- Organization
    organizer_id INT NOT NULL,
    organizer_name VARCHAR(100),
    organizer_contact JSON,
    
    -- Rules and Settings
    rules TEXT,
    rules_en TEXT,
    maps JSON,
    bracket_data JSON,
    stream_url VARCHAR(255),
    discord_url VARCHAR(255),
    telegram_url VARCHAR(255),
    
    -- Admin Controls
    admin_approved BOOLEAN DEFAULT FALSE,
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_status (status),
    INDEX idx_featured (is_featured, featured_priority),
    INDEX idx_region (region),
    INDEX idx_format (format),
    INDEX idx_dates (registration_start, registration_end),
    INDEX idx_organizer (organizer_id),
    INDEX idx_approved (admin_approved)
);

-- ================================================
-- TOURNAMENT PARTICIPANTS TABLE
-- ================================================

CREATE TABLE tournament_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    user_id INT NOT NULL,
    team_name VARCHAR(100),
    team_partner_id INT NULL,
    
    -- Registration
    registration_status ENUM('pending', 'approved', 'rejected', 'waitlist') DEFAULT 'pending',
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INT NULL,
    approved_at TIMESTAMP NULL,
    
    -- Tournament Progress
    bracket_position INT,
    current_round INT DEFAULT 1,
    tournament_status ENUM('active', 'eliminated', 'winner', 'runner_up', 'semifinalist', 'quarterfinalist') DEFAULT 'active',
    final_placement INT,
    
    -- Prizes
    prize_won DECIMAL(10,2) DEFAULT 0.00,
    prize_currency ENUM('USD', 'EUR', 'SAR', 'AED', 'EGP') DEFAULT 'USD',
    
    -- Contact and Notes
    contact_info JSON,
    notes TEXT,
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_partner_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_tournament_user (tournament_id, user_id),
    INDEX idx_tournament (tournament_id),
    INDEX idx_user (user_id),
    INDEX idx_status (registration_status),
    INDEX idx_placement (final_placement)
);

-- ================================================
-- TOURNAMENT MATCHES TABLE
-- ================================================

CREATE TABLE tournament_matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    round_number INT NOT NULL,
    match_number INT NOT NULL,
    
    -- Participants
    participant1_id INT,
    participant2_id INT,
    winner_id INT,
    
    -- Match Details
    scheduled_time TIMESTAMP,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    
    -- Scores
    score_p1 INT DEFAULT 0,
    score_p2 INT DEFAULT 0,
    
    -- Match Data
    map_played VARCHAR(100),
    replay_file VARCHAR(255),
    stream_url VARCHAR(255),
    
    -- Status
    match_status ENUM('scheduled', 'in_progress', 'completed', 'forfeited', 'disputed', 'cancelled') DEFAULT 'scheduled',
    
    -- Admin
    referee_id INT,
    match_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (participant1_id) REFERENCES tournament_participants(id) ON DELETE SET NULL,
    FOREIGN KEY (participant2_id) REFERENCES tournament_participants(id) ON DELETE SET NULL,
    FOREIGN KEY (winner_id) REFERENCES tournament_participants(id) ON DELETE SET NULL,
    FOREIGN KEY (referee_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_tournament (tournament_id),
    INDEX idx_round (round_number),
    INDEX idx_status (match_status),
    INDEX idx_scheduled (scheduled_time)
);

-- ================================================
-- TOURNAMENT APPLICATIONS (For Join Requests)
-- ================================================

CREATE TABLE tournament_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    user_id INT NOT NULL,
    
    -- Application Data
    application_type ENUM('individual', 'team') DEFAULT 'individual',
    team_name VARCHAR(100),
    team_partner_id INT,
    
    -- Contact Information
    contact_discord VARCHAR(100),
    contact_telegram VARCHAR(100),
    contact_email VARCHAR(100),
    
    -- Additional Info
    experience_level ENUM('beginner', 'intermediate', 'advanced', 'professional') DEFAULT 'intermediate',
    previous_tournaments TEXT,
    motivation TEXT,
    
    -- Status
    application_status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    reviewed_by INT,
    reviewed_at TIMESTAMP NULL,
    review_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_partner_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_tournament_application (tournament_id, user_id),
    INDEX idx_tournament (tournament_id),
    INDEX idx_user (user_id),
    INDEX idx_status (application_status)
);

-- ================================================
-- TOURNAMENT SETTINGS (Global Admin Settings)
-- ================================================

CREATE TABLE tournament_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value JSON,
    setting_type ENUM('array', 'object', 'string', 'number', 'boolean') DEFAULT 'string',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_key (setting_key),
    INDEX idx_active (is_active)
);

-- ================================================
-- REAL TOURNAMENT DATA - ADMIN APPROVED
-- ================================================

-- Insert Tournament Settings
INSERT INTO tournament_settings (setting_key, setting_value, setting_type, description) VALUES
('allowed_formats', '["1v1", "2v2", "3v3", "4v4", "clan_war"]', 'array', 'أنواع البطولات المسموحة'),
('game_modes', '["classic", "contra", "generals_challenge", "zero_hour", "shockwave"]', 'array', 'أنماط اللعب المتاحة'),
('resource_options', '["5k", "10k", "20k", "50k", "unlimited"]', 'array', 'خيارات الموارد المتاحة'),
('regions', '["global", "middle_east", "north_africa", "europe", "asia"]', 'array', 'المناطق المتاحة'),
('currencies', '["USD", "EUR", "SAR", "AED", "EGP"]', 'array', 'العملات المدعومة'),
('max_prize_pool', '10000', 'number', 'الحد الأقصى لجائزة البطولة'),
('min_participants', '8', 'number', 'الحد الأدنى للمشاركين'),
('max_participants', '128', 'number', 'الحد الأقصى للمشاركين'),
('require_admin_approval', 'true', 'boolean', 'تتطلب موافقة الإدارة'),
('auto_approve_verified_users', 'true', 'boolean', 'موافقة تلقائية للمستخدمين المعتمدين');

-- Insert Real Tournament Data
INSERT INTO tournaments (
    uuid, name, name_en, description, description_en, image, banner,
    type, format, game_mode, region, resources,
    max_participants, current_participants,
    prize_pool, prize_currency, entry_fee, entry_currency,
    registration_start, registration_end, tournament_start, tournament_end,
    status, visibility, is_featured, featured_priority,
    organizer_id, organizer_name, organizer_contact,
    rules, rules_en, maps, stream_url, discord_url,
    admin_approved, approved_by, approved_at
) VALUES
-- Tournament 1: Grand Championship 2024
(
    UUID(), 
    'بطولة الجنرالات الكبرى 2024', 
    'Grand Generals Championship 2024',
    'البطولة الأكبر في الشرق الأوسط للعبة الجنرالات زيرو ساعة مع أقوى اللاعبين العرب',
    'The biggest tournament in the Middle East for Command & Conquer: Generals Zero Hour with the strongest Arab players',
    '/images/tournaments/grand-championship-2024.jpg',
    '/images/tournaments/grand-championship-2024-banner.jpg',
    'single_elimination', '1v1', 'zero_hour', 'middle_east', '10k',
    128, 89,
    2500.00, 'USD', 15.00, 'USD',
    '2024-02-01 00:00:00', '2024-02-28 23:59:59', '2024-03-01 18:00:00', '2024-03-15 22:00:00',
    'registration_open', 'public', TRUE, 1,
    1, 'إدارة ZH-Love', '{"discord": "https://discord.gg/zh-love", "telegram": "https://t.me/zh_love", "email": "tournaments@zh-love.com"}',
    'قوانين البطولة الرسمية مع حظر التكتيكات غير العادلة والغش',
    'Official tournament rules with prohibition of unfair tactics and cheating',
    '["Tournament Desert", "Tournament Island", "Tournament City", "Scorched Earth", "Winter Wolf"]',
    'https://youtube.com/live/zh-love-grand-championship',
    'https://discord.gg/zh-love-tournament',
    TRUE, 1, '2024-01-15 10:00:00'
),

-- Tournament 2: Weekly Clan Challenge
(
    UUID(), 
    'تحدي الكلانات الأسبوعي', 
    'Weekly Clan Challenge',
    'مسابقة أسبوعية بين الكلانات العربية لتحديد الكلان الأقوى',
    'Weekly competition between Arab clans to determine the strongest clan',
    '/images/tournaments/weekly-clan-challenge.jpg',
    '/images/tournaments/weekly-clan-challenge-banner.jpg',
    'round_robin', 'clan_war', 'classic', 'middle_east', '20k',
    20, 16,
    500.00, 'USD', 0.00, 'USD',
    '2024-02-19 00:00:00', '2024-02-25 12:00:00', '2024-02-26 19:00:00', '2024-02-28 21:00:00',
    'in_progress', 'public', TRUE, 2,
    1, 'إدارة ZH-Love', '{"discord": "https://discord.gg/zh-love-clans", "telegram": "https://t.me/zh_love_clans"}',
    'قوانين حرب الكلانات مع نظام النقاط والتصنيف',
    'Clan war rules with points system and ranking',
    '["Clan War Arena", "Battle Desert", "City Combat", "Industrial Zone"]',
    'https://youtube.com/live/zh-love-clan-wars',
    'https://discord.gg/zh-love-clans',
    TRUE, 1, '2024-02-15 14:00:00'
),

-- Tournament 3: Middle East Cup
(
    UUID(), 
    'كأس الشرق الأوسط', 
    'Middle East Cup',
    'كأس مميزة للاعبين من منطقة الشرق الأوسط وشمال أفريقيا',
    'Special cup for players from Middle East and North Africa region',
    '/images/tournaments/middle-east-cup.jpg',
    '/images/tournaments/middle-east-cup-banner.jpg',
    'double_elimination', '1v1', 'generals_challenge', 'middle_east', '10k',
    64, 64,
    1200.00, 'USD', 8.00, 'USD',
    '2024-01-15 00:00:00', '2024-02-05 23:59:59', '2024-02-06 18:00:00', '2024-02-20 22:00:00',
    'completed', 'public', TRUE, 3,
    1, 'إدارة ZH-Love', '{"discord": "https://discord.gg/zh-love", "email": "middle-east-cup@zh-love.com"}',
    'قوانين كأس الشرق الأوسط مع نظام الإقصاء المزدوج',
    'Middle East Cup rules with double elimination system',
    '["Desert Combat", "Middle East", "Oil Refinery", "Scorched Earth", "Urban Combat"]',
    'https://youtube.com/live/middle-east-cup',
    'https://discord.gg/zh-love',
    TRUE, 1, '2024-01-10 12:00:00'
),

-- Tournament 4: Legends Tournament
(
    UUID(), 
    'بطولة الأساطير', 
    'Legends Tournament',
    'بطولة مخصصة للاعبين الأساطير والمحترفين فقط',
    'Tournament dedicated to legendary and professional players only',
    '/images/tournaments/legends-tournament.jpg',
    '/images/tournaments/legends-tournament-banner.jpg',
    'single_elimination', '1v1', 'zero_hour', 'global', '20k',
    32, 32,
    5000.00, 'USD', 25.00, 'USD',
    '2024-02-20 00:00:00', '2024-03-05 23:59:59', '2024-03-06 20:00:00', '2024-03-20 23:00:00',
    'in_progress', 'invite_only', TRUE, 4,
    1, 'إدارة ZH-Love', '{"discord": "https://discord.gg/zh-love-legends", "email": "legends@zh-love.com"}',
    'قوانين صارمة للمحترفين مع تحكيم مباشر',
    'Strict rules for professionals with live refereeing',
    '["Tournament Arena", "Pro Battle", "Championship Map", "Elite Combat", "Master Desert"]',
    'https://youtube.com/live/legends-tournament',
    'https://discord.gg/zh-love-legends',
    TRUE, 1, '2024-02-18 16:00:00'
),

-- Tournament 5: 2v2 Challenge
(
    UUID(), 
    'تحدي الثنائيات الكبير', 
    '2v2 Challenge Championship',
    'بطولة الفرق الثنائية مع أفضل اللاعبين',
    'Team tournament with the best players in pairs',
    '/images/tournaments/2v2-challenge.jpg',
    '/images/tournaments/2v2-challenge-banner.jpg',
    'single_elimination', '2v2', 'classic', 'global', '10k',
    48, 24,
    800.00, 'USD', 10.00, 'USD',
    '2024-03-01 00:00:00', '2024-03-15 23:59:59', '2024-03-16 19:00:00', '2024-03-30 21:00:00',
    'registration_open', 'public', FALSE, 5,
    1, 'إدارة ZH-Love', '{"discord": "https://discord.gg/zh-love-2v2", "telegram": "https://t.me/zh_love_2v2"}',
    'قوانين الفرق الثنائية مع تنسيق خاص',
    '2v2 team rules with special coordination',
    '["Team Battle", "Dual Combat", "Partner Arena", "Cooperative Desert"]',
    'https://youtube.com/live/2v2-challenge',
    'https://discord.gg/zh-love-2v2',
    TRUE, 1, '2024-02-25 11:00:00'
),

-- Tournament 6: Beginners Monthly
(
    UUID(), 
    'بطولة المبتدئين الشهرية', 
    'Monthly Beginners Tournament',
    'بطولة شهرية مخصصة للاعبين الجدد والمبتدئين',
    'Monthly tournament dedicated to new and beginner players',
    '/images/tournaments/beginners-monthly.jpg',
    '/images/tournaments/beginners-monthly-banner.jpg',
    'single_elimination', '1v1', 'classic', 'global', '5k',
    32, 32,
    200.00, 'USD', 0.00, 'USD',
    '2024-01-01 00:00:00', '2024-01-25 23:59:59', '2024-01-26 17:00:00', '2024-02-02 20:00:00',
    'completed', 'public', FALSE, 6,
    1, 'إدارة ZH-Love', '{"discord": "https://discord.gg/zh-love-beginners", "email": "beginners@zh-love.com"}',
    'قوانين مبسطة للمبتدئين مع إرشادات ونصائح',
    'Simplified rules for beginners with guidance and tips',
    '["Training Ground", "Beginner Desert", "Simple Battle", "Learning Arena"]',
    'https://youtube.com/live/beginners-tournament',
    'https://discord.gg/zh-love-beginners',
    TRUE, 1, '2024-01-05 09:00:00'
);

-- Insert Tournament Participants (Sample Data)
INSERT INTO tournament_participants (
    tournament_id, user_id, team_name, registration_status, bracket_position, 
    tournament_status, final_placement, prize_won, prize_currency, contact_info
) VALUES
-- Grand Championship participants
(1, 2, 'ZH Master', 'approved', 1, 'active', NULL, 0.00, 'USD', '{"discord": "zh_master#1234", "telegram": "@zh_master"}'),
(1, 3, 'Generals Pro', 'approved', 2, 'active', NULL, 0.00, 'USD', '{"discord": "generals_pro#5678", "telegram": "@generals_pro"}'),
(1, 4, 'Tactical Gamer', 'approved', 3, 'active', NULL, 0.00, 'USD', '{"discord": "tactical#9012", "telegram": "@tactical_gamer"}'),
(1, 5, 'Desert Storm', 'approved', 8, 'active', NULL, 0.00, 'USD', '{"discord": "desert_storm#3456", "telegram": "@desert_storm"}'),
(1, 6, 'ZH Legend', 'approved', 4, 'active', NULL, 0.00, 'USD', '{"discord": "zh_legend#7890", "telegram": "@zh_legend"}'),
(1, 7, 'Air Commander', 'approved', 5, 'active', NULL, 0.00, 'USD', '{"discord": "air_commander#2345", "telegram": "@air_commander"}'),
(1, 8, 'Tank Master', 'approved', 6, 'active', NULL, 0.00, 'USD', '{"discord": "tank_master#6789", "telegram": "@tank_master"}'),

-- Middle East Cup (Completed)
(3, 6, 'ZH Legend', 'approved', 1, 'winner', 1, 600.00, 'USD', '{"discord": "zh_legend#7890", "telegram": "@zh_legend"}'),
(3, 7, 'Air Commander', 'approved', 2, 'runner_up', 2, 300.00, 'USD', '{"discord": "air_commander#2345", "telegram": "@air_commander"}'),
(3, 8, 'Tank Master', 'approved', 3, 'semifinalist', 3, 150.00, 'USD', '{"discord": "tank_master#6789", "telegram": "@tank_master"}'),
(3, 2, 'ZH Master', 'approved', 4, 'semifinalist', 4, 150.00, 'USD', '{"discord": "zh_master#1234", "telegram": "@zh_master"}'),

-- Beginners Monthly (Completed)
(6, 8, 'New Tank Master', 'approved', 1, 'winner', 1, 100.00, 'USD', '{"discord": "tank_master#6789", "telegram": "@tank_master"}'),
(6, 5, 'Desert Rookie', 'approved', 2, 'runner_up', 2, 60.00, 'USD', '{"discord": "desert_storm#3456", "telegram": "@desert_storm"}'),
(6, 4, 'Tactical Beginner', 'approved', 3, 'semifinalist', 3, 40.00, 'USD', '{"discord": "tactical#9012", "telegram": "@tactical_gamer"}');

-- ================================================
-- INDEXES FOR OPTIMIZATION
-- ================================================

-- Additional indexes for better performance
CREATE INDEX idx_tournaments_featured_status ON tournaments(is_featured, status);
CREATE INDEX idx_tournaments_region_status ON tournaments(region, status);
CREATE INDEX idx_tournaments_dates ON tournaments(registration_start, registration_end, tournament_start);
CREATE INDEX idx_participants_tournament_status ON tournament_participants(tournament_id, registration_status);
CREATE INDEX idx_applications_tournament_status ON tournament_applications(tournament_id, application_status);
CREATE INDEX idx_matches_tournament_round ON tournament_matches(tournament_id, round_number);

-- ================================================
-- SETUP COMPLETE
-- ================================================

SELECT 'Tournament Database Rebuild Completed Successfully!' as message;
SELECT COUNT(*) as total_tournaments FROM tournaments;
SELECT COUNT(*) as total_participants FROM tournament_participants;
SELECT COUNT(*) as total_applications FROM tournament_applications;
SELECT COUNT(*) as total_settings FROM tournament_settings; 