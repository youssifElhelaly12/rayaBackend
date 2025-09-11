const { DataTypes } = require('sequelize');
const { sequelize } = require('./db');
const bcrypt = require('bcryptjs');

const Admin = sequelize.define('Admin', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    role: {
        type: DataTypes.ENUM('super_admin', 'admin', 'user'),
        allowNull: false,
        defaultValue: 'admin'
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 100]
        }
    },
    resetToken: {
        type: DataTypes.STRING
    },
    resetTokenExpiry: {
        type: DataTypes.BIGINT
    }
}, {
    hooks: {
        beforeCreate: async (admin) => {
            if (admin.password) {
                const salt = await bcrypt.genSalt(10);
                admin.password = await bcrypt.hash(admin.password, salt);
            }
        },
        beforeUpdate: async (admin) => {
            if (admin.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                admin.password = await bcrypt.hash(admin.password, salt);
            }
        }
    },
    timestamps: true
});

Admin.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);

};

module.exports = Admin;