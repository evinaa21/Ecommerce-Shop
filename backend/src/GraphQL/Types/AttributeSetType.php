<?php

namespace App\GraphQL\Types;

use App\GraphQL\TypeRegistry;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class AttributeSetType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'AttributeSet',
            'description' => 'Represents a set of attributes for a product (e.g., Size, Color).',
            'fields' => function() {
                return [
                    'id' => Type::id(),
                    'name' => Type::string(),
                    'type' => Type::string(),
                    'items' => Type::listOf(TypeRegistry::attributeItemType()),
                ];
            },
        ]);
    }
}