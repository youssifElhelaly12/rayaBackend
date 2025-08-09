const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserEvents = require('../models/UserEvents');
const VerifiedEmailTemplate = require('../models/VerifiedEmailTemplate');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: "admin" },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};
const replaceTemplateVariables = (template, user) => {
    return template
        .replace(/{{firstName}}/g, user.firstName || '')
};
const emailConfig = {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
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
        const { eventId, currentUser } = req.body;
        if (!eventId) {
            return res.status(400).json({ message: 'Event ID is required' });
        }

        let foundUserEvent = await UserEvents.findOne({
            where: {
                UserId: currentUser.id,
                EventId: eventId
            }
        });

        if (!foundUserEvent || !foundUserEvent.invitationLink) {
            return res.status(404).json({ message: 'Invitation link not found for this user and event' });
        }

        const invitationLink = foundUserEvent.invitationLink;
        const decoded = jwt.verify(invitationLink, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        await User.update({
            comment: currentUser.comment,
            title: currentUser.title,
            phone: currentUser.phone,
            email: currentUser.email,
        }, {
            where: { id: user.id }
        });

        let userEvent = await UserEvents.findOne({
            where: {
                UserId: user.id,
                EventId: eventId,
                invitationLink: invitationLink
            }
        });

        if (!userEvent) {
            return res.status(404).json({ message: 'User event not found' });
        }

        await userEvent.update({ isInvalidated: true });

        const verifiedEmailTemplate = await VerifiedEmailTemplate.findOne({
            where: {
                EventId: eventId
            }
        });

        if (!verifiedEmailTemplate) {
            return res.status(404).json({ message: 'Verified email template not found for this event' });
        }

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

        const personalizedContent = replaceTemplateVariables(verifiedEmailTemplate.eventVerifiedEmailTemplate, user);

        const mailOptions = {
            from: emailConfig.user,
            to: user.email,
            subject: 'RayaIT - Techforward Summit 2025 - Registration Confirmation',
            html: personalizedContent,
        };
        await transporter.sendMail(mailOptions);

        res.json({ message: 'Token invalidated and email sent successfully' });
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