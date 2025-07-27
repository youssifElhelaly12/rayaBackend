import fs from 'fs';
import path from 'path';
import User from '../models/User.js';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
const fileExists = (filePath) => {
    try {
        return fs.existsSync(filePath);
    } catch (error) {
        console.error(`Error checking if file exists: ${filePath}`, error);
        return false;
    }
};
// Email configuration from environment variables
const emailConfig = {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
};

const sendEmail = async () => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: false,  // Using STARTTLS
            tls: {
                ciphers: 'SSLv3'
            },
            auth: {
                user: emailConfig.user,
                pass: emailConfig.pass
            },
            debug: true  // Enable debug output
        });

        const mailOptions = {
            from: emailConfig.user,  // Must match the authenticated user
            to: 'youssif.elhelaly@gmail.com',
            subject: 'Test Email',
            text: 'Hello, this is a test email sent using Nodemailer with regular SMTP!',
        };

        return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    reject(error);
                } else {
                    console.log('Email sent: ' + info.response);
                    resolve(info);
                }
            });
        });
    } catch (error) {
        console.error('Error in sendEmail function:', error);
        throw error;
    }
};

const generateToken = (user) => {
    // Generate a more compact token by only including essential user data
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// Get the directory path dynamically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templatePath = path.join(__dirname, '../scripts/html', 'emailTemplate.html');
const emailTemplate = fs.readFileSync(templatePath, 'utf8');

// Define paths to image assets
const imagesDir = path.join(__dirname, '../scripts/html/images');
const summitBannerPath = path.join(imagesDir, 'summit-banner.jpg');
const eventDetailsPath = path.join(imagesDir, 'event-details.png');


const replaceTemplateVariables = (template, user, token) => {
    return template
        .replace(/{{firstName}}/g, user.firstName || '')
        .replace(/{{token}}/g, token || '')
};

const sendBulkEmails = async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: false,  // Using STARTTLS
            tls: {
                ciphers: 'SSLv3'
            },
            auth: {
                user: emailConfig.user,
                pass: emailConfig.pass
            },
            debug: true  // Enable debug output
        });

        const users = await User.findAll();

        for (const user of users) {
            const token = generateToken(user);
            try {
                const personalizedContent = replaceTemplateVariables(emailTemplate, user, token);

                // Read image files with proper validation
                let summitBannerContent, eventDetailsContent;

                // Check if summit banner image exists before reading
                if (fileExists(summitBannerPath)) {
                    try {
                        summitBannerContent = fs.readFileSync(summitBannerPath);
                    } catch (error) {
                        console.error('Error reading summit banner image:', error.message);
                    }
                } else {
                    console.warn(`Summit banner image not found at: ${summitBannerPath}`);
                }

                // Check if event details image exists before reading
                if (fileExists(eventDetailsPath)) {
                    try {
                        eventDetailsContent = fs.readFileSync(eventDetailsPath);
                    } catch (error) {
                        console.error('Error reading event details image:', error.message);
                    }
                } else {
                    console.warn(`Event details image not found at: ${eventDetailsPath}`);
                }

                // Prepare attachments array
                const attachments = [];

                // Only add images that were successfully loaded
                if (summitBannerContent) {
                    attachments.push({
                        filename: 'summit-banner.jpg',
                        content: summitBannerContent,
                        cid: 'summit-banner@techforward.com' // Same CID value as in the HTML img tag
                    });
                }

                if (eventDetailsContent) {
                    attachments.push({
                        filename: 'event-details.png',
                        content: eventDetailsContent,
                        cid: 'event-details@techforward.com' // Same CID value as in the HTML img tag
                    });
                }

                const mailOptions = {
                    from: emailConfig.user,
                    to: user.email,
                    subject: 'RayaIT - Techforward Summit 2025 Invitation- Sharm El Sheikh 15-17 May,2025',
                    html: personalizedContent,
                    attachments: attachments
                };


                let res = await transporter.sendMail(mailOptions);
                console.log(res);
                await user.update({ emailStatus: true });
                await user.update({ invitationLink: token });
            } catch (error) {
                console.log(error);
            }
        }

        res.status(200).json({ message: 'Email sending process completed' });
    } catch (error) {
        console.error('Error in sendBulkEmails:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const sendSingleEmail = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT),
            secure: false,
            tls: {
                ciphers: 'SSLv3'
            },
            auth: {
                user: emailConfig.user,
                pass: emailConfig.pass
            },
            debug: true
        });

        const token = generateToken(user);
        const personalizedContent = replaceTemplateVariables(emailTemplate, user, token);

        let summitBannerContent, eventDetailsContent;

        if (fileExists(summitBannerPath)) {
            try {
                summitBannerContent = fs.readFileSync(summitBannerPath);
            } catch (error) {
                console.error('Error reading summit banner image:', error.message);
            }
        }

        if (fileExists(eventDetailsPath)) {
            try {
                eventDetailsContent = fs.readFileSync(eventDetailsPath);
            } catch (error) {
                console.error('Error reading event details image:', error.message);
            }
        }

        const attachments = [];

        if (summitBannerContent) {
            attachments.push({
                filename: 'summit-banner.jpg',
                content: summitBannerContent,
                cid: 'summit-banner@techforward.com'
            });
        }

        if (eventDetailsContent) {
            attachments.push({
                filename: 'event-details.png',
                content: eventDetailsContent,
                cid: 'event-details@techforward.com'
            });
        }

        const mailOptions = {
            from: emailConfig.user,
            to: user.email,
            subject: 'RayaIT - Techforward Summit 2025 Invitation- Sharm El Sheikh 15-17 May,2025',
            html: personalizedContent,
            attachments: attachments
        };

        await transporter.sendMail(mailOptions);
        await user.update({ emailStatus: true, invitationLink: token });

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error in sendSingleEmail:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export { sendBulkEmails, sendSingleEmail };
