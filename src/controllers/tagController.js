const { Tag, User } = require('../models/associations');

exports.createTag = async (req, res) => {
    try {
        const { tagName } = req.body;
        const tag = await Tag.create({
            tagName: tagName
        });
        res.status(201).json(tag);
    } catch (error) {
       
        res.status(400).json({ error: "tag name is already exist" });
    }
};

exports.getTags = async (req, res) => {
    try {
        const tags = await Tag.findAll({
            include: [{ model: User, as: 'users', through: { attributes: [] } }]
        });
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * @swagger
 * /api/tags/{id}:
 *   get:
 *     summary: Get a single tag by ID
 *     tags:
 *       - Tags
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the tag to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A single tag object with associated users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TagWithUsers'
 *       404:
 *         description: Tag not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tag not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
exports.getTagDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const tag = await Tag.findByPk(id, {
            include: [{ model: User, as: 'users', through: { attributes: [] } }]
        });
        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }
        res.status(200).json(tag);
    } catch (error) {
        console.error('Error fetching tag details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateTag = async (req, res) => {
    try {
        const { id } = req.params;
        const { tagName } = req.body;
        const tag = await Tag.findByPk(id);
        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }
        tag.tagName = tagName;
        await tag.save();
        res.status(200).json(tag);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
        const tag = await Tag.findByPk(id);
        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }

        // Remove associations with users first (through table), then delete the tag
        await tag.setUsers([]);
        await tag.destroy();

        return res.status(200).json({ message: 'Tag deleted successfully' });
    } catch (error) {
        console.error('Error deleting tag:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * @swagger
 * /api/tags/{tagId}/users:
 *   post:
 *     summary: Add one or more users to a tag
 *     tags:
 *       - Tags
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         description: Numeric ID of the tag
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: An array of user IDs to add to the tag
 *                 example: [1, 2, 3]
 *     responses:
 *       200: 
 *         description: Users successfully added to the tag
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Users added to tag successfully
 *       400:
 *         description: Invalid input or tag/users not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tag ID and user IDs are required
 *       404:
 *         description: Tag or one or more users not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tag not found or some users do not exist
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
exports.addUsersToTag = async (req, res) => {
    try {
        const { tagId } = req.params;
        const { userIds } = req.body;

        if (!tagId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: 'Tag ID and an array of user IDs are required.' });
        }

        const tag = await Tag.findByPk(tagId);
        if (!tag) {
            return res.status(404).json({ message: 'Tag not found.' });
        }

        const users = await User.findAll({ where: { id: userIds } });
        if (users.length !== userIds.length) {
            return res.status(404).json({ message: 'One or more users not found.' });
        }

        await tag.addUsers(users);

        res.status(200).json({ message: 'Users added to tag successfully.' });
    } catch (error) {
        console.error('Error adding users to tag:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.removeUserFromTag = async (req, res) => {
    try {
        const { tagId, userId } = req.params;

        const tag = await Tag.findByPk(tagId);
        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await tag.removeUser(user);

        return res.status(200).json({ message: 'User removed from tag successfully' });
    } catch (error) {
        console.error('Error removing user from tag:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};