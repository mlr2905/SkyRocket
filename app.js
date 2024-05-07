
const logger = require('./logger/my_logger')
const path = require('path')
const express = require('express')
const cors = require('cors');
const basicAuth = require('express-basic-auth');
const jwt = require('jsonwebtoken');



const body_parser = require('body-parser')
const all_tables_router = require('./routers/all_tables')
const role_users = require('./routers/role_users')
const role_airlines = require('./routers/role_airlines')
const role_admins = require('./routers/role_admins')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
logger.info('==== System start =======')
const app = express()
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.use(express.static(path.join('.', '/static/')))

const axios = require('axios');




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

const port = 3000
// // אימות בסיסי


// const users = {'michael': 'Miki260623',"itay":"a123456" };

// const checkPassword = (username, password) => {return users[username] === password;};
// app.use(cors());
// app.use(basicAuth({
//     users: users,
//     challenge: true,
//     unauthorizedResponse: (req) => {return 'Unauthorized';},
//     authorizer: (username, password) => {return checkPassword(username, password); }}));

app.get('*', async (req, res, next) => {
    const clientIP = req.ip;
    console.log('Client IP:', clientIP);
    next()
    // המשך עיבוד הבקשה כרגיל
});
app.get('*', async (req, res, next) => {
    if (!req.headers.cookie) {
      return  res.status(200).send(`
        <script>
            document.cookie = 'redirect=${req.originalUrl}; max-age=3600';
            window.location.href = 'https://skyrocket.onrender.com/login.html';
        </script>
    `);
    }

    // Split cookies and check for "sky" token
    const cookies = req.headers.cookie.split(';').map(cookie => cookie.trim());
    const skyToken = cookies.find(cookie => cookie.startsWith('sky='));

    if (!skyToken) {
        return res.status(200).redirect(302, 'https://skyrocket.onrender.com/login.html');
    } else {
        const cookies = req.headers.cookie.split(';').map(cookie => cookie.trim());
        const skyToken = cookies.find(cookie => cookie.startsWith('sky='));
        const token = skyToken.split('=')[1];
        console.log(token);

        try {
            const response = await axios.get('https://jwt-node-mongodb.onrender.com/data', {
                data: { token }
            });

            const data = response.data; // Assuming the server responds with JSON data

            if (data.valid) {
                // Token is valid, continue to the requested route
                next();
            } else {
                // Token is not valid, redirect to login page
                return res.status(200).redirect(302, './login.html');
            }
        } catch (error) {
            // console.error('Error validating token:', error);
            return res.status(500).send('Internal Server Error');
        }
    }
});
app.listen(3000, () => {
    logger.info('==== Server started =======')
    console.log('Express server is running ....');
});
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(specs));
app.use(body_parser.json())
app.use(express.static(path.join('.', '/static/')))


app.use('/all_tables', all_tables_router)
app.use('/role_admins', role_admins)
app.use('/role_airlines', role_airlines)
app.use('/role_users', role_users)



logger.info('==== System stop =======')