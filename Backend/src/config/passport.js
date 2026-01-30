const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('[Passport] Google OAuth strategy initialized');
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('[Google OAuth] Processing user:', profile.emails?.[0]?.value);
      
      // Check if user exists with this Google ID
      let user = await User.findOne({ where: { googleId: profile.id } });
      
      if (user) {
        console.log('[Google OAuth] Found user by googleId');
        return done(null, user);
      }
      
      // Check if user exists with same email
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      if (email) {
        user = await User.findOne({ where: { email } });
        if (user) {
          console.log('[Google OAuth] Found existing user by email, linking Google account');
          // Link Google account to existing user
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }
      }
      
      // Create new user
      console.log('[Google OAuth] Creating new user');
      const newEmail = email || `${profile.id}@google.oauth`;
      const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
      const lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';
      
      user = await User.create({
        email: newEmail,
        firstName,
        lastName,
        googleId: profile.id,
        password: null
      });
      
      return done(null, user);
    } catch (err) {
      console.error('[Google OAuth] Error:', err.message);
      return done(err, null);
    }
  }));
} else {
  console.log('[Passport] Google OAuth not configured - missing CLIENT_ID or CLIENT_SECRET');
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  console.log('[Passport] GitHub OAuth strategy initialized');
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
    scope: ['user:email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('[GitHub OAuth] Processing user:', profile.emails?.[0]?.value || profile.username);
      
      // Check if user exists with this GitHub ID
      let user = await User.findOne({ where: { githubId: profile.id.toString() } });
      
      if (user) {
        console.log('[GitHub OAuth] Found user by githubId');
        return done(null, user);
      }
      
      // Check if user exists with same email
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      if (email) {
        user = await User.findOne({ where: { email } });
        if (user) {
          console.log('[GitHub OAuth] Found existing user by email, linking GitHub account');
          // Link GitHub account to existing user
          user.githubId = profile.id.toString();
          await user.save();
          return done(null, user);
        }
      }
      
      // Create new user
      console.log('[GitHub OAuth] Creating new user');
      const newEmail = email || `${profile.id}@github.oauth`;
      const displayName = profile.displayName || profile.username || 'User';
      const nameParts = displayName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';
      
      user = await User.create({
        email: newEmail,
        firstName,
        lastName,
        githubId: profile.id.toString(),
        password: null
      });
      
      return done(null, user);
    } catch (err) {
      console.error('[GitHub OAuth] Error:', err.message);
      return done(err, null);
    }
  }));
} else {
  console.log('[Passport] GitHub OAuth not configured - missing CLIENT_ID or CLIENT_SECRET');
}

// Generate JWT token for user
const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET);
};

module.exports = { passport, generateToken };
