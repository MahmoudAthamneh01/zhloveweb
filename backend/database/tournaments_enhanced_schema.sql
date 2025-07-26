-- Enhanced Tournament System Database Schema
-- ZH-Love Gaming Community Platform

-- Create tournaments table with enhanced features
CREATE TABLE tournaments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rules TEXT,
    requirements TEXT,
    format ENUM('single_elimination', 'double_elimination', 'round_robin', 'swiss') DEFAULT 'single_elimination',
    max_participants INT DEFAULT 16,
    current_participants INT DEFAULT 0,
    prize_pool DECIMAL(10,2) DEFAULT 0.00,
    entry_fee DECIMAL(10,2) DEFAULT 0.00,
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    registration_deadline DATETIME NOT NULL,
    status ENUM('draft', 'pending_approval', 'open', 'live', 'paused', 'completed', 'cancelled') DEFAULT 'draft',
    game_mode ENUM('classic', 'tournament', 'ranked', 'custom') DEFAULT 'classic',
    region ENUM('global', 'mena', 'europe', 'asia', 'americas') DEFAULT 'global',
    
    -- Organizer and management
    organizer_id INT NOT NULL,
    co_organizers JSON, -- Array of user IDs who can manage the tournament
    
    -- Tournament settings
    is_private BOOLEAN DEFAULT FALSE,
    require_approval BOOLEAN DEFAULT TRUE,
    allow_spectators BOOLEAN DEFAULT TRUE,
    auto_start BOOLEAN DEFAULT FALSE,
    
    -- Ranking restrictions
    min_rank VARCHAR(20),
    max_rank VARCHAR(20),
    
    -- Media and branding
    image_url VARCHAR(500),
    banner_url VARCHAR(500),
    
    -- Maps and game settings
    allowed_maps JSON, -- Array of allowed map names
    
    -- Contact information
    contact_info JSON, -- Discord, Telegram, email, etc.
    
    -- Streaming and broadcast
    stream_url VARCHAR(500),
    broadcast_channels JSON, -- Array of streaming platforms
    
    -- Sponsors and partners
    sponsors JSON, -- Array of sponsor information
    
    -- Prize distribution
    prize_distribution JSON, -- Custom prize distribution
    
    -- Statistics
    views INT DEFAULT 0,
    popularity_score INT DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    approved_by INT NULL,
    
    -- Constraints
    INDEX idx_organizer (organizer_id),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    INDEX idx_region (region),
    INDEX idx_format (format),
    
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Enhanced tournament participants table
CREATE TABLE tournament_participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_id INT NOT NULL,
    user_id INT NOT NULL,
    team_name VARCHAR(100), -- For team tournaments
    seed INT, -- Tournament seeding position
    status ENUM('registered', 'approved', 'rejected', 'checked_in', 'eliminated', 'withdrawn') DEFAULT 'registered',
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_in_date TIMESTAMP NULL,
    notes TEXT, -- Admin notes about the participant
    
    -- Team information (for team tournaments)
    team_members JSON, -- Array of team member user IDs
    captain_id INT, -- Team captain user ID
    
    -- Statistics
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    points INT DEFAULT 0,
    
    -- Constraints
    UNIQUE KEY unique_tournament_participant (tournament_id, user_id),
    INDEX idx_tournament_status (tournament_id, status),
    INDEX idx_user_tournaments (user_id),
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (captain_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Enhanced tournament matches table
CREATE TABLE tournament_matches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_id INT NOT NULL,
    round INT NOT NULL,
    match_number INT NOT NULL,
    
    -- Participants
    participant1_id INT,
    participant2_id INT,
    winner_id INT,
    
    -- Match details
    status ENUM('scheduled', 'ready', 'live', 'completed', 'disputed', 'walkover', 'cancelled') DEFAULT 'scheduled',
    scheduled_time DATETIME,
    started_time DATETIME,
    completed_time DATETIME,
    
    -- Results
    score1 INT DEFAULT 0,
    score2 INT DEFAULT 0,
    game_results JSON, -- Detailed game-by-game results
    
    -- Match settings
    best_of INT DEFAULT 1, -- Best of X games
    map_pool JSON, -- Maps for this match
    
    -- Media and streaming
    stream_url VARCHAR(500),
    replay_files JSON, -- Array of replay file URLs
    
    -- Administrative
    referee_id INT, -- Assigned referee
    admin_notes TEXT,
    dispute_reason TEXT,
    
    -- Bracket positioning
    next_match_id INT, -- Where the winner advances
    previous_match1_id INT, -- First source match
    previous_match2_id INT, -- Second source match
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    INDEX idx_tournament_round (tournament_id, round),
    INDEX idx_match_status (status),
    INDEX idx_scheduled_time (scheduled_time),
    INDEX idx_participants (participant1_id, participant2_id),
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (participant1_id) REFERENCES tournament_participants(id) ON DELETE SET NULL,
    FOREIGN KEY (participant2_id) REFERENCES tournament_participants(id) ON DELETE SET NULL,
    FOREIGN KEY (winner_id) REFERENCES tournament_participants(id) ON DELETE SET NULL,
    FOREIGN KEY (referee_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (next_match_id) REFERENCES tournament_matches(id) ON DELETE SET NULL,
    FOREIGN KEY (previous_match1_id) REFERENCES tournament_matches(id) ON DELETE SET NULL,
    FOREIGN KEY (previous_match2_id) REFERENCES tournament_matches(id) ON DELETE SET NULL
);

-- Tournament updates and announcements
CREATE TABLE tournament_updates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_id INT NOT NULL,
    author_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('general', 'schedule', 'rules', 'results', 'important') DEFAULT 'general',
    is_pinned BOOLEAN DEFAULT FALSE,
    notify_participants BOOLEAN DEFAULT TRUE,
    
    -- Visibility settings
    visibility ENUM('public', 'participants', 'organizers') DEFAULT 'public',
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    INDEX idx_tournament_updates (tournament_id, created_at DESC),
    INDEX idx_author (author_id),
    INDEX idx_type (type),
    INDEX idx_pinned (is_pinned),
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tournament update read status
CREATE TABLE tournament_update_reads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    update_id INT NOT NULL,
    user_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE KEY unique_update_read (update_id, user_id),
    INDEX idx_user_reads (user_id),
    
    FOREIGN KEY (update_id) REFERENCES tournament_updates(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tournament brackets (for complex bracket structures)
CREATE TABLE tournament_brackets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_id INT NOT NULL,
    bracket_type ENUM('main', 'losers', 'consolation') DEFAULT 'main',
    structure JSON, -- Complete bracket structure
    
    -- Constraints
    INDEX idx_tournament_bracket (tournament_id, bracket_type),
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

-- Tournament notifications integration
CREATE TABLE tournament_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_id INT NOT NULL,
    user_id INT NOT NULL,
    type ENUM('tournament_update', 'match_scheduled', 'match_reminder', 'result_posted', 'status_change') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    metadata JSON, -- Additional context data
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    -- Constraints
    INDEX idx_user_notifications (user_id, is_read, created_at DESC),
    INDEX idx_tournament_notifications (tournament_id, type),
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tournament staff and roles
CREATE TABLE tournament_staff (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('co_organizer', 'referee', 'moderator', 'commentator', 'admin') NOT NULL,
    permissions JSON, -- Specific permissions for this role
    appointed_by INT NOT NULL,
    appointed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE KEY unique_tournament_staff (tournament_id, user_id, role),
    INDEX idx_tournament_staff (tournament_id, role),
    INDEX idx_user_staff (user_id),
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointed_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Tournament statistics and analytics
CREATE TABLE tournament_statistics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_id INT NOT NULL,
    date DATE NOT NULL,
    
    -- Engagement metrics
    views INT DEFAULT 0,
    unique_visitors INT DEFAULT 0,
    registrations INT DEFAULT 0,
    check_ins INT DEFAULT 0,
    
    -- Match metrics
    matches_played INT DEFAULT 0,
    matches_completed INT DEFAULT 0,
    average_match_duration INT DEFAULT 0, -- in minutes
    
    -- Streaming metrics
    peak_viewers INT DEFAULT 0,
    total_watch_time INT DEFAULT 0, -- in minutes
    
    -- Constraints
    UNIQUE KEY unique_tournament_date (tournament_id, date),
    INDEX idx_tournament_stats (tournament_id, date),
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

-- Tournament archives for completed tournaments
CREATE TABLE tournament_archives (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_id INT NOT NULL,
    archive_data JSON, -- Complete tournament data snapshot
    final_results JSON, -- Final standings and results
    statistics JSON, -- Tournament statistics
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE KEY unique_tournament_archive (tournament_id),
    INDEX idx_archived_at (archived_at),
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

-- Views for common queries
CREATE VIEW tournament_summary AS
SELECT 
    t.id,
    t.name,
    t.description,
    t.format,
    t.max_participants,
    t.current_participants,
    t.prize_pool,
    t.start_date,
    t.status,
    t.region,
    t.game_mode,
    t.image_url,
    u.username AS organizer_name,
    u.avatar AS organizer_avatar,
    COUNT(DISTINCT tp.id) AS registered_participants,
    COUNT(DISTINCT tm.id) AS total_matches,
    SUM(CASE WHEN tm.status = 'completed' THEN 1 ELSE 0 END) AS completed_matches
FROM tournaments t
LEFT JOIN users u ON t.organizer_id = u.id
LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id AND tp.status IN ('approved', 'checked_in')
LEFT JOIN tournament_matches tm ON t.id = tm.tournament_id
GROUP BY t.id, u.username, u.avatar;

-- View for live tournaments
CREATE VIEW live_tournaments AS
SELECT 
    t.*,
    u.username AS organizer_name,
    COUNT(DISTINCT tp.id) AS participants_count,
    COUNT(DISTINCT tm.id) FILTER (WHERE tm.status = 'live') AS live_matches_count
FROM tournaments t
LEFT JOIN users u ON t.organizer_id = u.id
LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id AND tp.status = 'checked_in'
LEFT JOIN tournament_matches tm ON t.id = tm.tournament_id
WHERE t.status = 'live'
GROUP BY t.id, u.username;

-- Indexes for performance optimization
CREATE INDEX idx_tournaments_composite ON tournaments(status, start_date, region, format);
CREATE INDEX idx_participants_composite ON tournament_participants(tournament_id, status, registration_date);
CREATE INDEX idx_matches_composite ON tournament_matches(tournament_id, round, status, scheduled_time);
CREATE INDEX idx_updates_composite ON tournament_updates(tournament_id, type, created_at DESC);
CREATE INDEX idx_notifications_composite ON tournament_notifications(user_id, is_read, created_at DESC);

-- Stored procedures for common operations
DELIMITER //

CREATE PROCEDURE CreateTournament(
    IN p_name VARCHAR(255),
    IN p_description TEXT,
    IN p_organizer_id INT,
    IN p_format VARCHAR(20),
    IN p_max_participants INT,
    IN p_start_date DATETIME,
    IN p_registration_deadline DATETIME,
    IN p_prize_pool DECIMAL(10,2),
    IN p_settings JSON
)
BEGIN
    DECLARE tournament_id INT;
    
    INSERT INTO tournaments (
        name, description, organizer_id, format, max_participants,
        start_date, registration_deadline, prize_pool, status
    ) VALUES (
        p_name, p_description, p_organizer_id, p_format, p_max_participants,
        p_start_date, p_registration_deadline, p_prize_pool, 'draft'
    );
    
    SET tournament_id = LAST_INSERT_ID();
    
    -- Add organizer as tournament staff
    INSERT INTO tournament_staff (tournament_id, user_id, role, appointed_by)
    VALUES (tournament_id, p_organizer_id, 'co_organizer', p_organizer_id);
    
    SELECT tournament_id AS id;
END //

CREATE PROCEDURE RegisterParticipant(
    IN p_tournament_id INT,
    IN p_user_id INT
)
BEGIN
    DECLARE participant_count INT;
    DECLARE max_participants INT;
    DECLARE tournament_status VARCHAR(20);
    
    -- Check tournament status and capacity
    SELECT status, max_participants, current_participants 
    INTO tournament_status, max_participants, participant_count
    FROM tournaments 
    WHERE id = p_tournament_id;
    
    IF tournament_status != 'open' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tournament is not open for registration';
    END IF;
    
    IF participant_count >= max_participants THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tournament is full';
    END IF;
    
    -- Register participant
    INSERT INTO tournament_participants (tournament_id, user_id, status)
    VALUES (p_tournament_id, p_user_id, 'registered');
    
    -- Update participant count
    UPDATE tournaments 
    SET current_participants = current_participants + 1
    WHERE id = p_tournament_id;
    
    -- Create notification
    INSERT INTO tournament_notifications (tournament_id, user_id, type, title, message)
    VALUES (p_tournament_id, p_user_id, 'status_change', 'Registration Successful', 
            'You have successfully registered for the tournament');
    
END //

CREATE PROCEDURE GenerateBracket(
    IN p_tournament_id INT
)
BEGIN
    DECLARE participant_count INT;
    DECLARE tournament_format VARCHAR(20);
    DECLARE rounds_needed INT;
    
    -- Get tournament info
    SELECT current_participants, format
    INTO participant_count, tournament_format
    FROM tournaments 
    WHERE id = p_tournament_id;
    
    -- Calculate rounds needed
    SET rounds_needed = CEIL(LOG2(participant_count));
    
    -- Generate first round matches
    INSERT INTO tournament_matches (tournament_id, round, match_number, participant1_id, participant2_id)
    SELECT 
        p_tournament_id,
        1,
        ROW_NUMBER() OVER (ORDER BY tp.seed, tp.registration_date),
        tp1.id,
        tp2.id
    FROM tournament_participants tp1
    JOIN tournament_participants tp2 ON tp1.tournament_id = tp2.tournament_id
    WHERE tp1.tournament_id = p_tournament_id
    AND tp1.status = 'approved'
    AND tp2.status = 'approved'
    AND tp1.id < tp2.id;
    
    -- Update tournament status
    UPDATE tournaments 
    SET status = 'live' 
    WHERE id = p_tournament_id;
    
END //

DELIMITER ;

-- Triggers for maintaining data integrity
CREATE TRIGGER update_tournament_participants_count
AFTER INSERT ON tournament_participants
FOR EACH ROW
UPDATE tournaments 
SET current_participants = (
    SELECT COUNT(*) 
    FROM tournament_participants 
    WHERE tournament_id = NEW.tournament_id 
    AND status IN ('registered', 'approved', 'checked_in')
)
WHERE id = NEW.tournament_id;

CREATE TRIGGER update_tournament_participants_count_delete
AFTER DELETE ON tournament_participants
FOR EACH ROW
UPDATE tournaments 
SET current_participants = (
    SELECT COUNT(*) 
    FROM tournament_participants 
    WHERE tournament_id = OLD.tournament_id 
    AND status IN ('registered', 'approved', 'checked_in')
)
WHERE id = OLD.tournament_id;

-- Sample data for testing
INSERT INTO tournaments (
    name, description, organizer_id, format, max_participants,
    start_date, registration_deadline, prize_pool, status,
    game_mode, region, is_private, allow_spectators
) VALUES 
(
    'ZH-Love Championship 2024',
    'The biggest Command & Conquer: Generals Zero Hour tournament of the year!',
    1, 'single_elimination', 64,
    '2024-07-15 18:00:00', '2024-07-10 23:59:59', 1000.00, 'open',
    'tournament', 'global', FALSE, TRUE
),
(
    'Middle East Masters',
    'Regional tournament for MENA players',
    2, 'double_elimination', 32,
    '2024-07-20 20:00:00', '2024-07-18 23:59:59', 500.00, 'open',
    'ranked', 'mena', FALSE, TRUE
),
(
    'Weekly Clash #1',
    'Weekly tournament for all skill levels',
    3, 'swiss', 16,
    '2024-07-08 19:00:00', '2024-07-08 18:30:00', 0.00, 'live',
    'classic', 'global', FALSE, TRUE
);

-- Add some sample updates
INSERT INTO tournament_updates (tournament_id, author_id, title, content, type) VALUES
(1, 1, 'Tournament Rules Updated', 'We have updated the tournament rules. Please review them carefully.', 'rules'),
(1, 1, 'Registration Reminder', 'Only 3 days left to register! Don\'t miss out on this epic tournament.', 'general'),
(2, 2, 'Prize Pool Increased', 'Great news! The prize pool has been increased to $500!', 'important'),
(3, 3, 'Match Schedule Posted', 'The match schedule has been posted. Check your match times!', 'schedule');

-- Performance optimization
ANALYZE TABLE tournaments;
ANALYZE TABLE tournament_participants;
ANALYZE TABLE tournament_matches;
ANALYZE TABLE tournament_updates;
ANALYZE TABLE tournament_notifications; 