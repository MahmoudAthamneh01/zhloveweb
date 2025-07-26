-- Part 4: Statistics, Views and Sample Data
-- ZH-Love Gaming Community Platform

USE zh_love_db;

-- Tournament statistics and analytics
CREATE TABLE IF NOT EXISTS tournament_statistics (
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
    average_match_duration INT DEFAULT 0,
    
    -- Streaming metrics
    peak_viewers INT DEFAULT 0,
    total_watch_time INT DEFAULT 0,
    
    -- Constraints
    UNIQUE KEY unique_tournament_date (tournament_id, date),
    INDEX idx_tournament_stats (tournament_id, date),
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

-- Tournament brackets (for complex bracket structures)
CREATE TABLE IF NOT EXISTS tournament_brackets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_id INT NOT NULL,
    bracket_type ENUM('main', 'losers', 'consolation') DEFAULT 'main',
    structure JSON,
    
    -- Constraints
    INDEX idx_tournament_bracket (tournament_id, bracket_type),
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

-- Tournament archives for completed tournaments
CREATE TABLE IF NOT EXISTS tournament_archives (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_id INT NOT NULL,
    archive_data JSON,
    final_results JSON,
    statistics JSON,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE KEY unique_tournament_archive (tournament_id),
    INDEX idx_archived_at (archived_at),
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

-- Additional indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_tournaments_composite ON tournaments(status, start_date, region, format);
CREATE INDEX IF NOT EXISTS idx_tournaments_featured ON tournaments(is_featured, status, start_date);
CREATE INDEX IF NOT EXISTS idx_participants_composite ON tournament_participants(tournament_id, status, registration_date);
CREATE INDEX IF NOT EXISTS idx_matches_composite ON tournament_matches(tournament_id, round, status, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_updates_composite ON tournament_updates(tournament_id, type, created_at DESC);

-- Views for common queries
CREATE OR REPLACE VIEW tournament_summary AS
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
    t.is_featured,
    t.is_private,
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
CREATE OR REPLACE VIEW live_tournaments AS
SELECT 
    t.*,
    u.username AS organizer_name,
    COUNT(DISTINCT tp.id) AS participants_count,
    COUNT(DISTINCT CASE WHEN tm.status = 'live' THEN tm.id END) AS live_matches_count
FROM tournaments t
LEFT JOIN users u ON t.organizer_id = u.id
LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id AND tp.status = 'checked_in'
LEFT JOIN tournament_matches tm ON t.id = tm.tournament_id
WHERE t.status = 'live'
GROUP BY t.id, u.username; 