const { promisify } = require('util') //builtin function for promifying token verification
const { Request, Response, NextFunction } = require('express')
const jwt = require('jsonwebtoken')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const { User } = require('./../models/user')
const JWT_SECRET = process.env.SECRET_KEY

// PROTECT MIDDLEWARE
exports.verifyToken = catchAsync(async (req, res, next) => {
  // 1)Getting token and check if it exist
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies.jwt) {
    token = req.cookie.jwt
  }
  if (!token) {
    // console.log(token);
    return next(
      new AppError('you are not logged please login to get access', 401),
    )
  }
  // 2)verify the token
  const decoded = await promisify(jwt.verify)(token, JWT_SECRET)
  // console.log({ decoded })
  // console.log(decoded['$__']._id)
  // 3)check if the user accessing the route still exist
  const currentUser = await User.findById(decoded['$__']._id)
  if (!currentUser) {
    return next(
      new AppError(
        'The User belonging to this token does not exist anylonger',
        401,
      ),
    )
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser
  next()
})
