-- إنشاء جدول دعوات العشائر
CREATE TABLE IF NOT EXISTS clan_invitations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clan_id INT NOT NULL,
    invited_user_id INT NOT NULL,
    invited_by_user_id INT NOT NULL,
    message TEXT,
    status ENUM('pending', 'accepted', 'declined', 'expired') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    expires_at TIMESTAMP DEFAULT (DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 7 DAY)),
    
    FOREIGN KEY (clan_id) REFERENCES clans(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_pending_invitation (clan_id, invited_user_id, status)
);
