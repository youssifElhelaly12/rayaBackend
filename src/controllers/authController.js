const jwt = require('jsonwebtoken');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const fileExists = (filePath) => {
    try {
        return fs.existsSync(filePath);
    } catch (error) {
        console.error(`Error checking if file exists: ${filePath}`, error);
        return false;
    }
};
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
    );
};
const replaceTemplateVariables = (template, user) => {
    return template
        .replace(/{{firstName}}/g, user.firstName || '')
};

const templatePath = path.join(__dirname, '../scripts/html', 'verfiy.html');
const emailTemplate = fs.readFileSync(templatePath, 'utf8');
// Define paths to image assets
const imagesDir = path.join(__dirname, '../scripts/html/images');
const summitBannerPath = path.join(imagesDir, 'summit-banner.jpg');
const eventDetailsPath = path.join(imagesDir, 'event-details.png');
const emailConfig = {
    user: 'rayait_events@rayacorp.com',
    pass: 'MyBMv@Z9eaPWYZN'
};
exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            username,
            email,
            password
        });

        const token = generateToken(user);

        res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            token
        });
    } catch (error) {
        next(error);
    }
};

exports.invalidateToken = async (req, res, next) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.office365.com',
            port: 587,
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
        const { token, currentUser } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        await User.update({

            tokenInvalidated: true,
            comment: currentUser.comment,
            title: currentUser.title,
            phone: currentUser.phone,
        }, {
            where: { id: user.id }
        });
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
        await transporter.sendMail(mailOptions);

        res.json({ message: 'Token invalidated successfully' });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user);

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            token
        });
    } catch (error) {
        next(error);
    }
};