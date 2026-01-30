const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    chatId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'chats',
            key: 'id'
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('user', 'model', 'system'),
        defaultValue: 'user'
    }
}, {
    timestamps: true,
    tableName: 'messages'
});

module.exports = Message;