const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const generateToken = (admin) => {
    return jwt.sign(
        { id: admin.id, isAdmin: true, role: "admin", },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
    );
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
            token
        });
    } catch (error) {
        next(error);
    }
};