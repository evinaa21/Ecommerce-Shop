<?php

namespace App\GraphQL\Types;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class AttributeItemType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'AttributeItem',
            'description' => 'Represents a single attribute item (e.g., S, M, L).',
            'fields' => [
                'display_value' => Type::string(),
                'value' => Type::string(),
            ],
        ]);
    }
}