<?php

declare(strict_types=1);

namespace App\Application\Actions\Auth;

use App\Application\Actions\Action;
use App\Domain\User\UserRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Log\LoggerInterface;

class ForgotPasswordAction extends Action
{
    private UserRepository $userRepository;

    public function __construct(LoggerInterface $logger, UserRepository $userRepository)
    {
        parent::__construct($logger);
        $this->userRepository = $userRepository;
    }

    protected function action(): Response
    {
        $data = $this->getFormData();

        if (!isset($data['email']) || empty($data['email'])) {
            return $this->respondWithError('Email is required', 400);
        }

        $email = $data['email'];

        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->respondWithError('Invalid email format', 400);
        }

        // Check if user exists
        try {
            $user = $this->userRepository->findUserOfEmail($email);
            
            // In a real implementation, you would:
            // 1. Generate a password reset token
            // 2. Store it in the database with expiration
            // 3. Send email with reset link
            
            // For now, we'll just return success
            return $this->respondWithData([
                'message' => 'Password reset instructions sent to your email'
            ]);
        } catch (\Exception $e) {
            // Don't reveal if the email exists or not for security
            return $this->respondWithData([
                'message' => 'Password reset instructions sent to your email'
            ]);
        }
    }
} 