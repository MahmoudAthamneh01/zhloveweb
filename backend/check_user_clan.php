<?php
// Script to check specific user's clan data

try {
    $pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $userId = 23; // ID from the screenshot
    
    echo "Checking clan data for user ID: $userId\n\n";
    
    // Check if user owns a clan
    $stmt = $pdo->prepare("
        SELECT c.*, 'leader' as user_role, u.username as owner_username
        FROM clans c 
        JOIN users u ON c.owner_id = u.id
        WHERE c.owner_id = ? AND c.is_active = 1 AND c.is_approved = 1
    ");
    $stmt->execute([$userId]);
    $ownedClan = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($ownedClan) {
        echo "User OWNS a clan:\n";
        echo "- Clan ID: {$ownedClan['id']}\n";
        echo "- Name: {$ownedClan['name']}\n";
        echo "- Tag: {$ownedClan['tag']}\n";
        echo "- Active: " . ($ownedClan['is_active'] ? 'Yes' : 'No') . "\n";
        echo "- Approved: " . ($ownedClan['is_approved'] ? 'Yes' : 'No') . "\n";
        echo "- Role: {$ownedClan['user_role']}\n\n";
    } else {
        echo "User does NOT own any clan.\n\n";
    }
    
    // Check if user is a member of any clan
    $stmt = $pdo->prepare("
        SELECT c.*, cm.role as user_role, u.username as owner_username
        FROM clans c 
        JOIN clan_members cm ON c.id = cm.clan_id 
        JOIN users u ON c.owner_id = u.id
        WHERE cm.user_id = ? AND c.is_active = 1 AND c.is_approved = 1
    ");
    $stmt->execute([$userId]);
    $memberClan = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($memberClan) {
        echo "User is MEMBER of a clan:\n";
        echo "- Clan ID: {$memberClan['id']}\n";
        echo "- Name: {$memberClan['name']}\n";
        echo "- Tag: {$memberClan['tag']}\n";
        echo "- Role: {$memberClan['user_role']}\n\n";
    } else {
        echo "User is NOT a member of any clan.\n\n";
    }
    
    // Check clan_members table directly
    $stmt = $pdo->prepare("SELECT * FROM clan_members WHERE user_id = ?");
    $stmt->execute([$userId]);
    $memberships = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Direct clan_members table check:\n";
    if (empty($memberships)) {
        echo "- No memberships found in clan_members table\n";
    } else {
        foreach ($memberships as $membership) {
            echo "- Clan ID: {$membership['clan_id']}, Role: {$membership['role']}, Joined: {$membership['joined_at']}\n";
        }
    }
    
    // Check pending applications
    $stmt = $pdo->prepare("
        SELECT ca.*, 'applicant' as user_role 
        FROM clan_applications ca 
        WHERE ca.organizer_id = ? AND ca.status = 'pending'
        ORDER BY ca.submitted_at DESC 
        LIMIT 1
    ");
    $stmt->execute([$userId]);
    $pendingApp = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "\nPending applications:\n";
    if ($pendingApp) {
        echo "- App ID: {$pendingApp['id']}, Clan: {$pendingApp['clan_name']}, Status: {$pendingApp['status']}\n";
    } else {
        echo "- No pending applications\n";
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
