<?php

declare(strict_types=1);

namespace App\Infrastructure\Persistence\User;

use App\Domain\User\User;
use App\Domain\User\UserNotFoundException;
use App\Domain\User\UserRepository;
use PDO;
use DateTime;

class DatabaseUserRepository implements UserRepository
{
    private PDO $connection;

    public function __construct(PDO $connection)
    {
        $this->connection = $connection;
    }

    public function findAll(): array
    {
        $statement = $this->connection->prepare('SELECT * FROM users ORDER BY created_at DESC');
        $statement->execute();

        $users = [];
        while ($row = $statement->fetch()) {
            $users[] = $this->createUserFromRow($row);
        }

        return $users;
    }

    public function findUserOfId(int $id): User
    {
        $statement = $this->connection->prepare('SELECT * FROM users WHERE id = :id');
        $statement->execute(['id' => $id]);

        $row = $statement->fetch();
        if (!$row) {
            throw new UserNotFoundException();
        }

        return $this->createUserFromRow($row);
    }

    public function findUserOfUsername(string $username): User
    {
        $statement = $this->connection->prepare('SELECT * FROM users WHERE username = :username');
        $statement->execute(['username' => $username]);

        $row = $statement->fetch();
        if (!$row) {
            throw new UserNotFoundException();
        }

        return $this->createUserFromRow($row);
    }

    public function findUserOfEmail(string $email): User
    {
        $statement = $this->connection->prepare('SELECT * FROM users WHERE email = :email');
        $statement->execute(['email' => $email]);

        $row = $statement->fetch();
        if (!$row) {
            throw new UserNotFoundException();
        }

        return $this->createUserFromRow($row);
    }

    public function findUserOfUuid(string $uuid): User
    {
        $statement = $this->connection->prepare('SELECT * FROM users WHERE uuid = :uuid');
        $statement->execute(['uuid' => $uuid]);

        $row = $statement->fetch();
        if (!$row) {
            throw new UserNotFoundException();
        }

        return $this->createUserFromRow($row);
    }

