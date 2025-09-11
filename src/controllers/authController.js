const jwt = require('jsonwebtoken');
const qr = require('qrcode');
const multer = require('multer');
const path = require('path');
const { UserEvents, User, VerifiedEmailTemplate, UserAnswer, Event } = require('../models/associations');
const nodemailer = require('nodemailer');

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage }).array('idImage', 5);

// Helper to replace template variables
const replaceTemplateVariables = (template, user, token) => {
    return template
        .replace(/{{\s*firstName\s*}}/g, user.firstName || '')
        .replace(/{{\s*lastName\s*}}/g, user.lastName || '')
        .replace(/{{\s*title\s*}}/g, user.title || '')
        .replace(/{{\s*phone\s*}}/g, user.phone || '')
        .replace(/{{\s*email\s*}}/g, user.email || '')
        .replace(/{{\s*company\s*}}/g, user.company || '')
        .replace(/{{\s*token\s*}}/g, token || '')
        .replace(/{{\s*qrCode\s*}}/g, "cid:qrcode");
};

// Controller
exports.invalidateToken = async (req, res, next) => {
    // Use multer inside controller
    upload(req, res, async (err) => {
        if (err) return res.status(500).json({ message: err.message });

        try {
            // Multer files
            const idImagePaths = req.files?.map(file => file.path) || [];

            // Parse FormData fields
            const eventId = req.body.eventId;
            const token = req.body.token;
            let currentUser = {};
            let answers = [];

            try { currentUser = JSON.parse(req.body.currentUser || '{}'); } catch (e) { }
            try { answers = JSON.parse(req.body.answers || '[]'); } catch (e) { }

            if (!eventId) return res.status(400).json({ message: 'Event ID is required' });

            const event = await Event.findByPk(eventId);
            if (!event) return res.status(404).json({ message: 'Event not found' });

            const decodedToken = jwt.decode(token);
            if (!decodedToken) return res.status(401).json({ message: 'Invalid token' });

            const foundUserEvent = await UserEvents.findOne({
                where: { UserId: decodedToken.id, EventId: eventId }
            });
            if (!foundUserEvent) return res.status(404).json({ message: 'Invitation not found' });

            // Update acceptedInvitationStatus and store file paths
            foundUserEvent.acceptedInvitationStatus = true;
            foundUserEvent.idImage = idImagePaths;
            await foundUserEvent.save();

            const decodedLink = jwt.verify(foundUserEvent.invitationUrl, process.env.JWT_SECRET);
            const user = await User.findByPk(decodedLink.id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            // Save answers
            if (answers.length > 0) {
                await Promise.all(
                    answers.map(ans => UserAnswer.create({
                        answer: ans.answer,
                        QuestionId: ans.questionId,
                        EventId: eventId,
                        UserId: user.id
                    }))
                );
            }

            // Update user info
            await User.update({
                comment: currentUser.comment,
                title: currentUser.title,
                phone: currentUser.phone,
                email: currentUser.email,
                company: currentUser.company
            }, { where: { id: user.id } });

            // Invalidate invitation
            await foundUserEvent.update({ isInvalidated: true });

            // Send verification email with QR code
            const verifiedEmailTemplate = await VerifiedEmailTemplate.findOne({ where: { EventId: eventId } });
            if (!verifiedEmailTemplate) return res.status(404).json({ message: 'Verified email template not found' });

            const qrCodeBuffer = await qr.toBuffer(JSON.stringify({ UserId: user.id, EventId: eventId }));

            const personalizedContent = replaceTemplateVariables(
                verifiedEmailTemplate.eventVerifiedEmailTemplate,
                user,
                ""
            );

            const transporter = nodemailer.createTransport({
                host: 'smtp.office365.com',
                port: 587,
                secure: false,  // Using STARTTLS
                tls: {
                    ciphers: 'SSLv3'
                },
                auth: {
                    user: 'rayait_events@rayacorp.com',
                    pass: 'MyBMv@Z9eaPWYZN'
                }
            });

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: event.verifySubject || 'Event Verification',
                html: personalizedContent,
                
                attachments: [{ filename: 'QR_code.png', content: qrCodeBuffer, cid: 'qrcode' }]
            });

            res.json({ message: 'Invitation accepted, images saved, and email sent', uploadedFiles: idImagePaths });

        } catch (error) {
            console.error('Error in invalidateToken:', error);
            if (error.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid token' });
            next(error);
        }
    });
};
