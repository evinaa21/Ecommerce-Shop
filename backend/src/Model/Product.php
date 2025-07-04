<?php

// We're using a namespace to organize our code - this class lives in App\Model
namespace App\Model;

use App\Config\Database;
use App\Model\Product\ClothingProduct;
use App\Model\Product\TechProduct;
use App\Model\Abstract\AbstractProduct;
use PDO;

/**
 * This class now acts as a Repository and a Factory.
 * It fetches product data and creates the correct polymorphic product object.
 */
class Product
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Factory method to create a product object based on its category.
     */
    private function factory(array $data): AbstractProduct
    {
        // No if/switch block. We use the category name to dynamically
        // determine the class name. This is a clean, polymorphic approach.
        $category = ucfirst($data['category_name']);
        $className = "App\\Model\\Product\\{$category}Product";

        if (class_exists($className)) {
            return new $className($data);
        }

        // Fallback for categories like 'all' or if a class doesn't exist
        return new ClothingProduct($data); // Or a generic product class
    }

    public function findById(string $id): ?AbstractProduct
    {
        $stmt = $this->db->prepare("
            SELECT p.*, c.name as category_name
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.id = :id
        ");
        $stmt->execute(['id' => $id]);
        $data = $stmt->fetch();

        return $data ? $this->factory($data) : null;
    }

    public function findByCategory(string $categoryName): array
    {
        $sql = "
            SELECT p.*, c.name as category_name
            FROM products p
            JOIN categories c ON p.category_id = c.id
        ";

        if ($categoryName !== 'all') {
            $sql .= " WHERE c.name = :categoryName";
            $stmt = $this->db->prepare($sql);
            $stmt->execute(['categoryName' => $categoryName]);
        } else {
            $stmt = $this->db->query($sql);
        }

        $products = [];
        while ($row = $stmt->fetch()) {
            // We don't need to load details here as the factory does it.
            // We just need enough info for the product list page.
            $products[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'in_stock' => $row['in_stock'],
                'brand' => $row['brand'],
                // Simplified data for list view
                'gallery' => $this->getFirstGalleryImage($row['id']),
                'prices' => $this->getFirstPrice($row['id']),
                'attributes' => $this->getBasicAttributes($row['id']), // Add this
            ];
        }
        return $products;
    }

    // Helper methods for the list view to keep it fast
    private function getFirstGalleryImage(string $productId): array
    {
        $stmt = $this->db->prepare("SELECT url FROM product_gallery WHERE product_id = :id ORDER BY id LIMIT 1");
        $stmt->execute(['id' => $productId]);
        $url = $stmt->fetchColumn();
        return $url ? [$url] : [];
    }

    private function getFirstPrice(string $productId): array
    {
        $stmt = $this->db->prepare("SELECT amount, currency_label, currency_symbol FROM product_prices WHERE product_id = :id LIMIT 1");
        $stmt->execute(['id' => $productId]);
        $price = $stmt->fetch();
        return $price ? [$price] : [];
    }

    private function getBasicAttributes(string $productId): array
    {
        $stmt = $this->db->prepare("SELECT id, name, type FROM attribute_sets WHERE product_id = :id");
        $stmt->execute(['id' => $productId]);
        $attributes = $stmt->fetchAll();

        $itemStmt = $this->db->prepare("SELECT display_value, value FROM attribute_items WHERE attribute_set_id = :attribute_set_id");
        foreach ($attributes as $key => $attribute) {
            $itemStmt->execute(['attribute_set_id' => $attribute['id']]);
            $attributes[$key]['items'] = $itemStmt->fetchAll();
        }
        return $attributes;
    }
}
