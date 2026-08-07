const winston = require('winston');
const path = require('path');
const fs = require('fs');

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
    )
  })
];

// Add file transports safely if directory is writeable
try {
  const logDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  transports.push(new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }));
  transports.push(new winston.transports.File({ filename: path.join(logDir, 'combined.log') }));
} catch (err) {
  console.warn('File logging disabled due to filesystem permissions:', err.message);
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports
});

module.exports = logger;
