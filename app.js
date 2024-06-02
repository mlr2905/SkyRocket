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
const role_airlines = require('./routers/role_airlines')
const role_admins = require('./routers/role_admins')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const app = express()
const multer = require('multer');
const upload = multer(); // להגדרת multer עבור קבצים
const ip2location = require("ip2location-nodejs");
const IP2Location = ip2location.IP2Location;
const passport = require('passport');

const GoogleStrategy = require('passport-google-oauth20').Strategy;


// טען את מסד הנתונים של IP2Location
const ip2locationDatabase = new IP2Location("./IP2LOCATION-LITE-DB11.BIN", "IP2LOCATION_SHARED_MEMORY");


logger.info('==== System start =======')
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.static(path.join('.', '/static/')))
app.listen(9000, () => {
    logger.info('==== Server started =======')
    console.log('Express server is running ....');
});

const GOOGLE_CLIENT_ID = "806094545534-g0jmjp5j9v1uva73j4e42vche3umt2m0.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "https://skyrocket.onrender.com/google"
},


    async function (accessToken, refreshToken, profile, cb) {
        let email = profile.emails[0].value;
        let password = accessToken; // ניתן לשנות את זה בהתאם לצורך

        try {
            console.log("ll", email);
            const Check = await axios.get(`https://skyrocket.onrender.com/role_users/users/search?email=${email}`);
            const data = Check.data;

            let loginResponse;
            if (data.e === "no") {
                // אם המייל קיים, בצע login
                loginResponse = await axios.post('https://skyrocket.onrender.com/role_users/login', {
                    email: email,
                    password: password
                });
            } if (data.e === "yes") {
                // אם המייל לא קיים, בצע signup ואז login
                const signup = await axios.post('https://skyrocket.onrender.com/role_users/signup', {
                    email: email,
                    password: password
                });
                if (signup.e === "no") {
                    loginResponse = await axios.post('https://skyrocket.onrender.com/role_users/login', {
                        email: email,
                        password: password
                    });
                }

            }

            console.log("emailCheckResponse", loginResponse.data);
            return cb(null, profile);
        } catch (error) {
            console.error('Error during signup or login:', error);
            return cb(error, null);
        }
    }));


// מספר הצעדים עבור האימות הוא 2
// בשלב זה אנו מניחים שיש רק דרך אימות אחת
passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});


app.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email', 'openid'] }),
    async function (req, res) {
    }
);



function getTimeZoneByIP(ip) {
    try {
        const ipInfo = ip2locationDatabase.get_all(ip);
        if (ipInfo) {
            return ipInfo.timezone;
        } else {
            return null; // לא נמצא מידע עבור ה-IP
        }
    } catch (error) {
        console.error('Error finding timezone by IP:', error);
        return null;
    }
}

// כתובת ה-IP של המשתמש



app.get('/ss', async (req, res, next) => {
    try {


        if (req.path === '/login.html') {
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

