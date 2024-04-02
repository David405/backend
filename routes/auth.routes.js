const express = require('express');
const {
  registerUser,
  sendVerificationMail,
  verifyEmailToken,
  loginUser,
  forgotPassword,
  verifyCode,
  changePassword,
  editUserProfile,
  getUserProfile,
} =  require('../controllers/auth.controller')
const verifyToken = require('../middleware/auth.middleware')

const authRouter = express()

authRouter.post('/register', registerUser)
authRouter.post('/send-verification-mail', sendVerificationMail)
authRouter.post('/verify', verifyEmailToken)
authRouter.post('/login', loginUser)
authRouter.post('/forgot-password', forgotPassword)
authRouter.post('/verify-code', verifyCode)
authRouter.post('/change-password', changePassword)
authRouter.patch('/edit-profile', verifyToken, editUserProfile)
authRouter.get('/get-user-profile', verifyToken, getUserProfile)

module.exports = authRouter
