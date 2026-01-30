const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
/*Routes*/
const authRoutes = require('./routes/auth.routes.js')
const chatRoutes = require('./routes/chat.routes.js');

/* Using middlewares */
const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'https://chat-ai-backend-mz5ltgm88-smaranapp.vercel.app',
    'https://jarvisai.riteshgiri.dev',
    /\.vercel\.app$/,
    /\.riteshgiri\.dev$/
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc)
        if (!origin) return callback(null, true);
        
        const isAllowed = allowedOrigins.some(allowed => {
            if (allowed instanceof RegExp) return allowed.test(origin);
            return allowed === origin;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

/* Using Routes */
app.use('/api/auth',authRoutes);
app.use('/api/chat',chatRoutes);

app.get("*name", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;