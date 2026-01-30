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
            origin: [
                "http://localhost:5173",
                "https://chat-ai-backend-mz5ltgm88-smaranapp.vercel.app",
                "https://jarvisai.riteshgiri.dev",
                /\.vercel\.app$/,
                /\.riteshgiri\.dev$/
            ],
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

            // Start message creation and vector generation in parallel
            const messagePromise = Message.create({
                chatId: messagePayload.chat,
                userId: socket.user.id,
                content: messagePayload.content,
                role: "user"
            });

            // Fetch chat history immediately (don't wait for vector)
            const chatHistoryPromise = Message.findAll({
                where: { chatId: messagePayload.chat },
                order: [['createdAt', 'DESC']],
                limit: 20,
                raw: true
            }).then(messages => messages.reverse());

            // Wait for chat history (needed for AI response)
            const [message, chatHistory] = await Promise.all([
                messagePromise,
                chatHistoryPromise
            ]);

            const stm = chatHistory.map(item => {
                return {
                    role: item.role,
                    parts: [{ text: item.content }]
                }
            });

            // Add current message to context
            stm.push({
                role: "user",
                parts: [{ text: messagePayload.content }]
            });

            // Start streaming response immediately
            let fullResponse = "";
            
            socket.emit('ai-response-start', { chat: messagePayload.chat });
            
            try {
                fullResponse = await aiService.generateResponseStream(stm, (chunk) => {
                    socket.emit('ai-response-chunk', {
                        content: chunk,
                        chat: messagePayload.chat
                    });
                });

                socket.emit('ai-response-end', {
                    content: fullResponse,
                    chat: messagePayload.chat
                });

                // Save response and create vectors in background (after response is sent)
                setImmediate(async () => {
                    try {
                        const [responseMessage, userVectors, responseVectors] = await Promise.all([
                            Message.create({
                                chatId: messagePayload.chat,
                                userId: socket.user.id,
                                content: fullResponse,
                                role: "model"
                            }),
                            aiService.generateVector(messagePayload.content),
                            aiService.generateVector(fullResponse)
                        ]);

                        // Create memories in parallel
                        await Promise.all([
                            createMemory({
                                vectors: userVectors,
                                messageId: message.id,
                                metadata: {
                                    chat: messagePayload.chat,
                                    user: socket.user.id,
                                    text: messagePayload.content
                                }
                            }),
                            createMemory({
                                vectors: responseVectors,
                                messageId: responseMessage.id,
                                metadata: {
                                    chat: messagePayload.chat,
                                    user: socket.user.id,
                                    text: fullResponse
                                }
                            })
                        ]);
                    } catch (err) {
                        console.error("Background task error:", err);
                    }
                });

            } catch (error) {
                console.error("AI response error:", error);
                socket.emit('ai-response-error', {
                    error: "Failed to generate response",
                    chat: messagePayload.chat
                });
            }
        })
    })
}

module.exports = initSocketServer;
