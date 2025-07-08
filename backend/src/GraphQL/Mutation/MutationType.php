<?php

namespace App\GraphQL\Mutation;

use App\GraphQL\Types\OrderInputType;
use App\Model\Order;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use App\GraphQL\Mutation\OrderMutation;

class MutationType extends ObjectType
{
    public function __construct()
    {
        $config = [
            'name' => 'Mutation',
            'fields' => [
                'placeOrder' => OrderMutation::createOrder()
            ]
        ];

        parent::__construct($config);
    }
}