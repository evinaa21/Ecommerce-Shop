<?php

namespace App\GraphQL\Types;

use App\GraphQL\TypeRegistry;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class ProductType extends ObjectType
{
    public function __construct()
    {
        parent::__construct([
            'name' => 'Product',
            'description' => 'Represents a product available for purchase.',
            'fields' => function() {
                return [
                    'id' => Type::id(),
                    'name' => Type::string(),
                    'in_stock' => Type::boolean(),
                    'gallery' => Type::listOf(Type::string()),
                    'description' => Type::string(),
                    'brand' => Type::string(),
                    'attributes' => Type::listOf(TypeRegistry::attributeSetType()),
                    'prices' => Type::listOf(TypeRegistry::priceType()),
                ];
            },
        ]);
    }
}