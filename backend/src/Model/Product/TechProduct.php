<?php


namespace App\Model\Product;

use App\Model\Abstract\AbstractProduct;
use PDO;

class TechProduct extends AbstractProduct
{
    protected function loadAttributes(): void
    {
        // A tech product could have different logic, e.g., filtering for specific tech attributes.
        // For this test, demonstrating the structure is key. The logic can be identical for now.
        $stmt = $this->db->prepare("SELECT id, name, type FROM attribute_sets WHERE product_id = :id");
        $stmt->execute(['id' => $this->id]);
        $attributes = $stmt->fetchAll();

        $itemStmt = $this->db->prepare("SELECT display_value, value FROM attribute_items WHERE attribute_set_id = :attribute_set_id");
        foreach ($attributes as $key => $attribute) {
            $itemStmt->execute(['attribute_set_id' => $attribute['id']]);
            $attributes[$key]['items'] = $itemStmt->fetchAll();
        }
        $this->attributes = $attributes;
    }
}