const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const axios = require('axios');
require('dotenv').config();

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
    let email = profile.emails[0].value;
    let password = profile.id;

    try {
        const Check = await axios.get(`https://skyrocket.onrender.com/role_users/users/search?email=${email}`);
        const data = Check.data;
        if (data.authProvider !=="google") {
            res.status(403).send(`Access denied. Please log in using google." `);
        }
        let loginResponse;
        if (data.e === "no" && data.status == true) {
            loginResponse = await axios.post('https://skyrocket.onrender.com/role_users/login', {
                email: email,
                password: password
            });
            const token = loginResponse.data.jwt;

            return res.cookie('sky', token, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000)
            }),
            res.redirect('https://skyrocket.onrender.com/search_form.html');
        } else if (data.e === "no" && data.status == "ok") {
            const signup = await axios.post('https://skyrocket.onrender.com/role_users/signup', {
                email: email,
                password: password,
                authProvider:'google'
            });

            if (signup.data.e === "no") {
                loginResponse = await axios.post('https://skyrocket.onrender.com/role_users/login', {
                    email: email,
                    password: password
                });
                const token = loginResponse.data.jwt;

                return res.cookie('sky', token, {
                    httpOnly: true,
                    sameSite: 'strict',
                    maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000)
                }),
                res.redirect('https://skyrocket.onrender.com/search_form.html');
            }
        }
    } catch (error) {
        console.error('Error during signup or login:', error);
        res.status(500).send('Error during signup or login',error);
    }
};

module.exports = { handleGoogleLogin };
