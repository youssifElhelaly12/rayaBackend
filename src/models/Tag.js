const { DataTypes } = require('sequelize');
const { sequelize } = require('./db');
const Tag = sequelize.define('Tag', {
    tagName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

module.exports = Tag;