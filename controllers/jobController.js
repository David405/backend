const JobAd = require('../models/job.Ad')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')

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
    results: newJob.length,
    data: {
      newJob,
    },
  })
})
