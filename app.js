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
const { handleGitHubLogin } = require('./auth/Git_Auth');
require('dotenv').config();

// הודעת לוג בעת טעינת מודולים
logger.info('==== System start =======')
logger.info('Loading modules and initializing server...')

// הגדרת session, passport
app.use(session({ secret: 'keyboard', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
logger.debug('Session and passport middleware initialized')

app.use(cors());
logger.debug('CORS middleware initialized')

app.listen(9000, () => {
    logger.info('Server started successfully on port 9000')
    logger.info('Express server is running at localhost:9000')
});

// ניתובים לאימות
app.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email', 'openid'] }),
    handleGoogleLogin
);
logger.debug('Google authentication route configured')

app.get('/git',
    passport.authenticate('github', { scope: ['read:user', 'user:email', 'user:read:email'] }),
    handleGitHubLogin  
);
logger.debug('GitHub authentication route configured')

// בדיקת אקטיבציה
app.get('/activation', async (req, res) => {
    try {
        logger.info('Checking user activation status')
        
        // בדיקה האם יש עוגיות בכלל
        if (!req.headers.cookie) {
            logger.warn('No cookies found in request')
            res.status(404).json('on')
            return
        }

        const cookies = req.headers.cookie.split(';').map(cookie => cookie.trim());
        const skyToken = cookies.find(cookie => cookie.startsWith('sky='));
        
        if (!skyToken) {
            logger.warn('Sky token not found in cookies')
            res.status(404).json('on')
        }
        else {
            logger.debug('Sky token found, user is activated')
            res.status(200).json('ok');
        }
    } catch (e) {
        logger.error('Error in activation check:', e)
        return res.status(500).json(e)
    }
});

// יציאה מהמערכת
app.get('/logout', async (req, res) => {
    try {
        logger.info('User logout requested')
        res.clearCookie('sky');
        logger.debug('Sky token cookie cleared')
        return redirectToLogin(req, res);
    } catch (e) {
        logger.error('Error during logout:', e)
        return res.status(500).json(e)
    }
});

// ניתוב ראשי עם בדיקת אימות
app.get('/', async (req, res, next) => {
    try {
        logger.debug(`Request path: ${req.path}`)

        // מעבר דרך במקרה של דפים שלא דורשים אימות
        if (req.path === '/login.html') {
            logger.debug('Login page requested, skipping authentication')
            return next()
        }

        if (req.path === '/search_form.html') {
            logger.debug('Search form requested, skipping authentication')
            return next()
        }
        
        if (req.path === '/registration.html') {
            logger.debug('Registration page requested, skipping authentication')
            return next()
        }
        
        // בדיקה האם יש עוגיות בכלל
        if (!req.headers.cookie) {
            logger.warn('No cookies found in request, redirecting to login')
            return redirectToLogin(req, res);
        }

        const cookies = req.headers.cookie.split(';').map(cookie => cookie.trim());
        const skyToken = cookies.find(cookie => cookie.startsWith('sky='));
        
        if (!skyToken) {
            logger.warn('Sky token not found, redirecting to login')
            return redirectToLogin(req, res);
        }
        
        const token = skyToken.split('=')[1];
        logger.debug('Validating token with authentication service')
        
        const response = await axios.get('https://jwt-node-mongodb.onrender.com/data', {
            data: { token }
        });
        
        const data = response.data;
        if (data.valid) {
            logger.info('Token is valid, refreshing cookie and continuing')

            // הגדרת השעה הנוכחית של השרת לשעה ישראלית
            const israelTime = moment.tz(Date.now(), 'Asia/Jerusalem');

            // השתמש בזמן השרת כזמן התחלה עבור העוגיה
            res.clearCookie('sky');
            res.cookie('sky', token, {
                httpOnly: true,
                sameSite: 'strict',
                expires: israelTime.add(3, 'hours').add(15, 'minutes').toDate()
            });
            logger.debug('Cookie refreshed with new expiration time')
            next();
        } else {
            logger.warn('Token validation failed, redirecting to login')
            return res.status(200).redirect(302, './login.html');
        }
    } catch (e) {
        logger.error('Authentication error:', e)
        return res.status(500).send({ "error": e, "message": 'Internal Server Error' });
    }
});

// פונקציה להפניה לדף התחברות
function redirectToLogin(req, res) {
    logger.debug(`Redirecting to login from ${req.originalUrl}`)
    res.status(200).send(`
        <script>
            document.cookie = 'redirect=${req.originalUrl}; max-age=3600';
            window.location.href = 'https://skyrocket.onrender.com/login.html';
        </script>
    `);
}

// הגדרת Swagger
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
logger.info('Swagger documentation initialized')

// הגדרת נתיבים ומידלוואר
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(specs));
app.use(body_parser.json())
app.use(express.static(path.join('.', '/static/')))
app.use('/all_tables', all_tables_router)
app.use('/role_admins', role_admins)
app.use('/role_airlines', role_airlines)
app.use('/role_users', role_users)
logger.debug('All routes and middleware configured')

// הודעת סיכום על סיום טעינת השרת
logger.info('Server configuration completed successfully')