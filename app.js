
const logger = require('./logger/my_logger')
const path = require('path')
const express = require('express')
const cors = require('cors');

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
            description: "My REST API skyrocket",
        },
        servers: [
            {
                url: "https://skyrocket.onrender.com/",
            },
        ],
    },
    apis: ["./routers/*.js"],
};

const specs = swaggerJsdoc(options);

const app = express()
const port = 3000
const users = {
    'admin': '12334' // שם המשתמש והסיסמה
};

app.use(basicAuth({
    users: users,
    unauthorizedResponse: (req) => {
        return 'Unauthorized';
    }
}));
app.use(
    "/swagger",
    swaggerUi.serve,
    swaggerUi.setup(specs)
);
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