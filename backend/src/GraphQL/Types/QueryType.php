<?php

namespace App\GraphQL\Types;

use App\GraphQL\TypeRegistry;
use App\Model\Category;
use App\Model\Product;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class QueryType extends ObjectType
{
    public function __construct()
    {
        $config = [
            'name' => 'Query',
            'fields' => [
                'categories' => [
                    'type' => Type::listOf(TypeRegistry::categoryType()),
                    'description' => 'Returns all available categories',
                    'resolve' => function () {
                        $categoryModel = new Category();
                        return $categoryModel->findAll();
                    }
                ],
                'category' => [
                    'type' => TypeRegistry::categoryType(),
                    'description' => 'Returns a single category by name, with its products',
                    'args' => [
                        'title' => Type::nonNull(Type::string()),
                    ],
                    'resolve' => function ($root, $args) {
                        $categoryModel = new Category();
                        $category = $categoryModel->findByName($args['title']);

                        $productModel = new Product();
                        $category['products'] = $productModel->findByCategory($args['title']);

                        return $category;
                    }
                ],
                'product' => [
                    'type' => TypeRegistry::productType(),
                    'description' => 'Returns a single product by its ID',
                    'args' => [
                        'id' => Type::nonNull(Type::string()),
                    ],
                    'resolve' => function ($root, $args) {
                        $productModel = new Product();
                        $productObject = $productModel->findById($args['id']);
                        return $productObject ? $productObject->toArray() : null;
                    }
                ],
            ],
        ];

        parent::__construct($config);
    }
}