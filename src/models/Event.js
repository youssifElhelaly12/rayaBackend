const { DataTypes } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
      id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      eventPage: {
          type: DataTypes.STRING,
          allowNull: true,
          validate: {
              isUrl:true
          }
      },
      eventName: {
          type: DataTypes.STRING,
          allowNull: false
      },
      eventBannerImage: {
          type: DataTypes.STRING,
          allowNull: true,
      },
      idImage: {
          type: DataTypes.ENUM('false', 'required', 'optional'),
          allowNull: true,
      },
      apologizeContent: {
          type: DataTypes.TEXT,
          allowNull: true,
      },
      acceptedContent: {
          type: DataTypes.TEXT,
          allowNull: true,
      },
      invitationSubject: {
          type: DataTypes.STRING,
          allowNull: true,
      },
      verifySubject: {
          type: DataTypes.STRING,
          allowNull: true,
      }
  });
  return Event;
};