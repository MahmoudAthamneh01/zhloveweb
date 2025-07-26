<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\TournamentService;
use App\Services\NotificationService;

class TournamentController
{
    private $tournamentService;
    private $notificationService;

    public function __construct(TournamentService $tournamentService, NotificationService $notificationService)
    {
        $this->tournamentService = $tournamentService;
        $this->notificationService = $notificationService;
    }

    public function create(Request $request, Response $response): Response
    {
        try {
            $user = $request->getAttribute('user');
            $data = $request->getParsedBody();
            
            // Create tournament
            $tournament = $this->tournamentService->createTournament($user['id'], $data);
            
            // Send notification to admins for approval
            $this->notificationService->notifyAdminsNewTournament($tournament);
            
            return $response->withJson([
                'success' => true,
                'message' => 'Tournament created successfully and sent for approval',
                'data' => $tournament
            ], 201);
            
        } catch (\Exception $e) {
            return $response->withJson([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function getAll(Request $request, Response $response): Response
    {
        try {
            $params = $request->getQueryParams();
            $tournaments = $this->tournamentService->getAllTournaments($params);
            
            return $response->withJson([
                'success' => true,
                'data' => $tournaments
            ]);
            
        } catch (\Exception $e) {
            return $response->withJson([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getById(Request $request, Response $response, array $args): Response
    {
        try {
            $tournamentId = $args['id'];
            $user = $request->getAttribute('user');
            
            $tournament = $this->tournamentService->getTournamentById($tournamentId, $user['id'] ?? null);
            
            if (!$tournament) {
                return $response->withJson([
                    'success' => false,
                    'message' => 'Tournament not found'
                ], 404);
            }
            
            return $response->withJson([
                'success' => true,
                'data' => ['tournament' => $tournament]
            ]);
            
        } catch (\Exception $e) {
            return $response->withJson([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function join(Request $request, Response $response, array $args): Response
    {
        try {
            $tournamentId = $args['id'];
            $user = $request->getAttribute('user');
            
            $result = $this->tournamentService->joinTournament($tournamentId, $user['id']);
            
            return $response->withJson([
                'success' => true,
                'message' => 'Successfully joined tournament',
                'data' => $result
            ]);
            
        } catch (\Exception $e) {
            return $response->withJson([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function leave(Request $request, Response $response, array $args): Response
    {
        try {
            $tournamentId = $args['id'];
            $user = $request->getAttribute('user');
            
            $this->tournamentService->leaveTournament($tournamentId, $user['id']);
            
            return $response->withJson([
                'success' => true,
                'message' => 'Successfully left tournament'
            ]);
            
        } catch (\Exception $e) {
            return $response->withJson([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function approve(Request $request, Response $response, array $args): Response
    {
        try {
            $tournamentId = $args['id'];
            $user = $request->getAttribute('user');
            $data = $request->getParsedBody();
            
            // Check if user is admin
            if ($user['role'] !== 'admin') {
                return $response->withJson([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            $tournament = $this->tournamentService->approveTournament(
                $tournamentId, 
                $user['id'], 
                $data['featured'] ?? false
            );
            
            // Send notifications to all users if public tournament
            if (!$tournament['is_private']) {
                $this->notificationService->notifyAllUsersNewTournament($tournament);
            }
            
            return $response->withJson([
                'success' => true,
                'message' => 'Tournament approved successfully',
                'data' => $tournament
            ]);
            
        } catch (\Exception $e) {
            return $response->withJson([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function sendInvites(Request $request, Response $response, array $args): Response
    {
        try {
            $tournamentId = $args['id'];
            $user = $request->getAttribute('user');
            $data = $request->getParsedBody();
            
            $invites = $this->tournamentService->sendInvites(
                $tournamentId, 
                $user['id'], 
                $data['user_ids']
            );
            
            return $response->withJson([
                'success' => true,
                'message' => 'Invites sent successfully',
                'data' => $invites
            ]);
            
        } catch (\Exception $e) {
            return $response->withJson([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function getStats(Request $request, Response $response): Response
    {
        try {
            $stats = $this->tournamentService->getTournamentStats();
            
            return $response->withJson([
                'success' => true,
                'data' => $stats
            ]);
            
        } catch (\Exception $e) {
            return $response->withJson([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getSettings(Request $request, Response $response): Response
    {
        try {
            $settings = $this->tournamentService->getTournamentSettings();
            
            return $response->withJson([
                'success' => true,
                'data' => $settings
            ]);
            
        } catch (\Exception $e) {
            return $response->withJson([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updateSettings(Request $request, Response $response): Response
    {
        try {
            $user = $request->getAttribute('user');
            $data = $request->getParsedBody();
            
            // Check if user is admin
            if ($user['role'] !== 'admin') {
                return $response->withJson([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            $settings = $this->tournamentService->updateTournamentSettings($data);
            
            return $response->withJson([
                'success' => true,
                'message' => 'Settings updated successfully',
                'data' => $settings
            ]);
            
        } catch (\Exception $e) {
            return $response->withJson([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function postUpdate(Request $request, Response $response, array $args): Response
    {
        try {
            $tournamentId = $args['id'];
            $user = $request->getAttribute('user');
            $data = $request->getParsedBody();
            
            $update = $this->tournamentService->postTournamentUpdate(
                $tournamentId, 
                $user['id'], 
                $data
            );
            
            return $response->withJson([
                'success' => true,
                'message' => 'Update posted successfully',
                'data' => $update
            ]);
            
        } catch (\Exception $e) {
            return $response->withJson([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    public function getUpdates(Request $request, Response $response, array $args): Response
    {
        try {
            $tournamentId = $args['id'];
            $updates = $this->tournamentService->getTournamentUpdates($tournamentId);
            
            return $response->withJson([
                'success' => true,
                'data' => ['updates' => $updates]
            ]);
            
        } catch (\Exception $e) {
            return $response->withJson([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getBracket(Request $request, Response $response, array $args): Response
    {
        try {
            $tournamentId = $args['id'];
            $bracket = $this->tournamentService->getTournamentBracket($tournamentId);
            
            return $response->withJson([
                'success' => true,
                'data' => $bracket
            ]);
            
        } catch (\Exception $e) {
            return $response->withJson([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getParticipants(Request $request, Response $response, array $args): Response
    {
        try {
            $tournamentId = $args['id'];
            $participants = $this->tournamentService->getTournamentParticipants($tournamentId);
            
            return $response->withJson([
                'success' => true,
                'data' => ['participants' => $participants]
            ]);
            
        } catch (\Exception $e) {
            return $response->withJson([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
} 