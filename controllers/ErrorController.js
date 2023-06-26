const AppError = require('../utls/appError');

const errorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const errorForProd = (err, res) => {
  // Operational error  : send message to client
  if (err.operational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programing error : Don't send message to client
    res.status(500).json({
      status: 'Error',
      message: 'something went wrong'
    });
  }
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleExpiredTokenError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const handleDBCastError = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error!';
  if (process.env.NODE_ENV === 'development') {
    errorForDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') {
      error = handleDBCastError(error);
    }
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleExpiredTokenError();
    errorForProd(error, res);
  }
};
