<?php
// Add clan management features
try {
    $db = new PDO('mysql:host=localhost;dbname=zh_love_db;charset=utf8mb4', 'root', '');
    
    echo "=== إضافة الحقول المطلوبة لجدول العشائر ===\n";
    
    // Check if columns already exist
    $stmt = $db->query("SHOW COLUMNS FROM clans LIKE 'recruitment_type'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE clans ADD COLUMN recruitment_type ENUM('open', 'invite_only', 'closed') DEFAULT 'open' AFTER is_recruiting");
        echo "✓ تمت إضافة حقل recruitment_type\n";
    } else {
        echo "✓ حقل recruitment_type موجود مسبقاً\n";
    }
    
    // Check if logo_url column exists (it seems to be 'logo' in current table)
    $stmt = $db->query("SHOW COLUMNS FROM clans LIKE 'logo_url'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE clans ADD COLUMN logo_url VARCHAR(500) AFTER banner");
        echo "✓ تمت إضافة حقل logo_url\n";
    } else {
        echo "✓ حقل logo_url موجود مسبقاً\n";
    }
    
    // Check if banner_url column exists (it seems to be 'banner' in current table)
    $stmt = $db->query("SHOW COLUMNS FROM clans LIKE 'banner_url'");
    if ($stmt->rowCount() == 0) {
        $db->exec("ALTER TABLE clans ADD COLUMN banner_url VARCHAR(500) AFTER logo_url");
        echo "✓ تمت إضافة حقل banner_url\n";
    } else {
        echo "✓ حقل banner_url موجود مسبقاً\n";
    }
    
    echo "\n=== إنشاء جدول تاريخ تغيير القائد ===\n";
    
    $createLeadershipHistoryTable = "
    CREATE TABLE IF NOT EXISTS clan_leadership_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clan_id INT NOT NULL,
        old_leader_id INT,
        new_leader_id INT NOT NULL,
        changed_by INT,
        reason TEXT,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (clan_id) REFERENCES clans(id) ON DELETE CASCADE,
        FOREIGN KEY (old_leader_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (new_leader_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_clan_id (clan_id),
        INDEX idx_changed_at (changed_at)
    )";
    
    $db->exec($createLeadershipHistoryTable);
    echo "✓ تم إنشاء جدول clan_leadership_history\n";
    
    echo "\n=== إنشاء جدول تاريخ التعديلات ===\n";
    
    $createClanModificationsTable = "
    CREATE TABLE IF NOT EXISTS clan_modifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clan_id INT NOT NULL,
        modified_by INT NOT NULL,
        field_name VARCHAR(50) NOT NULL,
        old_value TEXT,
        new_value TEXT,
        modification_type ENUM('name_change', 'description_change', 'logo_change', 'banner_change', 'recruitment_change', 'other') DEFAULT 'other',
        modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (clan_id) REFERENCES clans(id) ON DELETE CASCADE,
        FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE CASCADE,
        
        INDEX idx_clan_id (clan_id),
        INDEX idx_modified_at (modified_at),
        INDEX idx_modification_type (modification_type)
    )";
    
    $db->exec($createClanModificationsTable);
    echo "✓ تم إنشاء جدول clan_modifications\n";
    
    echo "\n=== عرض البنية الجديدة ===\n";
    $stmt = $db->query("DESCRIBE clans");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $column) {
        echo "- {$column['Field']}: {$column['Type']}\n";
    }
    
} catch (Exception $e) {
    echo "خطأ: " . $e->getMessage() . "\n";
}
?>
