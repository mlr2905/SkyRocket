const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const logger = require('./logger/my_logger');

function setupSwagger(app) {
    // הגדרת Swagger
    const options = {
        definition: {
            openapi: "3.0.0",
            info: {
                title: "SkyRocket API",
                version: "1.0.1",
                description: "My REST API SkyRocket",
            },
            cors: {
                origin: '*',
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
            },
            servers: [{ url: "https://skyrocket.onrender.com/" }],
        },
        apis: ["./swagger/*.js"],
    };

    const specs = swaggerJsdoc(options);
    logger.info('Swagger documentation initialized');

    // הגדרת נתיבים למסמכי Swagger
    app.use("/swagger", swaggerUi.serve, swaggerUi.setup(specs));
}

module.exports = setupSwagger;