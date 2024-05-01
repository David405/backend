const JobAd = require('../models/job.Ad')
const catchAsync = require('./../utils/catchAsync')
const appError = require('./../utils/appError')

exports.getAllJobs = catchAsync(async (req, res, next) => {
  // 1a)FILTERING
  const queryObj = { ...req.query }
  const excludedFields = ['page', 'sort', 'limit', 'fields']
  excludedFields.forEach((el) => delete queryObj[el])

  // 1b)Advance filtering
  let queryStr = JSON.stringify(queryObj)
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
  let query = JobAd.find(JSON.parse(queryStr)) // converting queryStr back to object and store it in query variable

  // 2) SORTING
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ')
    query = query.sort(sortBy)
  } else {
    // query = query.sort("-createdAt");
  }

  // //2) FIELD LIMITING
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ')
    query = query.select(fields)
  } else {
    query = query.select('-__v')
  }

  // 4) PAGINNATION(determining the document based on the page)
  const page = req.query.page * 1 || 1
  const limit = req.query.limit * 1 || 100
  const skip = (page - 1) * limit

  // page=2 limit=10, 1-10page1, 11-20page2, 21-30page3
  query = query.skip(skip).limit(limit)

  if (req.query.page) {
    const numJob = await JobAd.countDocuments() // this will count the number of documents available
    if (skip >= numJob) throw new Error('page does not exist')
  }
  // executing the query
  const jobs = await query
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
    companyName: req.body.companyName,
    location: req.body.location,
    type: req.body.type,
    addType: req.body.addType,
    user: req.body.user,
    level: req.body.level,
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

  res.status(200).json({
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

exports.getJobByEmployer = catchAsync(async (req, res, next) => {
  const jobs = await JobAd.find({ user: req.params.employerId })
  res.status(200).json({
    status: 'success',
    count: jobs.length,
    data: {
      jobs,
    },
  })
})

//AGGREGATIN PIPELINE

exports.getTotalJobs = catchAsync(async (req, res, next) => {
  const jobs = await JobAd.aggregate([
    {
      $group: {
        _id: null,
        numberOfJobs: { $sum: 1 },
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
      jobs,
    },
  })
})

exports.getTotalJobsTypes = catchAsync(async (req, res, next) => {
  const types = await JobAd.aggregate([
    {
      $group: {
        _id: '$addType',
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
