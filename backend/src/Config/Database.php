<?php

namespace App\Config;


use PDO;
use PDOException;
use Dotenv\Dotenv;


class Database
{
    // This will hold our one and only database connection
    private static ?PDO $connection = null;


    /**
     * This is the main method that returns the database connection.
     * If the connection doesn't exist, it creates it.
     * If it already exists, it returns the existing one.
     *
     * @return PDO
     */
    public static function getConnection(): PDO
    {
        if (self::$connection === null) {
            // Load the database credentials from the .env file
            $dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
            $dotenv->load();

            $host = $_ENV['DB_HOST'];
            $db   = $_ENV['DB_NAME'];
            $user = $_ENV['DB_USER'];
            $pass = $_ENV['DB_PASS'];

            $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";


            try {
                // Create the one-time database connection
                self::$connection = new PDO($dsn, $user, $pass);

                // Set a few options to make PDO easier to work with
                self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

            } catch (PDOException $e) {
                // If connection fails, stop the application and show the error
                die("Database connection failed: " . $e->getMessage());
            }
        }

        // Return the connection
        return self::$connection;
    }
}