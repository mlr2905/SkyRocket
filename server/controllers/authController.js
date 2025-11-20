const axios = require('axios');
const moment = require('moment-timezone');
const bl = require('../bl/bl_auth');
const {get_by_id_user} = require('../bl/bl_role_users');


function redirectToLogin(req, res) {
    console.log(`[Auth] Redirecting to login from: ${req.originalUrl}`);
    res.status(200).send(`
        <script>
            document.cookie = 'redirect=${req.originalUrl}; max-age=3600';
            window.location.href = '/login.html';
        </script>
    `);
}

exports.logout = async (req, res) => {
    const userId = req.user ? req.user.id : null; 
    console.log(`[Logout] Starting logout process for user ID: ${userId || 'Unknown'}`);
    
    try {
        await bl.processUserLogout(userId); 
        console.log(`[Logout] Business logic logout completed for user ID: ${userId}`);
    } catch (Error) {
        console.error(`[Logout] BL error for user ID ${userId}:`, Error.message);
    }

    req.session.destroy(err => {
        if (err) {
            console.error('[Logout] Session destruction failed:', err);
            return res.status(500).json({ success: false, message: 'Could not log out due to server session error.' });
        }
   
        res.clearCookie('connect.sid'); 
        res.clearCookie('sky');        
        
        console.log('[Logout] Session destroyed and cookies cleared successfully.');
        return res.status(200).json({ success: true, message: 'Logged out successfully, cookies deleted.' });
    });
};

exports.rootHandler = async (req, res, next) => {
    console.log(`[RootHandler] Incoming request: ${req.method} ${req.path}`);

    try {
        const allowedPaths = ['/index.html', '/login.html', '/search.html', '/registration.html', '/git', '/google', '/about', '/customer-service'];
        
        if (allowedPaths.includes(req.path)) {
            console.log(`[RootHandler] Path allowed without auth: ${req.path}`);
            return next();
        }

        const cookies = req.headers.cookie?.split(';').map(cookie => cookie.trim()) || [];
        const skyToken = cookies.find(cookie => cookie.startsWith('sky='));

        if (!skyToken) {
            console.log('[RootHandler] No "sky" token found in cookies.');
            return redirectToLogin(req, res);
        }

        const token = skyToken.split('=')[1];
        console.log('[RootHandler] Verifying token with auth server...');

        const response = await axios.post('https://jwt-node-mongodb.onrender.com/data', {
            token: token
        });

        if (response.data.valid) {
            const id =response.data.user.id;
            const userData = await get_by_id_user(id)
            console.log("userData",userData);

            const userRole = userData.role_id;
            console.log("userRole",userRole);
            
            
            console.log(`[RootHandler] Token valid. User ID: ${userData.id}, Role: ${userRole}`);

            const isRestrictedPath = 
                req.path === '/database' || 
                req.path.startsWith('/swagger');
            if (isRestrictedPath && userRole != 3) {
                console.warn(`[Auth Security] BLOCKED: User (Role ${userRole}) attempted access to restricted path: ${req.path}`);
                return res.redirect('/'); 
            }

            const israelTime = moment.tz(Date.now(), 'Asia/Jerusalem');
            res.clearCookie('sky');
            res.cookie('sky', token, {
                httpOnly: true,
                sameSite: 'strict',
                expires: israelTime.add(1, 'days').toDate()
            });
            
            console.log(`[RootHandler] Access granted to ${req.path}. Cookie refreshed.`);
            next();
        } else {
            console.log('[RootHandler] Token validation failed (invalid token).');
            redirectToLogin(req, res);
        }
    } catch (e) {
        console.error("[RootHandler] Critical error:", e.message);
        redirectToLogin(req, res);
    }
};