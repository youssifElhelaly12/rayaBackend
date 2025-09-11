const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const Admin = require('../models/Admin');
const { sendPasswordResetEmail } = require('./emailController');

const generateToken = (admin) => {
    return jwt.sign(
        { id: admin.id, isAdmin: true, role: admin.role, },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const generateResetToken = () => {
    return crypto.randomBytes(20).toString('hex');
};

exports.adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ where: { email } });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        console.log(admin); // Log the admin object to check its propertie

        const isValidPassword = await admin.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(admin);

        res.json({
            id: admin.id,
            email: admin.email,
            role:admin.role,
            token
        });
    } catch (error) {
        next(error);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        
        const admin = await Admin.findOne({ where: { email } });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        
        const resetToken = generateResetToken();
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
        
        admin.resetToken = resetToken;
        admin.resetTokenExpiry = resetTokenExpiry;
        await admin.save();
        
        await sendPasswordResetEmail(admin.email, resetToken);
        
        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        
        const admin = await Admin.findOne({ 
            where: { 
                resetToken: token,
                resetTokenExpiry: { [Op.gt]: Date.now() }
            } 
        });
        
        if (!admin) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        
        admin.password = newPassword;
        admin.resetToken = null;
        admin.resetTokenExpiry = null;
        await admin.save();
        
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        next(error);
    }
};