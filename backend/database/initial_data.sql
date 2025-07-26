-- Initial Data for ZH-Love Gaming Community
-- This file contains sample data for development and testing

USE zh_love_db;

-- Insert admin user
INSERT INTO users (uuid, username, email, password_hash, first_name, last_name, avatar_url, bio, country, rank_points, level, experience_points, total_matches, wins, losses, role, status, email_verified, last_login, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin', 'admin@zh-love.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'مدير', 'النظام', '/images/avatars/admin.png', 'مدير منصة ZH-Love لمجتمع لعبة الجنرالات', 'Saudi Arabia', 5000, 50, 50000, 200, 150, 50, 'admin', 'active', TRUE, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440001', 'ZH_Legend', 'legend@zh-love.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'أحمد', 'الأسطورة', '/images/avatars/legend.png', 'لاعب محترف في لعبة الجنرالات زيرو آور، أحب القتال والتحدي', 'Egypt', 4500, 45, 45000, 180, 140, 40, 'user', 'active', TRUE, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'GLA_Master', 'gla@zh-love.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'محمد', 'المقاتل', '/images/avatars/gla.png', 'متخصص في فصيل جيش التحرير العالمي، الهجمات السريعة والمتفجرات', 'Jordan', 4200, 42, 42000, 160, 120, 40, 'user', 'active', TRUE, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'USA_Commander', 'usa@zh-love.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'سالم', 'القائد', '/images/avatars/usa.png', 'قائد محترف للجيش الأمريكي، استراتيجية الدفاع والهجوم المتوازن', 'UAE', 3800, 38, 38000, 140, 100, 40, 'user', 'active', TRUE, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'China_General', 'china@zh-love.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'خالد', 'الجنرال', '/images/avatars/china.png', 'خبير في الجيش الصيني، الأسلحة النووية والدبابات الثقيلة', 'Kuwait', 3600, 36, 36000, 120, 80, 40, 'user', 'active', TRUE, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'Desert_Warrior', 'desert@zh-love.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'علي', 'المحارب', '/images/avatars/desert.png', 'محارب الصحراء، أحب الخرائط الصحراوية والمعارك الطويلة', 'Morocco', 3400, 34, 34000, 110, 70, 40, 'user', 'active', TRUE, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'Pro_Gamer', 'pro@zh-love.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'يوسف', 'المحترف', '/images/avatars/pro.png', 'لاعب محترف، أشارك في البطولات والمسابقات', 'Lebanon', 3200, 32, 32000, 100, 65, 35, 'user', 'active', TRUE, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'Tactical_Mind', 'tactical@zh-love.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'عمر', 'التكتيكي', '/images/avatars/tactical.png', 'أحب الاستراتيجيات التكتيكية والتخطيط العسكري المتقدم', 'Iraq', 3000, 30, 30000, 90, 60, 30, 'user', 'active', TRUE, NOW(), NOW());

-- Insert clans
INSERT INTO clans (name, tag, description, logo_url, banner_url, leader_id, founded_date, total_members, clan_points, wins, losses, status, recruitment_open, website, discord_url, created_at) VALUES
('الأسود العربية', 'ARAB', 'عشيرة الأسود العربية - أقوى العشائر في المنطقة العربية، نحن نقاتل بشرف وكرامة', '/images/clans/arab-lions.png', '/images/clans/arab-lions-banner.jpg', 2, '2023-01-15', 25, 12500, 85, 15, 'active', TRUE, 'https://arab-lions.com', 'https://discord.gg/arab-lions', NOW()),
('محاربو الصحراء', 'DSRT', 'محاربو الصحراء - متخصصون في الخرائط الصحراوية والمعارك الطويلة', '/images/clans/desert-warriors.png', '/images/clans/desert-warriors-banner.jpg', 3, '2023-02-20', 20, 10800, 72, 18, 'active', TRUE, 'https://desert-warriors.com', 'https://discord.gg/desert-warriors', NOW()),
('النسور الذهبية', 'GOLD', 'النسور الذهبية - نطير عالياً ونضرب بقوة، عشيرة النخبة', '/images/clans/golden-eagles.png', '/images/clans/golden-eagles-banner.jpg', 4, '2023-03-10', 18, 9600, 64, 16, 'active', TRUE, 'https://golden-eagles.com', 'https://discord.gg/golden-eagles', NOW()),
('فرسان الشرق', 'EAST', 'فرسان الشرق - نحن نحمي الشرق العربي من كل المعتدين', '/images/clans/east-knights.png', '/images/clans/east-knights-banner.jpg', 5, '2023-04-05', 15, 8400, 56, 14, 'active', TRUE, 'https://east-knights.com', 'https://discord.gg/east-knights', NOW()),
('الصقور الحمراء', 'HAWK', 'الصقور الحمراء - سريعون في الهجوم، أقوياء في الدفاع', '/images/clans/red-hawks.png', '/images/clans/red-hawks-banner.jpg', 6, '2023-05-12', 12, 7200, 48, 12, 'active', TRUE, 'https://red-hawks.com', 'https://discord.gg/red-hawks', NOW());

