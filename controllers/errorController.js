const AppError = require('./../utils/appError')

const handleCastErrorDb = (err) => {
  const message = `Invalid ${err.path}:${err.value}`
  return new AppError(message, 400)
}
const handleDuplicateFieldsDb = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0]
  // console.log(value)  note tha value above is an array
  const message = `Duplicate field value:${value}. please use anther value`
  return new AppError(message, 400)
}

const handleValidationErrorDb = (err) => {
  const errors = Object.values(err.errors).map((el = el.message))
  const message = `Invalid input data:${errors.join('. ')}`
  return new AppError(message, 400)
}

const sendErrorDev = (err, res) => {
  // console.error(err.stack);

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  })
}

const sendErrorProd = (err, res) => {
  //operational error, send message below to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    })
    //programming or unknown error
  } else {
    //log the error to the console
    console.error('ERROR', err)
    //send genericmessage
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    })
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res)
  } else if (process.env.NODE_ENV === 'production') {
    //destructuring err arguement since it is not a good practice to overwrite an argurement of a function
    let error = { ...err }
    if (error.name === 'CastError') error = handleCastErrorDb(error)
    if (error.code === '1100') error = handleDuplicateFieldsDb(error)
    if (error.name === 'ValidationError') error = handleValidationErrorDb(error)

    sendErrorProd(error, res)
  }
}
