const { User, Tag, UserEvents, Event } = require('../models/associations');

exports.getUsers = async (req, res, next) => {
    try {
        // Get sort parameters from query
        const sortField = req.query.sort || 'company';
        const sortOrder = req.query.order || 'ASC';
        
        // Validate sort field
        const validSortFields = ['title', 'firstName', 'company', 'email'];
        if (!validSortFields.includes(sortField)) {
            return res.status(400).json({ message: 'Invalid sort field' });
        }
        
        // Validate sort order
        const validSortOrders = ['ASC', 'DESC'];
        if (!validSortOrders.includes(sortOrder.toUpperCase())) {
            return res.status(400).json({ message: 'Invalid sort order' });
        }

        if (req.query.limit === 'all') {
            const users = await User.findAll({
                order: [[sortField, sortOrder]],
                include: [
                    { model: Tag, as: 'tags', through: { attributes: [] } },
                    { model: UserEvents, as: 'userEventsData', include: [{ model: Event }] }
                ]
            });
            
            if (!users) {
                return res.status(500).json({ message: 'Database error occurred' });
            }

            if (users.length === 0) {
                return res.status(404).json({ message: 'No users found' });
            }

            return res.json({
                totalUsers: users.length,
                currentPage: 1,
                perPage: users.length,
                users: users,
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows: users } = await User.findAndCountAll({
            limit: limit,
            offset: offset,
            order: [[sortField, sortOrder]],
            include: [
                { model: Tag, as: 'tags', through: { attributes: [] } },
                { model: UserEvents, as: 'userEventsData', include: [{ model: Event }] }
            ]
        });

        if (!users) {
            return res.status(500).json({ message: 'Database error occurred' });
        }

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        res.json({
            totalUsers: count,
            currentPage: page,
            perPage: limit,
            users: users,
        });
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
            include: [
                { model: Tag, as: 'tags', through: { attributes: [] } },
                { model: UserEvents, as: 'userEventsData', include: [{ model: Event }] }
            ],
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
        let { id } = req.params;
        let userIds = [];
        id = JSON.parse(id)
        console.log(id, "id type 1");
        if (Array.isArray(id)) {
            console.log(id, "id type 1");
            userIds = id;
        } else {
            userIds = [id];
        }

        const deletedCount = await User.destroy({
            where: {
                id: userIds
            }
        });

        if (deletedCount === 0) {
            return res.status(404).json({ message: 'No users found with the provided ID(s)' });
        }

        res.json({ message: `${deletedCount} user(s) deleted successfully` });
    } catch (error) {
        next(error);
    }
};

exports.createUser = async (req, res) => {
    try {
        const { email, firstName, lastName, phone, title, comment,company, tagId } = req.body;

        const user = await User.create({
            email,
            firstName,
            lastName,
            phone,
            title,
            comment,
            company
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
 
 exports.getUserEventDetails = async (req, res, next) => {
     try {
         const { userId, eventId } = req.params;
         
         const [user, event, userEvent] = await Promise.all([
             User.findByPk(userId),
             Event.findByPk(eventId),
             UserEvents.findOne({
                 where: {
                     userId,
                     eventId
                 }
             })
         ]);
 
         if (!user) {
             return res.status(404).json({ message: 'User not found' });
         }
         if (!event) {
             return res.status(404).json({ message: 'Event not found' });
         }
 
         res.json({ 
             user: {
                 id: user.id,
                 email: user.email,
                 firstName: user.firstName,
                 lastName: user.lastName
             },
             event: {
                 id: event.id,
                 name: event.name,
             },
             userEvent
         });
     } catch (error) {
         console.error('Error getting user event details:', error);
         next(error);
     }
 };

exports.updateUserEntryStatus = async (req, res, next) => {
     try {
         const { userId, eventId } = req.params;
         
         const [userEvent, user, event] = await Promise.all([
             UserEvents.findOne({
                 where: {
                     userId,
                     eventId
                 }
             }),
             User.findByPk(userId),
             Event.findByPk(eventId)
         ]);
 
         if (!userEvent) {
             return res.status(404).json({ message: 'User event record not found' });
         }
         if (!user) {
             return res.status(404).json({ message: 'User not found' });
         }
         if (!event) {
             return res.status(404).json({ message: 'Event not found' });
         }
 
         if (userEvent.isEnter) {
             return res.status(400).json({ 
                 message: 'User has already entered this event',
                 userEvent,
                 user: {
                     id: user.id,
                     email: user.email,
                     firstName: user.firstName,
                     lastName: user.lastName
                 },
                 event: {
                     id: event.id,
                     name: event.name,
                     date: event.date
                 }
             });
         }
 
         userEvent.isEnter = true;
         await userEvent.save();
 
         res.json({ 
             message: 'User entry status updated successfully', 
             userEvent,
             user: {
                 id: user.id,
                 email: user.email,
                 firstName: user.firstName,
                 lastName: user.lastName
             },
             event: {
                 id: event.id,
                 name: event.name,
                 date: event.date
             }
         });
     } catch (error) {
         console.error('Error updating user entry status:', error);
         next(error);
     }
 };

exports.deleteAllUsers = async (req, res, next) => {
    try {

        const deletedCount = await User.destroy({
            where: {},
            truncate: true
        });

        res.json({
            message: 'All users deleted successfully',
            count: deletedCount
        });
    } catch (error) {
        console.error('Error deleting all users:', error);
        next(error);
    }
};

exports.sendInvitationEmail = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate invitation token (you may want to use jwt or another method)
        const invitationToken = require('crypto').randomBytes(20).toString('hex');

        // Here you would typically send the email using your email service
        // Example: await sendInvitationEmail(user.email, invitationToken);

        res.json({
            message: 'Invitation email sent successfully',
            email: user.email
        });
    } catch (error) {
        console.error('Error sending invitation email:', error);
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