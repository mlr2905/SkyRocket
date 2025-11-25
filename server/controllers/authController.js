const axios = require('axios');
const moment = require('moment-timezone');
const bl = require('../bl/bl_auth');
const { get_by_id_user } = require('../bl/bl_role_users');
const Log = require('../logger/logManager');

const FILE = 'authController';

function redirectToLogin(req, res) {
    Log.info(FILE, 'redirectToLogin', null, `Redirecting to login from: ${req.originalUrl}`);
    res.status(200).send(`
        <script>
            document.cookie = 'redirect=${req.originalUrl}; max-age=3600';
            window.location.href = '/login.html';
        </script>
    `);
}

exports.logout = async (req, res) => {
    const func = 'logout';
    const userId = req.user ? req.user.id : null;
    Log.info(FILE, func, userId, 'Starting logout process');

    try {
        await bl.processUserLogout(userId);
        Log.info(FILE, func, userId, 'BL logout completed');
    } catch (error) {
        Log.error(FILE, func, userId, 'BL error during logout', error);
    }

    req.session.destroy(err => {
        if (err) {
            Log.error(FILE, func, userId, 'Session destruction failed', err);
            return res.status(500).json({ success: false, message: 'Could not log out due to server session error.' });
        }

        res.clearCookie('connect.sid');
        res.clearCookie('sky');

        Log.info(FILE, func, userId, 'Session destroyed and cookies cleared');
        return res.status(200).json({ success: true, message: 'Logged out successfully, cookies deleted.' });
    });
};

exports.rootHandler = async (req, res, next) => {
    const func = 'rootHandler';
    Log.info(FILE, func, null, `Incoming request: ${req.method} ${req.path}`);

    try {
       const allowedPaths = [
            '/index.html', 
            '/login.html', 
            '/registration.html', 
            '/git', 
            '/google', 
            '/about', 
            '/customer-service',
            '/favicon.ico'
        ];

        if (allowedPaths.includes(req.path) || 
            req.path.startsWith('/role_users') || 
            req.path.startsWith('/.well-known') || 
            req.path.startsWith('/static')) {
            
            if (req.path !== '/favicon.ico') {
                Log.info(FILE, func, null, `Path allowed without auth: ${req.path}`);
            }
            return next();
        }

        const cookies = req.headers.cookie?.split(';').map(cookie => cookie.trim()) || [];
        const skyToken = cookies.find(cookie => cookie.startsWith('sky='));

        if (!skyToken) {
            Log.info(FILE, func, null, 'No "sky" token found in cookies');
            return redirectToLogin(req, res);
        }

        const token = skyToken.split('=')[1];
        Log.debug(FILE, func, null, 'Verifying token with auth server...');

        const response = await axios.post('https://jwt-node-mongodb.onrender.com/data', {
            token: token
        });

        if (response.data.valid) {
            const id = response.data.user.id;
            const userData = await get_by_id_user(id);
            
            const userRole = userData ? userData.role_id : 'Unknown';
            
            Log.info(FILE, func, id, `Token valid. Role: ${userRole}`);

            const isRestrictedPath =
                req.path === '/database' ||
                req.path.startsWith('/swagger');
            
            if (isRestrictedPath && userRole != 3) {
                Log.warn(FILE, func, id, `BLOCKED: User attempted access to restricted path: ${req.path}`);
                return res.redirect('/');
            }

            const israelTime = moment.tz(Date.now(), 'Asia/Jerusalem');
            res.clearCookie('sky');
            res.cookie('sky', token, {
                httpOnly: true,
                sameSite: 'strict',
                expires: israelTime.add(1, 'days').toDate()
            });

            Log.info(FILE, func, id, `Access granted to ${req.path}. Cookie refreshed.`);
            next();
        } else {
            Log.warn(FILE, func, null, 'Token validation failed (invalid token)');
            redirectToLogin(req, res);
        }
    } catch (e) {
        Log.error(FILE, func, null, 'Critical error in rootHandler', e);
        redirectToLogin(req, res);
    }
};