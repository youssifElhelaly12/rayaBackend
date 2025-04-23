require('dotenv').config();
const { sequelize } = require('../models/db');
const Admin = require('../models/Admin');

async function createAdmin() {
    try {
        await sequelize.sync();

        const admin = await Admin.create({
            email: 'admin@admin.com',
            password: 'admin123'
        });

        console.log('Admin created successfully:', admin.email);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();