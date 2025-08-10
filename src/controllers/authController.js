const jwt = require('jsonwebtoken');

const { UserEvents, User, VerifiedEmailTemplate } = require('../models/associations');

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
        const { eventId, currentUser , token  } = req.body;
        if (!eventId) {
            return res.status(400).json({ message: 'Event ID is required' });
        }
        const decodedToken = jwt.decode(token);
        
        let foundUserEvent = await UserEvents.findOne({
            where: {
                UserId: decodedToken.id,
                EventId: eventId
            }
        });
        console.log("working" , decodedToken.id)

        console.log(foundUserEvent , "test found user")

        if (!foundUserEvent || !foundUserEvent.invitationUrl) {
            return res.status(404).json({ message: 'Invitation link not found for this user and event' });
        }

        // Update acceptedInvitationStatus to true
        foundUserEvent.acceptedInvitationStatus = true;
        await foundUserEvent.save();

        const invitationLink = foundUserEvent.invitationUrl;
        console.log(invitationLink)
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
            company: currentUser.company
        }, {
            where: { id: user.id }
        });

        let userEvent = await UserEvents.findOne({
            where: {
                UserId: user.id,
                EventId: eventId,
                invitationUrl: invitationLink
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
            service: "gmail",
            auth: {
                user: "youssif.elhelaly@gmail.com",
                pass: "kkgk ubmd sekv thcs"
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