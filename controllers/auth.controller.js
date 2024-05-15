// import { Request, Response } from 'express'
const multer = require('multer')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const cloudinary = require('./../utils/cloudinary')

const { createUser, User, verifyUserEmail } = require('../models/user')
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require('../helpers/email.service')
const { generateJWToken, verifyJWToken } = require('../helpers/token.generator')

// configuring multer
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users')
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1]
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
  },
})

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else
    new AppError('This is not an image, please upload only image', 400), false
}

const upload = multer({ storage: multerStorage, fileFilter: multerFilter })

const uploadUserPhoto = upload.single('photo')

// functions that will filter out fields tha we dont want to update
const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}
const {
  getUserIdByEmail,
  deleteVerificationCode,
  VerificationCode,
} = require('../models/verification.code')
const generateSixDigitNumber = require('../helpers/pin.token.service')

async function registerUser(req, res) {
  const user = req.body
  try {
    const newUser = await createUser(user)
    if (newUser) {
      const { password, ...userWithoutPassword } = newUser.toObject()
      res.status(201).json(userWithoutPassword)
    } else {
      res.status(500).send('Error creating user')
    }
  } catch (error) {
    res.status(500).send(error)
  }
}

async function sendVerificationMail(req, res) {
  const { email } = req.body
  const code = generateSixDigitNumber()

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).send('User not found')
    }

    const verificationCode = new VerificationCode({
      user_id: user._id,
      code: code,
    })
    await verificationCode.save()

    const isSuccessful = await sendVerificationEmail(email, code)
    if (isSuccessful) {
      res.status(200).json('Verification email sent')
    } else {
      res.status(500).send('Error sending verification email')
    }
  } catch (error) {
    res.status(500).send(error.message)
  }
}

async function verifyEmailToken(req, res) {
  const { code } = req.body
  try {
    const verificationCode = await VerificationCode.findOne({ code })
    if (!verificationCode) {
      return res.status(404).send('Verification code not found')
    }

    const user = await User.findById(verificationCode.user_id)
    if (!user) {
      return res.status(404).send('User not found')
    }

    user.is_email_verified = true
    await user.save()

    await VerificationCode.deleteOne({ code })

    res.status(200).send('User verified successfully')
  } catch (error) {
    res.status(500).send(error.message)
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const { password: userPassword, ...userWithoutPassword } = user.toObject()

    const token = generateJWToken(user) //user.email
    res.status(200).json({ token, user: userWithoutPassword })
  } catch (error) {
    res.status(500).send(error.message)
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).send('User not found')
    }

    const code = generateSixDigitNumber()
    const verificationCode = new VerificationCode({
      user_id: user._id,
      code: code,
    })
    await verificationCode.save()

    const isSuccessful = await sendPasswordResetEmail(email, code)
    if (isSuccessful) {
      res
        .status(200)
        .json({ message: 'Password reset instructions sent to your email' })
    } else {
      res.status(500).send('Error sending password reset email')
    }
  } catch (error) {
    res.status(500).send(error.message)
  }
}

async function verifyCode(req, res) {
  const { code } = req.body
  try {
    const verificationCode = await VerificationCode.findOne({ code })
    if (!verificationCode) {
      return res.status(404).send('Verification code not found')
    }

    const user = await User.findById(verificationCode.user_id)
    if (!user) {
      return res.status(404).send('User not found')
    }

    res.status(200).send('User verified successfully')
  } catch (error) {
    res.status(500).send(error.message)
  }
}

async function changePassword(req, res) {
  const { email, newPassword, code } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).send('User not found')
    }

    const verificationCode = await VerificationCode.findOne({ code })
    if (
      !verificationCode ||
      verificationCode.user_id.toString() !== user._id.toString()
    ) {
      return res.status(404).send('Invalid or expired verification code')
    }

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()
    await VerificationCode.deleteOne({ code })

    res.status(200).json({ message: 'Password changed successfully' })
  } catch (error) {
    res.status(500).send(error.message)
  }
}

async function editUserProfile(req, res) {
  const token = req.headers.authorization?.split(' ')[1]
  const updatedData = req.body

  const decoded = verifyJWToken(token)
  const email = decoded.email

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).send('User not found')
    }

    Object.keys(updatedData).forEach((key) => {
      user[key] = updatedData[key]
    })
    await user.save()

    res.status(200).json({ message: 'User profile updated successfully' })
  } catch (error) {
    res.status(500).send(error.message)
  }
}

async function getUserProfile(req, res) {
  const token = req.headers.authorization?.split(' ')[1]
  const decoded = verifyJWToken(token)
  const email = decoded.email

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).send('User not found')
    }

    res.status(200).json(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
}

const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find()
  // sending response
  res.status(200).json({
    status: 'success',
    result: users.length,
    data: {
      users,
    },
  })
})

// updating current user data
const updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file)
  // 1) create error if user tries post password data
  if (req.body.password) {
    return next(
      new AppError(
        'this route is not for password update please use  updatePassword route',
        400,
      ),
    )
  }

  // 2)filtering out the unwanted field names that are not allowed to be updated by calling the filterObj function and storing it in filteredBody

  const filteredBody = filterObj(
    req.body,
    'first_name',
    'last_name',
    'phone_number',
    'company_name',
    'profession',
    'education',
    'professional_experience',
  )

  if (req.file) filteredBody.photo = req.file.filename
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  })
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  })
})
module.exports = {
  registerUser,
  sendVerificationMail,
  verifyEmailToken,
  loginUser,
  forgotPassword,
  verifyCode,
  changePassword,
  editUserProfile,
  getUserProfile,
  getAllUsers,
  uploadUserPhoto,
  updateMe,
}
