# PHP Email Configuration Test

This project provides a simple PHP application to test Office 365 email configuration with OAuth2 authentication, similar to the configuration used in the Node.js application.

## Features

- Tests email sending using Office 365 with OAuth2 authentication
- Alternative option to test with regular SMTP authentication
- User-friendly web interface for configuration
- Detailed debug output for troubleshooting

## Requirements

- PHP 7.4 or higher
- Composer
- Office 365 account with appropriate permissions
- Azure AD application with the necessary permissions

## Installation

1. Navigate to the project directory:
   ```
   cd /Users/helaly/Desktop/New/raya/email_test_php
   ```

2. Install dependencies using Composer:
   ```
   composer install
   ```

3. (Optional) Create a `.env` file to store your configuration:
   ```
   CLIENT_ID=your_client_id
   CLIENT_SECRET=your_client_secret
   TENANT_ID=your_tenant_id
   EMAIL_FROM=your_email@domain.com
   EMAIL_TO=recipient@domain.com
   EMAIL_PASSWORD=your_email_password
   ```

## Usage

1. Start a PHP development server:
   ```
   php -S localhost:8000
   ```

2. Open your browser and navigate to `http://localhost:8000`

3. Fill in the form with your Office 365 credentials and configuration

4. Choose between OAuth2 or regular SMTP authentication

5. Click "Test Email Configuration" to send a test email

## Troubleshooting

- Check the debug output for detailed error messages
- Verify your Azure AD application has the correct permissions (Mail.Send)
- Ensure your Office 365 account has the necessary permissions
- Check if your account requires multi-factor authentication

## Comparison with Node.js Implementation

This PHP implementation uses similar configuration to the Node.js version:

- Both use OAuth2 authentication with Azure AD
- Both connect to Office 365 SMTP server
- Both use similar scopes and authentication flow

The main differences are:

- PHP uses PHPMailer library instead of Nodemailer
- PHP uses League OAuth2 Client instead of MSAL Node
- The authentication flow implementation details differ slightly

If the PHP version works but the Node.js version doesn't, the issue might be related to the specific implementation details or library configurations rather than the overall approach.