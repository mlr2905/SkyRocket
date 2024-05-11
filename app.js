const express = require('express')
const logger = require('./logger/my_logger')
const path = require('path')
const cors = require('cors');
const basicAuth = require('express-basic-auth');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const body_parser = require('body-parser')
const all_tables_router = require('./routers/all_tables')
const role_users = require('./routers/role_users')
const role_airlines = require('./routers/role_airlines')
const role_admins = require('./routers/role_admins')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const app = express()


logger.info('==== System start =======')
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.static(path.join('.', '/static/')))
app.listen(3000, () => {
    logger.info('==== Server started =======')
    console.log('Express server is running ....');
});

// const users = {'michael': 'Miki260623',"itay":"a123456" };

// const checkPassword = (username, password) => {return users[username] === password;};
// app.use(cors());
// app.use(basicAuth({
//     users: users,
//     challenge: true,
//     unauthorizedResponse: (req) => {return 'Unauthorized';},
//     authorizer: (username, password) => {return checkPassword(username, password); }}));



app.get('*', async (req, res, next) => {
    try {
       
        
        if (req.path === '/login.html') {
            return next()
        }
        const cookiesHeader = req.headers['set-cookie'];
        if (!cookiesHeader || cookiesHeader.length === 0) {
            return redirectToLogin(req, res);
        }
        
        // אם קיימים session cookies, תמשיך לבדוק את ה־'sky' cookie
        const cookies = cookiesHeader.map(cookie => cookie.split(';')[0].trim());
        const skyToken = cookies.find(cookie => cookie.startsWith('sky='));
        
        if (!skyToken) {
            return redirectToLogin(req, res);
        }
        
        const token = skyToken.split('=')[1];
        const response = await axios.get('https://jwt-node-mongodb.onrender.com/data', {
            data: { token }
        });
        const data = response.data;
        if (data.valid) {
            next();
        } else {
            return res.status(200).redirect(302, './login.html');
        }
    } catch (error) {
        return res.status(500).send('Internal Server Error');
    }
});

function redirectToLogin(req, res) {
    res.status(200).send(`
        <script>
            document.cookie = 'redirect=${req.originalUrl}; max-age=3600';
            window.location.href = 'https://skyrocket.onrender.com/login.html';
        </script>
    `);
}

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

logger.info('==== System stop =======')