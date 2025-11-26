const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const axios = require('axios');
require('dotenv').config();
const HandAuth = require('./HandleAuth');
const Log = require('../logger/logManager');

const FILE = 'githubAuth';

let a;

Log.info(FILE, 'init', null, 'Initializing GitHub authentication strategy');

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.MAIN_SITE}/git`,
    scope: ['read:user', 'user:email', 'user:read:email']
},
    function (accessToken, refreshToken, profile, done) {
        Log.info(FILE, 'GitHubStrategy', profile.id, `GitHub auth successful for: ${profile.username || profile.displayName}`);
        
        a = profile;
        
        return done(null, profile);
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

const handleGitHubLogin = async (req, res) => {
    const func = 'handleGitHubLogin';
    try {
        Log.info(FILE, func, null, 'Processing GitHub login');

        if (!a || !a.emails || !a.emails.length) {
            Log.error(FILE, func, null, 'GitHub profile data is missing or incomplete');
            return res.status(400).send('Missing GitHub profile data');
        }

        const email = a.emails[0].value;
        const password = a.nodeId;

        Log.info(FILE, func, email, 'Attempting to login with GitHub');

        await HandAuth.processLogin(req, res, email, password, "github");

        Log.info(FILE, func, email, 'GitHub login process completed');
    } catch (error) {
        Log.error(FILE, func, null, 'Error in GitHub login process', error);
        if (!res.headersSent) {
            res.status(500).send('Authentication error');
        }
    }
};

module.exports = { handleGitHubLogin };