-- Insert clan members
INSERT INTO clan_members (clan_id, user_id, role, joined_date, contribution_points, status) VALUES
-- Arab Lions members
(1, 2, 'leader', '2023-01-15 10:00:00', 2500, 'active'),
(1, 3, 'officer', '2023-01-16 14:30:00', 2200, 'active'),
(1, 4, 'officer', '2023-01-20 09:15:00', 2000, 'active'),
(1, 5, 'member', '2023-01-25 16:45:00', 1800, 'active'),
(1, 6, 'member', '2023-02-01 11:20:00', 1600, 'active'),
-- Desert Warriors members
(2, 3, 'leader', '2023-02-20 12:00:00', 2300, 'active'),
(2, 7, 'officer', '2023-02-22 15:30:00', 1900, 'active'),
(2, 8, 'member', '2023-02-25 10:45:00', 1700, 'active'),
-- Golden Eagles members
(3, 4, 'leader', '2023-03-10 13:00:00', 2100, 'active'),
(3, 2, 'officer', '2023-03-12 16:30:00', 1800, 'active'),
-- East Knights members
(4, 5, 'leader', '2023-04-05 14:00:00', 1900, 'active'),
(4, 6, 'officer', '2023-04-07 17:30:00', 1600, 'active'),
-- Red Hawks members
(5, 6, 'leader', '2023-05-12 15:00:00', 1700, 'active'),
(5, 7, 'officer', '2023-05-14 18:30:00', 1500, 'active');

