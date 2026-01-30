const express = require('express')
const authControllers = require("../controllers/auth.controller")
const { passport, generateToken } = require("../config/passport")
const router = express.Router();


router.post("/register",authControllers.registerUser)
router.post("/login",authControllers.loginUser)
router.post("/logout",authControllers.logoutUser)

// Google OAuth routes
router.get("/google", passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get("/google/callback", 
    passport.authenticate('google', { session: false, failureRedirect: '/login?error=google_auth_failed' }),
    (req, res) => {
        const token = generateToken(req.user);
        res.cookie("token", token);
        // Redirect to frontend
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(frontendUrl);
    }
);

// GitHub OAuth routes
router.get("/github", passport.authenticate('github', { scope: ['user:email'] }));

router.get("/github/callback",
    passport.authenticate('github', { session: false, failureRedirect: '/login?error=github_auth_failed' }),
    (req, res) => {
        const token = generateToken(req.user);
        res.cookie("token", token);
        // Redirect to frontend
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(frontendUrl);
    }
);
 
module.exports = router;