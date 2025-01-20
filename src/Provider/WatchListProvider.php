<?php

namespace App\Provider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\WatchList;
use Doctrine\ORM\EntityManagerInterface;

final class WatchListProvider implements ProviderInterface
{
    public function __construct(private readonly EntityManagerInterface $entityManager)
    {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
//        dd($uriVariables);
        return $this->entityManager->getRepository(WatchList::class)->findOneBy(['token' => $uriVariables['token']]);
    }
}