
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

app.use('/api/chats', chats_router)
app.use('/api/chat1', chat1_router)
app.use('/api/chat2', chat2_router)
app.use('/api/chat3', chat3_router)
app.use('/api/chat4', chat4_router)
app.use('/api/connected', chat5_router)

logger.info('==== System stop =======')