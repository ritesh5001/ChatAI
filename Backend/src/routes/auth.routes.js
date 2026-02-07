const express = require('express')
const authControllers = require("../controllers/auth.controller")
const { passport, generateToken } = require("../config/passport")
const { authUser } = require("../middlewares/auth.middleware")
const router = express.Router();

// Cookie options for cross-origin
const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         headers:
 *           Set-Cookie:
 *             description: JWT token cookie
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User Registered Successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: User already exists or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/register", authControllers.registerUser)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: JWT token cookie
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: user logged in successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/login", authControllers.loginUser)

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Clear authentication cookie and logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 */
router.post("/logout", authControllers.logoutUser)

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the authenticated user's profile information
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/profile", authUser, authControllers.getProfile)

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's first name and last name
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileUpdateRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put("/profile", authUser, authControllers.updateProfile)

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Google OAuth login
 *     description: Redirect to Google for authentication
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth consent page
 */
router.get("/google", (req, res, next) => {
    // Store platform info in state for mobile clients
    const state = req.query.platform === 'mobile' ? 'mobile' : 'web';
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: state
    })(req, res, next);
});

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     description: Handle Google OAuth callback and redirect to frontend
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *     responses:
 *       302:
 *         description: Redirect to frontend with authentication cookie set
 */
router.get("/google/callback",
    (req, res, next) => {
        passport.authenticate('google', { session: false }, (err, user, info) => {
            const isMobile = req.query.state === 'mobile';
            const mobileScheme = process.env.MOBILE_SCHEME || 'jarvisai';

            if (err) {
                console.error('[Google Callback] Error:', err.message);
                if (isMobile) {
                    return res.redirect(`${mobileScheme}://auth?error=${encodeURIComponent(err.message)}`);
                }
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(err.message)}`);
            }
            if (!user) {
                console.error('[Google Callback] No user returned');
                if (isMobile) {
                    return res.redirect(`${mobileScheme}://auth?error=google_auth_failed`);
                }
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
            }

            const token = generateToken(user);

            // For mobile: redirect to deep link with token
            if (isMobile) {
                const userData = encodeURIComponent(JSON.stringify({
                    _id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                }));
                return res.redirect(`${mobileScheme}://auth?token=${token}&user=${userData}`);
            }

            // For web: set cookie and redirect
            res.cookie("token", token, cookieOptions);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(frontendUrl);
        })(req, res, next);
    }
);

/**
 * @swagger
 * /api/auth/github:
 *   get:
 *     summary: GitHub OAuth login
 *     description: Redirect to GitHub for authentication
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to GitHub OAuth consent page
 */
router.get("/github", (req, res, next) => {
    // Store platform info in state for mobile clients
    const state = req.query.platform === 'mobile' ? 'mobile' : 'web';
    passport.authenticate('github', {
        scope: ['user:email'],
        state: state
    })(req, res, next);
});

/**
 * @swagger
 * /api/auth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     description: Handle GitHub OAuth callback and redirect to frontend
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Authorization code from GitHub
 *     responses:
 *       302:
 *         description: Redirect to frontend with authentication cookie set
 */
router.get("/github/callback",
    (req, res, next) => {
        passport.authenticate('github', { session: false }, (err, user, info) => {
            const isMobile = req.query.state === 'mobile';
            const mobileScheme = process.env.MOBILE_SCHEME || 'jarvisai';

            if (err) {
                console.error('[GitHub Callback] Error:', err.message);
                if (isMobile) {
                    return res.redirect(`${mobileScheme}://auth?error=${encodeURIComponent(err.message)}`);
                }
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(err.message)}`);
            }
            if (!user) {
                console.error('[GitHub Callback] No user returned');
                if (isMobile) {
                    return res.redirect(`${mobileScheme}://auth?error=github_auth_failed`);
                }
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                return res.redirect(`${frontendUrl}/login?error=github_auth_failed`);
            }

            const token = generateToken(user);

            // For mobile: redirect to deep link with token
            if (isMobile) {
                const userData = encodeURIComponent(JSON.stringify({
                    _id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                }));
                return res.redirect(`${mobileScheme}://auth?token=${token}&user=${userData}`);
            }

            // For web: set cookie and redirect
            res.cookie("token", token, cookieOptions);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(frontendUrl);
        })(req, res, next);
    }
);

module.exports = router;