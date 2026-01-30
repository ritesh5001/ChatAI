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
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists with this Google ID
      let user = await User.findOne({ where: { googleId: profile.id } });
      
      if (!user) {
        // Check if user exists with same email
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (email) {
          user = await User.findOne({ where: { email } });
          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            await user.save();
          }
        }
      }
      
      if (!user) {
        // Create new user
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@google.oauth`;
        const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
        const lastName = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';
        
        user = await User.create({
          email,
          firstName,
          lastName,
          googleId: profile.id,
          password: null // No password for OAuth users
        });
      }
      
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
    scope: ['user:email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists with this GitHub ID
      let user = await User.findOne({ where: { githubId: profile.id.toString() } });
      
      if (!user) {
        // Check if user exists with same email
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (email) {
          user = await User.findOne({ where: { email } });
          if (user) {
            // Link GitHub account to existing user
            user.githubId = profile.id.toString();
            await user.save();
          }
        }
      }
      
      if (!user) {
        // Create new user
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@github.oauth`;
        const displayName = profile.displayName || profile.username || 'User';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';
        
        user = await User.create({
          email,
          firstName,
          lastName,
          githubId: profile.id.toString(),
          password: null // No password for OAuth users
        });
      }
      
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));
}

// Generate JWT token for user
const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET);
};

module.exports = { passport, generateToken };
