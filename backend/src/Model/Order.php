<?php


namespace App\Model;

use App\Config\Database;
use PDO;
use Exception;

class Order
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    /**
     * Creates a new order in the database.
     *
     * @param array $products An array of products in the cart.
     * @param float $total The total amount of the order.
     * @return bool True on success, false on failure.
     */
    public function create(array $products, float $total): bool
    {
        $this->db->beginTransaction();

        try {

            $stmt = $this->db->prepare("INSERT INTO orders (total_amount) VALUES (:total)");
            $stmt->execute(['total' => $total]);
            $orderId = $this->db->lastInsertId();

            $stmt = $this->db->prepare(
                "INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, attributes_json) 
                 VALUES (:order_id, :product_id, :quantity, :price, :attributes)"
            );

            foreach ($products as $product) {
                $stmt->execute([
                    'order_id' => $orderId,
                    'product_id' => $product['productId'],
                    'quantity' => $product['quantity'],
                    'price' => $product['price'],
                    'attributes' => json_encode($product['attributes'])
                ]);
            }

            $this->db->commit();
            return true;

        } catch (Exception $e) {
            $this->db->rollBack();
            return false;
        }
    }
}