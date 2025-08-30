const { Server } = require("socket.io");
const cookie = require('cookie');
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model")

 function initSocketServer(httpServer){
    const io = new Server(httpServer,{})

    io.use(async(socket,next)=>{

        const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

        if(!cookies.token){
            next(new Error(" Authentication error: no token found"))
        }

        try {

            const decoded = jwt.verify(cookies.token,process.env.JWT_SECRET);

            const user = await userModel.findById(decoded.id);

            socket.user = user;
             
            next();

        } catch (err) {
            next (new Error("Authentication error: Invalid token"));
        }

    })

    io.on("connection",(socket)=>{
        
        socket.on("ai-message", async(messagePayload)=>{

            

            await messageModel.create({
                chat:messagePayload.chat,
                user:socket.user._id,
                content:messagePayload.content,
                role:"user"
            })

            const chatHistory = (await messageModel.find({
                chat: messagePayload.chat
            }).sort({createdAt:-1}).limit(4).lean()).reverse() 

            

            const response = await aiService.generateResponse(chatHistory.map(item=>{
                return{
                    role: item.role,
                    parts:[{ text: item.content }]
                }
            }))

            await messageModel.create({
                chat:messagePayload.chat,
                user:socket.user._id,
                content:response,
                role:"model"
            })

            socket.emit('ai-response',{
                content:response,
                chat:messagePayload.chat
            })
        })

    })
 }

 module.exports = initSocketServer;