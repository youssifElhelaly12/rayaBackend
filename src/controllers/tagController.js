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