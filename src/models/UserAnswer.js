const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserAnswer = sequelize.define('UserAnswer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    answer: {
      type: DataTypes.JSON,
      allowNull: false
    },
    QuestionId: {
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'Questions',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    EventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Events',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    timestamps: true
  });

  return UserAnswer;
};