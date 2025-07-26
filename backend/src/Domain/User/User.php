<?php

declare(strict_types=1);

namespace App\Domain\User;

use JsonSerializable;

class User implements JsonSerializable
{
    private ?int $id;
    private string $uuid;
    private string $username;
    private string $email;
    private string $passwordHash;
    private ?string $firstName;
    private ?string $lastName;
    private ?string $avatarUrl;
    private ?string $bio;
    private ?string $country;
    private int $rankPoints;
    private int $level;
    private int $experiencePoints;
    private int $totalMatches;
    private int $wins;
    private int $losses;
    private string $role;
    private string $status;
    private bool $emailVerified;
    private ?\DateTime $lastLogin;
    private \DateTime $createdAt;
    private \DateTime $updatedAt;

    public function __construct(
        ?int $id,
        string $uuid,
        string $username,
        string $email,
        string $passwordHash,
        ?string $firstName = null,
        ?string $lastName = null,
        ?string $avatarUrl = null,
        ?string $bio = null,
        ?string $country = null,
        int $rankPoints = 0,
        int $level = 1,
        int $experiencePoints = 0,
        int $totalMatches = 0,
        int $wins = 0,
        int $losses = 0,
        string $role = 'user',
        string $status = 'active',
        bool $emailVerified = false,
        ?\DateTime $lastLogin = null,
        ?\DateTime $createdAt = null,
        ?\DateTime $updatedAt = null
    ) {
        $this->id = $id;
        $this->uuid = $uuid;
        $this->username = $username;
        $this->email = $email;
        $this->passwordHash = $passwordHash;
        $this->firstName = $firstName;
        $this->lastName = $lastName;
        $this->avatarUrl = $avatarUrl;
        $this->bio = $bio;
        $this->country = $country;
        $this->rankPoints = $rankPoints;
        $this->level = $level;
        $this->experiencePoints = $experiencePoints;
        $this->totalMatches = $totalMatches;
        $this->wins = $wins;
        $this->losses = $losses;
        $this->role = $role;
        $this->status = $status;
        $this->emailVerified = $emailVerified;
        $this->lastLogin = $lastLogin;
        $this->createdAt = $createdAt ?? new \DateTime();
        $this->updatedAt = $updatedAt ?? new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUuid(): string
    {
        return $this->uuid;
    }

    public function getUsername(): string
    {
        return $this->username;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getPasswordHash(): string
    {
        return $this->passwordHash;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function getFullName(): string
    {
        return trim(($this->firstName ?? '') . ' ' . ($this->lastName ?? ''));
    }

    public function getAvatarUrl(): ?string
    {
        return $this->avatarUrl;
    }

    public function getBio(): ?string
    {
        return $this->bio;
    }

    public function getCountry(): ?string
    {
        return $this->country;
    }

    public function getRankPoints(): int
    {
        return $this->rankPoints;
    }

    public function getLevel(): int
    {
        return $this->level;
    }

    public function getExperiencePoints(): int
    {
        return $this->experiencePoints;
    }

    public function getTotalMatches(): int
    {
        return $this->totalMatches;
    }

    public function getWins(): int
    {
        return $this->wins;
    }

    public function getLosses(): int
    {
        return $this->losses;
    }

    public function getWinRate(): float
    {
        if ($this->totalMatches === 0) {
            return 0.0;
        }
        return round(($this->wins / $this->totalMatches) * 100, 2);
    }

    public function getRole(): string
    {
        return $this->role;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function isEmailVerified(): bool
    {
        return $this->emailVerified;
    }

    public function getLastLogin(): ?\DateTime
    {
        return $this->lastLogin;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTime
    {
        return $this->updatedAt;
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isModerator(): bool
    {
        return in_array($this->role, ['admin', 'moderator']);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function jsonSerialize(): mixed
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'username' => $this->username,
            'email' => $this->email,
            'firstName' => $this->firstName,
            'lastName' => $this->lastName,
            'fullName' => $this->getFullName(),
            'avatarUrl' => $this->avatarUrl,
            'bio' => $this->bio,
            'country' => $this->country,
            'rankPoints' => $this->rankPoints,
            'level' => $this->level,
            'experiencePoints' => $this->experiencePoints,
            'totalMatches' => $this->totalMatches,
            'wins' => $this->wins,
            'losses' => $this->losses,
            'winRate' => $this->getWinRate(),
            'role' => $this->role,
            'status' => $this->status,
            'emailVerified' => $this->emailVerified,
            'lastLogin' => $this->lastLogin?->format(\DateTime::ATOM),
            'createdAt' => $this->createdAt->format(\DateTime::ATOM),
            'updatedAt' => $this->updatedAt->format(\DateTime::ATOM),
        ];
    }
} 