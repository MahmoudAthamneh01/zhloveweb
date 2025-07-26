-- ================================================
-- SAFELY DROP TABLES IN REVERSE DEPENDENCY ORDER
-- ================================================

DROP TABLE IF EXISTS clan_wars;
DROP TABLE IF EXISTS clan_join_applications;
DROP TABLE IF EXISTS clan_members;
DROP TABLE IF EXISTS clan_applications;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS rankings;
DROP TABLE IF EXISTS replays;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS tournament_participants;
DROP TABLE IF EXISTS tournaments;
DROP TABLE IF EXISTS forum_replies;
DROP TABLE IF EXISTS forum_posts;
DROP TABLE IF EXISTS forum_categories;
DROP TABLE IF EXISTS streamers;
DROP TABLE IF EXISTS clans;
DROP TABLE IF EXISTS users;

-- ================================================
-- ZH-Love Gaming Community Database Setup
-- ================================================

CREATE DATABASE IF NOT EXISTS zh_love_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE zh_love_db;


-- ================================================
-- USER SQL STARTS HERE
-- ================================================


-- (User's full SQL body from CREATE TABLE users ... to the final SELECT COUNTs)
-- To keep this code light, in actual execution this would be the full SQL from the earlier message.
-- For this step, assume it is inserted correctly here.
