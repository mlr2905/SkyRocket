const axios = require('axios');
const logger = require('../logger/my_logger');

const protect = async (req, res, next) => {
    logger.debug('Running protection middleware');
    let token;
    console.log("req.cookies.sky", req.cookies.sky);

    if (req.cookies && req.cookies.sky) {

        token = req.cookies.sky;
        console.log("token", token);

    }

    if (!token) {
        logger.warn('Access denied: No token provided');
        return res.status(401).json({ error: 'Not authorized, no token' });
    }

    try {
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
        console.log("response.data", response.data);

        if (response.data.valid) {
            console.log("response.data.", response.data);
            req.user = response.data.user;
            console.log("req.user", req.user);

            logger.debug(`User authorized: ${req.user.email} (ID: ${req.user.id})`);
            next();
        } else {
            logger.warn('Access denied: Invalid token');
            return res.status(401).json({ error: 'Not authorized, token failed' });
        }
    } catch (error) {
        logger.error('Token verification error:', error);
        return res.status(401).json({ error: 'Not authorized, token verification error' });
    }
};

module.exports = { protect };