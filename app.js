const express = require('express');
const logger = require('./logger/my_logger');
const setupMiddleware = require('./config/middleware');
const { setupAuthRoutes } = require('./routes/authRoutes');
const setupSwagger = require('./config/swaggerConfig');
const all_tables_router = require('./routes/all_tables')
const role_users = require('./routes/role_users')
const role_admins = require('./routes/role_admins')
const role_airlines = require('./routes/role_airlines')
require('dotenv').config();

// הודעת לוג בעת טעינת מודולים
logger.info('==== System start =======');
logger.info('Loading modules and initializing server...');

const app = express();

// הגדרת מידלוואר
setupMiddleware(app);

// הגדרת נתיבי אימות והאימות עצמו
setupAuthRoutes(app);

// הגדרת Swagger
setupSwagger(app);

// הגדרת נתיבים אחרים
app.use('/all_tables', all_tables_router)
app.use('/role_admins', role_admins)
app.use('/role_airlines', role_airlines)
app.use('/role_users', role_users)
// התחלת השרת
app.listen(9000, () => {
    logger.info('Server started successfully on port 9000');
    logger.info('Express server is running at localhost:9000');
});

// הודעת סיכום על סיום טעינת השרת
logger.info('Server configuration completed successfully');