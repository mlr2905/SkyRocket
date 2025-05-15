const passport = require('passport');
const axios = require('axios');
const moment = require('moment-timezone');
const logger = require('../logger/my_logger');
const { handleGoogleLogin } = require('./auth/Google_Auth');
const { handleGitHubLogin } = require('./auth/Git_Auth');

function setupAuthRoutes(app) {
    // ניתובים לאימות
    app.get('/google',
        passport.authenticate('google', { scope: ['profile', 'email', 'openid'] }),
        handleGoogleLogin
    );
    logger.debug('Google authentication route configured');

    app.get('/git',
        passport.authenticate('github', { scope: ['read:user', 'user:email', 'user:read:email'] }),
        handleGitHubLogin
    );
    logger.debug('GitHub authentication route configured');

    // בדיקת אקטיבציה
    app.get('/activation', async (req, res) => {
        try {
            logger.info('Checking user activation status');
            
            // בדיקה האם יש עוגיות בכלל
            if (!req.headers.cookie) {
                logger.warn('No cookies found in request');
                res.status(404).json('on');
                return;
            }

            const cookies = req.headers.cookie.split(';').map(cookie => cookie.trim());
            const skyToken = cookies.find(cookie => cookie.startsWith('sky='));
            
            if (!skyToken) {
                logger.warn('Sky token not found in cookies');
                res.status(404).json('on');
            }
            else {
                logger.debug('Sky token found, user is activated');
                res.status(200).json('ok');
            }
        } catch (e) {
            logger.error('Error in activation check:', e);
            return res.status(500).json(e);
        }
    });

    // יציאה מהמערכת
    app.get('/logout', async (req, res) => {
        try {
            logger.info('User logout requested');
            res.clearCookie('sky');
            logger.debug('Sky token cookie cleared');
            return redirectToLogin(req, res);
        } catch (e) {
            logger.error('Error during logout:', e);
            return res.status(500).json(e);
        }
    });

    // הוספת מידלוואר לבדיקת אימות
    app.use(authenticationMiddleware);
}

// פונקציה להפניה לדף התחברות
function redirectToLogin(req, res) {
    logger.debug(`Redirecting to login from ${req.originalUrl}`);
    res.status(200).send(`
        <script>
            document.cookie = 'redirect=${req.originalUrl}; max-age=3600';
            window.location.href = 'https://skyrocket.onrender.com/login.html';
        </script>
    `);
}

// מידלוואר לבדיקת אימות
async function authenticationMiddleware(req, res, next) {
    try {
        logger.debug(`Request path: ${req.path}`);

        // מעבר דרך במקרה של דפים שלא דורשים אימות
        if (req.path === '/login.html' || 
            req.path === '/search_form.html' || 
            req.path === '/registration.html') {
            logger.debug('Public page requested, skipping authentication');
            return next();
        }
        
        // בדיקה האם יש עוגיות בכלל
        if (!req.headers.cookie) {
            logger.warn('No cookies found in request, redirecting to login');
            return redirectToLogin(req, res);
        }

        const cookies = req.headers.cookie.split(';').map(cookie => cookie.trim());
        const skyToken = cookies.find(cookie => cookie.startsWith('sky='));
        
        if (!skyToken) {
            logger.warn('Sky token not found, redirecting to login');
            return redirectToLogin(req, res);
        }
        
        const token = skyToken.split('=')[1];
        logger.debug('Validating token with authentication service');
        
        const response = await axios.get('https://jwt-node-mongodb.onrender.com/data', {
            data: { token }
        });
        
        const data = response.data;
        if (data.valid) {
            logger.info('Token is valid, refreshing cookie and continuing');

            // הגדרת השעה הנוכחית של השרת לשעה ישראלית
            const israelTime = moment.tz(Date.now(), 'Asia/Jerusalem');

            // השתמש בזמן השרת כזמן התחלה עבור העוגיה
            res.clearCookie('sky');
            res.cookie('sky', token, {
                httpOnly: true,
                sameSite: 'strict',
                expires: israelTime.add(3, 'hours').add(15, 'minutes').toDate()
            });
            logger.debug('Cookie refreshed with new expiration time');
            next();
        } else {
            logger.warn('Token validation failed, redirecting to login');
            return res.status(200).redirect(302, './login.html');
        }
    } catch (e) {
        logger.error('Authentication error:', e);
        return res.status(500).send({ "error": e, "message": 'Internal Server Error' });
    }
}

module.exports = { setupAuthRoutes, redirectToLogin };