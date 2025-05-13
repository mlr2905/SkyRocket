const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const axios = require('axios');
require('dotenv').config();
const HandAuth = require('./HandleAuth');


let a;

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://skyrocket.onrender.com/git",
    scope: ['read:user', 'user:email', 'user:read:email']
},
    function (accessToken, refreshToken, profile, done) {
        a = profile;
        
        return done(null, profile);
    }
));

// Serialize and deserialize user for session management
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

// פונקציה לטיפול באימות GitHub
const handleGitHubLogin = async (req, res) => {
    
    const email = a.emails[0].value;
    const password = a.nodeId;
    await HandAuth.processLogin(req, res,email,password,"github");

   
};

module.exports = { handleGitHubLogin };
