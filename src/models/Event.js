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
      }
  });

  return Event;
};