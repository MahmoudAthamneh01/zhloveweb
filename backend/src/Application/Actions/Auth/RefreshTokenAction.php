<?php

declare(strict_types=1);

namespace App\Application\Actions\Auth;

use App\Application\Actions\Action;
use App\Application\Settings\SettingsInterface;
use App\Domain\User\UserRepository;
use Firebase\JWT\JWT;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Log\LoggerInterface;

class RefreshTokenAction extends Action
{
    private UserRepository $userRepository;
    private SettingsInterface $settings;

    public function __construct(LoggerInterface $logger, UserRepository $userRepository, SettingsInterface $settings)
    {
        parent::__construct($logger);
        $this->userRepository = $userRepository;
        $this->settings = $settings;
    }

    protected function action(): Response
    {
        $this->requireAuthentication();

        $userId = $this->getCurrentUserId();
        
        try {
            $user = $this->userRepository->findUserOfId($userId);
            
            // Generate new JWT token
            $payload = [
                'iss' => 'zh-love-api',
                'sub' => $user->getId(),
                'iat' => time(),
                'exp' => time() + $this->settings->get('jwt.expire_time'),
                'user' => [
                    'id' => $user->getId(),
                    'uuid' => $user->getUuid(),
                    'username' => $user->getUsername(),
                    'email' => $user->getEmail(),
                    'role' => $user->getRole(),
                ]
            ];

            $token = JWT::encode($payload, $this->settings->get('jwt.secret'), $this->settings->get('jwt.algorithm'));

            return $this->respondWithData([
                'token' => $token,
                'user' => $user->jsonSerialize(),
                'expires_at' => date('c', time() + $this->settings->get('jwt.expire_time')),
            ]);
        } catch (\Exception $e) {
            return $this->respondWithError('User not found', 404);
        }
    }
} 