-- Insert tournaments
INSERT INTO tournaments (name, description, banner_url, tournament_type, game_mode, max_participants, current_participants, entry_fee, prize_pool, start_date, end_date, registration_deadline, status, organizer_id, rules, requirements, created_at) VALUES
('بطولة الشرق الأوسط الكبرى 2024', 'البطولة الأكبر في المنطقة العربية لعام 2024، جوائز ضخمة ومنافسة شرسة بين أفضل اللاعبين', '/images/tournaments/middle-east-2024.jpg', 'single_elimination', 'Classic', 64, 32, 25.00, 5000.00, '2024-02-15 18:00:00', '2024-02-18 22:00:00', '2024-02-10 23:59:59', 'registration_open', 1, 'قوانين صارمة، ممنوع الغش، يجب استخدام الخرائط الرسمية فقط', 'مستوى متوسط أو أعلى، حساب مفعل، عدم وجود عقوبات', NOW()),
('كأس العشائر العربية', 'بطولة خاصة للعشائر العربية، كل عشيرة تختار أفضل لاعبيها للمنافسة', '/images/tournaments/arab-clans-cup.jpg', 'double_elimination', 'Clan Wars', 32, 16, 50.00, 8000.00, '2024-03-01 19:00:00', '2024-03-05 23:00:00', '2024-02-25 23:59:59', 'upcoming', 1, 'كل عشيرة تلعب بأفضل 3 لاعبين، نظام البو 3', 'عشيرة مسجلة، 10 أعضاء على الأقل، لا توجد عقوبات', NOW()),
('دوري المحترفين الأسبوعي', 'دوري أسبوعي للاعبين المحترفين، نقاط ترتيب وجوائز أسبوعية', '/images/tournaments/pro-weekly.jpg', 'round_robin', 'Competitive', 16, 8, 10.00, 800.00, '2024-01-20 20:00:00', '2024-01-21 23:00:00', '2024-01-19 23:59:59', 'in_progress', 1, 'مباريات سريعة، 20 دقيقة كحد أقصى للمباراة', 'رانك ذهبي أو أعلى، 50 مباراة على الأقل', NOW()),
('بطولة الناشئين', 'بطولة خاصة للاعبين الجدد لتطوير مهاراتهم والتنافس مع أقرانهم', '/images/tournaments/newcomers.jpg', 'single_elimination', 'Beginner', 32, 24, 5.00, 500.00, '2024-02-01 16:00:00', '2024-02-02 20:00:00', '2024-01-30 23:59:59', 'completed', 1, 'بطولة تعليمية، مساعدة من اللاعبين الخبراء', 'مستوى مبتدئ إلى متوسط، أقل من 6 أشهر خبرة', NOW()),
('كأس الأساطير', 'بطولة للاعبين الأساطير فقط، المعارك الأكثر إثارة وتشويقاً', '/images/tournaments/legends-cup.jpg', 'swiss', 'Masters', 8, 6, 100.00, 2000.00, '2024-03-20 21:00:00', '2024-03-21 23:59:59', '2024-03-18 23:59:59', 'upcoming', 1, 'أعلى مستوى من المنافسة، قوانين صارمة جداً', 'رانك ماستر أو أعلى، 500 مباراة على الأقل', NOW());

-- Insert tournament participants
INSERT INTO tournament_participants (tournament_id, user_id, clan_id, participant_type, registration_date, seed_number, status) VALUES
-- Middle East Championship participants
(1, 2, NULL, 'individual', '2024-01-15 10:00:00', 1, 'confirmed'),
(1, 3, NULL, 'individual', '2024-01-16 11:30:00', 2, 'confirmed'),
(1, 4, NULL, 'individual', '2024-01-17 14:15:00', 3, 'confirmed'),
(1, 5, NULL, 'individual', '2024-01-18 16:45:00', 4, 'confirmed'),
(1, 6, NULL, 'individual', '2024-01-19 09:20:00', 5, 'confirmed'),
(1, 7, NULL, 'individual', '2024-01-20 13:10:00', 6, 'confirmed'),
(1, 8, NULL, 'individual', '2024-01-21 15:30:00', 7, 'confirmed'),
-- Arab Clans Cup participants
(2, NULL, 1, 'clan', '2024-02-01 12:00:00', 1, 'confirmed'),
(2, NULL, 2, 'clan', '2024-02-02 14:30:00', 2, 'confirmed'),
(2, NULL, 3, 'clan', '2024-02-03 16:45:00', 3, 'confirmed'),
(2, NULL, 4, 'clan', '2024-02-04 18:15:00', 4, 'confirmed'),
-- Pro Weekly participants
(3, 2, NULL, 'individual', '2024-01-18 20:00:00', 1, 'confirmed'),
(3, 3, NULL, 'individual', '2024-01-19 10:30:00', 2, 'confirmed'),
(3, 4, NULL, 'individual', '2024-01-19 14:15:00', 3, 'confirmed'),
(3, 5, NULL, 'individual', '2024-01-19 16:45:00', 4, 'confirmed');

