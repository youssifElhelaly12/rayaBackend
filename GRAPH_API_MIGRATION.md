# Microsoft Graph API Email Implementation

## Overview

This document explains the migration from Nodemailer to Microsoft Graph API for sending emails in the Raya application.

## Changes Made

1. **Dependencies Added**:
   - `@microsoft/microsoft-graph-client`: Official Microsoft Graph client for Node.js
   - `isomorphic-fetch`: Required for the Graph client to work in Node.js environments

2. **Key Implementation Changes**:

   - **Authentication**: Updated token acquisition to use Microsoft Graph API scopes
   - **Email Sending**: Replaced Nodemailer with Microsoft Graph API calls
   - **API Endpoint**: Using `/users/rayait_events@rayacorp.com/sendMail` endpoint

## How It Works

### Authentication Flow

```javascript
const getAccessToken = async () => {
    try {
        const result = await cca.acquireTokenByClientCredential({
            scopes: ['https://graph.microsoft.com/.default'],
        });
        return result.accessToken;
    } catch (error) {
        console.error("Error acquiring token:", error);
        throw error;
    }
};
```

### Graph Client Initialization

```javascript
const getGraphClient = async () => {
    const accessToken = await getAccessToken();
    
    const client = Client.init({
        authProvider: (done) => {
            done(null, accessToken);
        },
    });
    
    return client;
};
```

### Sending Emails

```javascript
const sendEmail = async (to, subject, text, html) => {
    try {
        const client = await getGraphClient();
        
        const message = {
            message: {
                subject: subject,
                body: {
                    contentType: 'HTML',
                    content: html || text
                },
                toRecipients: [
                    {
                        emailAddress: {
                            address: to
                        }
                    }
                ],
                from: {
                    emailAddress: {
                        address: 'rayait_events@rayacorp.com'
                    }
                }
            },
            saveToSentItems: true
        };

        const response = await client
            .api('/users/rayait_events@rayacorp.com/sendMail')
            .post(message);
            
        return response;
    } catch (error) {
        console.error('Error in sendEmail function:', error);
        throw error;
    }
};
```

## Benefits of Microsoft Graph API

1. **Better Integration with Microsoft 365**: Native integration with Microsoft services
2. **More Reliable Authentication**: Uses modern OAuth 2.0 authentication flow
3. **Additional Capabilities**: Access to other Microsoft Graph features beyond email
4. **Improved Security**: No need to store email password in code

## Testing

A test script has been created at `src/test-email.js` to verify the implementation works correctly.

## Usage in Bulk Email Sending

The `sendBulkEmails` function has been updated to use the new Microsoft Graph API implementation. The commented code for sending emails to multiple users has been updated to use the new approach.

## Troubleshooting

If you encounter issues:

1. Verify the application has proper permissions in Azure AD
2. Ensure the scopes include `https://graph.microsoft.com/.default`
3. Check that the sender email address is correctly configured
4. Review Microsoft Graph API documentation for any endpoint changes