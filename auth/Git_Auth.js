const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const axios = require('axios');
require('dotenv').config();

let a;

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://skyrocket.onrender.com/git",
    scope: ['read:user', 'user:email', 'user:read:email']
},
    function (accessToken, refreshToken, profile, done) {
        console.log("profile", profile);
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
    console.log("dd");
    
    const email = a.emails[0].value;
    const password = a.nodeId;

    try {
        const Check = await axios.get(`https://skyrocket.onrender.com/role_users/users/search?email=${email}`);
        const data = Check.data;


        let loginResponse;
        if (data.e === "no" && data.status == true) {
            // בצע login
            if (data.authProvider !=="github") {
                res.status(403).send(`Access denied. Please log in using ${data.authProvider}." `);
            }
            loginResponse = await axios.post('https://skyrocket.onrender.com/role_users/login', {
                email: email,
                password: password,
                authProvider:'github'

            });
            const token = loginResponse.data.jwt;

            return res.cookie('sky', token, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000)
            }),
            res.redirect('https://skyrocket.onrender.com/search_form.html');
        } 
        else if (data.status == 404) {
            // בצע signup ואז login
            const signup = await axios.post('https://skyrocket.onrender.com/role_users/signup', {
                email: email,
                password: password,
                authProvider:'github'
            });
         
        }
    } catch (error) {
        console.error('Error during signup or login:', error);
        res.status(500).send('Error during signup or login');
    }
};

module.exports = { handleGitHubLogin };
