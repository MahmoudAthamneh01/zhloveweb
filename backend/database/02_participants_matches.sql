-- Part 2: Tournament Participants and Matches
-- ZH-Love Gaming Community Platform

USE zh_love_db;

-- Enhanced tournament participants table
CREATE TABLE IF NOT EXISTS tournament_participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_id INT NOT NULL,
    user_id INT NOT NULL,
    team_name VARCHAR(100),
    seed INT,
    status ENUM('registered', 'approved', 'rejected', 'checked_in', 'eliminated', 'withdrawn') DEFAULT 'registered',
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_in_date TIMESTAMP NULL,
    notes TEXT,
    
    -- Team information (for team tournaments)
    team_members JSON,
    captain_id INT,
    
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
CREATE TABLE IF NOT EXISTS tournament_matches (
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
    game_results JSON,
    
    -- Match settings
    best_of INT DEFAULT 1,
    map_pool JSON,
    
    -- Media and streaming
    stream_url VARCHAR(500),
    replay_files JSON,
    
    -- Administrative
    referee_id INT,
    admin_notes TEXT,
    dispute_reason TEXT,
    
    -- Bracket positioning
    next_match_id INT,
    previous_match1_id INT,
    previous_match2_id INT,
    
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