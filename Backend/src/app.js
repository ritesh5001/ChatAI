const express = require('express');
const cookieParser = require('cookie-parser')

/*Routes*/
const authRoutes = require('./routes/auth.routes.js')
const chatRoutes = require('./routes/chat.routes.js');

/* Using middlewares */
const app = express();
app.use(express.json());
app.use(cookieParser());

/* Using Routes */
app.use('/api/auth',authRoutes);
app.use('/api/chat',chatRoutes);

module.exports = app;