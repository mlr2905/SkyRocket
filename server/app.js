// External modules
const express = require('express');
const cookieParser = require('cookie-parser'); 
const session = require('express-session');
const moment = require('moment-timezone');
const path = require('path');
const cors = require('cors');
const passport = require('passport');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express(); 

// Internal modules
const logger = require('./logger/my_logger');
const allTablesRouter = require('./routes/all_tables');
const roleUsers = require('./routes/role_users');
const roleAdmins = require('./routes/role_admins');
const roleAirlines = require('./routes/role_airlines');
const googleRoutes = require('./routes/googleRoutes');
const githubRoutes = require('./routes/githubRoutes');
const authRoutes = require('./routes/authRoutes');

//Environmental settings
require('dotenv').config();

// Middlewares Setup
app.use(cors());
app.use(cookieParser());


app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

const clientPath = path.join(__dirname, '..', 'client', 'public');
app.use(express.static(clientPath));

app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',// Recommended: true in production
        httpOnly: true 
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Start log
logger.info('==== System start =======');

// Routes
app.use('/', authRoutes);
app.use('/', googleRoutes);
app.use('/', githubRoutes);
app.use('/all_tables', allTablesRouter);
app.use('/role_admins', roleAdmins);
app.use('/role_airlines', roleAirlines);
app.use('/role_users', roleUsers);

// Swagger
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SkyRocket API",
            version: "1.0.1",
            description: "My REST API SkyRocket",
        },
        servers: [{ url: "https://skyrocket.onrender.com/" }],
    },
    apis: ["./server/swagger/*.js"],
};

const specs = swaggerJsdoc(options);
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(specs));

// Fallback to SPA (any request not handled in the API will return the React/HTML)
app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Serving client from: ${clientPath}`);
});