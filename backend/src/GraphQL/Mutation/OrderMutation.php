<?php

namespace App\GraphQL\Mutation;

use App\Model\Order;
use GraphQL\Type\Definition\Type;
use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\ObjectType;

class OrderMutation
{
    public static function createOrder(): array
    {
        // Define the structure of a single product coming from the cart
        $productInputType = new InputObjectType([
            'name' => 'ProductInput',
            'fields' => [
                'productId' => Type::nonNull(Type::string()),
                'quantity' => Type::nonNull(Type::int()),
                'price' => Type::nonNull(Type::float()),
                'attributes' => Type::nonNull(Type::listOf(new InputObjectType([
                    'name' => 'AttributeInput',
                    'fields' => [
                        'name' => Type::string(),
                        'value' => Type::string()
                    ]
                ])))
            ]
        ]);

        return [
            'type' => new ObjectType([
                'name' => 'CreateOrderPayload',
                'fields' => [
                    'success' => Type::boolean(),
                    'message' => Type::string()
                ]
            ]),
            'args' => [
                'products' => Type::nonNull(Type::listOf($productInputType)),
                'total' => Type::nonNull(Type::float())
            ],
            'resolve' => function ($root, $args) {
                $orderModel = new Order();
                $success = $orderModel->create($args['products'], $args['total']);

                return [
                    'success' => $success,
                    'message' => $success ? 'Order placed successfully!' : 'Failed to place order.'
                ];
            }
        ];
    }
}