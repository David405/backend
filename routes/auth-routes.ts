import express from 'express'
import {
  registerUser,
  sendVerificationMail,
  verifyEmailToken,
  loginUser,
  forgotPassword,
  changePassword,
  editUserProfile,
} from '../controllers/auth-controller'
import { verifyToken } from '../middleware/auth-middleware'

const authRouter = express.Router()

authRouter.post('/register', registerUser)
authRouter.post('/send-verification-mail', sendVerificationMail)
authRouter.get('/verify/:token', verifyEmailToken)
authRouter.post('/login', loginUser)
authRouter.post('/forgot-password', forgotPassword)
authRouter.post('/change-password/:token', changePassword)
authRouter.post('/edit-profile', verifyToken, editUserProfile)

export default authRouter
