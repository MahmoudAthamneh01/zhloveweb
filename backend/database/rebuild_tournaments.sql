-- ================================================
-- REBUILD TOURNAMENTS SYSTEM
-- Drop existing tables and rebuild with new features
-- Including Arabic/English sample data
-- ================================================

USE zh_love_db;

-- ================================================
-- STEP 1: DISABLE FOREIGN KEY CHECKS & DROP TABLES
-- ================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Drop tournament-related tables in correct order
DROP TABLE IF EXISTS tournament_archives;
DROP TABLE IF EXISTS tournament_statistics;
DROP TABLE IF EXISTS tournament_brackets;
DROP TABLE IF EXISTS tournament_staff;
DROP TABLE IF EXISTS tournament_invitations;
DROP TABLE IF EXISTS tournament_update_reads;
DROP TABLE IF EXISTS tournament_updates;
DROP TABLE IF EXISTS tournament_matches;
DROP TABLE IF EXISTS tournament_participants;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS tournaments;

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================
-- STEP 2: CREATE ENHANCED TOURNAMENTS TABLE
-- ================================================

CREATE TABLE tournaments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Basic Information (Multi-language)
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    description TEXT,
    description_en TEXT,
    
    -- Tournament Configuration
    format ENUM('single_elimination', 'double_elimination', 'round_robin', 'swiss') DEFAULT 'single_elimination',
    type ENUM('1v1', '2v2', 'clan_war', 'team') DEFAULT '1v1',
    max_participants INT NOT NULL DEFAULT 16,
    current_participants INT DEFAULT 0,
    
    -- Financial
    prize_pool DECIMAL(10,2) DEFAULT 0.00,
    entry_fee DECIMAL(10,2) DEFAULT 0.00,
    prize_distribution JSON,
    
    -- Scheduling
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    registration_deadline DATETIME NOT NULL,
    
    -- Status and Management
    status ENUM('draft', 'pending_approval', 'open', 'registration_closed', 'live', 'paused', 'completed', 'cancelled', 'rejected') DEFAULT 'draft',
    organizer_id INT NOT NULL,
    co_organizers JSON,
    
    -- Game Settings
    game_mode ENUM('classic', 'tournament', 'ranked', 'custom') DEFAULT 'classic',
    region ENUM('global', 'mena', 'europe', 'asia', 'americas') DEFAULT 'global',
    allowed_maps JSON,
    
    -- Tournament Features
    is_private BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    require_approval BOOLEAN DEFAULT TRUE,
    allow_spectators BOOLEAN DEFAULT TRUE,
    use_custom_rules BOOLEAN DEFAULT FALSE,
    auto_start BOOLEAN DEFAULT FALSE,
    
    -- Rules and Requirements (Multi-language)
    rules TEXT,
    rules_en TEXT,
    requirements TEXT,
    requirements_en TEXT,
    
    -- Restrictions
    min_rank VARCHAR(20),
    max_rank VARCHAR(20),
    min_level INT DEFAULT 1,
    max_level INT DEFAULT 100,
    
    -- Media and Branding
    image VARCHAR(255),
    banner VARCHAR(255),
    
    -- Contact and External
    contact_info JSON,
    stream_url VARCHAR(500),
    broadcast_channels JSON,
    sponsors JSON,
    
    -- Approval Process
    approved_at TIMESTAMP NULL,
    approved_by INT NULL,
    rejected_at TIMESTAMP NULL,
    rejected_by INT NULL,
    rejection_reason TEXT,
    rejection_reason_en TEXT,
    
    -- Statistics
    views INT DEFAULT 0,
    popularity_score INT DEFAULT 0,
    participant_rating DECIMAL(3,2) DEFAULT 0.00,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_name (name),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    INDEX idx_organizer (organizer_id),
    INDEX idx_region (region),
    INDEX idx_featured (is_featured),
    INDEX idx_type_format (type, format),
    INDEX idx_status_date (status, start_date),
    
    -- Foreign Keys
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ================================================
-- STEP 3: CREATE ENHANCED PARTICIPANTS TABLE
-- ================================================

