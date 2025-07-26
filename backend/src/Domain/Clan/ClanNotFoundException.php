<?php

declare(strict_types=1);

namespace App\Domain\Clan;

use App\Domain\DomainException\DomainRecordNotFoundException;

class ClanNotFoundException extends DomainRecordNotFoundException
{
    public $message = 'The clan you requested does not exist.';
} 