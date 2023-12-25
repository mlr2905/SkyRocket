
const logger = require('./logger/my_logger')
const path = require('path')
const express = require('express')
const body_parser = require('body-parser')

const message_router = require('./routers/message_router')

logger.info('==== System start =======')

const app = express()
const port = 3000
app.use(body_parser.json())
app.use(express.static(path.join('.', '/static/'))) 

app.listen(3000, () => {
    logger.info('==== Server started =======')
    console.log('Express server is running ....');
})
async function funk1(){
    await del.create_table_if_not_exist();
}

funk1()

app.use('/api/messages', message_router)

logger.info('==== System stop =======')