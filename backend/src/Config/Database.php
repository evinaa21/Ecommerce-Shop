<?php

namespace App\Config;

use PDO;
use PDOException;
use Dotenv\Dotenv;

class Database
{
    private static ?PDO $connection = null;
    private static int $retryAttempts = 3;
    private static int $retryDelay = 1; // seconds

    public static function getConnection(): PDO
    {
        error_log("=== Database::getConnection() called ===");

        if (self::$connection === null) {
            error_log("Creating new database connection...");


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

            // debug for all environment variables
            error_log("=== ALL MYSQL ENVIRONMENT VARIABLES ===");
            error_log("MYSQL_URL: " . ($_ENV['MYSQL_URL'] ?? 'NOT SET'));
            error_log("MYSQLHOST: " . ($_ENV['MYSQLHOST'] ?? 'NOT SET'));
            error_log("MYSQLDATABASE: " . ($_ENV['MYSQLDATABASE'] ?? 'NOT SET'));
            error_log("MYSQLUSER: " . ($_ENV['MYSQLUSER'] ?? 'NOT SET'));
            error_log("MYSQLPASSWORD: " . (empty($_ENV['MYSQLPASSWORD']) ? 'EMPTY' : 'SET'));
            error_log("MYSQLPORT: " . ($_ENV['MYSQLPORT'] ?? 'NOT SET'));
            error_log("=== END ENVIRONMENT VARIABLES ===");

            $connectionEstablished = false;


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


            if (!$connectionEstablished) {
                error_log("Attempting fallback by parsing MYSQL_URL or using ENV vars…");

                if (!empty($_ENV['MYSQL_URL'])) {

                    $parts = parse_url($_ENV['MYSQL_URL']);
                    $host = $parts['host'] ?? 'localhost';
                    $port = $parts['port'] ?? '3306';
                    $user = $parts['user'] ?? ($_ENV['MYSQLUSER'] ?? 'root');
                    $pass = $parts['pass'] ?? ($_ENV['MYSQLPASSWORD'] ?? '');
                    $db = ltrim($parts['path'] ?? '', '/');
                    error_log("Parsed fallback from MYSQL_URL: host=$host port=$port db=$db user=$user");
                } else {

                    $host = $_ENV['MYSQLHOST'] ?? $_ENV['DB_HOST'] ?? 'localhost';
                    $port = $_ENV['MYSQLPORT'] ?? $_ENV['DB_PORT'] ?? '3306';
                    $user = $_ENV['MYSQLUSER'] ?? $_ENV['DB_USER'] ?? 'root';
                    $pass = $_ENV['MYSQLPASSWORD'] ?? $_ENV['DB_PASS'] ?? '';
                    $db = $_ENV['MYSQLDATABASE'] ?? $_ENV['DB_NAME'] ?? 'railway';
                    error_log("Fallback from ENV VARS: host=$host port=$port db=$db user=$user");
                }

                $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";
                error_log("Fallback DSN: $dsn");

                try {
                    self::$connection = new PDO($dsn, $user, $pass);
                    self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    self::$connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                    error_log("✅ Database connected successfully via fallback");
                    $connectionEstablished = true;
                } catch (PDOException $e) {
                    error_log("❌ Fallback connection failed: " . $e->getMessage());
                    error_log("Fallback error code: " . $e->getCode());
                    throw new PDOException("Database connection failed: " . $e->getMessage());
                }
            }

            if (!$connectionEstablished) {
                throw new PDOException("Unable to establish database connection with any method");
            }
        } else {
            error_log("Using existing database connection");
        }

        // Test connection and reconnect if needed
        if (!self::isConnectionAlive()) {
            self::createConnection();
        }

        error_log("=== Database connection established ===");
        return self::$connection;
    }

    private static function createConnection(): void
    {
        $host = $_ENV['DB_HOST'] ?? 'localhost';
        $dbname = $_ENV['DB_NAME'] ?? 'ecommerce';
        $username = $_ENV['DB_USER'] ?? 'root';
        $password = $_ENV['DB_PASS'] ?? '';
        $port = $_ENV['DB_PORT'] ?? '3306';

        $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";

        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_PERSISTENT => true,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
            PDO::ATTR_TIMEOUT => 30,
            PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => true,
        ];

        $lastException = null;

        for ($attempt = 1; $attempt <= self::$retryAttempts; $attempt++) {
            try {
                self::$connection = new PDO($dsn, $username, $password, $options);
                
                // Test the connection
                self::$connection->query("SELECT 1");
                
                error_log("Database connection established successfully on attempt {$attempt}");
                return;
                
            } catch (PDOException $e) {
                $lastException = $e;
                error_log("Database connection attempt {$attempt} failed: " . $e->getMessage());
                
                if ($attempt < self::$retryAttempts) {
                    sleep(self::$retryDelay);
                }
            }
        }

        throw new PDOException(
            "Failed to connect to database after " . self::$retryAttempts . " attempts. Last error: " . 
            ($lastException ? $lastException->getMessage() : 'Unknown error')
        );
    }

    private static function isConnectionAlive(): bool
    {
        if (self::$connection === null) {
            return false;
        }

        try {
            self::$connection->query("SELECT 1");
            return true;
        } catch (PDOException $e) {
            error_log("Database connection test failed: " . $e->getMessage());
            self::$connection = null;
            return false;
        }
    }

    public static function closeConnection(): void
    {
        self::$connection = null;
    }
}