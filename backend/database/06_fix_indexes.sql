-- Fix for Index Issues
-- ZH-Love Gaming Community Platform

USE zh_love_db;

-- Check and add missing columns if they don't exist
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'tournaments' 
     AND column_name = 'region' 
     AND table_schema = DATABASE()) = 0,
    'ALTER TABLE tournaments ADD COLUMN region ENUM(''global'', ''mena'', ''europe'', ''asia'', ''americas'') DEFAULT ''global'' AFTER game_mode;',
    'SELECT ''Column region already exists'';'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add missing columns for featured tournaments
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'tournaments' 
     AND column_name = 'is_featured' 
     AND table_schema = DATABASE()) = 0,
    'ALTER TABLE tournaments ADD COLUMN is_featured BOOLEAN DEFAULT FALSE AFTER allow_spectators;',
    'SELECT ''Column is_featured already exists'';'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add missing columns for custom rules
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'tournaments' 
     AND column_name = 'use_custom_rules' 
     AND table_schema = DATABASE()) = 0,
    'ALTER TABLE tournaments ADD COLUMN use_custom_rules BOOLEAN DEFAULT FALSE AFTER is_featured;',
    'SELECT ''Column use_custom_rules already exists'';'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add missing columns for approval tracking
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'tournaments' 
     AND column_name = 'rejected_at' 
     AND table_schema = DATABASE()) = 0,
    'ALTER TABLE tournaments ADD COLUMN rejected_at TIMESTAMP NULL AFTER approved_by;',
    'SELECT ''Column rejected_at already exists'';'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'tournaments' 
     AND column_name = 'rejected_by' 
     AND table_schema = DATABASE()) = 0,
    'ALTER TABLE tournaments ADD COLUMN rejected_by INT NULL AFTER rejected_at;',
    'SELECT ''Column rejected_by already exists'';'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'tournaments' 
     AND column_name = 'rejection_reason' 
     AND table_schema = DATABASE()) = 0,
    'ALTER TABLE tournaments ADD COLUMN rejection_reason TEXT AFTER rejected_by;',
    'SELECT ''Column rejection_reason already exists'';'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update status enum to include 'rejected'
ALTER TABLE tournaments MODIFY COLUMN status ENUM('draft', 'pending_approval', 'open', 'live', 'paused', 'completed', 'cancelled', 'rejected') DEFAULT 'draft';

-- Now create the indexes safely
-- Drop existing indexes if they exist first
SET @sql = 'DROP INDEX IF EXISTS idx_tournaments_composite ON tournaments';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = 'DROP INDEX IF EXISTS idx_tournaments_featured ON tournaments';
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create the performance indexes
CREATE INDEX idx_tournaments_composite ON tournaments(status, start_date, region, format);
CREATE INDEX idx_tournaments_featured ON tournaments(is_featured, status, start_date);
CREATE INDEX idx_tournaments_region ON tournaments(region, status);
CREATE INDEX idx_tournaments_game_mode ON tournaments(game_mode, status);

-- Additional useful indexes
CREATE INDEX IF NOT EXISTS idx_participants_composite ON tournament_participants(tournament_id, status, registration_date);
CREATE INDEX IF NOT EXISTS idx_matches_composite ON tournament_matches(tournament_id, round, status, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_updates_composite ON tournament_updates(tournament_id, type, created_at DESC);

-- Foreign key constraints (add if they don't exist)
SET FOREIGN_KEY_CHECKS = 0;

-- Check and add foreign key for rejected_by
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE table_name = 'tournaments' 
     AND column_name = 'rejected_by' 
     AND constraint_name LIKE 'fk_%'
     AND table_schema = DATABASE()) = 0,
    'ALTER TABLE tournaments ADD FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL;',
    'SELECT ''Foreign key for rejected_by already exists'';'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;

-- Show the final structure
SELECT 'Tournament table structure updated successfully' as message;
SHOW INDEX FROM tournaments; 