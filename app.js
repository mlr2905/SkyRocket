const express = require('express')
const session = require('express-session');
const moment = require('moment-timezone');
const logger = require('./logger/my_logger')
const path = require('path')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const body_parser = require('body-parser')
const all_tables_router = require('./routers/all_tables')
const role_users = require('./routers/role_users')
const role_admins = require('./routers/role_admins')
const role_airlines = require('./routers/role_airlines')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const app = express()
const multer = require('multer');
const upload = multer(); // להגדרת multer עבור קבצים
const ip2location = require("ip2location-nodejs");
const IP2Location = ip2location.IP2Location;
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const { passport, handleGoogleLogin } = require('./auth/googleAuth');  // ייבוא הפונקציות
require('dotenv').config();




const qs = require('qs');
const ip2locationDatabase = new IP2Location("./IP2LOCATION-LITE-DB11.BIN", "IP2LOCATION_SHARED_MEMORY");


logger.info('==== System start =======')
app.use(cors());
app.listen(9000, () => {
    console.log('Express server is running ....');
});



app.use(session({ secret: 'keyboard', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email', 'openid'] }),
    handleGoogleLogin // קריאה לפונקציה מ- googleAuth.js
);



// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "https://skyrocket.onrender.com/google"
// },
//     async function (accessToken, refreshToken, profile, cb) {

//         return cb(null, { profile, accessToken });
//     }
// ));

// // מספר הצעדים עבור האימות הוא 2
// // בשלב זה אנו מניחים שיש רק דרך אימות אחת
// passport.serializeUser(function (user, cb) {
//     cb(null, user);
// });

// passport.deserializeUser(function (obj, cb) {
//     cb(null, obj);
// });

// app.use(require('express-session')({ secret: 'keyboard ', resave: true, saveUninitialized: true }));
// app.use(passport.initialize());
// app.use(passport.session());

// app.get('/google',
//     passport.authenticate('google', { scope: ['profile', 'email', 'openid'] })
//     ,
//     async function (req, res) {
//         const { profile, accessToken } = req.user;
//         let email = profile.emails[0].value;
//         let password = profile.id; // ניתן לשנות את זה בהתאם לצורך

//         try {
//             console.log("ll", email);
//             const Check = await axios.get(`https://skyrocket.onrender.com/role_users/users/search?email=${email}`);
//             const data = Check.data;
//             console.log("בדיקה", data);

//             let loginResponse;
//             if (data.e === "no" && data.status == true) {
//                 console.log("aaa");
//                 // אם המייל קיים, בצע login
//                 loginResponse = await axios.post('https://skyrocket.onrender.com/role_users/login', {
//                     email: email,
//                     password: password
//                 });
//                 const token = loginResponse.data.jwt;

//                 console.log("token", token);
//                 return res.cookie('sky', token, {
//                     httpOnly: true,
//                     sameSite: 'strict',
//                     maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3 שעות ו־2 דקות במילישניות
//                 }),
//                     res.redirect('https://skyrocket.onrender.com/search_form.html');
//                 // הפנה לדף הבית או לכל דף אחר לאחר ההתחברות
//             } else if (data.e === "no" && data.status == "ok") {
//                 console.log("aa");
//                 // אם המייל לא קיים, בצע signup ואז login
//                 const signup = await axios.post('https://skyrocket.onrender.com/role_users/signup', {
//                     email: email,
//                     password: password
//                 });
//                 console.log("נרשם בהצלחה",signup);
//                 console.log(email,password);
                
                
//                 if (signup.data.e === "no") {
//                     loginResponse = await axios.post('https://skyrocket.onrender.com/role_users/login', {
//                         email: email,
//                         password: password
//                     });

//                     const token = loginResponse.data.jwt;

//                     console.log("token", token);
//                     return res.cookie('sky', token, {
//                         httpOnly: true,
//                         sameSite: 'strict',
//                         maxAge: (3 * 60 * 60 * 1000) + (15 * 60 * 1000) // 3 שעות ו־2 דקות במילישניות
//                     }),
//                         res.redirect('https://skyrocket.onrender.com/search_form.html');

//                 }
//             }

//         } catch (error) {
//             console.error('Error during signup or login:', error);
//             res.status(500).send('Error during signup or login');
//         }
//     }
// );

let a;
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://skyrocket.onrender.com/git",
    scope: ['read:user', 'user:email', 'user:read:email']

},
    function (accessToken, refreshToken, profile, done) {
        console.log("profile aaaaa", profile);
        a = profile
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

// הגדר את האפליקציה של Express
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// ניתוב לאימות באמצעות GitHub
app.get('/git',
    passport.authenticate('github', { scope: ['read:user', 'user:email', 'user:read:email'] }),
    async function (req, res) {

        // הדפסת המידע מהפרופיל
        const email = a.emails[0].value;
        const password = a.nodeId

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
                    res.redirect('https://skyrocket.onrender.com/search_form.html');
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
                        res.redirect('https://skyrocket.onrender.com/search_form.html');

                }
            }

        } catch (error) {
            console.error('Error during signup or login:', error);
            res.status(500).send('Error during signup or login');
        }


    });

        passport.use('tiktok', new OAuth2Strategy({
            authorizationURL: 'https://www.tiktok.com/oauth/authorize',
            tokenURL: 'https://open-api.tiktok.com/oauth/token',
            clientID: process.env.TIKTOK_CLIENT_ID,
            clientSecret: process.env.TIKTOK_CLIENT_SECRET,
            callbackURL: "https://skyrocket.onrender.com/tiktok"
        }),
        
            function (accessToken, refreshToken, profile, done) {
                // קריאה ל-API של TikTok לקבלת פרטי המשתמש
                axios.get('https://api.tiktok.com/me', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
                    .then(response => {
                        const user = {
                            id: response.data.user.id,
                            email: response.data.user.email,
                            picture: response.data.user.avatar
                        };
                        console.log("user", user);
                        return done(null, user);
                    })
                    .catch(err => {
                        return done(err, false);
                    });
            }
        ));
        
        // סריאליזציה ודסיריאליזציה של המשתמש
        passport.serializeUser(function (user, done) {
            done(null, user);
        });
        
        passport.deserializeUser(function (obj, done) {
            done(null, obj);
        });
        
        // מסלול לאימות עם TikTok
        app.get('/tiktok',
            passport.authenticate('tiktok')
        );
        

