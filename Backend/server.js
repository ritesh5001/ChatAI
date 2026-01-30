require('dotenv').config();
const app = require('./src/app')
const { connectDb } = require('./src/db/db');
const initSocketServer = require("./src/sockets/socket.server");
const httpServer = require("http").createServer(app);

const PORT = process.env.PORT || 3000;

// Debug: Check if env vars are loaded
console.log("Environment check:");
console.log("- DATABASE_URL:", process.env.DATABASE_URL ? "✓ Set" : "✗ Missing");
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "✓ Set" : "✗ Missing");
console.log("- GROQ_API_KEY:", process.env.GROQ_API_KEY ? "✓ Set" : "✗ Missing");

connectDb();
initSocketServer(httpServer);

httpServer.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})