<?php

declare(strict_types=1);

namespace App\Application\Actions;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Log\LoggerInterface;
use Slim\Exception\HttpBadRequestException;
use Slim\Exception\HttpNotFoundException;

abstract class Action
{
    protected LoggerInterface $logger;
    protected Request $request;
    protected Response $response;
    protected array $args;

    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    public function __invoke(Request $request, Response $response, array $args): Response
    {
        $this->request = $request;
        $this->response = $response;
        $this->args = $args;

        try {
            return $this->action();
        } catch (\Exception $e) {
            $this->logger->error($e->getMessage());
            
            return $this->respondWithError('Internal server error', 500);
        }
    }

    abstract protected function action(): Response;

    protected function getFormData(): array
    {
        return $this->request->getParsedBody() ?? [];
    }

    protected function getQueryParams(): array
    {
        return $this->request->getQueryParams();
    }

    protected function resolveArg(string $name): mixed
    {
        if (!isset($this->args[$name])) {
            throw new HttpBadRequestException($this->request, "Could not resolve argument `{$name}`.");
        }

        return $this->args[$name];
    }

    protected function respondWithData(array $data = null, int $statusCode = 200): Response
    {
        $payload = [
            'success' => true,
            'data' => $data,
        ];

        return $this->respond($payload, $statusCode);
    }

    protected function respondWithError(string $message, int $statusCode = 400): Response
    {
        $payload = [
            'success' => false,
            'error' => $message,
        ];

        return $this->respond($payload, $statusCode);
    }

    protected function respond(array $payload, int $statusCode = 200): Response
    {
        $json = json_encode($payload, JSON_PRETTY_PRINT);
        $this->response->getBody()->write($json);
        
        return $this->response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($statusCode);
    }

    protected function getCurrentUser(): ?array
    {
        return $this->request->getAttribute('user');
    }

    protected function getCurrentUserId(): ?int
    {
        $user = $this->getCurrentUser();
        return $user ? (int) $user['user']['id'] : null;
    }

    protected function isAuthenticated(): bool
    {
        return $this->getCurrentUser() !== null;
    }

    protected function requireAuthentication(): void
    {
        if (!$this->isAuthenticated()) {
            throw new HttpNotFoundException($this->request, 'Authentication required');
        }
    }
} 