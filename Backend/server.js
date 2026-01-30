require('dotenv').config();
const app = require('./src/app')
const { connectDb } = require('./src/db/db');
const initSocketServer = require("./src/sockets/socket.server");
const httpServer = require("http").createServer(app);

const PORT = process.env.PORT || 3000;
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || 'https://chatai-vlcv.onrender.com';

// Debug: Check if env vars are loaded
console.log("Environment check:");
console.log("- DATABASE_URL:", process.env.DATABASE_URL ? "✓ Set" : "✗ Missing");
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "✓ Set" : "✗ Missing");
console.log("- GROQ_API_KEY:", process.env.GROQ_API_KEY ? "✓ Set" : "✗ Missing");

connectDb();
initSocketServer(httpServer);

// Keep-alive: Ping server every 14 minutes to prevent Render free tier from sleeping
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes in milliseconds

function keepAlive() {
    fetch(`${RENDER_URL}/api/health`)
        .then(res => console.log(`[Keep-Alive] Ping successful: ${res.status}`))
        .catch(err => console.log(`[Keep-Alive] Ping failed: ${err.message}`));
}

httpServer.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    
    // Start keep-alive pings after server starts
    console.log(`[Keep-Alive] Starting self-ping every 14 minutes to ${RENDER_URL}`);
    setInterval(keepAlive, PING_INTERVAL);
    
    // Initial ping after 1 minute
    setTimeout(keepAlive, 60000);
})