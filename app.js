
const logger = require('./logger/my_logger')
const path = require('path')
const express = require('express')
const body_parser = require('body-parser')

const data_router = require('./routers/data_router')

logger.info('==== System start =======')

const app = express()
const port = 3000
app.use(body_parser.json())
app.use(express.static(path.join('.', '/static/'))) 

app.listen(3000, () => {
    logger.info('==== Server started =======')
    console.log('Express server is running ....');
})

app.use('/api/data', data_router)

logger.info('==== System stop =======')