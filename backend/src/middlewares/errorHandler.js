const logger = require('../utils/logger');

const errorHandler = (err, req, res, _next) => {
  let error = { ...err };
  error.message = err.message;

  logger.error(`${req.method} ${req.originalUrl} — ${err.message}`, { stack: err.stack });
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    error = { message, statusCode: 400 };
  }

  const statusCode = error.statusCode || 500;

  // In production, never leak internal error details for 5xx responses
  const isProduction = process.env.NODE_ENV === 'production';
  const message =
    isProduction && statusCode >= 500 ? 'Internal Server Error' : error.message || 'Server Error';

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
