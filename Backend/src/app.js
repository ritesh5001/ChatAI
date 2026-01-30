const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { passport } = require('./config/passport');
/*Routes*/
const authRoutes = require('./routes/auth.routes.js')
const chatRoutes = require('./routes/chat.routes.js');

/* Using middlewares */
const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'https://jarvis-ai-one-mocha.vercel.app',
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
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, '../public')));

/* Swagger API Documentation */
const swaggerOptions = {
    customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #6366f1 }
        .swagger-ui .scheme-container { background: #1a1a2e; padding: 15px; border-radius: 8px; }
    `,
    customSiteTitle: "Jarvis AI API Documentation",
    customfavIcon: "/favicon.ico"
};
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

// Swagger JSON endpoint
app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

/* Using Routes */
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Check if the server is running and healthy
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-01-31T12:00:00.000Z
 */
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get("*name", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;