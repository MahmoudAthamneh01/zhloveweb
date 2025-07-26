<?php

declare(strict_types=1);

use App\Application\Actions\Auth\LoginAction;
use App\Application\Actions\Auth\RegisterAction;
use App\Application\Actions\Auth\LogoutAction;
use App\Application\Actions\Auth\RefreshTokenAction;
use App\Application\Actions\Auth\ForgotPasswordAction;
use App\Application\Actions\Auth\ResetPasswordAction;
use App\Application\Actions\Auth\MeAction;
use App\Application\Actions\User\ListUsersAction;
use App\Application\Actions\User\ViewUserAction;
use App\Application\Actions\User\UpdateUserAction;
use App\Application\Actions\Clan\ListClansAction;
use App\Application\Actions\Clan\ViewClanAction;
use App\Application\Actions\Clan\CreateClanAction;
use App\Application\Actions\Clan\UpdateClanAction;
use App\Application\Actions\Clan\DeleteClanAction;
use App\Application\Actions\Clan\JoinClanAction;
use App\Application\Actions\Clan\LeaveClanAction;
use App\Application\Actions\Tournament\ListTournamentsAction;
use App\Application\Actions\Tournament\ViewTournamentAction;
use App\Application\Actions\Tournament\CreateTournamentAction;
use App\Application\Actions\Tournament\UpdateTournamentAction;
use App\Application\Actions\Tournament\DeleteTournamentAction;
use App\Application\Actions\Tournament\JoinTournamentAction;
use App\Application\Actions\Tournament\LeaveTournamentAction;
use App\Application\Actions\Forum\ListCategoriesAction;
use App\Application\Actions\Forum\ListPostsAction;
use App\Application\Actions\Forum\ViewPostAction;
use App\Application\Actions\Forum\CreatePostAction;
use App\Application\Actions\Forum\UpdatePostAction;
use App\Application\Actions\Forum\DeletePostAction;
use App\Application\Actions\Forum\CreateReplyAction;
use App\Application\Actions\Forum\UpdateReplyAction;
use App\Application\Actions\Forum\DeleteReplyAction;
use App\Application\Actions\Replay\ListReplaysAction;
use App\Application\Actions\Replay\ViewReplayAction;
use App\Application\Actions\Replay\UploadReplayAction;
use App\Application\Actions\Replay\DeleteReplayAction;
use App\Application\Actions\Replay\RateReplayAction;
use App\Application\Actions\Streamer\ListStreamersAction;
use App\Application\Actions\Streamer\ViewStreamerAction;
use App\Application\Actions\Streamer\CreateStreamerAction;
use App\Application\Actions\Streamer\UpdateStreamerAction;
use App\Application\Actions\Streamer\DeleteStreamerAction;
use App\Application\Actions\Ranking\ListRankingsAction;
use App\Application\Actions\Ranking\ViewRankingAction;
use App\Application\Actions\Ranking\UpdateRankingAction;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\App;
use Slim\Interfaces\RouteCollectorProxyInterface as Group;

return function (App $app) {
    $app->options('/{routes:.*}', function (Request $request, Response $response) {
        return $response;
    });

    $app->get('/', function (Request $request, Response $response) {
        $response->getBody()->write(json_encode([
            'message' => 'ZH-Love Gaming Community API',
            'version' => '1.0.0',
            'status' => 'active',
            'endpoints' => [
                'auth' => '/api/auth',
                'users' => '/api/users',
                'clans' => '/api/clans',
                'tournaments' => '/api/tournaments',
                'forum' => '/api/forum',
                'replays' => '/api/replays',
                'streamers' => '/api/streamers',
                'rankings' => '/api/rankings',
            ]
        ]));
        
        return $response
            ->withHeader('Content-Type', 'application/json');
    });

    $app->group('/api', function (Group $group) {
        // Authentication routes
        $group->group('/auth', function (Group $group) {
            $group->post('/login', LoginAction::class);
            $group->post('/register', RegisterAction::class);
            $group->post('/logout', LogoutAction::class);
            $group->post('/refresh-token', RefreshTokenAction::class);
            $group->post('/forgot-password', ForgotPasswordAction::class);
            $group->post('/reset-password', ResetPasswordAction::class);
            $group->get('/me', MeAction::class);
        });

        // User routes
        $group->group('/users', function (Group $group) {
            $group->get('', ListUsersAction::class);
            $group->get('/{id}', ViewUserAction::class);
            $group->put('/{id}', UpdateUserAction::class);
        });

        // Clan routes
        $group->group('/clans', function (Group $group) {
            $group->get('', ListClansAction::class);
            $group->get('/{id}', ViewClanAction::class);
            $group->post('', CreateClanAction::class);
            $group->put('/{id}', UpdateClanAction::class);
            $group->delete('/{id}', DeleteClanAction::class);
            $group->post('/{id}/join', JoinClanAction::class);
            $group->post('/{id}/leave', LeaveClanAction::class);
        });

        // Tournament routes
        $group->group('/tournaments', function (Group $group) {
            $group->get('', ListTournamentsAction::class);
            $group->get('/{id}', ViewTournamentAction::class);
            $group->post('', CreateTournamentAction::class);
            $group->put('/{id}', UpdateTournamentAction::class);
            $group->delete('/{id}', DeleteTournamentAction::class);
            $group->post('/{id}/join', JoinTournamentAction::class);
            $group->post('/{id}/leave', LeaveTournamentAction::class);
        });

        // Forum routes
        $group->group('/forum', function (Group $group) {
            $group->get('/categories', ListCategoriesAction::class);
            $group->get('/posts', ListPostsAction::class);
            $group->get('/posts/{id}', ViewPostAction::class);
            $group->post('/posts', CreatePostAction::class);
            $group->put('/posts/{id}', UpdatePostAction::class);
            $group->delete('/posts/{id}', DeletePostAction::class);
            $group->post('/posts/{id}/replies', CreateReplyAction::class);
            $group->put('/replies/{id}', UpdateReplyAction::class);
            $group->delete('/replies/{id}', DeleteReplyAction::class);
        });

        // Replay routes
        $group->group('/replays', function (Group $group) {
            $group->get('', ListReplaysAction::class);
            $group->get('/{id}', ViewReplayAction::class);
            $group->post('', UploadReplayAction::class);
            $group->delete('/{id}', DeleteReplayAction::class);
            $group->post('/{id}/rate', RateReplayAction::class);
        });

        // Streamer routes
        $group->group('/streamers', function (Group $group) {
            $group->get('', ListStreamersAction::class);
            $group->get('/{id}', ViewStreamerAction::class);
            $group->post('', CreateStreamerAction::class);
            $group->put('/{id}', UpdateStreamerAction::class);
            $group->delete('/{id}', DeleteStreamerAction::class);
        });

        // Ranking routes
        $group->group('/rankings', function (Group $group) {
            $group->get('', ListRankingsAction::class);
            $group->get('/{id}', ViewRankingAction::class);
            $group->put('/{id}', UpdateRankingAction::class);
        });
    });
}; 