-- Insert forum categories
INSERT INTO forum_categories (name, description, icon, color, sort_order, is_active) VALUES
('الأخبار العامة', 'آخر الأخبار والتحديثات حول اللعبة والمجتمع', 'News', '#3B82F6', 1, TRUE),
('الاستراتيجيات والتكتيكات', 'مناقشة الاستراتيجيات والتكتيكات المختلفة في اللعبة', 'Strategy', '#10B981', 2, TRUE),
('العشائر والتجنيد', 'قسم خاص بالعشائر والبحث عن أعضاء جدد', 'Clans', '#F59E0B', 3, TRUE),
('البطولات والمسابقات', 'مناقشة البطولات والمسابقات الجارية والقادمة', 'Tournaments', '#EF4444', 4, TRUE),
('الدعم الفني', 'مساعدة في المشاكل التقنية والأخطاء', 'Support', '#8B5CF6', 5, TRUE),
('الدردشة العامة', 'مناقشات عامة ومحادثات حرة', 'Chat', '#6B7280', 6, TRUE);

-- Insert forum posts
INSERT INTO forum_posts (title, content, author_id, category_id, post_type, is_pinned, is_locked, view_count, reply_count, last_reply_at, last_reply_by, status, created_at) VALUES
('مرحباً بكم في منتدى ZH-Love!', 'أهلاً وسهلاً بجميع اللاعبين في منتدى ZH-Love الجديد! هنا يمكنكم مناقشة كل ما يتعلق بلعبة الجنرالات زيرو آور، تبادل الخبرات، والتواصل مع اللاعبين الآخرين.\n\nنتمنى لكم تجربة ممتعة ومفيدة!', 1, 1, 'announcement', TRUE, FALSE, 245, 12, '2024-01-15 14:30:00', 3, 'active', '2024-01-10 10:00:00'),
('أفضل الاستراتيجيات للجيش الأمريكي', 'السلام عليكم جميعاً\n\nأريد مناقشة أفضل الاستراتيجيات لاستخدام الجيش الأمريكي في المباريات المتقدمة. من خلال تجربتي، وجدت أن:\n\n1. البناء السريع للمطارات مهم جداً\n2. استخدام الدبابات كروسيدر في البداية\n3. التركيز على التكنولوجيا المتقدمة\n\nما رأيكم؟', 4, 2, 'discussion', FALSE, FALSE, 89, 7, '2024-01-14 16:20:00', 2, 'active', '2024-01-12 13:45:00'),
('البحث عن أعضاء جدد - الأسود العربية', 'عشيرة الأسود العربية تبحث عن أعضاء جدد!\n\nالمتطلبات:\n- مستوى متوسط أو أعلى\n- اللعب بانتظام\n- روح الفريق والتعاون\n- التواصل عبر الديسكورد\n\nللتسجيل راسلوني على الخاص أو اتصلوا بنا على الديسكورد.', 2, 3, 'discussion', FALSE, FALSE, 156, 15, '2024-01-13 19:45:00', 5, 'active', '2024-01-11 20:15:00'),
('بطولة الشرق الأوسط 2024 - التسجيل مفتوح!', 'إخواني الكرام، التسجيل مفتوح الآن لبطولة الشرق الأوسط الكبرى 2024!\n\nتفاصيل البطولة:\n- جائزة إجمالية: 5000 دولار\n- 64 لاعب\n- نظام الإقصاء المباشر\n- رسوم التسجيل: 25 دولار\n\nسارعوا بالتسجيل قبل انتهاء الموعد!', 1, 4, 'announcement', TRUE, FALSE, 312, 28, '2024-01-14 21:10:00', 6, 'active', '2024-01-08 15:30:00'),
('مشكلة في الاتصال بالخادم', 'السلام عليكم\n\nأواجه مشكلة في الاتصال بخادم اللعبة منذ أمس. هل يواجه أحدكم نفس المشكلة؟\n\nجربت:\n- إعادة تشغيل اللعبة\n- فحص الإنترنت\n- تشغيل اللعبة كمدير\n\nلا يزال لا يعمل. أي مساعدة؟', 7, 5, 'question', FALSE, FALSE, 67, 4, '2024-01-13 11:25:00', 8, 'active', '2024-01-12 09:15:00'),
('من هو اللاعب المفضل لديكم؟', 'أحبائي في المنتدى، أريد أن أعرف من هو اللاعب المحترف المفضل لديكم في عالم الجنرالات؟\n\nشخصياً أحب أسلوب اللعب التكتيكي والاستراتيجي، وأتابع عدة لاعبين محترفين على اليوتيوب.\n\nشاركوا آرائكم!', 6, 6, 'discussion', FALSE, FALSE, 123, 18, '2024-01-14 17:40:00', 4, 'active', '2024-01-10 12:20:00');

