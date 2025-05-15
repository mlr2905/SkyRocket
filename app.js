const express = require('express')
const session = require('express-session');
const moment = require('moment-timezone');
const logger = require('./logger/my_logger')
const path = require('path')
const cors = require('cors');
const axios = require('axios');
const body_parser = require('body-parser')
const all_tables_router = require('./routes/all_tables')
const role_users = require('./routes/role_users')
const role_admins = require('./routes/role_admins')
const role_airlines = require('./routes/role_airlines')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const app = express()
const googleRoutes = require('./routes/googleRoutes');
const githubRoutes = require('./routes/githubRoutes');
const authRoutes = require('./routes/authRoutes');

const passport = require('passport');
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
const { handleGoogleLogin } = require('./controllers/googleAuth');  
const { handleGitHubLogin } = require('./controllers/githubAuth');  // ייבוא הפונקציה
require('dotenv').config();
app.use(session({ secret: 'keyboard', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());



logger.info('==== System start =======')
app.use(cors());
app.listen(9000, () => {
    
    console.log('localhost:9000');

    console.log('Express server is running ....');
});




app.use('/', authRoutes);
app.use('/', googleRoutes);
app.use('/', githubRoutes);

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
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(specs));
app.use(body_parser.json())
app.use(express.static(path.join('.', '/static/')))
app.use('/all_tables', all_tables_router)
app.use('/role_admins', role_admins)
app.use('/role_airlines', role_airlines)
app.use('/role_users', role_users)

