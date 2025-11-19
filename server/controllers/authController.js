const axios = require('axios');
const moment = require('moment-timezone');
const bl = require('../bl/bl_auth');

function redirectToLogin(req, res) {
    res.status(200).send(`
        <script>
            document.cookie = 'redirect=${req.originalUrl}; max-age=3600';
            window.location.href = '/login.html';
        </script>
    `);
}

exports.logout = async (req, res) => {
    const userId = req.user ? req.user.id : null; 
    
    try {
        await bl.processUserLogout(userId); 
    } catch (Error) {
        console.error('Logout BL error:', Error.message);
    }

    req.session.destroy(err => {
        if (err) {
            console.error('Session destruction failed:', err);
            return res.status(500).json({ success: false, message: 'Could not log out due to server session error.' });
        }
   
        res.clearCookie('connect.sid'); 
        res.clearCookie('sky');        
        
        return res.status(200).json({ success: true, message: 'Logged out successfully, cookies deleted.' });
    });
};

exports.rootHandler = async (req, res, next) => {
    try {
        const allowedPaths = ['/login.html', '/search.html', '/registration.html', '/git', '/google','/about','/customer-service'];
        if (allowedPaths.includes(req.path)) return next();

        const cookies = req.headers.cookie?.split(';').map(cookie => cookie.trim()) || [];
        const skyToken = cookies.find(cookie => cookie.startsWith('sky='));

        if (!skyToken) return redirectToLogin(req, res);

        const token = skyToken.split('=')[1];
        const response = await axios.post('https://jwt-node-mongodb.onrender.com/data', {
            token: token
        });

        if (response.data.valid) {
            const israelTime = moment.tz(Date.now(), 'Asia/Jerusalem');
            res.clearCookie('sky');
            res.cookie('sky', token, {
                httpOnly: true,
                sameSite: 'strict',
                expires: israelTime.add(1, 'days').toDate()
            });
            next();
        } else {
            redirectToLogin(req, res);
        }
    } catch (e) {
        console.error("Root handler error:", e.message);
        redirectToLogin(req, res);
    }
};