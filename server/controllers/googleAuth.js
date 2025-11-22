const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const axios = require('axios');
require('dotenv').config();
const HandAuth = require('./HandleAuth');
const Log = require('../logger/logManager');

const FILE = 'googleAuth';

Log.info(FILE, 'init', null, 'Initializing Google authentication strategy');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://skyrocket.onrender.com/google"
},
    async function (accessToken, refreshToken, profile, cb) {
        Log.info(FILE, 'GoogleStrategy', profile.id, `Google auth successful for: ${profile.displayName}`);
        return cb(null, { profile, accessToken });
    }
));

passport.serializeUser(function (user, cb) {
    Log.debug(FILE, 'serializeUser', user.profile?.id, `Serializing: ${user.profile?.displayName}`);
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    Log.debug(FILE, 'deserializeUser', obj.profile?.id, `Deserializing: ${obj.profile?.displayName}`);
    cb(null, obj);
});

const handleGoogleLogin = async (req, res) => {
    const func = 'handleGoogleLogin';
    try {
        Log.info(FILE, func, null, 'Processing Google login');

        if (!req.user || !req.user.profile || !req.user.profile.emails || !req.user.profile.emails.length) {
            Log.error(FILE, func, null, 'Google profile data is missing or incomplete');
            return res.status(400).send('Missing Google profile data');
        }

        const { profile, accessToken } = req.user;
        const email = profile.emails[0].value;
        const password = profile.id;

        Log.info(FILE, func, email, 'Attempting to login with Google');

        await HandAuth.processLogin(req, res, email, password, "google");

        Log.info(FILE, func, email, 'Google login process completed');
    } catch (error) {
        Log.error(FILE, func, null, 'Error in Google login process', error);
        if (!res.headersSent) {
            res.status(500).send('Authentication error');
        }
    }
};

module.exports = { handleGoogleLogin };