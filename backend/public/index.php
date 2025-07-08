<?php

// Force display of errors for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "=== Application starting ===\n";
flush();

try {
    echo "Loading autoloader...\n";
    flush();
    require_once __DIR__ . '/../vendor/autoload.php';
    echo "✅ Autoloader loaded successfully\n";
    flush();
} catch (Throwable $e) {
    echo "❌ FATAL: Autoloader failed: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    die();
}

try {
    echo "Importing GraphQL classes...\n";
    flush();
    
    use App\GraphQL\Types\QueryType;
    use App\GraphQL\Mutation\MutationType;
    use GraphQL\Type\Schema;
    use GraphQL\GraphQL;
    use GraphQL\Error\DebugFlag;
    
    echo "✅ GraphQL classes imported successfully\n";
    flush();
} catch (Throwable $e) {
    echo "❌ FATAL: GraphQL import failed: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    die();
}

// Allow cross-origin requests (for development)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Handle GET requests (for GraphQL introspection or browser access)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo "Handling GET request...\n";
    flush();
    
    // Test database connection
    try {
        echo "Testing database connection...\n";
        flush();
        
        require_once __DIR__ . '/../src/Config/Database.php';
        echo "✅ Database class loaded\n";
        flush();
        
        $db = \App\Config\Database::getConnection();
        echo "✅ Database connection successful!\n";
        flush();
        
        // Test a simple query
        $stmt = $db->query("SELECT COUNT(*) as count FROM categories");
        $result = $stmt->fetch();
        echo "✅ Database query successful! Categories count: " . $result['count'] . "\n";
        flush();
        
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'success',
            'message' => 'GraphQL endpoint is running. Send POST requests with GraphQL queries.',
            'database' => 'connected',
            'categories_count' => $result['count'],
            'endpoint' => '/',
            'example' => [
                'query' => '{ categories { name } }',
                'method' => 'POST',
                'headers' => ['Content-Type: application/json']
            ]
        ], JSON_PRETTY_PRINT);
        
    } catch (Throwable $e) {
        echo "❌ Database connection failed: " . $e->getMessage() . "\n";
        echo "Error code: " . $e->getCode() . "\n";
        echo "Trace: " . $e->getTraceAsString() . "\n";
        flush();
        
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Database connection failed',
            'error' => $e->getMessage(),
            'code' => $e->getCode(),
            'trace' => $e->getTraceAsString()
        ], JSON_PRETTY_PRINT);
    }
    exit(0);
}

echo "Processing POST request...\n";
flush();

try {
    echo "Creating GraphQL schema...\n";
    flush();
    
    // Test if QueryType can be instantiated
    echo "Creating QueryType...\n";
    flush();
    $queryType = new QueryType();
    echo "✅ QueryType created\n";
    flush();
    
    echo "Creating MutationType...\n";
    flush();
    $mutationType = new MutationType();
    echo "✅ MutationType created\n";
    flush();
    
    // 1. Create the Schema (the "menu")
    $schema = new Schema([
        'query' => $queryType,
        'mutation' => $mutationType,
    ]);

    echo "✅ Schema created successfully\n";
    flush();

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

    echo "Executing GraphQL query: " . substr($query, 0, 100) . "\n";
    flush();

    // 3. Execute the query
    $result = GraphQL::executeQuery($schema, $query, null, null, $variableValues);
    $output = $result->toArray(DebugFlag::INCLUDE_DEBUG_MESSAGE | DebugFlag::INCLUDE_TRACE);

    echo "✅ Query executed successfully\n";
    flush();

} catch (Throwable $e) {
    echo "❌ Error occurred: " . $e->getMessage() . "\n";
    echo "Error code: " . $e->getCode() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
    flush();
    
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

echo "\n=== Request completed ===\n";
flush();

