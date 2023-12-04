const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, prettyPrint } = format;
 
//const file_name = String((new Date()).toLocaleString()).replace('/','_').replace(':','_').replace(' ','_')
const logger = createLogger({
  level: 'debug',
  format: combine(
    label({ label: 'REST API App' }),
    timestamp(),
    prettyPrint()
  ),
  transports: [new transports.Console(),
    new transports.File({
        filename: `logs/log1.log` })
    ]
})

module.exports = logger