CREATE TABLE tournament_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    user_id INT,
    clan_id INT,
    
    -- Team Information
    team_name VARCHAR(100),
    team_name_en VARCHAR(100),
    team_members JSON,
    captain_id INT,
    seed_number INT,
    
    -- Status and Placement
    status ENUM('registered', 'approved', 'rejected', 'checked_in', 'eliminated', 'disqualified', 'winner') DEFAULT 'registered',
    placement INT,
    final_rank INT,
    
    -- Performance Stats
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    points INT DEFAULT 0,
    score_differential INT DEFAULT 0,
    
    -- Prizes
    prize_won DECIMAL(10,2) DEFAULT 0.00,
    prize_type ENUM('money', 'item', 'title', 'points') DEFAULT 'money',
    
    -- Timestamps
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    check_in_at TIMESTAMP NULL,
    eliminated_at TIMESTAMP NULL,
    
    -- Notes
    notes TEXT,
    admin_notes TEXT,
    
    -- Indexes and Constraints
    UNIQUE KEY unique_tournament_user (tournament_id, user_id),
    INDEX idx_tournament_status (tournament_id, status),
    INDEX idx_user_tournaments (user_id),
    INDEX idx_clan_tournaments (clan_id),
    INDEX idx_placement (placement),
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (clan_id) REFERENCES clans(id) ON DELETE CASCADE,
    FOREIGN KEY (captain_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ================================================
-- STEP 4: CREATE ENHANCED MATCHES TABLE
-- ================================================

CREATE TABLE tournament_matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    
    -- Match Identification
    round_number INT NOT NULL,
    match_number INT NOT NULL,
    bracket_type ENUM('main', 'losers', 'consolation', 'group') DEFAULT 'main',
    group_name VARCHAR(50),
    
    -- Participants
    participant1_id INT,
    participant2_id INT,
    winner_id INT,
    loser_id INT,
    
    -- Match Status and Timing
    status ENUM('scheduled', 'ready', 'live', 'completed', 'disputed', 'walkover', 'cancelled', 'bye') DEFAULT 'scheduled',
    scheduled_time DATETIME,
    started_time DATETIME,
    completed_time DATETIME,
    duration_minutes INT,
    
    -- Scores and Results
    score1 INT DEFAULT 0,
    score2 INT DEFAULT 0,
    sets_won1 INT DEFAULT 0,
    sets_won2 INT DEFAULT 0,
    game_results JSON,
    detailed_results JSON,
    
    -- Match Settings
    best_of INT DEFAULT 1,
    map_pool JSON,
    selected_maps JSON,
    
    -- Officials and Administration
    referee_id INT,
    moderator_id INT,
    admin_notes TEXT,
    dispute_reason TEXT,
    dispute_resolution TEXT,
    
    -- Media and Streaming
    stream_url VARCHAR(500),
    replay_files JSON,
    screenshots JSON,
    vod_url VARCHAR(500),
    
    -- Bracket Structure
    next_match_winner_id INT,
    next_match_loser_id INT,
    previous_match1_id INT,
    previous_match2_id INT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_tournament_round (tournament_id, round_number),
    INDEX idx_match_status (status),
    INDEX idx_scheduled_time (scheduled_time),
    INDEX idx_participants (participant1_id, participant2_id),
    INDEX idx_winner (winner_id),
    INDEX idx_bracket_type (bracket_type),
    
    -- Foreign Keys
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (participant1_id) REFERENCES tournament_participants(id) ON DELETE SET NULL,
    FOREIGN KEY (participant2_id) REFERENCES tournament_participants(id) ON DELETE SET NULL,
    FOREIGN KEY (winner_id) REFERENCES tournament_participants(id) ON DELETE SET NULL,
    FOREIGN KEY (loser_id) REFERENCES tournament_participants(id) ON DELETE SET NULL,
    FOREIGN KEY (referee_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (moderator_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (next_match_winner_id) REFERENCES tournament_matches(id) ON DELETE SET NULL,
    FOREIGN KEY (next_match_loser_id) REFERENCES tournament_matches(id) ON DELETE SET NULL,
    FOREIGN KEY (previous_match1_id) REFERENCES tournament_matches(id) ON DELETE SET NULL,
    FOREIGN KEY (previous_match2_id) REFERENCES tournament_matches(id) ON DELETE SET NULL
);

-- ================================================
-- STEP 5: CREATE TOURNAMENT UPDATES SYSTEM
-- ================================================

CREATE TABLE tournament_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    author_id INT NOT NULL,
    
    -- Content (Multi-language)
    title VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    content TEXT NOT NULL,
    content_en TEXT,
    
    -- Classification
    type ENUM('general', 'schedule', 'rules', 'results', 'important', 'announcement') DEFAULT 'general',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    
    -- Settings
    is_pinned BOOLEAN DEFAULT FALSE,
    notify_participants BOOLEAN DEFAULT TRUE,
    visibility ENUM('public', 'participants', 'organizers', 'staff') DEFAULT 'public',
    
    -- Metadata
    attachments JSON,
    tags JSON,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_tournament_updates (tournament_id, created_at DESC),
    INDEX idx_author (author_id),
    INDEX idx_type_priority (type, priority),
    INDEX idx_pinned (is_pinned),
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tournament update read tracking
CREATE TABLE tournament_update_reads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    update_id INT NOT NULL,
    user_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_update_read (update_id, user_id),
    INDEX idx_user_reads (user_id),
    
    FOREIGN KEY (update_id) REFERENCES tournament_updates(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ================================================
-- STEP 6: CREATE INVITATION SYSTEM
-- ================================================

CREATE TABLE tournament_invitations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    user_id INT NOT NULL,
    invited_by INT NOT NULL,
    
    -- Invitation Details
    message TEXT,
    message_en TEXT,
    
    -- Status Tracking
    status ENUM('pending', 'accepted', 'declined', 'expired', 'cancelled') DEFAULT 'pending',
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    
    -- Response
    response_message TEXT,
    
    -- Indexes
    UNIQUE KEY unique_tournament_invitation (tournament_id, user_id),
    INDEX idx_user_invitations (user_id, status),
    INDEX idx_tournament_invitations (tournament_id, status),
    INDEX idx_invited_by (invited_by),
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ================================================
-- STEP 7: CREATE STAFF MANAGEMENT SYSTEM
-- ================================================

CREATE TABLE tournament_staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    user_id INT NOT NULL,
    
    -- Role and Permissions
    role ENUM('organizer', 'co_organizer', 'referee', 'moderator', 'commentator', 'admin', 'observer') NOT NULL,
    permissions JSON,
    
    -- Management
    appointed_by INT NOT NULL,
    appointed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    removed_at TIMESTAMP NULL,
    removed_by INT NULL,
    removal_reason TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Indexes
    UNIQUE KEY unique_tournament_staff (tournament_id, user_id, role),
    INDEX idx_tournament_staff (tournament_id, role),
    INDEX idx_user_staff (user_id),
    INDEX idx_appointed_by (appointed_by),
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointed_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (removed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ================================================
-- STEP 8: CREATE STATISTICS AND ANALYTICS
-- ================================================

CREATE TABLE tournament_statistics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    date DATE NOT NULL,
    
    -- Engagement Metrics
    views INT DEFAULT 0,
    unique_visitors INT DEFAULT 0,
    page_views INT DEFAULT 0,
    
    -- Registration Metrics
    registrations INT DEFAULT 0,
    applications INT DEFAULT 0,
    approvals INT DEFAULT 0,
    rejections INT DEFAULT 0,
    check_ins INT DEFAULT 0,
    
    -- Match Metrics
    matches_scheduled INT DEFAULT 0,
    matches_played INT DEFAULT 0,
    matches_completed INT DEFAULT 0,
    matches_disputed INT DEFAULT 0,
    average_match_duration INT DEFAULT 0,
    
    -- Streaming Metrics
    peak_viewers INT DEFAULT 0,
    total_watch_time INT DEFAULT 0,
    concurrent_streams INT DEFAULT 0,
    
    -- Social Metrics
    shares INT DEFAULT 0,
    comments INT DEFAULT 0,
    likes INT DEFAULT 0,
    
    -- Indexes
    UNIQUE KEY unique_tournament_date (tournament_id, date),
    INDEX idx_tournament_stats (tournament_id, date),
    INDEX idx_date (date),
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

-- Tournament brackets structure
CREATE TABLE tournament_brackets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    bracket_type ENUM('main', 'losers', 'consolation', 'group') DEFAULT 'main',
    structure JSON,
    settings JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_tournament_bracket (tournament_id, bracket_type),
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

-- Tournament archives
CREATE TABLE tournament_archives (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    
    -- Archive Data
    archive_data JSON,
    final_results JSON,
    statistics JSON,
    participant_data JSON,
    match_data JSON,
    
    -- Metadata
    archived_by INT NOT NULL,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archive_reason TEXT,
    
    -- Indexes
    UNIQUE KEY unique_tournament_archive (tournament_id),
    INDEX idx_archived_at (archived_at),
    INDEX idx_archived_by (archived_by),
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (archived_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ================================================
-- STEP 9: CREATE VIEWS FOR COMMON QUERIES
-- ================================================

-- Tournament summary view
CREATE VIEW tournament_summary AS
SELECT 
    t.id,
    t.name,
    t.name_en,
    t.description,
    t.description_en,
    t.format,
    t.type,
    t.max_participants,
    t.current_participants,
    t.prize_pool,
    t.start_date,
    t.registration_deadline,
    t.status,
    t.region,
    t.game_mode,
    t.is_featured,
    t.is_private,
    t.image,
    t.views,
    u.username AS organizer_name,
    u.avatar AS organizer_avatar,
    COUNT(DISTINCT tp.id) AS registered_count,
    COUNT(DISTINCT CASE WHEN tp.status = 'approved' THEN tp.id END) AS approved_count,
    COUNT(DISTINCT tm.id) AS total_matches,
    COUNT(DISTINCT CASE WHEN tm.status = 'completed' THEN tm.id END) AS completed_matches,
    AVG(tp.final_rank) AS avg_participant_rank,
    t.created_at,
    t.updated_at
FROM tournaments t
LEFT JOIN users u ON t.organizer_id = u.id
LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id
LEFT JOIN tournament_matches tm ON t.id = tm.tournament_id
GROUP BY t.id, u.username, u.avatar;

-- Active tournaments view
CREATE VIEW active_tournaments AS
SELECT 
    t.*,
    u.username AS organizer_name,
    COUNT(DISTINCT tp.id) AS participant_count,
    COUNT(DISTINCT CASE WHEN tm.status = 'live' THEN tm.id END) AS live_matches
FROM tournaments t
LEFT JOIN users u ON t.organizer_id = u.id
LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id AND tp.status IN ('approved', 'checked_in')
LEFT JOIN tournament_matches tm ON t.id = tm.tournament_id
WHERE t.status IN ('open', 'registration_closed', 'live')
GROUP BY t.id, u.username;

-- ================================================
-- STEP 10: INSERT SAMPLE DATA (ARABIC/ENGLISH)
-- ================================================

-- Insert enhanced tournaments with bilingual content
INSERT INTO tournaments (
    name, name_en, description, description_en, format, type, max_participants, 
    prize_pool, entry_fee, start_date, registration_deadline, status, organizer_id,
    game_mode, region, is_featured, rules, rules_en, contact_info, allowed_maps,
    image, views, popularity_score
) VALUES 

-- Featured Tournament 1
('بطولة ZH-Love الكبرى 2024', 'ZH-Love Grand Championship 2024',
 'البطولة الأكبر والأهم في المجتمع العربي لجنرالز زيرو ساعة. شارك واثبت مهاراتك أمام أفضل اللاعبين!',
 'The biggest and most important tournament in the Arabic C&C Generals Zero Hour community. Join and prove your skills against the best players!',
 'single_elimination', '1v1', 64, 1000.00, 10.00,
 '2024-03-15 18:00:00', '2024-03-10 23:59:59', 'open', 1,
 'tournament', 'global', 1,
 'قوانين البطولة الكبرى:\n1. جميع المباريات Best of 3\n2. اختيار الخرائط عشوائي من القائمة المحددة\n3. ممنوع استخدام الغش أو التلاعب\n4. الحضور قبل 15 دقيقة من المباراة\n5. في حالة عدم الحضور، فوز تلقائي للخصم\n6. احترام الخصم واللعب النظيف',
 'Grand Championship Rules:\n1. All matches are Best of 3\n2. Random map selection from approved list\n3. No cheating or exploitation allowed\n4. Arrive 15 minutes before match time\n5. No-show results in automatic forfeit\n6. Respect opponents and play fair',
 '{"discord": "https://discord.gg/zh-love", "telegram": "@zh_love_official", "email": "tournaments@zh-love.com"}',
 '["Tournament Desert", "Desert Fury", "Winter Wolf", "Mountain Pass", "Urban Combat", "Industrial Zone"]',
 '/uploads/tournaments/grand-championship-2024.jpg', 2450, 95),

-- Featured Tournament 2 
('كأس الشرق الأوسط للجنرالات', 'Middle East Generals Cup',
 'بطولة إقليمية خاصة بلاعبي منطقة الشرق الأوسط وشمال أفريقيا مع جوائز قيمة ومنافسة شرسة.',
 'Regional tournament specifically for Middle East and North Africa players with valuable prizes and fierce competition.',
 'double_elimination', '1v1', 32, 500.00, 5.00,
 '2024-03-20 19:00:00', '2024-03-18 23:59:59', 'open', 1,
 'ranked', 'mena', 1,
 'قوانين كأس الشرق الأوسط:\n1. مخصص للاعبين من منطقة الشرق الأوسط وشمال أفريقيا\n2. نظام إقصاء مزدوج - فرصة ثانية\n3. مباريات Best of 3 في النهائيات\n4. استخدام خوادم الشرق الأوسط فقط\n5. التواصل باللغة العربية أو الإنجليزية',
 'Middle East Cup Rules:\n1. Exclusive to MENA region players\n2. Double elimination - second chance system\n3. Best of 3 matches in finals\n4. Middle East servers only\n5. Communication in Arabic or English',
 '{"discord": "https://discord.gg/mena-zh", "telegram": "@mena_zh_cup", "email": "mena@zh-love.com"}',
 '["Desert Fury", "Tournament Desert", "Valley of Death", "Scorched Earth", "Green Pastures"]',
 '/uploads/tournaments/middle-east-cup.jpg', 1890, 88),

-- Regular Tournament 1
('تحدي الكلانات الأسبوعي', 'Weekly Clan Challenge',
 'منافسة أسبوعية بين الكلانات لتحديد الأقوى. فرق من 5 لاعبين، استراتيجية وتنسيق مطلوب!',
 'Weekly competition between clans to determine the strongest. 5-player teams, strategy and coordination required!',
 'round_robin', 'clan_war', 16, 250.00, 0.00,
 '2024-03-08 20:00:00', '2024-03-07 23:59:59', 'open', 1,
 'classic', 'global', 0,
 'قوانين تحدي الكلانات:\n1. كل كلان يرسل فريق من 5 لاعبين\n2. مباريات 3v3 و 2v2 و 1v1\n3. نظام النقاط التراكمية\n4. يجب أن يكون جميع الأعضاء من نفس الكلان\n5. القائد يختار التشكيلة لكل مباراة',
 'Clan Challenge Rules:\n1. Each clan sends a 5-player team\n2. Matches include 3v3, 2v2, and 1v1 formats\n3. Cumulative points system\n4. All members must be from same clan\n5. Captain chooses lineup for each match',
 '{"discord": "https://discord.gg/clan-wars", "telegram": "@zh_clan_wars"}',
 '["Tournament Arena", "Clan Battlefield", "Strategic Plains", "War Zone", "Combat Valley"]',
 '/uploads/tournaments/weekly-clan-challenge.jpg', 1245, 76),

-- Beginner Tournament
('بطولة المبتدئين الشهرية', 'Monthly Beginners Tournament',
 'بطولة خاصة للاعبين الجدد والمبتدئين. بيئة تعليمية ودودة مع مدربين متطوعين.',
 'Special tournament for new and beginner players. Friendly learning environment with volunteer coaches.',
 'single_elimination', '1v1', 32, 100.00, 0.00,
 '2024-03-12 17:00:00', '2024-03-11 23:59:59', 'open', 4,
 'classic', 'global', 0,
 'قوانين بطولة المبتدئين:\n1. مخصصة للاعبين دون المستوى 50\n2. مدربين متطوعين لمساعدة اللاعبين\n3. شرح القوانين قبل كل مباراة\n4. بيئة ودودة وتشجيعية\n5. التركيز على التعلم أكثر من الفوز',
 'Beginners Tournament Rules:\n1. For players below level 50 only\n2. Volunteer coaches to help players\n3. Rules explanation before each match\n4. Friendly and encouraging environment\n5. Focus on learning over winning',
 '{"discord": "https://discord.gg/zh-beginners", "email": "beginners@zh-love.com"}',
 '["Training Ground", "Basic Arena", "Learning Field", "Starter Map", "Practice Zone"]',
 '/uploads/tournaments/beginners-monthly.jpg', 890, 65),

-- Advanced Tournament
('نخبة المحترفين - تحدي الأساطير', 'Elite Pros - Legends Challenge',
 'بطولة حصرية لأفضل 16 لاعب في المجتمع. مستوى عالي جداً ومنافسة شرسة.',
 'Exclusive tournament for the top 16 players in the community. Very high level with fierce competition.',
 'double_elimination', '1v1', 16, 2000.00, 50.00,
 '2024-03-25 20:00:00', '2024-03-23 23:59:59', 'pending_approval', 1,
 'tournament', 'global', 0,
 'قوانين تحدي الأساطير:\n1. دعوة حصرية لأفضل 16 لاعب\n2. جميع المباريات Best of 5\n3. حكام محترفين لكل مباراة\n4. بث مباشر لجميع المباريات\n5. تحليل فني من خبراء\n6. قوانين صارمة جداً',
 'Legends Challenge Rules:\n1. Exclusive invitation for top 16 players\n2. All matches are Best of 5\n3. Professional referees for every match\n4. Live broadcast of all matches\n5. Expert technical analysis\n6. Very strict rules enforcement',
 '{"discord": "https://discord.gg/zh-legends", "telegram": "@zh_legends", "email": "legends@zh-love.com"}',
 '["Pro Arena", "Championship Field", "Elite Battlefield", "Masters Ground", "Legends Stadium"]',
 '/uploads/tournaments/legends-challenge.jpg', 3200, 98),

-- Team Tournament
('بطولة الفرق الثنائية الكبرى', 'Grand 2v2 Teams Championship',
 'أفضل بطولة للفرق الثنائية. تنسيق وتعاون مطلوب بين اللاعبين لتحقيق النصر.',
 'Best tournament for 2v2 teams. Coordination and teamwork required between players to achieve victory.',
 'single_elimination', '2v2', 24, 600.00, 20.00,
 '2024-03-30 18:30:00', '2024-03-28 23:59:59', 'draft', 1,
 'tournament', 'global', 0,
 'قوانين بطولة الفرق الثنائية:\n1. فرق من لاعبين اثنين فقط\n2. التسجيل كفريق واحد\n3. التواصل الصوتي مسموح ومُشجع\n4. استراتيجيات التنسيق مهمة\n5. يُمنع تغيير الشريك بعد التسجيل',
 '2v2 Teams Tournament Rules:\n1. Teams of exactly two players\n2. Register as one team unit\n3. Voice communication allowed and encouraged\n4. Coordination strategies are crucial\n5. Partner changes not allowed after registration',
 '{"discord": "https://discord.gg/zh-2v2", "telegram": "@zh_teams"}',
 '["Team Arena", "Dual Combat", "Partnership Field", "Cooperation Zone", "Alliance Battlefield"]',
 '/uploads/tournaments/2v2-championship.jpg', 1567, 82);

-- Insert tournament participants with diverse backgrounds
INSERT INTO tournament_participants (tournament_id, user_id, team_name, team_name_en, seed_number, status, wins, losses, points) VALUES
-- Grand Championship participants
(1, 2, 'سيد الجنرالات', 'Master of Generals', 1, 'approved', 0, 0, 0),
(1, 3, 'محترف الاستراتيجيات', 'Strategy Professional', 2, 'approved', 0, 0, 0),
(1, 4, 'التكتيكي الماهر', 'Skilled Tactician', 3, 'approved', 0, 0, 0),
(1, 5, 'عاصفة الصحراء', 'Desert Storm', 8, 'approved', 0, 0, 0),
(1, 6, 'أسطورة المعارك', 'Battle Legend', 4, 'approved', 0, 0, 0),
(1, 7, 'قائد السماء', 'Sky Commander', 12, 'registered', 0, 0, 0),
(1, 8, 'سيد الدبابات', 'Tank Master', 16, 'registered', 0, 0, 0),

-- Middle East Cup participants
(2, 2, 'فارس العرب', 'Arab Knight', 1, 'approved', 0, 0, 0),
(2, 5, 'نسر الشرق', 'Eagle of the East', 3, 'approved', 0, 0, 0),
(2, 6, 'أسد بابل', 'Lion of Babylon', 2, 'approved', 0, 0, 0),
(2, 4, 'صقر الجزيرة', 'Falcon of the Peninsula', 5, 'approved', 0, 0, 0),

-- Weekly Clan Challenge (clan-based)
(3, 2, NULL, NULL, 1, 'approved', 0, 0, 0),
(3, 3, NULL, NULL, 2, 'approved', 0, 0, 0),
(3, 5, NULL, NULL, 3, 'approved', 0, 0, 0),

-- Beginners Tournament
(4, 8, 'المبتدئ الطموح', 'Ambitious Beginner', 8, 'approved', 0, 0, 0),
(4, 7, 'المحارب الجديد', 'New Warrior', 12, 'approved', 0, 0, 0);

-- Insert tournament updates with bilingual content
INSERT INTO tournament_updates (tournament_id, author_id, title, title_en, content, content_en, type, is_pinned, priority) VALUES
(1, 1, 'مرحباً بكم في البطولة الكبرى!', 'Welcome to the Grand Championship!',
 'نرحب بجميع المشاركين في أكبر بطولة لهذا العام. نتمنى لكم التوفيق والمتعة في المنافسة!',
 'We welcome all participants to the biggest tournament of this year. We wish you success and enjoyment in the competition!',
 'general', 1, 'high'),

(1, 1, 'تحديث مواعيد المباريات', 'Match Schedule Update',
 'تم تحديث جدول المباريات. يرجى مراجعة مواعيدكم والتأكد من الحضور في الوقت المحدد.',
 'The match schedule has been updated. Please review your times and ensure you arrive at the specified time.',
 'schedule', 0, 'normal'),

(2, 1, 'قوانين خاصة بكأس الشرق الأوسط', 'Special Rules for Middle East Cup',
 'نذكركم بالقوانين الخاصة بهذه البطولة الإقليمية. التزموا بالمواعيد واللعب النظيف.',
 'We remind you of the special rules for this regional tournament. Stick to schedules and fair play.',
 'rules', 1, 'important'),

(3, 1, 'دليل تحدي الكلانات', 'Clan Challenge Guide',
 'دليل شامل لقادة الكلانات حول كيفية تنظيم فرقهم وإدارة المباريات.',
 'Comprehensive guide for clan leaders on how to organize their teams and manage matches.',
 'general', 0, 'normal'),

(4, 4, 'نصائح للمبتدئين', 'Tips for Beginners',
 'مجموعة من النصائح المفيدة للاعبين الجدد لتحسين أدائهم في البطولة.',
 'A collection of useful tips for new players to improve their performance in the tournament.',
 'general', 1, 'normal');

-- Insert tournament staff assignments
INSERT INTO tournament_staff (tournament_id, user_id, role, appointed_by, permissions) VALUES
(1, 1, 'organizer', 1, '{"all": true}'),
(1, 4, 'co_organizer', 1, '{"manage_participants": true, "moderate_matches": true, "post_updates": true}'),
(2, 1, 'organizer', 1, '{"all": true}'),
(3, 1, 'organizer', 1, '{"all": true}'),
(4, 4, 'organizer', 4, '{"all": true}'),
(4, 1, 'admin', 1, '{"all": true}'),
(5, 1, 'organizer', 1, '{"all": true}');

-- Insert some tournament invitations for private/exclusive tournaments
INSERT INTO tournament_invitations (tournament_id, user_id, invited_by, message, message_en, status, expires_at) VALUES
(5, 2, 1, 'دعوة خاصة للمشاركة في تحدي الأساطير - أنت من ضمن أفضل 16 لاعب!', 
 'Special invitation to participate in the Legends Challenge - you are among the top 16 players!', 
 'pending', '2024-03-23 23:59:59'),
(5, 3, 1, 'نتشرف بدعوتك لبطولة النخبة الحصرية. هل تقبل التحدي؟',
 'We are honored to invite you to the exclusive elite tournament. Do you accept the challenge?',
 'pending', '2024-03-23 23:59:59'),
(5, 6, 1, 'مكانك محجوز في تحدي الأساطير. انضم لأقوى منافسة!',
 'Your spot is reserved in the Legends Challenge. Join the strongest competition!',
 'accepted', '2024-03-23 23:59:59');

-- Insert tournament statistics for tracking
INSERT INTO tournament_statistics (tournament_id, date, views, unique_visitors, registrations, matches_scheduled) VALUES
(1, CURDATE(), 1250, 890, 45, 0),
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 980, 720, 38, 0),
(2, CURDATE(), 750, 580, 28, 0),
(3, CURDATE(), 420, 320, 12, 0),
(4, CURDATE(), 650, 480, 15, 0);

-- Update tournament view counts and participant counts
UPDATE tournaments SET 
    views = 2450, 
    current_participants = (SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = 1),
    popularity_score = 95 
WHERE id = 1;

UPDATE tournaments SET 
    views = 1890, 
    current_participants = (SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = 2),
    popularity_score = 88 
WHERE id = 2;

UPDATE tournaments SET 
    views = 1245, 
    current_participants = (SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = 3),
    popularity_score = 76 
WHERE id = 3;

UPDATE tournaments SET 
    views = 890, 
    current_participants = (SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = 4),
    popularity_score = 65 
WHERE id = 4;

-- ================================================
-- STEP 11: CREATE ADDITIONAL INDEXES FOR PERFORMANCE
-- ================================================

-- Performance optimization indexes
CREATE INDEX idx_tournaments_multilang ON tournaments(name, name_en);
CREATE INDEX idx_tournaments_status_featured ON tournaments(status, is_featured, start_date);
CREATE INDEX idx_tournaments_region_mode ON tournaments(region, game_mode, status);
CREATE INDEX idx_participants_performance ON tournament_participants(tournament_id, status, wins DESC, losses ASC);
CREATE INDEX idx_matches_scheduling ON tournament_matches(tournament_id, status, scheduled_time);
CREATE INDEX idx_updates_visibility ON tournament_updates(tournament_id, visibility, is_pinned, created_at DESC);
CREATE INDEX idx_invitations_status_expires ON tournament_invitations(status, expires_at);
CREATE INDEX idx_staff_active_role ON tournament_staff(tournament_id, is_active, role);

-- ================================================
-- FINAL SUCCESS MESSAGE
-- ================================================

SELECT 'Enhanced Tournament System Rebuilt Successfully!' AS message;
SELECT 'Tables Created:' AS info, COUNT(*) AS table_count 
FROM information_schema.tables 
WHERE table_schema = 'zh_love_db' AND table_name LIKE 'tournament%';

SELECT 'Sample Tournaments:' AS info, COUNT(*) AS tournament_count FROM tournaments;
SELECT 'Sample Participants:' AS info, COUNT(*) AS participant_count FROM tournament_participants;
SELECT 'Sample Updates:' AS info, COUNT(*) AS update_count FROM tournament_updates;
SELECT 'Sample Staff:' AS info, COUNT(*) AS staff_count FROM tournament_staff;

-- Show featured tournaments
SELECT 'Featured Tournaments:' AS info;
SELECT id, name, name_en, status, prize_pool, current_participants, max_participants 
FROM tournaments 
WHERE is_featured = 1; 