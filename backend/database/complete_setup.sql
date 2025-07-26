-- ================================================
-- ZH-Love Gaming Community Database Setup
-- Complete database creation and data insertion
-- ================================================

-- Create database
CREATE DATABASE IF NOT EXISTS zh_love_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE zh_love_db;

-- ================================================
-- MAIN SCHEMA - Users, Clans, Core Tables
-- ================================================

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    bio TEXT,
    country VARCHAR(50),
    avatar VARCHAR(255),
    role ENUM('admin', 'moderator', 'player') DEFAULT 'player',
    level INT DEFAULT 1,
    xp INT DEFAULT 0,
    total_matches INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    rank_points INT DEFAULT 1000,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_level (level),
    INDEX idx_rank_points (rank_points)
);

-- Clans table
CREATE TABLE clans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    tag VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    logo VARCHAR(255),
    banner VARCHAR(255),
    owner_id INT NOT NULL,
    total_members INT DEFAULT 0,
    total_points INT DEFAULT 0,
    level INT DEFAULT 1,
    max_members INT DEFAULT 30,
    is_recruiting BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_name (name),
    INDEX idx_tag (tag),
    INDEX idx_owner (owner_id),
    INDEX idx_total_points (total_points),
    INDEX idx_is_approved (is_approved)
);

-- Clan applications table
CREATE TABLE clan_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clan_name VARCHAR(100) NOT NULL,
    clan_tag VARCHAR(10) NOT NULL,
    description TEXT,
    organizer_id INT NOT NULL,
    organizer_name VARCHAR(100) NOT NULL,
    organizer_email VARCHAR(100) NOT NULL,
    organizer_phone VARCHAR(20),
    organizer_country VARCHAR(50),
    organizer_experience ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
    region VARCHAR(50),
    language VARCHAR(10) DEFAULT 'ar',
    clan_icon VARCHAR(10),
    membership_type ENUM('public', 'invite-only', 'application') DEFAULT 'application',
    min_level INT DEFAULT 1,
    min_win_rate INT DEFAULT 50,
    max_members INT DEFAULT 50,
    rules TEXT,
    participation_requirements JSON,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    notes TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_organizer_id (organizer_id),
    INDEX idx_status (status),
    INDEX idx_submitted_at (submitted_at)
);

-- Clan members table
CREATE TABLE clan_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clan_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('leader', 'officer', 'member') DEFAULT 'member',
    contribution_points INT DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clan_id) REFERENCES clans(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_clan_member (clan_id, user_id),
    INDEX idx_clan_id (clan_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role (role)
);

-- Clan join applications table
CREATE TABLE clan_join_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clan_id INT NOT NULL,
    user_id INT NOT NULL,
    player_name VARCHAR(100) NOT NULL,
    player_level INT NOT NULL,
    win_rate DECIMAL(5,2) NOT NULL,
    motivation TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    reviewed_by INT NULL,
    reviewed_at TIMESTAMP NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clan_id) REFERENCES clans(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_clan_id (clan_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- Clan wars table
CREATE TABLE clan_wars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    challenger_clan_id INT NOT NULL,
    challenged_clan_id INT NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    duration INT DEFAULT 48, -- hours
    streamer_id INT NULL,
    rules TEXT,
    challenge_message TEXT,
    status ENUM('pending', 'accepted', 'active', 'completed', 'cancelled', 'rejected') DEFAULT 'pending',
    challenger_score INT DEFAULT 0,
    challenged_score INT DEFAULT 0,
    winner_id INT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (challenger_clan_id) REFERENCES clans(id) ON DELETE CASCADE,
    FOREIGN KEY (challenged_clan_id) REFERENCES clans(id) ON DELETE CASCADE,
    FOREIGN KEY (streamer_id) REFERENCES streamers(id) ON DELETE SET NULL,
    FOREIGN KEY (winner_id) REFERENCES clans(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_challenger_clan (challenger_clan_id),
    INDEX idx_challenged_clan (challenged_clan_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_at (scheduled_at)
);

-- Sessions table
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    jwt_token TEXT,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_token (session_token),
    INDEX idx_expires_at (expires_at)
);

-- ================================================
-- FORUM SCHEMA - Categories, Posts, Replies
-- ================================================

-- Forum categories
CREATE TABLE forum_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#10B981',
    post_count INT DEFAULT 0,
    last_post_id INT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_sort_order (sort_order),
    INDEX idx_is_active (is_active)
);

-- Forum posts
CREATE TABLE forum_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    views INT DEFAULT 0,
    replies_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    last_reply_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_category_id (category_id),
    INDEX idx_user_id (user_id),
    INDEX idx_title (title),
    INDEX idx_is_pinned (is_pinned),
    INDEX idx_created_at (created_at)
);

