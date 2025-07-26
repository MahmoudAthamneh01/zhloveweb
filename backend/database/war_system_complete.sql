-- جداول نظام الحروب ونظام النقاط
-- War System Complete Database Schema

-- جدول أنواع الحروب
CREATE TABLE IF NOT EXISTS war_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    winner_points INT DEFAULT 150,
    loser_points INT DEFAULT 50,
    duration_hours INT DEFAULT 48,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_is_active (is_active)
);

-- جدول خرائط الحروب
CREATE TABLE IF NOT EXISTS war_maps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    difficulty_level ENUM('easy', 'medium', 'hard', 'expert') DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_difficulty (difficulty_level),
    INDEX idx_is_active (is_active)
);

-- جدول تفاصيل مباريات الحرب
CREATE TABLE IF NOT EXISTS war_matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    war_id INT NOT NULL,
    match_number INT NOT NULL,
    team1_player1_id INT,
    team1_player2_id INT,
    team2_player1_id INT,
    team2_player2_id INT,
    map_id INT,
    winner_team ENUM('team1', 'team2', 'draw') NULL,
    score_team1 INT DEFAULT 0,
    score_team2 INT DEFAULT 0,
    replay_file VARCHAR(255),
    notes TEXT,
    played_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (war_id) REFERENCES clan_wars(id) ON DELETE CASCADE,
    FOREIGN KEY (team1_player1_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (team1_player2_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (team2_player1_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (team2_player2_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (map_id) REFERENCES war_maps(id) ON DELETE SET NULL,
    INDEX idx_war_id (war_id),
    INDEX idx_match_number (match_number)
);

-- جدول دردشة الحروب
CREATE TABLE IF NOT EXISTS war_chat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    war_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    message_type ENUM('general', 'system', 'result', 'announcement') DEFAULT 'general',
    is_visible_to_opponent BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (war_id) REFERENCES clan_wars(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_war_id (war_id),
    INDEX idx_created_at (created_at),
    INDEX idx_user_id (user_id)
);

-- جدول تاريخ النقاط للعشائر
CREATE TABLE IF NOT EXISTS clan_points_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clan_id INT NOT NULL,
    war_id INT,
    points_change INT NOT NULL,
    points_before INT NOT NULL,
    points_after INT NOT NULL,
    reason ENUM('war_win', 'war_loss', 'bonus', 'penalty', 'adjustment') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clan_id) REFERENCES clans(id) ON DELETE CASCADE,
    FOREIGN KEY (war_id) REFERENCES clan_wars(id) ON DELETE SET NULL,
    INDEX idx_clan_id (clan_id),
    INDEX idx_war_id (war_id),
    INDEX idx_created_at (created_at)
);

-- جدول إحصائيات الحروب للعشائر
CREATE TABLE IF NOT EXISTS clan_war_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clan_id INT NOT NULL UNIQUE,
    total_wars INT DEFAULT 0,
    wars_won INT DEFAULT 0,
    wars_lost INT DEFAULT 0,
    wars_drawn INT DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    current_streak INT DEFAULT 0,
    best_streak INT DEFAULT 0,
    last_war_date TIMESTAMP NULL,
    ranking_position INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clan_id) REFERENCES clans(id) ON DELETE CASCADE,
    INDEX idx_win_rate (win_rate),
    INDEX idx_ranking_position (ranking_position)
);

-- بيانات تجريبية لأنواع الحروب
INSERT IGNORE INTO war_types (name, description, winner_points, loser_points, duration_hours) VALUES
('حرب عشائر كلاسيكية', 'مباراة تقليدية بين العشائر بقواعد اللعبة العادية', 200, 30, 48),
('حرب سريعة', 'مباراة سريعة لمدة ساعة واحدة فقط', 100, 10, 1),
('حرب ماراثون', 'حرب طويلة لمدة أسبوع كامل مع جوائز مضاعفة', 500, 100, 168),
('بطولة العشائر', 'مباراة بطولة رسمية مع نقاط مضاعفة', 750, 150, 72),
('تحدي الماسترز', 'للعشائر المتقدمة فقط - نقاط عالية جداً', 1000, 200, 96);

-- بيانات تجريبية للخرائط
INSERT IGNORE INTO war_maps (name, description, difficulty_level) VALUES
('صحراء العقارب', 'خريطة صحراوية بمناظر قاحلة ومعارك شرسة', 'medium'),
('جبال الثلج', 'خريطة جبلية مغطاة بالثلوج مع تحديات إضافية', 'hard'),
('غابة الأمازون', 'خريطة غابات كثيفة مع عوائق طبيعية', 'medium'),
('المدينة المدمرة', 'خريطة حضرية مدمرة مليئة بالأنقاض', 'expert'),
('السهول الخضراء', 'خريطة مفتوحة مناسبة للمبتدئين', 'easy'),
('جزيرة البراكين', 'خريطة خطيرة مع براكين نشطة', 'expert'),
('وادي الملوك', 'خريطة تاريخية بطابع ملكي', 'hard');

-- إنشاء إحصائيات للعشائر الموجودة
INSERT IGNORE INTO clan_war_stats (clan_id) 
SELECT id FROM clans WHERE is_active = 1;
