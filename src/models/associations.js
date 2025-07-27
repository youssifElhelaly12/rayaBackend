const User = require('./User');
const Tag = require('./Tag');

User.belongsToMany(Tag, { through: 'UserTags', as: 'tags' });
Tag.belongsToMany(User, { through: 'UserTags', as: 'users' });