<?php

declare(strict_types=1);

namespace App\Domain\Clan;

interface ClanRepository
{
    /**
     * @return Clan[]
     */
    public function findAll(): array;

    /**
     * @param int $id
     * @return Clan
     * @throws ClanNotFoundException
     */
    public function findClanOfId(int $id): Clan;

    /**
     * @param string $name
     * @return Clan
     * @throws ClanNotFoundException
     */
    public function findClanOfName(string $name): Clan;

    /**
     * @param string $tag
     * @return Clan
     * @throws ClanNotFoundException
     */
    public function findClanOfTag(string $tag): Clan;

    /**
     * @param Clan $clan
     * @return Clan
     */
    public function createClan(Clan $clan): Clan;

    /**
     * @param Clan $clan
     * @return Clan
     */
    public function updateClan(Clan $clan): Clan;

    /**
     * @param int $id
     * @return void
     */
    public function deleteClan(int $id): void;

    /**
     * @param string $name
     * @return bool
     */
    public function clanNameExists(string $name): bool;

    /**
     * @param string $tag
     * @return bool
     */
    public function clanTagExists(string $tag): bool;

    /**
     * @param int $limit
     * @param int $offset
     * @param string $status
     * @return Clan[]
     */
    public function findPaginated(int $limit, int $offset, string $status = ''): array;

    /**
     * @param string $search
     * @return Clan[]
     */
    public function search(string $search): array;

    /**
     * @param string $status
     * @return int
     */
    public function count(string $status = ''): int;

    /**
     * @param int $userId
     * @return Clan[]
     */
    public function findByUserId(int $userId): array;

    /**
     * @param int $clanId
     * @return array
     */
    public function getMembers(int $clanId): array;

    /**
     * @param int $clanId
     * @param int $userId
     * @param string $role
     * @return bool
     */
    public function addMember(int $clanId, int $userId, string $role = 'member'): bool;

    /**
     * @param int $clanId
     * @param int $userId
     * @return bool
     */
    public function removeMember(int $clanId, int $userId): bool;

    /**
     * @param int $clanId
     * @param int $userId
     * @return bool
     */
    public function isMember(int $clanId, int $userId): bool;
} 