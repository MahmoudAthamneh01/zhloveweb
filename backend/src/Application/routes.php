<?php

use Slim\App;
use App\Controllers\AuthController;
use App\Controllers\UserController;
use App\Controllers\ClanController;
use App\Controllers\ForumController;
use App\Controllers\TournamentController;
use App\Controllers\NotificationController;
use App\Controllers\MessageController;
use App\Controllers\ProfileController;
use App\Controllers\AdminController;
use App\Middleware\AuthMiddleware;
use App\Middleware\AdminMiddleware;

return function (App $app) {
    
    // CORS Middleware for all routes
    $app->add(function ($request, $handler) {
        $response = $handler->handle($request);
        return $response
            ->withHeader('Access-Control-Allow-Origin', '*')
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    });

    // Handle preflight requests
    $app->options('/{routes:.+}', function ($request, $response, $args) {
        return $response;
    });

    // Public routes
    $app->get('/', function ($request, $response) {
        return $response->withJson(['message' => 'ZH-Love API Server', 'version' => '1.0.0']);
    });

    // Auth routes
    $app->group('/auth', function ($group) {
        $group->post('/register', AuthController::class . ':register');
        $group->post('/login', AuthController::class . ':login');
        $group->post('/logout', AuthController::class . ':logout');
        $group->post('/refresh', AuthController::class . ':refresh');
        $group->post('/forgot-password', AuthController::class . ':forgotPassword');
        $group->post('/reset-password', AuthController::class . ':resetPassword');
        $group->get('/me', AuthController::class . ':me')->add(AuthMiddleware::class);
    });

    // Tournament routes (public)
    $app->group('/tournaments', function ($group) {
        $group->get('', TournamentController::class . ':getAll');
        $group->get('/stats', TournamentController::class . ':getStats');
        $group->get('/settings', TournamentController::class . ':getSettings');
        $group->get('/{id}', TournamentController::class . ':getById');
        $group->get('/{id}/updates', TournamentController::class . ':getUpdates');
        $group->get('/{id}/bracket', TournamentController::class . ':getBracket');
        $group->get('/{id}/participants', TournamentController::class . ':getParticipants');
    });

    // Protected routes
    $app->group('', function ($group) {
        
        // User routes
        $group->group('/users', function ($userGroup) {
            $userGroup->get('/profile', UserController::class . ':getProfile');
            $userGroup->put('/profile', UserController::class . ':updateProfile');
            $userGroup->get('/stats', UserController::class . ':getStats');
        });

        // Tournament routes (authenticated)
        $group->group('/tournaments', function ($tournamentGroup) {
            $tournamentGroup->post('', TournamentController::class . ':create');
            $tournamentGroup->post('/{id}/join', TournamentController::class . ':join');
            $tournamentGroup->post('/{id}/leave', TournamentController::class . ':leave');
            $tournamentGroup->post('/{id}/updates', TournamentController::class . ':postUpdate');
            $tournamentGroup->post('/{id}/invite', TournamentController::class . ':sendInvites');
        });

        // Profile routes
        $group->group('/profile', function ($profileGroup) {
            $profileGroup->get('', ProfileController::class . ':getOwn');
            $profileGroup->put('', ProfileController::class . ':update');
            $profileGroup->get('/{id}', ProfileController::class . ':getById');
            $profileGroup->post('/{id}/challenge', ProfileController::class . ':sendChallenge');
            $profileGroup->post('/{id}/message', ProfileController::class . ':sendMessage');
        });

        // Notification routes
        $group->group('/notifications', function ($notificationGroup) {
            $notificationGroup->get('', NotificationController::class . ':getAll');
            $notificationGroup->get('/unread-count', NotificationController::class . ':getUnreadCount');
            $notificationGroup->post('/{id}/read', NotificationController::class . ':markAsRead');
            $notificationGroup->post('/mark-all-read', NotificationController::class . ':markAllAsRead');
            $notificationGroup->delete('/{id}', NotificationController::class . ':delete');
        });

        // Message routes
        $group->group('/messages', function ($messageGroup) {
            $messageGroup->get('', MessageController::class . ':getConversations');
            $messageGroup->get('/unread-count', MessageController::class . ':getUnreadCount');
            $messageGroup->get('/{id}', MessageController::class . ':getConversation');
            $messageGroup->post('', MessageController::class . ':send');
            $messageGroup->post('/{id}/read', MessageController::class . ':markAsRead');
        });

        // Clan routes
        $group->group('/clans', function ($clanGroup) {
            $clanGroup->get('', ClanController::class . ':getAll');
            $clanGroup->post('', ClanController::class . ':create');
            $clanGroup->get('/{id}', ClanController::class . ':getById');
            $clanGroup->post('/{id}/join', ClanController::class . ':join');
            $clanGroup->post('/{id}/leave', ClanController::class . ':leave');
        });

        // Forum routes
        $group->group('/forum', function ($forumGroup) {
            $forumGroup->get('/posts', ForumController::class . ':getPosts');
            $forumGroup->post('/posts', ForumController::class . ':createPost');
            $forumGroup->get('/posts/{id}', ForumController::class . ':getPost');
            $forumGroup->post('/posts/{id}/comments', ForumController::class . ':addComment');
            $forumGroup->post('/posts/{id}/like', ForumController::class . ':likePost');
        });

    })->add(AuthMiddleware::class);

    // Admin routes
    $app->group('/admin', function ($group) {
        
        // Tournament management
        $group->group('/tournaments', function ($tournamentGroup) {
            $tournamentGroup->get('/pending', TournamentController::class . ':getPending');
            $tournamentGroup->post('/{id}/approve', TournamentController::class . ':approve');
            $tournamentGroup->post('/{id}/reject', TournamentController::class . ':reject');
            $tournamentGroup->post('/{id}/feature', TournamentController::class . ':toggleFeatured');
            $tournamentGroup->put('/settings', TournamentController::class . ':updateSettings');
        });

        // Admin panel routes
        $group->get('/dashboard', AdminController::class . ':getDashboard');
        $group->get('/users', AdminController::class . ':getUsers');
        $group->get('/analytics', AdminController::class . ':getAnalytics');
        $group->get('/reports', AdminController::class . ':getReports');
        $group->get('/settings', AdminController::class . ':getSettings');
        $group->put('/settings', AdminController::class . ':updateSettings');
        
        // Message management
        $group->post('/messages/send', AdminController::class . ':sendMessage');
        $group->get('/messages/history', AdminController::class . ':getMessageHistory');

    })->add(AuthMiddleware::class)->add(AdminMiddleware::class);
}; 