var winston = require('winston');
const config = require('config');
const env = process.env.NODE_ENV;
const logDir = config.log_dir || "./logs";
const fs = require('fs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
 }

const now = new Date();
var logger = new(winston.Logger)({
transports: [

    new winston.transports.File({
        name: 'error-file',
        filename: './logs/DappBridge-masterTask_exceptions.log',
        level: 'error',
        json: false
    }),

    new(require('winston-daily-rotate-file'))({
        filename: `${logDir}/DappBridge-masterTask_process.log`,
        timestamp: now,
        //datePattern: 'dd-MM-yyyy',
        //prepend: true,
        json: false,
        level: env === 'development' ? 'verbose' : 'info'
    })
],
exitOnError: false
});

module.exports = logger;
module.exports.stream = {
  write: function(message, encoding) {
    logger.info(message);
    console.log('message=', message);
  }
};