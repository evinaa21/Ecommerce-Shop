<?php

// Force display of errors for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Custom logging function that outputs to both error log and stdout
function debug_log($message)
{
    error_log($message);
    // Also output to stdout so Railway can see it
    fwrite(STDOUT, "[DEBUG] " . $message . "\n");
    flush();
}

// Move use statements to the top - they cannot be in try blocks
use App\GraphQL\Types\QueryType;
use App\GraphQL\Mutation\MutationType;
use GraphQL\Type\Schema;
use GraphQL\GraphQL;
use GraphQL\Error\DebugFlag;

debug_log("=== Application starting ===");

try {
    debug_log("Loading autoloader...");
    require_once __DIR__ . '/../vendor/autoload.php';
    debug_log("✅ Autoloader loaded successfully");
} catch (Throwable $e) {
    debug_log("❌ FATAL: Autoloader failed: " . $e->getMessage());
    debug_log("Trace: " . $e->getTraceAsString());
    die("Autoloader failed");
}

debug_log("✅ GraphQL classes imported successfully");

// Allow cross-origin requests (for development)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Handle GET requests (for GraphQL introspection or browser access)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    debug_log("Handling GET request...");

    // Test database connection
    try {
        debug_log("Testing database connection...");

        require_once __DIR__ . '/../src/Config/Database.php';
        debug_log("✅ Database class loaded");

        $db = \App\Config\Database::getConnection();
        debug_log("✅ Database connection successful!");

        // Test a simple query
        $stmt = $db->query("SELECT COUNT(*) as count FROM categories");
        $result = $stmt->fetch();
        debug_log("✅ Database query successful! Categories count: " . $result['count']);

        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'success',
            'message' => 'GraphQL endpoint is running. Send POST requests with GraphQL queries.',
            'database' => 'connected',
            'categories_count' => $result['count'],
            'endpoint' => '/',
            'debug_info' => [
                'server_started' => true,
                'autoloader' => 'loaded',
                'database' => 'connected',
                'categories_found' => $result['count']
            ],
            'example' => [
                'query' => '{ categories { name } }',
                'method' => 'POST',
                'headers' => ['Content-Type: application/json']
            ]
        ], JSON_PRETTY_PRINT);

    } catch (Throwable $e) {
        debug_log("❌ Database connection failed: " . $e->getMessage());
        debug_log("Error code: " . $e->getCode());
        debug_log("Error trace: " . $e->getTraceAsString());

        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Database connection failed',
            'error' => $e->getMessage(),
            'code' => $e->getCode(),
            'debug_info' => [
                'server_started' => true,
                'autoloader' => 'loaded',
                'database' => 'failed',
                'error_details' => $e->getMessage()
            ],
            'trace' => $e->getTraceAsString()
        ], JSON_PRETTY_PRINT);
    }
    exit(0);
}

debug_log("Processing POST request...");

try {
    debug_log("Creating GraphQL schema...");

    // Test if QueryType can be instantiated
    debug_log("Creating QueryType...");
    $queryType = new QueryType();
    debug_log("✅ QueryType created");

    debug_log("Creating MutationType...");
    $mutationType = new MutationType();
    debug_log("✅ MutationType created");

    // 1. Create the Schema (the "menu")
    $schema = new Schema([
        'query' => $queryType,
        'mutation' => $mutationType,
    ]);

    debug_log("✅ Schema created successfully");

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

    debug_log("Executing GraphQL query: " . substr($query, 0, 100));

    // 3. Execute the query
    $result = GraphQL::executeQuery($schema, $query, null, null, $variableValues);
    $output = $result->toArray(DebugFlag::INCLUDE_DEBUG_MESSAGE | DebugFlag::INCLUDE_TRACE);

    debug_log("✅ Query executed successfully");

} catch (Throwable $e) {
    debug_log("❌ Error occurred: " . $e->getMessage());
    debug_log("Error code: " . $e->getCode());
    debug_log("Error trace: " . $e->getTraceAsString());

    $output = [
        'error' => [
            'message' => $e->getMessage(),
            'type' => get_class($e),
            'code' => $e->getCode(),
            'trace' => $e->getTraceAsString()
        ],
    ];

    // Set appropriate HTTP status code
    http_response_code(400);
}

// 4. Send the response
header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output, JSON_PRETTY_PRINT);

debug_log("=== Request completed ===");

