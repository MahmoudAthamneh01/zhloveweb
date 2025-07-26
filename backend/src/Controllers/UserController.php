<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\UserService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Log\LoggerInterface;

class UserController
{
    private UserService $userService;
    private LoggerInterface $logger;

    public function __construct(UserService $userService, LoggerInterface $logger)
    {
        $this->userService = $userService;
        $this->logger = $logger;
    }

    /**
     * Get user profile
     */
    public function getProfile(Request $request, Response $response): Response
    {
        try {
            $userId = (int) $request->getAttribute('route')->getArgument('id');
            
            $user = $this->userService->getUserById($userId);
            
            if (!$user) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $user->toArray()
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Get user profile error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request, Response $response): Response
    {
        try {
            $currentUser = $request->getAttribute('user');
            $data = $request->getParsedBody();
            
            if (!$currentUser) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Validate allowed fields
            $allowedFields = [
                'bio', 'country', 'favorite_general', 'display_name',
                'discord_username', 'youtube_channel', 'twitch_username'
            ];
            
            $updateData = [];
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updateData[$field] = $data[$field];
                }
            }

            if (empty($updateData)) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'No valid fields to update'
                ], 400);
            }

            // Update profile
            $success = $this->userService->updateProfile($currentUser->getId(), $updateData);

            if (!$success) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Failed to update profile'
                ], 500);
            }

            // Get updated user
            $updatedUser = $this->userService->getUserById($currentUser->getId());

            $this->logger->info('User profile updated', [
                'user_id' => $currentUser->getId(),
                'fields' => array_keys($updateData)
            ]);

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => $updatedUser->toArray()
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Update user profile error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get users list with pagination
     */
    public function getUsers(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            
            $page = (int) ($queryParams['page'] ?? 1);
            $limit = (int) ($queryParams['limit'] ?? 20);
            $search = $queryParams['search'] ?? '';
            $sortBy = $queryParams['sort_by'] ?? 'created_at';
            $sortOrder = $queryParams['sort_order'] ?? 'desc';
            
            // Validate pagination
            if ($page < 1) $page = 1;
            if ($limit < 1 || $limit > 100) $limit = 20;
            
            // Validate sort options
            $allowedSortFields = ['username', 'level', 'xp', 'created_at', 'last_login'];
            if (!in_array($sortBy, $allowedSortFields)) {
                $sortBy = 'created_at';
            }
            
            if (!in_array($sortOrder, ['asc', 'desc'])) {
                $sortOrder = 'desc';
            }

            $result = $this->userService->getUsers($page, $limit, $search, $sortBy, $sortOrder);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $result
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Get users error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get user statistics
     */
    public function getStats(Request $request, Response $response): Response
    {
        try {
            $userId = (int) $request->getAttribute('route')->getArgument('id');
            
            $stats = $this->userService->getUserStats($userId);

            if (!$stats) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Get user stats error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get user badges
     */
    public function getBadges(Request $request, Response $response): Response
    {
        try {
            $userId = (int) $request->getAttribute('route')->getArgument('id');
            
            $badges = $this->userService->getUserBadges($userId);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $badges
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Get user badges error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update user avatar
     */
    public function updateAvatar(Request $request, Response $response): Response
    {
        try {
            $currentUser = $request->getAttribute('user');
            
            if (!$currentUser) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $uploadedFiles = $request->getUploadedFiles();
            
            if (!isset($uploadedFiles['avatar'])) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'No avatar file uploaded'
                ], 400);
            }

            $uploadedFile = $uploadedFiles['avatar'];
            
            if ($uploadedFile->getError() !== UPLOAD_ERR_OK) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'File upload error'
                ], 400);
            }

            // Validate file type
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            $fileType = $uploadedFile->getClientMediaType();
            
            if (!in_array($fileType, $allowedTypes)) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed'
                ], 400);
            }

            // Validate file size (max 5MB)
            if ($uploadedFile->getSize() > 5 * 1024 * 1024) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'File too large. Maximum size is 5MB'
                ], 400);
            }

            // Upload and update avatar
            $avatarUrl = $this->userService->updateAvatar($currentUser->getId(), $uploadedFile);

            if (!$avatarUrl) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Failed to upload avatar'
                ], 500);
            }

            $this->logger->info('Avatar updated', [
                'user_id' => $currentUser->getId(),
                'avatar_url' => $avatarUrl
            ]);

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'Avatar updated successfully',
                'data' => [
                    'avatar_url' => $avatarUrl
                ]
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Update avatar error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request, Response $response): Response
    {
        try {
            $currentUser = $request->getAttribute('user');
            $data = $request->getParsedBody();
            
            if (!$currentUser) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            if (empty($data['current_password']) || empty($data['new_password'])) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Current password and new password are required'
                ], 400);
            }

            // Validate new password strength
            if (strlen($data['new_password']) < 8) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'New password must be at least 8 characters long'
                ], 400);
            }

            // Change password
            $success = $this->userService->changePassword(
                $currentUser->getId(),
                $data['current_password'],
                $data['new_password']
            );

            if (!$success) {
                return $this->jsonResponse($response, [
                    'success' => false,
                    'message' => 'Current password is incorrect'
                ], 400);
            }

            $this->logger->info('Password changed', [
                'user_id' => $currentUser->getId()
            ]);

            return $this->jsonResponse($response, [
                'success' => true,
                'message' => 'Password changed successfully'
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Change password error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get online users
     */
    public function getOnlineUsers(Request $request, Response $response): Response
    {
        try {
            $queryParams = $request->getQueryParams();
            $limit = (int) ($queryParams['limit'] ?? 50);
            
            if ($limit < 1 || $limit > 100) $limit = 50;
            
            $onlineUsers = $this->userService->getOnlineUsers($limit);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $onlineUsers
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Get online users error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Get user activity
     */
    public function getActivity(Request $request, Response $response): Response
    {
        try {
            $userId = (int) $request->getAttribute('route')->getArgument('id');
            $queryParams = $request->getQueryParams();
            
            $page = (int) ($queryParams['page'] ?? 1);
            $limit = (int) ($queryParams['limit'] ?? 20);
            
            if ($page < 1) $page = 1;
            if ($limit < 1 || $limit > 50) $limit = 20;
            
            $activity = $this->userService->getUserActivity($userId, $page, $limit);

            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $activity
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Get user activity error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Helper method to create JSON response
     */
    private function jsonResponse(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data, JSON_UNESCAPED_UNICODE));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
} 