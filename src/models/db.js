require('dotenv').config();


// Get environment variables based on current environment
const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

// Select the appropriate database configuration based on environment
const dbName = isProduction ? process.env.DB_NAME_PROD : process.env.DB_NAME_DEV;
const dbUser = isProduction ? process.env.DB_USER_PROD : process.env.DB_USER_DEV;
const dbPassword = isProduction ? process.env.DB_PASSWORD_PROD : process.env.DB_PASSWORD_DEV;
const dbHost = isProduction ? process.env.DB_HOST_PROD : process.env.DB_HOST_DEV;
const dbPort = isProduction ? process.env.DB_PORT_PROD : process.env.DB_PORT_DEV;
const dbDialect = isProduction ? process.env.DB_DIALECT_PROD : process.env.DB_DIALECT_DEV;

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: dbDialect,
    logging: env === 'development' ? console.log : false,

});

// Test the connection and sync models
const initDB = async () => {
    try {
        await sequelize.authenticate();
        console.log(`Database connection established successfully (${env} mode).`);
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
    DataTypes: Sequelize.DataTypes
};

// Import models after sequelize is exported to avoid circular dependencies
require('./User');
require('./Tag');
require('./associations');