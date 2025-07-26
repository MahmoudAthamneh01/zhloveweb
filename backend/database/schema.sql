-- ZH-Love Gaming Community Database Schema
-- Created: 2024
-- Description: Complete database schema for gaming community platform

SET foreign_key_checks = 0;
DROP DATABASE IF EXISTS zh_love_db;
CREATE DATABASE zh_love_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE zh_love_db;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(500),
    bio TEXT,
    country VARCHAR(100),
    rank_points INT DEFAULT 0,
    level INT DEFAULT 1,
    experience_points INT DEFAULT 0,
    total_matches INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    role ENUM('user', 'moderator', 'admin') DEFAULT 'user',
    status ENUM('active', 'banned', 'suspended') DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_rank_points (rank_points),
    INDEX idx_level (level),
    INDEX idx_role (role),
    INDEX idx_status (status)
);

-- Clans table
CREATE TABLE clans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    tag VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    banner_url VARCHAR(500),
    leader_id INT NOT NULL,
    founded_date DATE,
    total_members INT DEFAULT 0,
    clan_points INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    status ENUM('active', 'disbanded', 'suspended') DEFAULT 'active',
    recruitment_open BOOLEAN DEFAULT TRUE,
    website VARCHAR(255),
    discord_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_name (name),
    INDEX idx_tag (tag),
    INDEX idx_clan_points (clan_points),
    INDEX idx_status (status)
);

-- Clan members table
CREATE TABLE clan_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clan_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('leader', 'officer', 'member') DEFAULT 'member',
    joined_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    contribution_points INT DEFAULT 0,
    status ENUM('active', 'inactive', 'kicked') DEFAULT 'active',
    
    FOREIGN KEY (clan_id) REFERENCES clans(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_clan_member (clan_id, user_id),
    INDEX idx_clan_id (clan_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role (role)
);

-- Tournaments table
CREATE TABLE tournaments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    banner_url VARCHAR(500),
    tournament_type ENUM('single_elimination', 'double_elimination', 'round_robin', 'swiss') DEFAULT 'single_elimination',
    game_mode VARCHAR(100),
    max_participants INT DEFAULT 64,
    current_participants INT DEFAULT 0,
    entry_fee DECIMAL(10,2) DEFAULT 0.00,
    prize_pool DECIMAL(12,2) DEFAULT 0.00,
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    registration_deadline DATETIME,
    status ENUM('upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled') DEFAULT 'upcoming',
    organizer_id INT NOT NULL,
    rules TEXT,
    requirements TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    INDEX idx_tournament_type (tournament_type)
);

-- Tournament participants table
CREATE TABLE tournament_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    user_id INT,
    clan_id INT,
    participant_type ENUM('individual', 'clan') NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    seed_number INT,
    status ENUM('registered', 'confirmed', 'eliminated', 'withdrawn') DEFAULT 'registered',
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (clan_id) REFERENCES clans(id) ON DELETE CASCADE,
    INDEX idx_tournament_id (tournament_id),
    INDEX idx_user_id (user_id),
    INDEX idx_clan_id (clan_id)
);

-- Matches table
CREATE TABLE matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT,
    round_number INT,
    match_number INT,
    player1_id INT,
    player2_id INT,
    clan1_id INT,
    clan2_id INT,
    match_type ENUM('individual', 'clan') NOT NULL,
    winner_id INT,
    winner_clan_id INT,
    score_player1 INT DEFAULT 0,
    score_player2 INT DEFAULT 0,
    match_date DATETIME,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    replay_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (clan1_id) REFERENCES clans(id) ON DELETE SET NULL,
    FOREIGN KEY (clan2_id) REFERENCES clans(id) ON DELETE SET NULL,
    FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (winner_clan_id) REFERENCES clans(id) ON DELETE SET NULL,
    INDEX idx_tournament_id (tournament_id),
    INDEX idx_status (status),
    INDEX idx_match_date (match_date)
);

-- Forum categories table
CREATE TABLE forum_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(7),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_sort_order (sort_order),
    INDEX idx_is_active (is_active)
);

-- Forum posts table
CREATE TABLE forum_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INT NOT NULL,
    category_id INT NOT NULL,
    post_type ENUM('discussion', 'question', 'announcement', 'poll') DEFAULT 'discussion',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    reply_count INT DEFAULT 0,
    last_reply_at TIMESTAMP NULL,
    last_reply_by INT NULL,
    status ENUM('active', 'hidden', 'deleted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (last_reply_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category_id (category_id),
    INDEX idx_author_id (author_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_pinned (is_pinned),
    INDEX idx_status (status)
);

-- Forum replies table
CREATE TABLE forum_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    author_id INT NOT NULL,
    content TEXT NOT NULL,
    parent_reply_id INT NULL,
    status ENUM('active', 'hidden', 'deleted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_reply_id) REFERENCES forum_replies(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_author_id (author_id),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status)
);

-- Replays table
CREATE TABLE replays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    uploader_id INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    thumbnail_url VARCHAR(500),
    game_mode VARCHAR(100),
    map_name VARCHAR(100),
    duration INT,
    players TEXT,
    tags VARCHAR(500),
    download_count INT DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    status ENUM('active', 'pending', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_uploader_id (uploader_id),
    INDEX idx_game_mode (game_mode),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Streamers table
CREATE TABLE streamers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    platform ENUM('youtube', 'twitch', 'facebook') NOT NULL,
    channel_id VARCHAR(255) NOT NULL,
    channel_name VARCHAR(255) NOT NULL,
    channel_url VARCHAR(500) NOT NULL,
    avatar_url VARCHAR(500),
    banner_url VARCHAR(500),
    subscriber_count INT DEFAULT 0,
    video_count INT DEFAULT 0,
    view_count BIGINT DEFAULT 0,
    description TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_sync TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_channel (platform, channel_id),
    INDEX idx_user_id (user_id),
    INDEX idx_platform (platform),
    INDEX idx_is_verified (is_verified),
    INDEX idx_is_active (is_active)
);

-- User sessions table
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- Rankings table
CREATE TABLE rankings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    season VARCHAR(50) NOT NULL,
    rank_tier ENUM('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster') NOT NULL,
    rank_points INT NOT NULL DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    winrate DECIMAL(5,2) DEFAULT 0.00,
    peak_rank_points INT DEFAULT 0,
    last_match_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_season (user_id, season),
    INDEX idx_season (season),
    INDEX idx_rank_points (rank_points),
    INDEX idx_rank_tier (rank_tier)
);

SET foreign_key_checks = 1; 