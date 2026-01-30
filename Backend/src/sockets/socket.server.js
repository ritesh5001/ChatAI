const { Server } = require("socket.io");
const cookie = require('cookie');
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const aiService = require("../services/ai.service");
const Message = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

function initSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true,
        }
    })

    io.use(async (socket, next) => {

        const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

        if (!cookies.token) {
            next(new Error(" Authentication error: no token found"))
        }

        try {

            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);

            const user = await User.findByPk(decoded.id);

            socket.user = user;

            next();

        } catch (err) {
            next(new Error("Authentication error: Invalid token"));
        }

    })

    io.on("connection", (socket) => {

        socket.on("ai-message", async (messagePayload) => {


            const [message, vectors] = await Promise.all([
                Message.create({
                    chatId: messagePayload.chat,
                    userId: socket.user.id,
                    content: messagePayload.content,
                    role: "user"
                }),

                aiService.generateVector(messagePayload.content),

            ])

            await createMemory({
                vectors,
                messageId: message.id,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user.id,
                    text: messagePayload.content
                }
            })

            const [memory, chatHistory] = await Promise.all([
                queryMemory({
                    queryVector: vectors,
                    limit: 3,
                    metadata: {
                        user: socket.user.id
                    }
                }),

                Message.findAll({
                    where: { chatId: messagePayload.chat },
                    order: [['createdAt', 'DESC']],
                    limit: 20,
                    raw: true
                }).then(messages => messages.reverse())

            ])


            const stm = chatHistory.map(item => {
                return {
                    role: item.role,
                    parts: [{ text: item.content }]
                }
            })

            const ltm = [
                {
                    role: "user",
                    parts: [{
                        text: `
                        these are some preveous from the chat, use them to generate a response

                        ${memory.map(item => item.metadata.text).join("\n")}
                        `}]
                }
            ]

            const response = await aiService.generateResponse([...ltm, ...stm])

            socket.emit('ai-response', {
                content: response,
                chat: messagePayload.chat
            })

            const [responseMessage, responseVectors] = await Promise.all([
                Message.create({
                    chatId: messagePayload.chat,
                    userId: socket.user.id,
                    content: response,
                    role: "model"
                }),
                aiService.generateVector(response)
            ])

            await createMemory({
                vectors: responseVectors,
                messageId: responseMessage.id,
                metadata: {
                    chat: messagePayload.chat,
                    user: socket.user.id,
                    text: response
                }
            })
        })
    })
}

module.exports = initSocketServer;
