const { Request, Response, NextFunction } = require('express')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.SECRET_KEY

module.exports = function verifyToken(
  req,
  res,
  next,
) {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    res.status(401).json({ message: 'Unauthorized: Missing token' })
    return
  }

  try {
    jwt.verify(token, JWT_SECRET)
    next()
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' })
  }
}
