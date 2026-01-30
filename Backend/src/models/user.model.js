const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true // Allow null for OAuth users
    },
    googleId: {
        type: DataTypes.STRING,
        allowNull: true
        // Removed unique: true - will use index instead
    },
    githubId: {
        type: DataTypes.STRING,
        allowNull: true
        // Removed unique: true - will use index instead
    }
}, {
    timestamps: true,
    tableName: 'users',
    indexes: [
        // Partial unique indexes - only enforce uniqueness when not null
        {
            unique: true,
            fields: ['googleId'],
            where: {
                googleId: { [require('sequelize').Op.ne]: null }
            }
        },
        {
            unique: true,
            fields: ['githubId'],
            where: {
                githubId: { [require('sequelize').Op.ne]: null }
            }
        }
    ]
});

module.exports = User;