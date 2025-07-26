<?php
require_once 'vendor/autoload.php';

use Slim\Factory\AppFactory;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

try {
    // Load environment variables
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
    
    // Create app
    $app = AppFactory::create();
    
    // Simple test route
    $app->get('/', function (Request $request, Response $response) {
        $response->getBody()->write(json_encode([
            'message' => 'ZH-Love Gaming Community API',
            'version' => '1.0.0',
            'status' => 'active',
            'timestamp' => date('Y-m-d H:i:s')
        ]));
        
        return $response->withHeader('Content-Type', 'application/json');
    });
    
    // Test route
    $app->get('/test', function (Request $request, Response $response) {
        $response->getBody()->write(json_encode([
            'message' => 'Test endpoint working!',
            'method' => 'GET',
            'path' => '/test'
        ]));
        
        return $response->withHeader('Content-Type', 'application/json');
    });
    
    echo "Starting simple test server...\n";
    echo "Visit: http://localhost:8080/\n";
    echo "Visit: http://localhost:8080/test\n";
    
    // Run the app
    $app->run();
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
} 