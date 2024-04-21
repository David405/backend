class AppError extends Error {
  constructor(message, statusCode) {
    super(message)

    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = true //we use isOperational because this this error class will only handle operational error
    Error.captureStackTrace(this, this.constructor)
    //the captureStackTrace() function will tell us were the error occourd
  }
}

module.exports = AppError
