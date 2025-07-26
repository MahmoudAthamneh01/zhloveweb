<?php

declare(strict_types=1);

namespace App\Application\Actions\Auth;

use App\Application\Actions\Action;
use App\Domain\User\UserRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Log\LoggerInterface;

class MeAction extends Action
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

        $userId = $this->getCurrentUserId();
        
        try {
            $user = $this->userRepository->findUserOfId($userId);
            return $this->respondWithData($user->jsonSerialize());
        } catch (\Exception $e) {
            return $this->respondWithError('User not found', 404);
        }
    }
} 