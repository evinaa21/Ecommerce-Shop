<?php

namespace App\GraphQL\Types;

use App\GraphQL\TypeRegistry;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class CategoryType extends ObjectType
{
    public function __construct()
    {
        $config = [
            'name' => 'Category',
            'description' => 'Represents a product category',
            'fields' => function() {
                return [
                    'name' => [
                        'type' => Type::string(),
                        'description' => 'The name of the category',
                    ],
                    'products' => [
                        'type' => Type::listOf(TypeRegistry::productType()),
                        'description' => 'A list of products in this category',
                    ],
                ];
            },
        ];

        parent::__construct($config);
    }
}