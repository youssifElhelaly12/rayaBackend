import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { User, EventEmailTemplate, Event, Tag, UserEvents } from '../models/associations.js';
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
    user: "youssif.elhelaly@gmail.com",
    pass: "kkgk ubmd sekv thcs"
};

const sendEmail = async () => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
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

const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: emailConfig.user,
                pass: emailConfig.pass
            },
            debug: true
        });

        const resetLink = `https://events.raya-it.net/reset-password?token=${resetToken}`;
        
        const mailOptions = {
            from: emailConfig.user,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <p>You requested a password reset for your admin account.</p>
                <p>Click this link to reset your password: <a href="${resetLink}">${resetLink}</a></p>
                <p>This link will expire in 1 hour.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${email}`);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
};

const generateToken = (user, event) => {
    // Generate a more compact token by only including essential user data
    return jwt.sign(
        { id: user.id, email: user.email, eventId: event },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};
// Get the directory path dynamically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const templatePath = path.join(__dirname, '../scripts/html', 'emailTemplate.html');
// const emailTemplate = fs.readFileSync(templatePath, 'utf8');

// Define paths to image assets
const imagesDir = path.join(__dirname, '../scripts/html/images');
const summitBannerPath = path.join(imagesDir, 'summit-banner.jpg');
const eventDetailsPath = path.join(imagesDir, 'event-details.png');

const replaceTemplateVariables = (template, user, token) => {
    return template
        .replace(/{{firstName}}/g, user.firstName || '')
        .replace(/{{lastName}}/g, user.lastName || '')
        .replace(/{{title}}/g, user.title || '')
        .replace(/{{phone}}/g, user.phone || '')
        .replace(/{{email}}/g, user.email || '')
        .replace(/{{company}}/g, user.company || '')
        .replace(/{{token}}/g, token || '')

};

const sendBulkEmails = async (req, res) => {
    const { eventId, tagId } = req.body;

    if (!eventId) {
        return res.status(400).json({ message: 'EventId is required for sending bulk emails.' });
    }

    if (!tagId) {
        return res.status(400).json({ message: 'TagId is required for sending bulk emails.' });
    }

    const eventEmailTemplateRecord = await EventEmailTemplate.findOne({ where: { EventId: eventId } });
    if (!eventEmailTemplateRecord) {
        return res.status(404).json({ message: 'Email template not found for the given EventId.' });
    }
    const eventEmailTemplate = eventEmailTemplateRecord.eventEmailTemplate;

    const event = await Event.findByPk(eventId);
    if (!event) {
        return res.status(404).json({ message: 'Event not found for the given EventId.' });
    }
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: emailConfig.user,
                pass: emailConfig.pass
            },
            debug: true
        });

        const tag = await Tag.findByPk(tagId);
        if (!tag) {
            return res.status(404).json({ message: 'Tag not found for the given TagId.' });
        }
        const users = await tag.getUsers(); // Assuming a many-to-many relationship is set up with getUsers

        for (const user of users) {
            const token = generateToken(user, eventId);
            try {
                const personalizedContent = replaceTemplateVariables(eventEmailTemplate, user, token);


                const mailOptions = {
                    from: emailConfig.user,
                    to: user.email,
                    subject: event.invitationSubject || 'Invitation', // Use event invitationSubject as subject or a default
                    html: personalizedContent,
                   
                };


                const info = await transporter.sendMail(mailOptions);
                console.log('Email sent: %s', info.messageId);
                await user.update({ emailStatus: true });
                 await user.update({ invitationLink: token });
            } catch (error) {
                console.error('Failed to send email to %s: %s', user.email, error);
            }
        }

        res.status(200).json({ message: 'Email sending process completed' });
    } catch (error) {
        console.error('Error in sendBulkEmails:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const sendSingleEmail = async (req, res) => {
    console.log(req.params);
    const { userId, eventId } = req.params;

    if (!eventId) {
        return res.status(400).json({ message: 'EventId is required for sending a single email.' });
    }

    const eventEmailTemplateRecord = await EventEmailTemplate.findOne({ where: { EventId: eventId } });
    if (!eventEmailTemplateRecord) {
        return res.status(404).json({ message: 'Email template not found for the given EventId.' });
    }
    const eventEmailTemplate = eventEmailTemplateRecord.eventEmailTemplate;

    const event = await Event.findByPk(eventId);
    if (!event) {
        return res.status(404).json({ message: 'Event not found for the given EventId.' });
    }
    try {

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "youssif.elhelaly@gmail.com",
                pass: "kkgk ubmd sekv thcs"
            },
            debug: true
        });

        const token = generateToken(user, eventId);
        const personalizedContent = replaceTemplateVariables(eventEmailTemplate, user, token);


        const mailOptions = {
            from: emailConfig.user,
            to: user.email,
            subject: event.invitationSubject || 'Invitation',
            html: personalizedContent,
        };

        await transporter.sendMail(mailOptions);
        await user.update({ emailStatus: true, invitationLink: token });

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error in sendSingleEmail:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const sendBulkEmailForUsers = async (req, res) => {
    const { userIds, eventId } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: 'User IDs are required for sending bulk emails to specific users.' });
    }

    if (!eventId) {
        return res.status(400).json({ message: 'Event ID is required for sending bulk emails to specific users.' });
    }

    try {
        const eventEmailTemplateRecord = await EventEmailTemplate.findOne({ where: { EventId: eventId } });
        if (!eventEmailTemplateRecord) {
            return res.status(404).json({ message: 'Email template not found for the given Event ID.' });
        }
        const eventEmailTemplate = eventEmailTemplateRecord.eventEmailTemplate;

        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found for the given Event ID.' });
        }

        const users = await User.findAll({ where: { id: userIds } });
        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found for the provided user IDs.' });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: emailConfig.user,
                pass: emailConfig.pass
            },
            debug: true
        });

        for (const user of users) {
            const token = generateToken(user, eventId);
            try {
                const personalizedContent = replaceTemplateVariables(eventEmailTemplate, user, token);

                let summitBannerContent, eventDetailsContent;



                const mailOptions = {
                    from: emailConfig.user,
                    to: user.email,
                    subject: event.invitationSubject || 'Invitation',
                    html: personalizedContent,

                };

                let resMail = await transporter.sendMail(mailOptions);
                console.log(resMail);

                // Check if a UserEvents record already exists
                const existingUserEvent = await UserEvents.findOne({
                    where: {
                        userId: user.id,
                        eventId: eventId
                    }
                });

                if (existingUserEvent) {
                    // If record exists, update only invitationUrl and emailStatus
                    await existingUserEvent.update({
                        invitationUrl: token,
                        emailStatus: true
                    });
                } else {
                    // If no record exists, create a new one
                    await UserEvents.create({
                        userId: user.id,
                        eventId: eventId,
                        invitationUrl: token,
                        emailStatus: true,
                        acceptedInvitationStatus: false // Default to false
                    });
                }

            } catch (error) {
                console.error(`Error sending email to user ${user.email}:`, error);
            }
        }

        res.status(200).json({ message: 'Email sending process completed for specified users.' });
    } catch (error) {
        console.error('Error in sendBulkEmailForUsers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export { sendEmail, sendBulkEmails, sendSingleEmail, sendBulkEmailForUsers, sendPasswordResetEmail };