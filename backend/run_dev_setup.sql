-- نظف البيانات الموجودة
DELETE FROM clan_wars;
DELETE FROM clan_join_applications; 
DELETE FROM clan_members;
DELETE FROM clans;
DELETE FROM users WHERE username != 'admin';

-- أعد تعيين المعرفات
ALTER TABLE users AUTO_INCREMENT = 2;
ALTER TABLE clans AUTO_INCREMENT = 1;

-- أنشئ مستخدمين للاختبار
INSERT INTO users (username, email, password_hash, first_name, last_name, level, wins, losses, win_rate, rank_points, is_verified) VALUES
('test_user', 'test@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'مستخدم', 'تجريبي', 50, 64, 16, 80.00, 1800, 1),
('war_leader', 'war@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'قائد', 'المحاربين', 85, 135, 15, 90.00, 2200, 1),
('storm_leader', 'storm@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'قائد', 'العاصفة', 65, 75, 25, 75.00, 1800, 1),
('eagle_leader', 'eagle@zh-love.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'قائد', 'النسور', 75, 76, 19, 80.00, 1900, 1);

-- أنشئ عشائر موافق عليها
INSERT INTO clans (name, tag, description, owner_id, total_members, level, is_approved) VALUES
('نسور الشرق', 'EAST', 'عشيرة نخبة للاعبين المحترفين', 2, 1, 5, 1),
('الذئاب المحاربة', 'WAR', 'كلان محترف للمعارك الاستراتيجية', 3, 1, 8, 1),
('عاصفة الصحراء', 'STORM', 'كلان سريع ومتميز', 4, 1, 6, 1),
('النسور الذهبية', 'GOLD', 'كلان طموح يسعى للقمة', 5, 1, 4, 1);

-- أنشئ عشائر غير موافق عليها
INSERT INTO clans (name, tag, description, owner_id, total_members, level, is_approved) VALUES
('جنود البرق', 'LIGHT', 'كلان جديد ينتظر الموافقة', 4, 1, 1, 0),
('أشباح الليل', 'GHOST', 'كلان تكتيكي ينتظر الموافقة', 5, 1, 1, 0);

-- أضف الأعضاء للعشائر
INSERT INTO clan_members (clan_id, user_id, role, contribution_points) VALUES
(1, 2, 'leader', 5000),
(2, 3, 'leader', 5000),
(3, 4, 'leader', 3200),
(4, 5, 'leader', 2100),
(5, 4, 'leader', 500),
(6, 5, 'leader', 300);

-- أضف طلبات حرب
INSERT INTO clan_wars (challenger_clan_id, challenged_clan_id, scheduled_at, duration, rules, challenge_message, status, created_by) VALUES
(3, 1, DATE_ADD(NOW(), INTERVAL 1 DAY), 48, 'حرب كاملة بجميع الوحدات', 'تحدي من عاصفة الصحراء', 'pending', 4),
(2, 1, DATE_ADD(NOW(), INTERVAL 3 DAY), 72, 'حرب نخبة للمحترفين', 'معركة الأساطير', 'pending', 3);

SELECT 'تم إعداد البيانات التطويرية بنجاح!' as message; 