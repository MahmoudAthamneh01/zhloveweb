<?php

declare(strict_types=1);

namespace App\Application\Actions\User;

use App\Application\Actions\Action;
use App\Domain\User\UserRepository;
use App\Domain\User\UserNotFoundException;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Log\LoggerInterface;

class ViewUserAction extends Action
{
    private UserRepository $userRepository;

    public function __construct(LoggerInterface $logger, UserRepository $userRepository)
    {
        parent::__construct($logger);
        $this->userRepository = $userRepository;
    }

    protected function action(): Response
    {
        $userId = (int) $this->resolveArg('id');
        
        try {
            $user = $this->userRepository->findUserOfId($userId);
            return $this->respondWithData($user->jsonSerialize());
        } catch (UserNotFoundException $e) {
            return $this->respondWithError('User not found', 404);
        }
    }
} 