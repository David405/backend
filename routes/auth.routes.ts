import express from 'express'
import {
  registerUser,
  sendVerificationMail,
  verifyEmailToken,
  loginUser,
  forgotPassword,
  changePassword,
  editUserProfile,
  getUserProfile,
} from '../controllers/auth.controller'
import { verifyToken } from '../middleware/auth.middleware'

const authRouter = express.Router()

authRouter.post('/register', registerUser)
authRouter.post('/send-verification-mail', sendVerificationMail)
authRouter.get('/verify', verifyEmailToken)
authRouter.post('/login', loginUser)
authRouter.post('/forgot-password', forgotPassword)
authRouter.post('/change-password', changePassword)
authRouter.post('/edit-profile', verifyToken, editUserProfile)
authRouter.get('/get-user-profile', verifyToken, getUserProfile)

export default authRouter
