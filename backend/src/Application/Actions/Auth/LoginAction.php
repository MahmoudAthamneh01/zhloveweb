<?php

declare(strict_types=1);

namespace App\Application\Actions\Auth;

use App\Application\Actions\Action;
use App\Application\Settings\SettingsInterface;
use App\Domain\User\UserRepository;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Log\LoggerInterface;

class LoginAction extends Action
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
        $data = $this->getFormData();

        if (!isset($data['email']) || !isset($data['password'])) {
            return $this->respondWithError('Email and password are required', 400);
        }

        $email = $data['email'];
        $password = $data['password'];

        // Validate input
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->respondWithError('Invalid email format', 400);
        }

        if (empty($password)) {
            return $this->respondWithError('Password is required', 400);
        }

        // Authenticate user
        $user = $this->userRepository->authenticate($email, $password);
        
        if (!$user) {
            return $this->respondWithError('Invalid credentials', 401);
        }

        if (!$user->isActive()) {
            return $this->respondWithError('Account is not active', 401);
        }

        // Generate JWT token
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

        // Update last login
        $reflection = new \ReflectionClass($user);
        $lastLoginProperty = $reflection->getProperty('lastLogin');
        $lastLoginProperty->setAccessible(true);
        $lastLoginProperty->setValue($user, new \DateTime());
        
        $this->userRepository->updateUser($user);

        return $this->respondWithData([
            'token' => $token,
            'user' => $user->jsonSerialize(),
            'expires_at' => date('c', time() + $this->settings->get('jwt.expire_time')),
        ]);
    }
} 