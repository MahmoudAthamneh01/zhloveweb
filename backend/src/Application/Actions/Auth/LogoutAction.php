<?php

declare(strict_types=1);

namespace App\Application\Actions\Auth;

use App\Application\Actions\Action;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Log\LoggerInterface;

class LogoutAction extends Action
{
    public function __construct(LoggerInterface $logger)
    {
        parent::__construct($logger);
    }

    protected function action(): Response
    {
        // Since we're using JWT tokens, we don't need to do anything server-side
        // The client should remove the token from localStorage/sessionStorage
        // In a more advanced implementation, you might want to maintain a blacklist of tokens
        
        return $this->respondWithData([
            'message' => 'Successfully logged out'
        ]);
    }
} 