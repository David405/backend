const Application = require('../models/application')
const JobAd = require('../models/job.Ad')
const catchAsync = require('../utils/catchAsync')
const appError = require('../utils/appError')
const {
  readFileFromUrl,
  extractUserDataWithScore,
} = require('../helpers/analyzeUserData')
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
  const job = await JobAd.findById(req.body.jobAdId)

  if (!job) {
    return next(new appError('No job found with this Id', 400))
  }

  const keywords = job.keywords

    const userData = await readFileFromUrl(req.body.resume);
          if (!userData) {
            return next(new appError('Failed to read file from URL', 400))
          }

    const { experience, skills } = userData;
    const skillsScore = keywords.reduce((score, keyword) => score + (skills.toLowerCase().includes(keyword.toLowerCase()) ? 10 : 0), 0);
    const experienceScore = experience.length * 5;

    const currentYear = new Date().getFullYear();

    const totalYearsOfExperience = experience.reduce((total, exp) => {
      const [startMonthYear, endMonthYear] = exp.period.split(' - ');
      const [startMonth, startYear] = startMonthYear.split(' ');
      const startDate = new Date(startYear, getMonthIndex(startMonth));
      const endDate = endMonthYear.toLowerCase() === 'current' ? new Date(currentYear, 11) : new Date(endMonthYear.split(' ')[1], getMonthIndex(endMonthYear.split(' ')[0]));
      const millisecondsInYear = 1000 * 60 * 60 * 24 * 365;
      const yearsOfExperience = (endDate - startDate) / millisecondsInYear;
      return (Math.round(total + yearsOfExperience));
  }, 0);

    const roundedYearsOfExperience = Math.round(totalYearsOfExperience);

          // Helper function to get the index of a month
          function getMonthIndex(month) {
              return ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(month.toLowerCase());
          }

    console.log(skillsScore, experienceScore, totalYearsOfExperience)

    const totalScore = skillsScore + experienceScore + totalYearsOfExperience;

    const newApplication = await Application.create({
      gender: req.body.gender,
      user: req.body.user,
      location: req.body.location,
      linkedinProfile: req.body.linkedinProfile,
      resume: req.body.resume,
      coverLatter: req.body.coverLatter,
      portfolio: req.body.portfolio,
      jobAdId: req.body.jobAdId,
      score: totalScore
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
    return next(new appError('No application found with this Id', 400))
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
  const application = await Application.findOne({
    $and: [{ user: id }, { jobAdId: jobId }],
  })

  await Application.findByIdAndUpdate(
    application.id,
    {
      isCancelled: true,
    },
    { new: true, runValidators: true },
  )

  if (!application) {
    return next(new appError('No application found with this Id', 404))
  }

  res.status(204).json({
    status: 'success',
    data: null,
  })
})
