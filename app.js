
const logger = require('./logger/my_logger')
const path = require('path')
const express = require('express')
const cors = require('cors');

const body_parser = require('body-parser')
const chats_router = require('./routers/chats/chats_router')
const chat1_router = require('./routers/chats/chat1_router')
const chat2_router = require('./routers/chats/chat2_router')
const chat3_router = require('./routers/chats/chat3_router')
const chat4_router = require('./routers/chats/chat4_router')
const chat5_router = require('./routers/chats/chat5_router')

const all_tables_router = require('./routers/flights/all_tables_router')
const role_users = require('./routers/flights/role_users')
const role_airlines = require('./routers/flights/role_airlines')
const role_admins = require('./routers/flights/role_admins')


logger.info('==== System start =======')

const app = express()
const port = 3000

app.use(cors());
app.use(body_parser.json())
app.use(express.static(path.join('.', '/static/')))
app.listen(3000, () => {
    logger.info('==== Server started =======')
    console.log('Express server is running ....');
});
app.use(cors());
app.use('/api/all_tables', all_tables_router)
app.use('/api/chats', chats_router)
app.use('/api/chat1', chat1_router)
app.use('/api/chat2', chat2_router)
app.use('/api/chat3', chat3_router)
app.use('/api/chat4', chat4_router)
app.use('/api/connected', chat5_router)
app.use('/role_admins', role_admins)
app.use('/role_airlines', role_airlines)
app.use('/role_users', role_users)


logger.info('==== System stop =======')