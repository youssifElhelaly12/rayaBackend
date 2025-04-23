# Comparison: Node.js vs PHP Email Configuration

## Overview

This document compares the email configuration implementations between the original Node.js application and the PHP test project. Understanding these differences can help troubleshoot issues in either implementation.

## Authentication Methods

### Node.js Implementation

```javascript
// Token acquisition using MSAL
const cca = new ConfidentialClientApplication(config);
const result = await cca.acquireTokenByClientCredential({
    scopes: ['https://outlook.office.com/.default']
});
const accessToken = result.accessToken;

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
        type: 'OAuth2',
        user: 'rayait_events@rayacorp.com',
        accessToken: accessToken,
        clientId: config.auth.clientId,
        clientSecret: config.auth.clientSecret,
        tenantId: '2601b905-ab58-4c29-ad95-e23887316395'
    }
});
```

### PHP Implementation

```php
// Token acquisition using League OAuth2 Client
$provider = new GenericProvider([
    'clientId'                => $clientId,
    'clientSecret'            => $clientSecret,
    'urlAuthorize'            => "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/authorize",
    'urlAccessToken'          => "https://login.microsoftonline.com/$tenantId/oauth2/v2.0/token",
    'urlResourceOwnerDetails' => '',
    'scopes'                  => 'https://outlook.office.com/.default'
]);

$accessToken = $provider->getAccessToken('client_credentials');

// PHPMailer configuration
$mail = new PHPMailer(true);
$mail->isSMTP();
$mail->Host = 'smtp.office365.com';
$mail->SMTPAuth = true;
$mail->AuthType = 'XOAUTH2';
$mail->Username = $emailFrom;

// OAuth2 configuration
$mail->setOAuth(
    new \PHPMailer\PHPMailer\OAuth([
        'provider' => $provider,
        'clientId' => $clientId,
        'clientSecret' => $clientSecret,
        'userName' => $emailFrom,
        'accessToken' => $accessToken,
    ])
);
```

## Key Differences

1. **Libraries Used**:
   - Node.js: MSAL Node (@azure/msal-node) and Nodemailer
   - PHP: League OAuth2 Client and PHPMailer

2. **OAuth2 Implementation**:
   - Node.js: Uses Microsoft Authentication Library (MSAL) specifically designed for Azure AD
   - PHP: Uses a generic OAuth2 client with Azure AD endpoints

3. **Token Handling**:
   - Node.js: Token is directly passed to Nodemailer
   - PHP: Token is passed through PHPMailer's OAuth handler

4. **SMTP Configuration**:
   - Node.js: Includes TLS cipher configuration (`ciphers: 'SSLv3'`)
   - PHP: Uses standard TLS configuration with STARTTLS

## Common Issues & Troubleshooting

### Authentication Problems

- **Invalid Client**: Check that the client ID and secret are correct and not expired
- **Insufficient Permissions**: Ensure the Azure AD app has the correct API permissions
- **Token Scope**: Verify the correct scope is being requested ('https://outlook.office.com/.default')

### SMTP Connection Issues

- **TLS/SSL Problems**: Office 365 requires STARTTLS (secure: false in Node.js)
- **Port Blocking**: Ensure port 587 is not blocked by firewalls
- **Credentials**: Verify the email account has permissions to send mail

### Testing Strategy

1. First test token acquisition separately (using token_test.php)
2. Then test basic SMTP connectivity (using smtp_test.php)
3. Finally test the complete email sending process

## Conclusion

Both implementations follow the same general approach but differ in specific libraries and implementation details. If one works while the other doesn't, focus on the differences highlighted above to identify the issue.

The PHP test project provides isolated testing tools to help pinpoint where the problem might be occurring in your Node.js implementation.