-- Forum replies
CREATE TABLE forum_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- ================================================
-- TOURNAMENT SCHEMA - Tournaments, Participants, Matches
-- ================================================

-- Tournaments
CREATE TABLE tournaments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    type ENUM('single_elimination', 'double_elimination', 'round_robin', 'swiss') DEFAULT 'single_elimination',
    format ENUM('1v1', '2v2', 'clan_war') DEFAULT '1v1',
    max_participants INT NOT NULL,
    current_participants INT DEFAULT 0,
    prize_pool DECIMAL(10,2) DEFAULT 0.00,
    entry_fee DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('upcoming', 'registration_open', 'registration_closed', 'active', 'completed', 'cancelled') DEFAULT 'upcoming',
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    registration_deadline TIMESTAMP,
    rules TEXT,
    bracket_data JSON,
    organizer_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_name (name),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    INDEX idx_organizer_id (organizer_id)
);

-- Tournament participants
CREATE TABLE tournament_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    user_id INT,
    clan_id INT,
    team_name VARCHAR(100),
    seed_number INT,
    status ENUM('registered', 'confirmed', 'disqualified', 'eliminated', 'winner') DEFAULT 'registered',
    placement INT,
    prize_won DECIMAL(10,2) DEFAULT 0.00,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (clan_id) REFERENCES clans(id) ON DELETE CASCADE,
    INDEX idx_tournament_id (tournament_id),
    INDEX idx_user_id (user_id),
    INDEX idx_clan_id (clan_id),
    INDEX idx_status (status)
);

-- Tournament matches
CREATE TABLE matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    round_number INT NOT NULL,
    match_number INT NOT NULL,
    participant1_id INT,
    participant2_id INT,
    winner_id INT,
    status ENUM('pending', 'active', 'completed', 'disputed', 'cancelled') DEFAULT 'pending',
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    replay_file VARCHAR(255),
    score_p1 INT DEFAULT 0,
    score_p2 INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (participant1_id) REFERENCES tournament_participants(id) ON DELETE CASCADE,
    FOREIGN KEY (participant2_id) REFERENCES tournament_participants(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES tournament_participants(id) ON DELETE CASCADE,
    INDEX idx_tournament_id (tournament_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_at (scheduled_at)
);

-- ================================================
-- ADDITIONAL SCHEMA - Replays, Streamers, Rankings
-- ================================================

-- Replays
CREATE TABLE replays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    uploader_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT,
    thumbnail VARCHAR(255),
    game_version VARCHAR(50),
    map_name VARCHAR(100),
    players TEXT,
    duration INT,
    category ENUM('tournament', 'clan_war', 'ranked', 'casual', 'tutorial') DEFAULT 'casual',
    views INT DEFAULT 0,
    downloads INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_ratings INT DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_uploader_id (uploader_id),
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_rating (rating),
    INDEX idx_uploaded_at (uploaded_at)
);

-- Streamers
CREATE TABLE streamers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    channel_name VARCHAR(100) NOT NULL,
    platform ENUM('youtube', 'twitch', 'facebook') NOT NULL,
    channel_url VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    banner VARCHAR(255),
    description TEXT,
    subscriber_count INT DEFAULT 0,
    view_count BIGINT DEFAULT 0,
    video_count INT DEFAULT 0,
    last_video_date TIMESTAMP NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_platform (platform),
    INDEX idx_subscriber_count (subscriber_count),
    INDEX idx_is_verified (is_verified)
);

-- Rankings
CREATE TABLE rankings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    season VARCHAR(50) NOT NULL,
    rank_points INT DEFAULT 1000,
    tier ENUM('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster') DEFAULT 'Bronze',
    division INT DEFAULT 1,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    win_streak INT DEFAULT 0,
    best_win_streak INT DEFAULT 0,
    last_match_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_season (user_id, season),
    INDEX idx_user_id (user_id),
    INDEX idx_season (season),
    INDEX idx_rank_points (rank_points),
    INDEX idx_tier (tier)
);

