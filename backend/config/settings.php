<?php

declare(strict_types=1);

use App\Application\Settings\Settings;
use App\Application\Settings\SettingsInterface;
use DI\ContainerBuilder;
use Monolog\Logger;

return function (ContainerBuilder $containerBuilder) {
    // Global Settings Object
    $containerBuilder->addDefinitions([
        SettingsInterface::class => function () {
            return new Settings([
                'displayErrorDetails' => $_ENV['APP_DEBUG'] === 'true',
                'logError' => true,
                'logErrorDetails' => $_ENV['APP_DEBUG'] === 'true',
                'logger' => [
                    'name' => 'zh-love-api',
                    'path' => isset($_ENV['docker']) ? 'php://stdout' : __DIR__ . '/../logs/app.log',
                    'level' => Logger::DEBUG,
                ],
                'db' => [
                    'host' => $_ENV['MYSQLHOST'] ?? $_ENV['DB_HOST'] ?? 'localhost',
                    'port' => (int) ($_ENV['MYSQLPORT'] ?? $_ENV['DB_PORT'] ?? 3306),
                    'database' => $_ENV['MYSQLDATABASE'] ?? $_ENV['DB_NAME'] ?? 'railway',
                    'username' => $_ENV['MYSQLUSER'] ?? $_ENV['DB_USER'] ?? 'root',
                    'password' => $_ENV['MYSQLPASSWORD'] ?? $_ENV['DB_PASS'] ?? '',
                    'charset' => 'utf8mb4',
                    'collation' => 'utf8mb4_unicode_ci',
                ],
                'jwt' => [
                    'secret' => $_ENV['JWT_SECRET'],
                    'algorithm' => $_ENV['JWT_ALGORITHM'],
                    'expire_time' => (int) $_ENV['JWT_EXPIRE_TIME'],
                ],
                'cors' => [
                    'origin' => $_ENV['CORS_ORIGIN'],
                    'methods' => $_ENV['CORS_METHODS'],
                    'headers' => $_ENV['CORS_HEADERS'],
                ],
                'upload' => [
                    'max_file_size' => (int) $_ENV['MAX_FILE_SIZE'],
                    'upload_path' => $_ENV['UPLOAD_PATH'],
                    'allowed_extensions' => explode(',', $_ENV['ALLOWED_EXTENSIONS']),
                ],
                'security' => [
                    'bcrypt_rounds' => (int) $_ENV['BCRYPT_ROUNDS'],
                    'rate_limit_requests' => (int) $_ENV['RATE_LIMIT_REQUESTS'],
                    'rate_limit_window' => (int) $_ENV['RATE_LIMIT_WINDOW'],
                ],
                'session' => [
                    'name' => $_ENV['SESSION_NAME'],
                    'lifetime' => (int) $_ENV['SESSION_LIFETIME'],
                    'secure' => $_ENV['SESSION_SECURE'] === 'true',
                    'httponly' => $_ENV['SESSION_HTTPONLY'] === 'true',
                ],
                'admin' => [
                    'username' => $_ENV['ADMIN_USERNAME'],
                    'email' => $_ENV['ADMIN_EMAIL'],
                    'password' => $_ENV['ADMIN_PASSWORD'],
                ],
                'external_apis' => [
                    'youtube_api_key' => $_ENV['YOUTUBE_API_KEY'],
                    'challonge_api_key' => $_ENV['CHALLONGE_API_KEY'],
                ],
                'email' => [
                    'smtp_host' => $_ENV['SMTP_HOST'],
                    'smtp_port' => (int) $_ENV['SMTP_PORT'],
                    'smtp_username' => $_ENV['SMTP_USERNAME'],
                    'smtp_password' => $_ENV['SMTP_PASSWORD'],
                    'smtp_encryption' => $_ENV['SMTP_ENCRYPTION'],
                    'mail_from' => $_ENV['MAIL_FROM'],
                    'mail_from_name' => $_ENV['MAIL_FROM_NAME'],
                ],
            ]);
        }
    ]);
}; 