-- Insert forum replies
INSERT INTO forum_replies (post_id, author_id, content, parent_reply_id, status, created_at) VALUES
-- Replies to welcome post
(1, 3, 'أهلاً وسهلاً! سعيد بوجود منتدى متخصص للعبة أخيراً. شكراً على الجهود المبذولة!', NULL, 'active', '2024-01-10 12:30:00'),
(1, 4, 'مرحباً بالجميع! أتطلع للمشاركة في المناقشات والبطولات.', NULL, 'active', '2024-01-10 15:45:00'),
(1, 5, 'شكراً لكم على إنشاء هذا المنتدى الرائع!', NULL, 'active', '2024-01-11 09:15:00'),
-- Replies to USA strategy post
(2, 2, 'استراتيجية ممتازة! أضيف أن استخدام الطائرات الاستطلاعية مهم جداً في البداية.', NULL, 'active', '2024-01-12 16:20:00'),
(2, 3, 'أتفق معك، لكن أعتقد أن التركيز على الاقتصاد أولى من التكنولوجيا.', NULL, 'active', '2024-01-13 10:30:00'),
(2, 5, 'جربت هذه الاستراتيجية وحققت نتائج ممتازة! شكراً لك.', NULL, 'active', '2024-01-13 14:45:00'),
-- Replies to clan recruitment post
(3, 4, 'عشيرة ممتازة! أتمنى لكم التوفيق في إيجاد أعضاء جدد.', NULL, 'active', '2024-01-12 08:30:00'),
(3, 6, 'مهتم بالانضمام، كيف يمكنني التواصل معكم؟', NULL, 'active', '2024-01-12 14:15:00'),
(3, 2, 'يمكنك التواصل معنا عبر الديسكورد، الرابط في وصف العشيرة.', 8, 'active', '2024-01-12 16:45:00'),
-- Replies to tournament post
(4, 2, 'بطولة رائعة! مسجل بالفعل وأتطلع للمنافسة.', NULL, 'active', '2024-01-09 18:20:00'),
(4, 3, 'الجوائز مغرية جداً، سأشارك حتماً!', NULL, 'active', '2024-01-10 11:30:00'),
(4, 5, 'متى سيتم الإعلان عن جدول المباريات؟', NULL, 'active', '2024-01-11 13:45:00'),
-- Replies to connection problem
(5, 8, 'واجهت نفس المشكلة، جرب تغيير DNS إلى 8.8.8.8', NULL, 'active', '2024-01-12 10:45:00'),
(5, 2, 'تأكد من إعدادات الجدار الناري، قد يكون يحجب الاتصال.', NULL, 'active', '2024-01-12 14:20:00'),
-- Replies to favorite player post
(6, 3, 'أحب مشاهدة الفيديوهات التعليمية، تساعد كثيراً في تطوير الأداء.', NULL, 'active', '2024-01-11 09:30:00'),
(6, 4, 'بالنسبة لي، أفضل اللاعبين الذين يركزون على الاستراتيجية أكثر من السرعة.', NULL, 'active', '2024-01-11 16:15:00'),
(6, 7, 'أنصح بمتابعة القنوات العربية، فيها شروحات ممتازة.', NULL, 'active', '2024-01-12 12:40:00');

