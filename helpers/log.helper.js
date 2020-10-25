const { createLogger, format, transports } = require('winston')
const { getDate } = require('./time.helper')

const logger = createLogger({
    level: 'info',
    format: format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
    defaultMeta: { service: 'user-service' },
    transports: [new transports.File({ filename: 'logs/log.txt' })]
});

async function logError(error) {
    const now = getDate();
    logger.log('error', `${error.message}\nFile: ${error.fileName}\nLine: ${error.lineNumber}\nTime: ${now}`);
    console.log(now);
    console.log(error);
}

async function logInfo(message) {
    console.log(message)
    logger.log('info', message);
}

module.exports = {
    logInfo: logInfo,
    logError: logError
}