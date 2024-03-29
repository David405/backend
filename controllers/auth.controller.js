// import { Request, Response } from 'express'
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const { createUser, User, verifyUserEmail } = require('../models/user')
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require('../helpers/email.service')
const { generateJWToken, verifyJWToken } = require('../helpers/token.generator')
const {
  getUserIdByEmail,
  verifyCode,
  deleteVerificationCode,
  VerificationCode
} = require('../models/verification.code')
const generateSixDigitNumber = require('../helpers/pin.token.service')

 async function registerUser(req, res) {
  const user = req.body
  try {
    const newUser = await createUser(user)
    if (newUser) {
      res.status(201).json(newUser)
    } else {
      res.status(500).send('Error creating user')
    }
  } catch (error) {
    res.status(500).send(error)
  }
}

 async function sendVerificationMail(
  req,
  res,
) {
  const { email } = req.body;
  const code = generateSixDigitNumber();
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }

    const verificationCode = new VerificationCode({
      user_id: user._id,
      code: code
    });
    await verificationCode.save();
    
    const isSuccessful = await sendVerificationEmail(email, code);
    if (isSuccessful) {
      res.status(200).json('Verification email sent');
    } else {
      res.status(500).send('Error sending verification email');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
}

 async function verifyEmailToken(
  req,
  res,
) {
  const { code } = req.body;
  try {
    const verificationCode = await VerificationCode.findOne({ code });
    if (!verificationCode) {
      return res.status(404).send('Verification code not found');
    }

    const user = await User.findById(verificationCode.user_id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    user.is_email_verified = true;
    await user.save();

    await VerificationCode.deleteOne({ code });

    res.status(200).send('User verified successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
}

 async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateJWToken(user.email);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
}

 async function forgotPassword(
  req,
  res,
) {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }

    const code = generateSixDigitNumber();
    const verificationCode = new VerificationCode({
      user_id: user._id,
      code: code
    });
    await verificationCode.save();
    
    const isSuccessful = await sendPasswordResetEmail(email, code);
    if (isSuccessful) {
      res.status(200).json({ message: 'Password reset instructions sent to your email' });
    } else {
      res.status(500).send('Error sending password reset email');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
}

 async function changePassword(
  req,
  res,
) {
  const { email, newPassword, code } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }

    const verificationCode = await VerificationCode.findOne({ code });
    if (!verificationCode || verificationCode.user_id.toString() !== user._id.toString()) {
      return res.status(404).send('Invalid or expired verification code');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await VerificationCode.deleteOne({ code });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).send(error.message);
  }
}

 async function editUserProfile(
  req,
  res,
) {
  const token = req.headers.authorization?.split(' ')[1];
  const updatedData = req.body;
  
  const decoded = verifyJWToken(token);
  const email = decoded.email;
  
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }

    Object.keys(updatedData).forEach(key => {
      user[key] = updatedData[key];
    });
    await user.save();

    res.status(200).json({ message: 'User profile updated successfully' });
  } catch (error) {
    res.status(500).send(error.message);
  }
}

 async function getUserProfile(
  req,
  res,
) {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = verifyJWToken(token);
  const email = decoded.email;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

module.exports = {
  registerUser,
  sendVerificationMail,
  verifyEmailToken,
  loginUser,
  forgotPassword,
  changePassword,
  editUserProfile,
  getUserProfile
}
