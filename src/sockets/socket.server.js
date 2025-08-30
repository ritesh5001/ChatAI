const { Server } = require("socket.io");
const cookie = require('cookie');
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

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
        console.log("New Socket connection", socket.id);
    })
 }

 module.exports = initSocketServer;