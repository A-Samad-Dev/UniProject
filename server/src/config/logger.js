const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");

// Define log directory
const logDir = "logs";

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Console format (more readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} [${level}]: ${message}`;

    // Add metadata if exists
    if (Object.keys(meta).length > 0) {
      logMessage += `\nMetadata: ${JSON.stringify(meta, null, 2)}`;
    }

    // Add stack trace if exists
    if (stack) {
      logMessage += `\nStack: ${stack}`;
    }

    return logMessage;
  }),
);

// Create daily rotate file transport for all logs
const dailyRotateFileTransport = new DailyRotateFile({
  filename: path.join(logDir, "application-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "30d",
  format: logFormat,
});

// Create error log file transport
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logDir, "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxSize: "20m",
  maxFiles: "30d",
  format: logFormat,
});

// Create separate file for API access logs
const accessLogTransport = new DailyRotateFile({
  filename: path.join(logDir, "access-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "30d",
  format: logFormat,
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  transports: [
    dailyRotateFileTransport,
    errorFileTransport,
    new winston.transports.Console({
      format: consoleFormat,
      level: "debug",
    }),
  ],
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, "exceptions-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
    }),
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, "rejections-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
    }),
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

// Create access logger (for HTTP requests)
const accessLogger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [accessLogTransport],
});

// Database logging function
const logToDatabase = async (prisma, logData) => {
  try {
    // Optional: Create a Log model in Prisma if you want DB logs
    // await prisma.log.create({ data: logData });
  } catch (error) {
    logger.error("Failed to write log to database", { error: error.message });
  }
};

// Custom log methods
const logAction = (userId, action, details, req = null) => {
  const logEntry = {
    userId,
    action,
    details,
    ip: req?.ip || req?.socket?.remoteAddress,
    userAgent: req?.get("user-agent"),
    timestamp: new Date().toISOString(),
  };

  logger.info(`Action: ${action} by user ${userId}`, logEntry);

  // Also log to database if needed
  // logToDatabase(prisma, logEntry);
};

module.exports = {
  logger,
  accessLogger,
  logAction,
};
