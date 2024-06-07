const express = require('express')
const axios = require('axios');
const moment = require('moment-timezone');
const logger = require('./logger/my_logger')
const path = require('path')
const cors = require('cors');
const body_parser = require('body-parser')
const all_tables_router = require('./routers/all_tables')
const role_users = require('./routers/role_users')
const role_airlines = require('./routers/role_airlines')
const role_admins = require('./routers/role_admins')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const app = express()
const ip2location = require("ip2location-nodejs");
const IP2Location = ip2location.IP2Location;
const google_auth = require('./OAuth/google_auth');
const github_auth = require('./OAuth/github_auth')
const facebook_auth = require('./OAuth/facebook_auth');
// const tiktok_auth = require('./OAuth/tiktok_auth');
const cookieParser = require('cookie-parser');
const { log } = require('winston');




const ip2locationDatabase = new IP2Location("./IP2LOCATION-LITE-DB11.BIN", "IP2LOCATION_SHARED_MEMORY");
logger.info('==== System start =======')
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.use(express.static(path.join('.', '/static/')))
app.listen(9000, () => {
    logger.info('==== Server started =======')
    console.log('Express server is running ....');
});



// פונקציה כללית לפענוח העוגיה ולהחזרת הנתונים
function getCookieData(req) {

    const cookies = req.headers.cookie.split(';').map(cookie => cookie.trim());
    const skyTokenCookie = cookies.find(cookie => cookie.startsWith('axeptio_cookies='));
    if (skyTokenCookie) {
        const skyTokenValue = skyTokenCookie.split('=')[1];
        const decodedSkyToken = decodeURIComponent(skyTokenValue);
        const parsedSkyToken = JSON.parse(decodedSkyToken);

        const githubStatus = parsedSkyToken.github;
        const googleStatus = parsedSkyToken.google;
        const facebookStatus = parsedSkyToken.facebook;
        return { 'gitHub': githubStatus, 'google': googleStatus, 'facebook': facebookStatus }

    }
    else{
        false
    }


}


// נתיב לבדיקה של Facebook
app.get('/facebook', (req, res) => {
    const cookieData = getCookieData(req);
console.log(!cookieData);
    if (!cookieData) {
        return res.status(400).send('Invalid or missing cookie axeptio_cookies');
    }
    console.log(cookieData.facebook === true);

    if (cookieData.facebook === true) {
        console.log("ok");
       return facebook_auth(app);
    }
    else {
        return res.status(400).send('The Facebook cookie is not approved by you');

    }

});

// נתיב לבדיקה של Github
app.get('/git', (req, res) => {
    const cookieData = getCookieData(req);

    if (!cookieData) {
        return res.status(400).send('Invalid or missing cookie axeptio_cookies');
    }

    if (cookieData.github === true) {
       return github_auth(app);
    }
    else {
        return res.status(400).send('The github cookie is not approved by you');

    }

});


// נתיב לבדיקה של Google
app.get('/google', (req, res) => {
    const cookieData = getCookieData(req);
console.log("google cookieData",cookieData);
    if (!cookieData) {
        return res.status(400).send('Invalid or missing cookie axeptio_cookies');
    }
console.log("git ookieData.google");
    if (cookieData.google === true) {
        console.log("google");
        return google_auth(app);
    }
    else {
        return res.status(400).send('The github google is not approved by you');

    }

});

// google_auth(app)
// github_auth(app)
// facebook_auth(app)
// tiktok_auth(app)






function getTimeZoneByIP(ip) {
    try {
        const ipInfo = ip2locationDatabase.get_all(ip);
        if (ipInfo) {
            return ipInfo.timezone;
        } else {
            return null; // לא נמצא מידע עבור ה-IP
        }
    } catch (error) {
        console.error('Error finding timezone by IP:', error);
        return null;
    }
}

// כתובת ה-IP של המשתמש



app.get('/SS', async (req, res, next) => {
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