-- Insert replays
INSERT INTO replays (title, description, uploader_id, file_path, file_size, thumbnail_url, game_mode, map_name, duration, players, tags, download_count, rating_average, rating_count, status, created_at) VALUES
('معركة ملحمية - GLA ضد USA', 'معركة طويلة ومثيرة بين جيش التحرير العالمي والجيش الأمريكي على خريطة الصحراء الكبرى. استراتيجيات متقدمة وتكتيكات رائعة من الطرفين.', 3, '/uploads/replays/gla-vs-usa-epic.rep', 2048576, '/images/replays/gla-vs-usa-thumb.jpg', 'Classic 1v1', 'Desert Fury', 1800, 'GLA_Master vs USA_Commander', 'gla,usa,desert,strategy,1v1', 156, 4.5, 23, 'active', '2024-01-10 14:30:00'),
('كيفية استخدام الطائرات الصينية', 'ريبلاي تعليمي يوضح كيفية استخدام الطائرات الصينية بشكل فعال في المعارك. مناسب للمبتدئين والمتوسطين.', 5, '/uploads/replays/china-air-tutorial.rep', 1536789, '/images/replays/china-air-thumb.jpg', 'Training', 'Tournament Arena', 1200, 'China_General vs AI', 'china,tutorial,aircraft,training', 89, 4.2, 15, 'active', '2024-01-12 16:45:00'),
('أسرع انتصار في التاريخ!', 'انتصار سريع ومذهل في أقل من 5 دقائق! شاهد كيف تم تحقيق هذا الإنجاز الرائع باستخدام تكتيكات الهجوم السريع.', 2, '/uploads/replays/fastest-victory.rep', 512345, '/images/replays/fastest-victory-thumb.jpg', 'Blitz', 'Urban Combat', 300, 'ZH_Legend vs Pro_Gamer', 'speed,blitz,fast,victory', 234, 4.7, 45, 'active', '2024-01-14 09:15:00'),
('دفاع أسطوري ضد هجوم جماعي', 'دفاع رائع ضد هجوم جماعي من 3 لاعبين! استراتيجيات دفاعية متقدمة وإدارة موارد ممتازة.', 4, '/uploads/replays/legendary-defense.rep', 3072456, '/images/replays/legendary-defense-thumb.jpg', '1v3 Defense', 'Fortress Valley', 2400, 'USA_Commander vs Multiple', 'defense,1v3,fortress,strategy', 167, 4.8, 38, 'active', '2024-01-11 18:20:00'),
('نهائي بطولة العشائر', 'المباراة النهائية لبطولة العشائر العربية بين الأسود العربية ومحاربي الصحراء. مباراة تاريخية لا تفوت!', 1, '/uploads/replays/clan-final.rep', 4096789, '/images/replays/clan-final-thumb.jpg', 'Clan War', 'Championship Map', 3600, 'Arab Lions vs Desert Warriors', 'clan,final,tournament,championship', 445, 4.9, 78, 'active', '2024-01-08 20:30:00');

-- Insert streamers
INSERT INTO streamers (user_id, platform, channel_id, channel_name, channel_url, avatar_url, banner_url, subscriber_count, video_count, view_count, description, is_verified, is_active, last_sync, created_at) VALUES
(2, 'youtube', 'UC123456789', 'ZH Legend Gaming', 'https://youtube.com/c/ZHLegendGaming', '/images/streamers/zh-legend-avatar.jpg', '/images/streamers/zh-legend-banner.jpg', 25400, 156, 1250000, 'قناة متخصصة في لعبة الجنرالات زيرو آور، شروحات، استراتيجيات، ومباريات مباشرة', TRUE, TRUE, '2024-01-14 10:00:00', '2024-01-05 15:30:00'),
(3, 'youtube', 'UC987654321', 'GLA Master Pro', 'https://youtube.com/c/GLAMasterPro', '/images/streamers/gla-master-avatar.jpg', '/images/streamers/gla-master-banner.jpg', 18200, 89, 850000, 'خبير في فصيل جيش التحرير العالمي، تكتيكات متقدمة ومعارك ملحمية', TRUE, TRUE, '2024-01-14 12:30:00', '2024-01-07 10:15:00'),
(4, 'youtube', 'UC456789123', 'USA Commander', 'https://youtube.com/c/USACommander', '/images/streamers/usa-commander-avatar.jpg', '/images/streamers/usa-commander-banner.jpg', 12800, 67, 620000, 'متخصص في الجيش الأمريكي، استراتيجيات الدفاع والهجوم المتوازن', FALSE, TRUE, '2024-01-14 14:45:00', '2024-01-10 08:45:00'),
(5, 'youtube', 'UC789123456', 'China General TV', 'https://youtube.com/c/ChinaGeneralTV', '/images/streamers/china-general-avatar.jpg', '/images/streamers/china-general-banner.jpg', 15600, 94, 750000, 'قناة الجنرال الصيني، تكتيكات الأسلحة النووية والدبابات الثقيلة', TRUE, TRUE, '2024-01-14 16:20:00', '2024-01-03 12:20:00'),
(6, 'youtube', 'UC321654987', 'Desert Warrior', 'https://youtube.com/c/DesertWarrior', '/images/streamers/desert-warrior-avatar.jpg', '/images/streamers/desert-warrior-banner.jpg', 9800, 45, 420000, 'محارب الصحراء، معارك الخرائط الصحراوية والتكتيكات الخاصة', FALSE, TRUE, '2024-01-14 18:10:00', '2024-01-12 14:30:00');

