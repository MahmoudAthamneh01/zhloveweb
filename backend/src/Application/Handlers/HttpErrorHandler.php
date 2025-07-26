<?php

declare(strict_types=1);

namespace App\Application\Handlers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Log\LoggerInterface;
use Slim\Exception\HttpBadRequestException;
use Slim\Exception\HttpException;
use Slim\Exception\HttpForbiddenException;
use Slim\Exception\HttpMethodNotAllowedException;
use Slim\Exception\HttpNotFoundException;
use Slim\Exception\HttpNotImplementedException;
use Slim\Exception\HttpUnauthorizedException;
use Slim\Handlers\ErrorHandler as SlimErrorHandler;
use Throwable;

class HttpErrorHandler extends SlimErrorHandler
{
    /**
     * @inheritdoc
     */
    protected function respond(): Response
    {
        $exception = $this->exception;
        $statusCode = 500;
        $error = [
            'type' => 'SERVER_ERROR',
            'description' => 'An internal error has occurred while processing your request.',
        ];

        if ($exception instanceof HttpException) {
            $statusCode = $exception->getCode();
            $error['description'] = $exception->getMessage();

            if ($exception instanceof HttpNotFoundException) {
                $error['type'] = 'RESOURCE_NOT_FOUND';
            } elseif ($exception instanceof HttpMethodNotAllowedException) {
                $error['type'] = 'METHOD_NOT_ALLOWED';
            } elseif ($exception instanceof HttpUnauthorizedException) {
                $error['type'] = 'UNAUTHENTICATED';
            } elseif ($exception instanceof HttpForbiddenException) {
                $error['type'] = 'INSUFFICIENT_PRIVILEGES';
            } elseif ($exception instanceof HttpBadRequestException) {
                $error['type'] = 'BAD_REQUEST';
            } elseif ($exception instanceof HttpNotImplementedException) {
                $error['type'] = 'NOT_IMPLEMENTED';
            }
        }

        if (
            !($exception instanceof HttpException)
            && $exception instanceof Throwable
            && $this->displayErrorDetails
        ) {
            $error['exception'] = [];
            $error['exception']['type'] = get_class($exception);
            $error['exception']['code'] = $exception->getCode();
            $error['exception']['message'] = $exception->getMessage();
            $error['exception']['file'] = $exception->getFile();
            $error['exception']['line'] = $exception->getLine();
        }

        $payload = json_encode([
            'success' => false,
            'error' => $error,
            'timestamp' => date('c'),
        ], JSON_UNESCAPED_UNICODE);

        $response = $this->responseFactory->createResponse($statusCode);
        $response->getBody()->write($payload);

        return $response->withHeader('Content-Type', 'application/json');
    }
} 