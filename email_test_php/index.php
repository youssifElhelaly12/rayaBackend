<?php
// Email Test Configuration Script

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
use League\OAuth2\Client\Provider\GenericProvider;

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
$emailFrom = $_ENV['EMAIL_FROM'] ?? 'rayait_events@rayacorp.com';
$emailTo = $_ENV['EMAIL_TO'] ?? 'youssifelhlaly@hotmail.com';
$emailPassword = $_ENV['EMAIL_PASSWORD'] ?? 'MyBMv@Z9eaPWYZN';

// Function to get OAuth2 access token
function getAccessToken($clientId, $clientSecret, $tenantId) {
    try {
        $provider = new GenericProvider([
            'clientId'                => $clientId,
            'clientSecret'            => $clientSecret,
            'urlAuthorize'            => "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/authorize",
            'urlAccessToken'          => "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token",
            'urlResourceOwnerDetails' => '',
            'scopes'                  => ['https://outlook.office.com/.default']
        ]);

        // Try to get an access token using the client credentials grant
        $accessToken = $provider->getAccessToken('client_credentials');
        echo "<p>Access token acquired successfully!</p>";
        return $accessToken->getToken();
    } catch (Exception $e) {
        echo "<p>Error getting access token: " . $e->getMessage() . "</p>";
        return null;
    }
}

// Function to send email using OAuth2
function sendEmailWithOAuth2($clientId, $clientSecret, $tenantId, $emailFrom, $emailTo, $emailPassword) {
    try {
        // Get access token
        $accessToken = getAccessToken($clientId, $clientSecret, $tenantId);
        if (!$accessToken) {
            return false;
        }

        // Create a new PHPMailer instance
        $mail = new PHPMailer(true);

        // Server settings
        $mail->SMTPDebug = SMTP::DEBUG_SERVER;                 // Enable verbose debug output
        $mail->isSMTP();                                       // Send using SMTP
        $mail->Host       = 'smtp.office365.com';              // Set the SMTP server
        $mail->SMTPAuth   = true;                              // Enable SMTP authentication
        $mail->AuthType   = 'XOAUTH2';                         // Use OAuth2
        $mail->Username   = $emailFrom;                        // SMTP username
        $mail->Password   = $emailPassword;                    // SMTP password (not used with OAuth2 but required by PHPMailer)

        // OAuth2 configuration
        $mail->setOAuth(
            new \PHPMailer\PHPMailer\OAuth([
                'provider' => new GenericProvider([
                    'clientId'                => $clientId,
                    'clientSecret'            => $clientSecret,
                    'urlAuthorize'            => "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/authorize",
                    'urlAccessToken'          => "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token",
                    'urlResourceOwnerDetails' => '',
                    'scopes'                  => ['https://outlook.office.com/.default']
                ]),
                'clientId'     => $clientId,
                'clientSecret' => $clientSecret,
                'userName'     => $emailFrom,
                'accessToken'  => $accessToken,
            ])
        );

        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;    // Enable TLS encryption
        $mail->Port       = 587;                               // TCP port to connect to

        // Recipients
        $mail->setFrom($emailFrom, 'Raya IT Events');
        $mail->addAddress($emailTo);                           // Add a recipient

        // Content
        $mail->isHTML(true);                                   // Set email format to HTML
        $mail->Subject = 'PHP Test Email with OAuth2';
        $mail->Body    = 'This is a test email sent from PHP using PHPMailer with OAuth2 authentication.';
        $mail->AltBody = 'This is a test email sent from PHP using PHPMailer with OAuth2 authentication.';

        // Send the email
        $mail->send();
        echo "<p>Email has been sent successfully!</p>";
        return true;
    } catch (Exception $e) {
        echo "<p>Error sending email: " . $mail->ErrorInfo . "</p>";
        return false;
    }
}

// Function to send email using regular SMTP authentication
function sendEmailWithSMTP($emailFrom, $emailTo, $emailPassword) {
    try {
        // Create a new PHPMailer instance
        $mail = new PHPMailer(true);

        // Server settings
        $mail->SMTPDebug = SMTP::DEBUG_SERVER;                 // Enable verbose debug output
        $mail->isSMTP();                                       // Send using SMTP
        $mail->Host       = 'smtp.office365.com';              // Set the SMTP server
        $mail->SMTPAuth   = true;                              // Enable SMTP authentication
        $mail->Username   = $emailFrom;                        // SMTP username
        $mail->Password   = $emailPassword;                    // SMTP password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;    // Enable TLS encryption
        $mail->Port       = 587;                               // TCP port to connect to

        // TLS Options
        $mail->SMTPOptions = [
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true,
                'ciphers' => 'SSLv3'
            ]
        ];

        // Recipients
        $mail->setFrom($emailFrom, 'Raya IT Events');
        $mail->addAddress($emailTo);                           // Add a recipient

        // Content
        $mail->isHTML(true);                                   // Set email format to HTML
        $mail->Subject = 'PHP Test Email with SMTP';
        $mail->Body    = 'This is a test email sent from PHP using PHPMailer with regular SMTP authentication.';
        $mail->AltBody = 'This is a test email sent from PHP using PHPMailer with regular SMTP authentication.';

        // Send the email
        $mail->send();
        echo "<p>Email has been sent successfully using SMTP!</p>";
        return true;
    } catch (Exception $e) {
        echo "<p>Error sending email with SMTP: " . $mail->ErrorInfo . "</p>";
        return false;
    }
}

// HTML Form
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $method = $_POST['method'] ?? 'oauth2';
    
    if ($method === 'oauth2') {
        sendEmailWithOAuth2($clientId, $clientSecret, $tenantId, $emailFrom, $emailTo, $emailPassword);
    } else {
        sendEmailWithSMTP($emailFrom, $emailTo, $emailPassword);
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Configuration Test</title>
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
        input[type="email"] {
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
        .radio-group {
            margin-bottom: 15px;
        }
        .radio-group label {
            display: inline;
            margin-right: 15px;
            font-weight: normal;
        }
        .debug-output {
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            padding: 15px;
            margin-top: 20px;
            border-radius: 4px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Email Configuration Test</h1>
        <p>This tool tests your email configuration using PHPMailer with Office 365.</p>
        
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
                <label for="emailFrom">From Email:</label>
                <input type="email" id="emailFrom" name="emailFrom" value="<?php echo htmlspecialchars($emailFrom); ?>">
            </div>
            
            <div class="form-group">
                <label for="emailTo">To Email:</label>
                <input type="email" id="emailTo" name="emailTo" value="<?php echo htmlspecialchars($emailTo); ?>">
            </div>
            
            <div class="form-group">
                <label for="emailPassword">Email Password:</label>
                <input type="password" id="emailPassword" name="emailPassword" value="<?php echo htmlspecialchars($emailPassword); ?>">
            </div>
            
            <div class="radio-group">
                <label>Authentication Method:</label>
                <label>
                    <input type="radio" name="method" value="oauth2" checked> OAuth2
                </label>
                <label>
                    <input type="radio" name="method" value="smtp"> Regular SMTP
                </label>
            </div>
            
            <button type="submit">Test Email Configuration</button>
        </form>
        
        <?php if ($_SERVER['REQUEST_METHOD'] === 'POST'): ?>
        <div class="debug-output">
            <h3>Debug Output:</h3>
            <!-- PHPMailer debug output will appear here -->
        </div>
        <?php endif; ?>
    </div>
</body>
</html>