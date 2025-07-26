<?php

declare(strict_types=1);

namespace App\Domain\Clan;

use JsonSerializable;

class Clan implements JsonSerializable
{
    private ?int $id;
    private string $name;
    private string $tag;
    private ?string $description;
    private ?string $logoUrl;
    private ?string $bannerUrl;
    private int $leaderId;
    private ?\DateTime $foundedDate;
    private int $totalMembers;
    private int $clanPoints;
    private int $wins;
    private int $losses;
    private string $status;
    private bool $recruitmentOpen;
    private ?string $website;
    private ?string $discordUrl;
    private \DateTime $createdAt;
    private \DateTime $updatedAt;

    public function __construct(
        ?int $id,
        string $name,
        string $tag,
        ?string $description,
        ?string $logoUrl,
        ?string $bannerUrl,
        int $leaderId,
        ?\DateTime $foundedDate,
        int $totalMembers = 0,
        int $clanPoints = 0,
        int $wins = 0,
        int $losses = 0,
        string $status = 'active',
        bool $recruitmentOpen = true,
        ?string $website = null,
        ?string $discordUrl = null,
        ?\DateTime $createdAt = null,
        ?\DateTime $updatedAt = null
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->tag = $tag;
        $this->description = $description;
        $this->logoUrl = $logoUrl;
        $this->bannerUrl = $bannerUrl;
        $this->leaderId = $leaderId;
        $this->foundedDate = $foundedDate;
        $this->totalMembers = $totalMembers;
        $this->clanPoints = $clanPoints;
        $this->wins = $wins;
        $this->losses = $losses;
        $this->status = $status;
        $this->recruitmentOpen = $recruitmentOpen;
        $this->website = $website;
        $this->discordUrl = $discordUrl;
        $this->createdAt = $createdAt ?? new \DateTime();
        $this->updatedAt = $updatedAt ?? new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getTag(): string
    {
        return $this->tag;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getLogoUrl(): ?string
    {
        return $this->logoUrl;
    }

    public function getBannerUrl(): ?string
    {
        return $this->bannerUrl;
    }

    public function getLeaderId(): int
    {
        return $this->leaderId;
    }

    public function getFoundedDate(): ?\DateTime
    {
        return $this->foundedDate;
    }

    public function getTotalMembers(): int
    {
        return $this->totalMembers;
    }

    public function getClanPoints(): int
    {
        return $this->clanPoints;
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
        $totalMatches = $this->wins + $this->losses;
        if ($totalMatches === 0) {
            return 0.0;
        }
        return round(($this->wins / $totalMatches) * 100, 2);
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function isRecruitmentOpen(): bool
    {
        return $this->recruitmentOpen;
    }

    public function getWebsite(): ?string
    {
        return $this->website;
    }

    public function getDiscordUrl(): ?string
    {
        return $this->discordUrl;
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): \DateTime
    {
        return $this->updatedAt;
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function jsonSerialize(): mixed
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'tag' => $this->tag,
            'description' => $this->description,
            'logoUrl' => $this->logoUrl,
            'bannerUrl' => $this->bannerUrl,
            'leaderId' => $this->leaderId,
            'foundedDate' => $this->foundedDate?->format('Y-m-d'),
            'totalMembers' => $this->totalMembers,
            'clanPoints' => $this->clanPoints,
            'wins' => $this->wins,
            'losses' => $this->losses,
            'winRate' => $this->getWinRate(),
            'status' => $this->status,
            'recruitmentOpen' => $this->recruitmentOpen,
            'website' => $this->website,
            'discordUrl' => $this->discordUrl,
            'createdAt' => $this->createdAt->format(\DateTime::ATOM),
            'updatedAt' => $this->updatedAt->format(\DateTime::ATOM),
        ];
    }
} 