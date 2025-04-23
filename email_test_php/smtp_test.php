<?php
// Simple SMTP Connection Test Script

// Display all errors for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Check if PHPMailer is installed
if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
    die('Please run "composer install" to install the required dependencies');
}

// Include Composer autoloader
require __DIR__ . '/vendor/autoload.php';

// Import PHPMailer classes
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Load environment variables from .env file if available
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

// Configuration - Replace with your actual values or use environment variables
$smtpHost = $_ENV['SMTP_HOST'] ?? 'smtp.office365.com';
$smtpPort = $_ENV['SMTP_PORT'] ?? 587;
$smtpUser = $_ENV['EMAIL_FROM'] ?? 'rayait_events@rayacorp.com';
$smtpPassword = $_ENV['EMAIL_PASSWORD'] ?? 'MyBMv@Z9eaPWYZN';

// Function to test SMTP connection
function testSMTPConnection($host, $port, $user, $password) {
    echo "<h3>Testing SMTP Connection</h3>";
    echo "<p>Host: $host<br>Port: $port<br>User: $user</p>";
    
    try {
        // Create a new SMTP instance
        $smtp = new SMTP;
        
        // Enable debug output
        $smtp->do_debug = SMTP::DEBUG_CONNECTION;
        
        // Connect to the SMTP server
        echo "<p>Connecting to SMTP server...</p>";
        if (!$smtp->connect($host, $port)) {
            throw new Exception('Connection failed');
        }
        
        // Say hello to the server
        echo "<p>Sending EHLO command...</p>";
        if (!$smtp->hello(gethostname())) {
            throw new Exception('EHLO failed: ' . $smtp->getError()['error']);
        }
        
        // Get the server's capabilities
        $capabilities = $smtp->getServerExtList();
        echo "<p>Server capabilities:</p><pre>" . print_r($capabilities, true) . "</pre>";
        
        // Start TLS if available
        if (is_array($capabilities) && array_key_exists('STARTTLS', $capabilities)) {
            echo "<p>Starting TLS session...</p>";
            if (!$smtp->startTLS()) {
                throw new Exception('STARTTLS failed: ' . $smtp->getError()['error']);
            }
            
            // After TLS, say hello again
            if (!$smtp->hello(gethostname())) {
                throw new Exception('EHLO after TLS failed: ' . $smtp->getError()['error']);
            }
            
            // Get capabilities again after TLS
            $capabilities = $smtp->getServerExtList();
            echo "<p>Server capabilities after TLS:</p><pre>" . print_r($capabilities, true) . "</pre>";
        }
        
        // Check if authentication is supported
        if (is_array($capabilities) && array_key_exists('AUTH', $capabilities)) {
            echo "<p>Authentication is supported. Attempting login...</p>";
            if (!$smtp->authenticate($user, $password)) {
                throw new Exception('Authentication failed: ' . $smtp->getError()['error']);
            }
            echo "<p style='color:green;font-weight:bold;'>Authentication successful!</p>";
        } else {
            echo "<p style='color:red;'>Authentication is not supported by the server.</p>";
        }
        
        // Close the connection
        $smtp->quit(true);
        echo "<p>Connection closed.</p>";
        
        return true;
    } catch (Exception $e) {
        echo "<p style='color:red;font-weight:bold;'>Error: " . $e->getMessage() . "</p>";
        if (isset($smtp)) {
            $smtp->quit(true);
        }
        return false;
    }
}

// HTML Form
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $smtpHost = $_POST['smtpHost'] ?? $smtpHost;
    $smtpPort = $_POST['smtpPort'] ?? $smtpPort;
    $smtpUser = $_POST['smtpUser'] ?? $smtpUser;
    $smtpPassword = $_POST['smtpPassword'] ?? $smtpPassword;
    
    echo "<div class='debug-output'>";
    testSMTPConnection($smtpHost, $smtpPort, $smtpUser, $smtpPassword);
    echo "</div>";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SMTP Connection Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input[type="text"],
        input[type="password"],
        input[type="number"] {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }
        button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background-color: #45a049;
        }
        .debug-output {
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            padding: 15px;
            margin-top: 20px;
            border-radius: 4px;
            overflow-x: auto;
        }
        pre {
            background-color: #f1f1f1;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>SMTP Connection Test</h1>
        <p>This tool tests your SMTP connection to Office 365 or other mail servers.</p>
        
        <form method="post">
            <div class="form-group">
                <label for="smtpHost">SMTP Host:</label>
                <input type="text" id="smtpHost" name="smtpHost" value="<?php echo htmlspecialchars($smtpHost); ?>">
            </div>
            
            <div class="form-group">
                <label for="smtpPort">SMTP Port:</label>
                <input type="number" id="smtpPort" name="smtpPort" value="<?php echo htmlspecialchars($smtpPort); ?>">
            </div>
            
            <div class="form-group">
                <label for="smtpUser">SMTP Username:</label>
                <input type="text" id="smtpUser" name="smtpUser" value="<?php echo htmlspecialchars($smtpUser); ?>">
            </div>
            
            <div class="form-group">
                <label for="smtpPassword">SMTP Password:</label>
                <input type="password" id="smtpPassword" name="smtpPassword" value="<?php echo htmlspecialchars($smtpPassword); ?>">
            </div>
            
            <button type="submit">Test SMTP Connection</button>
        </form>
        
        <?php if ($_SERVER['REQUEST_METHOD'] === 'POST'): ?>
        <!-- Debug output will be inserted here -->
        <?php endif; ?>
        
        <div style="margin-top: 20px;">
            <h3>Troubleshooting Tips:</h3>
            <ul>
                <li>Make sure your Office 365 account allows SMTP authentication</li>
                <li>Check if your account requires app passwords for SMTP access</li>
                <li>Verify that your network allows outbound connections on port 587</li>
                <li>If using a corporate account, check with your IT department about any restrictions</li>
            </ul>
        </div>
    </div>
</body>
</html>