const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
/*Routes*/
const authRoutes = require('./routes/auth.routes.js')
const chatRoutes = require('./routes/chat.routes.js');

/* Using middlewares */
const app = express();

app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}));
app.use(express.json());
app.use(cookieParser());

/* Using Routes */
app.use('/api/auth',authRoutes);
app.use('/api/chat',chatRoutes);

module.exports = app;