const axios = require('axios');
const Log = require('../logger/logManager');

const FILE = 'authMiddleware';

const protect = async (req, res, next) => {
    const func = 'protect';
    Log.debug(FILE, func, null, 'Running protection middleware');
    
    let token;

    if (req.cookies && req.cookies.sky) {
        token = req.cookies.sky;
    }

    if (!token) {
        Log.warn(FILE, func, null, 'Access denied: No token provided');
        return res.status(401).json({ error: 'Not authorized, no token' });
    }

    try {
        Log.debug(FILE, func, null, 'Verifying token with auth server...');

        const response = await axios.post(`${process.env.JWT_NODE_MONGODB}/data`,
            {
                token: token
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-internal-secret': process.env.INTERNAL_SERVICE_SECRET
                }
            }
        );

        if (response.data && response.data.valid) {
            req.user = response.data.user;
            
            // Log success with the identified user ID
            Log.info(FILE, func, req.user.id, `User authorized: ${req.user.email}`);
            
            next();
        } else {
            Log.warn(FILE, func, null, 'Access denied: Invalid token validation response');
            return res.status(401).json({ error: 'Not authorized, token failed' });
        }
    } catch (error) {
        Log.error(FILE, func, null, 'Token verification error', error);
        return res.status(401).json({ error: 'Not authorized, token verification error' });
    }
};

module.exports = { protect };