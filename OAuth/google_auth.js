

const GOOGLE_CLIENT_ID = "806094545534-g0jmjp5j9v1uva73j4e42vche3umt2m0.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

const express = require('express');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const axios = require('axios');
const app = express();
const passport = require('passport');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');


// הגדרת פרטי החיבור ל-Redis של Render
const redisClient = createClient({
    url: 'rediss://red-cp3i2bo21fec73b7s590:8Ddjtg2LFjxXSqkTNiqi1cm5RU6Y3FOX@oregon-redis.render.com:6379',
    tls: {} // הכרחי כדי לאפשר חיבור מאובטח
});

redisClient.on('error', (err) => {
    console.error('Could not connect to Redis:', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.connect().catch(console.error);

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "https://skyrocket.onrender.com/google"
},
    async function (accessToken, refreshToken, profile, cb) {
        return cb(null, { profile, accessToken });
    }
));

// סדרות ומשחזורים של המשתמש
passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

const auth = () => {
    app.use(session({
        store: new RedisStore({ client: redisClient }),
        secret: '7585474', // משתמש במפתח הסודי מהסביבה
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false } // set secure to true if using https
    }));
    
    app.use(passport.initialize());
    app.use(passport.session());

    app.get('*',
        passport.authenticate('google', { scope: ['profile', 'email', 'openid'] }),
        async function (req, res) {
            const { profile, accessToken } = req.user;
            let email = profile.emails[0].value;
            let password = profile.id; // ניתן לשנות את זה בהתאם לצורך

            try {
                console.log("Checking user with email:", email);
                const Check = await axios.get(`https://skyrocket.onrender.com/role_users/users/search?email=${email}`);
                const data = Check.data;

                let loginResponse;
                if (data.e === "no") {
                    console.log("User exists, logging in...");
                    loginResponse = await axios.post('https://skyrocket.onrender.com/role_users/login', {
                        email: email,
                        password: password
                    });
                    const token = loginResponse.data.jwt;

                    return res.cookie('sky', token, {
                        httpOnly: true,
                        sameSite: 'strict',
                        maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3 שעות ו-15 דקות במילישניות
                    }).redirect('https://skyrocket.onrender.com/swagger');
                } else if (data.e === "noo") {
                    console.log("User does not exist, signing up...");
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

                        return res.cookie('sky', token, {
                            httpOnly: true,
                            sameSite: 'strict',
                            maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3 שעות ו-15 דקות במילישניות
                        }).redirect('https://skyrocket.onrender.com/swagger');
                    }
                }

            } catch (error) {
                console.error('Error during signup or login:', error);
                res.status(500).send('Error during signup or login');
            }
        }
    );
};

module.exports = { auth };
