const axios = require('axios');
const logger = require('../logger/my_logger');

// זהו ה-Middleware שיגן על הנתיבים
const protect = async (req, res, next) => {
    logger.debug('Running protection middleware');
    let token;
    console.log("req.cookies.sky", req.cookies.sky);

    // 1. נסה לקרוא את העוגייה המאובטחת
    if (req.cookies && req.cookies.sky) {

        token = req.cookies.sky;
        console.log("token", token);

    }

    if (!token) {
        logger.warn('Access denied: No token provided');
        return res.status(401).json({ error: 'Not authorized, no token' });
    }

    try {
        const response = await axios.post('https://jwt-node-mongodb.onrender.com/data', {
            token: token // שלח את הטוקן ישירות כאובייקט
        });
        console.log("response.data", response.data);

        if (response.data.valid) {
            // 3. הוסף את פרטי המשתמש המפוענחים לבקשה
            //    הטוקן מכיל את ה-ID והמייל (לפי bl_role_users.js)
            req.user = response.data.user; // נניח שהאוביקט חוזר כ- { user: { id: 49, email: '...' } }
            console.log("req.user", req.user);

            logger.debug(`User authorized: ${req.user.email} (ID: ${req.user.id})`);
            next(); // המשך לבקר (Controller)
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