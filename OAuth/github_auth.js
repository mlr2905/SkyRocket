const express = require('express');
const app = express()
const axios = require('axios');
const GitHubStrategy = require('passport-github2').Strategy;
const passport = require('passport');

const GITHUB_CLIENT_ID = "Ov23lib9rBqGPaedxi4X"
const GITHUB_CLIENT_SECRET = "49425ccf70d4bd1cab7b4c40f8609b760022c8d0"
let a;

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "https://skyrocket.onrender.com/git",
    scope: ['read:user', 'user:email', 'user:read:email']
},
    function (accessToken, refreshToken, profile, done) {
        console.log("profile aaaaa", profile);
        return done(null, profile);
    }
));

// קבע את השימוש ב-Sessions
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

const github_auth = (app) => {
    app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
    app.use(passport.initialize());
    app.use(passport.session());

    // ניתוב לאימות באמצעות GitHub
    app.get('/git',
        passport.authenticate('github', { scope: ['read:user', 'user:email', 'user:read:email'] }),
        async function (req, res) {
            const email = req.user.emails[0].value;
            const password = req.user.nodeId;

            try {
                const Check = await axios.get(`https://skyrocket.onrender.com/role_users/users/search?email=${email}`);
                const data = Check.data;

                let loginResponse;
                if (data.e === "no") {
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

module.exports = github_auth;
