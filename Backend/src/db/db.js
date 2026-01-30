const sequelize = require('./sequelize');

async function connectDb() {
    try {
        await sequelize.authenticate();
        console.log("Connected to PostgreSQL");
        
        // Import models here to avoid circular dependency
        const User = require('../models/user.model');
        const Chat = require('../models/chat.model');
        const Message = require('../models/message.model');
        
        // Set up associations
        User.hasMany(Chat, { foreignKey: 'userId' });
        Chat.belongsTo(User, { foreignKey: 'userId' });
        
        User.hasMany(Message, { foreignKey: 'userId' });
        Message.belongsTo(User, { foreignKey: 'userId' });
        
        Chat.hasMany(Message, { foreignKey: 'chatId' });
        Message.belongsTo(Chat, { foreignKey: 'chatId' });
        
        // Sync all models (creates tables if they don't exist)
        await sequelize.sync({ alter: true });
        console.log("Database synchronized");
    } catch (err) {
        console.error("Error connecting to PostgreSQL", err);
    }
}

module.exports = { connectDb, sequelize };