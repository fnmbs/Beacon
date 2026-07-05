import logger from "../utils/logger.js";

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Async error wrapper - wrap async route handlers to catch errors
export const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};

// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? "warn" : "info";

    logger[logLevel]({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });
  });

  next();
};

// Global error handler middleware
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Log the error
  logger.error({
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    err.statusCode = 401;
    err.message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    err.statusCode = 401;
    err.message = "Token expired";
  }

  // Send response
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// 404 handler
export const notFoundHandler = (req, res) => {
  logger.warn({
    message: "Route not found",
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.path}`,
  });
};
