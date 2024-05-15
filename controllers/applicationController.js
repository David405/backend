const Application = require('../models/application')
const catchAsync = require('../utils/catchAsync')
const appError = require('../utils/appError')
// functions that will filter out fields tha we dont want to update
const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

exports.getAllApplications = catchAsync(async (req, res, next) => {
  let filter = {}
  if (req.params.jobId) filter = { jobAdId: req.params.jobId }
  const applications = await Application.find(filter)

  res.status(200).json({
    results: applications.length,
    status: 'success',
    data: {
      applications,
    },
  })
})

exports.createApplication = catchAsync(async (req, res, next) => {
  const newApplication = await Application.create({
    gender: req.body.gender,
    user: req.body.user,
    location: req.body.location,
    linkedinProfile: req.body.linkedinProfile,
    resume: req.body.resume,
    coverLatter: req.body.coverLatter,
    portfolio: req.body.portfolio,
    jobAdId: req.body.jobAdId,
  })

  res.status(201).json({
    status: 'success',
    data: {
      newApplication,
    },
  })
})

exports.getApplication = catchAsync(async (req, res, next) => {
  const application = await Application.findById(req.params.id)
  if (!application) {
    return next(new appError('No application found with this Id', 404))
  }
  res.status(200).json({
    status: 'success',
    data: {
      application,
    },
  })
})

exports.deleteApplication = catchAsync(async (req, res, next) => {
  const application = await Application.findByIdAndDelete(req.params.id)
  if (!application) {
    return next(new appError('No applicant found with this Id', 404))
  }
  res.status(200).json({
    status: 'success',
    data: null,
  })
})

exports.getTotalApplications = catchAsync(async (req, res, next) => {
  const applications = await Application.aggregate([
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
  const types = await Application.aggregate([
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

exports.updateApplication = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    'applicationStatus',
    'applicationStage',
  )

  const application = await Application.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    },
  )
  if (!application) {
    return next(new appError('No application found with this Id', 404))
  }
  res.status(200).json({
    status: 'success',
    data: {
      application,
    },
  })
})

exports.cancelApplication = catchAsync(async (req, res, next) => {
  const id = req.user.id
  const jobId = req.body.jobAdId
  // .log(id)
  // const application = await Application.find(
  //   (id) => id.toString() === jobId.toString(),
  // )
  // console.log(application)

  // const application = await Application.findOne(
  //   { user: id },
  //   { jobAdId: jobId },
  // )
  const application = await Application.findOne({
    $and: [{ user: id }, { jobAdId: jobId }],
  })
  console.log(application.id)

  const updatedAppplication = await Application.findByIdAndUpdate(
    application.id,
    {
      isCancelled: true,
    },
    { new: true, runValidators: true },
  )

  if (!application) {
    return next(new appError('No application found with this Id', 404))
  }
  // console.log(updatedAppplication)

  res.status(204).json({
    status: 'success',
    data: application,
  })
  // console.log(application)
})
