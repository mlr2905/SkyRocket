const express = require('express');
const session = require('express-session');

const axios = require('axios');
const app = express()
const passport = require('passport');

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GOOGLE_CLIENT_ID = "806094545534-g0jmjp5j9v1uva73j4e42vche3umt2m0.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";



passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "https://skyrocket.onrender.com/google"
},
    async function (accessToken, refreshToken, profile, cb) {
        return cb(null, { profile, accessToken });
    }
));

// מספר הצעדים עבור האימות הוא 2
// בשלב זה אנו מניחים שיש רק דרך אימות אחת
passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

const google_auth = (app) => {
    app.use(require('express-session')({ secret: 'keyboard ', resave: true, saveUninitialized: true }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.get('*',
        passport.authenticate('google', { scope: ['profile', 'email', 'openid'] })
        ,
        async function (req, res) {
            const { profile, accessToken } = req.user;
            let email = profile.emails[0].value;
            let password = profile.id; // ניתן לשנות את זה בהתאם לצורך

            try {
                console.log("ll", email);
                const Check = await axios.get(`https://skyrocket.onrender.com/role_users/users/search?email=${email}`);
                const data = Check.data;

                let loginResponse;
                if (data.e === "no") {
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
                        maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3 שעות ו־2 דקות במילישניות
                    }),
                        res.redirect('https://skyrocket.onrender.com/swagger');
                    // הפנה לדף הבית או לכל דף אחר לאחר ההתחברות
                } else if (data.e === "noo") {
                    console.log("aa");
                    // אם המייל לא קיים, בצע signup ואז login
                    const signup = await axios.post('https://skyrocket.onrender.com/role_users/signup', {
                        email: email,
                        password: password
                    });
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
                            maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3 שעות ו־2 דקות במילישניות
                        }),
                            res.redirect('https://skyrocket.onrender.com/swagger');

                    }
                }

            } catch (error) {
                console.error('Error during signup or login:', error);
                res.status(500).send('Error during signup or login');
            }
        }
    );
};

module.exports = google_auth;