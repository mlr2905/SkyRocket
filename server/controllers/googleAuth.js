const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const axios = require('axios');
require('dotenv').config();
const HandAuth = require('./HandleAuth');
const winston = require('winston');

// Create a logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

logger.info('Initializing Google authentication strategy');

// GoogleStrategy הגדרת
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://skyrocket.onrender.com/google"
},
    async function (accessToken, refreshToken, profile, cb) {
        logger.info(`Google authentication successful for user: ${profile.displayName}`);
        logger.debug(`Received profile data from Google for user ID: ${profile.id}`);
        
        return cb(null, { profile, accessToken });
    }
));

passport.serializeUser(function (user, cb) {
    logger.debug(`Serializing user: ${user.profile?.displayName || 'unknown'}`);
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    logger.debug(`Deserializing user: ${obj.profile?.displayName || 'unknown'}`);
    cb(null, obj);
});

// פונקציה לבדיקת משתמש והרשמה
const handleGoogleLogin = async (req, res) => {
    try {
        logger.info('Processing Google login');
        
        if (!req.user || !req.user.profile || !req.user.profile.emails || !req.user.profile.emails.length) {
            logger.error('Google profile data is missing or incomplete');
            return res.status(400).send('Missing Google profile data');
        }
        
        const { profile, accessToken } = req.user;
        const email = profile.emails[0].value;
        const password = profile.id;
        
        logger.info(`Attempting to login with Google for email: ${email}`);
        
        await HandAuth.processLogin(req, res, email, password, "google");
        
        logger.info(`Google login process completed for user: ${email}`);
    } catch (error) {
        logger.error(`Error in Google login process: ${error.message}`);
        // Determine if response has already been sent
        if (!res.headersSent) {
            res.status(500).send('Authentication error');
        }
    }
};

// Log application startup information
logger.info('Google authentication module initialized');

module.exports = { handleGoogleLogin };