app.get('/activation', async (req, res) => {
    try {

        const cookies = req.headers.cookie.split(';').map(cookie => cookie.trim());
        const skyToken = cookies.find(cookie => cookie.startsWith('sky='));
        if (!skyToken) {
            res.status(404).json('on')
            console.log('erre');
        }
        else {
            res.status(200).json('ok');
            console.log('ok');

        }
    } catch (e) {
        return res.status(500).json(e)
    }
});

app.get('/logout', async (req, res) => {
    try {

        res.clearCookie('sky');
        return redirectToLogin(req, res);


    } catch (e) {
        return res.status(500).json(e)
    }
});


app.get('/', async (req, res, next) => {
    try {


        if (req.path === '/login.html') {
            return next()
        }

        if (req.path === '/search_form.html') {
            return next()
        }
        if (req.path === '/registration.html') {
            return next()
        }
        const cookies = req.headers.cookie.split(';').map(cookie => cookie.trim());
        const skyToken = cookies.find(cookie => cookie.startsWith('sky='));
        if (!skyToken) {
            return redirectToLogin(req, res);
        }
        const token = skyToken.split('=')[1];
        const response = await axios.get('https://jwt-node-mongodb.onrender.com/data', {
            data: { token }
        });
        const data = response.data;
        if (data.valid) {

            // הגדרת השעה הנוכחית של השרת לשעה ישראלית
            const israelTime = moment.tz(Date.now(), 'Asia/Jerusalem');

            // השתמש בזמן השרת כזמן התחלה עבור העוגיה
            res.clearCookie('sky');
            res.cookie('sky', token, {
                httpOnly: true,
                sameSite: 'strict',
                expires: israelTime.add(3, 'hours').add(15, 'minutes').toDate()
            });
            next();
        } else {
            return res.status(200).redirect(302, './login.html');
        }
    } catch (e) {
        return res.status(500).send({ "error": e, "message": 'Internal Server Error' });
    }
});

function redirectToLogin(req, res) {
    res.status(200).send(`
        <script>
            document.cookie = 'redirect=${req.originalUrl}; max-age=3600';
            window.location.href = 'https://skyrocket.onrender.com/login.html';
        </script>
    `);
}

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SkyRocket API",
            version: "1.0.1",
            description: "My REST API SkyRocket",
        },
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
        },
        servers: [{ url: "https://skyrocket.onrender.com/" }],
    },
    apis: ["./swagger/*.js"],
};

const specs = swaggerJsdoc(options);
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(specs));
app.use(body_parser.json())
app.use(express.static(path.join('.', '/static/')))
app.use('/all_tables', all_tables_router)
app.use('/role_admins', role_admins)
app.use('/role_airlines', role_airlines)
app.use('/role_users', role_users)

