const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: ' 4 Not authorized to access this route' });
        }

        console.log(token); // Log the token to check its content

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            console.log(decoded); // Log the decoded token to check its content
            req.user = await Admin.findByPk(decoded.id);
            next();
        } catch (err) {
            console.error(err); // Log the error to check its details
            return res.status(401).json({ message: 'Not authorized to access this route' });
        }
    } catch (error) {
        next(error);
    }
};