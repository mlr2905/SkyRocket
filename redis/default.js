const { createClient } = require('redis');

const redisClient = createClient({
    url: 'rediss://red-cp3i2bo21fec73b7s590:8Ddjtg2LFjxXSqkTNiqi1cm5RU6Y3FOX@oregon-redis.render.com:6379',
    tls: {} // הכרחי כדי לאפשר חיבור מאובטח
});

redisClient.on('error', (err) => {
    console.error('Could not connect to Redis:', err);
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.connect().catch(console.error);

module.exports = {redisClient};