const Tag = require('../models/Tag');

exports.createTag = async (req, res) => {
    try {
        const { tagName } = req.body;
        const tag = await Tag.create({
            tagName: tagName
        });
        res.status(201).json(tag);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const User = require('../models/User');

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