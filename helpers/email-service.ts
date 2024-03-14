// emailSender.ts
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function sendVerificationEmail(email: string, token: string) {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'Email Verification',
    html: `<p>Please click <a href="${process.env.HOST}/api/users/verify/${token}">here</a> to verify your email.</p>`,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Verification email sent')
    return 'Verification email sent'
  } catch (error) {
    console.error('Error sending verification email:', error)
    return error
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'Reset Password',
    html: `<p>Please click <a href="${process.env.HOST}/api/users/forgot-password/${token}">here</a> reset your password.</p>`,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Password reset email sent')
    return 'Password reset email sent'
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return error
  }
}
