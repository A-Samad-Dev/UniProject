const morgan = require("morgan");
const { accessLogger, logger } = require("../src/config/logger");

// Morgan stream for access logs
const morganStream = {
  write: (message) => {
    accessLogger.info(message.trim());
  },
};

// Custom morgan format
const morganFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Morgan middleware for HTTP request logging
const httpLogger = morgan(morganFormat, { stream: morganStream });

// Custom middleware for detailed request/response logging
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  logger.debug(`Incoming Request: ${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.method === "POST" || req.method === "PUT" ? req.body : undefined,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;

    // Log response
    logger.debug(
      `Response Sent: ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`,
      {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      },
    );

    originalSend.call(this, data);
  };

  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.error(`Error in ${req.method} ${req.url}: ${err.message}`, {
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack,
    userId: req.user?.id,
    ip: req.ip,
  });

  next(err);
};

// User action logger middleware
const logUserAction = (action) => {
  return (req, res, next) => {
    const originalJson = res.json;

    res.json = function (data) {
      // Only log if request was successful (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const { logger } = require("../config/logger");
        logger.info(`User Action: ${action}`, {
          userId: req.user.id,
          userRole: req.user.role,
          action: action,
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          data: data,
          ip: req.ip,
        });
      }

      originalJson.call(this, data);
    };

    next();
  };
};

module.exports = {
  httpLogger,
  requestLogger,
  errorLogger,
  logUserAction,
};
