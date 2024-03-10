
const logger = require('./logger/my_logger')
const path = require('path')
const express = require('express')
const cors = require('cors');
const basicAuth = require('express-basic-auth');


const body_parser = require('body-parser')
const all_tables_router = require('./routers/all_tables')
const role_users = require('./routers/role_users')
const role_airlines = require('./routers/role_airlines')
const role_admins = require('./routers/role_admins')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
logger.info('==== System start =======')

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SkyRocket API",
            version: "1.0.1",
            description: "My REST API SkyRocket",  
        },
        servers: [
            {
                url: "https://skyrocket.onrender.com/",
            },
        ],
    },
    search: true,

    apis: ["./swagger/*.js"],
};

const specs = swaggerJsdoc(options);

const app = express()
const port = 3000
// // אימות בסיסי
// const users = {
//     'admin': '123456'
// };

// const checkPassword = (username, password) => {
//     return users[username] === password;
// };

// // הוספת אימות בסיסי לכל הנתיבים של Swagger UI
// app.use('/swagger', basicAuth({
//     users: users,
//     challenge: true,
//     unauthorizedResponse: (req) => {
//         return 'Unauthorized';
//     },
//     authorizer: (username, password) => {
//         return checkPassword(username, password);
//     }
// }));

const users = {
    'michael': 'Miki260623' // שם המשתמש והסיסמה
};

const checkPassword = (username, password) => {
    // בדיקת סיסמה נכונה
    return users[username] === password;
};

app.use(basicAuth({
    users: users,
    challenge: true,
    unauthorizedResponse: (req) => {  
        return 'Unauthorized';
    },
    authorizer: (username, password) => {
        // בדיקת אימות סיסמה
        return checkPassword(username, password);
    }
}));

app.use("/swagger",swaggerUi.serve,swaggerUi.setup(specs));

app.use(cors());
app.use(body_parser.json())
app.use(express.static(path.join('.', '/static/')))
app.listen(3000, () => {
    logger.info('==== Server started =======')
    console.log('Express server is running ....');
});
app.use(cors());
app.use('/all_tables', all_tables_router)
app.use('/role_admins', role_admins)
app.use('/role_airlines', role_airlines)
app.use('/role_users', role_users)


logger.info('==== System stop =======')