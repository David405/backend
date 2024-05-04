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
    sendErrorProd(err, res)
  }
}
