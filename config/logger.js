const winston = require('winston')
require('winston-daily-rotate-file')

const transport = new winston.transports.DailyRotateFile({
  filename: 'logs/padel-app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
})

transport.on('rotate', function (oldFilename, newFilename) {
  // This callback gets called when a new log file is created due to rotation
})

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console(), transport],
})

module.exports = logger
