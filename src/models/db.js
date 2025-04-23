const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('raya', 'root', '01152451515', {
    host: 'localhost',
    dialect: 'mysql',
    logging: console.log,
});

// Test the connection and sync models
const initDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        await sequelize.sync({ alter: false, logging: false });
        console.log('Database schema preserved - no automatic alterations');
        console.log('Database synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

initDB();

module.exports = {
    sequelize,
    Sequelize
};