<?php

declare(strict_types=1);

namespace App\Application\Actions\User;

use App\Application\Actions\Action;
use App\Domain\User\UserRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Log\LoggerInterface;

class ListUsersAction extends Action
{
    private UserRepository $userRepository;

    public function __construct(LoggerInterface $logger, UserRepository $userRepository)
    {
        parent::__construct($logger);
        $this->userRepository = $userRepository;
    }

    protected function action(): Response
    {
        $queryParams = $this->getQueryParams();
        
        $page = max(1, (int) ($queryParams['page'] ?? 1));
        $limit = min(100, max(1, (int) ($queryParams['limit'] ?? 20)));
        $search = $queryParams['search'] ?? '';
        
        $offset = ($page - 1) * $limit;
        
        if (!empty($search)) {
            $users = $this->userRepository->search($search);
            $total = count($users);
            $users = array_slice($users, $offset, $limit);
        } else {
            $users = $this->userRepository->findPaginated($limit, $offset);
            $total = $this->userRepository->count();
        }
        
        $usersData = array_map(function($user) {
            return $user->jsonSerialize();
        }, $users);
        
        return $this->respondWithData([
            'users' => $usersData,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit),
            ]
        ]);
    }
} 