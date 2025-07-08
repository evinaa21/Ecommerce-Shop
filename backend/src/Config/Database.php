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
        error_log("=== Database::getConnection() called ===");

        if (self::$connection === null) {
            error_log("Creating new database connection...");

            // Load .env file only for local development
            if (file_exists(__DIR__ . '/../../.env') && !isset($_ENV['MYSQL_URL'])) {
                error_log("Loading .env file for local development");
                try {
                    $dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
                    $dotenv->load();
                    error_log(".env file loaded successfully");
                } catch (Exception $e) {
                    error_log("Could not load .env file: " . $e->getMessage());
                }
            } else {
                error_log("Skipping .env file - using Railway environment variables");
            }

            // Debug all environment variables
            error_log("=== ALL MYSQL ENVIRONMENT VARIABLES ===");
            error_log("MYSQL_URL: " . ($_ENV['MYSQL_URL'] ?? 'NOT SET'));
            error_log("MYSQLHOST: " . ($_ENV['MYSQLHOST'] ?? 'NOT SET'));
            error_log("MYSQLDATABASE: " . ($_ENV['MYSQLDATABASE'] ?? 'NOT SET'));
            error_log("MYSQLUSER: " . ($_ENV['MYSQLUSER'] ?? 'NOT SET'));
            error_log("MYSQLPASSWORD: " . (empty($_ENV['MYSQLPASSWORD']) ? 'EMPTY' : 'SET'));
            error_log("MYSQLPORT: " . ($_ENV['MYSQLPORT'] ?? 'NOT SET'));
            error_log("=== END ENVIRONMENT VARIABLES ===");

            $connectionEstablished = false;

            // Try MYSQL_URL first (Railway's preferred method)
            if (!empty($_ENV['MYSQL_URL'])) {
                $dsn = $_ENV['MYSQL_URL'];
                error_log("Attempting connection with MYSQL_URL: " . $dsn);

                try {
                    self::$connection = new PDO($dsn);
                    self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    self::$connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                    error_log("✅ Database connected successfully with MYSQL_URL");
                    $connectionEstablished = true;
                } catch (PDOException $e) {
                    error_log("❌ MYSQL_URL connection failed: " . $e->getMessage());
                    error_log("Error code: " . $e->getCode());
                    error_log("Will try fallback method...");
                    // Don't return or throw - continue to fallback
                }
            }

            // Fallback to individual variables if MYSQL_URL failed or doesn't exist
            if (!$connectionEstablished) {
                error_log("Attempting fallback connection with individual variables...");

                $host = $_ENV['MYSQLHOST'] ?? $_ENV['DB_HOST'] ?? 'localhost';
                $db = $_ENV['MYSQLDATABASE'] ?? $_ENV['DB_NAME'] ?? 'railway';
                $user = $_ENV['MYSQLUSER'] ?? $_ENV['DB_USER'] ?? 'root';
                $pass = $_ENV['MYSQLPASSWORD'] ?? $_ENV['DB_PASS'] ?? '';
                $port = $_ENV['MYSQLPORT'] ?? $_ENV['DB_PORT'] ?? '3306';

                // Extract password from MYSQL_URL if MYSQLPASSWORD is empty
                if (empty($pass) && !empty($_ENV['MYSQL_URL'])) {
                    error_log("Extracting password from MYSQL_URL...");
                    $url_parts = parse_url($_ENV['MYSQL_URL']);
                    if (isset($url_parts['pass'])) {
                        $pass = $url_parts['pass'];
                        error_log("✅ Password extracted from MYSQL_URL");
                    }
                }

                error_log("Fallback details: host=$host, db=$db, user=$user, port=$port, pass=" . (empty($pass) ? 'EMPTY' : 'SET'));

                $fallback_dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";
                error_log("Fallback DSN: $fallback_dsn");

                try {
                    self::$connection = new PDO($fallback_dsn, $user, $pass);
                    self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    self::$connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                    error_log("✅ Database connected successfully with fallback");
                    $connectionEstablished = true;
                } catch (PDOException $fallback_e) {
                    error_log("❌ Fallback connection failed: " . $fallback_e->getMessage());
                    error_log("Fallback error code: " . $fallback_e->getCode());
                    throw new PDOException("Database connection failed: " . $fallback_e->getMessage());
                }
            }

            if (!$connectionEstablished) {
                throw new PDOException("Unable to establish database connection with any method");
            }
        } else {
            error_log("Using existing database connection");
        }

        error_log("=== Database connection established ===");
        return self::$connection;
    }
}