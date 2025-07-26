<?php

use App\Controllers\AuthController;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// Add CORS middleware for all auth routes
$app->add(function (Request $request, Response $response, $next) {
    $response = $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    
    if ($request->getMethod() === 'OPTIONS') {
        return $response;
    }
    
    return $next($request, $response);
});

// Auth routes group
$app->group('/api/auth', function () {
    
    // Register new user
    $this->post('/register', function (Request $request, Response $response) {
        $controller = new AuthController($this->get('db'));
        return $controller->register($request, $response);
    });
    
    // Login user
    $this->post('/login', function (Request $request, Response $response) {
        $controller = new AuthController($this->get('db'));
        return $controller->login($request, $response);
    });
    
    // Logout user
    $this->post('/logout', function (Request $request, Response $response) {
        $controller = new AuthController($this->get('db'));
        return $controller->logout($request, $response);
    });
    
    // Get current user info
    $this->get('/me', function (Request $request, Response $response) {
        $controller = new AuthController($this->get('db'));
        return $controller->me($request, $response);
    });
    
    // Verify session
    $this->post('/verify', function (Request $request, Response $response) {
        $controller = new AuthController($this->get('db'));
        return $controller->verifySession($request, $response);
    });
    
}); 