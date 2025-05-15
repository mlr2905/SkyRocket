// מודולים חיצוניים
const express = require('express');
const session = require('express-session');
const moment = require('moment-timezone');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const app = express(); 

// מודולים פנימיים
const logger = require('./logger/my_logger');
const allTablesRouter = require('./routes/all_tables');
const roleUsers = require('./routes/role_users');
const roleAdmins = require('./routes/role_admins');
const roleAirlines = require('./routes/role_airlines');
const googleRoutes = require('./routes/googleRoutes');
const githubRoutes = require('./routes/githubRoutes');
const authRoutes = require('./routes/authRoutes');

// הגדרות סביבתיות
require('dotenv').config();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.get('/', (req, res) => {
    const cookies = req.headers.cookie?.split(';').map(cookie => cookie.trim()) || [];
    const skyToken = cookies.find(cookie => cookie.startsWith('sky='));

    if (!skyToken) {
        return res.redirect('/login.html');
    }

    res.sendFile(path.join(__dirname, '..', 'client', 'public', 'index.html'));
});
app.use(express.static(path.join(__dirname, '..', 'client', 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// לוג התחלה
logger.info('==== System start =======');
const sessionController = require('./controllers/sessionController');

// יש לשים לפני כל ה-Routes (אבל אחרי static ו-session)
app.use(sessionController.rootHandler);

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
    apis: ["./swagger/*.js"],
};

const specs = swaggerJsdoc(options);
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(specs));

// Start Server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
