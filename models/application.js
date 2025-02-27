const mongoose = require('mongoose')
const JobAd = require('./job.Ad')

const applicantSchema = new mongoose.Schema(
  {
    gender: {
      type: String,
      enum: {
        values: ['male', 'female'],
        message: 'gender is either male, female',
      },
      required: true,
    },
    applicationStage: {
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
      default: 'Genesis',
      // required: true,
    },
    applicationStatus: {
      type: String,
      enum: ['pending', 'successful', 'rejected'],
      default: 'pending',
    },

    location: {
      type: String,
      required: true,
    },
    linkedinProfile: {
      type: String,
      required: true,
    },
    resume: {
      type: String,
      required: true,
    },
    portfolio: {
      type: String,
      required: true,
    },
    coverLatter: {
      type: String,
      required: true,
    },
    isCancelled: {
      type: Boolean,
      default: false,
      // select: false,
    },
    jobAdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobAd',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      type: Number,
      default: 0
    },
    appliedOn: {
      type: Date,
      default: Date.now(),
    },

  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)
applicantSchema.pre(/^find/, function (next) {
  this.find({ isCancelled: { $ne: true } })
  next()
})
// creating indexes so that a USER can only apply for a job ones
applicantSchema.index({ jobAdId: 1, user: 1 }, { unique: true })

// //populating the guides fiels whenever we query document
applicantSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'jobAdId',
    select: '-__v -createdAt -description -responsibility',
  }).populate({
    path: 'user',
    select: '-__v -password',
  })
  next()
})

// static function (because we want to calculate the value a field in our schema) and this function is available in the model
// we want to calculate the number of applicants of a particular jobAd
applicantSchema.statics.calcNumberOfApplicants = async function (jobId) {
  // console.log(jobId);
  const stats = await this.aggregate([
    //selecting the jobs that belong or matched to the jobId that was passed as an arguement
    {
      $match: { jobAdId: jobId },
    },
    //calculating the statistics
    {
      $group: {
        _id: '$jobAdId',
        nApplicants: { $sum: 1 },
      },
    },
  ])
  // console.log(stats);

  // persisting the results (nApplicants  ) to the required field in the jobAd model
  if (stats.length > 0) {
    await JobAd.findByIdAndUpdate(jobId, {
      numberOfApplications: stats[0].nApplicants,
    })
  } else {
    await JobAd.findByIdAndUpdate(jobId, {
      numberOfApplications: 0,
    })
  }
}

// calling the calcNumberOfApplicants static function
// we want this function to be called whenever a document is saved therefore we will use a middleware
applicantSchema.post('save', function () {
  this.constructor.calcNumberOfApplicants(this.jobAdId)
})

// for deleting and updating applicant
applicantSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne() // we use findeOne() to get the job  that we want to update or delete before it is being stored in the data base and store it in r variable
  // console.log(this.r);
  next()
})

// at this point we have gotten the document(job) we want

applicantSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcNumberOfApplicants(this.r.jobAdId) // this.r.job_ad_id will give us the jobId of the document that we got in the above pre hook
})

const Applicant = mongoose.model('Applicant', applicantSchema)
module.exports = Applicant
