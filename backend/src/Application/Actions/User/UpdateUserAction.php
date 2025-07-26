<?php

declare(strict_types=1);

namespace App\Application\Actions\User;

use App\Application\Actions\Action;
use App\Domain\User\UserRepository;
use App\Domain\User\UserNotFoundException;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Log\LoggerInterface;

class UpdateUserAction extends Action
{
    private UserRepository $userRepository;

    public function __construct(LoggerInterface $logger, UserRepository $userRepository)
    {
        parent::__construct($logger);
        $this->userRepository = $userRepository;
    }

    protected function action(): Response
    {
        $this->requireAuthentication();
        
        $userId = (int) $this->resolveArg('id');
        $currentUserId = $this->getCurrentUserId();
        
        // Users can only update their own profile (unless admin)
        if ($userId !== $currentUserId && !$this->isAdmin()) {
            return $this->respondWithError('Access denied', 403);
        }
        
        $data = $this->getFormData();
        
        try {
            $user = $this->userRepository->findUserOfId($userId);
            
            // Update allowed fields
            $reflection = new \ReflectionClass($user);
            
            if (isset($data['firstName'])) {
                $firstNameProperty = $reflection->getProperty('firstName');
                $firstNameProperty->setAccessible(true);
                $firstNameProperty->setValue($user, $data['firstName']);
            }
            
            if (isset($data['lastName'])) {
                $lastNameProperty = $reflection->getProperty('lastName');
                $lastNameProperty->setAccessible(true);
                $lastNameProperty->setValue($user, $data['lastName']);
            }
            
            if (isset($data['bio'])) {
                $bioProperty = $reflection->getProperty('bio');
                $bioProperty->setAccessible(true);
                $bioProperty->setValue($user, $data['bio']);
            }
            
            if (isset($data['country'])) {
                $countryProperty = $reflection->getProperty('country');
                $countryProperty->setAccessible(true);
                $countryProperty->setValue($user, $data['country']);
            }
            
            if (isset($data['avatarUrl'])) {
                $avatarUrlProperty = $reflection->getProperty('avatarUrl');
                $avatarUrlProperty->setAccessible(true);
                $avatarUrlProperty->setValue($user, $data['avatarUrl']);
            }
            
            // Update password if provided
            if (isset($data['password']) && !empty($data['password'])) {
                if (strlen($data['password']) < 8) {
                    return $this->respondWithError('Password must be at least 8 characters long', 400);
                }
                
                $passwordHashProperty = $reflection->getProperty('passwordHash');
                $passwordHashProperty->setAccessible(true);
                $passwordHashProperty->setValue($user, password_hash($data['password'], PASSWORD_ARGON2ID));
            }
            
            // Update updated_at timestamp
            $updatedAtProperty = $reflection->getProperty('updatedAt');
            $updatedAtProperty->setAccessible(true);
            $updatedAtProperty->setValue($user, new \DateTime());
            
            $updatedUser = $this->userRepository->updateUser($user);
            
            return $this->respondWithData($updatedUser->jsonSerialize());
        } catch (UserNotFoundException $e) {
            return $this->respondWithError('User not found', 404);
        }
    }
    
    private function isAdmin(): bool
    {
        $user = $this->getCurrentUser();
        return $user && $user['user']['role'] === 'admin';
    }
} 