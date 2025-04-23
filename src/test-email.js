import { sendEmail } from './controllers/emailController.js';

// Test the email sending functionality
console.log('Starting email test using Microsoft Graph API...');

sendEmail(
    'youssifelhlaly@hotmail.com',
    'Test Email from Microsoft Graph API',
    'This is a plain text message',
    '<h1>Hello!</h1><p>This is a test email sent using Microsoft Graph API instead of Nodemailer.</p>'
)
    .then(response => {
        console.log('Email sent successfully!');
        console.log('Response:', response);
    })
    .catch(error => {
        console.error('Error sending email:', error);
    });