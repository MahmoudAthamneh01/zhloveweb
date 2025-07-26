<?php

declare(strict_types=1);

namespace App\Application\Actions\Auth;

use App\Application\Actions\Action;
use App\Domain\User\UserRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Log\LoggerInterface;

class ResetPasswordAction extends Action
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

        $required = ['token', 'password', 'password_confirmation'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                return $this->respondWithError("Field {$field} is required", 400);
            }
        }

        $token = $data['token'];
        $password = $data['password'];
        $passwordConfirmation = $data['password_confirmation'];

        // Validate password
        if (strlen($password) < 8) {
            return $this->respondWithError('Password must be at least 8 characters long', 400);
        }

        if ($password !== $passwordConfirmation) {
            return $this->respondWithError('Passwords do not match', 400);
        }

        // In a real implementation, you would:
        // 1. Verify the reset token
        // 2. Check if it's not expired
        // 3. Find the user by token
        // 4. Update the password
        // 5. Invalidate the token

        // For now, we'll just return success
        return $this->respondWithData([
            'message' => 'Password reset successful'
        ]);
    }
} 