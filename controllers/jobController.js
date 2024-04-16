const JobAd = require('../models/job.Ad')
const catchAsync = require('./../utils/catchAsync')
const appError = require('./../utils/appError')

exports.getAllJobs = catchAsync(async (req, res, next) => {
  const jobs = await JobAd.find()
  // sending response
  res.status(200).json({
    status: 'success',
    result: jobs.length,
    data: {
      jobs,
    },
  })
})
exports.createJob = catchAsync(async (req, res, next) => {
  const newJob = await JobAd.create({
    title: req.body.title,
    company: req.body.company,
    location: req.body.location,
    type: req.body.type,
    department: req.body.department,
    salary: req.body.salary,
    category: req.body.category,
    description: req.body.description,
    responsibility: req.body.responsibility,
    requirement: req.body.requirement,
  })

  res.status(201).json({
    status: 'success',
    data: {
      newJob,
    },
  })
})

exports.getJob = catchAsync(async (req, res, next) => {
  const job = await JobAd.findById(req.params.id)
  if (!job) {
    return next(new appError('No job found with this Id', 404))
  }
  res.status(200).json({
    status: 'success',
    data: {
      job,
    },
  })
})

exports.updateJob = catchAsync(async (req, res, next) => {
  const job = await JobAd.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!job) {
    return next(new appError('No job found with this Id', 404))
  }

  res.status(204).json({
    status: 'success',
    data: {
      job,
    },
  })
})

exports.deleteJob = catchAsync(async (req, res, next) => {
  const job = await JobAd.findByIdAndDelete(req.params.id)
  if (!job) {
    return next(new appError('No job found with this Id', 404))
  }
  res.status(200).json({
    status: 'success',
    data: null,
  })
})
