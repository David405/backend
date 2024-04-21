const Applicant = require('../models/applicant')
const catchAsync = require('../utils/catchAsync')
const appError = require('../utils/appError')

exports.getAllApplicants = catchAsync(async (req, res, next) => {
  // 1a)FILTERING
  const queryObj = { ...req.query }
  const excludedFields = ['page', 'sort', 'limit', 'fields']
  excludedFields.forEach((el) => delete queryObj[el])

  // 1b)Advance filtering
  let queryStr = JSON.stringify(queryObj)
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
  let query = Applicant.find(JSON.parse(queryStr)) // converting queryStr back to object and store it in query variable

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
    const numApplicant = await JobAd.countDocuments() // this will count the number of documents available
    if (skip >= numApplicant) throw new Error('page does not exist')
  }
  // executing the query
  const applicants = await query
  // sending response
  res.status(200).json({
    status: 'success',
    result: applicants.length,
    data: {
      applicants,
    },
  })
})

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

exports.getApplicant = catchAsync(async (req, res, next) => {
  const applicant = await Applicant.findById(req.params.id)
  if (!applicant) {
    return next(new appError('No applicant found with this Id', 404))
  }
  res.status(200).json({
    status: 'success',
    data: {
      applicant,
    },
  })
})

exports.updateApplicant = catchAsync(async (req, res, next) => {
  const applicant = await Applicant.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!applicant) {
    return next(new appError('No applicant found with this Id', 404))
  }

  res.status(204).json({
    status: 'success',
    data: {
      applicant,
    },
  })
})

exports.deleteApplicant = catchAsync(async (req, res, next) => {
  const applicant = await Applicant.findByIdAndDelete(req.params.id)
  if (!applicant) {
    return next(new appError('No applicant found with this Id', 404))
  }
  res.status(200).json({
    status: 'success',
    data: null,
  })
})
