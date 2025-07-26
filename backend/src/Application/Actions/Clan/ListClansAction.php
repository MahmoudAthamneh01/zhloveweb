<?php

declare(strict_types=1);

namespace App\Application\Actions\Clan;

use App\Application\Actions\Action;
use App\Domain\Clan\ClanRepository;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Log\LoggerInterface;

class ListClansAction extends Action
{
    private ClanRepository $clanRepository;

    public function __construct(LoggerInterface $logger, ClanRepository $clanRepository)
    {
        parent::__construct($logger);
        $this->clanRepository = $clanRepository;
    }

    protected function action(): Response
    {
        $queryParams = $this->getQueryParams();
        
        $page = max(1, (int) ($queryParams['page'] ?? 1));
        $limit = min(100, max(1, (int) ($queryParams['limit'] ?? 20)));
        $search = $queryParams['search'] ?? '';
        $status = $queryParams['status'] ?? '';
        
        $offset = ($page - 1) * $limit;
        
        if (!empty($search)) {
            $clans = $this->clanRepository->search($search);
            $total = count($clans);
            $clans = array_slice($clans, $offset, $limit);
        } else {
            $clans = $this->clanRepository->findPaginated($limit, $offset, $status);
            $total = $this->clanRepository->count($status);
        }
        
        $clansData = array_map(function($clan) {
            return $clan->jsonSerialize();
        }, $clans);
        
        return $this->respondWithData([
            'clans' => $clansData,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit),
            ]
        ]);
    }
} 