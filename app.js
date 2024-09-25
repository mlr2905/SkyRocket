const express = require('express')
const session = require('express-session');
const moment = require('moment-timezone');
const logger = require('./logger/my_logger')
const path = require('path')
const cors = require('cors');
const axios = require('axios');
const body_parser = require('body-parser')
const all_tables_router = require('./routers/all_tables')
const role_users = require('./routers/role_users')
const role_admins = require('./routers/role_admins')
const role_airlines = require('./routers/role_airlines')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const app = express()

const passport = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const { handleGoogleLogin } = require('./auth/Google_Auth');  
const { handleGitHubLogin } = require('./auth/Git_Auth');  // ייבוא הפונקציה
require('dotenv').config();
app.use(session({ secret: 'keyboard', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());



logger.info('==== System start =======')
app.use(cors());
app.listen(9000, () => {
    console.log('Express server is running ....');
});




app.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email', 'openid'] }),
    handleGoogleLogin  // קריאה לפונקציה שהובאה מ-googleAuth.js
);



// ניתוב לאימות GitHub
app.get('/git',
    passport.authenticate('github', { scope: ['read:user', 'user:email', 'user:read:email'] }),
    handleGitHubLogin  
);


        passport.use('tiktok', new OAuth2Strategy({
            authorizationURL: 'https://www.tiktok.com/oauth/authorize',
            tokenURL: 'https://open-api.tiktok.com/oauth/token',
            clientID: process.env.TIKTOK_CLIENT_ID,
            clientSecret: process.env.TIKTOK_CLIENT_SECRET,
            callbackURL: "https://skyrocket.onrender.com/tiktok"
        },
        
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

