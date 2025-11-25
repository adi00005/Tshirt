// src/utils/logger.js
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(path.dirname(__dirname), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Log file paths
const errorLogFile = path.join(logsDir, 'error.log');
const combinedLogFile = path.join(logsDir, 'combined.log');

// Ensure log files exist
[errorLogFile, combinedLogFile].forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '');
  }
});

// Log levels
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
  SUCCESS: 'success'
};

// Log colors
const COLORS = {
  [LOG_LEVELS.ERROR]: 'red',
  [LOG_LEVELS.WARN]: 'yellow',
  [LOG_LEVELS.INFO]: 'blue',
  [LOG_LEVELS.DEBUG]: 'magenta',
  [LOG_LEVELS.SUCCESS]: 'green'
};

// Log emojis
const EMOJIS = {
  [LOG_LEVELS.ERROR]: '❌',
  [LOG_LEVELS.WARN]: '⚠️',
  [LOG_LEVELS.INFO]: 'ℹ️',
  [LOG_LEVELS.DEBUG]: '🐛',
  [LOG_LEVELS.SUCCESS]: '✅'
};

/**
 * Log a message to console and file
 * @param {string} level - Log level (error, warn, info, debug, success)
 * @param {string} message - Message to log
 * @param {Object} [data] - Additional data to log
 */
const log = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  const coloredMessage = chalk`{${COLORS[level] || 'white'} ${EMOJIS[level] || ''} [${level.toUpperCase()}] ${message}}`;
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  // Log to console with colors
  console.log(coloredMessage);
  
  // Log data if provided
  if (Object.keys(data).length > 0) {
    console.log(chalk`{dim ${JSON.stringify(data, null, 2)}}`);
  }
  
  // Log to combined file
  fs.appendFileSync(combinedLogFile, `${logMessage}\n`);
  
  // Log errors to error file
  if (level === LOG_LEVELS.ERROR) {
    fs.appendFileSync(errorLogFile, `${logMessage}\n`);
    if (Object.keys(data).length > 0) {
      fs.appendFileSync(errorLogFile, `${JSON.stringify(data, null, 2)}\n`);
    }
  }
};

// Helper methods for different log levels
const logError = (message, error = {}) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    ...error
  };
  log(LOG_LEVELS.ERROR, message, errorData);
};

const logWarning = (message, data) => log(LOG_LEVELS.WARN, message, data);
const logInfo = (message, data) => log(LOG_LEVELS.INFO, message, data);
const logDebug = (message, data) => log(LOG_LEVELS.DEBUG, message, data);
const logSuccess = (message, data) => log(LOG_LEVELS.SUCCESS, message, data);

// Request logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id || 'anonymous'
    };
    
    if (res.statusCode >= 400) {
      logError('Request Error', logData);
    } else {
      logInfo('Request', logData);
    }
  });
  
  next();
};

export {
  logError,
  logWarning,
  logInfo,
  logDebug,
  logSuccess,
  requestLogger,
  LOG_LEVELS
};
