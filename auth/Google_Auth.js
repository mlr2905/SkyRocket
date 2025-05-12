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
    const email = profile.emails[0].value;
    const password = profile.id;
    console.log("yy",email,password);
    
   
    try {
        console.log("התחלה");
    
        const Check = await axios.get(`https://skyrocket.onrender.com/role_users/users/search?email=${email}`);
        const data = Check.data;
        console.log("data", data);
    
        let loginResponse;
        if (data.e === "no" && data.status === true) {
            if (data.authProvider !== "google") {
                return res.status(403).send(`Access denied. Please log in using ${data.authProvider}.`);
            }
    
            loginResponse = await axios.post('https://skyrocket.onrender.com/role_users/login', {
                email,
                password,
                authProvider: 'google'
            });
    
            const token = loginResponse.data.jwt;
    
            res.cookie('sky', token, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000)
            });
    
            return res.redirect('https://skyrocket.onrender.com/search_form.html');
        }
    
    } catch (error) {
        if (error.response?.status === 404) {
            console.log("הרשמה");
            await axios.post('https://skyrocket.onrender.com/role_users/signup', {
                email,
                password,
                authProvider: 'google'
            });
    
            // אחרי הרשמה - בצע login כמו קודם
            const loginResponse = await axios.post('https://skyrocket.onrender.com/role_users/login', {
                email,
                password,
                authProvider: 'google'
            });
    
            const token = loginResponse.data.jwt;
    
            res.cookie('sky', token, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000)
            });
    
            return res.redirect('https://skyrocket.onrender.com/search_form.html');
        }
    
        console.error('Error during signup or login:', error.message);
        return res.status(500).json({
            message: 'Error during signup or login',
            error: error.message
        });
    }

module.exports = { handleGoogleLogin };