    public function createUser(User $user): User
    {
        $statement = $this->connection->prepare(
            'INSERT INTO users (uuid, username, email, password_hash, first_name, last_name, avatar_url, bio, country, rank_points, level, experience_points, total_matches, wins, losses, role, status, email_verified, last_login, created_at, updated_at) 
             VALUES (:uuid, :username, :email, :password_hash, :first_name, :last_name, :avatar_url, :bio, :country, :rank_points, :level, :experience_points, :total_matches, :wins, :losses, :role, :status, :email_verified, :last_login, :created_at, :updated_at)'
        );

        $statement->execute([
            'uuid' => $user->getUuid(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'password_hash' => $user->getPasswordHash(),
            'first_name' => $user->getFirstName(),
            'last_name' => $user->getLastName(),
            'avatar_url' => $user->getAvatarUrl(),
            'bio' => $user->getBio(),
            'country' => $user->getCountry(),
            'rank_points' => $user->getRankPoints(),
            'level' => $user->getLevel(),
            'experience_points' => $user->getExperiencePoints(),
            'total_matches' => $user->getTotalMatches(),
            'wins' => $user->getWins(),
            'losses' => $user->getLosses(),
            'role' => $user->getRole(),
            'status' => $user->getStatus(),
            'email_verified' => $user->isEmailVerified() ? 1 : 0,
            'last_login' => $user->getLastLogin()?->format('Y-m-d H:i:s'),
            'created_at' => $user->getCreatedAt()->format('Y-m-d H:i:s'),
            'updated_at' => $user->getUpdatedAt()->format('Y-m-d H:i:s'),
        ]);

        return $this->findUserOfId((int) $this->connection->lastInsertId());
    }

    public function updateUser(User $user): User
    {
        $statement = $this->connection->prepare(
            'UPDATE users SET 
                username = :username, 
                email = :email, 
                password_hash = :password_hash, 
                first_name = :first_name, 
                last_name = :last_name, 
                avatar_url = :avatar_url, 
                bio = :bio, 
                country = :country, 
                rank_points = :rank_points, 
                level = :level, 
                experience_points = :experience_points, 
                total_matches = :total_matches, 
                wins = :wins, 
                losses = :losses, 
                role = :role, 
                status = :status, 
                email_verified = :email_verified, 
                last_login = :last_login, 
                updated_at = :updated_at 
             WHERE id = :id'
        );

        $statement->execute([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'password_hash' => $user->getPasswordHash(),
            'first_name' => $user->getFirstName(),
            'last_name' => $user->getLastName(),
            'avatar_url' => $user->getAvatarUrl(),
            'bio' => $user->getBio(),
            'country' => $user->getCountry(),
            'rank_points' => $user->getRankPoints(),
            'level' => $user->getLevel(),
            'experience_points' => $user->getExperiencePoints(),
            'total_matches' => $user->getTotalMatches(),
            'wins' => $user->getWins(),
            'losses' => $user->getLosses(),
            'role' => $user->getRole(),
            'status' => $user->getStatus(),
            'email_verified' => $user->isEmailVerified() ? 1 : 0,
            'last_login' => $user->getLastLogin()?->format('Y-m-d H:i:s'),
            'updated_at' => (new DateTime())->format('Y-m-d H:i:s'),
        ]);

        return $this->findUserOfId($user->getId());
    }

    public function deleteUser(int $id): void
    {
        $statement = $this->connection->prepare('DELETE FROM users WHERE id = :id');
        $statement->execute(['id' => $id]);
    }

    public function emailExists(string $email): bool
    {
        $statement = $this->connection->prepare('SELECT COUNT(*) FROM users WHERE email = :email');
        $statement->execute(['email' => $email]);
        
        return (bool) $statement->fetchColumn();
    }

    public function usernameExists(string $username): bool
    {
        $statement = $this->connection->prepare('SELECT COUNT(*) FROM users WHERE username = :username');
        $statement->execute(['username' => $username]);
        
        return (bool) $statement->fetchColumn();
    }

    public function authenticate(string $email, string $password): ?User
    {
        try {
            $user = $this->findUserOfEmail($email);
            
            if (password_verify($password, $user->getPasswordHash())) {
                return $user;
            }
        } catch (UserNotFoundException $e) {
            // User not found
        }
        
        return null;
    }

    public function findPaginated(int $limit, int $offset): array
    {
        $statement = $this->connection->prepare(
            'SELECT * FROM users ORDER BY created_at DESC LIMIT :limit OFFSET :offset'
        );
        $statement->bindValue('limit', $limit, PDO::PARAM_INT);
        $statement->bindValue('offset', $offset, PDO::PARAM_INT);
        $statement->execute();

        $users = [];
        while ($row = $statement->fetch()) {
            $users[] = $this->createUserFromRow($row);
        }

        return $users;
    }

    public function search(string $search): array
    {
        $statement = $this->connection->prepare(
            'SELECT * FROM users WHERE username LIKE :search OR email LIKE :search OR first_name LIKE :search OR last_name LIKE :search ORDER BY created_at DESC'
        );
        $statement->execute(['search' => '%' . $search . '%']);

        $users = [];
        while ($row = $statement->fetch()) {
            $users[] = $this->createUserFromRow($row);
        }

        return $users;
    }

    public function count(): int
    {
        $statement = $this->connection->prepare('SELECT COUNT(*) FROM users');
        $statement->execute();
        
        return (int) $statement->fetchColumn();
    }

    private function createUserFromRow(array $row): User
    {
        return new User(
            (int) $row['id'],
            $row['uuid'],
            $row['username'],
            $row['email'],
            $row['password_hash'],
            $row['first_name'],
            $row['last_name'],
            $row['avatar_url'],
            $row['bio'],
            $row['country'],
            (int) $row['rank_points'],
            (int) $row['level'],
            (int) $row['experience_points'],
            (int) $row['total_matches'],
            (int) $row['wins'],
            (int) $row['losses'],
            $row['role'],
            $row['status'],
            (bool) $row['email_verified'],
            $row['last_login'] ? new DateTime($row['last_login']) : null,
            $row['created_at'] ? new DateTime($row['created_at']) : null,
            $row['updated_at'] ? new DateTime($row['updated_at']) : null
        );
    }
} 