import express from 'express'
import { registerUser, sendVerificationMail, verifyEmailToken } from '../controllers/auth-controller'

const authRouter = express.Router()

authRouter.post('/register', registerUser)
authRouter.post('/send-verification-mail', sendVerificationMail)
authRouter.get('/verify/:token', verifyEmailToken)

export default authRouter
