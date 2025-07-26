-- Part 5: Sample Data for Testing
-- ZH-Love Gaming Community Platform

USE zh_love_db;

-- Insert sample tournaments (only if no tournaments exist)
INSERT IGNORE INTO tournaments (
    id, name, description, format, max_participants, prize_pool, 
    start_date, registration_deadline, organizer_id, status, 
    game_mode, region, is_featured, rules, contact_info
) VALUES 
(1, 'ZH-Love Championship 2024', 
 'البطولة الكبرى لمجتمع ZH-Love - أكبر بطولة للعام!', 
 'single_elimination', 64, 1000.00,
 '2024-02-15 18:00:00', '2024-02-10 23:59:59', 
 1, 'open', 'tournament', 'global', 1,
 'قوانين البطولات الرسمية:\n1. جميع المباريات best of 3\n2. اختيار الخرائط حسب النظام المحدد\n3. ممنوع التوقف المؤقت إلا في حالات الطوارئ\n4. الحضور قبل 15 دقيقة من المباراة\n5. في حالة عدم الحضور، walkover للخصم',
 '{"discord": "https://discord.gg/zh-love", "telegram": "@zh_love_official", "email": "tournaments@zh-love.com"}'
),

(2, 'منافسة الشرق الأوسط', 
 'بطولة خاصة بلاعبي منطقة الشرق الأوسط وشمال أفريقيا',
 'double_elimination', 32, 500.00,
 '2024-02-20 20:00:00', '2024-02-18 23:59:59',
 1, 'open', 'ranked', 'mena', 0,
 'قوانين المباريات المرتبة:\n1. المباريات حسب تصنيف اللاعبين\n2. استخدام نقاط ELO للترتيب\n3. اختيار عشوائي للخرائط من القائمة المحددة\n4. ممنوع اللعب مع نفس الخصم أكثر من 3 مرات يومياً',
 '{"discord": "https://discord.gg/mena-zh", "telegram": "@mena_zh_love"}'
),

(3, 'بطولة المبتدئين', 
 'بطولة مخصصة للاعبين الجدد لتطوير مهاراتهم',
 'round_robin', 16, 100.00,
 '2024-02-25 16:00:00', '2024-02-23 23:59:59',
 1, 'open', 'classic', 'global', 0,
 'قوانين نمط اللعب الكلاسيكي:\n1. استخدام الوحدات الافتراضية فقط\n2. ممنوع استخدام الغش أو البرامج المساعدة\n3. اللعب النظيف والاحترام المتبادل\n4. في حالة الانقطاع، إعادة المباراة من البداية',
 '{"discord": "https://discord.gg/beginners-zh", "email": "beginners@zh-love.com"}'
),

(4, 'بطولة خاصة VIP', 
 'بطولة خاصة بدعوة فقط للأعضاء المميزين',
 'single_elimination', 8, 2000.00,
 '2024-03-01 19:00:00', '2024-02-28 23:59:59',
 1, 'pending_approval', 'custom', 'global', 0,
 'قوانين النمط المخصص:\n1. القوانين حسب إعدادات منظم البطولة\n2. يمكن تعديل قائمة الخرائط\n3. إعدادات مرونة أكثر للمنظمين\n4. يجب الإعلان عن القوانين قبل البطولة',
 '{"discord": "https://discord.gg/vip-zh", "telegram": "@vip_zh_love", "email": "vip@zh-love.com"}',
 1, 0, 1, 0
);

-- Insert sample tournament updates
INSERT IGNORE INTO tournament_updates (
    tournament_id, author_id, title, content, type, is_pinned
) VALUES 
(1, 1, 'مرحباً بكم في البطولة الكبرى!', 
 'نرحب بجميع المشاركين في البطولة الكبرى لـ ZH-Love. نتمنى لكم أفضل الحظ!', 
 'general', 1),

(1, 1, 'تحديث مواعيد المباريات', 
 'تم تحديث مواعيد بعض المباريات. يرجى مراجعة الجدول الزمني الجديد.', 
 'schedule', 0),

(2, 1, 'قوانين إضافية للبطولة', 
 'تم إضافة بعض القوانين الإضافية لضمان اللعب النظيف.', 
 'rules', 0);

-- Insert sample tournament staff
INSERT IGNORE INTO tournament_staff (
    tournament_id, user_id, role, appointed_by
) VALUES 
(1, 1, 'organizer', 1),
(2, 1, 'organizer', 1),
(3, 1, 'organizer', 1);

-- Insert sample tournament statistics
INSERT IGNORE INTO tournament_statistics (
    tournament_id, date, views, unique_visitors, registrations
) VALUES 
(1, CURDATE(), 1250, 890, 45),
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 980, 720, 38),
(2, CURDATE(), 750, 580, 28),
(3, CURDATE(), 420, 320, 12);

-- Update tournament view counts
UPDATE tournaments SET views = 1250 WHERE id = 1;
UPDATE tournaments SET views = 750 WHERE id = 2;
UPDATE tournaments SET views = 420 WHERE id = 3; 