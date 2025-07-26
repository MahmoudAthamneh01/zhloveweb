<?php

use App\Controllers\ClanController;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

// Clan routes
$app->group('/api/clans', function () {
    
    // Get all approved clans
    $this->get('', function (Request $request, Response $response) {
        $controller = new ClanController($this->get('db'));
        return $controller->getAllClans($request, $response);
    });
    
    // Get specific clan
    $this->get('/{id}', function (Request $request, Response $response, array $args) {
        $controller = new ClanController($this->get('db'));
        return $controller->getClan($request, $response, $args);
    });
    
    // Get user's clan
    $this->get('/user/{userId}', function (Request $request, Response $response, array $args) {
        $controller = new ClanController($this->get('db'));
        return $controller->getUserClan($request, $response, $args);
    });
    
    // Get clan wars
    $this->get('/{clanId}/wars', function (Request $request, Response $response, array $args) {
        $controller = new ClanController($this->get('db'));
        return $controller->getClanWars($request, $response, $args);
    });
    
    // Create war challenge
    $this->post('/wars', function (Request $request, Response $response) {
        $controller = new ClanController($this->get('db'));
        return $controller->createWar($request, $response);
    });
    
    // Respond to war challenge
    $this->put('/wars/{warId}/respond', function (Request $request, Response $response, array $args) {
        $controller = new ClanController($this->get('db'));
        return $controller->respondToWar($request, $response, $args);
    });
    
}); 