const express = require('express')
const jobController = require('../controllers/jobController')

const applicantionRouter = require('./applicantion.routes')
const router = express.Router()

router.route('/total-jobs').get(jobController.getTotalJobs)
router.route('/total-jobTypes').get(jobController.getTotalJobsTypes)

router.use('/:jobId/applications', applicantionRouter)

router.route('/').post(jobController.createJob).get(jobController.getAllJobs)
router
  .route('/:id')
  .get(jobController.getJob)
  .patch(jobController.updateJob)
  .delete(jobController.deleteJob)

router.get('/get-employer-jobs/:employerId', jobController.getJobByEmployer)

module.exports = router
