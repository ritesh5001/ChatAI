const Chat = require('../models/chat.model');
const Message = require('../models/message.model');


async function createChat(req, res) {

    const { title } = req.body;
    const user = req.user;

    const chat = await Chat.create({
        userId: user.id,
        title
    });

    res.status(201).json({
        message: "Chat created successfully",
        chat: {
            _id: chat.id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.userId
        }
    });

}

async function getChats(req, res) {
    const user = req.user;

    const chats = await Chat.findAll({ where: { userId: user.id } });

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats: chats.map(chat => ({
            _id: chat.id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.userId
        }))
    });
}

async function getMessages(req, res) {

    const chatId = req.params.id;

    const messages = await Message.findAll({ 
        where: { chatId }, 
        order: [['createdAt', 'ASC']] 
    });

    res.status(200).json({
        message: "Messages retrieved successfully",
        messages: messages.map(msg => ({
            _id: msg.id,
            chat: msg.chatId,
            user: msg.userId,
            content: msg.content,
            role: msg.role,
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt
        }))
    });

}

module.exports = {
    createChat,
    getChats,
    getMessages
};