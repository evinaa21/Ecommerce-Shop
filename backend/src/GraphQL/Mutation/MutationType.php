<?php

namespace App\GraphQL\Mutation;

use App\GraphQL\Types\OrderInputType;
use App\Model\Order;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;

class MutationType extends ObjectType
{
    public function __construct()
    {
        $config = [
            'name' => 'Mutation',
            'fields' => [
                'placeOrder' => [
                    'type' => Type::boolean(),
                    'description' => 'Places a new order and returns success status',
                    'args' => [
                        'products' => Type::nonNull(Type::listOf(Type::nonNull(new OrderInputType()))),
                        'total' => Type::nonNull(Type::float())
                    ],
                    'resolve' => function ($root, $args) {
                        $orderModel = new Order();

                        // Convert input to format expected by Order::create
                        $products = array_map(function ($product) {
                            return [
                                'productId' => $product['productId'],
                                'quantity' => $product['quantity'],
                                'price' => $product['price'],
                                'attributes' => json_decode($product['attributes'] ?? '{}', true)
                            ];
                        }, $args['products']);

                        return $orderModel->create($products, $args['total']);
                    }
                ]
            ]
        ];

        parent::__construct($config);
    }
}