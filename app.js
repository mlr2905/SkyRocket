const express = require('express')
const moment = require('moment-timezone');
const logger = require('./logger/my_logger')
const path = require('path')
const cors = require('cors');
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
const multer = require('multer');
const upload = multer(); // להגדרת multer עבור קבצים



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



    // כתובת ה-IP של המשתמש
    app.get('/your-endpoint', (req, res) => {
        // קבלת פרטים מהבקשה
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        const host = req.headers['host'];
        const referer = req.headers['referer'];
        const acceptLanguage = req.headers['accept-language'];
        const queryParameter = req.query.paramName;
        const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        const requestMethod = req.method;
        const cookies = req.cookies;
        const uploadedFile = req.file; // במקרה של קובץ יחיד
        const uploadedFiles = req.files; // במקרה של מספר קבצים
        const httpVersion = req.httpVersion;
        const rawHeaders = req.rawHeaders;
        const originalUrl = req.originalUrl;
        const baseUrl = req.baseUrl;
        const path = req.path;
        const hostname = req.hostname;
        const userCountry = req.headers['x-country'];
        const userCity = req.headers['x-city'];
        const userGPS = req.headers['x-gps'];
        const device = req.headers['user-agent'];
        const browserLanguage = req.headers['accept-language'];
        const browserVersion = req.headers['user-agent'];
        const deviceType = req.headers['user-agent'];
        const operatingSystem = req.headers['user-agent'];
      
        // כל הפרטים מאוחדים באובייקט
        const responseData = {
            "IP Address": ipAddress,
            "User Agent": userAgent,
            "Host": host,
            "Referer": referer,
            "Accept Language": acceptLanguage,
            "Query Parameter": queryParameter,
            "Full URL": fullUrl,
            "Request Method": requestMethod,
            "Cookies": cookies,
            "Uploaded File": uploadedFile, // במקרה של קובץ יחיד
            "Uploaded Files": uploadedFiles, // במקרה של מספר קבצים
            "HTTP Version": httpVersion,
            "Raw Headers": rawHeaders,
            "Original URL": originalUrl,
            "Base URL": baseUrl,
            "Path": path,
            "Hostname": hostname,
            "User Country": userCountry,
            "User City": userCity,
            "User GPS Coordinates": userGPS,
            "Device": device,
            "Browser Language": browserLanguage,
            "Browser Version": browserVersion,
            "Device Type": deviceType,
            "Operating System": operatingSystem
          };
        
      
        // שליחת התשובה ללקוח
        res.json(responseData);
      });
      
  

app.get('/sss', async (req, res, next) => {
    try {
        

        if (req.path === '/login.html') {
            return next()
        }
        const cookies = req.headers.cookie.split(';').map(cookie => cookie.trim());
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

            // הגדרת השעה הנוכחית של השרת לשעה ישראלית
            const israelTime = moment.tz(Date.now(), 'Asia/Jerusalem');

            // השתמש בזמן השרת כזמן התחלה עבור העוגיה
            res.clearCookie('sky');
            res.cookie('sky', token, {
                httpOnly: true,
                sameSite: 'strict',
                expires: israelTime.add(3, 'hours').add(15, 'minutes').toDate()
            });
            next();
        } else {
            return res.status(200).redirect(302, './login.html');
        }
    } catch (e) {
        return res.status(500).send({ "error": e, "message": 'Internal Server Error' });
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

