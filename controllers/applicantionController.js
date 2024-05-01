const Applicantion = require('../models/applicantion')
const catchAsync = require('../utils/catchAsync')
const appError = require('../utils/appError')

exports.getAllApplicantions = catchAsync(async (req, res, next) => {
  let filter = {}
  if (req.params.jobId) filter = { job_ad_id: req.params.jobId }
  const applicantions = await Applicantion.find(filter)

  res.status(200).json({
    results: applicantions.length,
    status: 'success',
    data: {
      applicantions,
    },
  })
})

exports.createApplicantion = catchAsync(async (req, res, next) => {
  const newApplicantion = await Applicantion.create({
    gender: req.body.gender,
    user: req.body.user,
    location: req.body.location,
    linkedin_profile: req.body.linkedin_profile,
    resume: req.body.resume,
    portfolio: req.body.portfolio,
    jobAdId: req.body.jobAdId,
  })

  res.status(201).json({
    status: 'success',
    data: {
      newApplicantion,
    },
  })
})

exports.getApplicantion = catchAsync(async (req, res, next) => {
  const applicantion = await Applicantion.findById(req.params.id)
  if (!applicantion) {
    return next(new appError('No applicant found with this Id', 404))
  }
  res.status(200).json({
    status: 'success',
    data: {
      applicantion,
    },
  })
})

exports.updateApplicantion = catchAsync(async (req, res, next) => {
  const applicantion = await Applicantion.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  )
  if (!applicantion) {
    return next(new appError('No applicant found with this Id', 404))
  }

  res.status(204).json({
    status: 'success',
    data: {
      applicantion,
    },
  })
})

exports.deleteApplicantion = catchAsync(async (req, res, next) => {
  const applicantion = await Applicantion.findByIdAndDelete(req.params.id)
  if (!applicantion) {
    return next(new appError('No applicant found with this Id', 404))
  }
  res.status(200).json({
    status: 'success',
    data: null,
  })
})

exports.getTotalApplications = catchAsync(async (req, res, next) => {
  const applications = await Applicantion.aggregate([
    {
      $group: {
        _id: null,
        numberOfApplications: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ])
  res.status(200).json({
    status: 'success',
    data: {
      applications,
    },
  })
})

exports.getTotalApplicationStatus = catchAsync(async (req, res, next) => {
  const types = await Applicantion.aggregate([
    {
      $group: {
        _id: '$applicationStatus',
        numberOfJobs: { $sum: 1 },
      },
    },
  ])
  res.status(200).json({
    status: 'success',
    data: {
      types,
    },
  })
})
