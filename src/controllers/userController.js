const User = require('../models/User');
const Tag = require('../models/Tag');

exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.findAll({
            include: [{ model: Tag, as: 'tags', through: { attributes: [] } }]
        });

        if (!users) {
            return res.status(500).json({ message: 'Database error occurred' });
        }

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            message: 'Error fetching users',
            error: error.message
        });
    }
};

exports.getUser = async (req, res, next) => {
    console.log(req.params);
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if user is updating their own data or is admin
        if (req.user.id !== user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { username, email, password } = req.body;

        if (username) user.username = username;
        if (email) user.email = email;
        if (password) user.password = password;

        await user.save();

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};

exports.createUser = async (req, res) => {
    try {
        const { email, firstName, lastName, phone, title, comment, tagId } = req.body;
        const user = await User.create({
            email,
            firstName,
            lastName,
            phone,
            title,
            comment
        });

        if (tagId) {
            const tag = await Tag.findByPk(tagId);
            if (!tag) {
                await user.destroy(); // Rollback user creation if tag not found
                return res.status(404).json({ message: 'Tag not found' });
            }
            await user.addTag(tag);
        }

        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.searchUsersByEmail = async (req, res, next) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email query parameter is required' });
        }

        // Import the Op operator from Sequelize
        const { Op } = require('sequelize');

        // Perform case-insensitive search using Sequelize
        const users = await User.findAll({
            where: {
                email: {
                    [Op.like]: `%${email}%`
                }
            }
        });

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found with the provided email' });
        }

        res.json(users);
    } catch (error) {
        console.error('Error searching users by email:', error);
        next(error);
    }
};
// Remove this duplicate export block at the bottom
// module.exports = {
//     getUsers,
//     getUser,
//     updateUser,
//     deleteUser,
//     createUser
// };