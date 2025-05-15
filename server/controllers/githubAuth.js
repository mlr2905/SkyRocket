const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
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
    new winston.transports.File({ filename: 'server/logs/GitAuthError.log', level: 'error' }),
    new winston.transports.File({ filename: 'server/logs/GitAuthcombined.log' })
  ]
});

// Store GitHub profile temporarily
let a;

logger.info('Initializing GitHub authentication strategy');

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://skyrocket.onrender.com/git",
    scope: ['read:user', 'user:email', 'user:read:email']
},
    function (accessToken, refreshToken, profile, done) {
        logger.info(`GitHub authentication successful for user: ${profile.username || profile.displayName}`);
        logger.debug(`Received profile data from GitHub for user ID: ${profile.id}`);
        
        // Store the profile for later use
        a = profile;
        
        return done(null, profile);
    }
));

// Serialize and deserialize user for session management
passport.serializeUser(function (user, done) {
    logger.debug(`Serializing user: ${user.username || user.displayName}`);
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    logger.debug(`Deserializing user: ${obj.username || obj.displayName}`);
    done(null, obj);
});

// פונקציה לטיפול באימות GitHub
const handleGitHubLogin = async (req, res) => {
    try {
        logger.info('Processing GitHub login');
        
        if (!a || !a.emails || !a.emails.length) {
            logger.error('GitHub profile data is missing or incomplete');
            return res.status(400).send('Missing GitHub profile data');
        }
        
        const email = a.emails[0].value;
        const password = a.nodeId;
        
        logger.info(`Attempting to login with GitHub for email: ${email}`);
        
        await HandAuth.processLogin(req, res, email, password, "github");
        
        logger.info(`GitHub login process completed for user: ${email}`);
    } catch (error) {
        logger.error(`Error in GitHub login process: ${error.message}`);
        // Determine if response has already been sent
        if (!res.headersSent) {
            res.status(500).send('Authentication error');
        }
    }
};

// Log application startup information
logger.info('GitHub authentication module initialized');

module.exports = { handleGitHubLogin };