module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define('Question', {
    question: {
      type: DataTypes.STRING,
      allowNull: false
    },
    answers: {
      type: DataTypes.JSON,
      allowNull: false
    },
    answerType: {
      type: DataTypes.ENUM('dropdown', 'select', 'radio'),
      allowNull: false
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
  });

  return Question;
};