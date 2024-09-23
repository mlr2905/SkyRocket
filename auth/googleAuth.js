const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const axios = require('axios');
require('dotenv').config();


// הגדרת GoogleStrategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://skyrocket.onrender.com/google"
},
    async function (accessToken, refreshToken, profile, cb) {
        return cb(null, { profile, accessToken });
    }
));

// ניהול session
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
        console.log("ll", email);
        const Check = await axios.get(`https://skyrocket.onrender.com/role_users/users/search?email=${email}`);
        const data = Check.data;
        console.log("בדיקה", data);

        let loginResponse;
        if (data.e === "no" && data.status == true) {
            console.log("aaa");
            // אם המייל קיים, בצע login
            loginResponse = await axios.post('https://skyrocket.onrender.com/role_users/login', {
                email: email,
                password: password
            });
            const token = loginResponse.data.jwt;

            console.log("token", token);
            return res.cookie('sky', token, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3 שעות ו-15 דקות
            }),
            res.redirect('https://skyrocket.onrender.com/search_form.html');
        } else if (data.e === "no" && data.status == "ok") {
            console.log("aa");
            // אם המייל לא קיים, בצע signup ואז login
            const signup = await axios.post('https://skyrocket.onrender.com/role_users/signup', {
                email: email,
                password: password
            });
            console.log("נרשם בהצלחה", signup);

            if (signup.data.e === "no") {
                loginResponse = await axios.post('https://skyrocket.onrender.com/role_users/login', {
                    email: email,
                    password: password
                });
                const token = loginResponse.data.jwt;
                console.log("token", token);
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
        res.status(500).send('Error during signup or login');
    }
};

module.exports = {
    passport,
    handleGoogleLogin
};
