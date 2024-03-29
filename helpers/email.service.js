// emailSender.ts
const nodemailer = require('nodemailer')
const dotenv = require('dotenv')

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

async function sendVerificationEmail(email, token) {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'Email Verification',
    html: `<p>This is your verification code: <b>${token}</b>. Verification code is valid for 30 minutes.</p>`,
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

async function sendPasswordResetEmail(email, token) {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'Reset Password',
    html: `<p>This is your verification code: <b>${token}</b>. Verification code is valid for 30 minutes.</p>`,
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

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
}
