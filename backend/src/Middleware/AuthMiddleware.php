<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Services\AuthService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface as Middleware;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Exception\HttpUnauthorizedException;
use Slim\Psr7\Response as SlimResponse;

class AuthMiddleware implements Middleware
{
    private AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function process(Request $request, RequestHandler $handler): Response
    {
        $token = $this->extractToken($request);

        if (!$token) {
            return $this->unauthorizedResponse('Authorization token required');
        }

        try {
            $payload = $this->authService->verifyToken($token);
            
            // Add user info to request attributes
            $request = $request->withAttribute('user_id', $payload['user_id']);
            $request = $request->withAttribute('user_payload', $payload);
            
            // Continue to next middleware/controller
            return $handler->handle($request);
            
        } catch (\Exception $e) {
            return $this->unauthorizedResponse('Invalid or expired token');
        }
    }

    private function extractToken(Request $request): ?string
    {
        $header = $request->getHeaderLine('Authorization');
        
        if (preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
            return $matches[1];
        }

        // Check for token in query parameters (for WebSocket connections, etc.)
        $queryParams = $request->getQueryParams();
        if (isset($queryParams['token'])) {
            return $queryParams['token'];
        }

        return null;
    }

    private function unauthorizedResponse(string $message): Response
    {
        $response = new SlimResponse();
        $response->getBody()->write(json_encode([
            'success' => false,
            'error' => [
                'type' => 'UNAUTHENTICATED',
                'description' => $message,
            ],
            'timestamp' => date('c'),
        ]));

        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(401);
    }
} 