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
            // Only load .env file if it exists (for local development)
            if (file_exists(__DIR__ . '/../../.env')) {
                $dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
                $dotenv->load();
            }

            // Check if Railway provides MYSQL_URL (single connection string)
            if (!empty($_ENV['MYSQL_URL'])) {
                $dsn = $_ENV['MYSQL_URL'];

                try {
                    self::$connection = new PDO($dsn);
                    self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    self::$connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                } catch (PDOException $e) {
                    error_log("Database connection failed with MYSQL_URL: " . $e->getMessage());
                    die("Database connection failed: " . $e->getMessage());
                }
            } else {
                // Fallback to individual environment variables
                $host = $_ENV['MYSQLHOST'] ?? $_ENV['DB_HOST'] ?? 'localhost';
                $db = $_ENV['MYSQLDATABASE'] ?? $_ENV['DB_NAME'] ?? 'railway';
                $user = $_ENV['MYSQLUSER'] ?? $_ENV['DB_USER'] ?? 'root';
                $pass = $_ENV['MYSQLPASSWORD'] ?? $_ENV['DB_PASS'] ?? '';
                $port = $_ENV['MYSQLPORT'] ?? $_ENV['DB_PORT'] ?? '3306';

                $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";


                try {
                    self::$connection = new PDO($dsn, $user, $pass);

                    // Set a few options to make PDO easier to work with
                    self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    self::$connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

                } catch (PDOException $e) {
                    error_log("Database connection failed with individual vars: " . $e->getMessage());
                    die("Database connection failed: " . $e->getMessage());
                }
            }
        }

        // Return the connection
        return self::$connection;
    }
}