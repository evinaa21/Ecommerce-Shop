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

            // Debug logging
            error_log("MYSQL_URL exists: " . (isset($_ENV['MYSQL_URL']) ? 'YES' : 'NO'));
            error_log("MYSQLHOST exists: " . (isset($_ENV['MYSQLHOST']) ? 'YES' : 'NO'));

            if (isset($_ENV['MYSQL_URL'])) {
                error_log("MYSQL_URL value: " . substr($_ENV['MYSQL_URL'], 0, 30) . "...");
            }

            // Try MYSQL_URL first (Railway's preferred method)
            if (!empty($_ENV['MYSQL_URL'])) {
                $dsn = $_ENV['MYSQL_URL'];
                error_log("Using MYSQL_URL connection: " . $dsn);

                try {
                    error_log("Attempting PDO connection with MYSQL_URL...");
                    self::$connection = new PDO($dsn);
                    self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    self::$connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                    error_log("Database connected successfully with MYSQL_URL");
                    return self::$connection; // Return early on success
                } catch (PDOException $e) {
                    error_log("Database connection failed with MYSQL_URL: " . $e->getMessage());
                    error_log("PDO Error Code: " . $e->getCode());
                    error_log("Will try fallback method...");
                    // Don't throw here, continue to fallback
                }
            }

            // Fallback to individual variables (either MYSQL_URL failed or doesn't exist)
            error_log("Using fallback: individual environment variables...");

            $host = $_ENV['MYSQLHOST'] ?? $_ENV['DB_HOST'] ?? 'localhost';
            $db = $_ENV['MYSQLDATABASE'] ?? $_ENV['DB_NAME'] ?? 'railway';
            $user = $_ENV['MYSQLUSER'] ?? $_ENV['DB_USER'] ?? 'root';
            $pass = $_ENV['MYSQLPASSWORD'] ?? $_ENV['DB_PASS'] ?? '';
            $port = $_ENV['MYSQLPORT'] ?? $_ENV['DB_PORT'] ?? '3306';

            // Extract password from MYSQL_URL if MYSQLPASSWORD is empty
            if (empty($pass) && !empty($_ENV['MYSQL_URL'])) {
                error_log("MYSQLPASSWORD is empty, extracting from MYSQL_URL...");
                $url_parts = parse_url($_ENV['MYSQL_URL']);
                if (isset($url_parts['pass'])) {
                    $pass = $url_parts['pass'];
                    error_log("Extracted password from MYSQL_URL");
                }
            }

            error_log("Fallback connection details: host=$host, db=$db, user=$user, port=$port, pass=" . (empty($pass) ? 'EMPTY' : 'SET'));

            $fallback_dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";

            try {
                error_log("Attempting PDO connection with fallback variables...");
                self::$connection = new PDO($fallback_dsn, $user, $pass);
                self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                error_log("Database connected successfully with fallback vars");
            } catch (PDOException $fallback_e) {
                error_log("Database connection failed with fallback vars: " . $fallback_e->getMessage());
                error_log("PDO Error Code: " . $fallback_e->getCode());
                throw new PDOException("Database connection failed: " . $fallback_e->getMessage());
            }
        } else {
            error_log("Using existing database connection");
        }

        error_log("=== Database connection established ===");
        return self::$connection;
    }
}