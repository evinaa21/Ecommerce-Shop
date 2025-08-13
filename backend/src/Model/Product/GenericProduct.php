<?php


namespace App\Model\Product;

use App\Model\Abstract\AbstractProduct;

class GenericProduct extends AbstractProduct
{
    protected function loadAttributes(): void
    {
        // Load all attribute sets generically
        $stmt = $this->db->prepare("SELECT id, name, type FROM attribute_sets WHERE product_id = :id");
        $stmt->execute(['id' => $this->id]);
        $attributes = $stmt->fetchAll();

        $itemStmt = $this->db->prepare("SELECT display_value, value FROM attribute_items WHERE attribute_set_id = :attribute_set_id");
        foreach ($attributes as $k => $attr) {
            $itemStmt->execute(['attribute_set_id' => $attr['id']]);
            $attributes[$k]['items'] = $itemStmt->fetchAll();
        }
        $this->attributes = $attributes;
    }
}