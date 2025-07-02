<?php


require_once __DIR__ . '/../vendor/autoload.php';

use App\GraphQL\Types\QueryType;
use App\GraphQL\Mutation\MutationType;
use GraphQL\Type\Schema;
use GraphQL\GraphQL;
use GraphQL\Error\DebugFlag;

// Allow cross-origin requests (for development)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Handle GET requests (for GraphQL introspection or browser access)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode([
        'message' => 'GraphQL endpoint is running. Send POST requests with GraphQL queries.',
        'endpoint' => '/Ecommerce-Shop/backend/public/',
        'example' => [
            'query' => '{ categories { name } }',
            'method' => 'POST',
            'headers' => ['Content-Type: application/json']
        ]
    ]);
    exit(0);
}

try {
    // 1. Create the Schema (the "menu")
    $schema = new Schema([
        'query' => new QueryType(),
        'mutation' => new MutationType(),
    ]);

    // 2. Get the incoming request
    $rawInput = file_get_contents('php://input');
    
    // Check if we have input data
    if (empty($rawInput)) {
        throw new Exception('No input data received. Please send a POST request with a GraphQL query.');
    }
    
    $input = json_decode($rawInput, true);
    
    // Check if JSON decoding was successful
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON in request body: ' . json_last_error_msg());
    }
    
    // Check if query exists
    if (!isset($input['query']) || empty($input['query'])) {
        throw new Exception('No GraphQL query found in request. Please include a "query" field.');
    }
    
    $query = $input['query'];
    $variableValues = $input['variables'] ?? null;

    // 3. Execute the query
    $result = GraphQL::executeQuery($schema, $query, null, null, $variableValues);
    $output = $result->toArray(DebugFlag::INCLUDE_DEBUG_MESSAGE | DebugFlag::INCLUDE_TRACE);

} catch (Throwable $e) {
    $output = [
        'error' => [
            'message' => $e->getMessage(),
            'type' => get_class($e),
        ],
    ];
    
    // Set appropriate HTTP status code
    http_response_code(400);
}

// 4. Send the response
header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output, JSON_PRETTY_PRINT);