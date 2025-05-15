const express = require('express');
const logger = require('./logger/my_logger');
const setupMiddleware = require('./config/middleware');
const { setupAuthRoutes } = require('./routes/authRoutes');
const setupSwagger = require('./config/swaggerConfig');
const setupRoutes = require('./routes');
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
setupRoutes(app);

// התחלת השרת
app.listen(9000, () => {
    logger.info('Server started successfully on port 9000');
    logger.info('Express server is running at localhost:9000');
});

// הודעת סיכום על סיום טעינת השרת
logger.info('Server configuration completed successfully');