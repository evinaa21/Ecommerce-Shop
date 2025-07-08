<?php


namespace App\GraphQL\Mutation;

use GraphQL\Type\Definition\ObjectType;

class MutationType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'Mutation',
            'fields' => [
                'createOrder' => OrderMutation::createOrder(),
            ]
        ]);
    }
}