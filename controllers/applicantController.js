const Applicant = require('../models/applicant')
const catchAsync = require('../utils/catchAsync')
const appError = require('../utils/appError')

exports.createApplicant = catchAsync(async (req, res, next) => {
  const newApplicant = await Applicant.create({
    fullName: req.body.fullName,
    email: req.body.email,
    gender: req.body.gender,
    phone_number: req.body.phone_number,
    location: req.body.location,
    linkedin_profile: req.body.linkedin_profile,
    resume: req.body.resume,
    portfolio: req.body.portfolio,
    job_ad_id: req.body.job_ad_id,
  })

  res.status(201).json({
    status: 'success',
    data: {
      newApplicant,
    },
  })
})
