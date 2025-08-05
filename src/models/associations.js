const { sequelize, DataTypes } = require('./db');
const User = require('./User');
const Tag = require('./Tag');
const Event = require('./Event');
const EventEmailTemplate = require('./EventEmailTemplate');

const UserModel = User(sequelize, DataTypes);
const TagModel = Tag(sequelize, DataTypes);
const EventModel = Event(sequelize, DataTypes);
const EventEmailTemplateModel = EventEmailTemplate(sequelize, DataTypes);

UserModel.belongsToMany(TagModel, { through: 'UserTags', as: 'tags' });
TagModel.belongsToMany(UserModel, { through: 'UserTags', as: 'users' });

EventModel.hasOne(EventEmailTemplateModel, { foreignKey: 'EventId', onDelete: 'CASCADE' });
EventEmailTemplateModel.belongsTo(EventModel, { foreignKey: 'EventId' });

module.exports = {
  sequelize,
  User: UserModel,
  Tag: TagModel,
  Event: EventModel,
  EventEmailTemplate: EventEmailTemplateModel,
};