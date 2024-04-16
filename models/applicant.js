const mongoose = require('mongoose')

const applicantSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please tell us your name'],
    },
    email: {
      type: String,
      required: [true, 'please provide your email'],
      unique: true,
      lowercase: true,
    },
    gender: {
      type: String,
      enum: {
        values: ['male', 'female'],
        message: 'gender is either male, female',
      },
      required: true,
    },
    application_stage: {
      type: String,
      enum: {
        values: [
          'Genesis',
          'Exedus',
          'Leviticus',
          'Numbers',
          'Deuteronomy',
          'Joshua',
        ],
        message:
          'application_step is either Genesis,Exedus,Leviticus,Numbers,Deuteronomy,Joshua',
      },
      default: Genesis,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    linkedin_profile: String,
    position: String,
    resume: String,
    portfolio: String,
    job_ad_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'jobAd',
      required: true,
    },

    applied_on: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

const Applicant = mongoose.model('Applicant', applicantSchema)
module.exports = Applicant
