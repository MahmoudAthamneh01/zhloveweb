-- Part 1: Basic Tournament Table
-- ZH-Love Gaming Community Platform

USE zh_love_db;

-- Create tournaments table with enhanced features
CREATE TABLE IF NOT EXISTS tournaments (
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
    status ENUM('draft', 'pending_approval', 'open', 'live', 'paused', 'completed', 'cancelled', 'rejected') DEFAULT 'draft',
    game_mode ENUM('classic', 'tournament', 'ranked', 'custom') DEFAULT 'classic',
    region ENUM('global', 'mena', 'europe', 'asia', 'americas') DEFAULT 'global',
    
    -- Organizer and management
    organizer_id INT NOT NULL,
    co_organizers JSON,
    
    -- Tournament settings
    is_private BOOLEAN DEFAULT FALSE,
    require_approval BOOLEAN DEFAULT TRUE,
    allow_spectators BOOLEAN DEFAULT TRUE,
    auto_start BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    use_custom_rules BOOLEAN DEFAULT FALSE,
    
    -- Ranking restrictions
    min_rank VARCHAR(20),
    max_rank VARCHAR(20),
    
    -- Media and branding
    image_url VARCHAR(500),
    banner_url VARCHAR(500),
    
    -- Maps and game settings
    allowed_maps JSON,
    
    -- Contact information
    contact_info JSON,
    
    -- Streaming and broadcast
    stream_url VARCHAR(500),
    broadcast_channels JSON,
    
    -- Sponsors and partners
    sponsors JSON,
    
    -- Prize distribution
    prize_distribution JSON,
    
    -- Approval tracking
    approved_at TIMESTAMP NULL,
    approved_by INT NULL,
    rejected_at TIMESTAMP NULL,
    rejected_by INT NULL,
    rejection_reason TEXT,
    
    -- Statistics
    views INT DEFAULT 0,
    popularity_score INT DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    INDEX idx_organizer (organizer_id),
    INDEX idx_status (status),
    INDEX idx_start_date (start_date),
    INDEX idx_region (region),
    INDEX idx_format (format),
    INDEX idx_featured (is_featured),
    
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL
); 