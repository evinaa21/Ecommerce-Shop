<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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

$dotenvPath = realpath(__DIR__ . '/../');
if (file_exists($dotenvPath . '/.env')) {
    (Dotenv\Dotenv::createImmutable($dotenvPath))->load();
}

// Example usage (never commit real creds)
$dbHost = $_ENV['DB_HOST'] ?? 'localhost';

// health check
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
        ], JSON_PRETTY_PRINT);

    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'DB connection failed',
            'error' => $e->getMessage(),
            'timestamp' => date('Y-m-d H:i:s'),
        ], JSON_PRETTY_PRINT);
    }
    exit;
}

// handles POST GraphQL requests
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?: [];
$query = $input['query'] ?? null;
$vars = $input['variables'] ?? null;

if (!$query) {
    http_response_code(400);
    echo json_encode(['error' => 'No GraphQL query provided'], JSON_PRETTY_PRINT);
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
    $output = $result->toArray(DebugFlag::INCLUDE_DEBUG_MESSAGE);
    
    // Log errors if any
    if (!empty($output['errors'])) {
        error_log('GraphQL Errors: ' . json_encode($output['errors']));
    }
    
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
                    'timestamp' => date('Y-m-d H:i:s')
                ]
            ]
        ]
    ], JSON_PRETTY_PRINT);
} catch (\Throwable $e) {
    http_response_code(500);
    error_log('Server Error: ' . $e->getMessage());
    echo json_encode([
        'errors' => [
            [
                'message' => 'Internal server error',
                'extensions' => [
                    'code' => 'INTERNAL_ERROR',
                    'timestamp' => date('Y-m-d H:i:s')
                ]
            ]
        ]
    ], JSON_PRETTY_PRINT);
}

