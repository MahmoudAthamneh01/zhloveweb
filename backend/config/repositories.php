<?php

declare(strict_types=1);

use App\Domain\User\UserRepository;
use App\Domain\Clan\ClanRepository;
use App\Domain\Tournament\TournamentRepository;
use App\Domain\Forum\ForumRepository;
use App\Domain\Replay\ReplayRepository;
use App\Domain\Streamer\StreamerRepository;
use App\Domain\Ranking\RankingRepository;
use App\Infrastructure\Persistence\User\DatabaseUserRepository;
use App\Infrastructure\Persistence\Clan\DatabaseClanRepository;
use App\Infrastructure\Persistence\Tournament\DatabaseTournamentRepository;
use App\Infrastructure\Persistence\Forum\DatabaseForumRepository;
use App\Infrastructure\Persistence\Replay\DatabaseReplayRepository;
use App\Infrastructure\Persistence\Streamer\DatabaseStreamerRepository;
use App\Infrastructure\Persistence\Ranking\DatabaseRankingRepository;
use DI\ContainerBuilder;
use Psr\Container\ContainerInterface;

return function (ContainerBuilder $containerBuilder) {
    $containerBuilder->addDefinitions([
        UserRepository::class => function (ContainerInterface $c) {
            return new DatabaseUserRepository($c->get(PDO::class));
        },
        ClanRepository::class => function (ContainerInterface $c) {
            return new DatabaseClanRepository($c->get(PDO::class));
        },
        TournamentRepository::class => function (ContainerInterface $c) {
            return new DatabaseTournamentRepository($c->get(PDO::class));
        },
        ForumRepository::class => function (ContainerInterface $c) {
            return new DatabaseForumRepository($c->get(PDO::class));
        },
        ReplayRepository::class => function (ContainerInterface $c) {
            return new DatabaseReplayRepository($c->get(PDO::class));
        },
        StreamerRepository::class => function (ContainerInterface $c) {
            return new DatabaseStreamerRepository($c->get(PDO::class));
        },
        RankingRepository::class => function (ContainerInterface $c) {
            return new DatabaseRankingRepository($c->get(PDO::class));
        },
    ]);
}; 