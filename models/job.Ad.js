const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: [true, 'Job can not be empty'],
    },
    companyName: {
      type: String,
      required: [true, 'Job must belong to a company'],
    },
    location: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: {
        values: ['fulltime', 'remote'],
        message: 'type is either fulltime, remote',
      },
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    responsibility: {
      type: String,
      required: true,
    },
    requirement: [String],
    status: {
      type: String,
      default: 'active',
    },
    number_of_applicants: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// jobSchema.virtual('applicants', {
//   ref: 'Applicant', //the model we want to reference to
//   foreignField: 'job_ad_id', //the field in the applicant model where the Id of the jobAd that applicant applied was stored
//   localField: 'id', //the field in the jobAd model where the id of the job that applicant applied was stored
// })

const JobAd = mongoose.model('JobAd', jobSchema)
module.exports = JobAd
