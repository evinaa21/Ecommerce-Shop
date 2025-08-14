<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set error log file
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/error.log');

// Ensure logs directory exists
$logsDir = __DIR__ . '/../logs';
if (!is_dir($logsDir)) {
    mkdir($logsDir, 0777, true);
}

// ─── HEADERS MUST COME FIRST ───────────────────────────────────────────────────
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ─── BOOTSTRAP & ROUTING ────────────────────────────────────────────────────────
require_once __DIR__ . '/../vendor/autoload.php';

use App\GraphQL\Types\QueryType;
use App\GraphQL\Mutation\MutationType;
use GraphQL\Type\Schema;
use GraphQL\GraphQL;
use GraphQL\Error\DebugFlag;
use GraphQL\Error\FormattedError;

// Load environment variables
$dotenvPath = realpath(__DIR__ . '/../');
if (file_exists($dotenvPath . '/.env')) {
    try {
        (Dotenv\Dotenv::createImmutable($dotenvPath))->load();
    } catch (Exception $e) {
        error_log('Failed to load .env file: ' . $e->getMessage());
    }
}

// Health check endpoint
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $db = \App\Config\Database::getConnection();
        $stmt = $db->query("SELECT COUNT(*) as c FROM categories");
        $count = $stmt ? $stmt->fetch()['c'] ?? 0 : 0;

        echo json_encode([
            'status' => 'success',
            'message' => 'GraphQL endpoint is running',
            'categories_count' => $count,
            'timestamp' => date('Y-m-d H:i:s'),
            'php_version' => PHP_VERSION,
            'memory_usage' => memory_get_usage(true),
        ], JSON_PRETTY_PRINT);

    } catch (\Throwable $e) {
        http_response_code(500);
        error_log('Health check failed: ' . $e->getMessage());
        echo json_encode([
            'status' => 'error',
            'message' => 'Database connection failed',
            'error' => $e->getMessage(),
            'timestamp' => date('Y-m-d H:i:s'),
        ], JSON_PRETTY_PRINT);
    }
    exit;
}

// Handle POST GraphQL requests
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        'errors' => [
            [
                'message' => 'Invalid JSON in request body',
                'extensions' => ['code' => 'INVALID_JSON']
            ]
        ]
    ], JSON_PRETTY_PRINT);
    exit;
}

$query = $input['query'] ?? null;
$vars = $input['variables'] ?? null;

if (!$query) {
    http_response_code(400);
    echo json_encode([
        'errors' => [
            [
                'message' => 'No GraphQL query provided',
                'extensions' => ['code' => 'NO_QUERY']
            ]
        ]
    ], JSON_PRETTY_PRINT);
    exit;
}

try {
    // Test database connection before processing query
    $db = \App\Config\Database::getConnection();
    $db->query("SELECT 1");
    
    $schema = new Schema([
        'query' => new QueryType(),
        'mutation' => new MutationType(),
    ]);
    
    $result = GraphQL::executeQuery($schema, $query, null, null, $vars);
    $output = $result->toArray(DebugFlag::INCLUDE_DEBUG_MESSAGE | DebugFlag::INCLUDE_TRACE);
    
    // Log errors if any
    if (!empty($output['errors'])) {
        foreach ($output['errors'] as $error) {
            error_log('GraphQL Error: ' . json_encode($error));
        }
    }
    
    http_response_code(200);
    echo json_encode($output, JSON_PRETTY_PRINT);

} catch (\PDOException $e) {
    http_response_code(500);
    error_log('Database Error: ' . $e->getMessage());
    echo json_encode([
        'errors' => [
            [
                'message' => 'Database connection failed',
                'extensions' => [
                    'code' => 'DATABASE_ERROR',
                    'timestamp' => date('Y-m-d H:i:s'),
                    'trace' => $e->getTraceAsString()
                ]
            ]
        ]
    ], JSON_PRETTY_PRINT);
    
} catch (\GraphQL\Error\SyntaxError $e) {
    http_response_code(400);
    error_log('GraphQL Syntax Error: ' . $e->getMessage());
    echo json_encode([
        'errors' => [
            [
                'message' => 'GraphQL syntax error: ' . $e->getMessage(),
                'extensions' => [
                    'code' => 'GRAPHQL_SYNTAX_ERROR',
                    'timestamp' => date('Y-m-d H:i:s')
                ]
            ]
        ]
    ], JSON_PRETTY_PRINT);
    
} catch (\Throwable $e) {
    http_response_code(500);
    error_log('Server Error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
    echo json_encode([
        'errors' => [
            [
                'message' => 'Internal server error',
                'extensions' => [
                    'code' => 'INTERNAL_ERROR',
                    'timestamp' => date('Y-m-d H:i:s'),
                    'trace' => $e->getTraceAsString()
                ]
            ]
        ]
    ], JSON_PRETTY_PRINT);
}

