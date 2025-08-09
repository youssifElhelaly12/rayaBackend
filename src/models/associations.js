const { sequelize, DataTypes } = require('./db');
const User = require('./User');
const Tag = require('./Tag');
const Event = require('./Event');
const EventEmailTemplate = require('./EventEmailTemplate');
const UserEvents = require('./UserEvents');
const VerifiedEmailTemplate = require('./VerifiedEmailTemplate');

const UserModel = User(sequelize, DataTypes);
const TagModel = Tag(sequelize, DataTypes);
const EventModel = Event(sequelize, DataTypes);
const EventEmailTemplateModel = EventEmailTemplate(sequelize, DataTypes);
const UserEventsModel = UserEvents(sequelize, DataTypes);
const VerifiedEmailTemplateModel = VerifiedEmailTemplate(sequelize, DataTypes);

UserModel.belongsToMany(TagModel, { through: 'UserTags', as: 'tags' });
TagModel.belongsToMany(UserModel, { through: 'UserTags', as: 'users' });

EventModel.hasOne(EventEmailTemplateModel, { foreignKey: 'EventId', onDelete: 'CASCADE' });
EventEmailTemplateModel.belongsTo(EventModel, { foreignKey: 'EventId' });

EventModel.hasOne(VerifiedEmailTemplateModel, { foreignKey: 'EventId', onDelete: 'CASCADE' });
VerifiedEmailTemplateModel.belongsTo(EventModel, { foreignKey: 'EventId' });

UserEventsModel.belongsTo(UserModel, { foreignKey: 'userId' });
UserModel.hasMany(UserEventsModel, { foreignKey: 'userId', as: 'userEventsData' });

UserEventsModel.belongsTo(EventModel, { foreignKey: 'eventId' });
EventModel.hasMany(UserEventsModel, { foreignKey: 'eventId', as: 'eventUserEvents' });

UserModel.belongsToMany(EventModel, {
  through: 'UserEvents',
  as: 'invitedEvents',
  foreignKey: 'userId',
  otherKey: 'eventId',
  timestamps: false,
});

EventModel.belongsToMany(UserModel, {
  through: 'UserEvents',
  as: 'usersInvited',
  foreignKey: 'eventId',
  otherKey: 'userId',
  timestamps: false,
});

module.exports = {
  sequelize,
  User: UserModel,
  Tag: TagModel,
  Event: EventModel,
  EventEmailTemplate: EventEmailTemplateModel,
  UserEvents: UserEventsModel,
  VerifiedEmailTemplate: VerifiedEmailTemplateModel,
};