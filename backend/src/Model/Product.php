<?php

// We're using a namespace to organize our code - this class lives in App\Model
namespace App\Model;

use App\Config\Database;
use App\Model\Product\ClothingProduct;
use App\Model\Product\TechProduct;
use App\Model\Product\GenericProduct;
use App\Model\Abstract\AbstractProduct;
use PDO;

class Product
{
    private PDO $db;
    private static array $cache = [];

    // Explicit category → class map to avoid relying on naming conventions.
    private const CATEGORY_CLASS_MAP = [
        'clothes' => ClothingProduct::class,
        'clothing' => ClothingProduct::class, // Handle both variants
        'tech' => TechProduct::class,
        'technology' => TechProduct::class,
        // Add more mappings as needed
    ];

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Factory method to create a product object based on its category.
     */
    private function factory(array $data): AbstractProduct
    {
        $categoryKey = strtolower(trim($data['category_name'] ?? ''));
        
        if (isset(self::CATEGORY_CLASS_MAP[$categoryKey])) {
            $className = self::CATEGORY_CLASS_MAP[$categoryKey];
            return new $className($data);
        }
        
        // Safe fallback to generic product instead of assuming ClothingProduct
        return new GenericProduct($data);
    }

    public function findById(string $id): ?AbstractProduct
    {
        // Simple in-memory cache
        $cacheKey = "product_$id";
        if (isset(self::$cache[$cacheKey])) {
            return self::$cache[$cacheKey];
        }

        $stmt = $this->db->prepare("
            SELECT p.*, c.name as category_name
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.id = :id
        ");
        $stmt->execute(['id' => $id]);
        $data = $stmt->fetch();

        $product = $data ? $this->factory($data) : null;
        
        if ($product) {
            self::$cache[$cacheKey] = $product;
        }

        return $product;
    }

    public function findByCategory(string $categoryName): array
    {
        $cacheKey = "category_$categoryName";
        if (isset(self::$cache[$cacheKey])) {
            return self::$cache[$cacheKey];
        }

        // Optimized single query with JOINs
        $sql = "
            SELECT 
                p.id, p.name, p.in_stock, p.brand,
                c.name as category_name,
                pg.url as gallery_url,
                pp.amount, pp.currency_label, pp.currency_symbol,
                attrs.id as attr_id, attrs.name as attr_name, attrs.type as attr_type,
                ai.display_value, ai.value as attr_value
            FROM products p
            JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_gallery pg ON p.id = pg.product_id
            LEFT JOIN product_prices pp ON p.id = pp.product_id
            LEFT JOIN attribute_sets attrs ON p.id = attrs.product_id
            LEFT JOIN attribute_items ai ON attrs.id = ai.attribute_set_id
        ";

        if ($categoryName !== 'all') {
            $sql .= " WHERE c.name = :categoryName";
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['categoryName' => $categoryName]);
        } else {
            $stmt = $this->db->query($sql);
        }

        $products = [];
        $productMap = [];

        while ($row = $stmt->fetch()) {
            $productId = $row['id'];
            
            if (!isset($productMap[$productId])) {
                $productMap[$productId] = [
                    'id' => $productId,
                    'name' => $row['name'],
                    'in_stock' => $row['in_stock'],
                    'brand' => $row['brand'],
                    'gallery' => [],
                    'prices' => [],
                    'attributes' => []
                ];
            }

            // Add gallery image if exists
            if ($row['gallery_url'] && !in_array($row['gallery_url'], $productMap[$productId]['gallery'])) {
                $productMap[$productId]['gallery'][] = $row['gallery_url'];
            }

            // Add price if exists
            if ($row['amount'] && !$this->priceExists($productMap[$productId]['prices'], $row)) {
                $productMap[$productId]['prices'][] = [
                    'amount' => $row['amount'],
                    'currency_label' => $row['currency_label'],
                    'currency_symbol' => $row['currency_symbol']
                ];
            }

            // Add attributes if exists
            if ($row['attr_id']) {
                $this->addAttributeToProduct($productMap[$productId], $row);
            }
        }

        $products = array_values($productMap);
        self::$cache[$cacheKey] = $products;

        return $products;
    }

    private function priceExists(array $prices, array $row): bool
    {
        foreach ($prices as $price) {
            if ($price['amount'] == $row['amount'] && 
                $price['currency_label'] == $row['currency_label']) {
                return true;
            }
        }
        return false;
    }

    private function addAttributeToProduct(array &$product, array $row): void
    {
        $attrId = $row['attr_id'];
        $attrIndex = null;

        // Find existing attribute
        foreach ($product['attributes'] as $index => $attr) {
            if ($attr['id'] == $attrId) {
                $attrIndex = $index;
                break;
            }
        }

        // Create new attribute if not exists
        if ($attrIndex === null) {
            $product['attributes'][] = [
                'id' => $attrId,
                'name' => $row['attr_name'],
                'type' => $row['attr_type'],
                'items' => []
            ];
            $attrIndex = count($product['attributes']) - 1;
        }

        // Add item if not exists
        if ($row['attr_value']) {
            $itemExists = false;
            foreach ($product['attributes'][$attrIndex]['items'] as $item) {
                if ($item['value'] == $row['attr_value']) {
                    $itemExists = true;
                    break;
                }
            }

            if (!$itemExists) {
                $product['attributes'][$attrIndex]['items'][] = [
                    'display_value' => $row['display_value'],
                    'value' => $row['attr_value']
                ];
            }
        }
    }
}
