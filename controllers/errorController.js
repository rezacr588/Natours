const AppError = require('../Tools/AppError');

const SendDevelopmentErrors = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stackTrace: err.stack,
  });
};
const SendProductionErrors = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(err.statusCode).json({
      status: 'error',
      message: 'Something went wrong!!!',
    });
  }
};
const handleValidationError = (err) => {
  return new AppError(err.message, 400);
};
const handleDuplicateError = (err) => {
  const message = `Duplicate field value ${err.keyValue.name} , pls use another values`;
  return new AppError(message, 400);
};
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleJWTError = () =>
  new AppError('Invalid Token . please log in again!', 401);
const handleExpiredError = () =>
  new AppError('Your token is expired . please log in again!', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    SendDevelopmentErrors(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.code === 11000) error = handleDuplicateError(error);
    if (error.name === 'CastError') error = handleCastError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleExpiredError();
    SendProductionErrors(error, res);
  }
};
