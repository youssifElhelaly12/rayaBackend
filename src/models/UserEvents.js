module.exports = (sequelize, DataTypes) => {
  const UserEvents = sequelize.define('UserEvents', {
    invitationUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emailStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    acceptedInvitationStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Events',
        key: 'id',
      },
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    isEnter: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    idImage: {
      type: DataTypes.JSON, // Native JSON column
      allowNull: true,
      defaultValue: []    
    },
  }, {
    timestamps: false,
  });

  return UserEvents;
};