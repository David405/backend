const mongoose = require('mongoose');

const { User } = require('./user')

const verificationCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);

async function getUserIdByEmail(email) {
  try {
    const user = await User.findOne({ email }, { _id: 1 });
    if (!user) {
      throw new Error('User not found');
    }
    return user._id;
  } catch (error) {
    console.error('Error getting user ID by email:', error);
    throw error;
  }
}

async function verifyCode(code) {
  try {
    const verification = await VerificationCode.findOne({ code }, { user_id: 1 });
    if (!verification) {
      return null;
    }

    const user = await User.findById(verification.user_id, { email: 1 });
    if (!user) {
      throw new Error('User not found');
    }

    return user.email;
  } catch (error) {
    console.error('Error verifying code:', error);
    throw error;
  }
}

async function deleteVerificationCode(
  email
) {
  try {
    const userId = await this.getUserIdByEmail(email);
    await VerificationCode.deleteMany({ user_id: userId });
  } catch (error) {
    console.error('Error deleting verification code:', error);
    throw error;
  }
}

module.exports = {
  getUserIdByEmail,
  verifyCode,
  deleteVerificationCode,
  VerificationCode
}