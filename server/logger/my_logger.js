const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const moment = require('moment-timezone');

const logger = createLogger({
  level: 'debug',
  format: combine(
    label({ label: 'REST API App' }),
    timestamp({
      format: () => {
        return moment().tz('Asia/Jerusalem').format('YYYY-MM-DD HH:mm:ss');
      }
    }),
    printf(info => {
      return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: 'server/logs/log1.log'
    })
  ]
});

module.exports = logger