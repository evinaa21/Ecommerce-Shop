<?php


namespace App\Model\Abstract;

use App\Config\Database;
use PDO;

abstract class AbstractProduct
{
    protected PDO $db;
    public string $id;
    public string $name;
    public bool $in_stock;
    public ?string $description;
    public string $category;
    public ?string $brand;
    public array $gallery = [];
    public array $prices = [];
    public array $attributes = [];

    public function __construct(array $data)
    {
        $this->db = Database::getConnection();

        $this->id = $data['id'];
        $this->name = $data['name'];
        $this->in_stock = $data['in_stock'];
        $this->description = $data['description'];
        $this->category = $data['category_name']; // We'll get this from our query
        $this->brand = $data['brand'];

        $this->loadDetails();
    }

    /**
     * Loads the detailed parts of the product (gallery, prices, attributes).
     * This is shared logic for all product types.
     */
    protected function loadDetails(): void
    {
        // Load Gallery
        $stmt = $this->db->prepare("SELECT url FROM product_gallery WHERE product_id = :id");
        $stmt->execute(['id' => $this->id]);
        $this->gallery = $stmt->fetchAll(PDO::FETCH_COLUMN);

        // Load Prices
        $stmt = $this->db->prepare("SELECT amount, currency_label, currency_symbol FROM product_prices WHERE product_id = :id");
        $stmt->execute(['id' => $this->id]);
        $this->prices = $stmt->fetchAll();

        // Load Attributes
        $this->loadAttributes();
    }

    /**
     * Abstract method for loading attributes.
     * Each concrete product class MUST implement this method,
     * allowing for different attribute-loading logic per product type.
     * This is the core of our polymorphism.
     */
    abstract protected function loadAttributes(): void;

    /**
     * Converts the object to an array for the GraphQL resolver.
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'in_stock' => $this->in_stock,
            'description' => $this->description,
            'category' => $this->category,
            'brand' => $this->brand,
            'gallery' => $this->gallery,
            'prices' => $this->prices,
            'attributes' => $this->attributes,
        ];
    }
}