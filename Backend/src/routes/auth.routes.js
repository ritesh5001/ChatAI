const express = require('express')
const authControllers = require("../controllers/auth.controller")
const { passport, generateToken } = require("../config/passport")
const authMiddleware = require("../middlewares/auth.middleware")
const router = express.Router();

// Cookie options for cross-origin
const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000
};

router.post("/register",authControllers.registerUser)
router.post("/login",authControllers.loginUser)
router.post("/logout",authControllers.logoutUser)

// Profile routes (protected)
router.get("/profile", authMiddleware, authControllers.getProfile)
router.put("/profile", authMiddleware, authControllers.updateProfile)

// Google OAuth routes
router.get("/google", passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get("/google/callback", 
    (req, res, next) => {
        passport.authenticate('google', { session: false }, (err, user, info) => {
            if (err) {
                console.error('[Google Callback] Error:', err.message);
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(err.message)}`);
            }
            if (!user) {
                console.error('[Google Callback] No user returned');
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
            }
            
            const token = generateToken(user);
            res.cookie("token", token, cookieOptions);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(frontendUrl);
        })(req, res, next);
    }
);

// GitHub OAuth routes
router.get("/github", passport.authenticate('github', { scope: ['user:email'] }));

router.get("/github/callback",
    (req, res, next) => {
        passport.authenticate('github', { session: false }, (err, user, info) => {
            if (err) {
                console.error('[GitHub Callback] Error:', err.message);
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(err.message)}`);
            }
            if (!user) {
                console.error('[GitHub Callback] No user returned');
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                return res.redirect(`${frontendUrl}/login?error=github_auth_failed`);
            }
            
            const token = generateToken(user);
            res.cookie("token", token, cookieOptions);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(frontendUrl);
        })(req, res, next);
    }
);
 
module.exports = router;