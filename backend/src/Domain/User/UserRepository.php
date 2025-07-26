<?php

declare(strict_types=1);

namespace App\Domain\User;

interface UserRepository
{
    /**
     * @return User[]
     */
    public function findAll(): array;

    /**
     * @param int $id
     * @return User
     * @throws UserNotFoundException
     */
    public function findUserOfId(int $id): User;

    /**
     * @param string $username
     * @return User
     * @throws UserNotFoundException
     */
    public function findUserOfUsername(string $username): User;

    /**
     * @param string $email
     * @return User
     * @throws UserNotFoundException
     */
    public function findUserOfEmail(string $email): User;

    /**
     * @param string $uuid
     * @return User
     * @throws UserNotFoundException
     */
    public function findUserOfUuid(string $uuid): User;

    /**
     * @param User $user
     * @return User
     */
    public function createUser(User $user): User;

    /**
     * @param User $user
     * @return User
     */
    public function updateUser(User $user): User;

    /**
     * @param int $id
     * @return void
     */
    public function deleteUser(int $id): void;

    /**
     * @param string $email
     * @return bool
     */
    public function emailExists(string $email): bool;

    /**
     * @param string $username
     * @return bool
     */
    public function usernameExists(string $username): bool;

    /**
     * @param string $email
     * @param string $password
     * @return User|null
     */
    public function authenticate(string $email, string $password): ?User;

    /**
     * @param int $limit
     * @param int $offset
     * @return User[]
     */
    public function findPaginated(int $limit, int $offset): array;

    /**
     * @param string $search
     * @return User[]
     */
    public function search(string $search): array;

    /**
     * @return int
     */
    public function count(): int;
} 