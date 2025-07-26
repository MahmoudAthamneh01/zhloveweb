-- ================================================
-- Fix Tournament Database - Remove Foreign Key Constraints
-- ================================================

USE zh_love_db;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Drop all tournament-related tables in correct order
DROP TABLE IF EXISTS tournament_matches;
DROP TABLE IF EXISTS tournament_participants;
DROP TABLE IF EXISTS tournament_applications;
DROP TABLE IF EXISTS tournament_settings;
DROP TABLE IF EXISTS tournament_maps;
DROP TABLE IF EXISTS tournament_brackets;
DROP TABLE IF EXISTS game_modes;
DROP TABLE IF EXISTS rule_templates;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS tournaments;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Now create the new structure
-- ================================================
-- TOURNAMENT MAIN TABLE
-- ================================================

CREATE TABLE tournaments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
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
    organizer_id INT NOT NULL DEFAULT 1,
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
    user_id INT NULL,
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
    
    INDEX idx_tournament (tournament_id),
    INDEX idx_user (user_id),
    INDEX idx_status (registration_status),
    INDEX idx_placement (final_placement)
);

-- ================================================
-- TOURNAMENT APPLICATIONS (For Join Requests)
-- ================================================

CREATE TABLE tournament_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    user_id INT NULL,
    
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
    
    INDEX idx_tournament (tournament_id),
    INDEX idx_user (user_id),
    INDEX idx_status (application_status)
);

-- ================================================
-- INSERT REAL TOURNAMENT DATA
-- ================================================

INSERT INTO tournaments (
    name, name_en, description, description_en, image, banner,
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

SELECT 'Database Fixed Successfully!' as message;
SELECT COUNT(*) as total_tournaments FROM tournaments; 