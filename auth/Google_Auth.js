const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const axios = require('axios');
require('dotenv').config();
const HandAuth = require('./HandleAuth');

// GoogleStrategy הגדרת
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://skyrocket.onrender.com/google"
},
    async function (accessToken, refreshToken, profile, cb) {
        return cb(null, { profile, accessToken });
    }
));

// Serialize and deserialize user for session management
passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

// פונקציה לבדיקת משתמש והרשמה
const handleGoogleLogin = async (req, res) => {
    const { profile, accessToken } = req.user;
    const email = profile.emails[0].value;
    const password = profile.id;
    
    await HandAuth.processLogin(req, res,email,password,"google");

   

};

module.exports = { handleGoogleLogin };