-- ================================================
-- SAMPLE DATA INSERTION
-- ================================================

-- Insert admin and test users first
INSERT INTO users (username, email, password_hash, first_name, last_name, bio, country, avatar, role, level, xp, total_matches, wins, losses, win_rate, rank_points, is_verified) VALUES
('admin', 'admin@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System', 'Administrator', 'مدير النظام الرئيسي', 'Jordan', '/uploads/avatars/admin.jpg', 'admin', 100, 50000, 200, 180, 20, 90.00, 2500, 1);

-- Insert clan leaders and members
INSERT INTO users (username, email, password_hash, first_name, last_name, bio, country, avatar, role, level, xp, total_matches, wins, losses, win_rate, rank_points, is_verified) VALUES
('zh_master', 'master@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'أحمد', 'المحترف', 'قائد كلان الذئاب المحاربة منذ 2020', 'Egypt', '/uploads/avatars/zh_master.jpg', 'player', 85, 42000, 150, 135, 15, 90.00, 2200, 1),
('generals_pro', 'pro@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'محمد', 'البطل', 'قائد كلان أسياد الحرب', 'Saudi Arabia', '/uploads/avatars/generals_pro.jpg', 'player', 92, 47500, 180, 162, 18, 90.00, 2350, 1),
('tactical_gamer', 'tactical@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'علي', 'التكتيكي', 'ضابط في كلان الذئاب المحاربة', 'UAE', '/uploads/avatars/tactical_gamer.jpg', 'moderator', 78, 35000, 120, 96, 24, 80.00, 1950, 1),
('desert_storm', 'desert@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'خالد', 'العاصفة', 'قائد كلان عاصفة الصحراء', 'Morocco', '/uploads/avatars/desert_storm.jpg', 'player', 65, 28000, 100, 75, 25, 75.00, 1800, 1),
('zh_legend', 'legend@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'عمر', 'الأسطورة', 'قائد كلان فرسان الشرق', 'Iraq', '/uploads/avatars/zh_legend.jpg', 'player', 88, 44000, 160, 144, 16, 90.00, 2100, 1),
('air_commander', 'air@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'سامي', 'الطيار', 'ضابط في كلان عاصفة الصحراء', 'Lebanon', '/uploads/avatars/air_commander.jpg', 'player', 72, 31000, 110, 88, 22, 80.00, 1850, 1),
('tank_master', 'tank@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'يوسف', 'الدبابة', 'عضو في كلان الذئاب المحاربة', 'Palestine', '/uploads/avatars/tank_master.jpg', 'player', 69, 29500, 105, 84, 21, 80.00, 1750, 1),
('shadow_warrior', 'shadow@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'أمين', 'المحارب', 'قائد كلان النسور الذهبية', 'Algeria', '/uploads/avatars/shadow_warrior.jpg', 'player', 75, 32000, 95, 76, 19, 80.00, 1900, 1),
('fire_eagle', 'fire@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'حسام', 'النسر', 'قائد كلان جنود البرق (غير موافق عليه)', 'Tunisia', '/uploads/avatars/fire_eagle.jpg', 'player', 62, 26000, 80, 56, 24, 70.00, 1650, 1),
('storm_rider', 'storm@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'نادر', 'العاصفة', 'قائد كلان أشباح الليل (غير موافق عليه)', 'Syria', '/uploads/avatars/storm_rider.jpg', 'player', 58, 23000, 70, 49, 21, 70.00, 1550, 1);

-- Insert approved clans
INSERT INTO clans (name, tag, description, logo, owner_id, total_members, total_points, level, is_recruiting, is_approved) VALUES
('الذئاب المحاربة', 'WAR', 'كلان محترف متخصص في المعارك الاستراتيجية والبطولات الكبرى', '/uploads/clans/war-wolves.jpg', 2, 3, 15420, 8, 1, 1),
('أسياد الحرب', 'LORDS', 'كلان النخبة للاعبين المحترفين فقط', '/uploads/clans/war-lords.jpg', 3, 1, 12800, 7, 0, 1),
('عاصفة الصحراء', 'STORM', 'كلان سريع ومتميز في المعارك السريعة', '/uploads/clans/desert-storm.jpg', 5, 2, 11200, 6, 1, 1),
('فرسان الشرق', 'EAST', 'كلان تقليدي يركز على الشرف والروح الرياضية', '/uploads/clans/eastern-knights.jpg', 6, 1, 13500, 5, 1, 1),
('النسور الذهبية', 'GOLD', 'كلان جديد طموح يسعى للوصول للقمة', '/uploads/clans/golden-eagles.jpg', 8, 1, 8900, 4, 1, 1);

-- Insert non-approved clans
INSERT INTO clans (name, tag, description, logo, owner_id, total_members, total_points, level, is_recruiting, is_approved) VALUES
('جنود البرق', 'LIGHT', 'كلان جديد يبحث عن الموافقة', '/uploads/clans/lightning-soldiers.jpg', 9, 1, 2500, 1, 1, 0),
('أشباح الليل', 'GHOST', 'كلان متخصص في التكتيكات الليلية', '/uploads/clans/night-ghosts.jpg', 10, 1, 1800, 1, 1, 0);

-- Insert clan members
INSERT INTO clan_members (clan_id, user_id, role, contribution_points) VALUES
-- War Wolves members
(1, 2, 'leader', 5000),
(1, 4, 'officer', 3500),
(1, 8, 'member', 2800),
-- War Lords members
(2, 3, 'leader', 4800),
-- Desert Storm members
(3, 5, 'leader', 3200),
(3, 7, 'officer', 2900),
-- Eastern Knights members
(4, 6, 'leader', 3800),
-- Golden Eagles members
(5, 8, 'leader', 2100),
-- Non-approved clans
(6, 9, 'leader', 500),
(7, 10, 'leader', 300);

-- Insert clan applications (pending and processed)
INSERT INTO clan_applications (clan_name, clan_tag, description, organizer_id, organizer_name, organizer_email, organizer_country, organizer_experience, region, language, membership_type, min_level, min_win_rate, max_members, status, reviewed_by, reviewed_at) VALUES
-- Approved applications
('الذئاب المحاربة', 'WAR', 'كلان محترف متخصص في المعارك الاستراتيجية', 2, 'أحمد المحترف', 'master@zh-love.com', 'Egypt', 'expert', 'middle-east', 'ar', 'application', 50, 75, 30, 'approved', 1, '2024-01-15 10:00:00'),
('أسياد الحرب', 'LORDS', 'كلان النخبة للاعبين المحترفين فقط', 3, 'محمد البطل', 'pro@zh-love.com', 'Saudi Arabia', 'expert', 'gulf', 'ar', 'invite-only', 60, 80, 25, 'approved', 1, '2024-01-10 14:00:00'),
-- Pending applications
('محاربو الصحراء', 'DESERT2', 'كلان جديد يركز على استراتيجيات الصحراء', 9, 'حسام النسر', 'fire@zh-love.com', 'Tunisia', 'advanced', 'north-africa', 'ar', 'application', 40, 65, 35, 'pending', NULL, NULL),
('فرسان الظلام', 'DARK', 'كلان متخصص في التكتيكات الليلية', 10, 'نادر العاصفة', 'storm@zh-love.com', 'Syria', 'intermediate', 'levant', 'ar', 'application', 35, 60, 40, 'pending', NULL, NULL);

-- Insert clan join applications
INSERT INTO clan_join_applications (clan_id, user_id, player_name, player_level, win_rate, motivation, status) VALUES
(1, 9, 'حسام النسر', 62, 70.00, 'أريد الانضمام لكلان محترف لتطوير مهاراتي', 'pending'),
(1, 10, 'نادر العاصفة', 58, 70.00, 'لدي خبرة جيدة في التكتيكات المتقدمة', 'pending'),
(2, 7, 'سامي الطيار', 72, 80.00, 'متخصص في القوات الجوية وأريد الانضمام للنخبة', 'approved'),
(3, 8, 'يوسف الدبابة', 69, 80.00, 'خبير في وحدات المدرعات', 'rejected');

-- Insert clan wars
INSERT INTO clan_wars (challenger_clan_id, challenged_clan_id, scheduled_at, duration, rules, challenge_message, status, created_by, challenger_score, challenged_score, winner_id, completed_at) VALUES
-- Completed wars
(1, 5, '2024-02-01 20:00:00', 48, 'حرب عادية بدون قيود خاصة', 'تحدي ودي للتدريب', 'completed', 2, 15, 8, 1, '2024-02-03 22:00:00'),
(4, 3, '2024-02-05 19:00:00', 72, 'حرب صحراوية فقط', 'معركة الشرف والكرامة', 'completed', 6, 12, 18, 3, '2024-02-08 21:00:00'),
-- Active/Pending wars
(3, 1, '2024-02-25 20:00:00', 48, 'حرب كاملة بجميع الوحدات', 'تحدي من عاصفة الصحراء للذئاب المحاربة', 'pending', 5),
(2, 1, '2024-02-28 19:00:00', 72, 'حرب نخبة للمحترفين فقط', 'معركة الأساطير', 'pending', 3);

-- Insert forum categories
INSERT INTO forum_categories (name, description, icon, color, post_count, sort_order) VALUES
('الإعلانات العامة', 'إعلانات الموقع والأخبار المهمة', 'megaphone', '#EF4444', 5, 1),
('النقاش العام', 'مناقشات عامة حول اللعبة والمجتمع', 'message-circle', '#10B981', 12, 2),
('الاستراتيجيات والتكتيكات', 'مشاركة الاستراتيجيات والخطط التكتيكية', 'target', '#F59E0B', 8, 3),
('البطولات والمسابقات', 'تنظيم ومتابعة البطولات والمسابقات', 'trophy', '#8B5CF6', 6, 4),
('الكلانات والفرق', 'مناقشات الكلانات والبحث عن أعضاء', 'users', '#06B6D4', 4, 5),
('الدعم الفني', 'المساعدة في المشاكل التقنية والاستفسارات', 'help-circle', '#84CC16', 7, 6);

-- Insert forum posts
INSERT INTO forum_posts (category_id, user_id, title, content, views, replies_count, likes_count, is_pinned) VALUES
(1, 1, 'مرحباً بكم في منتدى ZH-Love', 'أهلاً وسهلاً بجميع اللاعبين في منتدى مجتمع ZH-Love. هنا ستجدون كل ما تحتاجونه من نقاشات واستراتيجيات وبطولات.', 245, 12, 25, 1),
(1, 1, 'قوانين المنتدى والمجتمع', 'يرجى قراءة قوانين المنتدى والالتزام بها لضمان بيئة صحية ومناسبة للجميع.', 189, 8, 18, 1),
(2, 3, 'أفضل الاستراتيجيات للمبتدئين', 'دليل شامل للاعبين الجدد في لعبة الجنرالات زيرو ساعة', 156, 15, 22, 0),
(2, 2, 'تحليل آخر تحديثات اللعبة', 'مناقشة التحديثات الأخيرة وتأثيرها على اللعب', 134, 9, 16, 0),
(3, 4, 'دليل الجنرال الصيني: استراتيجيات متقدمة', 'شرح مفصل لاستراتيجيات الجنرال الصيني في مختلف المواقف', 298, 24, 45, 0),
(3, 5, 'كيفية التعامل مع الهجمات الجوية', 'نصائح وحيل للدفاع ضد الهجمات الجوية المكثفة', 187, 18, 31, 0),
(4, 1, 'بطولة الجنرالات الكبرى 2024 - التسجيل مفتوح', 'انضموا للبطولة الأكبر هذا العام مع جوائز مالية قيمة', 445, 67, 89, 1),
(4, 6, 'نتائج بطولة الكلانات الشهرية', 'تهانينا للفائزين في بطولة الكلانات لهذا الشهر', 123, 12, 28, 0),
(5, 2, 'كلان الذئاب المحاربة يبحث عن أعضاء جدد', 'انضم لكلان محترف مع لاعبين ذوي خبرة عالية', 178, 22, 19, 0),
(5, 7, 'تشكيل فريق جديد للبطولات', 'أبحث عن لاعبين محترفين لتشكيل فريق قوي للبطولات القادمة', 156, 14, 12, 0),
(6, 8, 'مشكلة في الاتصال بالخوادم', 'هل يواجه أحد مشاكل في الاتصال بخوادم اللعبة؟', 234, 31, 8, 0),
(6, 4, 'دليل تثبيت التعديلات والخرائط', 'شرح تفصيلي لكيفية تثبيت التعديلات والخرائط الجديدة', 289, 19, 35, 0);

-- Insert forum replies
INSERT INTO forum_replies (post_id, user_id, content, likes_count) VALUES
(1, 2, 'شكراً للإدارة على هذا المنتدى الرائع!', 8),
(1, 3, 'أتطلع لمناقشات رائعة مع الجميع', 5),
(3, 4, 'دليل ممتاز للمبتدئين، شكراً لك!', 12),
(3, 5, 'هل يمكنك إضافة المزيد حول الاقتصاد؟', 6),
(5, 6, 'استراتيجية رائعة، جربتها وحققت نتائج ممتازة', 15),
(5, 7, 'هل تنصح بها للاعبين المتوسطين؟', 4),
(7, 8, 'متى سيتم الإعلان عن مواعيد المباريات؟', 9),
(7, 2, 'هل هناك بث مباشر للمباريات؟', 11),
(9, 3, 'كلان محترم ولاعبين مميزين', 7),
(9, 4, 'كيف يمكنني التقديم للانضمام؟', 3),
(11, 5, 'نفس المشكلة هنا، أعتقد أنها من الخوادم', 6),
(11, 6, 'تم حل المشكلة عندي بعد إعادة تشغيل الراوتر', 8),
(12, 7, 'شرح واضح ومفيد جداً', 14),
(12, 8, 'هل هناك طريقة لتثبيت عدة تعديلات معاً؟', 5);

-- Insert tournaments
INSERT INTO tournaments (name, description, image, type, format, max_participants, current_participants, prize_pool, entry_fee, status, start_date, end_date, registration_deadline, organizer_id) VALUES
('بطولة الجنرالات الكبرى 2024', 'البطولة الأكبر والأهم في المجتمع العربي للجنرالات زيرو ساعة', '/uploads/tournaments/grand-championship.jpg', 'single_elimination', '1v1', 64, 45, 1000.00, 10.00, 'registration_open', '2024-03-01 18:00:00', '2024-03-15 22:00:00', '2024-02-28 23:59:59', 1),
('تحدي الكلانات الأسبوعي', 'مسابقة أسبوعية بين الكلانات لتحديد الأقوى', '/uploads/tournaments/weekly-clan-battle.jpg', 'round_robin', 'clan_war', 16, 12, 250.00, 0.00, 'active', '2024-02-20 19:00:00', '2024-02-27 21:00:00', '2024-02-19 23:59:59', 1),
('كأس الشرق الأوسط', 'بطولة إقليمية للاعبين من منطقة الشرق الأوسط', '/uploads/tournaments/middle-east-cup.jpg', 'double_elimination', '1v1', 32, 28, 500.00, 5.00, 'registration_closed', '2024-02-15 20:00:00', '2024-02-29 22:00:00', '2024-02-14 23:59:59', 1),
('بطولة المبتدئين الشهرية', 'بطولة خاصة للاعبين الجدد والمبتدئين', '/uploads/tournaments/beginners-monthly.jpg', 'single_elimination', '1v1', 32, 30, 100.00, 0.00, 'registration_closed', '2024-02-10 18:00:00', '2024-02-17 20:00:00', '2024-02-09 23:59:59', 4),
('تحدي الـ 2v2 الكبير', 'مسابقة الفرق الثنائية مع أقوى اللاعبين', '/uploads/tournaments/2v2-challenge.jpg', 'single_elimination', '2v2', 24, 18, 300.00, 15.00, 'upcoming', '2024-03-10 19:00:00', '2024-03-17 21:00:00', '2024-03-08 23:59:59', 1);

-- Insert streamers
INSERT INTO streamers (user_id, channel_name, platform, channel_url, avatar, banner, description, subscriber_count, view_count, video_count, last_video_date, is_verified) VALUES
(2, 'ZH Master Gaming', 'youtube', 'https://youtube.com/c/ZHMasterGaming', '/uploads/streamers/zh-master-avatar.jpg', '/uploads/streamers/zh-master-banner.jpg', 'قناة متخصصة في لعبة الجنرالات زيرو ساعة مع دروس واستراتيجيات متقدمة', 15420, 2450000, 234, '2024-02-18 14:30:00', 1),
(3, 'Generals Pro Channel', 'youtube', 'https://youtube.com/c/GeneralsProChannel', '/uploads/streamers/generals-pro-avatar.jpg', '/uploads/streamers/generals-pro-banner.jpg', 'تحليلات احترافية ومباريات مثيرة في عالم الجنرالات', 12800, 1890000, 189, '2024-02-17 20:15:00', 1),
(4, 'Tactical Gaming Hub', 'youtube', 'https://youtube.com/c/TacticalGamingHub', '/uploads/streamers/tactical-hub-avatar.jpg', '/uploads/streamers/tactical-hub-banner.jpg', 'استراتيجيات وتكتيكات متقدمة للاعبين الجادين', 8950, 1230000, 156, '2024-02-16 18:45:00', 1),
(6, 'ZH Legend Streams', 'twitch', 'https://twitch.tv/zhlegendstreams', '/uploads/streamers/zh-legend-avatar.jpg', '/uploads/streamers/zh-legend-banner.jpg', 'بث مباشر لأفضل المباريات والتحديات', 5670, 890000, 78, '2024-02-15 22:00:00', 0),
(7, 'Air Force Gaming', 'youtube', 'https://youtube.com/c/AirForceGaming', '/uploads/streamers/air-force-avatar.jpg', '/uploads/streamers/air-force-banner.jpg', 'متخصص في استراتيجيات القوات الجوية والهجمات الجوية', 7240, 1120000, 145, '2024-02-17 16:30:00', 1);

-- Insert rankings
INSERT INTO rankings (user_id, season, rank_points, tier, division, wins, losses, win_streak, best_win_streak, last_match_date) VALUES
(2, '2024-S1', 2200, 'Diamond', 3, 135, 15, 8, 15, '2024-02-18 21:30:00'),
(3, '2024-S1', 2350, 'Master', 1, 162, 18, 12, 18, '2024-02-18 19:45:00'),
(4, '2024-S1', 1950, 'Platinum', 2, 96, 24, 5, 9, '2024-02-17 20:15:00'),
(5, '2024-S1', 1800, 'Gold', 1, 75, 25, 3, 7, '2024-02-16 18:30:00'),
(6, '2024-S1', 2100, 'Diamond', 1, 144, 16, 6, 12, '2024-02-18 22:00:00'),
(7, '2024-S1', 1850, 'Platinum', 3, 88, 22, 4, 8, '2024-02-17 19:20:00'),
(8, '2024-S1', 1750, 'Gold', 3, 84, 21, 2, 6, '2024-02-16 17:45:00'),
(9, '2024-S1', 1650, 'Gold', 1, 56, 24, 2, 5, '2024-02-15 19:00:00'),
(10, '2024-S1', 1550, 'Silver', 3, 49, 21, 1, 4, '2024-02-14 20:30:00');

-- ================================================
-- INDEXES AND OPTIMIZATIONS
-- ================================================

-- Additional indexes for better performance
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_clans_active ON clans(is_active);
CREATE INDEX idx_forum_posts_category_date ON forum_posts(category_id, created_at DESC);
CREATE INDEX idx_forum_replies_post_date ON forum_replies(post_id, created_at DESC);
CREATE INDEX idx_tournaments_status_date ON tournaments(status, start_date);
CREATE INDEX idx_matches_tournament_status ON matches(tournament_id, status);
CREATE INDEX idx_streamers_platform_subscribers ON streamers(platform, subscriber_count DESC);
CREATE INDEX idx_rankings_season_points ON rankings(season, rank_points DESC);

-- Update last_post_id in forum_categories
UPDATE forum_categories SET last_post_id = (
    SELECT MAX(id) FROM forum_posts WHERE category_id = forum_categories.id
);

-- Update replies_count in forum_posts
UPDATE forum_posts SET replies_count = (
    SELECT COUNT(*) FROM forum_replies WHERE post_id = forum_posts.id
);

-- ================================================
-- SETUP COMPLETE
-- ================================================

SELECT 'Database setup completed successfully!' as message;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_clans FROM clans;
SELECT COUNT(*) as total_approved_clans FROM clans WHERE is_approved = 1;
SELECT COUNT(*) as total_pending_clans FROM clans WHERE is_approved = 0;
SELECT COUNT(*) as total_clan_applications FROM clan_applications;
SELECT COUNT(*) as total_wars FROM clan_wars;
SELECT COUNT(*) as total_tournaments FROM tournaments;
SELECT COUNT(*) as total_posts FROM forum_posts;
SELECT COUNT(*) as total_streamers FROM streamers; 