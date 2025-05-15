const { createClient } = require('redis');
const logger = require('./logger/my_logger');

logger.info('Initializing Redis client connection');
logger.debug('Setting up Redis client configuration');

const redisClient = createClient({
    url: 'rediss://red-cp3i2bo21fec73b7s590:8Ddjtg2LFjxXSqkTNiqi1cm5RU6Y3FOX@oregon-redis.render.com:6379',
    tls: {} 
});

// רישום לאירועי שגיאה
redisClient.on('error', (err) => {
    logger.error('Redis connection error:', err);
    logger.debug(`Redis error details: ${err.stack || JSON.stringify(err)}`);
});

// רישום לאירועי התחברות
redisClient.on('connect', () => {
    logger.info('Successfully connected to Redis server');
});

// רישום לאירועי התחברות מחדש
redisClient.on('reconnecting', () => {
    logger.warn('Redis connection lost, attempting to reconnect');
});

// רישום לאירועי ניתוק
redisClient.on('end', () => {
    logger.warn('Redis connection closed');
});

// רישום לאירועי התחברות מחדש מוצלחת
redisClient.on('ready', () => {
    logger.info('Redis client is ready and fully connected');
});

// התחברות לשרת Redis
logger.debug('Attempting to connect to Redis server');
redisClient.connect().catch((err) => {
    logger.error('Failed to connect to Redis server:', err);
});

module.exports = { redisClient };