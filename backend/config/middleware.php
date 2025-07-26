<?php

declare(strict_types=1);

use App\Application\Settings\SettingsInterface;
use App\Middleware\CorsMiddleware;
use Slim\App;

return function (App $app) {
    // Add CORS Middleware first
    $app->add(new CorsMiddleware());

    // Handle OPTIONS requests
    $app->options('/{routes:.*}', function ($request, $response) {
        return $response;
    });

    // Body parsing middleware
    $app->addBodyParsingMiddleware();

    // Routing middleware
    $app->addRoutingMiddleware();
}; 