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

// health check
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $db = \App\Config\Database::getConnection();
        $count = $db->query("SELECT COUNT(*) as c FROM categories")
            ->fetch()['c'] ?? 0;

        echo json_encode([
            'status' => 'success',
            'message' => 'GraphQL endpoint is running',
            'categories_count' => $count,
        ], JSON_PRETTY_PRINT);

    } catch (\Throwable $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'DB connection failed',
            'error' => $e->getMessage(),
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
    $schema = new Schema([
        'query' => new QueryType(),
        'mutation' => new MutationType(),
    ]);
    $result = GraphQL::executeQuery($schema, $query, null, null, $vars);
    $output = $result->toArray(DebugFlag::INCLUDE_DEBUG_MESSAGE);
    echo json_encode($output, JSON_PRETTY_PRINT);

} catch (\Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'type' => get_class($e),
        'trace' => $e->getTraceAsString(),
    ], JSON_PRETTY_PRINT);
}

