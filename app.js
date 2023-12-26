
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

app.use('/api/message', message_router)
app.get("/api/message", (req, res) => {
  const message = {
    id: 1,
    text: "Hello, world!",
  };

  res.status(200).json(message);

  // Set the CORS header
  res.header("Access-Control-Allow-Origin", "*");
});
logger.info('==== System stop =======')