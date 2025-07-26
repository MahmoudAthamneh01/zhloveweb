-- Part 3: Tournament Updates and Notifications
-- ZH-Love Gaming Community Platform

USE zh_love_db;

-- Tournament updates and announcements
CREATE TABLE IF NOT EXISTS tournament_updates (
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
CREATE TABLE IF NOT EXISTS tournament_update_reads (
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

-- Tournament invitations for private tournaments
CREATE TABLE IF NOT EXISTS tournament_invitations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_id INT NOT NULL,
    user_id INT NOT NULL,
    invited_by INT NOT NULL,
    status ENUM('pending', 'accepted', 'declined', 'expired') DEFAULT 'pending',
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    
    -- Constraints
    UNIQUE KEY unique_tournament_invitation (tournament_id, user_id),
    INDEX idx_user_invitations (user_id, status),
    INDEX idx_tournament_invitations (tournament_id, status),
    
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Tournament staff and roles
CREATE TABLE IF NOT EXISTS tournament_staff (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tournament_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('organizer', 'co_organizer', 'referee', 'moderator', 'commentator', 'admin') NOT NULL,
    permissions JSON,
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