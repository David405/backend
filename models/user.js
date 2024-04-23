const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  is_employer: { type: Boolean, default: false },
  first_name: { type: String },
  last_name: { type: String },
  phone_number: { type: String },
  company_name: { type: String },
  role: { type: String, enum: ['Employer', 'Applicant'], default: 'Applicant' },
  profession: { type: String },
  is_email_verified: { type: Boolean, default: false },
  skills: [String],
  education: [Object],
  professional_experience: [Object],
})

const User = mongoose.model('User', userSchema)

async function createUser(user) {
  try {
    const hashedPassword = await bcrypt.hash(user.password, 10)

    const newUser = new User({
      email: user.email,
      password: hashedPassword,
      is_employer: user.is_employer,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      company_name: user.company_name,
      role: user.role,
      profession: user.profession,
      is_email_verified: user.is_email_verified,
    })

    const result = await newUser.save()
    return result
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

async function verifyUserEmail(email) {
  try {
    const user = await User.findOne({ email })

    if (!user) {
      throw new Error('User does not exist')
    } else {
      user.is_email_verified = true

      await user.save()
      return 'Email verified and updated successfully'
    }
  } catch (err) {
    console.error('Error verifying user email:', err)
    throw err
  }
}

module.exports = {
  createUser,
  verifyUserEmail,
  User,
}