-- Insert rankings
INSERT INTO rankings (user_id, season, rank_tier, rank_points, wins, losses, winrate, peak_rank_points, last_match_date, created_at) VALUES
(2, '2024-Season1', 'Grandmaster', 4500, 140, 40, 77.78, 4650, '2024-01-14 20:30:00', '2024-01-01 00:00:00'),
(3, '2024-Season1', 'Master', 4200, 120, 40, 75.00, 4300, '2024-01-14 19:15:00', '2024-01-01 00:00:00'),
(4, '2024-Season1', 'Master', 3800, 100, 40, 71.43, 3900, '2024-01-14 18:45:00', '2024-01-01 00:00:00'),
(5, '2024-Season1', 'Diamond', 3600, 80, 40, 66.67, 3700, '2024-01-14 17:20:00', '2024-01-01 00:00:00'),
(6, '2024-Season1', 'Diamond', 3400, 70, 40, 63.64, 3500, '2024-01-14 16:30:00', '2024-01-01 00:00:00'),
(7, '2024-Season1', 'Platinum', 3200, 65, 35, 65.00, 3300, '2024-01-14 15:45:00', '2024-01-01 00:00:00'),
(8, '2024-Season1', 'Platinum', 3000, 60, 30, 66.67, 3100, '2024-01-14 14:15:00', '2024-01-01 00:00:00');

-- Insert some sample matches
INSERT INTO matches (tournament_id, round_number, match_number, player1_id, player2_id, clan1_id, clan2_id, match_type, winner_id, winner_clan_id, score_player1, score_player2, match_date, status, replay_url, notes, created_at) VALUES
(3, 1, 1, 2, 3, NULL, NULL, 'individual', 2, NULL, 2, 1, '2024-01-20 20:00:00', 'completed', '/uploads/replays/match1.rep', 'مباراة ممتازة، استراتيجيات رائعة من الطرفين', '2024-01-20 19:30:00'),
(3, 1, 2, 4, 5, NULL, NULL, 'individual', 4, NULL, 2, 0, '2024-01-20 20:30:00', 'completed', '/uploads/replays/match2.rep', 'فوز ساحق للجيش الأمريكي', '2024-01-20 20:00:00'),
(3, 2, 1, 2, 4, NULL, NULL, 'individual', 2, NULL, 2, 1, '2024-01-21 20:00:00', 'completed', '/uploads/replays/match3.rep', 'نهائي مثير وممتع', '2024-01-21 19:30:00'),
(1, 1, 1, 2, 7, NULL, NULL, 'individual', 2, NULL, 1, 0, '2024-02-15 18:00:00', 'scheduled', NULL, NULL, '2024-02-10 15:00:00'),
(1, 1, 2, 3, 8, NULL, NULL, 'individual', NULL, NULL, 0, 0, '2024-02-15 18:30:00', 'scheduled', NULL, NULL, '2024-02-10 15:30:00'),
(2, 1, 1, NULL, NULL, 1, 2, 'clan', NULL, NULL, 0, 0, '2024-03-01 19:00:00', 'scheduled', NULL, NULL, '2024-02-25 12:00:00'); 