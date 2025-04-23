<?php
// OAuth2 Token Test Script

// Display all errors for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Check if OAuth2 Client is installed
if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
    die('Please run "composer install" to install the required dependencies');
}

// Include Composer autoloader
require __DIR__ . '/vendor/autoload.php';

// Import OAuth2 classes
use League\OAuth2\Client\Provider\GenericProvider;
use League\OAuth2\Client\Provider\Exception\IdentityProviderException;

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
$clientId = $_ENV['CLIENT_ID'] ?? '50bac090-f20f-4021-95b6-33a0d78a6c28';
$clientSecret = $_ENV['CLIENT_SECRET'] ?? 'D5W8Q~D7GzjC_B.mF~V6eeF-D314jJQXDc1MScPW';
$tenantId = $_ENV['TENANT_ID'] ?? '2601b905-ab58-4c29-ad95-e23887316395';

// Function to get OAuth2 access token
function getAccessToken($clientId, $clientSecret, $tenantId, $scope = 'https://outlook.office.com/.default') {
    try {
        echo "<p>Creating OAuth2 provider with:</p>";
        echo "<ul>";
        echo "<li>Client ID: " . substr($clientId, 0, 5) . "..." . substr($clientId, -5) . "</li>";
        echo "<li>Tenant ID: " . substr($tenantId, 0, 5) . "..." . substr($tenantId, -5) . "</li>";
        echo "<li>Scope: " . $scope . "</li>";
        echo "</ul>";
        
        $provider = new GenericProvider([
            'clientId'                => $clientId,
            'clientSecret'            => $clientSecret,
            'urlAuthorize'            => "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/authorize",
            'urlAccessToken'          => "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token",
            'urlResourceOwnerDetails' => '',
            'scopes'                  => $scope
        ]);

        echo "<p>Attempting to get access token using client credentials grant...</p>";
        
        // Try to get an access token using the client credentials grant
        $accessToken = $provider->getAccessToken('client_credentials');
        
        echo "<p style='color:green;font-weight:bold;'>Access token acquired successfully!</p>";
        echo "<p>Token details:</p>";
        echo "<ul>";
        echo "<li>Token: " . substr($accessToken->getToken(), 0, 10) . "..." . substr($accessToken->getToken(), -10) . "</li>";
        echo "<li>Expires: " . date('Y-m-d H:i:s', $accessToken->getExpires()) . "</li>";
        echo "<li>Has expired: " . ($accessToken->hasExpired() ? 'Yes' : 'No') . "</li>";
        echo "</ul>";
        
        return $accessToken->getToken();
    } catch (IdentityProviderException $e) {
        echo "<p style='color:red;font-weight:bold;'>Error getting access token: " . $e->getMessage() . "</p>";
        echo "<p>Error details:</p>";
        echo "<pre>" . print_r($e->getResponseBody(), true) . "</pre>";
        return null;
    } catch (Exception $e) {
        echo "<p style='color:red;font-weight:bold;'>General error: " . $e->getMessage() . "</p>";
        return null;
    }
}

// HTML Form
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $clientId = $_POST['clientId'] ?? $clientId;
    $clientSecret = $_POST['clientSecret'] ?? $clientSecret;
    $tenantId = $_POST['tenantId'] ?? $tenantId;
    $scope = $_POST['scope'] ?? 'https://outlook.office.com/.default';
    
    echo "<div class='debug-output'>";
    getAccessToken($clientId, $clientSecret, $tenantId, $scope);
    echo "</div>";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OAuth2 Token Test</title>
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
        input[type="password"] {
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
        .scope-options {
            margin-bottom: 15px;
        }
        .scope-options label {
            display: inline-block;
            margin-right: 15px;
            font-weight: normal;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>OAuth2 Token Test</h1>
        <p>This tool tests OAuth2 token acquisition for Office 365 email.</p>
        
        <form method="post">
            <div class="form-group">
                <label for="clientId">Client ID:</label>
                <input type="text" id="clientId" name="clientId" value="<?php echo htmlspecialchars($clientId); ?>">
            </div>
            
            <div class="form-group">
                <label for="clientSecret">Client Secret:</label>
                <input type="password" id="clientSecret" name="clientSecret" value="<?php echo htmlspecialchars($clientSecret); ?>">
            </div>
            
            <div class="form-group">
                <label for="tenantId">Tenant ID:</label>
                <input type="text" id="tenantId" name="tenantId" value="<?php echo htmlspecialchars($tenantId); ?>">
            </div>
            
            <div class="form-group">
                <label>Scope:</label>
                <div class="scope-options">
                    <label>
                        <input type="radio" name="scope" value="https://outlook.office.com/.default" checked> 
                        Outlook API (https://outlook.office.com/.default)
                    </label><br>
                    <label>
                        <input type="radio" name="scope" value="https://graph.microsoft.com/.default"> 
                        Microsoft Graph API (https://graph.microsoft.com/.default)
                    </label>
                </div>
            </div>
            
            <button type="submit">Test Token Acquisition</button>
        </form>
        
        <?php if ($_SERVER['REQUEST_METHOD'] === 'POST'): ?>
        <!-- Debug output will be inserted here -->
        <?php endif; ?>
        
        <div style="margin-top: 20px;">
            <h3>Troubleshooting Tips:</h3>
            <ul>
                <li>Verify your Azure AD application has the correct API permissions</li>
                <li>For Outlook API, you need "Office 365 Exchange Online" with "full_access_as_app" permission</li>
                <li>For Graph API, you need "Mail.Send" application permission</li>
                <li>Make sure your application is properly configured for client credentials flow</li>
                <li>Check that your client secret hasn't expired</li>
            </ul>
        </div>
    </div>
</body>
</html>