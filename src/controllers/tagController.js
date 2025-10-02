const { Tag, User } = require('../models/associations');

const { Op } = require("sequelize");
function formatResponse(rows, count, page = 1, limit = null) {
    const perPage = limit || count;
    const totalPages = limit ? Math.max(1, Math.ceil(count / limit)) : 1;
    const currentPage = limit ? page : 1;

    return {
        totalItems: count,
        totalPages,
        currentPage,
        perPage,
        data: rows,
    };
  }
/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: API for managing tags
 */

// ============================= CREATE TAG =============================
/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Create a new tag
 *     tags: [Tags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tagName
 *             properties:
 *               tagName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tag created successfully
 *       400:
 *         description: Tag already exists
 */
exports.createTag = async (req, res) => {
    try {
        const { tagName } = req.body;
        const tag = await Tag.create({ tagName });
        return res.status(201).json(formatResponse([tag], 1, 1, 1));
    } catch (error) {
        return res.status(400).json({ error: "Tag name already exists" });
    }
};

// ============================= GET ALL TAGS =============================
/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Get all tags (paginated)
 *     tags: [Tags]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: Items per page (or 'all')
 *     responses:
 *       200:
 *         description: List of tags
 */
exports.getTags = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = limit === "all" ? null : parseInt(limit);

        const { count, rows } = await Tag.findAndCountAll({
            include: [{ model: User, as: 'users', through: { attributes: [] } }],
            offset: limit ? (page - 1) * limit : undefined,
            limit: limit || undefined,
            distinct: true
        });

        return res.status(200).json(formatResponse(rows, count, page, limit));
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// ============================= SEARCH TAGS =============================
/**
 * @swagger
 * /api/tags/search:
 *   get:
 *     summary: Search tags by name
 *     tags: [Tags]
 *     parameters:
 *       - in: query
 *         name: tagName
 *         schema:
 *           type: string
 *         description: Name to search for
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: Items per page (or 'all')
 *     responses:
 *       200:
 *         description: List of matching tags
 */
exports.searchTags = async (req, res) => {
    try {
        let { tagName = "", page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = limit === "all" ? null : parseInt(limit);

        const { count, rows } = await Tag.findAndCountAll({
            where: { tagName: { [Op.iLike]: `%${tagName}%` } },
            include: [{ model: User, as: 'users', through: { attributes: [] } }],
            offset: limit ? (page - 1) * limit : undefined,
            limit: limit || undefined,
            distinct: true
        });

        return res.status(200).json(formatResponse(rows, count, page, limit));
    } catch (error) {
        console.error("Error searching tags:", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================= GET TAG BY ID =============================
/**
 * @swagger
 * /api/tags/{id}:
 *   get:
 *     summary: Get a single tag by ID
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tag with associated users
 *       404:
 *         description: Tag not found
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
        return res.status(200).json(formatResponse([tag], 1, 1, 1));
    } catch (error) {
        console.error('Error fetching tag details:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================= UPDATE TAG =============================
/**
 * @swagger
 * /api/tags/{id}:
 *   put:
 *     summary: Update a tag
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tagName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tag updated successfully
 *       404:
 *         description: Tag not found
 */
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
        return res.status(200).json(formatResponse([tag], 1, 1, 1));
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

// ============================= DELETE TAG =============================
/**
 * @swagger
 * /api/tags/{id}:
 *   delete:
 *     summary: Delete a tag
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tag deleted successfully
 *       404:
 *         description: Tag not found
 */
exports.deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
        const tag = await Tag.findByPk(id);
        if (!tag) {
            return res.status(404).json({ message: 'Tag not found' });
        }
        await tag.setUsers([]);
        await tag.destroy();
        return res.status(200).json({ message: 'Tag deleted successfully' });
    } catch (error) {
        console.error('Error deleting tag:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================= ADD USERS TO TAG =============================
/**
 * @swagger
 * /api/tags/{tagId}/users:
 *   post:
 *     summary: Add one or more users to a tag
 *     tags: [Tags]
 */
exports.addUsersToTag = async (req, res) => {
    try {
        const { tagId } = req.params;
        const { userIds } = req.body;

        if (!tagId || !Array.isArray(userIds) || userIds.length === 0) {
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
        return res.status(200).json({ message: 'Users added to tag successfully.' });
    } catch (error) {
        console.error('Error adding users to tag:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// ============================= REMOVE USER FROM TAG =============================
/**
 * @swagger
 * /api/tags/{tagId}/users/{userId}:
 *   delete:
 *     summary: Remove a user from a tag
 *     tags: [Tags]
 */
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
