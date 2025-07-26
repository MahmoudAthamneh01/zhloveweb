<?php

declare(strict_types=1);

namespace App\Application\Actions\Auth;

use App\Application\Actions\Action;
use App\Application\Settings\SettingsInterface;
use App\Domain\User\User;
use App\Domain\User\UserRepository;
use Firebase\JWT\JWT;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Log\LoggerInterface;
use Ramsey\Uuid\Uuid;

class RegisterAction extends Action
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

        // Validate required fields
        $required = ['username', 'email', 'password', 'firstName', 'lastName'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return $this->respondWithError("Field {$field} is required", 400);
            }
        }

        $username = $data['username'];
        $email = $data['email'];
        $password = $data['password'];
        $firstName = $data['firstName'];
        $lastName = $data['lastName'];
        $country = $data['country'] ?? null;
        $bio = $data['bio'] ?? null;

        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->respondWithError('Invalid email format', 400);
        }

        // Validate password strength
        if (strlen($password) < 8) {
            return $this->respondWithError('Password must be at least 8 characters long', 400);
        }

        // Validate username
        if (strlen($username) < 3 || strlen($username) > 50) {
            return $this->respondWithError('Username must be between 3 and 50 characters', 400);
        }

        if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
            return $this->respondWithError('Username can only contain letters, numbers, and underscores', 400);
        }

        // Check if email already exists
        if ($this->userRepository->emailExists($email)) {
            return $this->respondWithError('Email already exists', 400);
        }

        // Check if username already exists
        if ($this->userRepository->usernameExists($username)) {
            return $this->respondWithError('Username already exists', 400);
        }

        // Create user
        $user = new User(
            null,
            Uuid::uuid4()->toString(),
            $username,
            $email,
            password_hash($password, PASSWORD_ARGON2ID),
            $firstName,
            $lastName,
            null, // avatar_url
            $bio,
            $country,
            0, // rank_points
            1, // level
            0, // experience_points
            0, // total_matches
            0, // wins
            0, // losses
            'user', // role
            'active', // status
            false, // email_verified
            null, // last_login
            new \DateTime(), // created_at
            new \DateTime()  // updated_at
        );

        $createdUser = $this->userRepository->createUser($user);

        // Generate JWT token
        $payload = [
            'iss' => 'zh-love-api',
            'sub' => $createdUser->getId(),
            'iat' => time(),
            'exp' => time() + $this->settings->get('jwt.expire_time'),
            'user' => [
                'id' => $createdUser->getId(),
                'uuid' => $createdUser->getUuid(),
                'username' => $createdUser->getUsername(),
                'email' => $createdUser->getEmail(),
                'role' => $createdUser->getRole(),
            ]
        ];

        $token = JWT::encode($payload, $this->settings->get('jwt.secret'), $this->settings->get('jwt.algorithm'));

        return $this->respondWithData([
            'token' => $token,
            'user' => $createdUser->jsonSerialize(),
            'expires_at' => date('c', time() + $this->settings->get('jwt.expire_time')),
        ], 201);
    }
} 