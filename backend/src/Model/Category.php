<?php

namespace App\Model;

use App\Config\Database;
use PDO;


class Category
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }


    /**
     * Returns all categories except 'all' (which is handled separately in frontend)
     */


    public function findAll(): array
    {
        $stmt = $this->db->query("SELECT * FROM categories WHERE name != 'all'");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Fetches a single category by its name.
     *
     * @param string $name The name of the category to find.
     * @return array|false The category data or false if not found.
     */
    public function findByName(string $name)
    {
        $stmt = $this->db->prepare("SELECT * FROM categories WHERE name = :name");
        $stmt->execute(['name' => $name]);
        return $stmt->fetch();
    }
}