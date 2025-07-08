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
            // Only load .env file for local development (not on Railway)
            if (file_exists(__DIR__ . '/../../.env') && !isset($_ENV['RAILWAY_ENVIRONMENT'])) {
                $dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
                $dotenv->load();
            }

            // Debug: Log what we have available
            error_log("MYSQL_URL exists: " . (isset($_ENV['MYSQL_URL']) ? 'YES' : 'NO'));
            if (isset($_ENV['MYSQL_URL'])) {
                error_log("MYSQL_URL starts with: " . substr($_ENV['MYSQL_URL'], 0, 10));
            }

            // Check if Railway provides MYSQL_URL (single connection string)
            if (!empty($_ENV['MYSQL_URL'])) {
                $dsn = $_ENV['MYSQL_URL'];

                try {
                    self::$connection = new PDO($dsn);
                    self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    self::$connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                    error_log("Database connected successfully with MYSQL_URL");
                } catch (PDOException $e) {
                    error_log("Database connection failed with MYSQL_URL: " . $e->getMessage());
                    throw new PDOException("Database connection failed: " . $e->getMessage());
                }
            } else {
                // This should not happen on Railway if MYSQL_URL is set
                error_log("MYSQL_URL not available, attempting individual variables");

                $host = $_ENV['MYSQLHOST'] ?? 'localhost';
                $db = $_ENV['MYSQLDATABASE'] ?? 'railway';
                $user = $_ENV['MYSQLUSER'] ?? 'root';
                $pass = $_ENV['MYSQLPASSWORD'] ?? '';
                $port = $_ENV['MYSQLPORT'] ?? '3306';

                $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";

                try {
                    self::$connection = new PDO($dsn, $user, $pass);
                    self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    self::$connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                    error_log("Database connected successfully with individual vars");
                } catch (PDOException $e) {
                    error_log("Database connection failed with individual vars: " . $e->getMessage());
                    throw new PDOException("Database connection failed: " . $e->getMessage());
                }
            }
        }

        // Return the connection
        return self::$connection;
    }
}