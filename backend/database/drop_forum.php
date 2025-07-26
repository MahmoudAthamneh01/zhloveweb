<?php
$pdo = new PDO('mysql:host=localhost;dbname=zh_love_db', 'root', '');
$pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
$pdo->exec('DROP TABLE IF EXISTS forum_likes');
$pdo->exec('DROP TABLE IF EXISTS forum_comments'); 
$pdo->exec('DROP TABLE IF EXISTS forum_posts');
$pdo->exec('DROP TABLE IF EXISTS forum_categories');
$pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
echo "All forum tables dropped successfully\n";
?>
