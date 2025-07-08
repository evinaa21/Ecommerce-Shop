<?php

namespace App\Config;

use PDO;
use PDOException;
use Dotenv\Dotenv;

class Database
{
    private static ?PDO $connection = null;

    public static function getConnection(): PDO
    {
        if (self::$connection === null) {
            // Load .env file only for local development
            if (file_exists(__DIR__ . '/../../.env') && !isset($_ENV['MYSQL_URL'])) {
                try {
                    $dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
                    $dotenv->load();
                } catch (Exception $e) {
                    error_log("Could not load .env file: " . $e->getMessage());
                }
            }

            // Debug logging
            error_log("MYSQL_URL exists: " . (isset($_ENV['MYSQL_URL']) ? 'YES' : 'NO'));
            error_log("MYSQLHOST exists: " . (isset($_ENV['MYSQLHOST']) ? 'YES' : 'NO'));

            // Try MYSQL_URL first (Railway's preferred method)
            if (!empty($_ENV['MYSQL_URL'])) {
                $dsn = $_ENV['MYSQL_URL'];
                error_log("Using MYSQL_URL connection");

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
                // Fallback to individual environment variables
                error_log("MYSQL_URL not available, using individual variables");

                $host = $_ENV['MYSQLHOST'] ?? $_ENV['DB_HOST'] ?? 'localhost';
                $db = $_ENV['MYSQLDATABASE'] ?? $_ENV['DB_NAME'] ?? 'railway';
                $user = $_ENV['MYSQLUSER'] ?? $_ENV['DB_USER'] ?? 'root';
                $pass = $_ENV['MYSQLPASSWORD'] ?? $_ENV['DB_PASS'] ?? '';
                $port = $_ENV['MYSQLPORT'] ?? $_ENV['DB_PORT'] ?? '3306';

                error_log("Connection details: host=$host, db=$db, user=$user, port=$port");

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

        return self::$connection;
    }
}