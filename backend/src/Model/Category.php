<?php

namespace App\Model;

use App\Config\Database;
use PDO;
use PDOException;
use Exception;

class Category
{
    private PDO $db;
    private static array $cache = [];
    private static int $cacheTime = 300; // 5 minutes

    public function __construct()
    {
        try {
            $this->db = Database::getConnection();
        } catch (PDOException $e) {
            error_log("Category model database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed");
        }
    }

    /**
     * Get all categories with caching
     * @return array
     * @throws Exception
     */
    public function findAll(): array
    {
        $cacheKey = 'all_categories';
        
        // Check cache first
        if (isset(self::$cache[$cacheKey])) {
            $cacheData = self::$cache[$cacheKey];
            if (time() - $cacheData['timestamp'] < self::$cacheTime) {
                return $cacheData['data'];
            }
        }

        try {
            $stmt = $this->db->prepare("SELECT name FROM categories WHERE name != 'all' ORDER BY name");
            $stmt->execute();
            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Cache the result
            self::$cache[$cacheKey] = [
                'data' => $categories,
                'timestamp' => time()
            ];
            
            return $categories;
            
        } catch (PDOException $e) {
            error_log("Category findAll query failed: " . $e->getMessage());
            
            // Return fallback categories on database error
            return [
                ['name' => 'clothes'],
                ['name' => 'tech']
            ];
        }
    }

    /**
     * Find category by name with caching and better error handling
     * @param string $name
     * @return array|null
     * @throws Exception
     */
    public function findByName(string $name): ?array
    {
        if (empty($name)) {
            throw new Exception("Category name cannot be empty");
        }

        $cacheKey = "category_{$name}";
        
        // Check cache first
        if (isset(self::$cache[$cacheKey])) {
            $cacheData = self::$cache[$cacheKey];
            if (time() - $cacheData['timestamp'] < self::$cacheTime) {
                return $cacheData['data'];
            }
        }

        try {
            if ($name === 'all') {
                // Special handling for 'all' category
                $result = [
                    'name' => 'all',
                    'products' => $this->getAllProducts()
                ];
            } else {
                $stmt = $this->db->prepare("
                    SELECT c.name, 
                           p.id, p.name as product_name, p.in_stock, p.description, p.brand,
                           GROUP_CONCAT(DISTINCT pg.url ORDER BY pg.id) as gallery_urls,
                           pr.currency_label, pr.currency_symbol, pr.amount
                    FROM categories c
                    LEFT JOIN products p ON c.id = p.category_id
                    LEFT JOIN product_gallery pg ON p.id = pg.product_id
                    LEFT JOIN product_prices pr ON p.id = pr.product_id
                    WHERE c.name = :name
                    GROUP BY p.id, pr.id
                    ORDER BY p.name
                ");
                
                $stmt->execute(['name' => $name]);
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if (empty($rows)) {
                    return null;
                }

                $result = [
                    'name' => $name,
                    'products' => $this->formatProducts($rows)
                ];
            }
            
            // Cache the result
            self::$cache[$cacheKey] = [
                'data' => $result,
                'timestamp' => time()
            ];
            
            return $result;
            
        } catch (PDOException $e) {
            error_log("Category findByName query failed for '{$name}': " . $e->getMessage());
            
            // Return fallback empty category
            return [
                'name' => $name,
                'products' => []
            ];
        }
    }

    private function getAllProducts(): array
    {
        try {
            $stmt = $this->db->prepare("
                SELECT p.id, p.name, p.in_stock, p.description, p.brand,
                       GROUP_CONCAT(DISTINCT pg.url ORDER BY pg.id) as gallery_urls,
                       pr.currency_label, pr.currency_symbol, pr.amount
                FROM products p
                LEFT JOIN product_gallery pg ON p.id = pg.product_id
                LEFT JOIN product_prices pr ON p.id = pr.product_id
                GROUP BY p.id, pr.id
                ORDER BY p.name
            ");
            
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return $this->formatProducts($rows);
            
        } catch (PDOException $e) {
            error_log("Get all products query failed: " . $e->getMessage());
            return [];
        }
    }

    private function formatProducts(array $rows): array
    {
        $productsMap = [];
        
        foreach ($rows as $row) {
            $productId = $row['id'];
            
            if (!isset($productsMap[$productId])) {
                $productsMap[$productId] = [
                    'id' => $productId,
                    'name' => $row['product_name'] ?? $row['name'],
                    'in_stock' => (bool)$row['in_stock'],
                    'description' => $row['description'],
                    'brand' => $row['brand'],
                    'gallery' => $row['gallery_urls'] ? explode(',', $row['gallery_urls']) : [],
                    'prices' => [],
                    'attributes' => []
                ];
            }
            
            // Add price if available
            if ($row['currency_label'] && $row['currency_symbol'] && $row['amount']) {
                $productsMap[$productId]['prices'][] = [
                    'currency_label' => $row['currency_label'],
                    'currency_symbol' => $row['currency_symbol'],
                    'amount' => (float)$row['amount']
                ];
            }
        }
        
        // Load attributes for each product
        foreach ($productsMap as $productId => &$product) {
            $product['attributes'] = $this->getProductAttributes($productId);
        }
        
        return array_values($productsMap);
    }

    private function getProductAttributes(string $productId): array
    {
        try {
            $stmt = $this->db->prepare("
                SELECT ast.id, ast.name, ast.type,
                       ai.display_value, ai.value
                FROM attribute_sets ast
                LEFT JOIN attribute_items ai ON ast.id = ai.attribute_set_id
                WHERE ast.product_id = :product_id
                ORDER BY ast.id, ai.id
            ");
            
            $stmt->execute(['product_id' => $productId]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $attributesMap = [];
            
            foreach ($rows as $row) {
                $attrId = $row['id'];
                
                if (!isset($attributesMap[$attrId])) {
                    $attributesMap[$attrId] = [
                        'id' => $attrId,
                        'name' => $row['name'],
                        'type' => $row['type'],
                        'items' => []
                    ];
                }
                
                if ($row['display_value'] && $row['value']) {
                    $attributesMap[$attrId]['items'][] = [
                        'display_value' => $row['display_value'],
                        'value' => $row['value']
                    ];
                }
            }
            
            return array_values($attributesMap);
            
        } catch (PDOException $e) {
            error_log("Get product attributes failed for product '{$productId}': " . $e->getMessage());
            return [];
        }
    }

    public static function clearCache(): void
    {
        self::$cache = [];
    }
}