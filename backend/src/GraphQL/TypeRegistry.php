<?php


namespace App\GraphQL;

use App\GraphQL\Types\CategoryType;
use App\GraphQL\Types\ProductType;
use App\GraphQL\Types\AttributeSetType;
use App\GraphQL\Types\AttributeItemType;
use App\GraphQL\Types\PriceType;
use App\GraphQL\Types\OrderInputType;

class TypeRegistry
{
    private static array $types = [];

    public static function categoryType(): CategoryType
    {
        return self::$types[CategoryType::class] ??= new CategoryType();
    }

    public static function productType(): ProductType
    {
        return self::$types[ProductType::class] ??= new ProductType();
    }

    public static function attributeSetType(): AttributeSetType
    {
        return self::$types[AttributeSetType::class] ??= new AttributeSetType();
    }

    public static function attributeItemType(): AttributeItemType
    {
        return self::$types[AttributeItemType::class] ??= new AttributeItemType();
    }

    public static function priceType(): PriceType
    {
        return self::$types[PriceType::class] ??= new PriceType();
    }

    public static function orderInputType(): OrderInputType
    {
        return self::$types[OrderInputType::class] ??= new OrderInputType();
    }
}